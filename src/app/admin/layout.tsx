import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { requireOrganiser } from '@/server/require-organiser';
import { AdminShell } from '@/components/admin/AdminShell';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value ?? null;

  try {
    await requireOrganiser(token);
  } catch {
    notFound();
  }

  return <AdminShell>{children}</AdminShell>;
}
