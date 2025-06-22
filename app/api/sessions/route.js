// /app/api/session/route.js
import { cookies } from 'next/headers';
import { adminAuth } from '@/firebase/admin';
import { NextResponse } from 'next/server';


export async function POST(request) {
  try {
    const { idToken } = await request.json();
    const expiresIn = 60 * 60 * 24 * 5 * 1000;

    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    cookies().set('session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: expiresIn / 1000,
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to create session cookie:", error);
    return NextResponse.json({ error: "Failed to set session" }, { status: 401 });
  }
}
