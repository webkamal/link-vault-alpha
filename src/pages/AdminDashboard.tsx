
import { useState, useEffect } from "react";
import { getFilteredLinks } from "@/services/linksService";
import { Link } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { LoadingSpinner } from "@/components/admin/LoadingSpinner";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { LinksManagement } from "@/components/admin/LinksManagement";
import { AdvertisementManagement } from "@/components/admin/AdvertisementManagement";

export default function AdminDashboard() {
  const { isAdmin, isLoading: isCheckingAdmin, authState } = useAdminCheck();
  const [isLoadingLinks, setIsLoadingLinks] = useState(true);
  const [links, setLinks] = useState<Link[]>([]);
  const [adCode, setAdCode] = useState<string>("");

  // Load links
  useEffect(() => {
    const fetchLinks = async () => {
      try {
        setIsLoadingLinks(true);
        const data = await getFilteredLinks("", "", "newest");
        setLinks(data);
      } catch (error) {
        console.error("Error fetching links:", error);
      } finally {
        setIsLoadingLinks(false);
      }
    };
    
    if (isAdmin) {
      fetchLinks();
    }
  }, [isAdmin]);

  // Load advertisement content
  useEffect(() => {
    const fetchAdContent = async () => {
      try {
        const { data, error } = await supabase
          .from('admin_settings')
          .select('*')
          .eq('key', 'advertisement_content')
          .maybeSingle();
        
        if (error) {
          console.error("Error fetching ad content:", error);
          return;
        }
        
        if (data) {
          setAdCode(data.value || "");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };
    
    if (isAdmin) {
      fetchAdContent();
    }
  }, [isAdmin]);

  if (authState === 'LOADING') {
    return <LoadingSpinner />;
  }

  if (!isAdmin) {
    return <AccessDenied />;
  }

  return (
    <div className="container max-w-7xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <Tabs defaultValue="links" className="space-y-4">
        <TabsList>
          <TabsTrigger value="links">Manage Links</TabsTrigger>
          <TabsTrigger value="ads">Manage Advertisements</TabsTrigger>
        </TabsList>
        
        {/* Links Management Tab */}
        <TabsContent value="links" className="space-y-4">
          <LinksManagement links={links} isLoading={isLoadingLinks} />
        </TabsContent>
        
        {/* Advertisement Tab */}
        <TabsContent value="ads">
          <AdvertisementManagement initialAdCode={adCode} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
