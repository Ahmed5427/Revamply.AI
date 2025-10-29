# Revamply Admin Panel - Setup Guide

## 🚀 Quick Start

This comprehensive admin panel allows you to manage all content on your Revamply website through a secure, user-friendly interface.

---

## 📋 Prerequisites

- Node.js 18.x or higher
- Vercel account with KV (Redis) enabled
- Git

---

## ⚙️ Initial Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Vercel KV (Redis)

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Storage** → **Create Database** → **KV (Redis)**
4. Copy the environment variables provided

### 3. Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local with your values
```

### 4. Generate Admin Password

```bash
# Generate a secure password hash
node scripts/setup-admin.js YourSecurePassword123

# Copy the output hash to .env.local
```

Your `.env.local` should look like this:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2b$10$XYZ... (from setup script)
JWT_SECRET=your-random-secret-key-at-least-32-chars
KV_URL=redis://...
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=...
NODE_ENV=production
```

### 5. Deploy to Vercel

```bash
# Push changes to Git
git add .
git commit -m "Add admin panel and CMS"
git push

# Deploy via Vercel dashboard or CLI
vercel --prod
```

---

## 🎨 Using the Admin Panel

### Accessing the Panel

Navigate to: `https://yourdomain.com/admin-panel.html`

### Login

- **Username**: Value from `ADMIN_USERNAME` env variable
- **Password**: The password you used to generate the hash

### Content Management

1. **View All Content**: See all editable elements from your website
2. **Edit Content**: Click any content item to edit:
   - Text content
   - Text color
   - Font size
   - Background color (coming soon)
   - Font family (coming soon)

3. **Theme Switching**: Toggle between dark and light modes
4. **Revision History**: View previous versions of content
5. **Export/Import**: Backup and restore content

---

## 🏗️ Adding Editable Elements to HTML

To make any element editable through the admin panel, add these attributes:

```html
<h1 data-editable="true" data-element-id="unique-id-here">
  Your Content
</h1>

<p class="paragraph-hero-description" data-editable="true" data-element-id="hero-description">
  This text can be edited through the admin panel
</p>
```

### Naming Convention for `data-element-id`:

- Use format: `section-element-purpose`
- Examples:
  - `hero-heading-main`
  - `features-paragraph-description`
  - `testimonial-quote-1`

### Semantic Class Names:

- **Headings**: `.heading-[section]-[purpose]`
- **Paragraphs**: `.paragraph-[section]-[purpose]`
- **Spans**: `.span-[section]-[purpose]`
- **Stats**: `.stat-[section]-[purpose]`

Examples:
```html
<h1 class="heading-hero-main" data-editable="true" data-element-id="hero-main-heading">
  AI Solutions That Save Time
</h1>

<p class="paragraph-features-description" data-editable="true" data-element-id="features-desc-1">
  Our AI understands context and intent.
</p>
```

---

## 🎨 Theme System

The new CSS architecture uses 4 modular files:

1. **`css/theme-variables.css`** - CSS variables (colors, fonts, spacing)
2. **`css/theme-dark-desktop.css`** - Dark theme for desktop (≥768px)
3. **`css/theme-dark-mobile.css`** - Dark theme for mobile (<768px)
4. **`css/theme-light-desktop.css`** - Light theme for desktop
5. **`css/theme-light-mobile.css`** - Light theme for mobile

### Loading Themes in HTML

Add to your `<head>`:

```html
<!-- Theme Variables (always load first) -->
<link rel="stylesheet" href="/css/theme-variables.css">

<!-- Dark Theme (default) -->
<link rel="stylesheet" href="/css/theme-dark-desktop.css">
<link rel="stylesheet" href="/css/theme-dark-mobile.css">

<!-- Light Theme -->
<link rel="stylesheet" href="/css/theme-light-desktop.css">
<link rel="stylesheet" href="/css/theme-light-mobile.css">
```

### Switching Themes

Add this to your `<body>`:

```html
<body data-theme="dark">
  <!-- Your content -->
</body>
```

To switch themes via JavaScript:

```javascript
document.body.setAttribute('data-theme', 'light'); // or 'dark'
```

---

## 🔒 Security Features

