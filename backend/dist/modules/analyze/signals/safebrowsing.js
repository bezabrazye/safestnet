"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.querySafeBrowsing = querySafeBrowsing;
async function querySafeBrowsing(url) {
    const key = process.env.GSB_API_KEY;
    if (!key) {
        console.log('GSB_API_KEY not configured');
        return null;
    }
    try {
        const response = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${key}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client: {
                    clientId: 'safenet-backend',
                    clientVersion: '1.0.0'
                },
                threatInfo: {
                    threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
                    platformTypes: ['ANY_PLATFORM'],
                    threatEntryTypes: ['URL'],
                    threatEntries: [{ url }]
                }
            })
        });
        if (!response.ok) {
            console.error('Google Safe Browsing API error:', response.status, response.statusText);
            return null;
        }
        const data = await response.json();
        if (data.matches && data.matches.length > 0) {
            const match = data.matches[0];
            return {
                malicious: true,
                reason: match.threatType || 'unknown',
                platformType: match.platformType,
                threatEntryType: match.threatEntryType
            };
        }
        return {
            malicious: false,
            reason: 'clean'
        };
    }
    catch (error) {
        console.error('Google Safe Browsing API request failed:', error);
        return null;
    }
}
