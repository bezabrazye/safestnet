import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { SignalsService } from './signals.service';
import { ScoringService } from './scoring.service';
import { OpenAiService } from './openai.service';
import { MultimodalAnalyzerService } from './multimodal-analyzer.service';
import { AnalyzeUrlDto } from './dto';
import { StorageService } from './storage.service';
import { MultimodalAnalyzeDto } from './multimodal.dto';
import { FactCheckDto } from './fact-check.dto';
import { DataCheckDto } from './data-check.dto';
import { FraudDetectorDto } from './fraud-detector.dto';
import { I18nService, Language } from './i18n.service';

// In-memory store (в продакшене заменить на БД)
const InMemory = new Map<string, any>();

@Injectable()
export class AnalyzeService {
  private i18n = new I18nService();

  constructor(
    private signals: SignalsService,
    private scoring: ScoringService,
    private openai: OpenAiService,
    private multimodalAnalyzer: MultimodalAnalyzerService,
    private storage: StorageService
  ) {}

  async handleUrl(dto: AnalyzeUrlDto) {
    console.log(`🚀 Starting analysis for: ${dto.url}`);

    try {
      // Собираем сигналы безопасности
      const signals = await this.signals.collectForUrl(dto.url);
      
      // Получаем анализ от ChatGPT
      const aiAnalysis = await this.openai.analyzeUrlSecurity(dto.url, signals, dto.locale ?? 'en');

      // Генерируем факторы безопасности на основе сигналов
      const factors = this.generateSecurityFactors(signals, dto.locale ?? 'en', dto.url);

      // Формируем результат
      const result = {
        id: randomUUID(),
        scamRate: aiAnalysis.score,
        category: aiAnalysis.category,
        confidence: aiAnalysis.confidence,
        summary: aiAnalysis.summary,
        explanation: {
          factors: factors,
          sources: aiAnalysis.sources ?? [],
          timeline: [],
          recommendations: aiAnalysis.recommendations ?? [],
          riskFactors: aiAnalysis.riskFactors ?? [],
          explanation: aiAnalysis.explanation ?? '',
          detailedReports: aiAnalysis.detailedReports ?? []
        },
        url: dto.url,
        createdAt: new Date().toISOString(),
        signals: {
          page: signals.page ? {
            status: signals.page.status,
            sslValid: signals.page.sslValid,
            hasForms: signals.page.hasForms,
            wordsCount: signals.page.wordsCount,
            title: signals.page.title,
            suspiciousPatterns: signals.page.suspiciousPatterns
          } : null,
          gsb: signals.gsb,
          vt: signals.vt,
          whois: signals.whois,
          wayback: signals.wayback,
          dns: (signals as any).dns ?? null,
          errors: signals.errors
        }
      };

      // Сохраняем результат (в память и БД)
      InMemory.set(result.id, result);
      await this.storage.saveAnalysis({ ...result });

      console.log(`✅ Analysis completed for ${dto.url}:`, {
        id: result.id,
        score: result.scamRate,
        category: result.category,
        confidence: result.confidence,
        recommendations: aiAnalysis.recommendations?.length || 0
      });

      return result;
    } catch (error) {
      console.error('Analysis failed:', error);
      throw new Error('Failed to analyze URL');
    }
  }

  async getById(id: string) {
    let result = InMemory.get(id);
    if (!result) {
      const fromDb = await this.storage.getAnalysisById(id);
      if (!fromDb) {
        throw new Error('Analysis result not found');
      }
      result = fromDb as any;
      // warm up memory cache
      InMemory.set(id, result);
    }
    return result;
  }

  async saveFeedback(id: string, verdict: 'correct' | 'incorrect', ip?: string) {
    let result = InMemory.get(id);
    if (!result) {
      const fromDb = await this.storage.getAnalysisById(id);
      if (!fromDb) {
        throw new Error('Analysis result not found');
      }
      result = fromDb as any;
    }
    if (!Array.isArray((result as any).feedbacks)) {
      (result as any).feedbacks = [];
    }
    (result as any).feedbacks.push({ verdict, createdAt: new Date().toISOString() });
    InMemory.set(id, result);
    // Limit 3 per IP per analysis
    if (ip) {
      const count = await this.storage.countFeedbacksByAnalysisAndIp(id, ip);
      if (count >= 3) {
        return { ok: false, limit: true };
      }
    }
    await this.storage.saveFeedback(id, verdict, ip).catch(()=>{});
    return { ok: true, limit: false };
  }

