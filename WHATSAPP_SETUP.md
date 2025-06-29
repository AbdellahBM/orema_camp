# WhatsApp Approval Notification Setup

This guide explains how to set up the WhatsApp approval notification feature for OREMA Tanger Camping registration system.

## Prerequisites

1. UltraMsg Account - Sign up at [UltraMsg.com](https://ultramsg.com)
2. WhatsApp Business Account connected to UltraMsg
3. Database with `approved_notified` column (see Database Setup below)

## Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# UltraMsg WhatsApp API Configuration
ULTRAMSG_INSTANCE_ID=your_instance_id_here
ULTRAMSG_TOKEN=your_token_here
```

### Getting UltraMsg Credentials

1. Log in to your UltraMsg dashboard
2. Go to your instance settings
3. Copy the **Instance ID** (usually a string like "instance12345")
4. Copy the **Token** (a long string starting with letters/numbers)

## Database Setup

You need to add an `approved_notified` column to your `registrations` table:

```sql
ALTER TABLE registrations 
ADD COLUMN approved_notified BOOLEAN DEFAULT FALSE;
```

Run this SQL command in your Supabase SQL editor.

## How It Works

### Admin Dashboard
- For approved registrations, admins will see either:
  - **"Send WhatsApp Approval"** button (if not yet notified)
  - **"Approval Sent"** with checkmark (if already notified)

### WhatsApp Message
When the button is clicked, the system sends:
```
🎉 Congratulations! You have been approved for the event. See you at OREMA Camping Tanger!
```

### Phone Number Format
- The system automatically formats Moroccan phone numbers
- Supports numbers with or without country code
- Removes leading zeros and adds +212 prefix

### Error Handling
- **Daily Limit Reached**: UltraMsg has a 10 messages/day limit on free plans
- **Network Errors**: Displayed next to the specific registration
- **Missing Phone**: Shows error if no phone number available
- **Already Notified**: Prevents duplicate messages

### Security
- Only authenticated admin emails can send messages
- UltraMsg tokens are never exposed to the browser
- All API calls are server-side only

## Testing

1. Create a test registration with your own phone number
2. Set its status to "approved" in the admin dashboard
3. Click "Send WhatsApp Approval" 
4. Check your WhatsApp for the approval message
5. Verify the button changes to "Approval Sent"

## Troubleshooting

### Common Issues

**"WhatsApp API configuration missing"**
- Check your `.env.local` file has both `ULTRAMSG_INSTANCE_ID` and `ULTRAMSG_TOKEN`
- Restart your development server after adding env variables

**"Daily message limit reached"**
- UltraMsg free plan allows 10 messages per day
- Upgrade your UltraMsg plan or wait until tomorrow
- All send buttons will be disabled when limit is reached

**"No phone number available"**
- The registration doesn't have a phone number
- Update the registration to include a valid phone number

**Message not received**
- Check the phone number format in the database
- Ensure the WhatsApp number is active and can receive messages
- Check UltraMsg dashboard for delivery status

### Development vs Production

- Use different UltraMsg instances for development and production
- Test with your own phone number during development
- Monitor UltraMsg dashboard for message delivery status

## API Reference

### POST `/api/send-approval-whatsapp`

**Request Body:**
```json
{
  "registrationId": "uuid-string"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "WhatsApp approval notification sent successfully"
}
```

**Error Responses:**
```json
{
  "error": "limit_reached"
}
```

```json
{
  "error": "Registration not found"
}
```

```json
{
  "error": "Registration is not approved"
}
``` 