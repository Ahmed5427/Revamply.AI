# N8N Email Check Integration Guide

## Overview
This guide explains how to set up an HTTP request in N8N to check if an email has already been used to generate a blueprint before creating a new one.

---

## API Endpoint: Check Email for Existing Blueprint

### Endpoint Information

**URL:** `https://revamply.ai/api/check-email`

**Methods Supported:** `GET` or `POST`

**Purpose:** Check if an email address already has a blueprint generated

---

## Request Details

### Option 1: GET Request (Recommended for N8N)

**HTTP Method:** `GET`

**URL:** `https://revamply.ai/api/check-email?email={{$('Webhook').item.json.body.email}}`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Query Parameters:**
- `email` (required): The email address to check

---

### Option 2: POST Request

**HTTP Method:** `POST`

**URL:** `https://revamply.ai/api/check-email`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body (JSON):**
```json
{
  "email": "{{$('Webhook').item.json.body.email}}"
}
```

---

## Response Format

### Case 1: Email HAS existing blueprint

**HTTP Status:** `200 OK`

**Response Body:**
```json
{
  "success": true,
  "exists": true,
  "message": "Email has existing blueprint",
  "submissionId": "38fde2ea-2855-4921-a73a-3631b3e6d7a5",
  "contactName": "Dr. Jennifer Park",
  "generatedAt": "2025-09-30T15:48:30.183Z",
  "status": "completed",
  "blueprintUrl": "https://revamply.ai/api/get-blueprint-page?submissionId=38fde2ea-2855-4921-a73a-3631b3e6d7a5"
}
```

**Key Fields:**
- `exists`: `true` - Email has existing blueprint
- `submissionId`: The original submission ID
- `contactName`: Contact's name from original submission
- `blueprintUrl`: Direct URL to view the existing blueprint

---

### Case 2: Email DOES NOT have existing blueprint

**HTTP Status:** `200 OK`

**Response Body:**
```json
{
  "success": true,
  "exists": false,
  "message": "No existing blueprint found for this email",
  "email": "newemail@example.com"
}
```

**Key Fields:**
- `exists`: `false` - No blueprint found for this email
- `email`: The email that was checked

---

### Case 3: Error - Missing Email

**HTTP Status:** `400 Bad Request`

**Response Body:**
```json
{
  "success": false,
  "message": "Email address is required",
  "exists": false
}
```

---

### Case 4: Error - Invalid Email Format

**HTTP Status:** `400 Bad Request`

**Response Body:**
```json
{
  "success": false,
  "message": "Invalid email format",
  "exists": false
}
```

---

## N8N Implementation Example

### Step 1: Add HTTP Request Node BEFORE "Message a model" node

In your N8N workflow, add an HTTP Request node right after the "Webhook" node and before the AI generation:

**Node Name:** `Check Email for Existing Blueprint`

**Configuration:**
- **Method:** `GET`
- **URL:** `https://revamply.ai/api/check-email`
- **Query Parameters:**
  - Name: `email`
  - Value: `{{$('Webhook').item.json.body.email}}`

---

### Step 2: Add IF Node to Route Based on Result

Add an IF node after the HTTP Request to check if email exists:

**Node Name:** `Email Already Exists?`

**Condition:**
- **Field:** `{{$json.exists}}`
- **Operator:** `equals`
- **Value:** `true`

---

### Step 3: Handle TRUE Branch (Email Exists)

If the email already exists, you have two options:

#### Option A: Send Existing Blueprint URL
Add an HTTP Response or Email node to notify user:

**Email Template:**
```
Hi {{$('Check Email for Existing Blueprint').item.json.contactName}},

We found that you already have a blueprint generated!

You can view it here: {{$('Check Email for Existing Blueprint').item.json.blueprintUrl}}

If you need a new analysis, please contact support@revamply.ai

Best regards,
Revamply Team
```

#### Option B: Send Existing Blueprint via Callback URL
Call the `receive-blueprint` endpoint with existing data:

**HTTP Request Node:**
- **Method:** `POST`
- **URL:** `{{$('Webhook').item.json.body.callbackUrl}}`
- **Body:**
```json
{
  "submissionId": "{{$('Webhook').item.json.body.submissionId}}",
  "blueprint": "We found you already have a blueprint! View it here: {{$('Check Email for Existing Blueprint').item.json.blueprintUrl}}",
  "status": "completed",
  "contactName": "{{$('Check Email for Existing Blueprint').item.json.contactName}}",
  "contactEmail": "{{$('Webhook').item.json.body.email}}"
}
```

---

### Step 4: Handle FALSE Branch (New Email)

If email does NOT exist (`exists: false`), continue with normal flow:
- Connect to "Message a model" node
- Continue with existing blueprint generation workflow

---

## Complete N8N Workflow Example

```
Webhook
  ↓
Check Email for Existing Blueprint (HTTP Request GET)
  ↓
Email Already Exists? (IF Node)
  ↓
  ├─ TRUE → Send Existing Blueprint URL (Email/HTTP Response)
  │           ↓
  │         End
  │
  └─ FALSE → Message a model (OpenAI)
              ↓
            HTTP Request (to receive-blueprint)
              ↓
            Respond to Webhook
              ↓
            HubSpot
              ↓
            Slack
```

---

## Testing the Endpoint

### Test with cURL (GET):
```bash
curl "https://revamply.ai/api/check-email?email=test@example.com"
```

### Test with cURL (POST):
```bash
curl -X POST https://revamply.ai/api/check-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Expected Response (New Email):
```json
{
  "success": true,
  "exists": false,
  "message": "No existing blueprint found for this email",
  "email": "test@example.com"
}
```

---

## Important Notes

1. **Case Insensitive:** Email lookup is case-insensitive (`test@example.com` = `Test@Example.com`)

2. **7-Day Expiration:** Blueprints and email mappings expire after 7 days in Redis

3. **Email Validation:** The endpoint validates email format before checking

4. **GET vs POST:**
   - Use GET for simple N8N queries
   - Use POST if you need to send additional data or prefer RESTful approach

5. **Response Always 200 OK:** Even when email doesn't exist, the endpoint returns 200 with `exists: false`. Only validation errors return 400.

---

## Troubleshooting

### Email exists but returns false
- Check if blueprint was created in the last 7 days (Redis TTL)
- Verify email is stored correctly in receive-blueprint.js
- Check Redis logs for email mapping storage

### Invalid email format error
- Verify email passes regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Remove any whitespace from email input

### Internal server error
- Check Redis connection (KV_REDIS_URL environment variable)
- Verify ioredis package is installed
- Check Vercel logs for detailed error messages

---

## Summary for Your N8N Setup

**URL to Use:** `https://revamply.ai/api/check-email`

**Method:** `GET`

**Query Parameter:** `email={{$('Webhook').item.json.body.email}}`

**How to Use the Response:**
- Check `{{$json.exists}}`
- If `true`: Email has blueprint → Use `{{$json.blueprintUrl}}`
- If `false`: New email → Continue to AI generation

---

## Questions?

Contact support@revamply.ai for assistance with N8N integration.
