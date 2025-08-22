import { z } from 'zod';

export const FraudDetectorSchema = z.object({
  text: z.string().min(1, 'Описание ситуации обязательно'),
  images: z.array(z.string()).optional(), // массив base64 изображений
  type: z.literal('fraud-detector'),
  locale: z.enum(['en', 'ru', 'lv']).optional().default('en')
});

export type FraudDetectorDto = z.infer<typeof FraudDetectorSchema>;
