
"use client";

import type { ChatMessage as ChatMessageType } from '@/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { ShieldAlert } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


interface ChatMessageProps {
  message: ChatMessageType;
  isCurrentUser: boolean;
}

export function ChatMessage({ message, isCurrentUser }: ChatMessageProps) {
  const timeAgo = formatDistanceToNow(new Date(message.createdAt), {
    addSuffix: true,
    locale: es,
  });

  return (
    <div
      className={cn(
        'flex items-end gap-2',
        isCurrentUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-3 py-2',
          isCurrentUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        )}
      >
        {!isCurrentUser && (
            <p className="text-xs font-bold mb-1">{message.userName}</p>
        )}
        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        <div className={cn("flex items-center gap-2 mt-1", isCurrentUser ? "justify-end" : "justify-start")}>
            <p className="text-xs opacity-70">{timeAgo}</p>
            {message.isModerated && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <ShieldAlert className="h-3 w-3 text-destructive" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Este mensaje fue modificado por incluir contenido inapropiado.</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
        </div>
      </div>
    </div>
  );
}
