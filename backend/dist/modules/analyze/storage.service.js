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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
let StorageService = class StorageService {
    constructor() {
        // In-memory fallbacks
        this.memoryReports = [];
        this.memoryAnalyses = [];
        this.memoryFeedbacks = [];
        this.memoryStats = { totalReports: 0, reviewedReports: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        this.memoryVisits = [];
    }
    async onModuleInit() {
        const uri = process.env.MONGODB_URI;
        if (!uri)
            return;
        const { MongoClient } = await Promise.resolve().then(() => __importStar(require('mongodb')));
        this.client = new MongoClient(uri);
        await this.client.connect();
        const dbName = process.env.MONGODB_DB || 'safestnet';
        const db = this.client.db(dbName);
        this.reportsCol = db.collection('reports');
        this.analysesCol = db.collection('analyses');
        this.feedbacksCol = db.collection('feedbacks');
        this.statsCol = db.collection('stats');
        this.visitsCol = db.collection('visits');
        // TTL indexes for 14 days
        const ttlSeconds = 14 * 24 * 60 * 60;
        // Temporarily disable TTL for reports to debug
        // await this.reportsCol.createIndex({ createdAt: 1 }, { expireAfterSeconds: ttlSeconds }).catch(() => {});
        await this.analysesCol.createIndex({ createdAt: 1 }, { expireAfterSeconds: ttlSeconds }).catch(() => { });
        await this.feedbacksCol.createIndex({ createdAt: 1 }, { expireAfterSeconds: ttlSeconds }).catch(() => { });
        await this.visitsCol.createIndex({ createdAt: 1 }, { expireAfterSeconds: ttlSeconds }).catch(() => { });
        // Secondary indexes for faster queries
        await this.reportsCol.createIndex({ createdAt: -1 }).catch(() => { });
        await this.reportsCol.createIndex({ id: 1 }, { unique: true }).catch(() => { });
        await this.reportsCol.createIndex({ analysisId: 1 }).catch(() => { });
        await this.reportsCol.createIndex({ ipHash: 1, createdAt: -1 }).catch(() => { });
        await this.analysesCol.createIndex({ id: 1 }, { unique: true }).catch(() => { });
        await this.feedbacksCol.createIndex({ verdict: 1, createdAt: -1 }).catch(() => { });
        await this.feedbacksCol.createIndex({ analysisId: 1 }).catch(() => { });
        // Load or create stats
        await this.loadOrCreateStats();
    }
    // Reports
    async saveReport(report) {
        if (this.reportsCol) {
            await this.reportsCol.insertOne(report);
            console.log('StorageService saveReport - Saved to DB:', report.id);
        }
        else {
            this.memoryReports.push(report);
            console.log('StorageService saveReport - Saved to memory:', report.id);
        }
    }
    async listReports() {
        if (this.reportsCol) {
            const items = await this.reportsCol.find({}).sort({ createdAt: -1 }).toArray();
            console.log('StorageService listReports - DB items:', items.length);
            return items;
        }
        console.log('StorageService listReports - Memory items:', this.memoryReports.length);
        return [...this.memoryReports].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    async deleteReportById(id) {
        if (this.reportsCol) {
            await this.reportsCol.deleteOne({ id });
        }
        else {
            this.memoryReports = this.memoryReports.filter(r => r.id !== id);
        }
    }
    async deleteAllReports() {
        if (this.reportsCol) {
            await this.reportsCol.deleteMany({});
        }
        else {
            this.memoryReports = [];
        }
    }
    async countRecentReportsByIp(ipHash, sinceIso) {
        if (!ipHash)
            return 0;
        if (this.reportsCol) {
            return this.reportsCol.countDocuments({ ipHash, createdAt: { $gte: sinceIso } });
        }
        return this.memoryReports.filter(r => r.ipHash === ipHash && r.createdAt >= sinceIso).length;
    }
    // Analyses
    async saveAnalysis(result) {
        if (this.analysesCol) {
            await this.analysesCol.updateOne({ id: result.id }, { $set: result }, { upsert: true });
        }
        else {
            const idx = this.memoryAnalyses.findIndex(a => a.id === result.id);
            if (idx >= 0)
                this.memoryAnalyses[idx] = result;
            else
                this.memoryAnalyses.push(result);
        }
    }
    async getAnalysisById(id) {
        if (this.analysesCol) {
            return await this.analysesCol.findOne({ id });
        }
        return this.memoryAnalyses.find(a => a.id === id) || null;
    }
    async getLatestAnalysis() {
        if (this.analysesCol) {
            return await this.analysesCol.findOne({}, { sort: { createdAt: -1 } });
        }
        return this.memoryAnalyses.length > 0
            ? this.memoryAnalyses.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
            : null;
    }
    // Feedbacks
    async saveFeedback(analysisId, verdict, ip) {
        const item = { analysisId, verdict, ip, createdAt: new Date().toISOString(), reviewed: false };
        if (this.feedbacksCol) {
            await this.feedbacksCol.insertOne(item);
        }
        else {
            this.memoryFeedbacks.push(item);
        }
    }
    async listFeedbacks() {
        if (this.feedbacksCol) {
            return await this.feedbacksCol.find({ reviewed: { $ne: true } }).sort({ createdAt: -1 }).toArray();
        }
        return [...this.memoryFeedbacks].filter(f => !f.reviewed).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    async markFeedbacksAsReviewed(analysisIds) {
        if (this.feedbacksCol) {
            await this.feedbacksCol.updateMany({ analysisId: { $in: analysisIds } }, { $set: { reviewed: true } });
        }
        else {
            this.memoryFeedbacks.forEach(f => {
                if (analysisIds.includes(f.analysisId)) {
                    f.reviewed = true;
                }
            });
        }
    }
    async countFeedbacksByAnalysisAndIp(analysisId, ip) {
        if (!ip)
            return 0;
        if (this.feedbacksCol) {
            return await this.feedbacksCol.countDocuments({ analysisId, ip });
        }
        return this.memoryFeedbacks.filter(f => f.analysisId === analysisId && f.ip === ip).length;
    }
    // Stats
    async loadOrCreateStats() {
        if (this.statsCol) {
            const stats = await this.statsCol.findOne({});
            if (stats) {
                this.memoryStats = stats;
            }
            else {
                await this.statsCol.insertOne(this.memoryStats);
            }
        }
    }
    async getStats() {
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
    getRangeIso(daysBack) {
        const now = new Date();
        const start = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
        return { startIso: start.toISOString(), endIso: now.toISOString() };
    }
    async countAnalysesBetween(startIso, endIso) {
        if (this.analysesCol) {
            return this.analysesCol.countDocuments({ createdAt: { $gte: startIso, $lt: endIso } });
        }
        return this.memoryAnalyses.filter(a => a.createdAt >= startIso && a.createdAt < endIso).length;
    }
    // Visits tracking
    async saveVisit(v) {
        if (this.visitsCol) {
            await this.visitsCol.insertOne(v);
        }
        else {
            this.memoryVisits.push(v);
        }
    }
    async countVisitsBetween(startIso, endIso) {
        if (this.visitsCol) {
            return this.visitsCol.countDocuments({ createdAt: { $gte: startIso, $lt: endIso } });
        }
        return this.memoryVisits.filter(v => v.createdAt >= startIso && v.createdAt < endIso).length;
    }
    async countUniqueVisitorsBetween(startIso, endIso) {
        if (this.visitsCol) {
            const uniques = await this.visitsCol.distinct('ipHash', { createdAt: { $gte: startIso, $lt: endIso } });
            return uniques.length;
        }
        const set = new Set(this.memoryVisits.filter(v => v.createdAt >= startIso && v.createdAt < endIso).map(v => v.ipHash));
        return set.size;
    }
    async countFeedbacksBetween(startIso, endIso) {
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
        const build = async (range) => {
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
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = __decorate([
    (0, common_1.Injectable)()
], StorageService);
