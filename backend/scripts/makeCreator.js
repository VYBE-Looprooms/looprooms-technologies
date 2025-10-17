require("dotenv").config();
const { User } = require("../src/models");

async function makeCreator() {
  try {
    const email = process.argv[2];

    if (!email) {
      console.log("Usage: node scripts/makeCreator.js <email>");
      console.log("Example: node scripts/makeCreator.js user@example.com");
      process.exit(1);
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      process.exit(1);
    }

    if (user.type === "creator") {
      console.log(`✅ User ${user.name} is already a creator!`);
      process.exit(0);
    }

    await user.update({
      type: "creator",
      verified: true,
    });

    console.log(`✅ Successfully made ${user.name} a creator!`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Type: ${user.type}`);
    console.log(`   Verified: ${user.verified}`);
    console.log("\n🎉 You can now access the Creator Dashboard!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

makeCreator();
