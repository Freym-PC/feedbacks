
"use client";

import { useEffect, useState } from 'react';
import type { SummarizedFeedbackLog } from '@/types';
import { getSummarizedFeedbackLogs } from '@/lib/services/feedbackDataService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, MessageSquareText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale'; // Import Spanish locale

export function FeedbackLogList() {
  const [logs, setLogs] = useState<SummarizedFeedbackLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLogs() {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedLogs = await getSummarizedFeedbackLogs();
        setLogs(fetchedLogs);
      } catch (err) {
        console.error("Error fetching feedback logs:", err);
        setError("No se pudieron cargar los registros de feedback. Por favor, inténtalo de nuevo más tarde.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchLogs();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="shadow-sm">
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-1" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Skeleton className="h-4 w-1/4 mb-1" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-1/4 mb-1" />
                <Skeleton className="h-16 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="shadow-lg border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <AlertCircle className="mr-2" /> Error al Cargar Registros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (logs.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
             <MessageSquareText className="mr-2 text-primary" /> No se Encontraron Registros de Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Aún no hay registros de feedback resumidos en la base de datos.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-12rem)]">
      <div className="space-y-4 pr-4">
        {logs.map((log) => (
          <Card key={log.id} className="shadow-md hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="text-xl">Registro de Feedback #{log.id.substring(0, 6)}...</CardTitle>
              <CardDescription>
                Procesado: {formatDistanceToNow(new Date(log.createdAt as string), { addSuffix: true, locale: es })}
                {log.userId && ` | ID de Usuario: ${log.userId}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-md mb-1">Feedback Original:</h4>
                <p className="text-sm text-foreground bg-muted p-3 rounded-md whitespace-pre-wrap">
                  {log.originalFeedbackText}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-md mb-1">Resumen IA:</h4>
                <p className="text-sm text-primary-foreground bg-primary/90 p-3 rounded-md whitespace-pre-wrap">
                  {log.summaryText}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
