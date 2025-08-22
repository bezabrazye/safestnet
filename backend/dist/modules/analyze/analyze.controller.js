"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyzeController = void 0;
const common_1 = require("@nestjs/common");
const analyze_service_1 = require("./analyze.service");
const dto_1 = require("./dto");
const multimodal_dto_1 = require("./multimodal.dto");
const fact_check_dto_1 = require("./fact-check.dto");
const data_check_dto_1 = require("./data-check.dto");
const fraud_detector_dto_1 = require("./fraud-detector.dto");
let AnalyzeController = class AnalyzeController {
    constructor(svc) {
        this.svc = svc;
    }
    async analyzeUrl(body, locale) {
        try {
            const bodyWithLocale = { ...body, locale: locale || body.locale || 'en' };
            const dto = dto_1.AnalyzeUrlSchema.parse(bodyWithLocale);
            const result = await this.svc.handleUrl(dto);
            return result;
        }
        catch (error) {
            if (error.name === 'ZodError') {
                throw new common_1.HttpException({
                    error: 'Validation failed',
                    details: error.errors
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            throw new common_1.HttpException({
                error: 'Analysis failed',
                message: error.message
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getResult(id) {
        try {
            return await this.svc.getById(id);
        }
        catch (error) {
            throw new common_1.HttpException({
                error: 'Result not found',
                message: error.message
            }, common_1.HttpStatus.NOT_FOUND);
        }
    }
    async saveFeedback(id, body, headers) {
        try {
            const verdict = body?.verdict === 'correct' ? 'correct' : 'incorrect';
            const ip = String(headers['x-forwarded-for'] || headers['x-real-ip'] || headers['cf-connecting-ip'] || headers['remote-addr'] || '').split(',')[0].trim();
            return this.svc.saveFeedback(id, verdict, ip);
        }
        catch (error) {
            throw new common_1.HttpException({ error: 'Failed to save feedback', message: error.message }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getStats() {
        try {
            return await this.svc.getStats();
        }
        catch (error) {
            throw new common_1.HttpException({
                error: 'Failed to get stats',
                message: error.message
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async analyzeMultimodal(body, locale) {
        try {
            const bodyWithLocale = { ...body, locale: locale || body.locale || 'ru' };
            const validatedData = multimodal_dto_1.MultimodalAnalyzeSchema.parse(bodyWithLocale);
            const result = await this.svc.handleMultimodalAnalysis(validatedData);
            return result;
        }
        catch (error) {
            if (error.name === 'ZodError') {
                throw new common_1.HttpException({
                    error: 'Validation failed',
                    details: error.errors
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            throw new common_1.HttpException({
                error: 'Multimodal analysis failed',
                message: error.message
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async analyzeFactCheck(body, locale) {
        try {
            const bodyWithLocale = { ...body, locale: locale || body.locale || 'en' };
            const validatedData = fact_check_dto_1.FactCheckSchema.parse(bodyWithLocale);
            const result = await this.svc.handleFactCheck(validatedData);
            return result;
        }
        catch (error) {
            if (error.name === 'ZodError') {
                throw new common_1.HttpException({
                    error: 'Validation failed',
                    details: error.errors
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            throw new common_1.HttpException({
                error: 'Fact check failed',
                message: error.message
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async analyzeDataCheck(body, locale) {
        try {
            const bodyWithLocale = { ...body, locale: locale || body.locale || 'en' };
            const validatedData = data_check_dto_1.DataCheckSchema.parse(bodyWithLocale);
            const result = await this.svc.handleDataCheck(validatedData);
            return result;
        }
        catch (error) {
            if (error.name === 'ZodError') {
                throw new common_1.HttpException({
                    error: 'Validation failed',
                    details: error.errors
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            throw new common_1.HttpException({
                error: 'Data check failed',
                message: error.message
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async analyzeFraudDetector(body, locale) {
        try {
            const bodyWithLocale = { ...body, locale: locale || body.locale || 'en' };
            const validatedData = fraud_detector_dto_1.FraudDetectorSchema.parse(bodyWithLocale);
            const result = await this.svc.handleFraudDetector(validatedData);
            return result;
        }
        catch (error) {
            if (error.name === 'ZodError') {
                throw new common_1.HttpException({
                    error: 'Validation failed',
                    details: error.errors
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            throw new common_1.HttpException({
                error: 'Fraud detection failed',
                message: error.message
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.AnalyzeController = AnalyzeController;
__decorate([
    (0, common_1.Post)('url'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-locale')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AnalyzeController.prototype, "analyzeUrl", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnalyzeController.prototype, "getResult", null);
__decorate([
    (0, common_1.Post)(':id/feedback'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AnalyzeController.prototype, "saveFeedback", null);
__decorate([
    (0, common_1.Get)('stats/overview'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnalyzeController.prototype, "getStats", null);
__decorate([
    (0, common_1.Post)('multimodal'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-locale')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AnalyzeController.prototype, "analyzeMultimodal", null);
__decorate([
    (0, common_1.Post)('fact-check'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-locale')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AnalyzeController.prototype, "analyzeFactCheck", null);
__decorate([
    (0, common_1.Post)('data-check'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-locale')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AnalyzeController.prototype, "analyzeDataCheck", null);
__decorate([
    (0, common_1.Post)('fraud-detector'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-locale')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AnalyzeController.prototype, "analyzeFraudDetector", null);
exports.AnalyzeController = AnalyzeController = __decorate([
    (0, common_1.Controller)('analyze'),
    __metadata("design:paramtypes", [analyze_service_1.AnalyzeService])
], AnalyzeController);
