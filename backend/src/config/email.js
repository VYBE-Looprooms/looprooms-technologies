const nodemailer = require("nodemailer");
const path = require("path");

// Create transporter based on configuration
const createTransporter = () => {
  if (process.env.SENDGRID_API_KEY) {
    // SendGrid configuration
    return nodemailer.createTransport({
      service: "SendGrid",
      auth: {
        user: "apikey",
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  } else {
    // SMTP configuration (Gmail, etc.)
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
};

const transporter = createTransporter();

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email service connection failed:", error);
  } else {
    console.log("✅ Email service ready");
  }
});

// Email templates
const emailTemplates = {
  // Authentication templates
  emailVerification: {
    subject: "Verify Your Vybe Account 🔐",
    html: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Verify Your Email</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1a202c; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Hi ${data.name}! 👋</h2>
            
            <p style="color: #4a5568; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
              Welcome to Vybe! Please verify your email address to complete your account setup and start exploring Looprooms.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #718096; line-height: 1.6; margin: 20px 0; font-size: 14px; text-align: center;">
              Or copy and paste this link in your browser:<br>
              <a href="${data.verificationUrl}" style="color: #667eea; word-break: break-all;">${data.verificationUrl}</a>
            </p>
            
            <div style="background-color: #fef5e7; border-left: 4px solid #f6ad55; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <p style="color: #744210; margin: 0; font-size: 14px;">
                <strong>Security Note:</strong> This verification link will expire in 24 hours. If you didn't create this account, please ignore this email.
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #718096; margin: 0; font-size: 14px;">
              © 2024 Vybe Technologies. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  },

  passwordReset: {
    subject: "Reset Your Vybe Password 🔑",
    html: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Reset Your Password</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1a202c; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Hi ${data.name}! 🔐</h2>
            
            <p style="color: #4a5568; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
              We received a request to reset your Vybe account password. Click the button below to create a new password.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #718096; line-height: 1.6; margin: 20px 0; font-size: 14px; text-align: center;">
              Or copy and paste this link in your browser:<br>
              <a href="${data.resetUrl}" style="color: #667eea; word-break: break-all;">${data.resetUrl}</a>
            </p>
            
            <div style="background-color: #fed7d7; border-left: 4px solid #fc8181; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <p style="color: #742a2a; margin: 0; font-size: 14px;">
                <strong>Security Note:</strong> This reset link will expire in 1 hour. If you didn't request this reset, please ignore this email and your password will remain unchanged.
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #718096; margin: 0; font-size: 14px;">
              © 2024 Vybe Technologies. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  },
  waitlistUser: {
    subject: "Welcome to Vybe - You're on the waitlist! 🎉",
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
    `,
  },

  waitlistCreator: {
    subject: "Welcome to Vybe Creators - You're on the waitlist! 🎨",
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
    `,
  },

  contactConfirmation: {
    subject: "We received your message - Vybe Team",
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
    `,
  },

  contactNotification: {
    subject: "New {{type}} Contact - {{subject}}",
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
    `,
  },

  adminPasswordReset: {
    subject: "Admin Password Reset - Vybe",
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="cid:logo" alt="Vybe Logo" style="max-width: 150px; height: auto;">
        </div>
        
        <h1 style="color: #4F46E5; text-align: center; margin-bottom: 20px;">Password Reset Request</h1>
        
        <p style="font-size: 16px; line-height: 1.6; color: #374151;">Hi ${
          data.name || "Admin"
        },</p>
        
        <p style="font-size: 16px; line-height: 1.6; color: #374151;">
          We received a request to reset your admin password for the Vybe platform. If you didn't make this request, you can safely ignore this email.
        </p>
        
        <div style="background: #F0F9FF; border: 2px solid #0EA5E9; border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center;">
          <h2 style="color: #0C4A6E; margin: 0 0 15px 0; font-size: 18px;">Your Reset Code</h2>
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 15px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #4F46E5; letter-spacing: 8px; font-family: 'Courier New', monospace;">${
              data.resetCode
            }</span>
          </div>
          <p style="color: #0C4A6E; margin: 15px 0 0 0; font-size: 14px;">
            This code expires in 15 minutes
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${
            data.resetLink || "#"
          }" style="background: #4F46E5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; transition: all 0.3s;">
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
          ${data.resetLink || "Reset link not provided"}
        </p>
        
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
          <p style="color: #6B7280; font-size: 14px;">
            Vybe Admin Security Team<br>
            <a href="mailto:${
              process.env.CONTACT_EMAIL
            }" style="color: #4F46E5;">${process.env.CONTACT_EMAIL}</a>
          </p>
        </div>
      </div>
    `,
  },

  suggestionConfirmation: {
    subject: "Looproom Suggestion Received - Thank You! 🎉",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="cid:logo" alt="Vybe Logo" style="max-width: 150px; height: auto;">
        </div>
        
        <h1 style="color: #4F46E5; text-align: center; margin-bottom: 20px;">Thank You for Your Suggestion!</h1>
        
        <p style="font-size: 16px; line-height: 1.6; color: #374151;">Hi {{name}},</p>
        
        <p style="font-size: 16px; line-height: 1.6; color: #374151;">
          Thank you for suggesting a new Looproom! We're excited to review your idea for 
          <strong>"{{looproomName}}"</strong> and see how it can help our community grow.
        </p>
        
        <div style="background: #F0F9FF; border-left: 4px solid #0EA5E9; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
          <h3 style="color: #0C4A6E; margin-top: 0;">Your Suggestion Summary:</h3>
          <p style="margin: 10px 0; color: #0C4A6E;"><strong>Looproom Name:</strong> {{looproomName}}</p>
          <p style="margin: 10px 0; color: #0C4A6E;"><strong>Purpose:</strong> {{purpose}}</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #4F46E5 0%, #8B8DF7 100%); color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: white;">✨ Founder's Badge Opportunity</h3>
          <p style="line-height: 1.6; margin-bottom: 0;">
            If your Looproom gets implemented, you'll earn an exclusive <strong>Founder's Badge</strong> 
            with recognition, early creator perks, and priority visibility as our ecosystem grows!
          </p>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6; color: #374151;">
          Our team will review your suggestion and get back to you within 5-7 business days. 
          We'll keep you updated on the status and next steps.
        </p>
        
        <p style="font-size: 16px; line-height: 1.6; color: #374151;">
          Thank you for helping us build the future of emotional tech! 💜
        </p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
          <p style="color: #6B7280; font-size: 14px;">
            The Vybe Team<br>
            <a href="mailto:${process.env.CONTACT_EMAIL}" style="color: #4F46E5;">${process.env.CONTACT_EMAIL}</a>
          </p>
        </div>
      </div>
    `,
  },

  suggestionNotification: {
    subject: "New Looproom Suggestion - {{looproomName}}",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="display: flex; align-items: center; margin-bottom: 20px;">
          <h1 style="color: #4F46E5; margin: 0; flex-grow: 1;">New Looproom Suggestion</h1>
          <span style="background: #10B981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase;">SUGGESTION</span>
        </div>
        
        <div style="background: #F6F7F9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <p style="margin: 0;"><strong>Name:</strong> {{firstName}} {{lastName}}</p>
            <p style="margin: 0;"><strong>Email:</strong> <a href="mailto:{{email}}" style="color: #4F46E5;">{{email}}</a></p>
            <p style="margin: 0;"><strong>Country:</strong> {{country}}</p>
            <p style="margin: 0;"><strong>Timestamp:</strong> {{timestamp}}</p>
          </div>
          <p style="margin: 15px 0 0 0;"><strong>Looproom Name:</strong> "{{looproomName}}"</p>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #E5E7EB;">
          <h3 style="color: #374151; margin-top: 0;">Purpose & Benefits:</h3>
          <p style="color: #374151; line-height: 1.6; white-space: pre-wrap;">{{purpose}}</p>
        </div>
        
        <div style="background: #ECFDF5; border-left: 4px solid #10B981; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
          <p style="margin: 0; color: #065F46; font-weight: 500;">
            Review this suggestion and consider it for implementation. If approved, the suggester will earn a Founder's Badge!
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL}/admin/suggestions" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin-right: 10px;">View in Admin Panel</a>
          <a href="mailto:{{email}}?subject=Re: Looproom Suggestion - {{looproomName}}" style="background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">Reply to {{firstName}}</a>
        </div>
        
        <p style="color: #6B7280; font-size: 14px; margin-top: 20px; text-align: center;">
          Suggestion ID: {{id}} | Admin Panel: <a href="${process.env.FRONTEND_URL}/admin/suggestions" style="color: #4F46E5;">Manage All Suggestions</a>
        </p>
      </div>
    `,
  },

  suggestionStatusUpdate: {
    subject: "Looproom Suggestion Update - {{looproomName}}",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="cid:logo" alt="Vybe Logo" style="max-width: 150px; height: auto;">
        </div>
        
        <h1 style="color: #4F46E5; text-align: center; margin-bottom: 20px;">Update About Your Suggestion!</h1>
        
        <p style="font-size: 16px; line-height: 1.6; color: #374151;">Hi {{name}},</p>
        
        <p style="font-size: 16px; line-height: 1.6; color: #374151;">
          We have an update about your Looproom suggestion for <strong>"{{looproomName}}"</strong>!
        </p>
        
        <div style="background: #F0F9FF; border: 2px solid #0EA5E9; border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center;">
          <h2 style="color: #0C4A6E; margin: 0 0 15px 0; font-size: 20px;">{{statusMessage}}</h2>
        </div>
        
        <div style="background: {{statusBgGradient}}; color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: white;">{{statusTitle}}</h3>
          <p style="line-height: 1.6; margin-bottom: 0;">
            {{statusExtraContent}}
          </p>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6; color: #374151;">
          Thank you for helping us build a better Vybe community. Your contribution makes a real difference!
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
    `,
  },

  // Creator verification templates
  creatorApproved: {
    subject: "Congratulations! Your Vybe Creator Application is Approved 🎉",
    html: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Creator Application Approved</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="cid:logo" alt="Vybe Logo" style="max-width: 120px; height: auto;">
            </div>
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">🎉 Congratulations!</h1>
            <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">You're now a Vybe Creator!</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1a202c; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Hi ${data.name}! 🌟</h2>
            
            <p style="color: #4a5568; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
              Fantastic news! Your creator application has been approved and you now have full access to Vybe's creator tools and features.
            </p>
            
            <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 25px; border-radius: 12px; margin: 25px 0;">
              <h3 style="margin-top: 0; color: white; font-size: 18px;">🚀 What You Can Do Now:</h3>
              <ul style="line-height: 1.8; margin: 15px 0; padding-left: 20px;">
                <li>Create and host your own Looprooms</li>
                <li>Share unique room links with your community</li>
                <li>Post content to the Vybe feed</li>
                <li>Build Loopchains for guided experiences</li>
                <li>Connect with users through positive interactions</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Access Creator Dashboard
              </a>
            </div>
            
            <div style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <p style="color: #0c4a6e; margin: 0; font-size: 14px;">
                <strong>Next Steps:</strong> Log in to your account to access the creator dashboard and start building your first Looproom. Our creator guide will help you get started!
              </p>
            </div>
            
            <p style="color: #4a5568; line-height: 1.6; margin: 20px 0; font-size: 16px;">
              Welcome to the Vybe creator community! We're excited to see the positive impact you'll make.
            </p>
            
            <p style="color: #4a5568; line-height: 1.6; margin: 0; font-size: 16px;">
              Feel better, together. 💜
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #718096; margin: 0; font-size: 14px;">
              The Vybe Creator Team<br>
              <a href="mailto:creators@vybe.com" style="color: #667eea;">creators@vybe.com</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  },

  creatorRejected: {
    subject: "Update on Your Vybe Creator Application",
    html: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Creator Application Update</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="cid:logo" alt="Vybe Logo" style="max-width: 120px; height: auto;">
            </div>
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Application Update</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1a202c; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Hi ${data.name},</h2>
            
            <p style="color: #4a5568; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
              Thank you for your interest in becoming a Vybe Creator. After careful review, we're unable to approve your application at this time.
            </p>
            
            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <h3 style="color: #dc2626; margin-top: 0; font-size: 16px;">Reason for Decision:</h3>
              <p style="color: #dc2626; margin: 0; font-size: 14px; line-height: 1.6;">
                ${data.rejectionReason}
              </p>
            </div>
            
            <div style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <h3 style="color: #0c4a6e; margin-top: 0; font-size: 16px;">📅 Reapplication Available:</h3>
              <p style="color: #0c4a6e; margin: 0; font-size: 14px;">
                You can submit a new application starting <strong>${data.canReapplyDate}</strong>. We encourage you to address the feedback above and reapply when ready.
              </p>
            </div>
            
            <p style="color: #4a5568; line-height: 1.6; margin: 20px 0; font-size: 16px;">
              In the meantime, you can still enjoy Vybe as a user, join Looprooms, and engage with our community. We appreciate your understanding and look forward to potentially welcoming you as a creator in the future.
            </p>
            
            <p style="color: #4a5568; line-height: 1.6; margin: 20px 0; font-size: 16px;">
              If you have questions about this decision, please don't hesitate to reach out to our support team.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="mailto:${data.supportEmail}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Contact Support
              </a>
            </div>
            
            <p style="color: #4a5568; line-height: 1.6; margin: 0; font-size: 16px;">
              Feel better, together. 💜
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #718096; margin: 0; font-size: 14px;">
              The Vybe Team<br>
              <a href="mailto:${data.supportEmail}" style="color: #667eea;">${data.supportEmail}</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  },

  adminAccountCreated: {
    subject: "Your Vybe Admin Account - Welcome to the Team!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="cid:logo" alt="Vybe Logo" style="max-width: 150px; height: auto;">
        </div>
        
        <h1 style="color: #4F46E5; text-align: center; margin-bottom: 20px;">Welcome to Vybe Admin!</h1>
        
        <p style="font-size: 16px; line-height: 1.6; color: #374151;">Hi {{name}},</p>
        
        <p style="font-size: 16px; line-height: 1.6; color: #374151;">
          Welcome to the Vybe admin team! Your admin account has been created and you now have access to the Vybe admin panel.
        </p>
        
        <div style="background: #F0F9FF; border: 2px solid #0EA5E9; border-radius: 12px; padding: 30px; margin: 30px 0;">
          <h2 style="color: #0C4A6E; margin: 0 0 20px 0; font-size: 18px; text-align: center;">Your Account Details</h2>
          
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 15px 0;">
            <div style="display: grid; gap: 15px;">
              <div>
                <strong style="color: #374151;">Email:</strong>
                <span style="color: #4F46E5; font-family: 'Courier New', monospace;">{{email}}</span>
              </div>
              <div>
                <strong style="color: #374151;">Role:</strong>
                <span style="background: #E0E7FF; color: #3730A3; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase;">{{role}}</span>
              </div>
              <div>
                <strong style="color: #374151;">Temporary Password:</strong>
                <div style="background: #FEF3C7; border: 1px solid #F59E0B; border-radius: 6px; padding: 12px; margin-top: 8px;">
                  <span style="font-family: 'Courier New', monospace; font-size: 18px; font-weight: bold; color: #92400E; letter-spacing: 2px;">{{tempPassword}}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{loginLink}}" style="background: #4F46E5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; transition: all 0.3s;">
            Access Admin Panel
          </a>
        </div>
        
        <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
          <p style="margin: 0; color: #92400E; font-size: 14px;">
            <strong>Important Security Note:</strong> Please change your password immediately after your first login. This temporary password should only be used for your initial access.
          </p>
        </div>
        
        <div style="background: #F6F7F9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">As a {{roleLabel}}, you can:</h3>
          <ul style="color: #374151; line-height: 1.6; margin: 0;">
            {{permissions}}
          </ul>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6; color: #374151;">
          If you have any questions or need help getting started, don't hesitate to reach out to the admin team.
        </p>
        
        <p style="font-size: 16px; line-height: 1.6; color: #374151;">
          Welcome to the team! 💜
        </p>
        
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
          <p style="color: #6B7280; font-size: 14px;">
            Vybe Admin Team<br>
            <a href="mailto:${process.env.CONTACT_EMAIL}" style="color: #4F46E5;">${process.env.CONTACT_EMAIL}</a>
          </p>
        </div>
      </div>
    `,
  },
};

module.exports = {
  transporter,
  emailTemplates,
};
