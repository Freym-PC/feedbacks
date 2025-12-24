
"use client";

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/shared/Logo';
import { UserCircle, LogIn, LogOut, PlusCircle, MessageSquareText, LayoutGrid, MessageCircle, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/'); 
  };

  if (isLoading) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <div className="h-8 w-20 animate-pulse rounded-md bg-muted"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-4">
           <Button variant="ghost" size="sm" asChild>
            <Link href="https://freympc.es" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
              <Globe size={16} /> Freym PC
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/" className="flex items-center gap-1">
              <LayoutGrid size={16} /> Inicio
            </Link>
          </Button>
          {user && (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/recommendations/new" className="flex items-center gap-1">
                  <PlusCircle size={16} /> Nueva Rec.
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/chat" className="flex items-center gap-1">
                  <MessageCircle size={16} /> Chat
                </Link>
              </Button>
            </>
          )}
           <Button variant="ghost" size="sm" asChild>
            <Link href="/feedback" className="flex items-center gap-1">
              <MessageSquareText size={16} /> IA de Feedback
            </Link>
          </Button>
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/profile" className="flex items-center gap-1">
                  <UserCircle size={16} /> Perfil
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-1">
                <LogOut size={16} /> Cerrar Sesión
              </Button>
            </>
          ) : (
            <Button variant="default" size="sm" asChild>
              <Link href="/login" className="flex items-center gap-1">
                <LogIn size={16} /> Iniciar Sesión
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
