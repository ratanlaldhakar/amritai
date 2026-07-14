# Meta WhatsApp & Project Deployment Guide

This document details the configuration keys, where to retrieve them within the Meta Developer Console, and how to deploy **Amrit Yoga AI** immediately.

---

## 📱 1. Meta Developer Dashboard Setup

To configure the WhatsApp integration, log into the [Meta Developers Portal](https://developers.facebook.com) and navigate to your application. Ensure the **WhatsApp** product is added to your app.

### Key Variables Location Guide

#### 🔑 `WHATSAPP_PHONE_NUMBER_ID`

- **Where to find it**: In the left sidebar of your app, click on **WhatsApp** $\rightarrow$ **Getting Started**.
- **Location**: Look at the main section under "Step 1: Select phone numbers". You will find the **Phone number ID** displayed directly below your test sender phone number selection.

#### 🔑 `WHATSAPP_ACCESS_TOKEN`

- **Where to find it (Sandbox / Testing)**: Navigate to **WhatsApp** $\rightarrow$ **Getting Started**. The **Temporary access token** is displayed in the textbox at the top of the page. Note: This token expires after 24 hours.
- **Where to find it (Production / Go Live)**:
  1. Go to your Meta Business Manager Settings at [business.facebook.com](https://business.facebook.com).
  2. Go to **Users** $\rightarrow$ **System Users**.
  3. Add a System User, assign your Meta App as an asset with full permissions, and click **Generate New Token**.
  4. Copy the generated permanent token. This token will not expire.

#### 🔑 `WHATSAPP_BUSINESS_ACCOUNT_ID`

- **Where to find it**: Navigate to **WhatsApp** $\rightarrow$ **Getting Started**.
- **Location**: Found directly next to the Phone number ID in the "Step 1: Select phone numbers" section under the label **WhatsApp Business Account ID**.

#### 🔑 `WHATSAPP_VERIFY_TOKEN`

- **Where to find it**: You define this yourself. It must match the string value of `WHATSAPP_VERIFY_TOKEN` inside your `.env.local` or Vercel environment variables.
- **How to register it with Meta**:
  1. In the Meta App Developer Portal, go to **WhatsApp** $\rightarrow$ **Configuration** in the left sidebar.
  2. Click **Edit** in the Webhooks section.
  3. Paste your Vercel endpoint: `https://your-domain.vercel.app/api/webhook`.
  4. Enter your custom Verify Token string.
  5. Click **Verify and Save**.
  6. Click **Manage** next to Webhooks fields and subscribe to **messages** events.

#### 🔑 `WHATSAPP_APP_SECRET`

- **Where to find it**: Go to **App Settings** $\rightarrow$ **Basic** in the left sidebar of the Meta Developer Console.
- **Location**: Copy the **App Secret** located next to the App ID. Click **Show** (requires re-entering your Meta password).

---

## ⚡ 2. Environment Variables Configuration

Copy these keys into your local **`.env.local`** file (already created) and configure them in Vercel.

```bash
# Meta Cloud API Config
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_system_user_access_token
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WHATSAPP_VERIFY_TOKEN=your_defined_verify_token
WHATSAPP_APP_SECRET=your_app_secret
```

---

## 🚀 3. Go-Live Checkpoints

1. **Deploy to Vercel**: Connect your GitHub repository to Vercel, paste the environment variables, and trigger a build.
2. **Webhook Verification**: Save your webhook URL and Verify Token in the Meta App Configuration page.
3. **Trigger Webhook Subscription**: Test the webhook connection by sending "Hello" from a registered WhatsApp test number to your WhatsApp Business phone number.
