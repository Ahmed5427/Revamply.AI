# Admin Panel - Quick Reference

## 🔐 First Time Setup

```bash
# 1. Install dependencies
npm install

# 2. Generate admin password
node scripts/setup-admin.js YourPassword123

# 3. Copy hash to .env.local
echo "ADMIN_PASSWORD_HASH=<hash-from-above>" >> .env.local
echo "ADMIN_USERNAME=admin" >> .env.local
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env.local

# 4. Add Vercel KV credentials to .env.local

# 5. Deploy
git push && vercel --prod
```

## 🌐 Admin Panel URL

**Access**: `https://yourdomain.com/admin-panel.html`

## 🎨 Making HTML Elements Editable

```html
<!-- Add these attributes to any element -->
<h1
  class="heading-hero-main"
  data-editable="true"
  data-element-id="unique-id"
>
  Your Content
</h1>
```

## 📝 Semantic Class Naming

| Element Type | Class Pattern | Example |
|--------------|--------------|---------|
| Headings | `heading-[section]-[purpose]` | `heading-hero-main` |
| Paragraphs | `paragraph-[section]-[purpose]` | `paragraph-features-desc` |
| Stats | `stat-[section]-[type]` | `stat-hero-number` |
| Spans | `span-[section]-[purpose]` | `span-cta-highlight` |

## 🎨 Theme Files

| File | Purpose | Media Query |
|------|---------|-------------|
| `theme-variables.css` | CSS variables | All |
| `theme-dark-desktop.css` | Dark theme desktop | ≥768px |
| `theme-dark-mobile.css` | Dark theme mobile | <768px |
| `theme-light-desktop.css` | Light theme desktop | ≥768px |
| `theme-light-mobile.css` | Light theme mobile | <768px |

## 🔌 Quick API Examples

### Login
```bash
curl -X POST https://yourdomain.com/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your-password"}'
```

### Get All Content
```bash
curl https://yourdomain.com/api/admin/content \
  -H "Cookie: admin_token=YOUR_JWT"
```

### Update Content
```bash
curl -X POST https://yourdomain.com/api/admin/content \
  -H "Content-Type: application/json" \
  -H "Cookie: admin_token=YOUR_JWT" \
  -d '{
    "elementId": "hero-heading-main",
    "contentData": {
      "text": "New Heading",
      "styles": {"color": "#000000", "fontSize": "48px"}
    }
  }'
```

## 🚨 Common Issues

| Problem | Solution |
|---------|----------|
| Can't login | Regenerate password hash, check `.env.local` |
| Content not saving | Verify Vercel KV is active |
| Rate limited | Wait 15 minutes |
| Theme not changing | Check `data-theme` attribute on `<body>` |

## 🔒 Security Checklist

- [ ] Strong admin password (16+ chars)
- [ ] Unique JWT secret
- [ ] `.env.local` in `.gitignore`
- [ ] HTTPS enabled
- [ ] Vercel KV secured
- [ ] 2FA on Vercel account

## 📊 Content Structure

```javascript
{
  elementId: "unique-id",      // Required: Unique identifier
  text: "Content here",        // Required: Actual text
  type: "h1",                  // Optional: HTML tag type
  className: "heading-hero",   // Optional: CSS class
  styles: {                    // Optional: Inline styles
    color: "#000000",
    fontSize: "48px",
    fontWeight: "700"
  },
  updatedAt: "2024-01-01...",  // Auto-generated
  createdAt: "2024-01-01..."   // Auto-generated
}
```

## 🎯 Admin Panel Features

✅ Content editing (text, colors, fonts)
✅ Theme switching (dark/light)
✅ Revision history
✅ Export/Import content
✅ Bulk updates
✅ Real-time preview
✅ Secure authentication
✅ Rate limiting

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🔗 Useful Links

- [Full Setup Guide](./ADMIN_SETUP_GUIDE.md)
- [Implementation Plan](./IMPLEMENTATION_PLAN.md)
- [Vercel KV Docs](https://vercel.com/docs/storage/vercel-kv)

---

**Need Help?** Check the full setup guide or Vercel deployment logs.
