# Vybe - Mood-Driven Creator Platform

A modern, full-stack platform where users connect through mood-guided Looprooms and creator-led experiences. Built with Next.js, Node.js, and PostgreSQL.

## 🚀 Features

### Frontend (Next.js)
- **Modern Landing Page**: Professional design with GSAP animations
- **Waitlist System**: Email capture with user/creator type selection
- **Contact Form**: Multi-type contact form with email notifications
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark/Light Mode**: Theme switching with next-themes
- **Email Pre-filling**: Seamless flow from landing page to waitlist

### Backend (Node.js + Express)
- **Email Automation**: Professional HTML emails with logo attachments
- **Waitlist Management**: User and creator signup with validation
- **Contact Form Processing**: Multi-type message handling
- **Database Integration**: PostgreSQL with Sequelize ORM
- **Security**: Rate limiting, CORS, input validation
- **Email Templates**: Separate templates for users, creators, and confirmations

## 🛠 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **Tailwind CSS v4** - Utility-first CSS framework
- **shadcn/ui** - Accessible UI components
- **GSAP** - High-performance animations
- **TypeScript** - Type safety and better DX

### Backend
- **Node.js + Express** - Server and API framework
- **PostgreSQL** - Relational database
- **Sequelize** - ORM for database operations
- **Nodemailer** - Email sending (SMTP/SendGrid support)
- **Joi** - Input validation
- **Rate Limiting** - API protection

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Email service (Gmail SMTP or SendGrid)

### Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd vybe-platform
```

2. **Set up the backend**
```bash
cd backend
node setup.js
```

3. **Configure environment variables**
```bash
# Edit backend/.env with your settings
cp .env.example .env
```

4. **Set up the frontend**
```bash
cd ../frontend
npm install
cp .env.local.example .env.local
```

5. **Add your logo**
```bash
# Place Logo_To_Send.png in backend/assets/
```

6. **Start development servers**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

## ⚙️ Configuration

### Backend Environment Variables

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/vybe_db

# Email (Choose SMTP or SendGrid)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# OR SendGrid
SENDGRID_API_KEY=your-sendgrid-api-key

# Email Settings
FROM_EMAIL=noreply@vybe.com
FROM_NAME=Vybe Team
CONTACT_EMAIL=contact@vybe.com

# Security
JWT_SECRET=your-super-secret-jwt-key
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
FRONTEND_URL=http://localhost:3000
```

### Frontend Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 📧 Email Setup

### Option 1: Gmail SMTP
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password in Google Account settings
3. Use your Gmail address and App Password in the .env file

### Option 2: SendGrid
1. Create a SendGrid account
2. Generate an API key
3. Add the API key to your .env file

## 🗄️ Database Schema

The backend automatically creates these tables:

### Waitlist
- User and creator signups
- Email, name, type, interests
- Timestamps for tracking

### Contact Messages  
- Contact form submissions
- Name, email, subject, message, type
- Status tracking for admin management

### Users (Future)
- User authentication and profiles
- Creator verification system

## 🔄 User Flow

### Landing Page → Waitlist
1. User enters email on landing page
2. Clicks "Join Beta" or "Creator" link
3. Redirects to `/waitlist?type=user&email=...`
4. Email is pre-filled, user completes form
5. Backend sends welcome email with logo
6. Success confirmation displayed

### Contact Form
1. User fills out contact form
2. Backend processes and sends confirmation email
3. Team receives notification email
4. Success message displayed

## 📡 API Endpoints

### Waitlist
- `POST /api/waitlist` - Add user to waitlist
- `GET /api/waitlist/stats` - Get signup statistics

### Contact
- `POST /api/contact` - Submit contact form
- `GET /api/contact/messages` - Get messages (admin)

### Health
- `GET /api/health` - Health check

## 🎨 Email Templates

Professional HTML email templates included:

1. **Waitlist User**: Welcome email for regular users
2. **Waitlist Creator**: Welcome email for creators with verification info  
3. **Contact Confirmation**: Confirmation for contact form submissions
4. **Contact Notification**: Internal team notifications

All emails include:
- Vybe logo attachment
- Professional styling
- Responsive design
- Brand colors

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy to Vercel
```

### Backend (Railway/Render)
```bash
cd backend
npm run build
# Deploy to your preferred platform
```

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure production database URL
3. Set up email service credentials
4. Update CORS settings for production domain

## 🔒 Security Features

- **Rate Limiting**: Prevents spam and abuse
- **Input Validation**: Joi schema validation
- **CORS Protection**: Configured for specific domains
- **SQL Injection Protection**: Sequelize ORM
- **Email Validation**: Proper format checking
- **Error Handling**: Graceful error responses

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Balanced layouts for tablets
- **Desktop Enhanced**: Full features on desktop
- **Touch Friendly**: Proper touch targets and gestures

## 🎯 Performance

- **GSAP Animations**: 60fps smooth animations
- **Image Optimization**: Next.js automatic optimization
- **Code Splitting**: Automatic with Next.js App Router
- **CSS Optimization**: Tailwind purging and minification
- **Database Indexing**: Optimized queries with indexes

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests (when added)
cd frontend
npm test
```

## 📝 Development

### Adding New Features

1. **Backend Routes**: Add to `src/routes/`
2. **Database Models**: Update `src/models/`
3. **Email Templates**: Modify `src/config/email.js`
4. **Frontend Pages**: Add to `src/app/`
5. **Components**: Create in `src/components/`

### Code Style

- **TypeScript**: Use TypeScript for frontend
- **ESLint**: Follow linting rules
- **Prettier**: Code formatting
- **Conventional Commits**: Use semantic commit messages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is part of the Vybe platform development.

## 🆘 Support

- **Email**: developers@vybe.com
- **Documentation**: Check the `/docs` folder
- **Issues**: Create GitHub issues for bugs

---

Built with ❤️ for the Vybe community