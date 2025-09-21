import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verifyAdminAccess } from '@/lib/auth/admin-check'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const { isAdmin, error } = await verifyAdminAccess()
    if (!isAdmin) {
      return NextResponse.json({ error }, { status: error === 'Not authenticated' ? 401 : 403 })
    }

    const { email, role = 'admin' } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    if (!['admin', 'editor'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be "admin" or "editor"' },
        { status: 400 }
      )
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
    }

    const supabase = createServiceClient()
    
    console.log('Admin Invite - Processing invitation for email:', email, 'role:', role)

    // Check if user already exists
    const { data: existingUser, error: userError } = await supabase
      .from('user_profiles')
      .select('id, email, full_name, admin_users(role)')
      .eq('email', email)
      .single()

    // Generate invitation token (you might want to store this in a separate table for security)
    const inviteToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/accept-invite?token=${inviteToken}&email=${encodeURIComponent(email)}&role=${role}`

    let emailContent = ''
    let subject = ''

    if (existingUser && !userError) {
      // User exists, check if already admin
      // Handle both array and object responses from Supabase join
      const adminRoles = Array.isArray(existingUser.admin_users) ? existingUser.admin_users : (existingUser.admin_users ? [existingUser.admin_users] : [])
      if (adminRoles.length > 0) {
        return NextResponse.json(
          { error: `User ${email} is already an admin with role: ${adminRoles[0].role}` },
          { status: 400 }
        )
      }

      // User exists but not admin, send role assignment invite
      subject = `Admin Role Assignment - HoopMetrix`
      emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 40px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">HoopMetrix Admin Invitation</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Basketball Encyclopedia Platform</p>
          </div>
          
          <div style="padding: 40px; background: #f8fafc;">
            <h2 style="color: #1e293b; margin-bottom: 20px;">Hello ${existingUser.full_name || 'User'},</h2>
            
            <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
              You've been invited to become an <strong>${role}</strong> for the HoopMetrix platform. 
              This will give you access to the admin dashboard and management features.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
              <p style="color: #1e293b; margin: 0; font-weight: 600;">Role: ${role.charAt(0).toUpperCase() + role.slice(1)}</p>
              <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">
                ${role === 'admin' ? 'Full administrative access to all features' : 'Limited access to content management features'}
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${inviteUrl}" 
                 style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: 600;
                        display: inline-block;">
                Accept Admin Role
              </a>
            </div>
            
            <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
              If you didn't expect this invitation, please ignore this email.
              This invitation will expire in 24 hours.
            </p>
          </div>
          
          <div style="background: #e2e8f0; padding: 20px; text-align: center; color: #64748b; font-size: 12px;">
            <p style="margin: 0;">© 2025 HoopMetrix. All rights reserved.</p>
          </div>
        </div>
      `
    } else {
      // User doesn't exist, send signup + admin invite
      subject = `Admin Invitation - Join HoopMetrix`
      emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 40px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Welcome to HoopMetrix</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Basketball Encyclopedia Platform</p>
          </div>
          
          <div style="padding: 40px; background: #f8fafc;">
            <h2 style="color: #1e293b; margin-bottom: 20px;">You're Invited!</h2>
            
            <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
              You've been invited to join HoopMetrix as an <strong>${role}</strong>. 
              You'll need to create an account first, then your admin access will be automatically activated.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
              <p style="color: #1e293b; margin: 0; font-weight: 600;">Admin Role: ${role.charAt(0).toUpperCase() + role.slice(1)}</p>
              <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">
                ${role === 'admin' ? 'Full administrative access to all features' : 'Limited access to content management features'}
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${inviteUrl}" 
                 style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: 600;
                        display: inline-block;">
                Create Account & Accept Invite
              </a>
            </div>
            
            <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
              If you didn't expect this invitation, please ignore this email.
              This invitation will expire in 24 hours.
            </p>
          </div>
          
          <div style="background: #e2e8f0; padding: 20px; text-align: center; color: #64748b; font-size: 12px;">
            <p style="margin: 0;">© 2025 HoopMetrix. All rights reserved.</p>
          </div>
        </div>
      `
    }

    // Send the email
    try {
      const emailResult = await resend.emails.send({
        from: 'HoopMetrix <onboarding@resend.dev>', // Use Resend's verified default domain
        to: [email],
        subject: subject,
        html: emailContent,
      })

      console.log('Admin Invite - Email sent successfully:', emailResult)

      // TODO: Store invitation token in database for verification
      // For now, we'll just return success

      return NextResponse.json({
        success: true,
        message: `Admin invitation sent to ${email}`,
        userExists: !!existingUser,
        inviteId: emailResult.data?.id
      })

    } catch (emailError) {
      console.error('Admin Invite - Email sending failed:', emailError)
      return NextResponse.json(
        { error: 'Failed to send invitation email', details: emailError.message },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Admin Invite - Error:', error)
    return NextResponse.json(
      { error: 'Failed to send invitation', details: error.message },
      { status: 500 }
    )
  }
}