const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

async function testEmail() {
  console.log('🧪 Testing Email Sending...');
  console.log('Host:', process.env.SMTP_HOST);
  console.log('User:', process.env.SMTP_USER);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    }
  });

  try {
    await transporter.verify();
    console.log('✅ Gmail SMTP connection verified!');

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: 'grigobio237@gmail.com', // Test recipient
      subject: 'Youniqle Gmail Transition Test',
      text: 'This is a test email to verify Gmail SMTP configuration with App Password.'
    });

    console.log('✅ Email sent via Gmail successfully:', info.messageId);
  } catch (error) {
    console.error('❌ Email test failed:', error);
  }
}

testEmail();
