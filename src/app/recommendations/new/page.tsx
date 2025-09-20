
"use client";

import { RecommendationForm } from "@/components/recommendations/RecommendationForm";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
// Recommendation type is not directly used here anymore for state, but good for reference
// import type { Recommendation } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
// addStoredRecommendation is now called from within RecommendationForm

export default function NewRecommendationPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login?redirect=/recommendations/new");
    }
  }, [user, isLoading, router]);

  // The handleRecommendationSubmit logic is now primarily within RecommendationForm.tsx
  // This page component mainly ensures the user is authenticated.
  // If there was a need for this page to do something *after* the form submission
  // (besides redirect, which form handles), that logic would go here.
  
  if (isLoading || !user) { // Show skeleton if auth is loading or user is not yet available
     return (
      <div className="space-y-6 max-w-xl mx-auto py-6">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-6 w-3/4" />
        <div className="space-y-4 mt-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full mt-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <RecommendationForm />
    </div>
  );
}
