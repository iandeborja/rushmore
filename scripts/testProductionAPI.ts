async function testProductionAPI() {
  try {
    console.log('Testing production API endpoints...')
    
    // Test the questions API with proper error handling
    console.log('\n1. Testing /api/questions/today...')
    try {
      const questionsResponse = await fetch('https://myrushmore.xyz/api/questions/today', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })
      
      if (!questionsResponse.ok) {
        console.log('❌ Questions API failed:', questionsResponse.status, questionsResponse.statusText)
        return
      }
      
      const questionsData = await questionsResponse.json()
      console.log('✅ Questions API Response:', questionsData)
    } catch (error) {
      console.log('❌ Questions API error:', error)
    }
    
    // Test the rushmores API
    console.log('\n2. Testing /api/rushmores...')
    try {
      const rushmoresResponse = await fetch('https://myrushmore.xyz/api/rushmores', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })
      
      if (!rushmoresResponse.ok) {
        console.log('❌ Rushmores API failed:', rushmoresResponse.status, rushmoresResponse.statusText)
        return
      }
      
      const rushmoresData = await rushmoresResponse.json()
      console.log('✅ Rushmores API Response (first item):', rushmoresData[0] || 'No rushmores')
    } catch (error) {
      console.log('❌ Rushmores API error:', error)
    }
    
    // Test the health API
    console.log('\n3. Testing /api/health...')
    try {
      const healthResponse = await fetch('https://myrushmore.xyz/api/health', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })
      
      if (!healthResponse.ok) {
        console.log('❌ Health API failed:', healthResponse.status, healthResponse.statusText)
        return
      }
      
      const healthData = await healthResponse.json()
      console.log('✅ Health API Response:', healthData)
    } catch (error) {
      console.log('❌ Health API error:', error)
    }
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testProductionAPI() 