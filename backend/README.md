# Vybe Backend API

A Node.js/Express backend for the Vybe platform with email automation, waitlist management, and contact form handling.

## 🚀 Features

- **Waitlist Management**: User and creator signup with email automation
- **Contact Form**: Message handling with team notifications
- **Email Templates**: Professional HTML emails with logo attachments
- **Database**: PostgreSQL with Sequelize ORM
- **Security**: Rate limiting, CORS, Helmet protection
- **Validation**: Joi schema validation for all inputs

## 🛠 Tech Stack

- **Framework**: Node.js + Express
- **Database**: PostgreSQL with Sequelize ORM
- **Email**: Nodemailer (SMTP/SendGrid support)
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate limiting
- **Environment**: dotenv

## 📦 Installation

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up PostgreSQL database:
```bash
# Create database
createdb vybe_db

# The app will automatically sync tables on startup
```

5. Add your logo:
```bash
# Place Logo_To_Send.png in backend/assets/ directory
```

## 🔧 Configuration

### Environment Variables

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

### Email Setup

#### Option 1: Gmail SMTP
1. Enable 2-factor authentication
2. Generate an App Password
3. Use your Gmail and App Password in .env

#### Option 2: SendGrid
1. Create SendGrid account
2. Generate API key
3. Add SENDGRID_API_KEY to .env

## 🚀 Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## 📡 API Endpoints

### Waitlist

#### POST /api/waitlist
Add user to waitlist and send welcome email.

**Request:**
```json
{
  "email": "user@example.com",
  "type": "user", // or "creator"
  "name": "John Doe",
  "interests": ["wellness", "productivity"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully added to waitlist!",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "type": "user",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET /api/waitlist/stats
Get waitlist statistics (admin only).

**Response:**
```json
{
  "success": true,
  "data": {
    "total": "150",
    "users": "120",
    "creators": "30",
    "today": "5",
    "thisWeek": "25"
  }
}
```

### Contact

#### POST /api/contact
Submit contact form and send notifications.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Partnership Inquiry",
  "message": "I'd like to discuss a partnership opportunity...",
  "type": "partnership"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully! We'll get back to you soon.",
  "data": {
    "id": 1,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET /api/contact/messages
Get contact messages with pagination (admin only).

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `status`: Filter by status (new, in_progress, resolved, closed)
- `type`: Filter by type (general, support, partnership, creator, bug)

### Health

#### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "version": "1.0.0"
}
```

## 📧 Email Templates

The backend includes professional HTML email templates:

1. **Waitlist User**: Welcome email for regular users
2. **Waitlist Creator**: Welcome email for creators with verification info
3. **Contact Confirmation**: Confirmation email for contact form submissions
4. **Contact Notification**: Internal notification for team

All emails include:
- Vybe logo attachment
- Professional HTML styling
- Responsive design
- Brand colors and typography

## 🗄️ Database Schema

### Waitlist Table
- `id`: Primary key
- `email`: Unique email address
- `type`: 'user' or 'creator'
- `name`: Optional name
- `interests`: JSONB array of interests
- `created_at`, `updated_at`: Timestamps

### Contact Messages Table
- `id`: Primary key
- `name`: Sender name
- `email`: Sender email
- `subject`: Message subject
- `message`: Message content
- `type`: Message category
- `status`: Processing status
- `created_at`, `updated_at`: Timestamps

### Users Table (Future)
- User authentication and profiles
- Creator verification system

## 🔒 Security Features

- **Rate Limiting**: Prevents spam and abuse
- **Input Validation**: Joi schema validation
- **CORS**: Configured for frontend domain
- **Helmet**: Security headers
- **SQL Injection Protection**: Sequelize ORM
- **Email Validation**: Proper email format checking

## 🚀 Deployment

### Environment Setup
1. Set NODE_ENV=production
2. Configure production database
3. Set up email service (SendGrid recommended for production)
4. Configure CORS for production domain

### Recommended Platforms
- **Railway**: Easy PostgreSQL + Node.js deployment
- **Render**: Free tier with PostgreSQL addon
- **Heroku**: Classic platform with PostgreSQL addon
- **DigitalOcean App Platform**: Managed deployment

### Database Migration
The app uses Sequelize with `sync({ alter: true })` in development. For production:
1. Set up proper migrations
2. Use `sync({ force: false })` or disable auto-sync
3. Run migrations manually

## 📝 Development

### Adding New Routes
1. Create route file in `src/routes/`
2. Add validation schema with Joi
3. Implement rate limiting if needed
4. Add to `src/server.js`

### Adding Email Templates
1. Add template to `src/config/email.js`
2. Include logo attachment if needed
3. Use template variables for personalization

### Database Changes
1. Update model in `src/models/`
2. Sequelize will auto-sync in development
3. Create proper migrations for production

## 🐛 Troubleshooting

### Email Issues
- Check SMTP credentials
- Verify App Password for Gmail
- Check SendGrid API key and domain verification
- Ensure logo file exists in `assets/` directory

### Database Issues
- Verify DATABASE_URL format
- Check PostgreSQL connection
- Ensure database exists
- Check Sequelize logs in development

### Rate Limiting
- Adjust limits in route files
- Clear rate limit cache by restarting server
- Check IP-based limiting for development

## 📄 License

Part of the Vybe platform development.

---

Built with ❤️ for the Vybe community