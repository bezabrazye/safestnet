// Simple API test script
const testUrl = 'http://localhost:8080/analyze/url';
const testPayload = {
  url: 'https://example.com',
  locale: 'en'
};

async function testAPI() {
  console.log('🧪 Testing SafeNet API...');
  console.log(`📡 Endpoint: ${testUrl}`);
  console.log(`📦 Payload:`, JSON.stringify(testPayload, null, 2));
  
  try {
    const response = await fetch(testUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });
    
    console.log(`✅ Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('📊 Result:', JSON.stringify(result, null, 2));
      
      // Test getting result by ID
      if (result.id) {
        console.log(`\n🔍 Testing GET /analyze/${result.id}`);
        const getResponse = await fetch(`http://localhost:8080/analyze/${result.id}`);
        const getResult = await getResponse.json();
        console.log('📋 Retrieved result:', JSON.stringify(getResult, null, 2));
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
    }
  } catch (error) {
    console.log('💥 Network error:', error.message);
    console.log('💡 Make sure the backend is running on http://localhost:8080');
  }
}

testAPI();
