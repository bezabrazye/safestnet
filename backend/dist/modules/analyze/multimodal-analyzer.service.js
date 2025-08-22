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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultimodalAnalyzerService = void 0;
const common_1 = require("@nestjs/common");
const openai_1 = __importDefault(require("openai"));
const SYSTEM_PROMPT = `
Ты — SafestNet, ИИ-аналитик кибербезопасности.
Твоя задача — аккуратно и строго анализировать: URL/ссылки, текст, изображения (скриншоты, фото интерфейсов) и кадры из видео.
Всегда отвечай ТОЛЬКО структурированным JSON согласно переданной JSON-схеме (без лишнего текста).

=== Обязательные принципы ===
1) Классификация: "safe" | "suspicious" | "dangerous".
2) Объясняй "почему": краткое резюме + перечень причин/сигналов.
3) Извлекай IOC и артефакты: домены, URL, email, телефоны, IP, криптокошельки, упоминания брендов, суммы/валюты, мессенджеры (Telegram/WhatsApp), ID-кошельков, QR-ссылки.
4) Для изображений/кадров сначала кратко опиши, что на них (OCR-смысл), затем признаки скама/подделки интерфейса: 
   — фальшивые логотипы/шрифты/иконки, несоответствие UI бренда,
   — URL в адресной строке (если видна), отсутствие HTTPS/замка, странные TLD/субдомены,
   — орфографические ляпы, инородные пиксели/артефакты компрессии на ключевых элементах, подменённые кнопки.
5) Для текста/сценария проверь:
   — давление/срочность ("немедленно", "24 часа", "последний шанс"),
   — угрозы банком/налоговой/полиции; "подарочные карты", крипта, переводы P2P,
   — правдоподобность бренда: совпадение домена/почты с официальным, корректные контактные данные,
   — классические паттерны фишинга: "verify/update/login", "KYC now", вложенные ссылкотрекеры, @user:pass в URL, IP-адрес вместо домена, base64 в пути, порт ≠ 443/80.
6) Для URL проверь (логически, без реального сетевого запроса):
   — punycode/гомографы, тайпсквоттинг (g00gle vs google),
   — подозрительные TLD (.zip, .top, .ru для глобального бренда и т.п.),
   — бренд в субдомене (microsoft.secure-login.example.com),
   — чрезмерная длина/энтропия пути, подозрительные query-параметры (password, seed, mnemonic, gift, bonus),
   — короткие ссылки; если видишь шортнер — пометь как риск (без разворачивания).
7) Учитывай контекст региона/языка пользователя (locale), не штрафуй естественные локализации; но помечай подозрительный "ломаный" язык.
8) Присвой числовой risk_score (0–100) по рубрике:
   — Высокий вес (15–25 баллов за пункт): явная имперсонация бренда; фишинг-форма входа; просьба ввести креды/seed; оплата криптой/гифт-картами; шортнер + странный домен; IP-URL; явные QR-фишинг-пэйволы.
   — Средний вес (8–14): неофициальный домен бренда; TLD высокого риска; орфошибки в письмах "банков"; агрессивная срочность; отсутствие контактов/политик.
   — Низкий вес (2–7): визуальные несоответствия, общие странности UI, слабые косвенные признаки.
   — Итог: clamp(Σ весов, 0..100). 
   — Порог: dangerous ≥ 70; suspicious 30–69; safe < 30 (если нет критических красных флагов).
9) Дай рекомендации: что сделать сейчас (не переходить, проверить у провайдера, сменить пароль, включить 2FA, связаться с банком…), ссылки на типовые действия (без внешних URL — коротким текстом).
10) Конфиденциальность: не вставляй персональные данные пользователя в отчёт сверх необходимого.
11) Если данных мало — пометь "need_more_evidence": true и попроси недостающие артефакты (напр. полный URL, заголовки письма, исходник QR).
`;
const reportSchema = {
    name: "SafestNetRiskReport",
    schema: {
        type: "object",
        additionalProperties: false,
        properties: {
            status: { type: "string", enum: ["safe", "suspicious", "dangerous"] },
            risk_score: { type: "integer", minimum: 0, maximum: 100 },
            summary: { type: "string", minLength: 1 },
            reasons: {
                type: "array",
                items: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                        code: { type: "string" }, // e.g., "URL_IMPERSONATION", "CRYPTO_PREPAY", "LANG_ODD"
                        weight: { type: "integer", minimum: 1, maximum: 25 },
                        evidence: { type: "string" } // короткое объяснение/цитата/что увидел
                    },
                    required: ["code", "weight", "evidence"]
                }
            },
            ioc: {
                type: "object",
                additionalProperties: false,
                properties: {
                    urls: { type: "array", items: { type: "string" } },
                    domains: { type: "array", items: { type: "string" } },
                    emails: { type: "array", items: { type: "string" } },
                    phones: { type: "array", items: { type: "string" } },
                    ips: { type: "array", items: { type: "string" } },
                    crypto_wallets: { type: "array", items: { type: "string" } },
                    messengers: { type: "array", items: { type: "string" } }, // telegram:@user, whatsapp:+xxx
                    brands: { type: "array", items: { type: "string" } },
                    money: { type: "array", items: { type: "string" } }, // суммы/валюты
                    qr_links: { type: "array", items: { type: "string" } } // распознанные из QR/скриншотов
                },
                required: ["urls", "domains", "emails", "phones", "ips", "crypto_wallets", "messengers", "brands", "money", "qr_links"]
            },
            image_findings: {
                type: "array",
                items: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                        src: { type: "string" },
                        ocr_brief: { type: "string" },
                        visual_anomalies: { type: "array", items: { type: "string" } }, // логотип/шрифт/адресная строка/иконки
                        inferred_urls: { type: "array", items: { type: "string" } }
                    },
                    required: ["src", "ocr_brief", "visual_anomalies", "inferred_urls"]
                }
            },
            recommendations: { type: "array", items: { type: "string" } },
            suggested_actions: {
                type: "array",
                items: { type: "string", enum: ["block", "warn", "allow", "educate", "report"] }
            },
            confidence: { type: "number", minimum: 0, maximum: 1 },
            need_more_evidence: { type: "boolean" },
            missing_artifacts: { type: "array", items: { type: "string" } }, // что ещё прислать пользователю
            input_summary: { type: "string" }, // кратко: что именно прислали
            locale_used: { type: "string" }
        },
        required: ["status", "risk_score", "summary", "reasons", "ioc", "recommendations", "suggested_actions", "confidence", "need_more_evidence", "locale_used"]
    },
    strict: true
};
let MultimodalAnalyzerService = class MultimodalAnalyzerService {
    constructor() {
        this.openai = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    /** Собираем мультимодальное содержимое для Responses API */
    buildUserContent(input) {
        const content = [];
        // Аггрегированный текст запроса
        const parts = [];
        if (input.url)
            parts.push(`URL: ${input.url}`);
        if (input.text)
            parts.push(`TEXT:\n${input.text}`);
        if (input.comment)
            parts.push(`USER COMMENT:\n${input.comment}`);
        parts.push(`LOCALE: ${input.locale ?? "ru"}`);
        const fullText = parts.join("\n\n");
        content.push({ type: "text", text: fullText });
        // Изображения (включая кадры из видео)
        const imgs = [...(input.images ?? []), ...(input.videoFrames ?? [])];
        for (const src of imgs) {
            content.push({ type: "image_url", image_url: { url: src } });
        }
        return content;
    }
    /** Главная функция анализа */
    async analyzeSubmission(input) {
        try {
            const userContent = this.buildUserContent(input);
            const response = await this.openai.chat.completions.create({
                model: "gpt-4o-mini", // Используем доступную модель
                response_format: { type: "json_object" },
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: userContent }
                ],
                temperature: 0.2,
                max_tokens: 2000
            });
            const content = response.choices[0]?.message?.content;
            if (!content) {
                throw new Error('No response from OpenAI');
            }
            let report;
            try {
                report = JSON.parse(content);
            }
            catch (e) {
                console.error('Failed to parse OpenAI response:', e);
                return this.getFallbackReport(input);
            }
            // Валидация и нормализация ответа
            return this.normalizeReport(report, input);
        }
        catch (error) {
            console.error('Multimodal analysis failed:', error);
            return this.getFallbackReport(input);
        }
    }
    normalizeReport(report, input) {
        return {
            status: report.status || 'suspicious',
            risk_score: Math.max(0, Math.min(100, Number(report.risk_score ?? 50))),
            summary: report.summary || 'Анализ завершен с ограниченными данными',
            reasons: Array.isArray(report.reasons) ? report.reasons : [],
            ioc: {
                urls: Array.isArray(report.ioc?.urls) ? report.ioc.urls : [],
                domains: Array.isArray(report.ioc?.domains) ? report.ioc.domains : [],
                emails: Array.isArray(report.ioc?.emails) ? report.ioc.emails : [],
                phones: Array.isArray(report.ioc?.phones) ? report.ioc.phones : [],
                ips: Array.isArray(report.ioc?.ips) ? report.ioc.ips : [],
                crypto_wallets: Array.isArray(report.ioc?.crypto_wallets) ? report.ioc.crypto_wallets : [],
                messengers: Array.isArray(report.ioc?.messengers) ? report.ioc.messengers : [],
                brands: Array.isArray(report.ioc?.brands) ? report.ioc.brands : [],
                money: Array.isArray(report.ioc?.money) ? report.ioc.money : [],
                qr_links: Array.isArray(report.ioc?.qr_links) ? report.ioc.qr_links : []
            },
            image_findings: Array.isArray(report.image_findings) ? report.image_findings : [],
            recommendations: Array.isArray(report.recommendations) ? report.recommendations : this.getFallbackRecommendations(input.locale),
            suggested_actions: Array.isArray(report.suggested_actions) ? report.suggested_actions : ['warn'],
            confidence: Math.max(0, Math.min(1, Number(report.confidence ?? 0.7))),
            need_more_evidence: Boolean(report.need_more_evidence),
            missing_artifacts: Array.isArray(report.missing_artifacts) ? report.missing_artifacts : [],
            input_summary: report.input_summary || this.generateInputSummary(input),
            locale_used: input.locale || 'ru'
        };
    }
    getFallbackReport(input) {
        return {
            status: 'suspicious',
            risk_score: 50,
            summary: 'Анализ завершен с ограниченными данными из-за технических проблем',
            reasons: [{ code: 'TECHNICAL_ERROR', weight: 10, evidence: 'Не удалось выполнить полный анализ' }],
            ioc: {
                urls: input.url ? [input.url] : [],
                domains: [],
                emails: [],
                phones: [],
                ips: [],
                crypto_wallets: [],
                messengers: [],
                brands: [],
                money: [],
                qr_links: []
            },
            image_findings: [],
            recommendations: this.getFallbackRecommendations(input.locale),
            suggested_actions: ['warn'],
            confidence: 0.5,
            need_more_evidence: true,
            missing_artifacts: ['Полный URL', 'Скриншот интерфейса', 'Текст сообщения'],
            input_summary: this.generateInputSummary(input),
            locale_used: input.locale || 'ru'
        };
    }
    getFallbackRecommendations(locale) {
        const recommendations = {
            ru: [
                'Не переходите по подозрительным ссылкам',
                'Проверьте URL на наличие опечаток',
                'Используйте двухфакторную аутентификацию',
                'Свяжитесь с официальной поддержкой бренда'
            ],
            en: [
                'Do not click on suspicious links',
                'Check URLs for typos',
                'Use two-factor authentication',
                'Contact official brand support'
            ],
            lv: [
                'Neklikšķiniet uz aizdomīgām saitēm',
                'Pārbaudiet URL vai nav kļūdu',
                'Izmantojiet divfaktoru autentifikāciju',
                'Sazinieties ar oficiālo zīmola atbalstu'
            ]
        };
        return recommendations[locale] || recommendations.ru;
    }
    generateInputSummary(input) {
        const parts = [];
        if (input.url)
            parts.push('URL');
        if (input.text)
            parts.push('текст');
        if (input.images?.length)
            parts.push(`${input.images.length} изображений`);
        if (input.videoFrames?.length)
            parts.push(`${input.videoFrames.length} кадров видео`);
        if (input.comment)
            parts.push('комментарий пользователя');
        return parts.length > 0 ? `Анализ: ${parts.join(', ')}` : 'Неизвестный тип контента';
    }
};
exports.MultimodalAnalyzerService = MultimodalAnalyzerService;
exports.MultimodalAnalyzerService = MultimodalAnalyzerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MultimodalAnalyzerService);
