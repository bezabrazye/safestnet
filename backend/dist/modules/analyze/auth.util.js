"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAdminToken = signAdminToken;
exports.verifyAdminToken = verifyAdminToken;
const crypto_1 = require("crypto");
function base64url(input) {
    return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
function signAdminToken(payload, secret) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const encHeader = base64url(JSON.stringify(header));
    const encPayload = base64url(JSON.stringify(payload));
    const data = `${encHeader}.${encPayload}`;
    const sig = (0, crypto_1.createHmac)('sha256', secret).update(data).digest();
    const encSig = base64url(sig);
    return `${data}.${encSig}`;
}
function verifyAdminToken(token, secret) {
    const parts = token.split('.');
    if (parts.length !== 3)
        return null;
    const [encHeader, encPayload, encSig] = parts;
    const data = `${encHeader}.${encPayload}`;
    const expected = base64url((0, crypto_1.createHmac)('sha256', secret).update(data).digest());
    if (expected !== encSig)
        return null;
    try {
        const payload = JSON.parse(Buffer.from(encPayload, 'base64').toString('utf8'));
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && now > payload.exp)
            return null;
        return payload;
    }
    catch {
        return null;
    }
}
