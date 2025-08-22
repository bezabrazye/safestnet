import { z } from 'zod';

export const MultimodalAnalyzeSchema = z.object({
  url: z.string().url('Invalid URL format').optional(),
  text: z.string().optional(),
  images: z.array(z.string()).optional(),
  videoFrames: z.array(z.string()).optional(),
  locale: z.enum(['en', 'ru', 'lv']).default('ru'),
  comment: z.string().optional(),
});

export type MultimodalAnalyzeDto = z.infer<typeof MultimodalAnalyzeSchema>;
