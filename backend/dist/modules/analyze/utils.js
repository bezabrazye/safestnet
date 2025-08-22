"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUrlWithMeta = fetchUrlWithMeta;
async function fetchUrlWithMeta(url) {
    try {
        const urlObj = new URL(url);
        const domain = urlObj.hostname.toLowerCase();
        // Специальная обработка для известных доменов
        const knownDomains = {
            'platform.openai.com': {
                sslValid: true,
                hasForms: true,
                wordsCount: 500,
                title: 'OpenAI Platform',
                description: 'OpenAI API Platform for developers',
                suspiciousPatterns: 0
            },
            'openai.com': {
                sslValid: true,
                hasForms: true,
                wordsCount: 800,
                title: 'OpenAI',
                description: 'OpenAI - Artificial Intelligence Research',
                suspiciousPatterns: 0
            },
            'github.com': {
                sslValid: true,
                hasForms: true,
                wordsCount: 1000,
                title: 'GitHub',
                description: 'GitHub - Where the world builds software',
                suspiciousPatterns: 0
            },
            'google.com': {
                sslValid: true,
                hasForms: true,
                wordsCount: 300,
                title: 'Google',
                description: 'Google Search',
                suspiciousPatterns: 0
            }
        };
        // Если это известный домен, возвращаем предопределенные данные
        if (knownDomains[domain]) {
            return {
                status: 200,
                ...knownDomains[domain],
                contentType: 'text/html',
                server: 'known-domain',
                poweredBy: ''
            };
        }
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Cache-Control': 'max-age=0',
            },
            redirect: 'follow'
        });
        if (!response.ok) {
            return {
                status: response.status,
                sslValid: false,
                hasForms: false,
                wordsCount: 0,
                title: '',
                description: '',
                error: `HTTP ${response.status}`
            };
        }
        const html = await response.text();
        // Проверяем SSL
        const sslValid = urlObj.protocol === 'https:';
        // Анализируем HTML
        const hasForms = /<form[^>]*>/i.test(html);
        const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : '';
        const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
        const description = descMatch ? descMatch[1].trim() : '';
        // Подсчитываем слова (убираем HTML теги)
        const textContent = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        const wordsCount = textContent.split(/\s+/).length;
        // Проверяем подозрительные паттерны и собираем список триггеров
        const suspiciousMap = [
            { name: 'password', regex: /password/i },
            { name: 'login', regex: /login/i },
            { name: 'sign in', regex: /sign.?in/i },
            { name: 'bank', regex: /bank/i },
            { name: 'credit card', regex: /credit.?card/i },
            { name: 'social security', regex: /social.?security/i },
            { name: 'ssn', regex: /ssn/i },
            { name: 'account number', regex: /account.?number/i },
        ];
        const suspiciousKeywords = [];
        for (const item of suspiciousMap) {
            if (item.regex.test(html))
                suspiciousKeywords.push(item.name);
        }
        const suspiciousCount = suspiciousKeywords.length;
        return {
            status: response.status,
            sslValid,
            hasForms,
            wordsCount,
            title,
            description,
            suspiciousPatterns: suspiciousCount,
            suspiciousKeywords,
            contentType: response.headers.get('content-type') || '',
            server: response.headers.get('server') || '',
            poweredBy: response.headers.get('x-powered-by') || ''
        };
    }
    catch (error) {
        console.error('Error fetching URL:', error);
        return {
            status: 0,
            sslValid: false,
            hasForms: false,
            wordsCount: 0,
            title: '',
            description: '',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}
