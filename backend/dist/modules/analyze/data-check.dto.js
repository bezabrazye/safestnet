"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataCheckSchema = void 0;
const zod_1 = require("zod");
exports.DataCheckSchema = zod_1.z.object({
    phone: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    name: zod_1.z.string().optional(),
    company: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    socialMedia: zod_1.z.string().optional(),
    type: zod_1.z.literal('data-check'),
    locale: zod_1.z.enum(['en', 'ru', 'lv']).optional().default('en')
}).refine((data) => {
    // Хотя бы одно поле должно быть заполнено
    return Object.values(data).some(value => value && value.trim() && value !== 'data-check');
}, {
    message: 'Введите хотя бы один тип данных для проверки'
});
