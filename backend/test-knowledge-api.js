const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

// First, let's authenticate to get a token
async function testKnowledgeAPI() {
  try {
    // Login to get a token
    console.log('Attempting to login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@example.com',
      password: 'password123' // Assuming this is the password, adjust as needed
    });

    if (!loginResponse.data.success) {
      console.error('Login failed:', loginResponse.data);
      return;
    }

    const token = loginResponse.data.token;
    console.log('Login successful, token received');

    // Now try to access the knowledge articles
    console.log('Fetching knowledge articles...');
    const knowledgeResponse = await axios.get('http://localhost:5000/api/knowledge', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Knowledge API Response:', knowledgeResponse.data);
    
    if (knowledgeResponse.data.success) {
      console.log('Total articles:', knowledgeResponse.data.count);
      console.log('Articles:', knowledgeResponse.data.data);
    }
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

testKnowledgeAPI();
