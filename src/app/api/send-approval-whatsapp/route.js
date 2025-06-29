import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAILS = [
  "khouloud@orema.com",
  "youssef@orema.com", 
  "salman@orema.com"
]

export async function POST(request) {
  try {
    // Get request body
    const { registrationId, accessToken } = await request.json()
    
    // Check authentication using the access token from client
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized - No access token' }, { status: 401 })
    }

    if (!registrationId) {
      return NextResponse.json({ error: 'Registration ID is required' }, { status: 400 })
    }

    // Create Supabase clients
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 })
    }

    // Create client for authentication check
    const authSupabase = createClient(supabaseUrl, supabaseAnonKey)
    const { data: { user }, error: authError } = await authSupabase.auth.getUser(accessToken)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 })
    }

    if (!ADMIN_EMAILS.includes(user.email)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get environment variables
    const instanceId = process.env.ULTRAMSG_INSTANCE_ID
    const token = process.env.ULTRAMSG_TOKEN

    if (!instanceId || !token) {
      return NextResponse.json({ 
        error: 'WhatsApp API configuration missing' 
      }, { status: 500 })
    }

    // Create authenticated client for database operations
    const dbSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    })

    // Look up user in Supabase using authenticated client
    console.log('Looking for registration with ID:', registrationId)
    const { data: registration, error: fetchError } = await dbSupabase
      .from('registrations')
      .select('*')
      .eq('id', registrationId)
      .single()

    console.log('Database query result:', { registration, fetchError })

    if (fetchError || !registration) {
      console.error('Registration lookup failed:', fetchError)
      return NextResponse.json({ 
        error: `Registration not found. ID: ${registrationId}, Error: ${fetchError?.message || 'No data'}` 
      }, { status: 404 })
    }

    // Check if user is approved and not already notified
    if (registration.status !== 'approved') {
      return NextResponse.json({ 
        error: 'Registration is not approved' 
      }, { status: 400 })
    }

    if (registration.approved_notified) {
      return NextResponse.json({ 
        error: 'Approval notification already sent' 
      }, { status: 400 })
    }

    if (!registration.phone) {
      return NextResponse.json({ 
        error: 'No phone number available for this registration' 
      }, { status: 400 })
    }

    // Prepare WhatsApp message
    const message = "🎉 Congratulations! You have been approved for the event. See you at OREMA Camping Tanger!"
    
    // Format phone number for WhatsApp (remove any non-digits and ensure proper format)
    const cleanPhone = registration.phone.replace(/\D/g, '')
    const whatsappPhone = cleanPhone.startsWith('212') ? cleanPhone : '212' + cleanPhone.replace(/^0/, '')

    // Send WhatsApp message via UltraMsg API
    const whatsappResponse = await fetch(`https://api.ultramsg.com/${instanceId}/messages/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: token,
        to: whatsappPhone,
        body: message
      })
    })

    const whatsappResult = await whatsappResponse.json()
    console.log('UltraMsg API response:', whatsappResult)

    // Check if message was sent successfully
    if (whatsappResult.sent === "true" || whatsappResult.sent === true) {
      // Update approved_notified to true in Supabase
      const { error: updateError } = await dbSupabase
        .from('registrations')
        .update({ approved_notified: true })
        .eq('id', registrationId)

      if (updateError) {
        console.error('Failed to update notification status:', updateError)
        return NextResponse.json({ 
          error: 'Message sent but failed to update database' 
        }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        message: 'WhatsApp approval notification sent successfully' 
      })
    } else {
      // Handle specific UltraMsg error statuses
      if (whatsappResult.sent === "false" || whatsappResult.sent === false) {
        // Check the specific error reason
        if (whatsappResult.message && whatsappResult.message.toLowerCase().includes('invalid')) {
          return NextResponse.json({ 
            error: 'Invalid phone number. Please check the phone number format.' 
          }, { status: 400 })
        }
        if (whatsappResult.message && whatsappResult.message.toLowerCase().includes('limit')) {
          return NextResponse.json({ error: 'limit_reached' }, { status: 429 })
        }
        return NextResponse.json({ 
          error: whatsappResult.message || 'Failed to send WhatsApp message' 
        }, { status: 500 })
      }

      // Check for legacy error format
      if (whatsappResult.error) {
        if (whatsappResult.error.includes('limit')) {
          return NextResponse.json({ error: 'limit_reached' }, { status: 429 })
        }
        return NextResponse.json({ 
          error: whatsappResult.error 
        }, { status: 500 })
      }

      // Default error for unknown response format
      return NextResponse.json({ 
        error: 'Unknown response from WhatsApp API' 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('WhatsApp API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
} 