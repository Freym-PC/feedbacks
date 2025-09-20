
import { FeedbackLogList } from "@/components/feedback/FeedbackLogList";

export default function FeedbackLogsPage() {
  return (
    <div className="py-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Registros de Feedback Resumidos
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Ver todas las entradas de feedback de usuarios resumidas por IA.
        </p>
      </div>
      <FeedbackLogList />
    </div>
  );
}
