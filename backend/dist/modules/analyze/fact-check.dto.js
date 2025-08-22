"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FactCheckSchema = void 0;
const zod_1 = require("zod");
exports.FactCheckSchema = zod_1.z.object({
    text: zod_1.z.string().min(1, 'Текст обязателен'),
    image: zod_1.z.string().optional(), // base64 изображение
    type: zod_1.z.literal('fact-check'),
    locale: zod_1.z.enum(['en', 'ru', 'lv']).optional().default('en')
});
