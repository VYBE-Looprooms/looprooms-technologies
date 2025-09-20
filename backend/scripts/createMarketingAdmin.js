require('dotenv').config();
const { Admin, syncDatabase } = require('../src/models');

async function createMarketingAdmin() {
  try {
    // Sync database first
    await syncDatabase();

    const email = process.argv[2];
    const password = process.argv[3];
    const name = process.argv[4];

    if (!email || !password || !name) {
      console.log('Usage: node createMarketingAdmin.js <email> <password> <name>');
      console.log('Example: node createMarketingAdmin.js marketing@vybe.com password123 "Marketing Director"');
      process.exit(1);
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      where: { email: email.toLowerCase() }
    });

    if (existingAdmin) {
      console.log('❌ Admin with this email already exists');
      process.exit(1);
    }

    // Create marketing admin
    const admin = await Admin.create({
      email: email.toLowerCase(),
      passwordHash: password, // Will be hashed by the model hook
      name: name,
      role: 'marketing',
      isActive: true
    });

    console.log('✅ Marketing admin created successfully!');
    console.log('📧 Email:', admin.email);
    console.log('👤 Name:', admin.name);
    console.log('🎯 Role:', admin.role);
    console.log('');
    console.log('🔗 Login URL: http://localhost:3000/admin/login');
    console.log('📊 Marketing Dashboard: http://localhost:3000/admin/marketing');

  } catch (error) {
    console.error('❌ Error creating marketing admin:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

createMarketingAdmin();