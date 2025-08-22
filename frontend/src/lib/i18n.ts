export type Language = 'en' | 'ru' | 'lv';

export interface Translations {
  // Общие элементы
  common: {
    loading: string;
    error: string;
    notFound: string;
    backToHome: string;
    save: string;
    cancel: string;
    submit: string;
    close: string;
    next: string;
    previous: string;
    download: string;
    upload: string;
    search: string;
    filter: string;
    sort: string;
    refresh: string;
    settings: string;
    help: string;
    about: string;
    contact: string;
    privacy: string;
    terms: string;
    language: string;
  };

  // Навигация
  navigation: {
    home: string;
    newAnalysis: string;
    otherAnalyses: string;
    downloadAnalysis: string;
    urlScanner: string;
    factChecker: string;
    dataChecker: string;
    fraudDetector: string;
  };

  // Главная страница
  home: {
    title: string;
    subtitle: string;
    description: string;
    urlPlaceholder: string;
    textPlaceholder: string;
    imagePlaceholder: string;
    phonePlaceholder: string;
    emailPlaceholder: string;
    namePlaceholder: string;
    companyPlaceholder: string;
    addressPlaceholder: string;
    socialMediaPlaceholder: string;
    situationPlaceholder: string;
    analyzeButton: string;
    disclaimer: string;
    thankYouButton: string;
    sendReport: string;
    // Дополнительные поля
    beta: string;
    urlScannerBeta: string;
    comingSoonBanner: string;
    comingSoonButton: string;
    comingSoonModalTitle: string;
    comingSoonModalMessage: string;
    comingSoonModalButton: string;
    urlHelp: string;
    factCheckTitle: string;
    factCheckDescription: string;
    factCheckPlaceholder: string;
    dataCheckTitle: string;
    dataCheckDescription: string;
    fraudDetectorTitle: string;
    fraudDetectorDescription: string;
    fraudDetectorPlaceholder: string;
    whatAnalyzes: string;
    whatWeCheck: string;
    urlScannerWhatWeCheck: string;
    analyzeFraudButton: string;
    resultsDisclaimer: string;
    // Формы
    factDescription: string;
    factDescriptionHelp: string;
    factImage: string;
    factImageHelp: string;
    imagePreview: string;
    checkFacts: string;
    checkingFacts: string;
    dataSearch: string;
    dataSearchHelp: string;
    startSearch: string;
    searchingInfo: string;
    fraudAnalysis: string;
    situationDescription: string;
    situationDescriptionHelp: string;
    fraudAnalysisHelp: string;
    analyzingFraud: string;
    // Features section - URL Scanner
    domainReputation: string;
    domainReputationDesc: string;
    tlsSsl: string;
    tlsSslDesc: string;
    contentRisks: string;
    contentRisksDesc: string;
    databaseMatching: string;
    databaseMatchingDesc: string;
    // Features section - Fact Checker
    factCheckFeatures: {
      truthfulnessRating: string;
      truthfulnessRatingDesc: string;
      sourcesQuotes: string;
      sourcesQuotesDesc: string;
      contextChronology: string;
      contextChronologyDesc: string;
      manipulationDetection: string;
      manipulationDetectionDesc: string;
    };
    // Features section - Data Checker
    dataCheckFeatures: {
      contactsCheck: string;
      contactsCheckDesc: string;
      personsProfiles: string;
      personsProfilesDesc: string;
      companiesOrganizations: string;
      companiesOrganizationsDesc: string;
      relatedEntities: string;
      relatedEntitiesDesc: string;
    };
    // Features section - Fraud Detector
    fraudDetectorFeatures: {
      phishingSignals: string;
      phishingSignalsDesc: string;
      financialRisks: string;
      financialRisksDesc: string;
      requisitesCheck: string;
      requisitesCheckDesc: string;
      practicalSteps: string;
      practicalStepsDesc: string;
    };
  };

  // Результаты анализа
  results: {
    // Заголовки
    securityIndex: string;
    truthfulness: string;
    dataRiskIndex: string;
    fraudIndex: string;
    
    // Уровни
    highTrust: string;
    mediumTrust: string;
    lowTrust: string;
    highTruthfulness: string;
    mediumTruthfulness: string;
    lowTruthfulness: string;
    lowRisk: string;
    mediumRisk: string;
    highRisk: string;
    safe: string;
    suspicious: string;
    dangerous: string;
    
    // Прогресс-бары
    lowTrustLabel: string;
    highTrustLabel: string;
    completeLie: string;
    pureTruth: string;
    highRiskLabel: string;
    lowRiskLabel: string;
    dangerousLabel: string;
    safeLabel: string;
    
    // Секции
    recommendations: string;
    riskFactors: string;
    truthFactors: string;
    foundInformation: string;
    fraudSigns: string;
    sources: string;
    feedback: string;
    rateResult: string;
    correct: string;
    incorrect: string;
    thankYouFeedback: string;
    feedbackError: string;
    networkError: string;
    
    // Общие
    confidence: string;
    outOf: string;
    noFactorsAvailable: string;
    noSourcesAvailable: string;
    
    // Дополнительные переводы для результатов
    loadingResults: string;
    errorTitle: string;
    resultNotFound: string;
    whatWeChecked: string;
    securitySources: string;
    extractedArtifacts: string;
    imageAnalysis: string;
    visualAnomalies: string;
    detectedUrls: string;
    feedbackTitle: string;
    feedbackSubtitle: string;
    yes: string;
    no: string;
    disclaimer: string;
    newAnalysis: string;
    otherAnalyses: string;
    downloadPdf: string;
    image: string;
    domains: string;
    emails: string;
    cryptoWallets: string;
    urls: string;
    verdict: string;
    sourcesTitle: string;
    missingDataNegativeImpact: string;
    mainContent: string;
    check: string;
    moreDetails: string;
    details: string;
    
    // Переводы для вердиктов
    engines: string;
    threats: string;
    detections: string;
    verdictSources: string;
    days: string;
    years: string;
    months: string;
    
    // SSL и безопасность
    sslMissing: string;
    sslInvalid: string;
    notFound: string;
    found: string;
    detected: string;
    
    // Переводы для проверок безопасности
    domainAgeCheck: string;
    sslValidCheck: string;
    gsbCheck: string;
    virusTotalCheck: string;
    formsCheck: string;
    contentQualityCheck: string;
    suspiciousPatternsCheck: string;
    waybackHistoryCheck: string;
    dnsEmailAuthCheck: string;
    brandImpersonationCheck: string;
    suspiciousDomainCheck: string;
    trackingParamsCheck: string;
    suspiciousRegistrarCheck: string;
    genericSecurityCheck: string;
    domainAgeOld: string;
    domainAgeNew: string;
    domainAgeDetails: string;
    
  };

  // Limit modal
  limitModal: {
    title: string;
    message: string;
    button: string;
  };

  // Формы анализа
  analysis: {
    urlScanner: {
      title: string;
      description: string;
      placeholder: string;
    };
    factChecker: {
      title: string;
      description: string;
      textPlaceholder: string;
      imagePlaceholder: string;
    };
    dataChecker: {
      title: string;
      description: string;
      phoneLabel: string;
      emailLabel: string;
      nameLabel: string;
      companyLabel: string;
      addressLabel: string;
      socialMediaLabel: string;
      atLeastOneField: string;
    };
    fraudDetector: {
      title: string;
      description: string;
      situationPlaceholder: string;
      imagePlaceholder: string;
    };
  };

  // Ошибки
  errors: {
    networkError: string;
    serverError: string;
    validationError: string;
    fileTooLarge: string;
    invalidFileType: string;
    requiredField: string;
    invalidEmail: string;
    invalidUrl: string;
    atLeastOneField: string;
  };

  // Donate page
  donate: {
    title: string;
    subtitle: string;
    nonprofitNote: string;
    redirectNote: string;
    cryptoTitle: string;
    stripeLabel: string;
    cryptoButton: string;
    cryptoToggleButton: string;
    copy: string;
    copied: string;
    showQr: string;
    hideQr: string;
    cardButton: string;
    supportedMethods: string;
  };

