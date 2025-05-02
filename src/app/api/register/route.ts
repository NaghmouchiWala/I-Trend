// app/api/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/user';
import { z } from 'zod';

// Create a schema for user registration validation
const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate the request body
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }
    
    // Create the user
    await createUser({
      name: body.name,
      email: body.email,
      password: body.password,
    });
    
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'User already exists') {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 409 }
      );
    }
    
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}