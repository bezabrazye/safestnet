import { Controller, Post, Get, Body, Param, HttpException, HttpStatus, Headers } from '@nestjs/common';
import { AnalyzeService } from './analyze.service';
import { AnalyzeUrlDto, AnalyzeUrlSchema } from './dto';
import { MultimodalAnalyzeDto, MultimodalAnalyzeSchema } from './multimodal.dto';
import { FactCheckDto, FactCheckSchema } from './fact-check.dto';
import { DataCheckDto, DataCheckSchema } from './data-check.dto';
import { FraudDetectorDto, FraudDetectorSchema } from './fraud-detector.dto';

@Controller('analyze')
export class AnalyzeController {
  constructor(private svc: AnalyzeService) {}

  @Post('url')
  async analyzeUrl(@Body() body: any, @Headers('x-locale') locale?: string) {
    try {
      const bodyWithLocale = { ...body, locale: locale || body.locale || 'en' };
      const dto = AnalyzeUrlSchema.parse(bodyWithLocale);
      const result = await this.svc.handleUrl(dto);
      return result;
    } catch (error: any) {
      if (error.name === 'ZodError') {
        throw new HttpException({
          error: 'Validation failed',
          details: error.errors
        }, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException({
        error: 'Analysis failed',
        message: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async getResult(@Param('id') id: string) {
    try {
      return await this.svc.getById(id);
    } catch (error: any) {
      throw new HttpException({
        error: 'Result not found',
        message: error.message
      }, HttpStatus.NOT_FOUND);
    }
  }

  @Post(':id/feedback')
  async saveFeedback(@Param('id') id: string, @Body() body: any, @Headers() headers: Record<string, any>) {
    try {
      const verdict = body?.verdict === 'correct' ? 'correct' : 'incorrect';
      const ip = String(headers['x-forwarded-for'] || headers['x-real-ip'] || headers['cf-connecting-ip'] || headers['remote-addr'] || '').split(',')[0].trim();
      return this.svc.saveFeedback(id, verdict, ip);
    } catch (error: any) {
      throw new HttpException({ error: 'Failed to save feedback', message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('stats/overview')
  async getStats() {
    try {
      return await this.svc.getStats();
    } catch (error: any) {
      throw new HttpException({
        error: 'Failed to get stats',
        message: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('multimodal')
  async analyzeMultimodal(@Body() body: any, @Headers('x-locale') locale?: string) {
    try {
      const bodyWithLocale = { ...body, locale: locale || body.locale || 'ru' };
      const validatedData = MultimodalAnalyzeSchema.parse(bodyWithLocale);
      const result = await this.svc.handleMultimodalAnalysis(validatedData);
      return result;
    } catch (error: any) {
      if (error.name === 'ZodError') {
        throw new HttpException({
          error: 'Validation failed',
          details: error.errors
        }, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException({
        error: 'Multimodal analysis failed',
        message: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('fact-check')
  async analyzeFactCheck(@Body() body: any, @Headers('x-locale') locale?: string) {
    try {
      const bodyWithLocale = { ...body, locale: locale || body.locale || 'en' };
      const validatedData = FactCheckSchema.parse(bodyWithLocale);
      const result = await this.svc.handleFactCheck(validatedData);
      return result;
    } catch (error: any) {
      if (error.name === 'ZodError') {
        throw new HttpException({
          error: 'Validation failed',
          details: error.errors
        }, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException({
        error: 'Fact check failed',
        message: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('data-check')
  async analyzeDataCheck(@Body() body: any, @Headers('x-locale') locale?: string) {
    try {
      const bodyWithLocale = { ...body, locale: locale || body.locale || 'en' };
      const validatedData = DataCheckSchema.parse(bodyWithLocale);
      const result = await this.svc.handleDataCheck(validatedData);
      return result;
    } catch (error: any) {
      if (error.name === 'ZodError') {
        throw new HttpException({
          error: 'Validation failed',
          details: error.errors
        }, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException({
        error: 'Data check failed',
        message: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('fraud-detector')
  async analyzeFraudDetector(@Body() body: any, @Headers('x-locale') locale?: string) {
    try {
      const bodyWithLocale = { ...body, locale: locale || body.locale || 'en' };
      const validatedData = FraudDetectorSchema.parse(bodyWithLocale);
      const result = await this.svc.handleFraudDetector(validatedData);
      return result;
    } catch (error: any) {
      if (error.name === 'ZodError') {
        throw new HttpException({
          error: 'Validation failed',
          details: error.errors
        }, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException({
        error: 'Fraud detection failed',
        message: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
