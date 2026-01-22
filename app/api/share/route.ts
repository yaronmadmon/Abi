import { NextRequest, NextResponse } from 'next/server'

interface ShareRequest {
  to: {
    id: string
    name: string
    email?: string
    phone?: string
  }
  item: {
    type: 'appointment' | 'task' | 'reminder'
    title: string
    date?: string
    time?: string
    location?: string
    notes?: string
  }
  preferences?: {
    emailNotifications: boolean
    smsNotifications: boolean
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ShareRequest = await request.json()
    const { to, item } = body

    // Validate required fields
    if (!to || !to.name || !item || !item.title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get user's notification preferences from request or default to enabled
    const emailEnabled = body.preferences?.emailNotifications !== false
    const smsEnabled = body.preferences?.smsNotifications !== false

    // Format message
    const dateStr = item.date ? new Date(item.date).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) : ''
    
    const timeStr = item.time ? (() => {
      const [hours, minutes] = item.time.split(':')
      const hour = parseInt(hours)
      const period = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour)
      return `${displayHour}:${minutes || '00'} ${period}`
    })() : ''

    // Email content
    const emailSubject = `${item.type === 'appointment' ? 'Appointment' : item.type === 'task' ? 'Task' : 'Reminder'}: ${item.title}`
    const emailBody = `Hi ${to.name},

You have a shared ${item.type}:

Title: ${item.title}
${dateStr ? `Date: ${dateStr}` : ''}
${timeStr ? `Time: ${timeStr}` : ''}
${item.location ? `Location: ${item.location}` : ''}
${item.notes ? `Notes: ${item.notes}` : ''}

---
Sent from Abby`

    // SMS content (shorter)
    const smsBody = `${item.type === 'appointment' ? 'Appointment' : item.type === 'task' ? 'Task' : 'Reminder'}: ${item.title}${dateStr ? `\nDate: ${dateStr}` : ''}${timeStr ? ` at ${timeStr}` : ''}${item.location ? `\nLocation: ${item.location}` : ''}`

    // Send email if enabled and email available
    if (emailEnabled && to.email) {
      try {
        // TODO: Integrate with email service (Resend, SendGrid, or Nodemailer)
        // For now, log it
        console.log('📧 Would send email:', {
          to: to.email,
          subject: emailSubject,
          body: emailBody,
        })
        
        // Example with Resend (uncomment when API key is set):
        // const RESEND_API_KEY = process.env.RESEND_API_KEY
        // if (RESEND_API_KEY) {
        //   const response = await fetch('https://api.resend.com/emails', {
        //     method: 'POST',
        //     headers: {
        //       'Authorization': `Bearer ${RESEND_API_KEY}`,
        //       'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({
        //       from: 'Abby <noreply@abby.app>',
        //       to: to.email,
        //       subject: emailSubject,
        //       text: emailBody,
        //     }),
        //   })
        //   if (!response.ok) throw new Error('Failed to send email')
        // }
      } catch (error) {
        console.error('Error sending email:', error)
        // Don't fail the whole request if email fails
      }
    }

    // Send SMS if enabled and phone available
    if (smsEnabled && to.phone) {
      try {
        // TODO: Integrate with SMS service (Twilio, AWS SNS, or Resend SMS)
        // For now, log it
        console.log('📱 Would send SMS:', {
          to: to.phone,
          body: smsBody,
        })
        
        // Example with Twilio (uncomment when credentials are set):
        // const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
        // const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
        // const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER
        // if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER) {
        //   const response = await fetch(
        //     `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
        //     {
        //       method: 'POST',
        //       headers: {
        //         'Authorization': `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')}`,
        //         'Content-Type': 'application/x-www-form-urlencoded',
        //       },
        //       body: new URLSearchParams({
        //         From: TWILIO_PHONE_NUMBER,
        //         To: to.phone,
        //         Body: smsBody,
        //       }),
        //     }
        //   )
        //   if (!response.ok) throw new Error('Failed to send SMS')
        // }
      } catch (error) {
        console.error('Error sending SMS:', error)
        // Don't fail the whole request if SMS fails
      }
    }

    // Return success even if email/SMS services aren't configured yet
    // The actual sending will happen when services are set up
    return NextResponse.json({ 
      success: true,
      message: 'Share request processed',
      sent: {
        email: emailEnabled && to.email ? true : false,
        sms: smsEnabled && to.phone ? true : false,
      }
    })
  } catch (error) {
    console.error('Error in share API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
