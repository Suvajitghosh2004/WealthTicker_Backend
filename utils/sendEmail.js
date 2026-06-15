import nodemailer from 'nodemailer'

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })
}

export const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter()
  const info = await transporter.sendMail({
    from: `"WealthTicker" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
    text
  })
  return info
}

export const sendContactEmail = async ({ name, email, message }) => {
  return sendEmail({
    to: process.env.CONTACT_EMAIL,
    subject: `New Contact: ${name}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
    text: `From: ${name} (${email})\n\n${message}`
  })
}

export const sendBroadcastEmail = async (subscribers, { subject, html }) => {
  const transporter = createTransporter()
  const emails = subscribers.map(s => s.email)

  return transporter.sendMail({
    from: `"WealthTicker" <${process.env.SMTP_USER}>`,
    bcc: emails,
    subject,
    html
  })
}
