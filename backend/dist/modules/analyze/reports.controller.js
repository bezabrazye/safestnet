"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const storage_service_1 = require("./storage.service");
const auth_util_1 = require("./auth.util");
const ReportsStore = [];
function isAdmin(headers) {
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
        const payload = (0, auth_util_1.verifyAdminToken)(token, secret);
        return !!payload && payload.sub === (process.env.ADMIN_USER || 'ya_admin');
    }
    return false;
}
function pruneOld(items) {
    const now = Date.now();
    const limitMs = 14 * 24 * 60 * 60 * 1000; // 14 days
    for (let i = items.length - 1; i >= 0; i--) {
        const ts = new Date(items[i].createdAt).getTime();
        if (now - ts > limitMs) {
            items.splice(i, 1);
        }
    }
}
let ReportsController = class ReportsController {
    constructor(storage) {
        this.storage = storage;
    }
    async createReport(body) {
        const item = {
            id: (0, crypto_1.randomUUID)(),
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
            }
            catch (error) {
                console.error('Error getting latest analysis:', error);
            }
        }
        // Hash IP for anti-spam/limits
        let ipHash;
        try {
            const ipRaw = String(body?.ip || '').trim();
            if (ipRaw) {
                const { createHash } = await Promise.resolve().then(() => __importStar(require('crypto')));
                ipHash = createHash('sha256').update(ipRaw).digest('hex');
            }
        }
        catch { }
        ReportsStore.push({ ...item, analysisId, analysisLink });
        pruneOld(ReportsStore);
        this.storage.saveReport({ ...item, analysisId, analysisLink, ipHash }).catch(() => { });
        await this.storage.incrementTotalReports();
        return { ok: true, id: item.id };
    }
    login(body) {
        const user = String(body?.username || '');
        const pass = String(body?.password || '');
        const envUser = process.env.ADMIN_USER || 'ya_admin';
        const envPass = process.env.ADMIN_PASS || 'Pass666Paroly@@@';
        if (user !== envUser || pass !== envPass)
            throw new common_1.UnauthorizedException();
        const secret = process.env.ADMIN_JWT_SECRET || 'dev_secret_change_me';
        const now = Math.floor(Date.now() / 1000);
        const token = (0, auth_util_1.signAdminToken)({ sub: envUser, iat: now, exp: now + 60 * 60 * 8 }, secret);
        return { token };
    }
    async listReports(headers) {
        if (!isAdmin(headers)) {
            throw new common_1.UnauthorizedException();
        }
        pruneOld(ReportsStore);
        // merge in-memory + db with de-duplication by id (prefer DB copy)
        const dbItems = await this.storage.listReports();
        const mem = ReportsStore.slice().reverse();
        const byId = new Map();
        for (const r of mem) {
            byId.set(r.id, r);
        }
        for (const r of dbItems) {
            byId.set(r.id, r); // overwrite memory with DB version
        }
        const items = Array.from(byId.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
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
    async deleteReport(headers, id) {
        if (!isAdmin(headers))
            throw new common_1.UnauthorizedException();
        // memory
        const idx = ReportsStore.findIndex(r => r.id === id);
        if (idx >= 0)
            ReportsStore.splice(idx, 1);
        // db
        await this.storage.deleteReportById(id);
        await this.storage.incrementReviewedReports();
        return { ok: true };
    }
    async deleteAll(headers) {
        if (!isAdmin(headers))
            throw new common_1.UnauthorizedException();
        ReportsStore.splice(0, ReportsStore.length);
        await this.storage.deleteAllReports();
        return { ok: true };
    }
    async listFeedbacks(headers) {
        if (!isAdmin(headers))
            throw new common_1.UnauthorizedException();
        const items = await this.storage.listFeedbacks();
        return { items };
    }
    health() {
        return { ok: true, ts: new Date().toISOString() };
    }
    async markFeedbacksAsReviewed(headers, body) {
        if (!isAdmin(headers))
            throw new common_1.UnauthorizedException();
        const analysisIds = Array.isArray(body?.analysisIds) ? body.analysisIds : [];
        console.log('Marking feedbacks as reviewed:', analysisIds);
        await this.storage.markFeedbacksAsReviewed(analysisIds);
        return { ok: true };
    }
    async getStatistics(headers) {
        if (!isAdmin(headers))
            throw new common_1.UnauthorizedException();
        const stats = await this.storage.getAggregatedStatistics();
        return { stats };
    }
    async trackVisit(headers, body) {
        try {
            const ipRaw = String(headers['x-forwarded-for'] || headers['x-real-ip'] || headers['cf-connecting-ip'] || headers['remote-addr'] || '').split(',')[0].trim();
            const uaRaw = String(headers['user-agent'] || '');
            const path = typeof body?.path === 'string' ? body.path : undefined;
            const referer = String(headers['referer'] || headers['referrer'] || body?.referer || '');
            // Minimal hashing to avoid storing PII directly
            const { createHash } = await Promise.resolve().then(() => __importStar(require('crypto')));
            const ipHash = createHash('sha256').update(ipRaw).digest('hex');
            const uaHash = uaRaw ? createHash('sha256').update(uaRaw).digest('hex') : undefined;
            await this.storage.saveVisit({ ipHash, uaHash, path, referer, createdAt: new Date().toISOString() });
            return { ok: true };
        }
        catch (e) {
            return { ok: false };
        }
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Post)('reports'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "createReport", null);
__decorate([
    (0, common_1.Post)('admin/login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('admin/reports'),
    __param(0, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "listReports", null);
__decorate([
    (0, common_1.Delete)('admin/reports/:id'),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "deleteReport", null);
__decorate([
    (0, common_1.Delete)('admin/reports'),
    __param(0, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "deleteAll", null);
__decorate([
    (0, common_1.Get)('admin/feedbacks'),
    __param(0, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "listFeedbacks", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "health", null);
__decorate([
    (0, common_1.Post)('admin/feedbacks/review'),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "markFeedbacksAsReviewed", null);
__decorate([
    (0, common_1.Get)('admin/statistics'),
    __param(0, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Post)('public/visit'),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "trackVisit", null);
exports.ReportsController = ReportsController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [storage_service_1.StorageService])
], ReportsController);
