"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyzeModule = void 0;
const common_1 = require("@nestjs/common");
const analyze_controller_1 = require("./analyze.controller");
const analyze_service_1 = require("./analyze.service");
const signals_service_1 = require("./signals.service");
const scoring_service_1 = require("./scoring.service");
const openai_service_1 = require("./openai.service");
const multimodal_analyzer_service_1 = require("./multimodal-analyzer.service");
const reports_controller_1 = require("./reports.controller");
const storage_service_1 = require("./storage.service");
let AnalyzeModule = class AnalyzeModule {
};
exports.AnalyzeModule = AnalyzeModule;
exports.AnalyzeModule = AnalyzeModule = __decorate([
    (0, common_1.Module)({
        controllers: [analyze_controller_1.AnalyzeController, reports_controller_1.ReportsController],
        providers: [analyze_service_1.AnalyzeService, signals_service_1.SignalsService, scoring_service_1.ScoringService, openai_service_1.OpenAiService, multimodal_analyzer_service_1.MultimodalAnalyzerService, storage_service_1.StorageService],
        exports: [analyze_service_1.AnalyzeService]
    })
], AnalyzeModule);
