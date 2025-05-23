
import { Loader2 } from "lucide-react";

export function LoadingSpinner() {
  return (
    <div className="container max-w-7xl mx-auto py-8 flex items-center justify-center h-[80vh]">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
