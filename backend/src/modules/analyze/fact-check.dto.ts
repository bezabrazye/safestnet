import { z } from 'zod';

export const FactCheckSchema = z.object({
  text: z.string().min(1, 'Текст обязателен'),
  image: z.string().optional(), // base64 изображение
  type: z.literal('fact-check'),
  locale: z.enum(['en', 'ru', 'lv']).optional().default('en')
});

export type FactCheckDto = z.infer<typeof FactCheckSchema>;
