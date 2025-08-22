import { Module } from '@nestjs/common';
import { AnalyzeModule } from './modules/analyze/analyze.module';

@Module({
  imports: [AnalyzeModule],
})
export class AppModule {}
