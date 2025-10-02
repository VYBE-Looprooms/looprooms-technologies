const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Initialize database
const { syncDatabase } = require('./models');

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy configuration - more secure than 'true'
// Configure based on hosting environment
const trustProxy = process.env.TRUST_PROXY || (process.env.NODE_ENV === 'production' ? '1' : 'false');
app.set('trust proxy', trustProxy === 'false' ? false : parseInt(trustProxy) || trustProxy);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://www.feelyourvybe.com',
    'https://feelyourvybe.com'
  ],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/waitlist', require('./routes/waitlist'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/suggestions', require('./routes/suggestions'));
app.use('/api/health', require('./routes/health'));
app.use('/api/admin', require('./routes/admin'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, async () => {
  console.log(`🚀 Vybe Backend running on port ${PORT}`);
  console.log(`📧 Email service: ${process.env.SMTP_HOST ? 'SMTP' : 'SendGrid'}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
  
  // Initialize database
  await syncDatabase();
});