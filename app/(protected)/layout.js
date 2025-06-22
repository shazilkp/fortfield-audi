import { withSession } from '@/lib/withSession';

export default async function ProtectedLayout({ children }) {
  const decoded = await withSession('/dashboard'); // Or use dynamic detection if needed

  return (
    <div>
      {children}
    </div>
  );
}
