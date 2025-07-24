import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set')
}

export const resend = new Resend(process.env.RESEND_API_KEY)

// Email templates
export const emailTemplates = {
  welcome: (name: string) => ({
    subject: 'Welcome to HoopMetrix!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f97316;">Welcome to HoopMetrix, ${name}!</h1>
        <p>Thank you for joining the ultimate basketball encyclopedia. You now have access to:</p>
        <ul>
          <li>500+ NBA player profiles with stats and photos</li>
          <li>144+ WNBA player profiles with comprehensive data</li>
          <li>Team information for all NBA and WNBA teams</li>
          <li>Exclusive merchandise in our shop</li>
        </ul>
        <p>Start exploring now and discover everything basketball!</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Explore HoopMetrix
        </a>
      </div>
    `
  }),

  membershipConfirmation: (name: string, plan: string) => ({
    subject: 'HoopMetrix Premium Membership Confirmed!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f97316;">Welcome to HoopMetrix Premium, ${name}!</h1>
        <p>Your ${plan} membership has been confirmed. You now have access to:</p>
        <ul>
          <li>Exclusive premium content and analysis</li>
          <li>Advanced player statistics and comparisons</li>
          <li>Early access to new features</li>
          <li>Priority customer support</li>
          <li>Exclusive discounts on merchandise</li>
        </ul>
        <p>Thank you for supporting HoopMetrix!</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Access Premium Content
        </a>
      </div>
    `
  }),

  orderConfirmation: (name: string, orderNumber: string, items: any[]) => ({
    subject: `Order Confirmation #${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f97316;">Order Confirmed!</h1>
        <p>Hi ${name},</p>
        <p>Thank you for your order! Here are the details:</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Order #${orderNumber}</h3>
          ${items.map(item => `
            <div style="border-bottom: 1px solid #e9ecef; padding: 10px 0;">
              <strong>${item.name}</strong><br>
              Quantity: ${item.quantity}<br>
              Price: $${item.price}
            </div>
          `).join('')}
        </div>
        <p>Your order will be processed and shipped within 2-3 business days.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders" style="background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Track Your Order
        </a>
      </div>
    `
  })
}

// Helper functions to send emails
export async function sendWelcomeEmail(email: string, name: string) {
  const template = emailTemplates.welcome(name)
  
  return await resend.emails.send({
    from: 'HoopMetrix <noreply@hoopmetrix.com>',
    to: email,
    subject: template.subject,
    html: template.html,
  })
}

export async function sendMembershipConfirmation(email: string, name: string, plan: string) {
  const template = emailTemplates.membershipConfirmation(name, plan)
  
  return await resend.emails.send({
    from: 'HoopMetrix <noreply@hoopmetrix.com>',
    to: email,
    subject: template.subject,
    html: template.html,
  })
}

export async function sendOrderConfirmation(email: string, name: string, orderNumber: string, items: any[]) {
  const template = emailTemplates.orderConfirmation(name, orderNumber, items)
  
  return await resend.emails.send({
    from: 'HoopMetrix <orders@hoopmetrix.com>',
    to: email,
    subject: template.subject,
    html: template.html,
  })
}