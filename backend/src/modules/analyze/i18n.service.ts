export type Language = 'en' | 'ru' | 'lv';

interface SignalTranslations {
  verdict: string;
  domainAge: string;
  sslValid: string;
  sslInvalid: string;
  sslValidStatus: string;
  sslInvalidStatus: string;
  gsbClean: string;
  gsbThreat: string;
  gsbCleanStatus: string;
  gsbThreatStatus: string;
  vtEngines: string;
  formsFound: string;
  formsNotFound: string;
  formsFoundStatus: string;
  formsNotFoundStatus: string;
  contentWords: string;
  patternsFound: string;
  patternsNotFound: string;
  patternsFoundStatus: string;
  patternsNotFoundStatus: string;
  waybackFound: string;
  waybackNotFound: string;
  waybackFoundStatus: string;
  waybackNotFoundStatus: string;
  spfPresent: string;
  spfMissing: string;
  dmarcPresent: string;
  dmarcMissing: string;
  emailAuthDescription: string;
  brandImpersonation: string;
  suspiciousDomain: string;
  trackingParams: string;
  trackingParamsFound: string;
  suspiciousRegistrar: string;
  days: string;
  words: string;
  engines: string;
  domainAgeDescription: string;
  sslDescription: string;
  gsbDescription: string;
  vtDescription: string;
  formsDescription: string;
  contentDescription: string;
  patternsDescription: string;
  waybackDescription: string;
  brandDescription: string;
  domainDescription: string;
  trackingDescription: string;
  registrarDescription: string;
  gsb: string;
  vt: string;
  registrar: string;
}

