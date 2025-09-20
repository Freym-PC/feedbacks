
import { FeedbackSummarizerClient } from "@/components/feedback/FeedbackSummarizerClient";

export default function FeedbackPage() {
  return (
    <div className="py-6">
       <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Resumidor de Feedback
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Utiliza IA para obtener resúmenes rápidos de feedback extenso de usuarios.
        </p>
      </div>
      <FeedbackSummarizerClient />
    </div>
  );
}
