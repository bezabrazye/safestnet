import { Module } from '@nestjs/common';
import { AnalyzeController } from './analyze.controller';
import { AnalyzeService } from './analyze.service';
import { SignalsService } from './signals.service';
import { ScoringService } from './scoring.service';
import { OpenAiService } from './openai.service';
import { MultimodalAnalyzerService } from './multimodal-analyzer.service';
import { ReportsController } from './reports.controller';
import { StorageService } from './storage.service';

@Module({
  controllers: [AnalyzeController, ReportsController],
  providers: [AnalyzeService, SignalsService, ScoringService, OpenAiService, MultimodalAnalyzerService, StorageService],
  exports: [AnalyzeService]
})
export class AnalyzeModule {}
