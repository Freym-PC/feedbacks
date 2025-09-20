
"use client";

import { useState } from 'react';
import { summarizeFeedback, type SummarizeFeedbackInput } from '@/ai/flows/summarize-feedback';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Wand2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from '@/contexts/AuthContext';
import { addSummarizedFeedbackLog } from '@/lib/services/feedbackDataService';
import { useToast } from "@/hooks/use-toast";

export function FeedbackSummarizerClient() {
  const [feedbackText, setFeedbackText] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!feedbackText.trim()) {
      setError("Por favor, ingresa algún texto de feedback para resumir.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSummary('');

    try {
      const input: SummarizeFeedbackInput = { feedbackText };
      const result = await summarizeFeedback(input);
      setSummary(result.summary);

      try {
        const logData = {
          originalFeedbackText: feedbackText,
          summaryText: result.summary,
          userId: user?.id || null, 
        };
        const logId = await addSummarizedFeedbackLog(logData);
        if (logId) {
          toast({
            title: "Feedback Registrado",
            description: "El feedback y su resumen han sido guardados en la base de datos.",
          });
        } else {
          toast({
            title: "Error de Registro",
            description: "Resumen generado, pero falló al guardar el registro. Por favor, inténtalo de nuevo.",
            variant: "destructive",
          });
        }
      } catch (logError) {
        console.error("Error saving summarized feedback log:", logError);
        toast({
            title: "Error de Registro",
            description: "Resumen generado, pero falló al guardar el registro. Por favor, inténtalo de nuevo.",
            variant: "destructive",
        });
      }

    } catch (summarizeErr) {
      console.error("Error summarizing feedback:", summarizeErr);
      setError("Falló al resumir el feedback. Por favor, inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Wand2 className="text-primary" /> Resumidor de Feedback con IA
        </CardTitle>
        <CardDescription>
          Pega el feedback del usuario abajo y deja que la IA proporcione un resumen conciso. El feedback y el resumen serán registrados.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Ingresa el feedback del usuario aquí..."
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          rows={8}
          className="resize-none"
          aria-label="Entrada de texto de feedback"
        />
        <Button onClick={handleSubmit} disabled={isLoading || !feedbackText.trim()} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Resumiendo y Registrando...
            </>
          ) : (
            "Resumir y Registrar Feedback"
          )}
        </Button>
      </CardContent>
      {(summary || error) && (
        <CardFooter className="flex flex-col items-start space-y-4">
          {error && (
            <Alert variant="destructive" className="w-full">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {summary && (
            <div className="w-full space-y-2">
              <h3 className="text-lg font-semibold">Resumen:</h3>
              <Card className="bg-secondary p-4">
                <p className="text-secondary-foreground whitespace-pre-wrap">{summary}</p>
              </Card>
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
