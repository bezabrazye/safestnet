# SafeNet - AI-Powered Scam Detection

AI-powered platform for analyzing URLs, news, and content to detect potential scams, phishing, and misinformation.

## 🚀 Features

- **URL Analysis**: Real-time scanning of websites for potential threats
- **AI-Powered Scoring**: Scam risk assessment from 0-100 with confidence levels
- **Multi-language Support**: EN/RU/LV interface
- **Comprehensive Reports**: Detailed analysis with factors, recommendations, and evidence
- **Real-time Security Checks**: Integration with Google Safe Browsing, VirusTotal, and other security databases

## 🏗️ Architecture

```
├── backend/          # NestJS API server
│   ├── src/
│   │   ├── modules/
│   │   │   └── analyze/    # Analysis logic
│   │   └── main.ts
│   ├── sql/          # Database migrations
│   └── docker-compose.yml
└── frontend/         # Next.js web app
    ├── src/
    │   └── app/      # App Router pages
    └── package.json
```

## 🛠️ Setup

### Prerequisites

- Node.js 18+ and npm
- Docker (optional, for database)
- OpenAI API key

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Add your OpenAI API key to .env
OPENAI_API_KEY=sk-your-key-here

# Optional: Start database with Docker
docker compose up -d

# Run database migrations (if using PostgreSQL)
npm run db:migrate

# Start development server
npm run start:dev
```

Backend will run on http://localhost:8080

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on http://localhost:3000

## 📋 API Endpoints

### POST /analyze/url
Analyze a URL for potential scams and security threats.

**Request:**
```json
{
  "url": "https://example.com",
  "locale": "en",
  "deviceFingerprint": "optional",
  "userId": "optional"
}
```

**Response:**
```json
{
  "id": "uuid",
  "scamRate": 25,
  "category": "Low",
  "confidence": 85,
  "summary": "This appears to be a legitimate website with no significant red flags.",
  "explanation": {
    "factors": [
      {
        "name": "domain_age",
        "value": 0.1,
        "weight": 0.12,
        "evidence": "~2847 days"
      }
    ],
    "sources": [],
    "recommendations": [
      "The website appears legitimate, but always verify important information",
      "Check for HTTPS encryption before entering sensitive data"
    ]
  }
}
```

### GET /analyze/:id
Retrieve analysis result by ID.

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
- `OPENAI_API_KEY` - Required for AI analysis
- `GSB_API_KEY` - Google Safe Browsing API key
- `VIRUSTOTAL_API_KEY` - VirusTotal API key
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default: 8080)

### Security Integrations

The system integrates with multiple security services:

- **OpenAI GPT-4o-mini**: AI-powered content analysis
- **Google Safe Browsing**: Malware and phishing detection
- **VirusTotal**: Multi-engine URL scanning
- **WHOIS/DNS**: Domain reputation and age verification
- **Wayback Machine**: Historical domain analysis

## 🎯 Scoring Algorithm

The scam risk score (0-100) is calculated using weighted factors:

- **Infrastructure (35%)**: Domain age, SSL certificate, DNS configuration
- **Reputation (35%)**: Security database listings, IP reputation
- **Content (30%)**: Page content analysis, forms detection, suspicious patterns

Categories:
- **Low Risk**: 0-29 points
- **Medium Risk**: 30-69 points  
- **High Risk**: 70-100 points

## 🚦 Usage Limits (Planned)

- **Free**: 6 analyses per device per day
- **Pro ($19.99/month)**: 60 analyses per day + extended history

## 🔮 Roadmap

### v1.0 (Current)
- ✅ URL analysis
- ✅ Basic web interface
- ✅ AI-powered scoring

### v1.5 (Next)
- 📋 Screenshot analysis with OCR
- 📋 User authentication
- 📋 Analysis history
- 📋 Rate limiting

### v2.0 (Future)
- 📋 Video analysis with transcription
- 📋 Mobile app
- 📋 Browser extension
- 📋 Team/organization features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## ⚠️ Disclaimer

SafeNet provides automated analysis for informational purposes only. Always verify important information through official sources. The service is not responsible for financial or other losses resulting from reliance on the analysis.
