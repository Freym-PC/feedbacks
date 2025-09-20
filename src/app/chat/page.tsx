
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatInterface } from "@/components/chat/ChatInterface";

export default function ChatPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login?redirect=/chat");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex flex-col h-[calc(100vh-12rem)]">
        <div className="flex-1 space-y-4 p-4">
          <Skeleton className="h-16 w-3/4" />
          <Skeleton className="h-16 w-3/4 self-end" />
          <Skeleton className="h-16 w-1/2" />
        </div>
        <div className="p-4 border-t">
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Chat de la Comunidad
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Conecta y conversa con otros profesionales en tiempo real.
        </p>
      </div>
      <ChatInterface currentUser={user} />
    </div>
  );
}
