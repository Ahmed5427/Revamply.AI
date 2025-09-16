# 🚀 Revamply Quick Start Guide

Get your AI-powered landing page with HubSpot integration running in under 30 minutes!

## 📋 Prerequisites Checklist

- [ ] Vercel account (free tier works)
- [ ] n8n instance (cloud or self-hosted)
- [ ] HubSpot account with API access
- [ ] Slack workspace with webhook permissions
- [ ] OpenAI API key

## ⚡ 5-Minute Setup

### 1. Deploy to Vercel (2 minutes)

```bash
# Clone or create project directory
mkdir revamply-landing-page && cd revamply-landing-page

# Add all project files (copy from artifacts above)
# - index.html
# - package.json  
# - vercel.json
# - api/ folder with all endpoints
# - README.md, etc.

# Install Vercel CLI and deploy
npm i -g vercel
vercel login
vercel

# Set environment variable when prompted:
# N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/revamply-form
```

### 2. Import n8n Workflow (2 minutes)

1. Log into your n8n instance
2. Click "Import from File" 
3. Upload `n8n-workflow.json`
4. Activate the workflow

### 3. Configure Integrations (1 minute each)

**HubSpot in n8n:**
- Add HubSpot credential with your private app token
- Create custom properties using `hubspot-properties.json`

**Slack in n8n:**
- Create incoming webhook: https://api.slack.com/messaging/webhooks
- Add webhook URL to n8n HTTP Request node
- Create #revamply-leads channel

**OpenAI in n8n:**
- Add OpenAI credential with your API key
- Test the blueprint generation

### 4. Test Everything (2 minutes)

```bash
# Run the test suite
node test-setup.js

# Or test individual components:
node test-setup.js form
node test-setup.js webhook
```

## 🎯 Integration Flow

```
User fills form → Vercel API → n8n webhook → HubSpot + Slack + OpenAI → Blueprint back to user
```

## 🔧 Environment Variables

Set these in Vercel dashboard (Settings → Environment Variables):

| Variable | Value | Required |
|----------|-------|----------|
| `N8N_WEBHOOK_URL` | `https://your-n8n.com/webhook/revamply-form` | ✅ |

## 📱 HubSpot Custom Properties Quick Setup

1. Go to Settings → Properties → Contact Properties
2. Create these key properties:
   - `business_description` (textarea)
   - `lead_status` (dropdown: new, blueprint_generated, interested, etc.)
   - `submission_id` (text)
   - `ai_blueprint` (textarea)
   - `blueprint_generated_date` (date)

Full list in `hubspot-properties.json`.

## 🔔 Slack Setup

1. Create #revamply-leads channel
2. Add incoming webhook: https://YOUR-WORKSPACE.slack.com/services/new/incoming-webhook
3. Copy webhook URL to n8n

## 🧪 Testing Checklist

- [ ] Form submission creates HubSpot contact
- [ ] Slack notification appears in #revamply-leads
- [ ] AI blueprint generates and displays on page
- [ ] Next steps form triggers follow-up workflow
- [ ] All API endpoints respond correctly

## 🎨 Customization Quick Wins

**Change Colors:**
Edit CSS variables in `index.html`:
```css
:root {
  --primary-blue: #00E5FF;
  --primary-pink: #FF00CC;
}
```

**Update Content:**
- Company name and messaging in `index.html`
- Blueprint prompt in n8n OpenAI node
- Slack message templates in n8n

**Add Analytics:**
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
```

## 🚨 Common Issues & Solutions

**Form not submitting:**
- Check Vercel deployment logs
- Verify N8N_WEBHOOK_URL environment variable
- Test API endpoint: `curl -X POST your-app.vercel.app/api/submit-form`

**Blueprint not generating:**
- Check n8n workflow execution logs
- Verify OpenAI API key and credits
- Test webhook connectivity: `curl -X POST your-n8n.com/webhook/revamply-form`

**HubSpot not updating:**
- Verify HubSpot private app token permissions
- Check if custom properties exist
- Review n8n HubSpot node configuration

**Slack notifications missing:**
- Confirm webhook URL format
- Check #revamply-leads channel exists
- Test webhook: `curl -X POST -H 'Content-type: application/json' --data '{"text":"Test"}' YOUR_WEBHOOK_URL`

## 📈 Production Optimizations

**For High Traffic:**
1. Replace in-memory storage with Redis or Vercel KV
2. Add rate limiting
3. Implement CAPTCHA
4. Set up monitoring (Sentry, LogRocket)

**For Better Performance:**
1. Enable Vercel Edge Functions
2. Add CDN for static assets
3. Optimize images and animations
4. Implement lazy loading

**For Enhanced Security:**
1. Add webhook signature verification
2. Implement CORS restrictions
3. Add input sanitization
4. Use environment-specific configs

## 🔗 Quick Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [n8n Documentation](https://docs.n8n.io)
- [HubSpot API Reference](https://developers.hubspot.com/docs/api)
- [Slack Webhook Guide](https://api.slack.com/messaging/webhooks)
- [OpenAI API Docs](https://platform.openai.com/docs)

## 🆘 Need Help?

1. Check the logs in Vercel dashboard
2. Review n8n workflow execution history
3. Test individual components with `test-setup.js`
4. Verify all credentials and permissions
5. Check environment variables are set correctly

---

**🎉 That's it! Your AI-powered lead generation system is ready to capture and convert visitors!**

Run a test, share the link, and start generating qualified leads with custom AI blueprints.
