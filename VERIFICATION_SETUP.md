# Email & SMS Verification Setup Guide

This guide will help you set up real email and SMS verification for your app.

## 📧 Email Verification (Resend)

### 1. Create a Resend Account
- Go to [resend.com](https://resend.com)
- Sign up for a free account (3,000 emails/month free)

### 2. Get Your API Key
- Go to [API Keys](https://resend.com/api-keys)
- Click "Create API Key"
- Copy the key (starts with `re_`)

### 3. Configure Your Domain (Optional but Recommended)
- Go to [Domains](https://resend.com/domains)
- Add your domain and verify it
- If you don't have a domain, you can use `onboarding@resend.dev` for testing

### 4. Add to .env File
```env
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@yourdomain.com
```

## 📱 SMS Verification (Twilio)

### 1. Create a Twilio Account
- Go to [twilio.com](https://www.twilio.com/try-twilio)
- Sign up for a free trial ($15 credit)

### 2. Get Your Credentials
- Go to [Console Dashboard](https://console.twilio.com/)
- Find your **Account SID** and **Auth Token**

### 3. Get a Phone Number
- Go to [Phone Numbers](https://console.twilio.com/us1/develop/phone-numbers/manage/incoming)
- Click "Buy a number"
- Choose a number with SMS capabilities
- Complete the purchase (uses trial credit)

### 4. Add to .env File
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

## 🧪 Development Mode

If you don't configure the services, the system will automatically fall back to **dev mode**:
- Verification codes will be logged to the console
- No actual emails or SMS will be sent
- Perfect for local development and testing

## 💰 Pricing

### Resend
- **Free Tier**: 3,000 emails/month
- **Pro**: $20/month for 50,000 emails

### Twilio
- **Trial**: $15 credit (can send ~500 SMS)
- **Pay-as-you-go**: ~$0.0075 per SMS in the US
- More expensive for international SMS

## 🚀 Testing

1. Without configuration:
   - Start your app
   - Try to send a verification code
   - Check the console for the code

2. With configuration:
   - Add your API keys to `.env`
   - Restart your app
   - Send verification codes
   - Check your email/phone for real codes!

## 🔒 Security Notes

- Never commit your `.env` file to Git
- Keep your API keys secure
- Use environment variables in production
- Consider rate limiting to prevent abuse
