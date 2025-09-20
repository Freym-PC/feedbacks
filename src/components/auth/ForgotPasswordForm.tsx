
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
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useState } from "react";
import { Loader2, Mail } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({ message: "Dirección de correo electrónico inválida." }),
});

export function ForgotPasswordForm() {
  const { sendPasswordResetEmail } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    setEmailSent(false);
    try {
      await sendPasswordResetEmail(values.email);
      toast({
        title: "Correo Enviado",
        description: "Revisa tu bandeja de entrada para ver las instrucciones para restablecer tu contraseña.",
      });
      setEmailSent(true);
    } catch (error: any) {
      console.error("Password reset failed:", error);
      let description = "Ocurrió un error. Por favor, inténtalo de nuevo.";
      if (error.code === 'auth/user-not-found') {
        description = "No se encontró ningún usuario con esta dirección de correo electrónico.";
      }
      toast({
        title: "Falló el Envío del Correo",
        description: description,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (emailSent) {
    return (
       <Card className="w-full max-w-md mx-auto shadow-lg text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Revisa tu Correo</CardTitle>
          <CardDescription>
            Hemos enviado un enlace para restablecer la contraseña a{" "}
            <strong>{form.getValues("email")}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Mail className="mx-auto h-12 w-12 text-primary mb-4" />
          <p className="text-sm text-muted-foreground">
            Si no lo encuentras, revisa tu carpeta de spam.
          </p>
           <Button asChild variant="link" className="mt-4">
              <Link href="/login">Volver a Iniciar Sesión</Link>
           </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Recuperar Contraseña</CardTitle>
        <CardDescription>
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input placeholder="tu@ejemplo.com" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar Correo de Recuperación
            </Button>
          </form>
        </Form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿Recordaste tu contraseña?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Inicia Sesión
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