  // Метод для получения статистики
  async getStats() {
    const results = Array.from(InMemory.values());
    const total = results.length;
    const avgScore = total > 0 ? results.reduce((sum, r) => sum + r.scamRate, 0) / total : 0;
    
    return {
      totalAnalyses: total,
      averageScore: Math.round(avgScore),
      recentAnalyses: results.slice(-10).map(r => ({
        id: r.id,
        url: r.url,
        score: r.scamRate,
        category: r.category,
        createdAt: r.createdAt
      }))
    };
  }

  async handleMultimodalAnalysis(dto: MultimodalAnalyzeDto) {
    console.log(`🚀 Starting multimodal analysis`);
    
    try {
      // Получаем анализ от мультимодального анализатора
      const analysis = await this.multimodalAnalyzer.analyzeSubmission({
        url: dto.url,
        text: dto.text,
        images: dto.images,
        videoFrames: dto.videoFrames,
        locale: dto.locale,
        comment: dto.comment
      });

      // Конвертируем статус в категорию
      const categoryMap = {
        'safe': 'Low',
        'suspicious': 'Medium', 
        'dangerous': 'High'
      };

      // Формируем результат
      const result = {
        id: randomUUID(),
        scamRate: analysis.risk_score,
        category: categoryMap[analysis.status as keyof typeof categoryMap] || 'Medium',
        confidence: Math.round(analysis.confidence * 100),
        summary: analysis.summary,
        explanation: {
          factors: analysis.reasons.map((r: any) => ({
            name: r.code,
            value: r.weight / 25, // Нормализуем вес
            weight: r.weight / 100, // Процент от общего веса
            evidence: r.evidence,
            description: r.code
          })),
          sources: [],
          timeline: [],
          recommendations: analysis.recommendations,
          riskFactors: analysis.reasons.map((r: any) => r.code),
          explanation: analysis.summary,
          ioc: analysis.ioc,
          imageFindings: analysis.image_findings,
          suggestedActions: analysis.suggested_actions,
          needMoreEvidence: analysis.need_more_evidence,
          missingArtifacts: analysis.missing_artifacts,
          inputSummary: analysis.input_summary
        },
        url: dto.url || 'Multimodal analysis',
        createdAt: new Date().toISOString(),
        signals: {
          page: null,
          gsb: null,
          vt: null,
          whois: null,
          wayback: null,
          errors: []
        },
        isMultimodal: true
      };

      // Сохраняем результат
      InMemory.set(result.id, result);

      console.log(`✅ Multimodal analysis completed:`, {
        id: result.id,
        score: result.scamRate,
        category: result.category,
        confidence: result.confidence,
        recommendations: analysis.recommendations?.length || 0
      });

      return result;
    } catch (error) {
      console.error('Multimodal analysis failed:', error);
      throw new Error('Failed to analyze multimodal content');
    }
  }

