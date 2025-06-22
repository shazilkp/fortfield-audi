import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminAuth } from '@/firebase/admin';

/*
 * Protects a route by verifying session cookie.
 * Redirects to /login unless already there.
 * 
 * @param {string} pathname - The current URL path (e.g., "/dashboard")
 * @returns decodedToken or null
 */
export async function withSession(pathname) {
  const sessionCookie = cookies().get('session')?.value;

  const isLoginPage = pathname.startsWith('/login');

  if (!sessionCookie) {
    if (!isLoginPage) redirect('/login');
    return null;
  }

  try {
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    return decodedToken;
  } catch (err) {
    console.error('Session verification failed:', err);
    if (!isLoginPage) redirect('/login');
    return null;
  }
}
