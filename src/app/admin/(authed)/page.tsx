import {redirect} from 'next/navigation';

export const dynamic = 'force-dynamic';

/** `/admin` → the contacts view (the gate runs in the group layout). */
export default function AdminIndexPage() {
  redirect('/admin/contacts');
}
