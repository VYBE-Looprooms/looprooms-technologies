require('dotenv').config();

async function createAdmin() {
  try {
    console.log('🔧 Creating admin user...\n');

    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable is not set!');
      console.log('Please set your DATABASE_URL in the .env file');
      console.log('Example: DATABASE_URL=postgresql://username:password@localhost:5432/vybe_db');
      process.exit(1);
    }

    // Import models after env is loaded
    const { Admin, sequelize } = require('../src/models');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Sync the Admin table
    await Admin.sync();

    const adminEmail = 'adrian@feelyourvybe.com';

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ where: { email: adminEmail } });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Name:', existingAdmin.name);
      console.log('Role:', existingAdmin.role);
      console.log('\nIf you forgot the password, you can update it in the database.');
      return;
    }

    // Create new admin
    const admin = await Admin.create({
      email: adminEmail,
      passwordHash: 'admin123', // This will be hashed automatically
      name: 'Vybe Admin',
      role: 'super_admin',
      isActive: true
    });

    console.log('✅ Admin user created successfully!\n');
    console.log('📧 Email: adrian@feelyourvybe.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Name: Vybe Admin');
    console.log('🛡️  Role: super_admin\n');
    console.log('⚠️  IMPORTANT: Please change the password after first login!');
    console.log('🌐 Login at: https://feelyourvybe.com/admin/login');

  } catch (error) {
    console.error('❌ Failed to create admin user:', error.message);
    
    if (error.message.includes('connect')) {
      console.log('\n💡 Database connection tips:');
      console.log('1. Make sure PostgreSQL is running');
      console.log('2. Check your DATABASE_URL in .env file');
      console.log('3. Verify database credentials and database exists');
    }
  } finally {
    process.exit(0);
  }
}

createAdmin();