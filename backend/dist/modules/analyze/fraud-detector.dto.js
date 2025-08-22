"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FraudDetectorSchema = void 0;
const zod_1 = require("zod");
exports.FraudDetectorSchema = zod_1.z.object({
    text: zod_1.z.string().min(1, 'Описание ситуации обязательно'),
    images: zod_1.z.array(zod_1.z.string()).optional(), // массив base64 изображений
    type: zod_1.z.literal('fraud-detector'),
    locale: zod_1.z.enum(['en', 'ru', 'lv']).optional().default('en')
});
