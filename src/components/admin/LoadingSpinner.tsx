
import { Loader2 } from "lucide-react";

export function LoadingSpinner() {
  return (
    <div className="container max-w-7xl mx-auto py-8 flex items-center justify-center h-[80vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
