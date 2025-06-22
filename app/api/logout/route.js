import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  cookies().set("session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0), // Expire the cookie
  });

  return NextResponse.json({ success: true });
}