  private generateSecurityFactors(signals: any, locale: string, url?: string) {
    const factors = [];
    const t = this.i18n.getTranslations(locale as Language);

    // Domain Age
    if (signals.whois?.ageDays) {
      const age = signals.whois.ageDays;
      const value = age > 365 ? 0.1 : age > 30 ? 0.3 : 0.8;
      factors.push({
        name: 'domain_age',
        value: value,
        weightPct: 12,
        evidence: `${age} ${t.days}`,
        description: `${t.domainAge}: ${age} ${t.days}. ${t.domainAgeDescription}`
      });
    }

    // SSL Certificate
    if (signals.page?.sslValid !== undefined) {
      const value = signals.page.sslValid ? 0.1 : 0.9;
      factors.push({
        name: 'ssl_valid',
        value: value,
        weightPct: 15,
        evidence: signals.page.sslValid ? t.sslValid : t.sslInvalid,
        description: `SSL: ${signals.page.sslValid ? t.sslValidStatus : t.sslInvalidStatus}. ${t.sslDescription}`
      });
    }

    // Google Safe Browsing
    if (signals.gsb) {
      const value = signals.gsb.malicious ? 0.9 : 0.1;
      factors.push({
        name: 'gsb',
        value: value,
        weightPct: 15,
        evidence: signals.gsb.malicious ? t.gsbThreat : t.gsbClean,
        description: `${t.gsb}: ${signals.gsb.malicious ? t.gsbThreatStatus : t.gsbCleanStatus}.`
      });
    }

    // VirusTotal
    if (signals.vt) {
      const positives = signals.vt.positives || 0;
      const total = signals.vt.total || 1;
      const value = positives > 0 ? Math.min(0.9, positives / total) : 0.1;
      factors.push({
        name: 'virustotal',
        value: value,
        weightPct: 17,
        evidence: `${positives}/${total} ${t.engines}`,
        description: `${t.vt}: ${positives} из ${total} ${t.engines} отметили угрозу.`
      });
    }

    // Forms Presence
    if (signals.page?.hasForms !== undefined) {
      const value = signals.page.hasForms ? 0.3 : 0.1;
      factors.push({
        name: 'forms_present',
        value: value,
        weightPct: 10,
        evidence: signals.page.hasForms ? t.formsFound : t.formsNotFound,
        description: `${t.formsFound}: ${signals.page.hasForms ? t.formsFoundStatus : t.formsNotFoundStatus}.`
      });
    }

    // Content Quality
    if (signals.page?.wordsCount !== undefined) {
      const words = signals.page.wordsCount;
      const value = words > 100 ? 0.1 : words > 10 ? 0.5 : 0.8;
      factors.push({
        name: 'content_quality',
        value: value,
        weightPct: 8,
        evidence: `${words} ${t.words}`,
        description: `${t.contentWords}: на странице ~${words} ${t.words} текста.`
      });
    }

    // Suspicious Patterns
    if (signals.page?.suspiciousPatterns !== undefined) {
      const patterns = signals.page.suspiciousPatterns;
      const keywords = Array.isArray((signals.page as any).suspiciousKeywords) ? (signals.page as any).suspiciousKeywords : [];
      const value = patterns > 0 ? Math.min(0.9, patterns * 0.3) : 0.1;
      factors.push({
        name: 'suspicious_patterns',
        value: value,
        weightPct: 5,
        evidence: patterns > 0 ? `${t.patternsFound}: ${keywords.join(', ')}` : t.patternsNotFound,
        description: `${t.patternsFound}: найдено совпадений — ${patterns}.`
      });
    }

    // Wayback Machine
    if (signals.wayback?.available !== undefined) {
      const value = signals.wayback.available ? 0.1 : 0.5;
      factors.push({
        name: 'wayback_history',
        value: value,
        weightPct: 3,
        evidence: signals.wayback.available ? t.waybackFound : t.waybackNotFound,
        description: `${t.waybackFound}: ${signals.wayback.available ? t.waybackFoundStatus : t.waybackNotFoundStatus}.`
      });
    }

    // DNS / SPF / DMARC
    if (signals.dns) {
      const hasSpf = signals.dns.spf ? t.spfPresent : t.spfMissing;
      const hasDmarc = signals.dns.dmarc ? t.dmarcPresent : t.dmarcMissing;
      const value = signals.dns.spf && signals.dns.dmarc ? 0.1 : signals.dns.spf || signals.dns.dmarc ? 0.3 : 0.6;
      factors.push({
        name: 'dns_email_auth',
        value,
        weightPct: 6,
        evidence: `${hasSpf}; ${hasDmarc}`,
        description: `${t.emailAuthDescription} (${hasSpf}, ${hasDmarc}). Проверено по DNS записям.`
      });
    }

    // Brand Impersonation Detection
    const domain = signals.whois?.domain || '';
    const brandImpersonationScore = this.detectBrandImpersonation(domain);
    if (brandImpersonationScore > 0) {
      factors.push({
        name: 'brand_impersonation',
        value: brandImpersonationScore,
        weightPct: 20,
        evidence: t.brandImpersonation,
        description: t.brandImpersonation
      });
    }

    // Suspicious Domain Patterns
    const suspiciousDomainScore = this.detectSuspiciousDomain(domain);
    if (suspiciousDomainScore > 0) {
      factors.push({
        name: 'suspicious_domain',
        value: suspiciousDomainScore,
        weightPct: 15,
        evidence: t.suspiciousDomain,
        description: t.suspiciousDomain
      });
    }

    // Excessive Tracking Parameters
    const trackingScore = url ? this.detectExcessiveTracking(url) : 0;
    if (trackingScore > 0) {
      const list = url ? this.listTrackingParams(url) : [];
      factors.push({
        name: 'tracking_params',
        value: trackingScore,
        weightPct: 10,
        evidence: list.length > 0 ? `${t.trackingParamsFound}: ${list.join(', ')}` : t.trackingParamsFound,
        description: t.trackingParams
      });
    }

    // Suspicious Registrar
    const registrar = signals.whois?.registrar || '';
    const suspiciousRegistrarScore = this.detectSuspiciousRegistrar(registrar);
    if (suspiciousRegistrarScore > 0) {
      factors.push({
        name: 'suspicious_registrar',
        value: suspiciousRegistrarScore,
        weightPct: 8,
        evidence: `${t.suspiciousRegistrar}: ${registrar}`,
        description: t.registrar
      });
    }

    return factors;
  }

