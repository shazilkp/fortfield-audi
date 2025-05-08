import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET); // make sure it's the same secret used to sign

export async function GET(req) {
  try {
    const token = req.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Token not found" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, SECRET_KEY);
    const { userId,email,name } = payload;

    return NextResponse.json({ userId, email,name });
  } catch (err) {
    console.error("JWT verification failed:", err);
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }
}
