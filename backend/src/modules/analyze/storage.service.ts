import { Injectable, OnModuleInit } from '@nestjs/common';
import type { Collection, MongoClient, WithId } from 'mongodb';

export interface StoredReport {
  _id?: any;
  id: string;
  name: string;
  email: string;
  message: string;
  imageBase64?: string;
  analysisId?: string;
  analysisLink?: string;
  ipHash?: string;
  createdAt: string; // ISO
}

export interface StoredStats {
  _id?: any;
  totalReports: number;
  reviewedReports: number;
  createdAt: string;
  updatedAt: string;
}

export interface StoredAnalysis extends Record<string, any> {
  id: string;
  createdAt: string;
}

export interface StoredFeedback {
  _id?: any;
  analysisId: string;
  verdict: 'correct' | 'incorrect';
  ip?: string;
  createdAt: string;
  reviewed?: boolean;
}

export interface StoredVisit {
  _id?: any;
  ipHash: string;
  uaHash?: string;
  path?: string;
  referer?: string;
  createdAt: string;
}

@Injectable()
export class StorageService implements OnModuleInit {
  private client?: MongoClient;
  private reportsCol?: Collection<StoredReport>;
  private analysesCol?: Collection<StoredAnalysis>;
  private feedbacksCol?: Collection<StoredFeedback>;
  private statsCol?: Collection<StoredStats>;
  private visitsCol?: Collection<StoredVisit>;

