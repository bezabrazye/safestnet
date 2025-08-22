"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryDns = queryDns;
const dns_1 = require("dns");
async function queryDns(url) {
    const result = { errors: [] };
    try {
        const host = new URL(url).hostname;
        try {
            result.a = await dns_1.promises.resolve4(host);
        }
        catch (e) {
            result.errors.push('a_failed');
        }
        try {
            result.aaaa = await dns_1.promises.resolve6(host);
        }
        catch (e) {
            result.errors.push('aaaa_failed');
        }
        try {
            result.ns = await dns_1.promises.resolveNs(host);
        }
        catch (e) {
            result.errors.push('ns_failed');
        }
        try {
            result.mx = await dns_1.promises.resolveMx(host);
        }
        catch (e) {
            result.errors.push('mx_failed');
        }
        try {
            const txt = await dns_1.promises.resolveTxt(host);
            result.txt = txt.map(arr => arr.join(''));
            const txtLower = result.txt.join(' ').toLowerCase();
            result.spf = /v=spf1/i.test(txtLower);
            // DMARC is stored at _dmarc.host
            try {
                const dmarcTxt = await dns_1.promises.resolveTxt(`_dmarc.${host}`);
                const dmarcStr = dmarcTxt.map(a => a.join('')).join(' ').toLowerCase();
                result.dmarc = /v=dmarc1/i.test(dmarcStr);
            }
            catch {
                result.dmarc = false;
            }
        }
        catch (e) {
            result.errors.push('txt_failed');
            result.spf = false;
            result.dmarc = false;
        }
        return result;
    }
    catch (error) {
        return { errors: ['dns_query_failed'] };
    }
}
