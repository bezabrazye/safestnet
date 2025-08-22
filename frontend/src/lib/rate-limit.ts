import { NextRequest } from 'next/server';
import crypto from 'crypto';

// In-memory store для rate limiting (в продакшене использовать Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 6,
  windowMs: 6 * 60 * 60 * 1000, // 6 часов
};

export function getClientIdentifier(req: NextRequest): string {
  // Получаем IP адрес
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
             req.headers.get('x-real-ip') || 
             'unknown';
  
  // Получаем User-Agent для идентификации железа
  const userAgent = req.headers.get('user-agent') || 'unknown';
  
  // Создаем уникальный идентификатор на основе IP и User-Agent
  const identifier = crypto
    .createHash('sha256')
    .update(`${ip}-${userAgent}`)
    .digest('hex');
  
  return identifier;
}

export function checkRateLimit(
  req: NextRequest, 
  config: RateLimitConfig = DEFAULT_CONFIG
): { allowed: boolean; remaining: number; resetTime: number } {
  const identifier = getClientIdentifier(req);
  const now = Date.now();
  
  const current = rateLimitStore.get(identifier);
  
  if (!current || now > current.resetTime) {
    // Первый запрос или окно сброшено
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    };
  }
  
  if (current.count >= config.maxRequests) {
    // Лимит превышен
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.resetTime,
    };
  }
  
  // Увеличиваем счетчик
  current.count++;
  rateLimitStore.set(identifier, current);
  
  return {
    allowed: true,
    remaining: config.maxRequests - current.count,
    resetTime: current.resetTime,
  };
}

// Очистка старых записей каждые 10 минут
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 10 * 60 * 1000);
