const axios = require('axios');

const testLogin = async () => {
    try {
        console.log('Attempting login...');
        const response = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@beautystore.com',
            password: 'admin123'
        });

        console.log('✅ Login Successful!');
        console.log('Status:', response.status);
        console.log('Data:', response.data);

        // Check cookies
        const cookies = response.headers['set-cookie'];
        if (cookies) {
            console.log('🍪 Cookies received:', cookies);
        } else {
            console.log('⚠️ No cookies received');
        }

    } catch (error) {
        console.error('❌ Login Failed');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
};

testLogin();
