 import nodemailer from 'nodemailer'

export interface EmailPayload {
  to: string
  subject: string
  html?: string
  text?: string
  from?: string
}

let transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (transporter) return transporter

  const host = process.env.SMTP_HOST || 'smtp.gmail.com'
  const port = Number(process.env.SMTP_PORT || 587)
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!user || !pass) {
    console.warn('[Email] SMTP credentials are not configured. Emails will be skipped.')
    return null
  }

  const safeUser = user.replace(/(.{2}).+(@.*)/, '$1***$2')
  console.log('[Email] Initializing transporter', { host, port, secure, user: safeUser })

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass
    }
  })

  return transporter
}

async function sendViaResend(payload: EmailPayload & { text: string; html?: string; from: string }) {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.warn('[Email] Resend API key not configured. Skipping Resend fallback.')
    return { skipped: true, error: new Error('RESEND_API_KEY not configured') }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: payload.from,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text
      })
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      const message = data?.message || data?.error || `Resend HTTP ${response.status}`
      throw new Error(message)
    }

    console.log('[Email] Resend email sent successfully', { id: data?.id })
    return { success: true, provider: 'resend', messageId: data?.id }
  } catch (error) {
    console.error('[Email] Resend send failed:', error)
    return { success: false, error }
  }
}

export async function sendEmail(payload: EmailPayload) {
  const from = payload.from || process.env.SMTP_FROM || process.env.RESEND_FROM || process.env.SMTP_USER || 'noreply@smpi.com'
  const normalizedText = payload.text ?? payload.html?.replace(/<[^>]+>/g, '') ?? ''
  const mailer = getTransporter()
  let smtpError: any = null

  if (mailer) {
    console.log('[Email] Sending email via SMTP', { to: payload.to, subject: payload.subject, from })
    try {
      const info = await mailer.sendMail({
        from,
        to: payload.to,
        subject: payload.subject,
        text: normalizedText,
        html: payload.html
      })

      console.log('[Email] Email sent successfully (SMTP)', { messageId: info.messageId })
      return { success: true, provider: 'smtp', messageId: info.messageId }
    } catch (error) {
      smtpError = error
      console.error('[Email] Failed to send email via SMTP:', error)
    }
  } else {
    console.warn('[Email] SMTP transporter unavailable. Attempting fallback provider.')
  }

  const resendResult = await sendViaResend({ ...payload, from, text: normalizedText })
  if (resendResult.success) {
    return resendResult
  }

  return {
    success: false,
    error: resendResult.error || smtpError || new Error('No email transport configured'),
    skipped: !mailer && resendResult.skipped
  }
}
