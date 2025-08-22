"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignalsService = void 0;
const common_1 = require("@nestjs/common");
const utils_1 = require("./utils");
const safebrowsing_1 = require("./signals/safebrowsing");
const virustotal_1 = require("./signals/virustotal");
const whois_1 = require("./signals/whois");
const wayback_1 = require("./signals/wayback");
const dns_1 = require("./signals/dns");
let SignalsService = class SignalsService {
    async collectForUrl(url) {
        console.log(`🔍 Collecting signals for: ${url}`);
        try {
            // Запускаем все проверки параллельно для скорости
            const [page, gsb, vt, whois, wayback, dns] = await Promise.allSettled([
                (0, utils_1.fetchUrlWithMeta)(url),
                (0, safebrowsing_1.querySafeBrowsing)(url),
                (0, virustotal_1.queryVirusTotal)(url),
                (0, whois_1.queryWhois)(url),
                (0, wayback_1.queryWayback)(url),
                (0, dns_1.queryDns)(url)
            ]);
            const signals = {
                url,
                page: page.status === 'fulfilled' ? page.value : null,
                gsb: gsb.status === 'fulfilled' ? gsb.value : null,
                vt: vt.status === 'fulfilled' ? vt.value : null,
                whois: whois.status === 'fulfilled' ? whois.value : null,
                wayback: wayback.status === 'fulfilled' ? wayback.value : null,
                dns: dns.status === 'fulfilled' ? dns.value : null,
                errors: []
            };
            // Логируем ошибки
            if (page.status === 'rejected') {
                console.error('Page fetch error:', page.reason);
                signals.errors.push('page_fetch_failed');
            }
            if (gsb.status === 'rejected') {
                console.error('GSB error:', gsb.reason);
                signals.errors.push('gsb_failed');
            }
            if (vt.status === 'rejected') {
                console.error('VirusTotal error:', vt.reason);
                signals.errors.push('virustotal_failed');
            }
            if (whois.status === 'rejected') {
                console.error('WHOIS error:', whois.reason);
                signals.errors.push('whois_failed');
            }
            if (wayback.status === 'rejected') {
                console.error('Wayback error:', wayback.reason);
                signals.errors.push('wayback_failed');
            }
            if (dns.status === 'rejected') {
                console.error('DNS error:', dns.reason);
                signals.errors.push('dns_failed');
            }
            console.log(`✅ Signals collected for ${url}:`, {
                page: !!signals.page,
                gsb: !!signals.gsb,
                vt: !!signals.vt,
                whois: !!signals.whois,
                wayback: !!signals.wayback,
                errors: signals.errors.length
            });
            return signals;
        }
        catch (error) {
            console.error('Error collecting signals:', error);
            return {
                url,
                page: null,
                gsb: null,
                vt: null,
                whois: null,
                wayback: null,
                dns: null,
                errors: ['collection_failed']
            };
        }
    }
};
exports.SignalsService = SignalsService;
exports.SignalsService = SignalsService = __decorate([
    (0, common_1.Injectable)()
], SignalsService);