✅ **Password Hashing**: Bcrypt with 10 salt rounds
✅ **JWT Authentication**: HTTP-only cookies
✅ **Rate Limiting**: 5 failed login attempts → 15 min lockout
✅ **Session Management**: 7-day token expiry
✅ **CSRF Protection**: SameSite cookies
✅ **Input Sanitization**: All user inputs sanitized

---

## 📊 Admin API Endpoints

All admin endpoints require authentication.

### Authentication

```bash
# Login
POST /api/admin/login
Body: { "username": "admin", "password": "your-password" }

# Logout
POST /api/admin/logout

# Verify Session
GET /api/admin/verify-session
```

### Content Management

```bash
# Get all content
GET /api/admin/content

# Get specific content
GET /api/admin/content?id=element-id

# Get revision history
GET /api/admin/content?history=true&id=element-id

# Update content
POST /api/admin/content
Body: {
  "elementId": "hero-heading-main",
  "contentData": {
    "text": "New content",
    "styles": {
      "color": "#000000",
      "fontSize": "48px"
    }
  }
}

# Delete content
DELETE /api/admin/content?id=element-id

# Export all content
GET /api/admin/content?export=true

# Bulk update
POST /api/admin/content
Body: {
  "bulkUpdate": true,
  "updates": [
    {
      "elementId": "id1",
      "contentData": {...}
    }
  ]
}
```

### Theme Management

```bash
# Get current theme
GET /api/admin/theme

# Set theme
POST /api/admin/theme
Body: { "theme": "dark" } // or "light"
```

---

## 🐛 Troubleshooting

### Cannot Login

1. Check environment variables are set correctly
2. Verify password hash was generated correctly
3. Check browser console for errors
4. Ensure Vercel KV is properly configured

### Content Not Saving

1. Verify Vercel KV is active
2. Check API logs in Vercel dashboard
3. Ensure JWT token is valid
4. Check browser cookies are enabled

### Theme Not Switching

1. Verify CSS files are loaded
2. Check `data-theme` attribute on `<body>`
3. Ensure theme API is working

### Rate Limited

- Wait 15 minutes after 5 failed login attempts
- Check IP address in rate limiter logs

---

## 🔧 Development

### Local Development

```bash
npm run dev
# Visit http://localhost:3000/admin-panel.html
```

### Testing Auth

```bash
# Generate test password hash
node scripts/setup-admin.js testpassword123
```

---

## 📝 Database Schema

Content is stored in Vercel KV with this structure:

```javascript
// Content Entry
{
  elementId: "hero-heading-main",
  text: "AI Solutions That Save Time",
  type: "h1",
  className: "heading-hero-main",
  styles: {
    color: "#000000",
    fontSize: "48px",
    fontWeight: "700"
  },
  updatedAt: "2024-01-01T00:00:00.000Z",
  createdAt: "2024-01-01T00:00:00.000Z"
}

// History Entry
{
  elementId: "hero-heading-main",
  history: [
    {
      text: "Old content",
      archivedAt: "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## 🚀 Production Checklist

Before deploying to production:

- [ ] Change default admin password
- [ ] Generate secure JWT secret (32+ characters)
- [ ] Enable Vercel KV production mode
- [ ] Set `NODE_ENV=production`
- [ ] Add `.env.local` to `.gitignore`
- [ ] Test all admin features
- [ ] Enable 2FA on Vercel account
- [ ] Set up monitoring and alerts
- [ ] Configure backup strategy
- [ ] Test rate limiting
- [ ] Verify SSL/HTTPS is enabled

---

## 📚 Additional Resources

- [Vercel KV Documentation](https://vercel.com/docs/storage/vercel-kv)
- [JWT Best Practices](https://jwt.io/introduction)
- [Bcrypt Documentation](https://github.com/kelektiv/node.bcrypt.js)

---

## 🆘 Support

For issues or questions:
1. Check Vercel deployment logs
2. Review browser console errors
3. Check API endpoint responses
4. Verify environment variables

---

## 📄 License

MIT License - Revamply AI Solutions

---

**🎉 Congratulations! Your admin panel is ready to use!**

Access it at: `https://yourdomain.com/admin-panel.html`
