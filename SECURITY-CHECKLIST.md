# 🔒 SECURITY CHECKLIST - READ IMMEDIATELY

## ⚠️ CRITICAL: Default Credentials

Your admin panel comes with default credentials that MUST be changed:

```
Default Username: admin
Default Password: Revamply2025!Change
```

## 🚨 CHANGE THESE IMMEDIATELY!

### Step 1: Generate New Password Hash

Run this in Node.js:

```javascript
const crypto = require('crypto');
const yourPassword = 'YourNewSecurePassword123!';
const hash = crypto.createHash('sha256').update(yourPassword).digest('hex');
console.log('Your hash:', hash);
```

### Step 2: Update .env File

Create or update `.env`:

```env
ADMIN_USERNAME=your_chosen_username
ADMIN_PASSWORD_HASH=paste_hash_here
```

### Step 3: Restart Your Server

```bash
# Vercel
vercel --prod

# Or redeploy your site
```

---

## 🔐 Security Best Practices

### ✅ Must Do:

- [ ] Change default admin credentials immediately
- [ ] Use strong password (12+ characters, mixed case, numbers, symbols)
- [ ] Store credentials securely (use .env file)
- [ ] Never commit .env to Git
- [ ] Enable HTTPS only
- [ ] Limit admin panel access by IP (optional)
- [ ] Set up 2FA (advanced, optional)
- [ ] Regularly review access logs
- [ ] Use different credentials for staging/production

### ❌ Never Do:

- [ ] Share admin credentials
- [ ] Use simple passwords
- [ ] Leave default credentials
- [ ] Commit credentials to Git
- [ ] Allow HTTP access to admin
- [ ] Reuse passwords from other sites
- [ ] Write down passwords insecurely

---

## 🛡️ Additional Protection (Optional)

### IP Whitelist

Edit `api/admin/login.js`:

```javascript
const ALLOWED_IPS = ['your.ip.address'];

// In login function, add:
const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
if (!ALLOWED_IPS.includes(clientIP)) {
    return res.status(403).json({ error: 'Access denied' });
}
```

### Rate Limiting

Already included in login.js:
- 2-second delay on failed attempts
- Prevents brute force attacks

### Session Duration

Default: 8 hours
To change, edit `api/admin/login.js`:

```javascript
const SESSION_DURATION = 4 * 60 * 60 * 1000; // 4 hours
```

---

## 📊 Access Logs

Monitor your admin panel access:

1. Check Vercel function logs
2. Look for suspicious login attempts
3. Review session creation times
4. Check for unusual IP addresses

---

## 🚨 If Compromised

If you suspect your admin account is compromised:

1. **Immediately change password:**
   - Generate new hash
   - Update .env
   - Redeploy

2. **Review recent changes:**
   - Check config.json for modifications
   - Review CSS overrides
   - Verify content hasn't been changed

3. **Clear all sessions:**
   - Restart your server
   - All users will be logged out

4. **Enable additional security:**
   - Add IP whitelist
   - Reduce session duration
   - Enable 2FA

---

## 📝 Credential Storage

### Store Securely:

✅ Password manager (1Password, LastPass, Bitwarden)
✅ Encrypted notes
✅ Secure vault

### Never Store:

❌ Plain text files
❌ Sticky notes
❌ Unencrypted documents
❌ Shared documents
❌ Email
❌ Slack/Discord messages

---

## 🔄 Password Rotation

Recommended schedule:
- **Production:** Every 90 days
- **Staging:** Every 180 days
- **After team member leaves:** Immediately

---

## 👥 Multiple Admins (Future Enhancement)

Current system supports single admin. To add multiple:

1. Modify login.js to use database
2. Store hashed passwords in database
3. Add user management UI
4. Implement role-based access control

---

## ✅ Security Checklist Summary

Before going live:

- [ ] Default credentials changed
- [ ] Strong password set
- [ ] .env file created
- [ ] .env added to .gitignore
- [ ] HTTPS enforced
- [ ] Admin panel tested
- [ ] Session duration configured
- [ ] Credentials stored securely
- [ ] Team briefed on security practices
- [ ] Access logs monitored
- [ ] Backup admin credentials stored safely

---

## 🆘 Emergency Access

If you lose admin credentials:

1. Check your password manager
2. Check secure backups
3. Generate new password hash
4. Update .env file
5. Redeploy application

**There is NO password recovery!**
Store credentials securely!

---

## 📞 Questions?

Security is critical. If you're unsure about anything:

1. Review the IMPLEMENTATION-GUIDE.md
2. Test in staging environment first
3. Consult with your security team
4. Use strong, unique passwords

**Your site's security depends on these steps. Don't skip them! 🔒**
