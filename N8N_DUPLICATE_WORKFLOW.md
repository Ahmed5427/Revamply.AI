# N8N Duplicate Email Workflow Guide

## Overview
This guide explains how to configure N8N to detect duplicate email submissions using HubSpot and handle them appropriately.

---

## Complete N8N Workflow

```
1. Webhook (Receive form submission)
   ↓
2. Search HubSpot for Email
   ↓
3. IF Email Exists in HubSpot?
   ↓
   ├─ TRUE (Duplicate Email)
   │   ↓
   │   ├─ HTTP Request: Notify duplicate (handle-duplicate endpoint)
   │   ├─ Get Existing Blueprint URL from HubSpot
   │   └─ Email: Send existing blueprint to user
   │       ↓
   │     End
   │
   └─ FALSE (New Email)
       ↓
       Message a model (Generate AI Blueprint)
       ↓
       HTTP Request (Send blueprint back)
       ↓
       Create/Update HubSpot Contact
       ↓
       Send Slack Notification
       ↓
       End
```

---

## Step-by-Step Configuration

### 1️⃣ Webhook Node (Already Configured)
- Receives form submission from website
- Extracts email and form data

---

### 2️⃣ Search HubSpot for Email

**Node Type:** HubSpot - Search Contacts

**Configuration:**
```
Resource: Contact
Operation: Search
Return All: No (just need to know if exists)

Filter:
- Property: email
- Operator: equals
- Value: {{$('Webhook').item.json.body.email}}
```

---

### 3️⃣ IF Node - Email Exists?

**Node Type:** IF

**Configuration:**
```
Condition 1:
- Field: {{$('Search HubSpot for Email').item.json.id}}
- Operation: is not empty
```

This checks if HubSpot returned a contact (meaning email exists).

---

### 4️⃣ TRUE Branch - Handle Duplicate

#### A. HTTP Request - Notify Duplicate

**Node Type:** HTTP Request

**Configuration:**
```
Method: POST
URL: https://revamply.ai/api/handle-duplicate

Headers:
- Content-Type: application/json

Body (JSON):
{
  "email": "{{$('Webhook').item.json.body.email}}",
  "status": "duplicate",
  "message": "Email already has a blueprint",
  "contactName": "{{$('Webhook').item.json.body.fullName}}"
}
```

**What this does:**
- Sends duplicate notification to your system
- Automatically looks up existing blueprint by email
- Returns user-facing HTML saying "we'll email you the blueprint"
- Provides instant "View Blueprint" link if blueprint is found

**Note:** The endpoint automatically retrieves the blueprint using the email address, so `submissionId` is not required.

---

#### B. Get Blueprint URL from HubSpot

**Node Type:** Code (JavaScript)

```javascript
// Extract submission ID from HubSpot contact
const hubspotContact = $('Search HubSpot for Email').item.json;
const submissionId = hubspotContact.properties.submission_id;

if (submissionId) {
  return {
    submissionId: submissionId,
    blueprintUrl: `https://revamply.ai/api/get-blueprint-page?submissionId=${submissionId}`,
    contactName: hubspotContact.properties.firstname || 'Valued Customer',
    contactEmail: hubspotContact.properties.email
  };
} else {
  return {
    error: 'No submission ID found in HubSpot',
    contactName: hubspotContact.properties.firstname || 'Valued Customer',
    contactEmail: hubspotContact.properties.email
  };
}
```

---

#### C. Send Email with Existing Blueprint

**Node Type:** Gmail (or your email service)

**Configuration:**
```
To: {{$('Webhook').item.json.body.email}}
Subject: Your AI Solution Blueprint from Revamply

Body:
Hi {{$('Code').item.json.contactName}},

Great news! We found that you already have an AI solution blueprint generated.

🎯 View Your Blueprint:
{{$('Code').item.json.blueprintUrl}}

This blueprint contains:
✅ Custom AI solutions for your business
✅ Implementation timeline
✅ Expected ROI calculations
✅ Next steps for transformation

Questions? Ready to move forward?
📅 Schedule a consultation: https://calendly.com/revamply/consultation
📧 Email us: solutions@revamply.ai

Best regards,
The Revamply Team

