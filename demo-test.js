// SafeNet MVP Demo Test Script
console.log('🛡️ SafeNet MVP Demo Test\n');

const testUrls = [
  { url: 'https://google.com', expected: 'Low risk' },
  { url: 'https://github.com', expected: 'Low risk' },
  { url: 'http://suspicious-site.com', expected: 'Higher risk (HTTP)' },
  { url: 'https://facebook.com', expected: 'Low risk' }
];

async function testAPI(url, locale = 'en') {
  try {
    console.log(`🔍 Testing: ${url}`);
    
    const response = await fetch('http://localhost:8080/analyze/url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, locale })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log(`   📊 Score: ${result.scamRate}/100 (${result.category})`);
      console.log(`   🎯 Confidence: ${result.confidence}%`);
      console.log(`   📝 Summary: ${result.summary.substring(0, 80)}...`);
      console.log(`   💡 Recommendations: ${result.explanation.recommendations.length} items`);
      console.log('');
      return result;
    } else {
      console.log(`   ❌ Error: ${response.status}\n`);
    }
  } catch (error) {
    console.log(`   💥 Network error: ${error.message}\n`);
  }
}

async function runDemo() {
  console.log('Testing different locales and URLs...\n');
  
  // Test English
  await testAPI('https://google.com', 'en');
  
  // Test Russian
  await testAPI('https://yandex.ru', 'ru');
  
  // Test Latvian
  await testAPI('https://delfi.lv', 'lv');
  
  // Test potentially suspicious patterns
  await testAPI('http://example.com', 'en');
  
  console.log('✅ Demo completed!');
  console.log('\n🌐 Open http://localhost:3000 to test the web interface');
  console.log('📖 Check SETUP_GUIDE.md for detailed instructions');
}

// Check if we're running in Node.js environment
if (typeof fetch === 'undefined') {
  console.log('❌ This script requires Node.js 18+ with fetch support');
  console.log('💡 Alternative: Test via web interface at http://localhost:3000');
} else {
  runDemo();
}
