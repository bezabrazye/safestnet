# 🚀 SafeNet MVP - Setup Guide

Поздравляем! MVP приложения SafeNet готов к тестированию. Вот что было создано:

## ✅ Что работает

### Backend (NestJS)
- ✅ API endpoint `POST /analyze/url` для анализа URL
- ✅ API endpoint `GET /analyze/:id` для получения результатов
- ✅ Базовый скоринг (0-100) с категориями Low/Medium/High
- ✅ Анализ доменов, SSL, контента страниц
- ✅ Мультиязычные рекомендации (EN/RU/LV)
- ✅ Демо-режим без OpenAI (для тестирования)

### Frontend (Next.js)
- ✅ Главная страница с формой для ввода URL
- ✅ Страница результатов с детальным анализом
- ✅ Современный UI с Tailwind CSS
- ✅ Адаптивный дизайн

## 🏃‍♂️ Как запустить

### 1. Backend
```bash
cd backend
npm install
npm run start:dev
```
Backend будет доступен на http://localhost:8080

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend будет доступен на http://localhost:3000

## 🧪 Тестирование

### Тест API через PowerShell:
```powershell
$result = Invoke-WebRequest -Uri "http://localhost:8080/analyze/url" -Method POST -ContentType "application/json" -Body '{"url":"https://google.com","locale":"en"}'
$result.Content
```

### Тест через веб-интерфейс:
1. Откройте http://localhost:3000
2. Введите URL для анализа (например: https://google.com)
3. Нажмите "Analyze URL"
4. Посмотрите детальный отчет

## 🔧 Следующие шаги для продакшена

### Обязательно:
1. **Добавить реальный OpenAI API ключ** в `backend/.env`:
   ```
   OPENAI_API_KEY=sk-proj-your-real-key-here
   ```

2. **Настроить базу данных PostgreSQL**:
   ```bash
   cd backend
   docker compose up -d
   npm run db:migrate
   ```

3. **Добавить реальные API ключи** для security проверок:
   ```
   GSB_API_KEY=your-google-safe-browsing-key
   VIRUSTOTAL_API_KEY=your-virustotal-key
   ```

### Рекомендуется:
4. **Настроить CORS** для продакшена
5. **Добавить rate limiting** и квоты
6. **Настроить логирование** и мониторинг
7. **Добавить аутентификацию** пользователей

## 📊 Пример ответа API

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "scamRate": 18,
  "category": "Low",
  "confidence": 78,
  "summary": "Analysis of google.com shows low risk indicators...",
  "explanation": {
    "factors": [
      {
        "name": "domain_age",
        "value": 0.1,
        "weight": 0.12,
        "evidence": "~90 days"
      }
    ],
    "recommendations": [
      "Verify the website URL matches the official domain",
      "Check for HTTPS encryption before entering sensitive data"
    ]
  }
}
```

## 🔍 Архитектура

```
SafeNet MVP/
├── backend/           # NestJS API
│   ├── src/
│   │   ├── modules/analyze/    # Анализ URL
│   │   │   ├── signals/        # Сбор сигналов
│   │   │   ├── scoring.service # Скоринг
│   │   │   └── openai.service  # AI анализ
│   │   └── main.ts
│   └── sql/           # База данных
└── frontend/          # Next.js веб-приложение
    └── src/app/       # Страницы приложения
```

## 🎯 MVP функционал

- [x] Анализ URL с базовым скорингом
- [x] Веб-интерфейс для тестирования
- [x] Мультиязычность (EN/RU/LV)
- [x] Детальные отчеты с рекомендациями

## 🚧 В разработке (v1.5)

- [ ] Анализ скриншотов с OCR
- [ ] Аутентификация пользователей
- [ ] История анализов
- [ ] Квоты и подписки
- [ ] Реальные интеграции с security API

Приложение готово к демонстрации и дальнейшей разработке! 🎉
