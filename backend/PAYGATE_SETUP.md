# PayGate Integration Setup Guide

This guide will help you set up PayGate payment gateway integration for your e-commerce store.

## Overview

PayGate is a secure South African payment gateway that supports multiple payment methods including credit/debit cards, instant EFT, and other local payment options.

## Prerequisites

1. Active PayGate merchant account
2. PayGate credentials:
   - PayGate ID
   - PayGate Secret Key

## Getting PayGate Credentials

### Test/Sandbox Environment

For testing, you can use PayGate's test credentials:
- **PayGate ID**: `10011072130`
- **PayGate Secret**: `secret`

### Production Environment

1. Visit [https://www.paygate.co.za](https://www.paygate.co.za)
2. Sign up for a merchant account
3. Complete the registration process
4. Once approved, log into your PayGate dashboard
5. Navigate to **Settings** or **Integration**
6. Copy your **PayGate ID** and **Secret Key**

## Environment Configuration

### Backend Configuration

Add the following environment variables to your backend `.env` file:

```env
# PayGate Payment Gateway
PAYGATE_ID=your_paygate_id
PAYGATE_SECRET=your_paygate_secret

# URLs (required for redirects and webhooks)
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
```

**For Production:**
```env
PAYGATE_ID=your_production_paygate_id
PAYGATE_SECRET=your_production_secret_key
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com
```

## How PayGate Integration Works

### Payment Flow

1. **Customer Checkout**
   - Customer selects PayGate as payment method
   - Fills in shipping and contact information
   - Clicks "Pay with PayGate"

2. **Payment Initiation** (`POST /api/payments/initiate`)
   - Frontend sends order ID to backend
   - Backend creates initiate request with order details
   - Backend generates MD5 checksum for security
   - Backend calls PayGate API to get PAY_REQUEST_ID
   - Backend verifies response checksum
   - Backend returns PAY_REQUEST_ID to frontend

3. **Payment Redirect**
   - Frontend creates HTML form with PAY_REQUEST_ID
   - Form auto-submits to PayGate payment page
   - Customer enters payment details on PayGate's secure page

4. **Payment Processing**
   - Customer completes payment on PayGate
   - PayGate processes the transaction
   - PayGate redirects customer back to your site

5. **Payment Notification** (`POST /api/payments/notify`)
   - PayGate sends notification to your webhook
   - Backend verifies checksum
   - Backend queries PayGate for transaction status
   - Backend updates order status
   - Backend responds with "OK"

6. **Return to Store**
   - Customer is redirected to order confirmation page
   - Frontend verifies payment status
   - Cart is cleared if payment successful
   - Order details are displayed

### Transaction Status Codes

- `1` = Approved ✅
- `2` = Declined ❌
- `4` = Cancelled 🚫
- `0` = Not Done ⏳

## API Endpoints

### Initiate Payment
```
POST /api/payments/initiate
Content-Type: application/json

{
  "orderId": "507f1f77bcf86cd799439011"
}

Response:
{
  "success": true,
  "payRequestId": "23B785A1-C96D-5C4C-9A69-8CE8FAADBA9F",
  "paygateId": "10011072130",
  "redirectUrl": "https://secure.paygate.co.za/payweb3/process.trans"
}
```

### Payment Notification (Webhook)
```
POST /api/payments/notify
Content-Type: application/x-www-form-urlencoded

PAYGATE_ID=10011072130
PAY_REQUEST_ID=23B785A1-C96D-5C4C-9A69-8CE8FAADBA9F
REFERENCE=507f1f77bcf86cd799439011
TRANSACTION_STATUS=1
RESULT_CODE=990017
RESULT_DESC=Auth Done
TRANSACTION_ID=1234567890
...
```

### Verify Payment
```
GET /api/payments/verify/:orderId

Response:
{
  "success": true,
  "data": {
    "orderId": "507f1f77bcf86cd799439011",
    "orderNumber": "ORD-12345",
    "paymentStatus": "paid",
    "status": "confirmed",
    "paymentMethod": "paygate",
    "total": 1299.99,
    "paidAt": "2024-01-15T10:30:00.000Z"
  }
}
```

## Security Features

### Checksum Verification

All PayGate requests and responses include MD5 checksums to ensure data integrity:

1. **Outgoing Requests**
   - Data fields are sorted alphabetically
   - Values are concatenated
   - Secret key is appended
   - MD5 hash is generated

2. **Incoming Responses**
   - Received checksum is extracted
   - Expected checksum is calculated
   - Both are compared for validation

### Example Checksum Generation

```javascript
const generateChecksum = (data, encryptionKey) => {
    // Sort keys and concatenate values
    const values = Object.keys(data)
        .sort()
        .map(key => data[key])
        .join('');

    // Append encryption key
    const checksumString = values + encryptionKey;

    // Generate MD5 hash
    return crypto.createHash('md5').update(checksumString).digest('hex');
};
```

## Testing PayGate Integration

### Test Cards

PayGate provides test card numbers for sandbox testing:

**Visa**
- Card Number: `4000000000000002`
- CVV: `123`
- Expiry: Any future date

**Mastercard**
- Card Number: `5200000000000015`
- CVV: `123`
- Expiry: Any future date

### Test Workflow

1. Start your development servers:
   ```bash
   # Backend
   cd backend
   npm run dev

   # Frontend
   cd frontend
   npm run dev
   ```

2. Navigate to checkout: `http://localhost:3000/checkout`

3. Fill in test customer information

4. Select "Pay with PayGate"

5. You'll be redirected to PayGate's test page

6. Use test card details above

7. Complete payment and verify redirect

## Webhook Configuration

For production, you need to configure your webhook URL in PayGate dashboard:

1. Log into PayGate dashboard
2. Go to **Settings** > **Webhook Configuration**
3. Add your notify URL: `https://api.yourdomain.com/api/payments/notify`
4. Save changes

**Important:** Your webhook endpoint must be publicly accessible. Use ngrok for local testing:

```bash
ngrok http 5000
# Use the ngrok URL for BACKEND_URL in .env
```

## Troubleshooting

### Payment Initiation Fails

- **Check credentials**: Verify PAYGATE_ID and PAYGATE_SECRET are correct
- **Check URLs**: Ensure FRONTEND_URL and BACKEND_URL are set
- **Check order**: Verify order exists and is not already paid

### Checksum Mismatch

- **Secret key**: Ensure PAYGATE_SECRET matches PayGate dashboard
- **Data encoding**: Verify URL encoding matches PayGate requirements
- **Field order**: Data must be sorted alphabetically for checksum

### Webhook Not Received

- **Public URL**: Webhook URL must be publicly accessible
- **HTTPS**: Production webhooks require HTTPS
- **Response**: Always return "OK" (200) to PayGate
- **Firewall**: Check if PayGate IPs are blocked

### Payment Shows as Pending

- **Wait time**: Webhook may take 30-60 seconds
- **Manual query**: Use verify endpoint to check status
- **Check logs**: Review backend console for webhook logs

## Support and Resources

- **PayGate Documentation**: [https://docs.paygate.co.za](https://docs.paygate.co.za)
- **PayGate Support**: [support@paygate.co.za](mailto:support@paygate.co.za)
- **Test Environment**: [https://secure.paygate.co.za](https://secure.paygate.co.za)

## Files Modified/Created

### Backend
- `controllers/paygateController.js` - Payment processing logic
- `routes/paymentRoutes.js` - API routes
- `server.js` - Route registration
- `.env.example` - Environment variable template

### Frontend
- `lib/paygate.js` - PayGate helper functions
- `app/checkout/page.js` - Checkout page with PayGate option
- `app/order-confirmation/page.js` - Order verification

## Next Steps

1. ✅ Set up PayGate credentials in `.env`
2. ✅ Test with sandbox credentials
3. ✅ Verify webhook receives notifications
4. ✅ Test complete payment flow
5. ⏳ Apply for production PayGate account
6. ⏳ Update to production credentials
7. ⏳ Configure production webhook URL
8. ⏳ Test production payments

## Security Best Practices

1. **Never commit credentials**: Keep `.env` in `.gitignore`
2. **Use HTTPS**: Always use HTTPS in production
3. **Validate webhooks**: Always verify checksums
4. **Log transactions**: Keep audit trail of all payments
5. **Monitor failures**: Set up alerts for failed payments
6. **Test regularly**: Verify integration after updates

---

**Need help?** Contact your development team or PayGate support.
