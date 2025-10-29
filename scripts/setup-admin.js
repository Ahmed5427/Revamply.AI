/**
 * Admin Setup Script
 * Generates password hash for admin user
 *
 * Usage: node scripts/setup-admin.js your-password
 */

import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

async function generatePasswordHash(password) {
  if (!password || password.length < 8) {
    console.error('❌ Password must be at least 8 characters long');
    process.exit(1);
  }

  console.log('\n🔐 Generating password hash...\n');

  const hash = await bcrypt.hash(password, SALT_ROUNDS);

  console.log('✅ Password hash generated successfully!\n');
  console.log('Add this to your .env.local file:\n');
  console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
  console.log('⚠️  Keep this hash secure and never commit it to version control!\n');

  return hash;
}

// Get password from command line argument
const password = process.argv[2];

if (!password) {
  console.error('\n❌ Usage: node scripts/setup-admin.js <your-password>\n');
  process.exit(1);
}

generatePasswordHash(password);
