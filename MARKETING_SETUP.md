# Marketing Dashboard Setup

## Overview
The marketing dashboard provides your marketing director with focused access to user signups, growth analytics, and export capabilities without access to sensitive admin functions.

## Features for Marketing Director

### ✅ **What Marketing Has Access To:**
- **Signup Analytics**: Total signups, user/creator breakdown, growth trends
- **Geographic Data**: Top locations for signups
- **Growth Metrics**: Daily, weekly, monthly growth with comparisons
- **Conversion Rates**: User to creator conversion tracking
- **Export Functionality**: Download waitlist data for campaigns
- **Peak Activity Hours**: Best times for marketing campaigns

### ❌ **What Marketing CANNOT Access:**
- User management or admin creation
- Contact message responses
- System settings or configurations
- Looproom suggestions management
- Full admin privileges

## Setup Instructions

### 1. Create Marketing Admin Account
```bash
cd backend
npm run create-marketing-admin marketing@vybe.com securepassword123 "Marketing Director Name"
```

### 2. Login & Access
- **Login URL**: `http://localhost:3000/admin/login`
- **Marketing Dashboard**: `http://localhost:3000/admin/marketing`
- Marketing users are automatically redirected to their dashboard

### 3. Available Pages
- **Dashboard**: `/admin/marketing` - Overview and key metrics
- **Waitlist**: `/admin/waitlist` - Full waitlist management (view-only for marketing)
- **Analytics**: `/admin/analytics` - Detailed growth and conversion analytics

## Marketing Dashboard Features

### Key Metrics Cards
- **Total Signups**: Overall user acquisition
- **Creator Signups**: Creator conversion tracking
- **Weekly Growth**: Recent performance with % change
- **Daily Signups**: Today's performance vs yesterday

### Growth Tracking
- **Last 30 Days**: Daily signup trends
- **Geographic Distribution**: Top 15 locations with percentages
- **Conversion Metrics**: Monthly creator conversion rates
- **Activity Hours**: Peak signup times for campaign optimization

### Export Capabilities
- **Waitlist Export**: Excel download with all signup data
- **Filtered Exports**: By user type, location, date range
- **Campaign Data**: Ready for email marketing tools

## Role-Based Access

The system automatically handles role-based redirects:
- **Marketing Role**: Redirected to `/admin/marketing`
- **Admin/Super Admin**: Redirected to `/admin/dashboard`
- **Navbar Button**: Smart redirect based on user role

## Security Features

- **JWT Authentication**: Secure token-based access
- **Role Validation**: Backend validates marketing role for all endpoints
- **Limited Permissions**: Cannot access sensitive admin functions
- **Session Management**: Automatic logout on token expiry

## API Endpoints (Marketing-Specific)

- `GET /api/admin/marketing/analytics` - Marketing-focused analytics
- `GET /api/admin/waitlist` - Waitlist data (read-only for marketing)
- `POST /api/admin/export/waitlist` - Export functionality

## Usage Tips

1. **Daily Monitoring**: Check daily signup trends and growth rates
2. **Geographic Insights**: Use location data for targeted campaigns
3. **Peak Hours**: Schedule campaigns during high-activity hours
4. **Conversion Tracking**: Monitor user-to-creator conversion rates
5. **Export for Campaigns**: Download data for email marketing tools

## Support

If the marketing director needs additional metrics or features, they can be added to the marketing dashboard without affecting the main admin system.