  // Report page
  report: {
    title: string;
    intro: string;
    nameLabel: string;
    emailLabel: string;
    messageLabel: string;
    addPhotoLabel: string;
    submitButton: string;
    sentStatus: string;
    errorStatus: string;
    networkStatus: string;
    imagesOnlyError: string;
  };

  // Admin panel
  admin: {
    statistics: string;
    siteStatistics: string;
    daily: string;
    weekly: string;
    monthly: string;
    totalVisits: string;
    uniqueVisits: string;
    scansConducted: string;
    positiveFeedback: string;
    negativeFeedback: string;
    reports: string;
    feedbacks: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    common: {
      loading: 'Loading...',
      error: 'Error',
      notFound: 'Not Found',
      backToHome: 'Back to Home',
      save: 'Save',
      cancel: 'Cancel',
      submit: 'Submit',
      close: 'Close',
      next: 'Next',
      previous: 'Previous',
      download: 'Download',
      upload: 'Upload',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      refresh: 'Refresh',
      settings: 'Settings',
      help: 'Help',
      about: 'About',
      contact: 'Contact',
      privacy: 'Privacy',
      terms: 'Terms',
      language: 'Language',
    },
    navigation: {
      home: 'Home',
      newAnalysis: 'New Analysis',
      otherAnalyses: 'Other Analyses',
      downloadAnalysis: 'Download Analysis (.pdf)',
      urlScanner: 'URL Scanner',
      factChecker: 'Fact Checker',
      dataChecker: 'Data Checker',
      fraudDetector: 'Fraud Detector',
    },
    home: {
      title: 'SafestNet',
      subtitle: 'AI-powered URL, content and news analysis for fraud and disinformation detection',
      description: 'Advanced AI analytics for URL, content and news analysis to detect fraud and disinformation',
      urlPlaceholder: 'Enter URL to analyze...',
      textPlaceholder: 'Enter text to fact-check...',
      imagePlaceholder: 'Upload image (optional)',
      phonePlaceholder: 'Phone number',
      emailPlaceholder: 'Email address',
      namePlaceholder: 'Full name',
      companyPlaceholder: 'Company name',
      addressPlaceholder: 'Address',
      socialMediaPlaceholder: 'Social media profile',
      situationPlaceholder: 'Describe the situation in detail...',
      analyzeButton: 'Analyze',
      disclaimer: 'This tool is for educational purposes only. Always verify critical information through official sources.',
      thankYouButton: 'Support us',
      sendReport: 'Send Report',
      beta: 'DEMO',
      urlScannerBeta: 'BETA',
      comingSoonBanner: 'Coming soon... Our developers are working hard!\n\nSupport project with donations so we will speed up',
      comingSoonButton: 'Coming Soon...',
      comingSoonModalTitle: 'Patience, my friend!',
      comingSoonModalMessage: 'Our developers are working day and night so you can try our products ASAP!',
      comingSoonModalButton: 'Got it!',
      urlHelp: 'Enter the full address (including https://). We do not save submitted URLs.',
      factCheckTitle: 'Fact and News Check',
      factCheckDescription: 'Verify facts and news for accuracy',
      factCheckPlaceholder: 'Describe the fact, news, or claim you want to verify...',
      dataCheckTitle: 'Data Check',
      dataCheckDescription: 'Check personal and company data',
      fraudDetectorTitle: 'Fraud Detector',
      fraudDetectorDescription: 'Detect potential fraud and scams',
      fraudDetectorPlaceholder: 'Describe the situation in detail...',
      whatAnalyzes: '🔍 What is analyzed: AI will check the situation for signs of fraud, give a verdict (scam or not) and provide practical advice for verification.',
      whatWeCheck: 'What we will check',
      urlScannerWhatWeCheck: 'What we check',
      analyzeFraudButton: 'Check for Fraud',
      resultsDisclaimer: 'Results are for reference only and do not constitute legal advice.',
      // Формы
      factDescription: 'Fact or news description',
      factDescriptionHelp: 'Describe in detail: where you heard it, from whom, context of the situation',
      factImage: 'Image (optional)',
      factImageHelp: 'Maximum 1 photo, up to 5MB. May contain screenshot, image with text, etc.',
      imagePreview: 'Image preview:',
      checkFacts: 'Check facts',
      checkingFacts: 'Checking facts...',
      dataSearch: 'Information search',
      dataSearchHelp: '💡 Tip: Fill in at least one field. The more data you provide, the more accurate the search will be. AI will conduct a detailed search across the internet and find all available information.',
      startSearch: 'Start search',
      searchingInfo: 'Searching for information...',
      fraudAnalysis: 'Fraud analysis',
      situationDescription: 'Situation description',
      situationDescriptionHelp: 'The more detailed you describe, the more accurate the analysis will be. Specify context, details, suspicious moments',
          fraudAnalysisHelp: '🔍 What is analyzed: AI will check the situation for signs of fraud, give a verdict (scam or not) and provide practical advice for verification.',
    analyzingFraud: 'Analyzing fraud...',
    // Features section
    domainReputation: 'Domain Reputation',
    domainReputationDesc: 'Age, DNS, blacklists, resolvers, parking/phishing patterns.',
    tlsSsl: 'TLS/SSL',
    tlsSslDesc: 'Certificate, ciphers, HSTS, http→https redirects.',
    contentRisks: 'Content Risks',
    contentRisksDesc: 'Suspicious lexicon, fake CTAs, copy-pastes, spelling.',
          databaseMatching: 'Database Matching',
      databaseMatchingDesc: 'Phishing/fraud databases, spam indices, community reports.',
      // Features section - Fact Checker
      factCheckFeatures: {
        truthfulnessRating: 'Truthfulness Rating',
        truthfulnessRatingDesc: 'Truthfulness score, confidence level and brief verdict based on analysis results.',
        sourcesQuotes: 'Sources & Quotes',
        sourcesQuotesDesc: 'Search for primary sources (official statements, documents, verified media), comparison of quotes and links.',
        contextChronology: 'Context & Chronology',
        contextChronologyDesc: 'When, where and by whom stated; background and story development; identification of temporal inconsistencies.',
        manipulationDetection: 'Manipulation Detection',
        manipulationDetectionDesc: 'Clickbait, logical errors, emotional triggers, photos/videos taken out of context.',
      },
      // Features section - Data Checker
      dataCheckFeatures: {
        contactsCheck: 'Contacts (phone, e-mail)',
        contactsCheckDesc: 'Format validation, reputation check (spam/abuse), leaks, ownership and mentions in open sources.',
        personsProfiles: 'Persons & Profiles',
        personsProfilesDesc: 'Matches by full name/nicknames, social networks, public biographies and digital footprints.',
        companiesOrganizations: 'Companies & Organizations',
        companiesOrganizationsDesc: 'Government registries, founders, addresses, licenses, court records, identifiers (TIN/reg-numbers — where legal).',
        relatedEntities: 'Related Entities',
        relatedEntitiesDesc: 'Domains, IP, whois, SSL certificates, account and site bundles, source intersections.',
      },
      // Features section - Fraud Detector
      fraudDetectorFeatures: {
        phishingSignals: 'Phishing Signals',
        phishingSignalsDesc: 'Domain spoofing, urgency, payment/data requests, suspicious attachments/links.',
        financialRisks: 'Financial Risks',
        financialRisksDesc: 'Prepayment schemes, card/crypto transfers, escrow/delivery fraud, refund and chargeback risks.',
        requisitesCheck: 'Requisites Check',
        requisitesCheckDesc: 'IBAN/BIC/account validation, tracking and QR-code verification (without storing personal data).',
        practicalSteps: 'Practical Steps',
        practicalStepsDesc: 'Checklists for seller/buyer/store, response templates and action plan for high risk situations.',
      },
  },
    results: {
      securityIndex: 'Security and Trust Index',
      truthfulness: 'Truthfulness',
      dataRiskIndex: 'Data Risk Index',
      fraudIndex: 'Fraud Index',
      highTrust: 'High Trust Level',
      mediumTrust: 'Medium Trust Level',
      lowTrust: 'Low Trust Level',
      highTruthfulness: 'High Truthfulness',
      mediumTruthfulness: 'Medium Truthfulness',
      lowTruthfulness: 'Low Truthfulness',
      lowRisk: 'Low Risk',
      mediumRisk: 'Medium Risk',
      highRisk: 'High Risk',
      safe: 'Safe',
      suspicious: 'Suspicious',
      dangerous: 'Dangerous',
      lowTrustLabel: 'Low Trust Level',
      highTrustLabel: 'High Trust Level',
      completeLie: 'Complete Lie',
      pureTruth: 'Pure Truth',
      highRiskLabel: 'High Risk',
      lowRiskLabel: 'Low Risk',
      dangerousLabel: 'Dangerous',
      safeLabel: 'Safe',
      recommendations: '🛡️ Recommendations',
      riskFactors: 'Risk Factors',
      truthFactors: 'Truth Factors',
      foundInformation: 'Found Information',
      fraudSigns: 'Fraud Signs',
      sources: 'Sources',
      feedback: 'Rate Result',
      rateResult: 'Rate Result',
      correct: '👍 Correct',
      incorrect: '👎 Incorrect',
      thankYouFeedback: 'Thank you for your feedback!',
      feedbackError: 'Failed to send feedback.',
      networkError: 'Network error while sending feedback.',
      confidence: 'Confidence',
      outOf: 'out of',
      noFactorsAvailable: 'No factors available for display',
      noSourcesAvailable: 'No sources available',
      
      // Дополнительные переводы для результатов
      loadingResults: 'Loading analysis results...',
      errorTitle: 'Error',
      resultNotFound: 'Analysis result not found',
      whatWeChecked: 'What we checked?',
      securitySources: 'Security Sources',
      extractedArtifacts: 'Extracted Artifacts (IOC)',
      imageAnalysis: 'Image Analysis',
      visualAnomalies: 'Visual Anomalies',
      detectedUrls: 'Detected URLs',
      feedbackTitle: 'Feedback',
      feedbackSubtitle: 'Was this analysis helpful?',
      yes: 'Yes',
      no: 'No',
      disclaimer: 'Results are for reference only and do not constitute legal advice. Always verify critical information through official sources.',
      newAnalysis: 'New Analysis',
      otherAnalyses: 'Other Analyses',
      downloadPdf: 'Download Analysis (.pdf)',
      image: 'Image',
      domains: 'Domains',
      emails: 'Email addresses',
      cryptoWallets: 'Crypto Wallets',
      urls: 'URLs',
      verdict: 'Verdict',
      sourcesTitle: 'Sources',
      missingDataNegativeImpact: 'Data and links are missing; this negatively affects the score for this criterion.',
      mainContent: 'Go to main content',
      check: 'Check',
      moreDetails: 'More details',
      details: 'Details',
      
      // Переводы для вердиктов
      engines: 'engines',
      threats: 'threats',
      detections: 'detections',
      verdictSources: 'sources',
      days: 'days',
      years: 'years',
      months: 'months',
      
      // SSL и безопасность
      sslMissing: 'SSL missing',
      sslInvalid: 'SSL invalid',
      notFound: 'not found',
      found: 'found',
      detected: 'detected',
      
      // Переводы для проверок безопасности
      domainAgeCheck: 'We checked the domain age. Fraudsters often register domains very recently.',
      sslValidCheck: 'We checked the presence and correctness of SSL certificate (HTTPS). Missing or errors indicate an unsafe site.',
      gsbCheck: 'We queried the site status in Google Safe Browsing database for known threats and phishing.',
      virusTotalCheck: 'We checked the URL and domain reputation in VirusTotal - an aggregator of dozens of antivirus engines.',
      formsCheck: 'We checked for input forms (login, payment, registration) that fraudsters often use.',
      contentQualityCheck: 'We assessed the volume and quality of text on the page: short and template texts increase risk.',
      suspiciousPatternsCheck: 'We looked for suspicious patterns in content: words about payment, login, calls to action.',
      waybackHistoryCheck: 'We checked if the site exists in Wayback Machine archive. Lack of history may indicate newness.',
      dnsEmailAuthCheck: 'We checked SPF and DMARC DNS records - domain email authentication mechanisms.',
      brandImpersonationCheck: 'We checked for signs of brand impersonation in the domain and its variations.',
      suspiciousDomainCheck: 'We checked the domain zone and domain structure for suspicious signs (long/numeric patterns).',
      trackingParamsCheck: 'We checked the URL for multiple tracking parameters (utm, etc.).',
      suspiciousRegistrarCheck: 'We checked which registrar registered the domain and if there are signs of suspicious registrar.',
      genericSecurityCheck: 'We performed this check to assess site reliability by additional technical indicators.',
      domainAgeOld: 'which is a long time and increases trust in the site',
      domainAgeNew: 'which may indicate resource newness',
      domainAgeDetails: 'We checked the domain age through WHOIS and it is {days} days, {quality}.',
      

    },
    analysis: {
      urlScanner: {
        title: 'URL Scanner',
        description: 'Analyze URLs for security threats and fraud',
        placeholder: 'Enter URL to analyze...',
      },
      factChecker: {
        title: 'Fact Checker',
        description: 'Verify facts and news for accuracy',
        textPlaceholder: 'Enter text to fact-check...',
        imagePlaceholder: 'Upload image (optional)',
      },
      dataChecker: {
        title: 'Data Checker',
        description: 'Check personal and company data',
        phoneLabel: 'Phone Number',
        emailLabel: 'Email Address',
        nameLabel: 'Full Name',
        companyLabel: 'Company Name',
        addressLabel: 'Address',
        socialMediaLabel: 'Social Media Profile',
        atLeastOneField: 'Enter at least one type of data to check',
      },
      fraudDetector: {
        title: 'Fraud Detector',
        description: 'Detect potential fraud and scams',
        situationPlaceholder: 'Describe the situation in detail...',
        imagePlaceholder: 'Upload images (up to 3)',
      },
    },
    errors: {
      networkError: 'Network error',
      serverError: 'Server error',
      validationError: 'Validation error',
      fileTooLarge: 'File is too large',
      invalidFileType: 'Invalid file type',
      requiredField: 'This field is required',
      invalidEmail: 'Invalid email address',
      invalidUrl: 'Invalid URL',
      atLeastOneField: 'Enter at least one type of data to check',
    },
    donate: {
      title: 'Support SafestNet',
      subtitle: 'Your contribution helps us grow the project and protect more users.',
      nonprofitNote: 'We are a non-profit organization and do not earn from this project — we simply help people.',
      redirectNote: 'Choose a convenient donation method and you will be redirected for further instructions.',
      cryptoTitle: 'Crypto wallets',
      stripeLabel: 'Card payment',
      cryptoButton: 'Crypto',
      cryptoToggleButton: 'View wallets',
      copy: 'Copy',
      copied: 'Copied',
      showQr: 'Show QR',
      hideQr: 'Hide QR',
      cardButton: 'Donate by Card',
      supportedMethods: 'Supported payment methods:',
    },
    report: {
      title: 'Send a report',
      intro: 'Our project is in beta and may sometimes make mistakes. If you found an error or a bug, please tell us so we can fix it faster.',
      nameLabel: 'Your name:',
      emailLabel: 'Your e-mail:',
      messageLabel: 'Your message:',
      addPhotoLabel: 'Add a photo:',
      submitButton: 'Send message',
      sentStatus: 'Message sent',
      errorStatus: 'Sending failed',
      networkStatus: 'Network unavailable',
      imagesOnlyError: 'Only images are allowed',
    },
    limitModal: {
      title: 'Whoa, easy!',
      message: '3 feedbacks are more than enough for one analysis. Thank you!',
      button: 'Got it',
    },
    admin: {
      statistics: 'Statistics',
      siteStatistics: 'Site Statistics',
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      totalVisits: 'Total Visits',
      uniqueVisits: 'Unique Visits',
      scansConducted: 'Scans Conducted',
      positiveFeedback: 'Positive Feedback',
      negativeFeedback: 'Negative Feedback',
      reports: 'Reports',
      feedbacks: 'Feedbacks',
    },
  },
  ru: {
    common: {
      loading: 'Загрузка...',
      error: 'Ошибка',
      notFound: 'Не найдено',
      backToHome: 'Вернуться на главную',
      save: 'Сохранить',
      cancel: 'Отмена',
      submit: 'Отправить',
      close: 'Закрыть',
      next: 'Далее',
      previous: 'Назад',
      download: 'Скачать',
      upload: 'Загрузить',
      search: 'Поиск',
      filter: 'Фильтр',
      sort: 'Сортировка',
      refresh: 'Обновить',
      settings: 'Настройки',
      help: 'Помощь',
      about: 'О нас',
      contact: 'Контакты',
      privacy: 'Конфиденциальность',
      terms: 'Условия',
      language: 'Язык',
    },
    navigation: {
      home: 'Главная',
      newAnalysis: 'Новый анализ',
      otherAnalyses: 'Остальные анализы',
      downloadAnalysis: 'Скачать анализ (.pdf)',
      urlScanner: 'URL Сканер',
      factChecker: 'Проверить факты',
      dataChecker: 'Проверить данные',
      fraudDetector: 'Fraud Detector',
    },
    home: {
      title: 'SafestNet',
      subtitle: 'AI-аналитика URL, контента и новостей для выявления мошенничества и дезинформации',
      description: 'Продвинутая AI-аналитика URL, контента и новостей для выявления мошенничества и дезинформации',
      urlPlaceholder: 'Введите URL для анализа...',
      textPlaceholder: 'Введите текст для проверки фактов...',
      imagePlaceholder: 'Загрузить изображение (необязательно)',
      phonePlaceholder: 'Номер телефона',
      emailPlaceholder: 'Email адрес',
      namePlaceholder: 'Полное имя',
      companyPlaceholder: 'Название компании',
      addressPlaceholder: 'Адрес',
      socialMediaPlaceholder: 'Профиль в соцсетях',
      situationPlaceholder: 'Опишите ситуацию подробно...',
      analyzeButton: 'Анализировать',
      disclaimer: 'Этот инструмент предназначен только для образовательных целей. Всегда проверяйте критически важную информацию через официальные источники.',
      thankYouButton: 'Скажи спасибо',
      sendReport: 'Отправить отчёт',
      beta: 'DEMO',
      urlScannerBeta: 'BETA',
      comingSoonBanner: 'Скоро... Наши разработчики усердно работают!\n\nПоддержите проект пожертвованиями, чтобы мы ускорились',
      comingSoonButton: 'Coming Soon...',
      comingSoonModalTitle: 'Только терпение, друг мой!',
      comingSoonModalMessage: 'Наши разработчики работают днями и ночами, чтобы ты скорее мог испробовать наши продукты!',
      comingSoonModalButton: 'Понятно!',
      urlHelp: 'Вставьте полный адрес (включая https://). Мы не сохраняем отправленные URL.',
      factCheckTitle: 'Проверка фактов и новостей',
      factCheckDescription: 'Проверка фактов и новостей на достоверность',
      factCheckPlaceholder: 'Опишите факт, новость или утверждение, которое хотите проверить...',
      dataCheckTitle: 'Проверка данных',
      dataCheckDescription: 'Проверка личных и корпоративных данных',
      fraudDetectorTitle: 'Fraud Detector',
      fraudDetectorDescription: 'Обнаружение потенциального мошенничества и скамов',
      fraudDetectorPlaceholder: 'Опишите ситуацию подробно...',
      whatAnalyzes: '🔍 Что анализируется: ИИ проверит ситуацию на признаки мошенничества, даст вердикт (скам или нет) и предоставит практические советы по проверке.',
      whatWeCheck: 'Что мы будем проверять',
      urlScannerWhatWeCheck: 'Что мы проверяем',
      analyzeFraudButton: 'Проверить на мошенничество',
      resultsDisclaimer: 'Результаты носят справочный характер и не являются юридическим заключением.',
      // Формы
      factDescription: 'Описание факта или новости',
      factDescriptionHelp: 'Опишите максимально подробно: где услышали, от кого, контекст ситуации',
      factImage: 'Изображение (необязательно)',
      factImageHelp: 'Максимум 1 фото, до 5MB. Может содержать скриншот, изображение с текстом и т.д.',
      imagePreview: 'Предпросмотр изображения:',
      checkFacts: 'Проверить факты',
      checkingFacts: 'Проверяем факты...',
      dataSearch: 'Поиск информации',
      dataSearchHelp: '💡 Совет: Заполните хотя бы одно поле. Чем больше данных вы предоставите, тем точнее будет поиск. ИИ проведет детальный поиск по всему интернету и найдет всю доступную информацию.',
      startSearch: 'Начать поиск',
      searchingInfo: 'Ищем информацию...',
      fraudAnalysis: 'Анализ на мошенничество',
      situationDescription: 'Описание ситуации',
      situationDescriptionHelp: 'Чем подробнее опишете, тем точнее будет анализ. Укажите контекст, детали, подозрительные моменты',
      fraudAnalysisHelp: '🔍 Что анализируется: ИИ проверит ситуацию на признаки мошенничества, даст вердикт (скам или нет) и предоставит практические советы по проверке.',
      analyzingFraud: 'Анализируем на мошенничество...',
      // Features section
      domainReputation: 'Репутация домена',
      domainReputationDesc: 'Возраст, DNS, чёрные списки, резолверы, паркинг/фишинг-паттерны.',
      tlsSsl: 'TLS/SSL',
      tlsSslDesc: 'Сертификат, шифры, HSTS, редиректы http→https.',
      contentRisks: 'Контент‑риски',
      contentRisksDesc: 'Подозрительная лексика, поддельные CTA, копипасты, орфография.',
      databaseMatching: 'Сопоставление с базами',
      databaseMatchingDesc: 'Базы фишинга/мошенничества, спам‑индексы, репорты сообществ.',
      // Features section - Fact Checker
      factCheckFeatures: {
        truthfulnessRating: 'Оценка достоверности',
        truthfulnessRatingDesc: 'Балльный рейтинг правдивости, степень уверенности и краткий вердикт по итогам анализа.',
        sourcesQuotes: 'Источники и цитаты',
        sourcesQuotesDesc: 'Поиск первоисточников (официальные заявления, документы, проверенные СМИ), сопоставление цитат и ссылок.',
        contextChronology: 'Контекст и хронология',
        contextChronologyDesc: 'Когда, где и кем заявлено; предыстория и развитие сюжета; выявление временных несостыковок.',
        manipulationDetection: 'Выявление манипуляций',
        manipulationDetectionDesc: 'Кликбейт, логические ошибки, эмоциональные триггеры, вырванные из контекста фото/видео.',
      },
      // Features section - Data Checker
      dataCheckFeatures: {
        contactsCheck: 'Контакты (телефон, e-mail)',
        contactsCheckDesc: 'Проверка формата, репутации (спам/абюз), утечек, принадлежности и упоминаний в открытых источниках.',
        personsProfiles: 'Персоны и профили',
        personsProfilesDesc: 'Совпадения по ФИО/никам, социальные сети, публичные биографии и цифровые следы.',
        companiesOrganizations: 'Компании и организации',
        companiesOrganizationsDesc: 'Госреестры, учредители, адреса, лицензии, судебные записи, идентификаторы (ИНН/рег-номера — где законно).',
        relatedEntities: 'Связанные сущности',
        relatedEntitiesDesc: 'Домены, IP, whois, SSL-сертификаты, связки аккаунтов и сайтов, пересечения по источникам.',
      },
      // Features section - Fraud Detector
      fraudDetectorFeatures: {
        phishingSignals: 'Сигналы фишинга',
        phishingSignalsDesc: 'Подмена домена, срочность, просьбы о платеже/данных, подозрительные вложения/ссылки.',
        financialRisks: 'Финансовые риски',
        financialRisksDesc: 'Схемы предоплаты, переводы на карты/крипту, обман с escrow/доставкой, риск возвратов и chargeback.',
        requisitesCheck: 'Проверка реквизитов',
        requisitesCheckDesc: 'Валидация IBAN/BIC/счёта, проверка трекингов и QR-счетов (без хранения персональных данных).',
        practicalSteps: 'Практические шаги',
        practicalStepsDesc: 'Чек-листы для продавца/покупателя/магазина, шаблоны ответов и план действий при высоком риске.',
      },
    },
    results: {
      securityIndex: 'Индекс безопасности и доверия',
      truthfulness: 'Правдивость',
      dataRiskIndex: 'Индекс риска данных',
      fraudIndex: 'Индекс мошенничества',
      highTrust: 'Высокий уровень доверия',
      mediumTrust: 'Средний уровень доверия',
      lowTrust: 'Низкий уровень доверия',
      highTruthfulness: 'Высокая правдивость',
      mediumTruthfulness: 'Средняя правдивость',
      lowTruthfulness: 'Низкая правдивость',
      lowRisk: 'Низкий риск',
      mediumRisk: 'Средний риск',
      highRisk: 'Высокий риск',
      safe: 'Безопасно',
      suspicious: 'Подозрительно',
      dangerous: 'Опасно',
      lowTrustLabel: 'Низкий уровень доверия',
      highTrustLabel: 'Высокий уровень доверия',
      completeLie: 'Полная ложь',
      pureTruth: 'Чистая правда',
      highRiskLabel: 'Высокий риск',
      lowRiskLabel: 'Низкий риск',
      dangerousLabel: 'Опасно',
      safeLabel: 'Безопасно',
      recommendations: '🛡️ Рекомендации',
      riskFactors: 'Факторы риска',
      truthFactors: 'Факторы правдивости',
      foundInformation: 'Найденная информация',
      fraudSigns: 'Признаки мошенничества',
      sources: 'Источники',
      feedback: 'Оцените результат',
      rateResult: 'Оцените результат',
      correct: '👍 Правильно',
      incorrect: '👎 Неправильно',
      thankYouFeedback: 'Спасибо за отзыв!',
      feedbackError: 'Не удалось отправить отзыв.',
      networkError: 'Сетевая ошибка при отправке отзыва.',
      confidence: 'Уверенность',
      outOf: 'из',
      noFactorsAvailable: 'Нет доступных факторов для отображения',
      noSourcesAvailable: 'Нет доступных источников',
      
      // Дополнительные переводы для результатов
      loadingResults: 'Загружаем результаты анализа...',
      errorTitle: 'Ошибка',
      resultNotFound: 'Результат анализа не найден',
      whatWeChecked: 'Что мы проверили?',
      securitySources: 'Источники безопасности',
      extractedArtifacts: 'Извлеченные артефакты (IOC)',
      imageAnalysis: 'Анализ изображений',
      visualAnomalies: 'Визуальные аномалии',
      detectedUrls: 'Обнаруженные URL',
      feedbackTitle: 'Обратная связь',
      feedbackSubtitle: 'Был ли полезен этот анализ?',
      yes: 'Да',
      no: 'Нет',
      disclaimer: 'Результаты носят справочный характер и не являются юридическим заключением. Проверяйте критически важные данные через официальные источники.',
      newAnalysis: 'Новый анализ',
      otherAnalyses: 'Остальные анализы',
      downloadPdf: 'Скачать анализ (.pdf)',
      image: 'Изображение',
      domains: 'Домены',
      emails: 'Email адреса',
      cryptoWallets: 'Криптокошельки',
      urls: 'URL',
      verdict: 'Вердикт',
      sourcesTitle: 'Источники',
      missingDataNegativeImpact: 'Данные и ссылки отсутствуют; это негативно влияет на показатель по данному критерию.',
      mainContent: 'Перейти к основному содержимому',
      check: 'Проверка',
      moreDetails: 'Подробнее',
      details: 'Детали',
      
      // Переводы для вердиктов
      engines: 'движков',
      threats: 'угроз',
      detections: 'обнаружений',
      verdictSources: 'источников',
      days: 'дней',
      years: 'лет',
      months: 'месяцев',
      
      // SSL и безопасность
      sslMissing: 'SSL отсутствует',
      sslInvalid: 'SSL недействителен',
      notFound: 'не найдено',
      found: 'найдено',
      detected: 'обнаружено',
      
      // Переводы для проверок безопасности
      domainAgeCheck: 'Мы проверили возраст домена. У мошенников домены часто зарегистрированы совсем недавно.',
      sslValidCheck: 'Мы проверили наличие и корректность SSL‑сертификата (HTTPS). Отсутствие или ошибки — признак небезопасного сайта.',
      gsbCheck: 'Мы запросили статус сайта в базе Google Safe Browsing database for known threats and phishing.',
      virusTotalCheck: 'Мы проверили репутацию URL и домена в VirusTotal — агрегаторе десятков антивирусных движков.',
      formsCheck: 'Мы проверили наличие форм ввода (логин, оплата, регистрация), которые часто используют мошенники.',
      contentQualityCheck: 'Мы оценили объём и качество текста на странице: короткие и шаблонные тексты повышают риск.',
      suspiciousPatternsCheck: 'Мы искали подозрительные паттерны в содержимом: слова о платеже, логине, призывы к действию.',
      waybackHistoryCheck: 'Мы проверили, есть ли сайт в архиве Wayback Machine. Отсутствие истории может быть признаком новизны.',
      dnsEmailAuthCheck: 'Мы проверили DNS‑записи SPF и DMARC — механизмы аутентификации почты домена.',
      brandImpersonationCheck: 'Мы проверили признаки подделки бренда в домене и его вариациях.',
      suspiciousDomainCheck: 'Мы проверили доменную зону и структуру домена на подозрительные признаки (длинные/цифровые паттерны).',
      trackingParamsCheck: 'Мы проверили URL на наличие множества трекинговых параметров (utm и др.).',
      suspiciousRegistrarCheck: 'Мы проверили, у какого регистратора оформлен домен, и нет ли признаков подозрительного регистратора.',
      genericSecurityCheck: 'Мы выполнили эту проверку, чтобы оценить надежность сайта по дополнительным техническим признакам.',
      domainAgeOld: 'что является большим сроком и повышает доверие к сайту',
      domainAgeNew: 'что может быть признаком новизны ресурса',
      domainAgeDetails: 'Мы проверили возраст домена через WHOIS и он составляет {days} дней, {quality}.',
      

    },
    analysis: {
      urlScanner: {
        title: 'URL Сканер',
        description: 'Анализ URL на предмет угроз безопасности и мошенничества',
        placeholder: 'Введите URL для анализа...',
      },
      factChecker: {
        title: 'Проверить факты',
        description: 'Проверка фактов и новостей на достоверность',
        textPlaceholder: 'Введите текст для проверки фактов...',
        imagePlaceholder: 'Загрузить изображение (необязательно)',
      },
      dataChecker: {
        title: 'Проверить данные',
        description: 'Проверка личных и корпоративных данных',
        phoneLabel: 'Номер телефона',
        emailLabel: 'Email адрес',
        nameLabel: 'Полное имя',
        companyLabel: 'Название компании',
        addressLabel: 'Адрес',
        socialMediaLabel: 'Профиль в соцсетях',
        atLeastOneField: 'Введите хотя бы один тип данных для проверки',
      },
      fraudDetector: {
        title: 'Fraud Detector',
        description: 'Обнаружение потенциального мошенничества и скамов',
        situationPlaceholder: 'Опишите ситуацию подробно...',
        imagePlaceholder: 'Загрузить изображения (до 3)',
      },
    },
    errors: {
      networkError: 'Сетевая ошибка',
      serverError: 'Ошибка сервера',
      validationError: 'Ошибка валидации',
      fileTooLarge: 'Файл слишком большой',
      invalidFileType: 'Неверный тип файла',
      requiredField: 'Это поле обязательно',
      invalidEmail: 'Неверный email адрес',
      invalidUrl: 'Неверный URL',
      atLeastOneField: 'Введите хотя бы один тип данных для проверки',
    },
    donate: {
      title: 'Поддержать SafestNet',
      subtitle: 'Ваш вклад помогает развивать проект и защищать больше пользователей.',
      nonprofitNote: 'Мы пока являемся некоммерческой организацией и ничего не зарабатываем с проекта — мы просто помогаем людям.',
      redirectNote: 'Выберите удобный Вам способ пожертвования и вас перенаправят для дальнейших инструкций.',
      cryptoTitle: 'Криптокошельки',
      stripeLabel: 'Оплата картой',
      cryptoButton: 'Крипто',
      cryptoToggleButton: 'Смотреть кошельки',
      copy: 'Скопировать',
      copied: 'Скопировано',
      showQr: 'Показать QR',
      hideQr: 'Скрыть QR',
      cardButton: 'Пожертвовать картой',
      supportedMethods: 'Поддерживаемые способы оплаты:',
    },
    report: {
      title: 'Отправить отчёт',
      intro: 'Наш проект только начинает проходить бета‑тестирование и он может иногда ошибаться. Если вы нашли ошибку или баг, пожалуйста, расскажите нам об этом, чтобы мы могли скорее это исправить.',
      nameLabel: 'Твоё имя:',
      emailLabel: 'Твой e‑mail:',
      messageLabel: 'Твоё сообщение:',
      addPhotoLabel: 'Добавить фото:',
      submitButton: 'Отправить сообщение',
      sentStatus: 'Сообщение отправлено',
      errorStatus: 'Ошибка отправки',
      networkStatus: 'Сеть недоступна',
      imagesOnlyError: 'Можно загружать только изображения',
    },
    limitModal: {
      title: 'Воу полегче!',
      message: '3 отзывов будет предостаточно для одного анализа, спасибо!',
      button: 'Понятно',
    },
    admin: {
      statistics: 'Статистика',
      siteStatistics: 'Статистика сайта',
      daily: 'Ежедневная',
      weekly: 'Еженедельная',
      monthly: 'Ежемесячная',
      totalVisits: 'Всего посещений',
      uniqueVisits: 'Уникальных посетителей',
      scansConducted: 'Проведенных сканов',
      positiveFeedback: 'Положительных отзывов',
      negativeFeedback: 'Отрицательных отзывов',
      reports: 'Отчетов',
      feedbacks: 'Отзывов',
    },
  },
  lv: {
    common: {
      loading: 'Ielāde...',
      error: 'Kļūda',
      notFound: 'Nav atrasts',
      backToHome: 'Atpakaļ uz sākumu',
      save: 'Saglabāt',
      cancel: 'Atcelt',
      submit: 'Iesniegt',
      close: 'Aizvērt',
      next: 'Tālāk',
      previous: 'Atpakaļ',
      download: 'Lejupielādēt',
      upload: 'Augšupielādēt',
      search: 'Meklēt',
      filter: 'Filtrs',
      sort: 'Kārtot',
      refresh: 'Atjaunot',
      settings: 'Iestatījumi',
      help: 'Palīdzība',
      about: 'Par mums',
      contact: 'Kontakti',
      privacy: 'Privātums',
      terms: 'Nosacījumi',
      language: 'Valoda',
    },
    navigation: {
      home: 'Sākums',
      newAnalysis: 'Jauna analīze',
      otherAnalyses: 'Citas analīzes',
      downloadAnalysis: 'Lejupielādēt analīzi (.pdf)',
      urlScanner: 'URL Skeneris',
      factChecker: 'Faktu Pārbaudītājs',
      dataChecker: 'Datu Pārbaudītājs',
      fraudDetector: 'Krāpšanas Detektors',
    },
    home: {
      title: 'SafestNet',
      subtitle: 'AI-pilnīga URL, satura un ziņu analīze krāpšanas un dezinformācijas atklāšanai',
      description: 'Uzlabota AI-analīze URL, satura un ziņu analīzei krāpšanas un dezinformācijas atklāšanai',
      urlPlaceholder: 'Ievadiet URL analīzei...',
      textPlaceholder: 'Ievadiet tekstu faktu pārbaudei...',
      imagePlaceholder: 'Augšupielādēt attēlu (nav obligāts)',
      phonePlaceholder: 'Tālruņa numurs',
      emailPlaceholder: 'E-pasta adrese',
      namePlaceholder: 'Pilns vārds',
      companyPlaceholder: 'Uzņēmuma nosaukums',
      addressPlaceholder: 'Adrese',
      socialMediaPlaceholder: 'Sociālo tīklu profils',
      situationPlaceholder: 'Detalizēti aprakstiet situāciju...',
      analyzeButton: 'Analizēt',
      disclaimer: 'Šis rīks ir paredzēts tikai izglītošanas nolūkiem. Vienmēr pārbaudiet kritiski svarīgu informāciju caur oficiāliem avotiem.',
      thankYouButton: 'Pasaki paldies',
      sendReport: 'Sūtīt ziņojumu',
      beta: 'DEMO',
      urlScannerBeta: 'BETA',
      comingSoonBanner: 'Drīzumā... Mūsu izstrādātāji cītīgi strādā!\n\nAtbalstiet projektu ar ziedojumiem, lai mēs paātrinātos',
      comingSoonButton: 'Coming Soon...',
      comingSoonModalTitle: 'Tikai pacietība, draugs!',
      comingSoonModalMessage: 'Mūsu izstrādātāji strādā dienām un naktīm, lai tu drīzāk varētu izmēģināt mūsu produktus!',
      comingSoonModalButton: 'Sapratu!',
      urlHelp: 'Ievadiet pilnu adresi (ieskaitot https://). Mēs nesaglabājam iesniegtos URL.',
      factCheckTitle: 'Faktu un ziņu pārbaude',
      factCheckDescription: 'Faktu un ziņu pārbaude precizitātei',
      factCheckPlaceholder: 'Aprakstiet faktu, ziņas vai apgalvojumu, ko vēlaties verificēt...',
      dataCheckTitle: 'Datu pārbaude',
      dataCheckDescription: 'Personīgo un uzņēmumu datu pārbaude',
      fraudDetectorTitle: 'Krāpšanas Detektors',
      fraudDetectorDescription: 'Potenciālās krāpšanas un krāpšanas shēmu atklāšana',
      fraudDetectorPlaceholder: 'Detalizēti aprakstiet situāciju...',
      whatAnalyzes: '🔍 Kas tiek analizēts: AI pārbaudīs situāciju krāpšanas pazīmēm, dos spriedumu (krāpšana vai nē) un sniegs praktiskus ieteikumus verificēšanai.',
      whatWeCheck: 'Ko mēs pārbaudīsim',
      urlScannerWhatWeCheck: 'Ko mēs pārbaudām',
      analyzeFraudButton: 'Pārbaudīt uz krāpšanu',
      resultsDisclaimer: 'Rezultāti ir tikai informatīvi un nav juridisks ieteikums.',
      // Формы
      factDescription: 'Fakta vai ziņu apraksts',
      factDescriptionHelp: 'Aprakstiet detalizēti: kur dzirdējāt, no kā, situācijas kontekstu',
      factImage: 'Attēls (nav obligāts)',
      factImageHelp: 'Maksimums 1 foto, līdz 5MB. Var saturēt ekrānuzņēmumu, attēlu ar tekstu utt.',
      imagePreview: 'Attēla priekšskatījums:',
      checkFacts: 'Pārbaudīt faktus',
      checkingFacts: 'Pārbaudām faktus...',
      dataSearch: 'Informācijas meklēšana',
      dataSearchHelp: '💡 Ieteikums: Aizpildiet vismaz vienu lauku. Jo vairāk datu jūs sniedzat, jo precīzāka būs meklēšana. AI veiks detalizētu meklēšanu visā internetā un atradīs visu pieejamo informāciju.',
      startSearch: 'Sākt meklēšanu',
      searchingInfo: 'Meklējam informāciju...',
      fraudAnalysis: 'Krāpšanas analīze',
      situationDescription: 'Situācijas apraksts',
      situationDescriptionHelp: 'Jo detalizētāk aprakstīsiet, jo precīzāka būs analīze. Norādiet kontekstu, detaļas, aizdomīgus momentus',
      fraudAnalysisHelp: '🔍 Kas tiek analizēts: AI pārbaudīs situāciju krāpšanas pazīmēm, dos spriedumu (krāpšana vai nē) un sniegs praktiskus ieteikumus verificēšanai.',
      analyzingFraud: 'Analizējam uz krāpšanu...',
      // Features section
      domainReputation: 'Domēna reputācija',
      domainReputationDesc: 'Vecums, DNS, melnās saraksti, risinātāji, parkēšanas/fīšinga modeļi.',
      tlsSsl: 'TLS/SSL',
      tlsSslDesc: 'Sertifikāts, šifri, HSTS, http→https novirzījumi.',
      contentRisks: 'Satura riski',
      contentRisksDesc: 'Aizdomīga leksika, viltoti CTA, kopēšana, pareizrakstība.',
      databaseMatching: 'Datu bāzu salīdzināšana',
      databaseMatchingDesc: 'Fīšinga/krāpšanas datu bāzes, spama indeksi, kopienas ziņojumi.',
      // Features section - Fact Checker
      factCheckFeatures: {
        truthfulnessRating: 'Patiesības novērtējums',
        truthfulnessRatingDesc: 'Patiesības punktu vērtējums, pārliecības līmenis un īss spriedums analīzes rezultātu pamatā.',
        sourcesQuotes: 'Avoti un citāti',
        sourcesQuotesDesc: 'Primāro avotu meklēšana (oficiāli paziņojumi, dokumenti, verificēti mediji), citātu un saikņu salīdzināšana.',
        contextChronology: 'Konteksts un hronoloģija',
        contextChronologyDesc: 'Kad, kur un ko paziņoja; priekšvēsture un stāsta attīstība; laika neatbilstību identificēšana.',
        manipulationDetection: 'Manipulāciju atklāšana',
        manipulationDetectionDesc: 'Klikbait, loģiskās kļūdas, emocionālie trigeri, no konteksta izņemti foto/video.',
      },
      // Features section - Data Checker
      dataCheckFeatures: {
        contactsCheck: 'Kontakti (tālrunis, e-pasts)',
        contactsCheckDesc: 'Formāta pārbaude, reputācijas pārbaude (spams/ļaunprātība), noplūdes, īpašumtiesības un pieminējumi atklātajos avotos.',
        personsProfiles: 'Personas un profili',
        personsProfilesDesc: 'Sakritības pēc pilna vārda/lietotājvārdiem, sociālie tīkli, publiskās biogrāfijas un digitālās pēdas.',
        companiesOrganizations: 'Uzņēmumi un organizācijas',
        companiesOrganizationsDesc: 'Valsts reģistri, dibinātāji, adreses, licences, tiesas ieraksti, identifikatori (PVN/reģ-numuri — kur likumīgi).',
        relatedEntities: 'Saistītās entītītes',
        relatedEntitiesDesc: 'Domēni, IP, whois, SSL sertifikāti, kontu un vietņu saistības, avotu krustojumi.',
      },
      // Features section - Fraud Detector
      fraudDetectorFeatures: {
        phishingSignals: 'Fīšinga signāli',
        phishingSignalsDesc: 'Domēna viltošana, steiga, maksājumu/datu pieprasījumi, aizdomīgi pielikumi/saiknes.',
        financialRisks: 'Finanšu riski',
        financialRisksDesc: 'Iepriekšējā maksājuma shēmas, kartes/kripto pārskaitījumi, escrow/piegādes krāpšana, atmaksas un chargeback riski.',
        requisitesCheck: 'Rekvizītu pārbaude',
        requisitesCheckDesc: 'IBAN/BIC/konta validācija, izsekošanas un QR-kodu verificēšana (bez personīgo datu saglabāšanas).',
        practicalSteps: 'Praktiskie soļi',
        practicalStepsDesc: 'Kontrolsaraksti pārdevējam/pircējam/veikalam, atbildes veidnes un rīcības plāns augsta riska situācijām.',
      },
    },
    results: {
      securityIndex: 'Drošības un uzticamības indekss',
      truthfulness: 'Patiesība',
      dataRiskIndex: 'Datu riska indekss',
      fraudIndex: 'Krāpšanas indekss',
      highTrust: 'Augsts uzticamības līmenis',
      mediumTrust: 'Vidējs uzticamības līmenis',
      lowTrust: 'Zems uzticamības līmenis',
      highTruthfulness: 'Augsta patiesība',
      mediumTruthfulness: 'Vidēja patiesība',
      lowTruthfulness: 'Zema patiesība',
      lowRisk: 'Zems risks',
      mediumRisk: 'Vidējs risks',
      highRisk: 'Augsts risks',
      safe: 'Droši',
      suspicious: 'Aizdomīgi',
      dangerous: 'Bīstami',
      lowTrustLabel: 'Zems uzticamības līmenis',
      highTrustLabel: 'Augsts uzticamības līmenis',
      completeLie: 'Pilnīgs meli',
      pureTruth: 'Tīra patiesība',
      highRiskLabel: 'Augsts risks',
      lowRiskLabel: 'Zems risks',
      dangerousLabel: 'Bīstami',
      safeLabel: 'Droši',
      recommendations: '🛡️ Ieteikumi',
      riskFactors: 'Riska faktori',
      truthFactors: 'Patiesības faktori',
      foundInformation: 'Atrastā informācija',
      fraudSigns: 'Krāpšanas pazīmes',
      sources: 'Avoti',
      feedback: 'Novērtējiet rezultātu',
      rateResult: 'Novērtējiet rezultātu',
      correct: '👍 Pareizi',
      incorrect: '👎 Nepareizi',
      thankYouFeedback: 'Paldies par atsauksmi!',
      feedbackError: 'Neizdevās nosūtīt atsauksmi.',
      networkError: 'Tīkla kļūda, nosūtot atsauksmi.',
      confidence: 'Pārliecība',
      outOf: 'no',
      noFactorsAvailable: 'Nav pieejamu faktoru attēlošanai',
      noSourcesAvailable: 'Nav pieejamu avotu',
      
      // Дополнительные переводы для результатов
      loadingResults: 'Ielādējam analīzes rezultātus...',
      errorTitle: 'Kļūda',
      resultNotFound: 'Analīzes rezultāts nav atrasts',
      whatWeChecked: 'Ko mēs pārbaudījām?',
      securitySources: 'Drošības avoti',
      extractedArtifacts: 'Izvilktie artefakti (IOC)',
      imageAnalysis: 'Attēlu analīze',
      visualAnomalies: 'Vizuālās anomālijas',
      detectedUrls: 'Atrastie URL',
      feedbackTitle: 'Atsauksmes',
      feedbackSubtitle: 'Vai šī analīze bija noderīga?',
      yes: 'Jā',
      no: 'Nē',
      disclaimer: 'Rezultāti ir tikai informatīvi un nav juridisks ieteikums. Vienmēr pārbaudiet kritiski svarīgu informāciju caur oficiāliem avotiem.',
      newAnalysis: 'Jauna analīze',
      otherAnalyses: 'Citas analīzes',
      downloadPdf: 'Lejupielādēt analīzi (.pdf)',
      image: 'Attēls',
      domains: 'Domēni',
      emails: 'E-pasta adreses',
      cryptoWallets: 'Kripto maki',
      urls: 'URL',
      verdict: 'Spriedums',
      sourcesTitle: 'Avoti',
      missingDataNegativeImpact: 'Dati un saites trūkst; tas negatīvi ietekmē rādītāju šim kritērijam.',
      mainContent: 'Doties uz galveno saturu',
      check: 'Pārbaude',
      moreDetails: 'Sīkāk',
      details: 'Detaļas',
      
      // Переводы для вердиктов
      engines: 'dzinēju',
      threats: 'apdraudējumu',
      detections: 'atklājumu',
      verdictSources: 'avotu',
      days: 'dienu',
      years: 'gadu',
      months: 'mēnešu',
      
      // SSL и безопасность
      sslMissing: 'SSL trūkst',
      sslInvalid: 'SSL nederīgs',
      notFound: 'nav atrasts',
      found: 'atrasts',
      detected: 'atklāts',
      
      // Переводы для проверок безопасности
      domainAgeCheck: 'Mēs pārbaudījām domēna vecumu. Krāpniekiem domēni bieži ir reģistrēti nesen.',
      sslValidCheck: 'Mēs pārbaudījām SSL sertifikāta (HTTPS) esamību un pareizību. Trūkums vai kļūdas norāda uz nedrošu vietni.',
      gsbCheck: 'Mēs vaicājām vietnes statusu Google Safe Browsing datubāzē par zināmiem draudiem un fīšingu.',
      virusTotalCheck: 'Mēs pārbaudījām URL un domēna reputāciju VirusTotal - desmitu antivīrusu dzinēju agregātorā.',
      formsCheck: 'Mēs pārbaudījām ievades formu (pieteikšanās, maksājumi, reģistrācija) esamību, ko bieži izmanto krāpnieki.',
      contentQualityCheck: 'Mēs novērtējām lapas teksta apjomu un kvalitāti: īsi un veidnes teksti palielina risku.',
      suspiciousPatternsCheck: 'Mēs meklējām aizdomīgus modeļus saturā: vārdus par maksājumiem, pieteikšanos, aicinājumus rīkoties.',
      waybackHistoryCheck: 'Mēs pārbaudījām, vai vietne eksistē Wayback Machine arhīvā. Vēstures trūkums var norādīt uz jaunumu.',
      dnsEmailAuthCheck: 'Mēs pārbaudījām SPF un DMARC DNS ierakstus - domēna e-pasta autentifikācijas mehānismus.',
      brandImpersonationCheck: 'Mēs pārbaudījām zīmola viltošanas pazīmes domēnā un tā variācijās.',
      suspiciousDomainCheck: 'Mēs pārbaudījām domēna zonu un domēna struktūru aizdomīgām pazīmēm (gari/ciparu modeļi).',
      trackingParamsCheck: 'Mēs pārbaudījām URL vairāku izsekošanas parametru (utm utt.) esamību.',
      suspiciousRegistrarCheck: 'Mēs pārbaudījām, kurš reģistrators reģistrēja domēnu un vai nav aizdomīga reģistratora pazīmju.',
      genericSecurityCheck: 'Mēs veicām šo pārbaudi, lai novērtētu vietnes uzticamību pēc papildu tehniskajiem rādītājiem.',
      domainAgeOld: 'kas ir ilgs laiks un palielina uzticību vietnei',
      domainAgeNew: 'kas var norādīt uz resursa jaunumu',
      domainAgeDetails: 'Mēs pārbaudījām domēna vecumu caur WHOIS un tas ir {days} dienas, {quality}.',
      

    },
    analysis: {
      urlScanner: {
        title: 'URL Skeneris',
        description: 'URL analīze drošības draudu un krāpšanas atklāšanai',
        placeholder: 'Ievadiet URL analīzei...',
      },
      factChecker: {
        title: 'Faktu Pārbaudītājs',
        description: 'Faktu un ziņu pārbaude precizitātei',
        textPlaceholder: 'Ievadiet tekstu faktu pārbaudei...',
        imagePlaceholder: 'Augšupielādēt attēlu (nav obligāts)',
      },
      dataChecker: {
        title: 'Datu Pārbaudītājs',
        description: 'Personīgo un uzņēmumu datu pārbaude',
        phoneLabel: 'Tālruņa numurs',
        emailLabel: 'E-pasta adrese',
        nameLabel: 'Pilns vārds',
        companyLabel: 'Uzņēmuma nosaukums',
        addressLabel: 'Adrese',
        socialMediaLabel: 'Sociālo tīklu profils',
        atLeastOneField: 'Ievadiet vismaz vienu datu tipu pārbaudei',
      },
      fraudDetector: {
        title: 'Krāpšanas Detektors',
        description: 'Potenciālās krāpšanas un krāpšanas shēmu atklāšana',
        situationPlaceholder: 'Detalizēti aprakstiet situāciju...',
        imagePlaceholder: 'Augšupielādēt attēlus (līdz 3)',
      },
    },
    errors: {
      networkError: 'Tīkla kļūda',
      serverError: 'Servera kļūda',
      validationError: 'Validācijas kļūda',
      fileTooLarge: 'Fails ir pārāk liels',
      invalidFileType: 'Nederīgs faila tips',
      requiredField: 'Šis lauks ir obligāts',
      invalidEmail: 'Nederīga e-pasta adrese',
      invalidUrl: 'Nederīgs URL',
      atLeastOneField: 'Ievadiet vismaz vienu datu tipu pārbaudei',
    },
    donate: {
      title: 'Atbalstīt SafestNet',
      subtitle: 'Jūsu ieguldījums palīdz mums attīstīt projektu un aizsargāt vairāk lietotāju.',
      nonprofitNote: 'Mēs pašlaik esam bezpeļņas organizācija un negūstam peļņu no šī projekta — mēs vienkārši palīdzam cilvēkiem.',
      redirectNote: 'Izvēlieties ērtu ziedošanas veidu, un jūs tiksiet novirzīti uz turpmākajām instrukcijām.',
      cryptoTitle: 'Kripto maki',
      stripeLabel: 'Apmaksa ar karti',
      cryptoButton: 'Kripto',
      cryptoToggleButton: 'Skatīt makus',
      copy: 'Kopēt',
      copied: 'Nokopēts',
      showQr: 'Rādīt QR',
      hideQr: 'Slēpt QR',
      cardButton: 'Ziedot ar karti',
      supportedMethods: 'Atbalstītās maksājumu metodes:',
    },
    report: {
      title: 'Nosūtīt ziņojumu',
      intro: 'Mūsu projekts ir beta stadijā un var reizēm kļūdīties. Ja atradi kļūdu vai problēmu, lūdzu, pastāsti mums, lai varam to ātrāk salabot.',
      nameLabel: 'Tavs vārds:',
      emailLabel: 'Tavs e‑pasts:',
      messageLabel: 'Tavs ziņojums:',
      addPhotoLabel: 'Pievienot foto:',
      submitButton: 'Nosūtīt ziņojumu',
      sentStatus: 'Ziņojums nosūtīts',
      errorStatus: 'Nosūtīšana neizdevās',
      networkStatus: 'Tīkls nav pieejams',
      imagesOnlyError: 'Atļauti tikai attēli',
    },
    limitModal: {
      title: 'Hei, mierīgāk!',
      message: '3 atsauksmes vienam analīzes rezultātam ir pietiekami. Paldies!',
      button: 'Sapratu',
    },
    admin: {
      statistics: 'Statistika',
      siteStatistics: 'Statistika par vietni',
      daily: 'Dienas statistika',
      weekly: 'Nedēļas statistika',
      monthly: 'Mēneša statistika',
      totalVisits: 'Kopējie apmeklējumi',
      uniqueVisits: 'Unikālie apmeklētāji',
      scansConducted: 'Veiktie skani',
      positiveFeedback: 'Pozitīvas atsauksmes',
      negativeFeedback: 'Negatīvas atsauksmes',
      reports: 'Atzinumi',
      feedbacks: 'Atsauksmes',
    },
  },
};

// Хук для работы с переводами
export function useTranslations(language: Language) {
  const t = translations[language];
  
  return {
    t,
    language,
  };
}

// Функция для получения перевода по пути
export function getTranslation(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let result: unknown = obj;
  
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = (result as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }
  
  return typeof result === 'string' ? result : path;
}