  // In-memory fallbacks
  private memoryReports: StoredReport[] = [];
  private memoryAnalyses: StoredAnalysis[] = [];
  private memoryFeedbacks: StoredFeedback[] = [];
  private memoryStats: StoredStats = { totalReports: 0, reviewedReports: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  private memoryVisits: StoredVisit[] = [];

  async onModuleInit() {
    const uri = process.env.MONGODB_URI;
    if (!uri) return;
    const { MongoClient } = await import('mongodb');
    // Не блокировать старт приложения ожиданием соединения с БД
    this.client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 } as any);
    this.client.connect()
      .then(async () => {
        const dbName = process.env.MONGODB_DB || 'safestnet';
        const db = this.client!.db(dbName);
        this.reportsCol = db.collection<StoredReport>('reports');
        this.analysesCol = db.collection<StoredAnalysis>('analyses');
        this.feedbacksCol = db.collection<StoredFeedback>('feedbacks');
        this.statsCol = db.collection<StoredStats>('stats');
        this.visitsCol = db.collection<StoredVisit>('visits');

        const ttlSeconds = 14 * 24 * 60 * 60;
        await this.analysesCol!.createIndex({ createdAt: 1 }, { expireAfterSeconds: ttlSeconds }).catch(() => {});
        await this.feedbacksCol!.createIndex({ createdAt: 1 }, { expireAfterSeconds: ttlSeconds }).catch(() => {});
        await this.visitsCol!.createIndex({ createdAt: 1 }, { expireAfterSeconds: ttlSeconds }).catch(() => {});
        await this.reportsCol!.createIndex({ createdAt: -1 }).catch(()=>{});
        await this.reportsCol!.createIndex({ id: 1 }, { unique: true }).catch(()=>{});
        await this.reportsCol!.createIndex({ analysisId: 1 }).catch(()=>{});
        await this.reportsCol!.createIndex({ ipHash: 1, createdAt: -1 }).catch(()=>{});
        await this.analysesCol!.createIndex({ id: 1 }, { unique: true }).catch(()=>{});
        await this.feedbacksCol!.createIndex({ verdict: 1, createdAt: -1 }).catch(()=>{});
        await this.feedbacksCol!.createIndex({ analysisId: 1 }).catch(()=>{});
        await this.loadOrCreateStats();
        console.log('StorageService: MongoDB connected');
      })
      .catch((err: any) => {
        console.error('StorageService: Mongo connect failed', err?.message || err);
      });
  }

  // Reports
  async saveReport(report: StoredReport) {
    if (this.reportsCol) {
      await this.reportsCol.insertOne(report);
      console.log('StorageService saveReport - Saved to DB:', report.id);
    } else {
      this.memoryReports.push(report);
      console.log('StorageService saveReport - Saved to memory:', report.id);
    }
  }

  async listReports(): Promise<StoredReport[]> {
    if (this.reportsCol) {
      const items = await this.reportsCol.find({}).sort({ createdAt: -1 }).toArray();
      console.log('StorageService listReports - DB items:', items.length);
      return items;
    }
    console.log('StorageService listReports - Memory items:', this.memoryReports.length);
    return [...this.memoryReports].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async deleteReportById(id: string) {
    if (this.reportsCol) {
      await this.reportsCol.deleteOne({ id });
    } else {
      this.memoryReports = this.memoryReports.filter(r => r.id !== id);
    }
  }

  async deleteAllReports() {
    if (this.reportsCol) {
      await this.reportsCol.deleteMany({});
    } else {
      this.memoryReports = [];
    }
  }

  async countRecentReportsByIp(ipHash: string, sinceIso: string): Promise<number> {
    if (!ipHash) return 0;
    if (this.reportsCol) {
      return this.reportsCol.countDocuments({ ipHash, createdAt: { $gte: sinceIso } });
    }
    return this.memoryReports.filter(r => r.ipHash === ipHash && r.createdAt >= sinceIso).length;
  }

  // Analyses
  async saveAnalysis(result: StoredAnalysis) {
    if (this.analysesCol) {
      await this.analysesCol.updateOne({ id: result.id }, { $set: result }, { upsert: true });
    } else {
      const idx = this.memoryAnalyses.findIndex(a => a.id === result.id);
      if (idx >= 0) this.memoryAnalyses[idx] = result; else this.memoryAnalyses.push(result);
    }
  }

  async getAnalysisById(id: string): Promise<StoredAnalysis | null> {
    if (this.analysesCol) {
      return await this.analysesCol.findOne({ id });
    }
    return this.memoryAnalyses.find(a => a.id === id) || null;
  }

  async getLatestAnalysis(): Promise<StoredAnalysis | null> {
    if (this.analysesCol) {
      return await this.analysesCol.findOne({}, { sort: { createdAt: -1 } });
    }
    return this.memoryAnalyses.length > 0 
      ? this.memoryAnalyses.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] 
      : null;
  }

  // Feedbacks
  async saveFeedback(analysisId: string, verdict: 'correct' | 'incorrect', ip?: string) {
    const item: StoredFeedback = { analysisId, verdict, ip, createdAt: new Date().toISOString(), reviewed: false };
    if (this.feedbacksCol) {
      await this.feedbacksCol.insertOne(item);
    } else {
      this.memoryFeedbacks.push(item);
    }
  }

  async listFeedbacks(): Promise<StoredFeedback[]> {
    if (this.feedbacksCol) {
      return await this.feedbacksCol.find({ reviewed: { $ne: true } }).sort({ createdAt: -1 }).toArray();
    }
    return [...this.memoryFeedbacks].filter(f => !f.reviewed).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async markFeedbacksAsReviewed(analysisIds: string[]) {
    if (this.feedbacksCol) {
      await this.feedbacksCol.updateMany(
        { analysisId: { $in: analysisIds } },
        { $set: { reviewed: true } }
      );
    } else {
      this.memoryFeedbacks.forEach(f => {
        if (analysisIds.includes(f.analysisId)) {
          f.reviewed = true;
        }
      });
    }
  }

  async countFeedbacksByAnalysisAndIp(analysisId: string, ip: string): Promise<number> {
    if (!ip) return 0;
    if (this.feedbacksCol) {
      return await this.feedbacksCol.countDocuments({ analysisId, ip });
    }
    return this.memoryFeedbacks.filter(f => f.analysisId === analysisId && f.ip === ip).length;
  }

  // Stats
  private async loadOrCreateStats() {
    if (this.statsCol) {
      const stats = await this.statsCol.findOne({});
      if (stats) {
        this.memoryStats = stats;
      } else {
        await this.statsCol.insertOne(this.memoryStats);
      }
    }
  }

  async getStats(): Promise<StoredStats> {
    if (this.statsCol) {
      const stats = await this.statsCol.findOne({});
      if (stats) {
        this.memoryStats = stats;
      }
    }
    return this.memoryStats;
  }

  async incrementTotalReports() {
    this.memoryStats.totalReports++;
    this.memoryStats.updatedAt = new Date().toISOString();
    if (this.statsCol) {
      await this.statsCol.updateOne({}, { $set: this.memoryStats }, { upsert: true });
    }
  }

  async incrementReviewedReports() {
    this.memoryStats.reviewedReports++;
    this.memoryStats.updatedAt = new Date().toISOString();
    if (this.statsCol) {
      await this.statsCol.updateOne({}, { $set: this.memoryStats }, { upsert: true });
    }
  }

  // Statistics aggregation helpers
  private getRangeIso(daysBack: number) {
    const now = new Date();
    const start = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    return { startIso: start.toISOString(), endIso: now.toISOString() };
  }

  private async countAnalysesBetween(startIso: string, endIso: string): Promise<number> {
    if (this.analysesCol) {
      return this.analysesCol.countDocuments({ createdAt: { $gte: startIso, $lt: endIso } });
    }
    return this.memoryAnalyses.filter(a => a.createdAt >= startIso && a.createdAt < endIso).length;
  }

  // Visits tracking
  async saveVisit(v: Omit<StoredVisit, '_id'>) {
    if (this.visitsCol) {
      await this.visitsCol.insertOne(v);
    } else {
      this.memoryVisits.push(v as StoredVisit);
    }
  }

  private async countVisitsBetween(startIso: string, endIso: string): Promise<number> {
    if (this.visitsCol) {
      return this.visitsCol.countDocuments({ createdAt: { $gte: startIso, $lt: endIso } });
    }
    return this.memoryVisits.filter(v => v.createdAt >= startIso && v.createdAt < endIso).length;
  }

  private async countUniqueVisitorsBetween(startIso: string, endIso: string): Promise<number> {
    if (this.visitsCol) {
      const uniques = await this.visitsCol.distinct('ipHash', { createdAt: { $gte: startIso, $lt: endIso } });
      return uniques.length;
    }
    const set = new Set(this.memoryVisits.filter(v => v.createdAt >= startIso && v.createdAt < endIso).map(v => v.ipHash));
    return set.size;
  }

  private async countFeedbacksBetween(startIso: string, endIso: string): Promise<{ positive: number; negative: number; }> {
    if (this.feedbacksCol) {
      const [pos, neg] = await Promise.all([
        this.feedbacksCol.countDocuments({ createdAt: { $gte: startIso, $lt: endIso }, verdict: 'correct' }),
        this.feedbacksCol.countDocuments({ createdAt: { $gte: startIso, $lt: endIso }, verdict: 'incorrect' })
      ]);
      return { positive: pos, negative: neg };
    }
    const slice = this.memoryFeedbacks.filter(f => f.createdAt >= startIso && f.createdAt < endIso);
    return {
      positive: slice.filter(f => f.verdict === 'correct').length,
      negative: slice.filter(f => f.verdict === 'incorrect').length
    };
  }

  async getAggregatedStatistics() {
    const dailyRange = this.getRangeIso(1);
    const weeklyRange = this.getRangeIso(7);
    const monthlyRange = this.getRangeIso(30);

    const build = async (range: { startIso: string; endIso: string; }) => {
      const [scansConducted, totalVisits, uniqueVisits, fb] = await Promise.all([
        this.countAnalysesBetween(range.startIso, range.endIso),
        this.countVisitsBetween(range.startIso, range.endIso),
        this.countUniqueVisitorsBetween(range.startIso, range.endIso),
        this.countFeedbacksBetween(range.startIso, range.endIso)
      ]);
      return {
        totalVisits,
        uniqueVisits,
        scansConducted,
        positiveFeedback: fb.positive,
        negativeFeedback: fb.negative
      };
    };

    return {
      daily: await build(dailyRange),
      weekly: await build(weeklyRange),
      monthly: await build(monthlyRange)
    };
  }
}