  private detectBrandImpersonation(domain: string): number {
    const knownBrands = [
      'revolut', 'paypal', 'stripe', 'coinbase', 'binance', 'metamask', 'trustwallet',
      'microsoft', 'google', 'apple', 'amazon', 'netflix', 'spotify', 'discord',
      'telegram', 'whatsapp', 'instagram', 'facebook', 'twitter', 'linkedin',
      'github', 'gitlab', 'bitbucket', 'dropbox', 'onedrive', 'google-drive',
      'adobe', 'autodesk', 'salesforce', 'hubspot', 'mailchimp', 'stripe',
      'shopify', 'woocommerce', 'magento', 'prestashop', 'opencart'
    ];

    const domainLower = domain.toLowerCase();
    
    for (const brand of knownBrands) {
      if (domainLower.includes(brand) && domainLower !== brand + '.com') {
        // Проверяем на типичные паттерны подделки
        if (domainLower.includes(brand + '-') || 
            domainLower.includes('-' + brand) ||
            domainLower.includes(brand + 'ai') ||
            domainLower.includes(brand + 'secure') ||
            domainLower.includes(brand + 'official') ||
            domainLower.includes('my' + brand) ||
            domainLower.includes(brand + 'login') ||
            domainLower.includes(brand + 'verify')) {
          return 0.9; // Высокий риск подделки
        }
      }
    }
    
    return 0;
  }

