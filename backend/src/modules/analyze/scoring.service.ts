import { Injectable } from '@nestjs/common';

interface Factor {
  name: string;
  value: number;
  weight: number;
  evidence: string;
  description?: string;
}

interface ScoringResult {
  baseScore: number;
  category: string;
  confidence: number;
}

@Injectable()
export class ScoringService {
  private weights = {
    infrastructure: 0.35,
    reputation: 0.35,
    content: 0.30,
  };

  computeFactors(signals: any): Factor[] {
    const factors: Factor[] = [];

    // Infrastructure factors
    const domainAgeDays = signals?.whois?.ageDays ?? null;
    if (domainAgeDays !== null) {
      const value = domainAgeDays < 7 ? 0.8 : domainAgeDays < 30 ? 0.4 : domainAgeDays < 180 ? 0.1 : 0.02;
      factors.push({
        name: 'domain_age',
        value,
        weight: 0.12,
        evidence: `~${domainAgeDays} days`,
        description: 'Domain age - newer domains are more suspicious'
      });
    }

    const sslValid = signals?.page?.sslValid ?? true;
    factors.push({
      name: 'ssl_valid',
      value: sslValid ? 0.05 : 0.9, // SSL valid = очень низкий риск (5%), SSL invalid = очень высокий риск (90%)
      weight: 0.15, // Увеличиваем вес SSL
      evidence: sslValid ? 'valid' : 'invalid',
      description: 'SSL certificate validity'
    });

    // Reputation factors
    const gsbHit = !!signals?.gsb?.malicious;
    factors.push({
      name: 'gsb',
      value: gsbHit ? 1 : 0,
      weight: 0.15,
      evidence: gsbHit ? signals.gsb.reason : 'clean',
      description: 'Google Safe Browsing check'
    });

    const vtPositives = signals?.vt?.positives ?? 0;
    const vtTotal = signals?.vt?.total ?? 1;
    const vtValue = Math.max(0, Math.min(1, vtPositives / Math.max(vtTotal, 5)));
    factors.push({
      name: 'virustotal',
      value: vtValue,
      weight: 0.15,
      evidence: `${vtPositives}/${vtTotal} engines`,
      description: 'VirusTotal scan results'
    });

    // Content factors
    const hasForms = !!signals?.page?.hasForms;
    factors.push({
      name: 'forms_present',
      value: hasForms ? 0.15 : 0.02, // Формы = низкий риск (15%), нет форм = очень низкий риск (2%)
      weight: 0.10,
      evidence: hasForms ? 'form(s) detected' : 'none',
      description: 'Presence of input forms'
    });

    const words = signals?.page?.wordsCount ?? 0;
    const thin = words < 30 ? 0.3 : words < 100 ? 0.1 : 0.02; // Еще более мягкие пороги
    factors.push({
      name: 'content_thin',
      value: thin,
      weight: 0.08,
      evidence: `${words} words`,
      description: 'Content quality assessment'
    });

    // Additional factors
    const suspiciousPatterns = signals?.page?.suspiciousPatterns ?? 0;
    factors.push({
      name: 'suspicious_patterns',
      value: Math.min(0.4, suspiciousPatterns / 8), // Еще более мягкая оценка подозрительных паттернов
      weight: 0.05,
      evidence: `${suspiciousPatterns} patterns found`,
      description: 'Suspicious content patterns'
    });

    const waybackData = signals?.wayback;
    if (waybackData?.available) {
      const daysSince = waybackData.daysSinceSnapshot ?? 0;
      const waybackValue = daysSince < 30 ? 0.3 : daysSince < 365 ? 0.1 : 0.05;
      factors.push({
        name: 'wayback_history',
        value: waybackValue,
        weight: 0.03,
        evidence: `${daysSince} days since first seen`,
        description: 'Wayback Machine history'
      });
    }

    return factors;
  }

  aggregate(factors: Factor[]): ScoringResult {
    // Group factors by category
    const infra = factors
      .filter(f => ['domain_age', 'ssl_valid'].includes(f.name))
      .reduce((s, f) => s + f.value * f.weight, 0);

    const rep = factors
      .filter(f => ['gsb', 'virustotal'].includes(f.name))
      .reduce((s, f) => s + f.value * f.weight, 0);

    const cont = factors
      .filter(f => ['forms_present', 'content_thin', 'suspicious_patterns', 'wayback_history'].includes(f.name))
      .reduce((s, f) => s + f.value * f.weight, 0);

    // Calculate weighted score
    const totalWeight = this.weights.infrastructure + this.weights.reputation + this.weights.content;
    const baseScore = Math.round(((infra + rep + cont) / totalWeight) * 100);

    // Calculate confidence based on signal quality
    const signalsCount = factors.length;
    const dispersion = Math.max(...factors.map(f => f.value)) - Math.min(...factors.map(f => f.value));
    const confidence = Math.max(40, Math.min(95, 70 + signalsCount * 2 - dispersion * 10));

    const category = this.categorize(baseScore);

    return { baseScore, category, confidence };
  }

  categorize(score: number): string {
    if (score >= 80) return 'High';
    if (score >= 40) return 'Medium';
    return 'Low';
  }
}
