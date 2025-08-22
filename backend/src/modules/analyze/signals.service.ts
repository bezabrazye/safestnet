import { Injectable } from '@nestjs/common';
import { fetchUrlWithMeta } from './utils';
import { querySafeBrowsing } from './signals/safebrowsing';
import { queryVirusTotal } from './signals/virustotal';
import { queryWhois } from './signals/whois';
import { queryWayback } from './signals/wayback';
import { queryDns } from './signals/dns';

@Injectable()
export class SignalsService {
  async collectForUrl(url: string) {
    console.log(`🔍 Collecting signals for: ${url}`);

    try {
      // Запускаем все проверки параллельно для скорости
      const [page, gsb, vt, whois, wayback, dns] = await Promise.allSettled([
        fetchUrlWithMeta(url),
        querySafeBrowsing(url),
        queryVirusTotal(url),
        queryWhois(url),
        queryWayback(url),
        queryDns(url)
      ]);

      const signals = {
        url,
        page: page.status === 'fulfilled' ? page.value : null,
        gsb: gsb.status === 'fulfilled' ? gsb.value : null,
        vt: vt.status === 'fulfilled' ? vt.value : null,
        whois: whois.status === 'fulfilled' ? whois.value : null,
        wayback: wayback.status === 'fulfilled' ? wayback.value : null,
        dns: dns.status === 'fulfilled' ? dns.value : null,
        errors: [] as string[]
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
    } catch (error) {
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
}
