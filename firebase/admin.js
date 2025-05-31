// firebase/admin.ts


import admin from "firebase-admin";

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
    console.log("Firebase Admin initialized");
  } catch (error) {
    console.error("Firebase Admin init error:", error);
  }
}

export const auth = admin.auth();
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    console.log("From admin User UID:", user.uid);
    // Safe to make Firestore requests here!
  } else {
    // No user is signed in
    console.log("From admin No user is signed in.");
  }
});
export const db = admin.firestore();