const translations: Record<Language, SignalTranslations> = {
  en: {
    verdict: 'Verdict',
    domainAge: 'Domain Age',
    sslValid: 'SSL valid',
    sslInvalid: 'SSL missing/invalid',
    sslValidStatus: 'valid',
    sslInvalidStatus: 'missing',
    gsbClean: 'no threats found',
    gsbThreat: 'threat detected',
    gsbCleanStatus: 'clean',
    gsbThreatStatus: 'threats detected',
    vtEngines: 'engines',
    formsFound: 'forms found',
    formsNotFound: 'no forms',
    formsFoundStatus: 'input forms present',
    formsNotFoundStatus: 'no forms detected',
    contentWords: 'words',
    patternsFound: 'triggers found',
    patternsNotFound: 'no suspicious triggers found',
    patternsFoundStatus: 'matches found',
    patternsNotFoundStatus: 'no matches found',
    waybackFound: 'archive found',
    waybackNotFound: 'archive not found',
    waybackFoundStatus: 'snapshots present',
    waybackNotFoundStatus: 'snapshots missing',
    spfPresent: 'SPF',
    spfMissing: 'SPF missing',
    dmarcPresent: 'DMARC',
    dmarcMissing: 'DMARC missing',
    emailAuthDescription: 'Email authentication',
    brandImpersonation: 'suspected brand impersonation',
    suspiciousDomain: 'suspicious domain patterns',
    trackingParams: 'tracking parameters detected',
    trackingParamsFound: 'tracking parameters found',
    suspiciousRegistrar: 'suspicious registrar',
    days: 'days',
    words: 'words',
    engines: 'engines',
    domainAgeDescription: 'We checked the domain age via WHOIS.',
    sslDescription: 'Checked via https scheme and server responses.',
    gsbDescription: 'Google Safe Browsing database check.',
    vtDescription: 'VirusTotal multi-engine scan results.',
    formsDescription: 'Form detection analysis.',
    contentDescription: 'Page content analysis.',
    patternsDescription: 'Suspicious pattern detection.',
    waybackDescription: 'Wayback Machine archive check.',
    brandDescription: 'Brand impersonation analysis.',
    domainDescription: 'Domain structure analysis.',
    trackingDescription: 'Tracking parameters analysis.',
    registrarDescription: 'Domain registrar analysis.',
    gsb: 'Google Safe Browsing',
    vt: 'VirusTotal',
    registrar: 'Registrar'
  },
  ru: {
    verdict: 'Вердикт',
    domainAge: 'Возраст домена',
    sslValid: 'SSL валиден',
    sslInvalid: 'SSL отсутствует/недействителен',
    sslValidStatus: 'валиден',
    sslInvalidStatus: 'отсутствует',
    gsbClean: 'угроз не найдено',
    gsbThreat: 'угроза обнаружена',
    gsbCleanStatus: 'чисто',
    gsbThreatStatus: 'обнаружены угрозы',
    vtEngines: 'движков',
    formsFound: 'формы найдены',
    formsNotFound: 'форм нет',
    formsFoundStatus: 'есть формы ввода',
    formsNotFoundStatus: 'формы не обнаружены',
    contentWords: 'слов',
    patternsFound: 'найдены триггеры',
    patternsNotFound: 'подозрительных триггеров не найдено',
    patternsFoundStatus: 'найдено совпадений',
    patternsNotFoundStatus: 'совпадений не найдено',
    waybackFound: 'архив найден',
    waybackNotFound: 'архив не найден',
    waybackFoundStatus: 'снимки присутствуют',
    waybackNotFoundStatus: 'снимки отсутствуют',
    spfPresent: 'SPF',
    spfMissing: 'SPF отсутствует',
    dmarcPresent: 'DMARC',
    dmarcMissing: 'DMARC отсутствует',
    emailAuthDescription: 'Email-аутентификация',
    brandImpersonation: 'подозрение на подделку бренда',
    suspiciousDomain: 'подозрительные паттерны в домене',
    trackingParams: 'обнаружены трекинговые параметры',
    trackingParamsFound: 'обнаружены трекинговые параметры',
    suspiciousRegistrar: 'подозрительный регистратор',
    days: 'дней',
    words: 'слов',
    engines: 'движков',
    domainAgeDescription: 'Мы проверили возраст домена через WHOIS.',
    sslDescription: 'Проверено по схеме https и ответам сервера.',
    gsbDescription: 'Проверка в базе Google Safe Browsing.',
    vtDescription: 'Результаты сканирования VirusTotal.',
    formsDescription: 'Анализ наличия форм ввода.',
    contentDescription: 'Анализ содержимого страницы.',
    patternsDescription: 'Поиск подозрительных паттернов.',
    waybackDescription: 'Проверка архива Wayback Machine.',
    brandDescription: 'Анализ подделки бренда.',
    domainDescription: 'Анализ структуры домена.',
    trackingDescription: 'Анализ трекинговых параметров.',
    registrarDescription: 'Анализ регистратора домена.',
    gsb: 'Google Safe Browsing',
    vt: 'VirusTotal',
    registrar: 'Регистратор'
  },
  lv: {
    verdict: 'Spriedums',
    domainAge: 'Domēna vecums',
    sslValid: 'SSL derīgs',
    sslInvalid: 'SSL trūkst/nederīgs',
    sslValidStatus: 'derīgs',
    sslInvalidStatus: 'trūkst',
    gsbClean: 'draudi nav atrasti',
    gsbThreat: 'drauds atklāts',
    gsbCleanStatus: 'tīrs',
    gsbThreatStatus: 'draudi atklāti',
    vtEngines: 'dzinēji',
    formsFound: 'formas atrastas',
    formsNotFound: 'nav formu',
    formsFoundStatus: 'ievades formas ir',
    formsNotFoundStatus: 'formas nav atrastas',
    contentWords: 'vārdi',
    patternsFound: 'trigeri atrasti',
    patternsNotFound: 'aizdomīgi trigeri nav atrasti',
    patternsFoundStatus: 'sakritības atrastas',
    patternsNotFoundStatus: 'sakritības nav atrastas',
    waybackFound: 'arhīvs atrasts',
    waybackNotFound: 'arhīvs nav atrasts',
    waybackFoundStatus: 'momentuzņēmumi ir',
    waybackNotFoundStatus: 'momentuzņēmumi trūkst',
    spfPresent: 'SPF',
    spfMissing: 'SPF trūkst',
    dmarcPresent: 'DMARC',
    dmarcMissing: 'DMARC trūkst',
    emailAuthDescription: 'E-pasta autentifikācija',
    brandImpersonation: 'aizdoms par zīmola viltošanu',
    suspiciousDomain: 'aizdomīgi domēna modeļi',
    trackingParams: 'izsekošanas parametri atklāti',
    trackingParamsFound: 'izsekošanas parametri atrasti',
    suspiciousRegistrar: 'aizdomīgs reģistrators',
    days: 'dienas',
    words: 'vārdi',
    engines: 'dzinēji',
    domainAgeDescription: 'Mēs pārbaudījām domēna vecumu caur WHOIS.',
    sslDescription: 'Pārbaudīts caur https shēmu un servera atbildēm.',
    gsbDescription: 'Google Safe Browsing datubāzes pārbaude.',
    vtDescription: 'VirusTotal vairāku dzinēju skenēšanas rezultāti.',
    formsDescription: 'Formu noteikšanas analīze.',
    contentDescription: 'Lapas satura analīze.',
    patternsDescription: 'Aizdomīgu modeļu noteikšana.',
    waybackDescription: 'Wayback Machine arhīva pārbaude.',
    brandDescription: 'Zīmola viltošanas analīze.',
    domainDescription: 'Domēna struktūras analīze.',
    trackingDescription: 'Izsekošanas parametru analīze.',
    registrarDescription: 'Domēna reģistratora analīze.',
    gsb: 'Google Safe Browsing',
    vt: 'VirusTotal',
    registrar: 'Reģistrators'
  }
};

export class I18nService {
  getTranslations(language: Language): SignalTranslations {
    return translations[language] || translations.en;
  }

  t(language: Language, key: keyof SignalTranslations): string {
    const trans = this.getTranslations(language);
    return trans[key] || translations.en[key];
  }
}
