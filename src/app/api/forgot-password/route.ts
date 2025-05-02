import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb_auth';
import { randomBytes } from 'crypto';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('Data');
    const usersCollection = db.collection('users');
    
    // Find the user
    const user = await usersCollection.findOne({ email });
    
    // For security reasons, always return success even if email doesn't exist
    // This prevents email enumeration attacks
    const responseMessage = 'If your email exists in our system, you will receive a password reset link.';
    
    // Only proceed with sending email if user exists
    if (user) {
      // Generate a reset token
      const resetToken = randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now
      
      // Store the reset token in the database
      await usersCollection.updateOne(
        { email },
        { $set: { resetToken, resetTokenExpiry } }
      );
      
      // Generate a reset URL
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
      
      try {
        // Send the reset email
        await sendEmail({
          to: email,
          subject: 'Password Reset Request',
          text: `Please click the following link to reset your password: ${resetUrl}`,
          html: `
            <p>You requested a password reset.</p>
            <p>Click <a href="${resetUrl}">here</a> to reset your password.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <p>This link will expire in 1 hour.</p>
          `
        });
      } catch (emailError) {
        console.error('Error sending password reset email:', emailError);
        return NextResponse.json({ error: 'Failed to send email. Please try again later.' }, { status: 500 });
      }
    }
    
    return NextResponse.json({ message: responseMessage }, { status: 200 });
  } catch (error) {
    console.error('Error in forgot password:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}