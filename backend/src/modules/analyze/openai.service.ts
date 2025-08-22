import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

interface AnalysisPayload {
  locale: string;
  url: string;
  signals: any;
  factors: any[];
  baseScore: number;
}

interface AnalysisResult {
  summary: string;
  adjuster: number;
  recommendations: string[];
  sources: any[];
  timeline: any[];
}

@Injectable()
export class OpenAiService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async analyzeUrlSecurity(url: string, signals: any, locale: string = 'en'): Promise<any> {
    const systemPrompts = {
      en: `You are a cybersecurity expert specializing in scam detection and fraud prevention. Your mission is to protect users from financial scams, phishing, and fraudulent websites. You must be EXTREMELY VIGILANT and identify even subtle signs of deception. Always respond in English.`,
      ru: `Вы эксперт по кибербезопасности, специализирующийся на обнаружении мошенничества и предотвращении мошенничества. Ваша миссия - защищать пользователей от финансовых мошенничеств, фишинга и мошеннических сайтов. Вы должны быть КРАЙНЕ БДИТЕЛЬНЫ и выявлять даже малейшие признаки обмана. Всегда отвечайте на русском языке.`,
      lv: `Jūs esat kiberdrošības eksperts, kas specializējas krāpšanas atklāšanā un krāpšanas novēršanā. Jūsu misija ir aizsargāt lietotājus no finanšu krāpšanas, fīšinga un krāpšanas mājas lapām. Jums jābūt ĀRKĀRTĪGI UZMANĪGAM un jāatklāj pat vissīkākie krāpšanas pazīmju. Vienmēr atbildiet latviešu valodā.`
    };

    const system = systemPrompts[locale as keyof typeof systemPrompts] || systemPrompts.en;

    const signalsDescription = this.formatSignals(signals, locale);

    const prompt = `
URL TO ANALYZE: ${url}

SECURITY SIGNALS DATA:
${signalsDescription}

CRITICAL SCAM DETECTION TASK: Analyze this URL for signs of fraud, phishing, or financial scams. You must be EXTREMELY VIGILANT!

SCAM INDICATORS TO CHECK:
1. **Brand Impersonation**: Does the domain mimic a well-known brand? (e.g., "re-volut-ai.com" vs "revolut.com")
2. **Financial Promises**: Does the site promise investments, returns, or financial gains?
3. **Urgency Tactics**: Does it create urgency or pressure to act quickly?
4. **Suspicious Domain Patterns**: 
   - Typosquatting (revolut.com vs revolut.com)
   - Brand + random words (revolut-ai.com, paypal-secure.com)
   - Suspicious TLDs (.xyz, .top, .online)
5. **Excessive Tracking**: Long URLs with many UTM parameters
6. **Young Domains**: Less than 2-3 years old
7. **Suspicious Registrars**: Unknown or suspicious registrars
8. **Content Analysis**: Investment promises, financial advice, crypto schemes

SCORING GUIDELINES:
- **95-100**: OBVIOUS SCAM (brand impersonation + financial promises)
- **85-94**: HIGH RISK (multiple scam indicators)
- **70-84**: SUSPICIOUS (several concerning factors)
- **50-69**: MEDIUM RISK (some suspicious elements)
- **20-49**: LOW RISK (minor concerns)
- **0-19**: SAFE (reputable, well-known domains)

Return a JSON object with this exact structure:
{
  "score": number (0-100, where 0 = very safe, 100 = very dangerous),
  "category": "High" | "Medium" | "Low",
  "confidence": number (0-100),
  "summary": "2-3 sentence security assessment in ${locale}",
  "riskFactors": ["list of specific risk factors found"],
  "recommendations": ["list of 4-6 actionable security recommendations in ${locale}"],
  "explanation": "Detailed explanation of the assessment in ${locale}",
  "detailedReports": [
    {
      "code": "domain_age | ssl_valid | gsb | virustotal | content_quality | forms_present | suspicious_patterns | wayback_history | dns_email_auth | brand_impersonation | suspicious_domain | tracking_params | suspicious_registrar",
      "title": "Human friendly title in ${locale}",
      "description": "2-4 sentences describing what exactly was checked and the finding in ${locale}",
      "evidence": "Short proof text (can include direct quotes or numeric values)",
      "sources": ["https://link.to/proof"]
    }
  ],
  "sources": [
    {"name": "Google Safe Browsing", "status": "CLEAN/DANGEROUS", "description": "Google's database of known malicious websites"},
    {"name": "VirusTotal", "status": "X/Y ENGINES", "description": "Multi-engine antivirus scanning results"}
  ]
}

CRITICAL: If you detect ANY signs of brand impersonation + financial promises, the score MUST be 95-100!
`;

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
        max_tokens: 1500
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch (e) {
        console.error('Failed to parse OpenAI response:', e);
        return this.getFallbackResult(locale);
      }

