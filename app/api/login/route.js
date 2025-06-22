import { SignJWT } from "jose";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/firebase/admin"; // Adjust path as needed
import * as admin from "firebase-admin";
import bcrypt from "bcryptjs";


async function validateUser(email, password) {
  // Query Firestore for the user by email
  const usersRef = db.collection("users");
  const snapshot = await usersRef.where("email", "==", email).limit(1).get();

  if (snapshot.empty) {
    return null; // No user found
  }

  
  const userDoc = snapshot.docs[0];
  const userData = userDoc.data();

  // Compare the provided password with the hashed password in Firestore
  const passwordMatch = await bcrypt.compare(password, userData.hashedPass);

  if (!passwordMatch) {
    return null;
  }

  // Return user info (customize as needed)
  return { id: userDoc.id, email: userData.email, name:userData.name };
}

export async function POST(request) {
  const { email, password } = await request.json();

  const user = await validateUser(email, password);
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Create JWT
  // const jwt = await new SignJWT({ userId: user.id, email: user.email, name: user.name })
  //   .setProtectedHeader({ alg: "HS256" })
  //   .setIssuedAt()
  //   .setExpirationTime("2h")
  //   .sign(new TextEncoder().encode(process.env.JWT_SECRET));


  const customToken = await admin.auth().createCustomToken(user.id, {
    email: user.email,
    name: user.name,
  });

  
  // Set cookie
  // cookies().set({
  //   name: "auth-token",
  //   value: jwt,
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === "production",
  //   sameSite: "lax",
  //   maxAge: 60 * 60 * 2, // 2 hours
  //   path: "/",
  // });
  
  // console.log(customToken);
  return NextResponse.json({ token: customToken });
}
