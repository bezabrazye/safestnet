import { Body, Controller, Delete, Get, Headers, Param, Post, UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { StorageService } from './storage.service';
import { signAdminToken, verifyAdminToken } from './auth.util';

interface ReportItem {
  id: string;
  name: string;
  email: string;
  message: string;
  imageBase64?: string;
  analysisId?: string;
  analysisLink?: string;
  createdAt: string;
}

const ReportsStore: ReportItem[] = [];

function isAdmin(headers: Record<string, any>): boolean {
  const user = String(headers['x-admin-user'] ?? headers['X-Admin-User'] ?? '').trim();
  const pass = String(headers['x-admin-pass'] ?? headers['X-Admin-Pass'] ?? '').trim();
  if (user && pass) {
    const envUser = process.env.ADMIN_USER || 'ya_admin';
    const envPass = process.env.ADMIN_PASS || 'Pass666Paroly@@@';
    return user === envUser && pass === envPass;
  }
  const bearer = String(headers['authorization'] ?? headers['Authorization'] ?? '');
  if (bearer.startsWith('Bearer ')) {
    const token = bearer.slice(7);
    const secret = process.env.ADMIN_JWT_SECRET || 'dev_secret_change_me';
    const payload = verifyAdminToken(token, secret);
    return !!payload && payload.sub === (process.env.ADMIN_USER || 'ya_admin');
  }
  return false;
}

function pruneOld(items: ReportItem[]) {
  const now = Date.now();
  const limitMs = 14 * 24 * 60 * 60 * 1000; // 14 days
  for (let i = items.length - 1; i >= 0; i--) {
    const ts = new Date(items[i].createdAt).getTime();
    if (now - ts > limitMs) {
      items.splice(i, 1);
    }
  }
}

@Controller()
export class ReportsController {
  constructor(private storage: StorageService) {}
  @Post('reports')
  async createReport(@Body() body: any) {
    const item: ReportItem = {
      id: randomUUID(),
      name: String(body?.name || ''),
      email: String(body?.email || ''),
      message: String(body?.message || ''),
      imageBase64: typeof body?.imageBase64 === 'string' ? body.imageBase64 : undefined,
      createdAt: new Date().toISOString(),
    };
    
    let analysisId = typeof body?.analysisId === 'string' ? body.analysisId : undefined;
    let analysisLink = typeof body?.analysisLink === 'string' ? body.analysisLink : undefined;
    
    // Если analysisId не указан, пытаемся найти последний анализ
    if (!analysisId) {
      try {
        const latestAnalysis = await this.storage.getLatestAnalysis();
        if (latestAnalysis) {
          analysisId = latestAnalysis.id;
          analysisLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/result/${encodeURIComponent(latestAnalysis.id)}`;
        }
      } catch (error) {
        console.error('Error getting latest analysis:', error);
      }
    }
    
    // Hash IP for anti-spam/limits
    let ipHash: string | undefined;
    try {
      const ipRaw = String((body?.ip as string) || '').trim();
      if (ipRaw) {
        const { createHash } = await import('crypto');
        ipHash = createHash('sha256').update(ipRaw).digest('hex');
      }
    } catch {}

    ReportsStore.push({ ...item, analysisId, analysisLink });
    pruneOld(ReportsStore);
    this.storage.saveReport({ ...item, analysisId, analysisLink, ipHash }).catch(()=>{});
    await this.storage.incrementTotalReports();
    return { ok: true, id: item.id };
  }

  @Post('admin/login')
  login(@Body() body: any) {
    const user = String(body?.username || '');
    const pass = String(body?.password || '');
    const envUser = process.env.ADMIN_USER || 'ya_admin';
    const envPass = process.env.ADMIN_PASS || 'Pass666Paroly@@@';
    if (user !== envUser || pass !== envPass) throw new UnauthorizedException();
    const secret = process.env.ADMIN_JWT_SECRET || 'dev_secret_change_me';
    const now = Math.floor(Date.now() / 1000);
    const token = signAdminToken({ sub: envUser, iat: now, exp: now + 60 * 60 * 8 }, secret);
    return { token };
  }

  @Get('admin/reports')
  async listReports(@Headers() headers: Record<string, any>) {
    if (!isAdmin(headers)) {
      throw new UnauthorizedException();
    }
    pruneOld(ReportsStore);
    // merge in-memory + db with de-duplication by id (prefer DB copy)
    const dbItems = await this.storage.listReports();
    const mem = ReportsStore.slice().reverse();
    const byId = new Map<string, any>();
    for (const r of mem) {
      byId.set(r.id, r);
    }
    for (const r of dbItems) {
      byId.set(r.id, r); // overwrite memory with DB version
    }
    const items = Array.from(byId.values()).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
    
    console.log('Reports debug:', {
      memoryCount: mem.length,
      dbCount: dbItems.length,
      totalCount: items.length,
      latestReport: items[0] ? items[0].id : null
    });
    
    // Return only the latest report
    const latestReport = items[0] || null;
    const stats = await this.storage.getStats();
    
    return { 
      report: latestReport,
      stats: {
        totalReports: stats.totalReports,
        reviewedReports: stats.reviewedReports,
        remainingReports: items.length
      }
    };
  }

  @Delete('admin/reports/:id')
  async deleteReport(@Headers() headers: Record<string, any>, @Param('id') id: string) {
    if (!isAdmin(headers)) throw new UnauthorizedException();
    // memory
    const idx = ReportsStore.findIndex(r => r.id === id);
    if (idx >= 0) ReportsStore.splice(idx, 1);
    // db
    await this.storage.deleteReportById(id);
    await this.storage.incrementReviewedReports();
    return { ok: true };
  }

  @Delete('admin/reports')
  async deleteAll(@Headers() headers: Record<string, any>) {
    if (!isAdmin(headers)) throw new UnauthorizedException();
    ReportsStore.splice(0, ReportsStore.length);
    await this.storage.deleteAllReports();
    return { ok: true };
  }

  @Get('admin/feedbacks')
  async listFeedbacks(@Headers() headers: Record<string, any>) {
    if (!isAdmin(headers)) throw new UnauthorizedException();
    const items = await this.storage.listFeedbacks();
    return { items };
  }

  @Get('health')
  health() {
    return { ok: true, ts: new Date().toISOString() };
  }

  @Post('admin/feedbacks/review')
  async markFeedbacksAsReviewed(@Headers() headers: Record<string, any>, @Body() body: any) {
    if (!isAdmin(headers)) throw new UnauthorizedException();
    const analysisIds = Array.isArray(body?.analysisIds) ? body.analysisIds : [];
    console.log('Marking feedbacks as reviewed:', analysisIds);
    await this.storage.markFeedbacksAsReviewed(analysisIds);
    return { ok: true };
  }

  @Get('admin/statistics')
  async getStatistics(@Headers() headers: Record<string, any>) {
    if (!isAdmin(headers)) throw new UnauthorizedException();
    const stats = await this.storage.getAggregatedStatistics();
    return { stats };
  }

  @Post('public/visit')
  async trackVisit(@Headers() headers: Record<string, any>, @Body() body: any) {
    try {
      const ipRaw = String(headers['x-forwarded-for'] || headers['x-real-ip'] || headers['cf-connecting-ip'] || headers['remote-addr'] || '').split(',')[0].trim();
      const uaRaw = String(headers['user-agent'] || '');
      const path = typeof body?.path === 'string' ? body.path : undefined;
      const referer = String(headers['referer'] || headers['referrer'] || body?.referer || '');

      // Minimal hashing to avoid storing PII directly
      const { createHash } = await import('crypto');
      const ipHash = createHash('sha256').update(ipRaw).digest('hex');
      const uaHash = uaRaw ? createHash('sha256').update(uaRaw).digest('hex') : undefined;

      await this.storage.saveVisit({ ipHash, uaHash, path, referer, createdAt: new Date().toISOString() });
      return { ok: true };
    } catch (e) {
      return { ok: false };
    }
  }
}


