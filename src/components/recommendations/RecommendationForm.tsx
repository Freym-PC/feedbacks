
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { PROFESSIONAL_SECTORS } from "@/lib/constants";
import type { ProfessionalSector, Recommendation } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { addStoredRecommendation } from "@/lib/services/recommendationDataService"; 
import { useState } from "react";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  text: z.string().min(10, { message: "La recomendación debe tener al menos 10 caracteres." }).max(1000, { message: "La recomendación debe tener como máximo 1000 caracteres." }),
  sector: z.enum(PROFESSIONAL_SECTORS as [string, ...string[]], {
    errorMap: () => ({ message: "Por favor, selecciona un sector profesional para la recomendación." }),
  }),
});

interface RecommendationFormProps {
  onRecommendationSubmit?: (recommendation: Omit<Recommendation, 'id' | 'createdAt'>) => void;
}

export function RecommendationForm({ onRecommendationSubmit }: RecommendationFormProps) {
  const { user, isLoading: authIsLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
      sector: user?.professionalSector || undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({
        title: "Error de Autenticación",
        description: "Debes iniciar sesión para enviar una recomendación.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);

    const newRecommendationData: Omit<Recommendation, 'id' | 'createdAt'> = {
      userId: user.id,
      userName: user.name,
      userSector: user.professionalSector || null, 
      text: values.text,
      sector: values.sector as ProfessionalSector,
    };
    
    try {
      const newRecId = await addStoredRecommendation(newRecommendationData); 
      if (newRecId) {
        onRecommendationSubmit?.(newRecommendationData); 
        toast({
          title: "Recomendación Enviada",
          description: "¡Gracias por compartir tu recomendación!",
        });
        form.reset();
        router.push("/"); 
      } else {
        throw new Error("No se pudo guardar la recomendación. El servicio devolvió nulo.");
      }
    } catch (error) {
       console.error("Failed to submit recommendation in form:", error);
       let description = "No se pudo guardar tu recomendación. Por favor, inténtalo de nuevo más tarde.";
       if (error instanceof Error && error.message.includes("El servicio devolvió nulo")) {
           description = "No se pudo guardar la recomendación. Revisa la consola del navegador para más detalles del error del servicio de base de datos.";
       } else if (error instanceof Error && error.message) { 
           description = error.message;
       }
       toast({
        title: "Error al Enviar",
        description: description,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const isLoading = authIsLoading || isSubmitting;

  return (
    <Card className="w-full max-w-xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Compartir una Recomendación</CardTitle>
        <CardDescription>Ayuda a otros compartiendo tus experiencias positivas con servicios o profesionales.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tu Recomendación</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Cuéntanos sobre el servicio o profesional que recomiendas..."
                      className="min-h-[120px]"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sector"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sector Profesional Relevante</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un sector" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PROFESSIONAL_SECTORS.map((sector) => (
                        <SelectItem key={sector} value={sector}>
                          {sector}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar Recomendación
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
