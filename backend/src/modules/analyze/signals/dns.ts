import { promises as dns } from 'dns';

export interface DnsInfo {
  a?: string[];
  aaaa?: string[];
  ns?: string[];
  mx?: { exchange: string; priority: number }[];
  txt?: string[];
  spf?: boolean;
  dmarc?: boolean;
  errors?: string[];
}

export async function queryDns(url: string): Promise<DnsInfo> {
  const result: DnsInfo = { errors: [] };
  try {
    const host = new URL(url).hostname;

    try { result.a = await dns.resolve4(host); } catch (e:any) { result.errors!.push('a_failed'); }
    try { result.aaaa = await dns.resolve6(host); } catch (e:any) { result.errors!.push('aaaa_failed'); }
    try { result.ns = await dns.resolveNs(host); } catch (e:any) { result.errors!.push('ns_failed'); }
    try { result.mx = await dns.resolveMx(host); } catch (e:any) { result.errors!.push('mx_failed'); }
    try {
      const txt = await dns.resolveTxt(host);
      result.txt = txt.map(arr => arr.join(''));
      const txtLower = result.txt.join(' ').toLowerCase();
      result.spf = /v=spf1/i.test(txtLower);
      // DMARC is stored at _dmarc.host
      try {
        const dmarcTxt = await dns.resolveTxt(`_dmarc.${host}`);
        const dmarcStr = dmarcTxt.map(a => a.join('')).join(' ').toLowerCase();
        result.dmarc = /v=dmarc1/i.test(dmarcStr);
      } catch { result.dmarc = false; }
    } catch (e:any) {
      result.errors!.push('txt_failed');
      result.spf = false;
      result.dmarc = false;
    }

    return result;
  } catch (error) {
    return { errors: ['dns_query_failed'] };
  }
}


