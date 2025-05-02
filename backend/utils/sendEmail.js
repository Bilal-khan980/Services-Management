const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  let transporter;

  // Check if using Microsoft 365
  if (process.env.EMAIL_PROVIDER === 'microsoft365') {
    transporter = nodemailer.createTransport({
      host: 'smtp.office365.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        ciphers: 'SSLv3'
      }
    });
  } else if (process.env.EMAIL_PROVIDER === 'gmail') {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  } else {
    // Default email service
    transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  // Prepare email message
  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  // Add HTML content if provided
  if (options.html) {
    message.html = options.html;
  }

  // Add attachments if provided
  if (options.attachments) {
    message.attachments = options.attachments;
  }

  try {
    const info = await transporter.sendMail(message);
    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = sendEmail;
