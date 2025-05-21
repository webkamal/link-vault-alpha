
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface AdvertisementManagementProps {
  initialAdCode: string;
}

export function AdvertisementManagement({ initialAdCode }: AdvertisementManagementProps) {
  const [adCode, setAdCode] = useState<string>(initialAdCode);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveAd = async () => {
    try {
      setIsSaving(true);
      
      const { data, error } = await supabase
        .from('admin_settings')
        .upsert({ 
          key: 'advertisement_content',
          value: adCode
        }, { 
          onConflict: 'key' 
        });
      
      if (error) {
        toast.error("Failed to save advertisement content");
        console.error("Error saving ad content:", error);
        return;
      }
      
      toast.success("Advertisement content saved successfully");
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Advertisement Management</CardTitle>
        <CardDescription>
          Edit the advertisement HTML that will be displayed in the sidebar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Enter your advertisement code below. This can be HTML, JavaScript or embed codes.
            </p>
            <Textarea
              value={adCode}
              onChange={(e) => setAdCode(e.target.value)}
              placeholder="<div>Your advertisement HTML code here</div>"
              className="font-mono h-[200px]"
            />
          </div>
          
          <div>
            <Button 
              onClick={handleSaveAd} 
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Advertisement'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
