const axios = require('axios');

async function testProductsEndpoint() {
    console.log('🔄 Testing GET /api/products...');
    try {
        const response = await axios.get('http://localhost:5000/api/products');
        console.log('✅ Success! Status:', response.status);
        console.log('Data Preview:', JSON.stringify(response.data.data.products[0] || 'No products found', null, 2));
    } catch (error) {
        console.error('❌ Failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
    }
}

testProductsEndpoint();
