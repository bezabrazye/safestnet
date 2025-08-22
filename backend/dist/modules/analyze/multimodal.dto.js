"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultimodalAnalyzeSchema = void 0;
const zod_1 = require("zod");
exports.MultimodalAnalyzeSchema = zod_1.z.object({
    url: zod_1.z.string().url('Invalid URL format').optional(),
    text: zod_1.z.string().optional(),
    images: zod_1.z.array(zod_1.z.string()).optional(),
    videoFrames: zod_1.z.array(zod_1.z.string()).optional(),
    locale: zod_1.z.enum(['en', 'ru', 'lv']).default('ru'),
    comment: zod_1.z.string().optional(),
});
