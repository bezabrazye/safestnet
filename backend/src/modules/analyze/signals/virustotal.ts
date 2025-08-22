export async function queryVirusTotal(url: string) {
  const key = process.env.VIRUSTOTAL_API_KEY;
  if (!key) {
    console.log('VIRUSTOTAL_API_KEY not configured');
    return null;
  }

  try {
    // Сначала получаем ID URL
    const urlId = Buffer.from(url).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    
    const response = await fetch(`https://www.virustotal.com/api/v3/urls/${urlId}`, {
      method: 'GET',
      headers: {
        'x-apikey': key,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        // URL не найден в базе, отправляем на анализ
        return await submitUrlForAnalysis(url, key);
      }
      console.error('VirusTotal API error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    const attributes = data.data?.attributes;
    
    if (attributes) {
      return {
        positives: attributes.last_analysis_stats?.malicious || 0,
        total: Object.keys(attributes.last_analysis_results || {}).length,
        scanDate: attributes.last_analysis_date,
        reputation: attributes.reputation,
        categories: attributes.categories
      };
    }

    return { positives: 0, total: 0 };
  } catch (error) {
    console.error('VirusTotal API request failed:', error);
    return null;
  }
}

async function submitUrlForAnalysis(url: string, key: string) {
  try {
    const response = await fetch('https://www.virustotal.com/api/v3/urls', {
      method: 'POST',
      headers: {
        'x-apikey': key,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `url=${encodeURIComponent(url)}`
    });

    if (response.ok) {
      console.log('URL submitted to VirusTotal for analysis');
      return { positives: 0, total: 0, submitted: true };
    }
  } catch (error) {
    console.error('Failed to submit URL to VirusTotal:', error);
  }
  
  return { positives: 0, total: 0 };
}
