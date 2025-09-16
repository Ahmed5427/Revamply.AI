# Revamply AI Solutions Landing Page

A modern, responsive landing page with HubSpot integration through n8n workflow automation. This project captures leads, generates AI-powered blueprints, and sends notifications to Slack.

## 🚀 Features

- **Modern Design**: Animated, responsive landing page with neon effects and smooth transitions
- **Form Integration**: Captures business information and contact details
- **AI Blueprint Generation**: Uses OpenAI through n8n to create custom AI solution blueprints
- **HubSpot Integration**: Automatically creates contacts and stores blueprint data
- **Slack Notifications**: Sends real-time notifications to your "Revamply leads" channel
- **Vercel Deployment**: Optimized for serverless deployment on Vercel

## 🏗️ Project Structure

```
revamply-landing-page/
├── index.html              # Main landing page
├── package.json            # Dependencies and scripts
├── vercel.json             # Vercel configuration
├── README.md              # This file
└── api/
    ├── submit-form.js      # Initial form submission handler
    ├── get-blueprint.js    # Blueprint status checker
    ├── receive-blueprint.js # n8n webhook receiver
    └── submit-next-steps.js # Next steps form handler
```

## 📋 Prerequisites

Before deployment, you'll need:

1. **Vercel Account**: For hosting the landing page
2. **n8n Instance**: For workflow automation (can be cloud or self-hosted)
3. **HubSpot Account**: With API access
4. **Slack Workspace**: With webhook permissions
5. **OpenAI API Key**: For blueprint generation

## 🔧 Setup Instructions

### 1. Clone and Prepare the Project

```bash
# Create your project directory
mkdir revamply-landing-page
cd revamply-landing-page

# Copy all the provided files into this directory
# - index.html
# - package.json
# - vercel.json
# - README.md
# - api/ folder with all endpoint files
```

### 2. Set Up n8n Workflow

Create an n8n workflow with the following nodes:

#### Main Workflow (receives form submissions):
1. **Webhook Node** - Trigger for form submissions
2. **Switch Node** - Route based on `webhookType`
3. **HubSpot Node** - Create/update contact
4. **Slack Node** - Send notification to "Revamply leads" channel
5. **OpenAI Node** - Generate AI blueprint
6. **HubSpot Node** - Update contact with blueprint data
7. **HTTP Request Node** - Send blueprint back to your app

#### Workflow Configuration:

**Webhook Node:**
- Method: POST
- Path: `/webhook/revamply-form`

**Switch Node:**
- Condition 1: `{{ $json.webhookType === "form_submission" }}`
- Condition 2: `{{ $json.webhookType === "next_steps_submission" }}`

**HubSpot Nodes:**
- API Key: Your HubSpot private app token
- Create contact with: email, name, company, custom properties for business description

**Slack Node:**
- Webhook URL: Your Slack incoming webhook URL
- Channel: #revamply-leads
- Message: Custom message with lead details

**OpenAI Node:**
- API Key: Your OpenAI API key
- Model: gpt-4 or gpt-3.5-turbo
- Prompt: Generate AI solution blueprint based on business description

**HTTP Request Node:**
- Method: POST
- URL: `https://your-vercel-app.vercel.app/api/receive-blueprint`
- Body: JSON with submissionId, blueprint, and status

### 3. Deploy to Vercel

#### Install Vercel CLI:
```bash
npm i -g vercel
```

#### Login to Vercel:
```bash
vercel login
```

#### Set Environment Variables:
```bash
# Add your n8n webhook URL
vercel env add N8N_WEBHOOK_URL

# When prompted, enter your n8n webhook URL:
# https://your-n8n-instance.com/webhook/revamply-form
```

#### Deploy:
```bash
# Initial deployment
vercel

# For subsequent deployments
vercel --prod
```

### 4. Configure Environment Variables in Vercel Dashboard

Go to your Vercel project dashboard and add:

- `N8N_WEBHOOK_URL`: Your n8n webhook URL for form submissions
- `N8N_BLUEPRINT_WEBHOOK_URL`: Your n8n webhook URL for receiving blueprints (if different)

## 🔗 Integration Flow

1. **User submits form** → Frontend sends data to `/api/submit-form`
2. **API processes submission** → Generates unique ID and sends to n8n webhook
3. **n8n workflow triggers** → Creates HubSpot contact and sends Slack notification
4. **OpenAI generates blueprint** → Based on business description
5. **n8n sends blueprint back** → To `/api/receive-blueprint` endpoint
6. **Frontend polls for completion** → Checks `/api/get-blueprint` periodically
7. **Blueprint displays** → Dynamic rendering of AI solution recommendations
8. **Next steps form** → Captures additional details and triggers follow-up workflow

## 🎨 Customization

### Styling
- Modify CSS variables in `index.html` to change colors and animations
- Update gradients, glows, and transitions as needed
- Adjust responsive breakpoints for different devices

### Content
- Update company name, messaging, and value propositions
- Modify the blueprint template in the n8n OpenAI prompt
- Customize success messages and error handling

### Functionality
- Add additional form fields as needed
- Implement analytics tracking (Google Analytics, etc.)
- Add email validation and spam protection
- Integrate with additional services (CRM, email marketing, etc.)

## 🛠️ n8n Workflow Template

Here's a basic n8n workflow structure:

```json
{
  "nodes": [
    {
      "parameters": {
        "path": "revamply-form",
        "responseMode": "responseNode",
        "options": {}
      },
      "type": "n8n-nodes-base.webhook",
      "name": "Webhook"
    },
    {
      "parameters": {
        "rules": {
          "values": [
            {
              "conditions": {
                "boolean": [
                  {
                    "value1": "={{ $json.webhookType }}",
                    "value2": "form_submission"
                  }
                ]
              }
            },
            {
              "conditions": {
                "boolean": [
                  {
                    "value1": "={{ $json.webhookType }}",
                    "value2": "next_steps_submission"
                  }
                ]
              }
            }
          ]
        }
      },
      "type": "n8n-nodes-base.switch",
      "name": "Route By Type"
    }
  ]
}
```

## 🔍 Testing

### Local Development
```bash
# Install dependencies
npm install

# Run local development server
vercel dev
```

### Test Form Submission
1. Fill out the form on your local/deployed site
2. Check Slack for lead notification
3. Verify HubSpot contact creation
4. Confirm blueprint generation and display

## 📝 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `N8N_WEBHOOK_URL` | Main n8n webhook endpoint | `https://n8n.example.com/webhook/revamply-form` |
| `N8N_BLUEPRINT_WEBHOOK_URL` | Blueprint return webhook (optional) | `https://n8n.example.com/webhook/blueprint-return` |

## 🚨 Security Considerations

- Environment variables are automatically secured by Vercel
- All API endpoints include CORS headers
- Form validation is implemented on both client and server side
- Rate limiting should be added for production use
- Consider adding CAPTCHA for spam protection

## 📈 Analytics and Monitoring

Consider adding:
- Google Analytics or similar tracking
- Error monitoring (Sentry, LogRocket, etc.)
- Performance monitoring
- Conversion tracking
- A/B testing capabilities

## 🤝 Support

For issues with:
- **Vercel Deployment**: Check Vercel documentation
- **n8n Workflows**: Refer to n8n community forum
- **HubSpot Integration**: Check HubSpot developer docs
- **Code Issues**: Create GitHub issues in your repository

## 📄 License

MIT License - feel free to customize and use for your projects.

---

**Ready to deploy?** Follow the setup instructions above and start capturing leads with your AI-powered landing page! 🚀
