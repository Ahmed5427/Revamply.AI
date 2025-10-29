# 🚀 Admin Panel Login - Quick Start

## 📍 Access URL
**https://revamply-ai.vercel.app/admin-panel.html**
(or your custom domain)

---

## 🔐 Login Credentials

```
Username: admin
Password: YourSecurePassword123
```

⚠️ **Change this password in production!**

---

## ✅ Setup Checklist

- [ ] Create Vercel KV database
- [ ] Add environment variables to Vercel
- [ ] Redeploy project
- [ ] Access admin panel URL
- [ ] Login with credentials above

---

## 🔧 Environment Variables Required

Add these to Vercel → Settings → Environment Variables:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2a$10$6hhjsxKcov0o/q5xph6Yjehd5pr600B6VUJlEdQq.GEPCoyk05942
JWT_SECRET=revamply-super-secret-jwt-key-2024-change-this-now
KV_URL=(from Vercel KV)
KV_REST_API_URL=(from Vercel KV)
KV_REST_API_TOKEN=(from Vercel KV)
KV_REST_API_READ_ONLY_TOKEN=(from Vercel KV)
```

---

## 🎯 Features You Get

✅ **Content Management**
- Edit all text content
- Change colors with color picker
- Adjust font sizes
- View revision history

✅ **Theme Control**
- Switch dark/light mode
- Responsive design

✅ **Data Management**
- Export content as JSON
- Import backups
- Bulk updates

✅ **Security**
- JWT authentication
- Rate limiting
- Password hashing
- Session management

---

## 🆘 Troubleshooting

### Can't Login?
1. Check environment variables are set in Vercel
2. Verify you redeployed after adding env vars
3. Check browser console for errors
4. Try generating a new password hash

### "Rate Limited" Error?
- Wait 15 minutes (after 5 failed attempts)
- Check you're using the correct password

### Content Not Saving?
1. Verify Vercel KV is active
2. Check Vercel function logs
3. Ensure all KV environment variables are set

---

## 🔄 Change Password

To generate a new password hash:

```bash
node generate-password.mjs "YourNewPassword"
```

Copy the hash to Vercel → Environment Variables → ADMIN_PASSWORD_HASH

Then redeploy!

---

## 📚 Full Documentation

- **Setup Guide**: `ADMIN_SETUP_GUIDE.md`
- **Quick Reference**: `ADMIN_QUICK_REFERENCE.md`
- **System Overview**: `README_ADMIN_SYSTEM.md`

---

## 🎉 Quick Actions

1. **Login**: Go to `/admin-panel.html`
2. **Edit Content**: Click any content item
3. **Change Theme**: Use theme toggle
4. **Export Backup**: Click Export button
5. **View History**: Click on any element

---

## 🔒 Production Security Checklist

Before going live:
- [ ] Change default password
- [ ] Use strong JWT secret (32+ chars)
- [ ] Enable 2FA on Vercel account
- [ ] Test rate limiting
- [ ] Backup content regularly
- [ ] Monitor Vercel function logs

---

**Need Help?** Check the documentation files or Vercel deployment logs!

**Happy Editing!** 🎨
