const { transporter, emailTemplates } = require('../config/email');
const path = require('path');

const sendEmail = async ({ to, subject, template, data, attachments = [] }) => {
  try {
    let emailContent;
    
    if (template && emailTemplates[template]) {
      // Use predefined template
      const templateConfig = emailTemplates[template];
      emailContent = {
        subject: templateConfig.subject,
        html: typeof templateConfig.html === 'function' 
          ? templateConfig.html(data) 
          : templateConfig.html
      };
    } else {
      // Use custom subject and template
      emailContent = {
        subject,
        html: template
      };
    }

    // Default attachments (logo)
    const defaultAttachments = [
      {
        filename: 'Logo_To_Send.png',
        path: path.join(__dirname, '../../assets/Logo_To_Send.png'),
        cid: 'logo'
      }
    ];

    const mailOptions = {
      from: `${process.env.FROM_NAME || 'Vybe Team'} <${process.env.FROM_EMAIL}>`,
      to,
      subject: emailContent.subject,
      html: emailContent.html,
      attachments: [...defaultAttachments, ...attachments]
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: ${emailContent.subject}`);
    return result;
  } catch (error) {
    console.error(`❌ Email send failed to ${to}:`, error);
    throw error;
  }
};

module.exports = {
  sendEmail
};