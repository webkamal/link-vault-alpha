
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AccessDenied() {
  return (
    <div className="container max-w-7xl mx-auto py-8 flex items-center justify-center h-[80vh]">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access the admin dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <a href="/">Return to Homepage</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
