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

    const admins = [
      {
        email: 'adrian@feelyourvybe.com',
        password: 'admin123',
        name: 'Vybe Admin',
        role: 'super_admin'
      },
      {
        email: 'technical@feelyourvybe.com',
        password: 'SATOSANb6...',
        name: 'Technical Admin',
        role: 'super_admin'
      }
    ];

    let createdCount = 0;
    let existingCount = 0;

    for (const adminData of admins) {
      // Check if admin already exists
      const existingAdmin = await Admin.findOne({ where: { email: adminData.email } });
      
      if (existingAdmin) {
        console.log(`⚠️  Admin user ${adminData.email} already exists!`);
        console.log('Email:', existingAdmin.email);
        console.log('Name:', existingAdmin.name);
        console.log('Role:', existingAdmin.role);
        console.log('');
        existingCount++;
        continue;
      }

      // Create new admin
      const admin = await Admin.create({
        email: adminData.email,
        passwordHash: adminData.password, // This will be hashed automatically
        name: adminData.name,
        role: adminData.role,
        isActive: true
      });

      console.log(`✅ Admin user ${adminData.email} created successfully!`);
      console.log('📧 Email:', adminData.email);
      console.log('🔑 Password:', adminData.password);
      console.log('👤 Name:', adminData.name);
      console.log('🛡️  Role:', adminData.role);
      console.log('');
      createdCount++;
    }

    if (createdCount > 0) {
      console.log(`✅ ${createdCount} admin user(s) created successfully!`);
      console.log('⚠️  IMPORTANT: Please change the passwords after first login!');
    }
    if (existingCount > 0) {
      console.log(`ℹ️  ${existingCount} admin user(s) already existed.`);
    }
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