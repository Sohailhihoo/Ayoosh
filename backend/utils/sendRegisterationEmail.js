const nodemailer = require('nodemailer');
const dotenv =  require('dotenv')
dotenv.config();
/**
 * Sends a registeration email using Gmail SMTP
 *  to - Recipient email address
 *  subject - Email subject line
 *  htmlContent - The body of the email (HTML supported)
 */
async function sendRegisterationEmail(to) {
  try {
    // 1. Create the transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_DEVUSER, // Your gmail: e.g., "dev@gmail.com"
        pass: process.env.EMAIL_DEVPASS, // Your 16-digit App Password
      },
    });

    

    // 2. Setup email data
 // Assuming 'name' is passed into your function along with 'to'
const mailOptions = {
  from: `"Ayoosh" <${process.env.EMAIL_DEVUSER}>`,
  to: to,
  subject: 'Welcome to Ayoosh! 🛍️',
  text: `Hi, welcome to Ayoosh! Your account is now active. Login here: https://ayooshonline.com/login`, 
  html: `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; padding: 20px; color: #333;">
    
      
      <div style="padding: 30px 10px; text-align: center;">
        <h2 style="color: #2c3e50;"></h2>
        <p style="font-size: 16px; line-height: 1.6;">We’re thrilled to have you! Your account at <strong>Ayoosh</strong> is now active.</p>
        <p style="font-size: 16px; line-height: 1.6;">You can now track your orders, save items to your wishlist, and enjoy a faster checkout experience.</p>
        
        <div style="margin: 30px 0;">
          <a href="https://ayooshonline.com/login" 
             style="background-color: #f5c800; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
             Login to Your Account
          </a>
        </div>
        
        <p style="margin-top: 30px; font-size: 16px;">Happy shopping!<br><strong>The Ayoosh Team</strong></p>

          <div style="text-align: center; border-bottom: 2px solid #f4f4f4; padding-bottom: 20px;">
        <h1 style="color: #f5c800; margin: 0; letter-spacing: 2px;">AYOOSH</h1>
      </div>
      </div>

      <div style="text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 20px;">
        <p>&copy; 2026 Ayoosh. All rights reserved.</p>
        <p>If you didn't create this account, please ignore this email.</p>
      </div>
    </div>
  `
};

    // 3. Send the mail
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ Email sent to: ${to}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email failed:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = sendRegisterationEmail;