---
Revamply - Transforming Businesses with AI
https://revamply.ai
```

---

#### D. Respond to Webhook (Duplicate Case)

**Node Type:** Respond to Webhook

**Configuration:**
```
Response Type: Text
Response: {{$('HTTP Request').item.json.html}}
```

This returns the duplicate HTML page to the user.

---

### 5️⃣ FALSE Branch - New Email (Existing Flow)

Continue with your existing workflow:

1. **Message a model** (OpenAI - Generate blueprint)
2. **HTTP Request** (Send to receive-blueprint)
3. **Create/Update HubSpot Contact** (Store submission_id)
4. **Slack Notification**
5. **Respond to Webhook**

---

## Important HubSpot Setup

### Required Custom Property in HubSpot

You need a custom property to store the submission ID:

**Property Name:** `submission_id`
**Field Type:** Single-line text
**Description:** Stores the unique submission ID for blueprint lookup

### How to Create:

1. Go to HubSpot Settings → Properties → Contact Properties
2. Click "Create property"
3. Set:
   - **Label:** Submission ID
   - **Internal name:** `submission_id`
   - **Field type:** Single-line text
   - **Description:** UUID for blueprint lookup
4. Save

---

## Complete N8N Node Configuration Summary

### Node Order:

```
1. Webhook
2. Search HubSpot for Email
3. IF (Email Exists?)
   ├─ TRUE:
   │   4a. HTTP Request (handle-duplicate)
   │   4b. Code (Get blueprint URL)
   │   4c. Gmail (Send existing blueprint)
   │   4d. Respond to Webhook
   │
   └─ FALSE:
       5a. Message a model
       5b. HTTP Request (receive-blueprint)
       5c. Create/Update HubSpot Contact
       5d. Slack Notification
       5e. Respond to Webhook
```

---

## API Endpoints Used

### 1. Check Email (Optional - for testing)
```
GET https://revamply.ai/api/check-email?email=test@example.com
```
Use this to manually test if email exists in system.

### 2. Handle Duplicate (Main endpoint)
```
POST https://revamply.ai/api/handle-duplicate

Body:
{
  "email": "user@example.com",
  "status": "duplicate",
  "message": "Email already has blueprint",
  "contactName": "John Doe"
}
```

**Required Fields:**
- `email`: User's email address (required)
- `contactName`: User's full name (optional, defaults to "Valued Customer")

**Optional Fields:**
- `submissionId`: If you have it, speeds up lookup (optional)
- `status`: Status indicator (optional)
- `message`: Custom message (optional)

Returns HTML page telling user "we'll email you the blueprint"

---

## Testing Your Workflow

### Test Case 1: New Email
```
1. Submit form with: newemail@test.com
2. Expected: HubSpot returns empty → FALSE branch
3. Result: New blueprint generated
4. HubSpot: New contact created with submission_id
```

### Test Case 2: Existing Email
```
1. Submit form with: existing@test.com (already in HubSpot)
2. Expected: HubSpot returns contact → TRUE branch
3. Result:
   - User sees "we'll email you" message
   - Email sent with existing blueprint URL
   - No new AI generation (saves costs!)
```

---

## Payload Examples

### HubSpot Search Response (Email Exists)
```json
{
  "id": "12345",
  "properties": {
    "email": "test@example.com",
    "firstname": "John",
    "lastname": "Doe",
    "submission_id": "38fde2ea-2855-4921-a73a-3631b3e6d7a5",
    "createdate": "2025-01-15T10:30:00Z"
  }
}
```

### HubSpot Search Response (Email NOT Found)
```json
{
  "results": []
}
```

---

## Troubleshooting

### Issue: Email exists but no submission_id in HubSpot

**Cause:** Contact was created before blueprint system was implemented

**Solution:** In TRUE branch, add another IF node:

```
IF submission_id exists?
  ├─ YES → Send existing blueprint
  └─ NO → Generate new blueprint (treat as new user)
```

---

### Issue: Duplicate detection not working

**Checklist:**
- ✅ HubSpot search configured correctly
- ✅ Email field matches exactly (case-insensitive)
- ✅ HubSpot authentication working
- ✅ IF node condition checking for contact ID

---

### Issue: Email sent but no blueprint URL

**Cause:** submission_id not stored in HubSpot

**Solution:** Verify "Create/Update HubSpot Contact" node in FALSE branch includes:

```json
{
  "properties": {
    "submission_id": "{{$('Webhook').item.json.body.submissionId}}"
  }
}
```

---

## Benefits of This Workflow

✅ **Cost Savings** - No duplicate AI generation (saves OpenAI API calls)

✅ **Better UX** - User immediately gets existing blueprint via email

✅ **Data Consistency** - Single source of truth in HubSpot

✅ **Sales Intelligence** - Know when leads are returning/interested

✅ **Prevents Confusion** - User doesn't get multiple different blueprints

---

## Advanced: Add Slack Notification for Duplicates

**Node Type:** Slack

**Configuration:**
```
Channel: #revamply-leads
Message:
🔁 Duplicate Submission Detected!

Email: {{$('Webhook').item.json.body.email}}
Name: {{$('Webhook').item.json.body.fullName}}
Original Submission: {{$('Search HubSpot for Email').item.json.properties.createdate}}

Action: Sent existing blueprint via email

This could indicate:
- Strong interest (ready to move forward!)
- User forgot they already submitted
- Different person same company

Consider reaching out personally! 📞
```

---

## Questions?

Contact support@revamply.ai for help with N8N workflow configuration.
