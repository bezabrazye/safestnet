import { z } from 'zod';

export const AnalyzeUrlSchema = z.object({
  url: z.string().url('Invalid URL format'),
  locale: z.enum(['en', 'ru', 'lv']).default('en'),
  deviceFingerprint: z.string().optional(),
  userId: z.string().optional(),
});

export type AnalyzeUrlDto = z.infer<typeof AnalyzeUrlSchema>;
