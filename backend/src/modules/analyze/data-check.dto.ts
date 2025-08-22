import { z } from 'zod';

export const DataCheckSchema = z.object({
  phone: z.string().optional(),
  email: z.string().email().optional(),
  name: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  socialMedia: z.string().optional(),
  type: z.literal('data-check'),
  locale: z.enum(['en', 'ru', 'lv']).optional().default('en')
}).refine((data) => {
  // Хотя бы одно поле должно быть заполнено
  return Object.values(data).some(value => value && value.trim() && value !== 'data-check');
}, {
  message: 'Введите хотя бы один тип данных для проверки'
});

export type DataCheckDto = z.infer<typeof DataCheckSchema>;
