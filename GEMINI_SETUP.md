# Gemini AI Setup Guide

This guide will help you set up Google's Gemini AI for automatic participant scoring in the OREMA Tanger camping registration system.

## Prerequisites

1. Google Cloud Platform account
2. Gemini API access

## Setup Steps

### 1. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 2. Configure Environment Variables

Add the following environment variable to your `.env.local` file:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Install Dependencies

The required package is already included in `package.json`. Run:

```bash
npm install
```

## How It Works

### Scoring Criteria

The AI evaluates participants based on:

- **Motivation and Interest (30%)**: Based on camp expectations and responses
- **Educational Background and Age (25%)**: Age appropriateness and educational level
- **Financial Capacity and Commitment (20%)**: Ability to pay camp fees
- **Previous Experience and Maturity (15%)**: Prior camp participation
- **Clear Expectations and Goals (10%)**: Clarity of what they expect from the camp

### Scoring Process

1. **Registration Submission**: User submits registration form
2. **Data Insertion**: Registration data is saved to Supabase
3. **AI Scoring**: System calls Gemini API with participant data
4. **Score Update**: Score and explanation are saved back to the database
5. **Admin View**: Scores are visible in the admin dashboard

### Score Interpretation

- **80-100**: 🌟 ممتاز (Excellent) - Highly recommended
- **60-79**: ✅ جيد (Good) - Recommended
- **1-59**: ⚠️ يحتاج مراجعة (Needs Review) - Requires careful consideration

## API Endpoint

### `/api/score-participant`

**Method**: `POST`

**Request Body**:
```json
{
  "name": "participant name",
  "email": "email@example.com",
  "age": 20,
  "niveau_scolaire": "الإجازة",
  "school": "university name",
  "org_status": "عضو(ة)",
  "previous_camps": true,
  "can_pay_350dh": true,
  "camp_expectation": "expectations text",
  "extra_info": "additional info"
}
```

**Response**:
```json
{
  "score": 85,
  "score_explanation": "AI explanation in Arabic",
  "success": true
}
```

## Error Handling

The system handles various error scenarios:

1. **Missing API Key**: Returns configuration error
2. **Network Issues**: Falls back gracefully, registration still succeeds
3. **AI Response Errors**: Scores are marked as "not evaluated"
4. **Invalid Responses**: Validation ensures scores are within 1-100 range

## Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Verify the key is correct
   - Check if Gemini API is enabled
   - Ensure billing is set up if required

2. **Scoring Not Working**
   - Check browser console for errors
   - Verify environment variables are loaded
   - Test the API endpoint directly

3. **Slow Response Times**
   - Gemini API typically responds in 2-5 seconds
   - Network conditions may affect speed
   - Consider implementing timeout handling

### Testing

To test the scoring functionality:

1. Submit a test registration
2. Check the admin dashboard for the score
3. Verify the score explanation makes sense

## Security Considerations

- API key should never be exposed to the client
- Use environment variables for sensitive configuration
- Consider rate limiting for production use
- Monitor API usage and costs

## Cost Considerations

- Gemini API pricing is based on usage
- Each registration triggers one API call
- Monitor usage through Google Cloud Console
- Consider implementing caching for repeated evaluations

---

For support, contact the development team or refer to [Google's Gemini AI documentation](https://ai.google.dev/). 