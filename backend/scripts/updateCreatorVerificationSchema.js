require('dotenv').config();
const { sequelize } = require('../src/models');

async function updateSchema() {
  try {
    console.log('🔄 Updating creator_verifications schema...');
    
    // Update the reviewed_by column to UUID type
    await sequelize.query(`
      ALTER TABLE creator_verifications 
      ALTER COLUMN reviewed_by TYPE UUID USING reviewed_by::text::uuid;
    `);
    
    console.log('✅ Schema updated successfully!');
    
    // Sync the models to ensure everything is up to date
    await sequelize.sync({ alter: true });
    console.log('✅ Models synchronized!');
    
  } catch (error) {
    console.error('❌ Schema update failed:', error);
    
    // If the column doesn't exist or has data issues, recreate it
    try {
      console.log('🔄 Attempting to recreate column...');
      
      // Drop the column if it exists
      await sequelize.query(`
        ALTER TABLE creator_verifications 
        DROP COLUMN IF EXISTS reviewed_by;
      `);
      
      // Add it back with correct type
      await sequelize.query(`
        ALTER TABLE creator_verifications 
        ADD COLUMN reviewed_by UUID REFERENCES admins(id);
      `);
      
      console.log('✅ Column recreated successfully!');
      
    } catch (recreateError) {
      console.error('❌ Column recreation failed:', recreateError);
      console.log('💡 You may need to manually update the database schema.');
    }
  } finally {
    await sequelize.close();
  }
}

updateSchema();