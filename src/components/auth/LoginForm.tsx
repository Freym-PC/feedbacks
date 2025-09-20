
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
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useState } from "react";
import { Loader2, UserCheck } from "lucide-react"; 
import { Separator } from "@/components/ui/separator";


const formSchema = z.object({
  email: z.string().email({ message: "Dirección de correo electrónico inválida." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
});

export function LoginForm() {
  const { login, signInAnonymously, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const [isSubmittingAnonymously, setIsSubmittingAnonymously] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onEmailSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmittingEmail(true);
    try {
      await login({ email: values.email, password: values.password });
      toast({
        title: "Inicio de Sesión Exitoso",
        description: "¡Bienvenido/a de nuevo!",
      });
      const redirectUrl = searchParams.get("redirect") || "/";
      router.push(redirectUrl);
    } catch (error: any) {
      console.error("Login failed:", error);
      let description = "Ocurrió un error inesperado. Por favor, inténtalo de nuevo.";
      if (error.code) {
        switch (error.code) {
          case "auth/user-not-found":
          case "auth/wrong-password":
          case "auth/invalid-credential":
            description = "Correo electrónico o contraseña inválidos.";
            break;
          case "auth/invalid-email":
            description = "Formato de correo electrónico inválido.";
            break;
          default:
            description = error.message || description;
        }
      }
      toast({
        title: "Falló el Inicio de Sesión",
        description: description,
        variant: "destructive",
      });
    } finally {
      setIsSubmittingEmail(false);
    }
  }

  async function handleAnonymousLogin() {
    setIsSubmittingAnonymously(true);
    try {
      await signInAnonymously();
      toast({
        title: "Inicio como Invitado Exitoso",
        description: "Ahora estás navegando como invitado.",
      });
      const redirectUrl = searchParams.get("redirect") || "/";
      router.push(redirectUrl);
    } catch (error: any) {
      console.error("Anonymous login failed:", error);
      toast({
        title: "Falló el Inicio como Invitado",
        description: error.message || "No se pudo iniciar sesión como invitado. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingAnonymously(false);
    }
  }

  const isLoading = authIsLoading || isSubmittingEmail || isSubmittingAnonymously;

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Iniciar Sesión en FeedBacks</CardTitle>
        <CardDescription>Ingresa tus credenciales o continúa como invitado.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onEmailSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input placeholder="tu@ejemplo.com" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Contraseña</FormLabel>
                    <Link
                      href="/forgot-password"
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading || isSubmittingAnonymously}>
              {(authIsLoading && isSubmittingEmail) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Iniciar Sesión
            </Button>
          </form>
        </Form>

        <div className="my-6 flex items-center">
          <Separator className="flex-1" />
          <span className="mx-4 text-xs text-muted-foreground">O</span>
          <Separator className="flex-1" />
        </div>

        <Button 
          variant="outline" 
          className="w-full" 
          onClick={handleAnonymousLogin} 
          disabled={isLoading || isSubmittingEmail}
        >
          {isSubmittingAnonymously ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <UserCheck className="mr-2 h-4 w-4" /> 
          )}
          Continuar como Invitado
        </Button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿No tienes una cuenta?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Regístrate
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
