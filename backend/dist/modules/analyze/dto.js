"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyzeUrlSchema = void 0;
const zod_1 = require("zod");
exports.AnalyzeUrlSchema = zod_1.z.object({
    url: zod_1.z.string().url('Invalid URL format'),
    locale: zod_1.z.enum(['en', 'ru', 'lv']).default('en'),
    deviceFingerprint: zod_1.z.string().optional(),
    userId: zod_1.z.string().optional(),
});
