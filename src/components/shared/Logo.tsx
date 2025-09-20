
import Link from 'next/link';
import { Briefcase } from 'lucide-react';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity" aria-label="FeedBacks Home">
      <Briefcase className="h-7 w-7" />
      <span className="text-2xl font-bold tracking-tight">FeedBacks</span>
    </Link>
  );
}
