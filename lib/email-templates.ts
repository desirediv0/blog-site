import fs from 'fs';
import path from 'path';
import { config } from './config';

export function renderTemplate(templateName: string, variables: Record<string, string>): string {
    const templatePath = path.join(process.cwd(), 'emails', `${templateName}.html`);
    
    try {
        let template = fs.readFileSync(templatePath, 'utf-8');
        
        // Replace variables in template
        Object.entries(variables).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            template = template.replace(regex, value);
        });
        
        return template;
    } catch (error) {
        console.error(`Error reading email template ${templateName}:`, error);
        throw error;
    }
}

export async function sendSignupEmail(email: string, name: string | null) {
    const { sendEmail } = await import('./mail');
    
    const html = renderTemplate('signup', {
        name: name || 'User',
    });
    
    return sendEmail({
        to: email,
        subject: 'Welcome to Our Blog Platform!',
        html,
    });
}

export async function sendBlogPurchaseEmail(
    email: string,
    name: string | null,
    blogTitle: string,
    blogSlug: string,
    amount: number
) {
    const { sendEmail } = await import('./mail');
    
    const html = renderTemplate('blog-purchase', {
        name: name || 'User',
        blogTitle,
        blogSlug,
        amount: amount.toString(),
        purchaseDate: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }),
        appUrl: config.app.url,
    });
    
    return sendEmail({
        to: email,
        subject: `Purchase Confirmation: ${blogTitle}`,
        html,
    });
}

export async function sendSubscriptionActivatedEmail(
    email: string,
    name: string | null,
    startDate: Date,
    endDate: Date
) {
    const { sendEmail } = await import('./mail');
    
    const html = renderTemplate('subscription-activated', {
        name: name || 'User',
        startDate: startDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }),
        endDate: endDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }),
        appUrl: config.app.url,
    });
    
    return sendEmail({
        to: email,
        subject: 'Your Premium Subscription is Now Active!',
        html,
    });
}

export async function sendSubscriptionCancelledEmail(
    email: string,
    name: string | null,
    cancelledDate: Date,
    endDate: Date
) {
    const { sendEmail } = await import('./mail');
    
    const html = renderTemplate('subscription-cancelled', {
        name: name || 'User',
        cancelledDate: cancelledDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }),
        endDate: endDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }),
        appUrl: config.app.url,
    });
    
    return sendEmail({
        to: email,
        subject: 'Your Subscription Has Been Cancelled',
        html,
    });
}

export async function sendOtpEmail(
    email: string,
    name: string | null,
    otp: string
) {
    const { sendEmail } = await import('./mail');
    
    // Create simple HTML email for OTP
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">Email Verification</h1>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <p style="font-size: 16px;">Hello ${name || 'User'},</p>
                <p style="font-size: 16px;">Thank you for signing up! Please use the following OTP to verify your email address:</p>
                <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px dashed #667eea;">
                    <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea; margin: 0;">${otp}</p>
                </div>
                <p style="font-size: 14px; color: #666;">This OTP will expire in 10 minutes.</p>
                <p style="font-size: 14px; color: #666;">If you didn't create an account, please ignore this email.</p>
                <p style="font-size: 16px; margin-top: 30px;">Best regards,<br>Blog Site Team</p>
            </div>
        </body>
        </html>
    `;
    
    return sendEmail({
        to: email,
        subject: 'Verify Your Email - OTP Code',
        html,
    });
}



