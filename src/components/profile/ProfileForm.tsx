
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { PROFESSIONAL_SECTORS } from "@/lib/constants";
import type { ProfessionalSector, User } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  email: z.string().email({ message: "Dirección de correo electrónico inválida." }),
  professionalSector: z.enum(PROFESSIONAL_SECTORS as [string, ...string[]], {
    errorMap: () => ({ message: "Por favor, selecciona un sector profesional." }),
  }).optional(),
});

export function ProfileForm() {
  const { user, updateUser, sendPasswordResetEmail } = useAuth();
  const { toast } = useToast();
  const [isSendingReset, setIsSendingReset] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      professionalSector: user?.professionalSector ?? undefined, 
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        professionalSector: user.professionalSector ?? undefined,
      });
    }
  }, [user, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || user.isAnonymous) return;
    updateUser({
      name: values.name,
      email: values.email, 
      professionalSector: values.professionalSector as ProfessionalSector | undefined,
    });
    toast({
      title: "Perfil Actualizado",
      description: "Tus detalles profesionales han sido guardados.",
    });
  }
  
  async function handlePasswordReset() {
    if (!user || !user.email || user.isAnonymous) return;
    setIsSendingReset(true);
    try {
      await sendPasswordResetEmail(user.email);
      toast({
        title: "Correo Enviado",
        description: "Revisa tu bandeja de entrada para cambiar tu contraseña.",
      });
    } catch (error: any) {
      console.error("Error sending password reset email:", error);
      toast({
        title: "Error al Enviar Correo",
        description: "No se pudo enviar el correo para restablecer la contraseña. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSendingReset(false);
    }
  }

  if (!user) {
    return <p>Cargando perfil...</p>; 
  }

  return (
    <Card className="w-full max-w-lg mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Tu Perfil</CardTitle>
        <CardDescription>Administra tus detalles profesionales y preferencias.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Juan Pérez" {...field} disabled={user.isAnonymous}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input placeholder="tu@ejemplo.com" {...field} readOnly disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="professionalSector"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sector Profesional</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={user.isAnonymous}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tu sector" />
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
            <Button type="submit" className="w-full" disabled={user.isAnonymous}>Actualizar Perfil</Button>
          </form>
        </Form>

        <Separator className="my-6" />

        <div className="space-y-2">
            <Label>Seguridad de la Cuenta</Label>
            <p className="text-sm text-muted-foreground">
                Para cambiar tu contraseña, te enviaremos un enlace seguro a tu correo electrónico.
            </p>
            <Button
                variant="outline"
                className="w-full"
                onClick={handlePasswordReset}
                disabled={isSendingReset || user.isAnonymous}
            >
                {isSendingReset && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar Correo para Cambiar Contraseña
            </Button>
            {user.isAnonymous && (
            <p className="text-xs text-muted-foreground text-center pt-2">
                La gestión de la cuenta está deshabilitada para usuarios invitados.
            </p>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
