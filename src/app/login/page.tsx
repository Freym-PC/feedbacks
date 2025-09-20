import { LoginForm } from "@/components/auth/LoginForm";
import { Suspense } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function LoginSkeleton() {
  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader>
        <Skeleton className="h-7 w-3/5" />
        <Skeleton className="h-4 w-4/5 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="my-6 flex items-center">
          <Skeleton className="h-px flex-1" />
          <span className="mx-4 text-xs text-muted-foreground">O</span>
          <Skeleton className="h-px flex-1" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-3/5 mx-auto mt-6" />
      </CardContent>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center py-12">
      <Suspense fallback={<LoginSkeleton />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
