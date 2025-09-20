
"use client";

import { useState, useEffect, useRef } from 'react';
import type { User, ChatMessage as ChatMessageType } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { addChatMessage, getChatMessagesStream } from '@/lib/services/chatDataService';
import { ChatMessage } from './ChatMessage';
import { Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChatInterfaceProps {
  currentUser: User;
}

export function ChatInterface({ currentUser }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = getChatMessagesStream((newMessages) => {
      setMessages(newMessages);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);

    const messageData = {
      userId: currentUser.id,
      userName: currentUser.name,
      text: newMessage,
    };

    try {
      await addChatMessage(messageData);
      setNewMessage('');
    } catch (error: any) {
      console.error("Error sending message:", error);
      let description = "No se pudo enviar tu mensaje. Por favor, inténtalo de nuevo.";
      
      const errorCode = error?.code || '';
      const errorMessage = error?.message || '';

      if (errorCode.includes('permission-denied') || errorMessage.includes('permission-denied') || errorMessage.includes('insufficient permissions')) {
        if (currentUser.isAnonymous) {
          description = "El chat es solo para usuarios registrados. Por favor, crea una cuenta para participar.";
        } else {
          description = "Error de permisos. Asegúrate de que las reglas de Firestore se han desplegado correctamente con el comando `firebase deploy --only firestore:rules`.";
        }
      } else if (errorMessage.includes('appCheck/fetch-status-error') || errorMessage.includes('403')) {
          description = "Error de App Check: La solicitud fue bloqueada. Revisa que tu token de depuración esté bien configurado para este entorno de desarrollo.";
      } else if (errorMessage) {
          description = `Detalle: ${errorMessage}`;
      }
      
      toast({
        title: "Error al Enviar",
        description: description,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg flex flex-col h-[calc(100vh-20rem)]">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              isCurrentUser={msg.userId === currentUser.id}
            />
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t bg-background">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe tu mensaje..."
            disabled={isSending || currentUser.isAnonymous}
            autoComplete="off"
          />
          <Button type="submit" disabled={!newMessage.trim() || isSending || !!currentUser.isAnonymous} size="icon">
            {isSending ? <Loader2 className="animate-spin" /> : <Send />}
            <span className="sr-only">Enviar mensaje</span>
          </Button>
        </form>
         {currentUser.isAnonymous && (
          <p className="text-xs text-center text-muted-foreground mt-2">
            El chat está deshabilitado para usuarios invitados.
          </p>
        )}
      </div>
    </Card>
  );
}

// Need to define Card here as it is not a default export
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"
