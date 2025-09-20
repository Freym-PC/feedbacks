
'use client' 

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Caught by error boundary:", error);
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)] py-12">
      <Card className="w-full max-w-lg text-center shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-destructive">¡Ups! Algo Salió Mal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg text-muted-foreground">
            Encontramos un problema inesperado en el servidor. Por favor, inténtalo de nuevo en unos momentos.
          </p>
          {process.env.NODE_ENV === 'development' && error?.message && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive text-left">
              <p className="font-semibold">Detalles del Error (Modo Desarrollo):</p>
              <pre className="mt-1 whitespace-pre-wrap break-all text-xs">
                {error.message}
                {error.digest && `\nDigest: ${error.digest}`}
                {error.stack && `\nStack: ${error.stack}`}
              </pre>
            </div>
          )}
          <Button
            onClick={
              () => reset()
            }
            variant="default"
            size="lg"
            className="mt-4"
          >
            Intentar de nuevo
          </Button>
          <p className="mt-4 text-xs text-muted-foreground">
            Si el problema persiste, por favor contacta a soporte.
            {error?.digest && ` (Resumen del Error: ${error.digest})`}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