      return {
        score: Math.max(0, Math.min(100, Number(parsed.score ?? 50))),
        category: parsed.category || 'Medium',
        confidence: Math.max(0, Math.min(100, Number(parsed.confidence ?? 70))),
        summary: parsed.summary || this.getFallbackSummary(locale),
        riskFactors: Array.isArray(parsed.riskFactors) ? parsed.riskFactors : [],
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : this.getFallbackRecommendations(locale),
        explanation: parsed.explanation || '',
        sources: this.generateSources(signals),
        detailedReports: Array.isArray(parsed.detailedReports) ? parsed.detailedReports : []
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      return this.getFallbackResult(locale);
    }
  }

  private formatSignals(signals: any, locale: string): string {
    const parts = [];

    if (signals.page) {
      parts.push(`Page Analysis: Status ${signals.page.status}, SSL: ${signals.page.sslValid ? 'Valid' : 'Invalid'}, Forms: ${signals.page.hasForms ? 'Yes' : 'No'}, Words: ${signals.page.wordsCount}`);
    }

    if (signals.gsb) {
      parts.push(`Google Safe Browsing: ${signals.gsb.malicious ? 'MALICIOUS' : 'Clean'} ${signals.gsb.reason ? `(${signals.gsb.reason})` : ''}`);
    }

    if (signals.vt) {
      parts.push(`VirusTotal: ${signals.vt.positives}/${signals.vt.total} engines detected threats`);
    }

    if (signals.whois) {
      parts.push(`Domain Age: ${signals.whois.ageDays} days, Registrar: ${signals.whois.registrar}`);
    }

    if (signals.wayback) {
      parts.push(`Wayback Machine: ${signals.wayback.available ? 'Available' : 'Not archived'}`);
    }

    return parts.join('\n');
  }

  private formatFactors(factors: any[], locale: string): string {
    return factors.map(f => 
      `${f.name}: ${f.value} (weight: ${f.weight}) [${f.evidence}]`
    ).join('\n');
  }

  private generateSources(signals: any): any[] {
    const sources = [];

    if (signals.gsb) {
      sources.push({
        name: 'Google Safe Browsing',
        status: signals.gsb.malicious ? 'THREAT_DETECTED' : 'CLEAN',
        description: 'Google\'s database of known malicious websites and phishing pages'
      });
    }

    if (signals.vt) {
      sources.push({
        name: 'VirusTotal',
        status: `${signals.vt.positives}/${signals.vt.total} ENGINES`,
        description: 'Multi-engine antivirus scanning results from 70+ security vendors'
      });
    }

    if (signals.wayback) {
      sources.push({
        name: 'Wayback Machine',
        status: signals.wayback.available ? 'AVAILABLE' : 'NOT ARCHIVED',
        description: 'Web archive snapshots history of the website'
      });
    }

    return sources;
  }

  private getFallbackResult(locale: string) {
    return {
      score: 50,
      category: 'Medium',
      confidence: 70,
      summary: this.getFallbackSummary(locale),
      riskFactors: ['Unable to analyze due to technical issues'],
      recommendations: this.getFallbackRecommendations(locale),
      explanation: 'Analysis was performed using fallback methods due to technical issues.',
      sources: []
    };
  }

  private getFallbackSummary(locale: string): string {
    const summaries = {
      en: 'Security analysis completed with limited data. Exercise caution and verify the website independently.',
      ru: 'Анализ безопасности завершен с ограниченными данными. Проявляйте осторожность и проверяйте сайт самостоятельно.',
      lv: 'Drošības analīze pabeigta ar ierobežotiem datiem. Esiet uzmanīgi un pārbaudiet vietni neatkarīgi.'
    };
    return summaries[locale as keyof typeof summaries] || summaries.en;
  }

  private getFallbackRecommendations(locale: string): string[] {
    const recommendations = {
      en: [
        'Always verify the website URL matches the official domain',
        'Check for HTTPS encryption before entering sensitive data',
        'Use antivirus software and keep it updated',
        'Be cautious with websites asking for personal information'
      ],
      ru: [
        'Всегда проверяйте, что URL сайта соответствует официальному домену',
        'Проверяйте HTTPS шифрование перед вводом конфиденциальных данных',
        'Используйте антивирусное ПО и держите его обновленным',
        'Будьте осторожны с сайтами, запрашивающими личную информацию'
      ],
      lv: [
        'Vienmēr pārbaudiet, vai vietnes URL atbilst oficiālajam domēnam',
        'Pārbaudiet HTTPS šifrēšanu pirms konfidenciālu datu ievadīšanas',
        'Izmantojiet antivīrusu programmatūru un turiet to atjauninātu',
        'Esiet uzmanīgi ar vietnēm, kas lūdz personīgo informāciju'
      ]
    };
    return recommendations[locale as keyof typeof recommendations] || recommendations.en;
  }

  async analyzeFactCheck(text: string, image?: string, locale: string = 'en'): Promise<any> {
    const systemPrompts = {
      en: `You are a fact-checking expert specializing in verifying claims, news, and information. Your mission is to provide accurate, unbiased analysis of facts and claims. Always respond in English.`,
      ru: `Вы эксперт по проверке фактов, специализирующийся на верификации заявлений, новостей и информации. Ваша миссия - предоставлять точный, беспристрастный анализ фактов и заявлений. Всегда отвечайте на русском языке.`,
      lv: `Jūs esat faktu pārbaudes eksperts, kas specializējas apgalvojumu, ziņu un informācijas verificēšanā. Jūsu misija ir sniegt precīzu, objektīvu faktu un apgalvojumu analīzi. Vienmēr atbildiet latviešu valodā.`
    };

    const systemPrompt = systemPrompts[locale as keyof typeof systemPrompts] || systemPrompts.en;

    const prompt = `
FACT TO CHECK: ${text}

${image ? 'IMAGE PROVIDED: Yes (analyze both text and image content)' : 'IMAGE PROVIDED: No'}

TASK: Analyze this claim/fact for truthfulness and provide a comprehensive fact-check.

Return a JSON object with this exact structure:
{
  "truthfulness": number (0-100, where 0 = completely false, 100 = completely true),
  "category": "True" | "Mostly True" | "Mixed" | "Mostly False" | "False" | "Unverifiable",
  "confidence": number (0-100),
  "summary": "2-3 sentence summary of the fact-check result",
  "factCheck": {
    "truthfulness": number (0-100),
    "sources": ["list of sources used for verification"],
    "debunked": boolean,
    "explanation": "Detailed explanation of the fact-check process and findings"
  },
  "recommendations": ["list of 3-4 recommendations for fact-checking similar claims"],
  "explanation": "Detailed explanation of the assessment"
}
`;

    try {
      const messages: any[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ];

      if (image) {
        messages.push({
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze this image along with the text claim.' },
            { type: 'image_url', image_url: { url: image } }
          ]
        });
      }

      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        response_format: { type: 'json_object' },
        temperature: 0.1,
        max_tokens: 1500
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      return JSON.parse(content);
    } catch (error) {
      console.error('Fact check analysis failed:', error);
      return {
        truthfulness: 50,
        category: 'Unverifiable',
        confidence: 50,
        summary: 'Unable to verify this claim due to technical issues.',
        factCheck: {
          truthfulness: 50,
          sources: [],
          debunked: false,
          explanation: 'Analysis failed due to technical issues.'
        },
        recommendations: ['Verify claims through multiple reliable sources', 'Check for recent updates or corrections', 'Consider the source credibility'],
        explanation: 'Unable to perform fact-check analysis due to technical issues.'
      };
    }
  }

  async analyzeDataCheck(dto: any, locale: string = 'en'): Promise<any> {
    const systemPrompts = {
      en: `You are an OSINT (Open Source Intelligence) expert specializing in gathering and analyzing publicly available information. Your mission is to find and verify information about people, companies, and entities. Always respond in English.`,
      ru: `Вы эксперт по OSINT (разведка из открытых источников), специализирующийся на сборе и анализе общедоступной информации. Ваша миссия - находить и проверять информацию о людях, компаниях и организациях. Всегда отвечайте на русском языке.`,
      lv: `Jūs esat OSINT (atklātā avota izlūkošana) eksperts, kas specializējas publiski pieejamas informācijas vākšanā un analīzē. Jūsu misija ir atrast un verificēt informāciju par cilvēkiem, uzņēmumiem un organizācijām. Vienmēr atbildiet latviešu valodā.`
    };

    const systemPrompt = systemPrompts[locale as keyof typeof systemPrompts] || systemPrompts.en;

    const prompt = `
DATA TO SEARCH: ${JSON.stringify(dto, null, 2)}

TASK: Conduct a comprehensive search for publicly available information about the provided data. Analyze the findings for potential risks and provide recommendations.

Return a JSON object with this exact structure:
{
  "riskScore": number (0-100, where 0 = low risk, 100 = high risk),
  "category": "Low Risk" | "Medium Risk" | "High Risk",
  "confidence": number (0-100),
  "summary": "2-3 sentence summary of the findings",
  "dataCheck": {
    "foundData": ["list of found information"],
    "sources": ["list of sources used"],
    "riskLevel": "Low" | "Medium" | "High",
    "recommendations": ["list of recommendations based on findings"]
  },
  "recommendations": ["list of 3-4 general recommendations"],
  "explanation": "Detailed explanation of the analysis"
}
`;

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
        max_tokens: 1500
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      return JSON.parse(content);
    } catch (error) {
      console.error('Data check analysis failed:', error);
      return {
        riskScore: 50,
        category: 'Medium Risk',
        confidence: 50,
        summary: 'Unable to perform data check due to technical issues.',
        dataCheck: {
          foundData: [],
          sources: [],
          riskLevel: 'Medium',
          recommendations: ['Verify information through official sources', 'Check for recent updates', 'Consider privacy implications']
        },
        recommendations: ['Always verify information through official sources', 'Be cautious with personal data sharing', 'Monitor for any suspicious activity'],
        explanation: 'Unable to perform data check analysis due to technical issues.'
      };
    }
  }

  async analyzeFraudDetection(text: string, images?: string[], locale: string = 'en'): Promise<any> {
    const systemPrompts = {
      en: `You are a fraud detection expert specializing in identifying scams, fraudulent schemes, and deceptive practices. Your mission is to protect users from financial fraud and scams. Always respond in English.`,
      ru: `Вы эксперт по обнаружению мошенничества, специализирующийся на выявлении скамов, мошеннических схем и обманных практик. Ваша миссия - защищать пользователей от финансового мошенничества и скамов. Всегда отвечайте на русском языке.`,
      lv: `Jūs esat krāpšanas atklāšanas eksperts, kas specializējas krāpšanas shēmu, krāpšanas shēmu un maldināšanas prakses identificēšanā. Jūsu misija ir aizsargāt lietotājus no finanšu krāpšanas un krāpšanas shēmām. Vienmēr atbildiet latviešu valodā.`
    };

    const systemPrompt = systemPrompts[locale as keyof typeof systemPrompts] || systemPrompts.en;

    const prompt = `
SITUATION TO ANALYZE: ${text}

${images && images.length > 0 ? `IMAGES PROVIDED: ${images.length} image(s) (analyze both text and visual content)` : 'IMAGES PROVIDED: No'}

TASK: Analyze this situation for signs of fraud, scams, or deception. Provide a comprehensive fraud assessment.

Return a JSON object with this exact structure:
{
  "scamScore": number (0-100, where 0 = not a scam, 100 = definitely a scam),
  "category": "Safe" | "Suspicious" | "High Risk" | "Scam",
  "confidence": number (0-100),
  "summary": "2-3 sentence summary of the fraud assessment",
  "fraudDetection": {
    "isScam": boolean,
    "confidence": number (0-100),
    "redFlags": ["list of red flags found"],
    "greenFlags": ["list of positive indicators"],
    "recommendations": ["list of specific recommendations"]
  },
  "recommendations": ["list of 4-6 general fraud prevention recommendations"],
  "explanation": "Detailed explanation of the fraud assessment"
}
`;

    try {
      const messages: any[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ];

      if (images && images.length > 0) {
        for (const image of images) {
          messages.push({
            role: 'user',
            content: [
              { type: 'text', text: 'Analyze this image for signs of fraud or deception.' },
              { type: 'image_url', image_url: { url: image } }
            ]
          });
        }
      }

      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        response_format: { type: 'json_object' },
        temperature: 0.1,
        max_tokens: 1500
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      return JSON.parse(content);
    } catch (error) {
      console.error('Fraud detection analysis failed:', error);
      return {
        scamScore: 50,
        category: 'Suspicious',
        confidence: 50,
        summary: 'Unable to perform fraud detection due to technical issues.',
        fraudDetection: {
          isScam: false,
          confidence: 50,
          redFlags: [],
          greenFlags: [],
          recommendations: ['Verify through official channels', 'Check for red flags', 'Consult with experts if unsure']
        },
        recommendations: ['Always verify through official channels', 'Never share sensitive information', 'Be cautious with financial transactions', 'Trust your instincts'],
        explanation: 'Unable to perform fraud detection analysis due to technical issues.'
      };
    }
  }
}
