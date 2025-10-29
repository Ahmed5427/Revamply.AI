import bcrypt from 'bcrypt';

const password = process.argv[2] || 'admin123';

console.log('\n🔐 Generating password hash...\n');
console.log('Password:', password);
console.log('⚠️  Use a STRONG password in production!\n');

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error:', err);
    process.exit(1);
  }
  
  console.log('✅ Generated Hash:\n');
  console.log(hash);
  console.log('\n📋 Copy this hash to your Vercel environment variables!\n');
  console.log('Variable name: ADMIN_PASSWORD_HASH\n');
});