  private detectSuspiciousDomain(domain: string): number {
    const domainLower = domain.toLowerCase();
    
    // Подозрительные TLD
    const suspiciousTLDs = ['.xyz', '.top', '.online', '.site', '.space', '.tech', '.digital'];
    for (const tld of suspiciousTLDs) {
      if (domainLower.endsWith(tld)) {
        return 0.7;
      }
    }
    
    // Подозрительные паттерны в домене
    const suspiciousPatterns = [
      /[0-9]{4,}/, // Много цифр
      /[a-z]{15,}/, // Очень длинные слова
      /[a-z]+[0-9]+[a-z]+/, // Чередование букв и цифр
      /secure|verify|login|official|my|account/i // Подозрительные слова
    ];
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(domainLower)) {
        return 0.5;
      }
    }
    
    return 0;
  }

  private detectExcessiveTracking(url: string): number {
    if (!url) return 0;
    
    const urlObj = new URL(url);
    const params = urlObj.searchParams;
    
    // Подсчитываем количество трекинг параметров
    const trackingParams = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'fbclid', 'gclid', 'msclkid', 'ref', 'source', 'campaign', 'adset',
      'pixel', 'ad_id', 'adset_id', 'campaign_id'
    ];
    
    let trackingCount = 0;
    for (const param of trackingParams) {
      if (params.has(param)) {
        trackingCount++;
      }
    }
    
    if (trackingCount >= 5) return 0.8; // Много трекинга
    if (trackingCount >= 3) return 0.5; // Средний трекинг
    if (trackingCount >= 1) return 0.3; // Немного трекинга
    
    return 0;
  }

  private listTrackingParams(url: string): string[] {
    try {
      const u = new URL(url);
      const params = u.searchParams;
      const known = [
        'utm_source','utm_medium','utm_campaign','utm_term','utm_content',
        'fbclid','gclid','msclkid','ref','source','campaign','adset',
        'pixel','ad_id','adset_id','campaign_id'
      ];
      const found: string[] = [];
      for (const k of known) if (params.has(k)) found.push(`${k}=${params.get(k)}`);
      // append any extra params if too many
      if (found.length < 1) {
        for (const [k,v] of params.entries()) { found.push(`${k}=${v}`); if (found.length>=5) break; }
      }
      return found;
    } catch { return []; }
  }

  private detectSuspiciousRegistrar(registrar: string): number {
    if (!registrar) return 0;
    
    const suspiciousRegistrars = [
      'demo', 'test', 'example', 'fake', 'suspicious', 'unknown',
      'private', 'anonymous', 'hidden', 'masked'
    ];
    
    const registrarLower = registrar.toLowerCase();
    
    for (const suspicious of suspiciousRegistrars) {
      if (registrarLower.includes(suspicious)) {
        return 0.8;
      }
    }
    
    return 0;
  }

  async handleFactCheck(dto: FactCheckDto) {
    console.log(`🚀 Starting fact check analysis`);

    try {
      const result = {
        id: randomUUID(),
        scamRate: 0, // Будет рассчитано ИИ
        category: 'Unknown',
        confidence: 0,
        summary: '',
        explanation: {
          factors: [],
          sources: [],
          recommendations: [],
          riskFactors: [],
          explanation: '',
          factCheck: {
            truthfulness: 0,
            sources: [],
            debunked: false,
            explanation: ''
          }
        },
        url: '',
        createdAt: new Date().toISOString(),
        isFactCheck: true,
        input: {
          text: dto.text,
          image: dto.image
        }
      };

      // Анализ с помощью ИИ
      const aiAnalysis = await this.openai.analyzeFactCheck(dto.text, dto.image, dto.locale ?? 'en');
      
      result.scamRate = aiAnalysis.truthfulness;
      result.category = aiAnalysis.category;
      result.confidence = aiAnalysis.confidence;
      result.summary = aiAnalysis.summary;
      result.explanation.factCheck = aiAnalysis.factCheck;
      result.explanation.recommendations = aiAnalysis.recommendations || [];
      result.explanation.explanation = aiAnalysis.explanation || '';

      // Сохраняем результат
      InMemory.set(result.id, result);

      console.log(`✅ Fact check completed:`, {
        id: result.id,
        truthfulness: result.scamRate,
        category: result.category,
        confidence: result.confidence
      });

      return result;
    } catch (error) {
      console.error('Fact check failed:', error);
      throw new Error('Failed to perform fact check');
    }
  }

  async handleDataCheck(dto: DataCheckDto) {
    console.log(`🚀 Starting data check analysis`);

    try {
      const result = {
        id: randomUUID(),
        scamRate: 0,
        category: 'Unknown',
        confidence: 0,
        summary: '',
        explanation: {
          factors: [],
          sources: [],
          recommendations: [],
          riskFactors: [],
          explanation: '',
          dataCheck: {
            foundData: [],
            sources: [],
            riskLevel: 'Low',
            recommendations: []
          }
        },
        url: '',
        createdAt: new Date().toISOString(),
        isDataCheck: true,
        input: dto
      };

      // Анализ с помощью ИИ
      const aiAnalysis = await this.openai.analyzeDataCheck(dto, dto.locale ?? 'en');
      
      result.scamRate = aiAnalysis.riskScore;
      result.category = aiAnalysis.category;
      result.confidence = aiAnalysis.confidence;
      result.summary = aiAnalysis.summary;
      result.explanation.dataCheck = aiAnalysis.dataCheck;
      result.explanation.recommendations = aiAnalysis.recommendations || [];
      result.explanation.explanation = aiAnalysis.explanation || '';

      // Сохраняем результат
      InMemory.set(result.id, result);

      console.log(`✅ Data check completed:`, {
        id: result.id,
        riskScore: result.scamRate,
        category: result.category,
        confidence: result.confidence
      });

      return result;
    } catch (error) {
      console.error('Data check failed:', error);
      throw new Error('Failed to perform data check');
    }
  }

  async handleFraudDetector(dto: FraudDetectorDto) {
    console.log(`🚀 Starting fraud detection analysis`);

    try {
      const result = {
        id: randomUUID(),
        scamRate: 0,
        category: 'Unknown',
        confidence: 0,
        summary: '',
        explanation: {
          factors: [],
          sources: [],
          recommendations: [],
          riskFactors: [],
          explanation: '',
          fraudDetection: {
            isScam: false,
            confidence: 0,
            redFlags: [],
            greenFlags: [],
            recommendations: []
          }
        },
        url: '',
        createdAt: new Date().toISOString(),
        isFraudDetector: true,
        input: {
          text: dto.text,
          images: dto.images
        }
      };

      // Анализ с помощью ИИ
      const aiAnalysis = await this.openai.analyzeFraudDetection(dto.text, dto.images, dto.locale ?? 'en');
      
      result.scamRate = aiAnalysis.scamScore;
      result.category = aiAnalysis.category;
      result.confidence = aiAnalysis.confidence;
      result.summary = aiAnalysis.summary;
      result.explanation.fraudDetection = aiAnalysis.fraudDetection;
      result.explanation.recommendations = aiAnalysis.recommendations || [];
      result.explanation.explanation = aiAnalysis.explanation || '';

      // Сохраняем результат
      InMemory.set(result.id, result);

      console.log(`✅ Fraud detection completed:`, {
        id: result.id,
        scamScore: result.scamRate,
        category: result.category,
        confidence: result.confidence
      });

      return result;
    } catch (error) {
      console.error('Fraud detection failed:', error);
      throw new Error('Failed to perform fraud detection');
    }
  }
}
