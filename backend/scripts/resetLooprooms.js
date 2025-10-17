require("dotenv").config();
const sequelize = require("../src/config/database");

async function resetLooprooms() {
  try {
    console.log("🔄 Resetting looprooms table...");

    // Drop tables in correct order (foreign keys first)
    await sequelize.query(
      'DROP TABLE IF EXISTS "looproom_participants" CASCADE;'
    );
    console.log("✅ Dropped looproom_participants table");

    await sequelize.query('DROP TABLE IF EXISTS "looprooms" CASCADE;');
    console.log("✅ Dropped looprooms table");

    // Also drop posts and related tables
    await sequelize.query('DROP TABLE IF EXISTS "reactions" CASCADE;');
    console.log("✅ Dropped reactions table");

    await sequelize.query('DROP TABLE IF EXISTS "comments" CASCADE;');
    console.log("✅ Dropped comments table");

    await sequelize.query('DROP TABLE IF EXISTS "posts" CASCADE;');
    console.log(
      "✅ Dropped posts table (will be recreated with UUID foreign key)"
    );

    console.log("\n🎉 Looprooms and related tables dropped!");
    console.log(
      "   - Restart your backend server to recreate tables with UUID"
    );
    console.log(
      "   - IDs will now be UUIDs (e.g., 68f28590-ba08-832c-b60f-812b8530d8e1)"
    );
    console.log("   - Much more secure for private rooms!");
    console.log("\n💡 Next steps:");
    console.log("   1. Restart backend: npm run dev");
    console.log("   2. Re-seed AI rooms: npm run seed-ai-rooms");
    console.log("   3. Create new looprooms from the dashboard");
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

resetLooprooms();
