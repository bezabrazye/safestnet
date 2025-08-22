"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
require("dotenv/config");
const helmet_1 = __importDefault(require("helmet"));
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        cors: true,
    });
    // Security headers
    app.use((0, helmet_1.default)({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
            useDefaults: true,
            directives: {
                defaultSrc: ["'self'"],
                imgSrc: ["'self'", 'data:', 'https://api.qrserver.com'],
                scriptSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                connectSrc: ["'self'"],
                frameAncestors: ["'none'"],
            },
        } : false,
    }));
    // Увеличиваем лимит для body-parser до 10MB для поддержки больших изображений
    app.use(require('body-parser').json({ limit: '10mb' }));
    app.use(require('body-parser').urlencoded({ limit: '10mb', extended: true }));
    const port = process.env.PORT ? Number(process.env.PORT) : 8080;
    await app.listen(port);
    console.log(`🚀 SafeNet API listening on http://localhost:${port}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔑 OpenAI API: ${process.env.OPENAI_API_KEY ? 'Configured' : 'Not configured'}`);
    console.log(`🛡️ GSB API: ${process.env.GSB_API_KEY ? 'Configured' : 'Not configured'}`);
    console.log(`🔍 VirusTotal API: ${process.env.VIRUSTOTAL_API_KEY ? 'Configured' : 'Not configured'}`);
}
bootstrap();
