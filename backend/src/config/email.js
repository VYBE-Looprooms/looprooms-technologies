const nodemailer = require('nodemailer');
const path = require('path');

// Create transporter based on configuration
const createTransporter = () => {
  if (process.env.SENDGRID_API_KEY) {
    // SendGrid configuration
    return nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  } else {
    // SMTP configuration (Gmail, etc.)
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
};

const transporter = createTransporter();

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email service connection failed:', error);
  } else {
    console.log('✅ Email service ready');
  }
});

// Email templates
const emailTemplates = {
  waitlistUser: {
    subject: 'Welcome to Vybe - You\'re on the waitlist! 🎉',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="cid:logo" alt="Vybe Logo" style="max-width: 150px; height: auto;">
        </div>
        
        <h1 style="color: #4F46E5; text-align: center; margin-bottom: 20px;">Welcome to Vybe!</h1>
        
        <p style="font-size: 16px; line-height: 1.6; color: #374151;">Hi there!</p>
        
        <p style="font-size: 16px; line-height: 1.6; color: #374151;">
          Thank you for joining the Vybe waitlist! We're excited to have you as part of our community.
        </p>
        
        <p style="font-size: 16px; line-height: 1.6; color: #374151;">
          Vybe is a mood-driven platform where you can connect with others through Looprooms - 
          interactive spaces for growth, wellness, and community. Whether you're looking to improve 
          your mood, learn something new, or connect with like-minded people, Vybe has something for you.
        </p>
        
        <div style="background: #F6F7F9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #4F46E5; margin-top: 0;">What to expect:</h3>
          <ul style="color: #374151; line-height: 1.6;">
            <li>Early access to Vybe when we launch</li>
            <li>Exclusive updates on new features</li>
            <li>Priority access to creator tools</li>
            <li>Community updates and wellness tips</li>
          </ul>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6; color: #374151;">
          We'll keep you updated on our progress and let you know as soon as Vybe is ready for you to explore.
        </p>
        
        <p style="font-size: 16px; line-height: 1.6; color: #374151;">
          Feel better, together. 💜
        </p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
          <p style="color: #6B7280; font-size: 14px;">
            The Vybe Team<br>
            <a href="mailto:${process.env.CONTACT_EMAIL}" style="color: #4F46E5;">${process.env.CONTACT_EMAIL}</a>
          </p>
        </div>
      </div>
    `
  },

  waitlistCreator: {
    subject: 'Welcome to Vybe Creators - You\'re on the waitlist! 🎨',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="cid:logo" alt="Vybe Logo" style="max-width: 150px; height: auto;">
        </div>
        
        <h1 style="color: #4F46E5; text-align: center; margin-bottom: 20px;">Welcome to Vybe Creators!</h1>
        
        <p style="font-size: 16px; line-height: 1.6; color: #374151;">Hello Creator!</p>
        
        <p style="font-size: 16px; line-height: 1.6; color: #374151;">
          Thank you for your interest in becoming a Vybe Creator! We're thrilled to have you join our 
          community of verified creators who are passionate about helping others grow and feel better.
        </p>
        
        <div style="background: linear-gradient(135deg, #4F46E5 0%, #8B8DF7 100%); color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: white;">As a Vybe Creator, you'll be able to:</h3>
          <ul style="line-height: 1.6;">
            <li>Create and host Looprooms for your community</li>
            <li>Share unique room links with your audience</li>
            <li>Post content to the Vybe feed</li>
            <li>Build Loopchains - guided experiences for growth</li>
            <li>Connect with users through positive-only interactions</li>
          </ul>
        </div>
        
        <div style="background: #FEF3C7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B;">
          <h3 style="color: #92400E; margin-top: 0;">📋 Creator Verification Process</h3>
          <p style="color: #92400E; margin-bottom: 0;">
            To ensure trust and safety in our community, all creators go through a verification process 
            that includes ID verification and selfie confirmation. We'll guide you through this when 
            the platform launches.
          </p>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6; color: #374151;">
          We'll keep you updated on our progress and provide you with early access to creator tools 
          and documentation as we get closer to launch.
        </p>
        
        <p style="font-size: 16px; line-height: 1.6; color: #374151;">
          Ready to help others feel better, together? 💜
        </p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
          <p style="color: #6B7280; font-size: 14px;">
            The Vybe Creator Team<br>
            <a href="mailto:creators@vybe.com" style="color: #4F46E5;">creators@vybe.com</a>
          </p>
        </div>
      </div>
    `
  },

  contactConfirmation: {
    subject: 'We received your message - Vybe Team',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="cid:logo" alt="Vybe Logo" style="max-width: 150px; height: auto;">
        </div>
        
        <h1 style="color: #4F46E5; text-align: center; margin-bottom: 20px;">Thank you for contacting us!</h1>
        
        <p style="font-size: 16px; line-height: 1.6; color: #374151;">Hi {{name}},</p>
        
        <p style="font-size: 16px; line-height: 1.6; color: #374151;">
          Thank you for reaching out to the Vybe team! We've received your message and will get back 
          to you as soon as possible.
        </p>
        
        <div style="background: #F0F9FF; border-left: 4px solid #0EA5E9; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
          <p style="margin: 0; color: #0C4A6E; font-weight: 500;">
            {{typeMessage}}
          </p>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6; color: #374151;">
          Our team typically responds within 24-48 hours during business days. If your inquiry is urgent, 
          please don't hesitate to follow up.
        </p>
        
        <p style="font-size: 16px; line-height: 1.6; color: #374151;">
          In the meantime, feel free to check out our platform and join our waitlist if you haven't already!
        </p>
        
        <p style="font-size: 16px; line-height: 1.6; color: #374151;">
          Feel better, together. 💜
        </p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
          <p style="color: #6B7280; font-size: 14px;">
            The Vybe Team<br>
            <a href="mailto:${process.env.CONTACT_EMAIL}" style="color: #4F46E5;">${process.env.CONTACT_EMAIL}</a>
          </p>
        </div>
      </div>
    `
  },

  contactNotification: {
    subject: 'New {{type}} Contact - {{subject}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="display: flex; align-items: center; margin-bottom: 20px;">
          <h1 style="color: #4F46E5; margin: 0; flex-grow: 1;">New Contact Form Submission</h1>
          <span style="background: {{typeColor}}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase;">{{type}}</span>
        </div>
        
        <div style="background: #F6F7F9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <p style="margin: 0;"><strong>Name:</strong> {{name}}</p>
            <p style="margin: 0;"><strong>Email:</strong> <a href="mailto:{{email}}" style="color: #4F46E5;">{{email}}</a></p>
            <p style="margin: 0;"><strong>Type:</strong> {{typeLabel}}</p>
            <p style="margin: 0;"><strong>Timestamp:</strong> {{timestamp}}</p>
          </div>
          <p style="margin: 15px 0 0 0;"><strong>Subject:</strong> {{subject}}</p>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #E5E7EB;">
          <h3 style="color: #374151; margin-top: 0;">Message:</h3>
          <p style="color: #374151; line-height: 1.6; white-space: pre-wrap;">{{message}}</p>
        </div>
        
        <div style="background: {{priorityBg}}; border-left: 4px solid {{priorityColor}}; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
          <p style="margin: 0; color: {{priorityTextColor}}; font-weight: 500;">
            {{priorityMessage}}
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="mailto:{{email}}?subject=Re: {{subject}}" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">Reply to {{name}}</a>
        </div>
        
        <p style="color: #6B7280; font-size: 14px; margin-top: 20px; text-align: center;">
          Message ID: {{id}} | Admin Panel: <a href="${process.env.FRONTEND_URL}/admin/contacts" style="color: #4F46E5;">View All Messages</a>
        </p>
      </div>
    `
  },

  adminPasswordReset: {
    subject: 'Admin Password Reset - Vybe',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #4F46E5 0%, #8B8DF7 100%); border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <circle cx="12" cy="16" r="1"></circle>
              <path d="m7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
        </div>
        
        <h1 style="color: #4F46E5; text-align: center; margin-bottom: 20px;">Password Reset Request</h1>
        
        <p style="font-size: 16px; line-height: 1.6; color: #374151;">Hi {{name}},</p>
        
        <p style="font-size: 16px; line-height: 1.6; color: #374151;">
          We received a request to reset your admin password for the Vybe platform. If you didn't make this request, you can safely ignore this email.
        </p>
        
        <div style="background: #F0F9FF; border: 2px solid #0EA5E9; border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center;">
          <h2 style="color: #0C4A6E; margin: 0 0 15px 0; font-size: 18px;">Your Reset Code</h2>
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 15px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #4F46E5; letter-spacing: 8px; font-family: 'Courier New', monospace;">{{resetCode}}</span>
          </div>
          <p style="color: #0C4A6E; margin: 15px 0 0 0; font-size: 14px;">
            This code expires in 15 minutes
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{resetLink}}" style="background: #4F46E5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; transition: all 0.3s;">
            Reset Password Now
          </a>
        </div>
        
        <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
          <p style="margin: 0; color: #92400E; font-size: 14px;">
            <strong>Security Note:</strong> If you didn't request this password reset, please contact the system administrator immediately. This code will expire in 15 minutes for your security.
          </p>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6; color: #374151;">
          If the button above doesn't work, you can also copy and paste this link into your browser:
        </p>
        
        <p style="font-size: 14px; color: #6B7280; word-break: break-all; background: #F9FAFB; padding: 10px; border-radius: 4px;">
          {{resetLink}}
        </p>
        
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
          <p style="color: #6B7280; font-size: 14px;">
            Vybe Admin Security Team<br>
            <a href="mailto:${process.env.CONTACT_EMAIL}" style="color: #4F46E5;">${process.env.CONTACT_EMAIL}</a>
          </p>
        </div>
      </div>
    `
  }
};

// Send email function
const sendEmail = async (to, template, data = {}, attachments = []) => {
  try {
    const emailTemplate = emailTemplates[template];
    if (!emailTemplate) {
      throw new Error(`Email template '${template}' not found`);
    }

    let html = emailTemplate.html;
    
    // Replace template variables
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, data[key]);
    });

    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to,
      subject: emailTemplate.subject,
      html,
      attachments
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw error;
  }
};

module.exports = {
  sendEmail,
  emailTemplates
};