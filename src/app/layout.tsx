
import type {Metadata} from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'FeedBacks - Recomendaciones Profesionales',
  description: 'Comparte y descubre recomendaciones de servicios en tu sector profesional.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  console.log("Attempting to render RootLayout on the server..."); // Diagnostic log
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", GeistSans.variable, GeistMono.variable)}>
        <AuthProvider>
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 container py-8">{children}</main>
            <footer className="py-6 md:px-8 md:py-0 border-t">
              <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
                <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
                  Desarrollado por FeedBacks integrado en el entorno Freym PC.
                </p>
                <Link href="/legal" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Términos Legales
                </Link>
              </div>
            </footer>
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
