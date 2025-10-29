# Admin Panel - Quick Login Guide

## 🚀 3 Simple Steps to Get Started

### Step 1: Add Environment Variables

Go to: https://vercel.com/Ahmed5427/revamply-ai/settings/environment-variables

Add these 3 variables (select all environments for each):

```
ADMIN_USERNAME = admin
```

```
ADMIN_PASSWORD_HASH = $2b$10$HG8XHDq.5DEXF9I7QzSrNO4YdZFLpVkyVqrSINMbwVEoPy881Yb0y
```

```
JWT_SECRET = revamply-secret-2024-change-in-production
```

### Step 2: Redeploy

Go to: https://vercel.com/Ahmed5427/revamply-ai/deployments
- Click "..." menu on latest deployment
- Click "Redeploy"
- Wait 2-3 minutes

### Step 3: Login

Go to: https://revamply-ai.vercel.app/admin-panel.html

```
Username: admin
Password: YourSecurePassword123
```

---

## ✅ What's Working Now

- ✅ Uses your existing KV database
- ✅ Admin content has 10-year expiry (permanent)
- ✅ Blueprint data still uses 7-day TTL
- ✅ No data loss after 7 days

---

## 🔐 Change Password Later

To use a different password:

1. Run: `node generate-password.mjs "YourNewPassword"`
2. Copy the generated hash
3. Update `ADMIN_PASSWORD_HASH` in Vercel
4. Redeploy

---

## 🎯 What You Can Do in Admin Panel

- Edit all text content
- Change colors (color picker)
- Adjust font sizes
- View 50 revisions per element
- Switch dark/light theme
- Export/Import content
- Bulk updates

---

## 🆘 Troubleshooting

**Can't login?**
- Check all 3 env vars are set in Vercel
- Verify you redeployed after adding them
- Check browser console for errors

**Rate limited?**
- Wait 15 minutes (5 failed attempts = lockout)

**Content not saving?**
- Check Vercel function logs
- Verify KV_* variables are set
- Ensure KV database is active

---

## 📚 More Documentation

- `ADMIN_SETUP_GUIDE.md` - Complete setup guide
- `ADMIN_QUICK_REFERENCE.md` - API examples
- `README_ADMIN_SYSTEM.md` - System overview

---

**Happy Editing!** 🎨
