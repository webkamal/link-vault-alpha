
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link as RouterLink } from "react-router-dom";
import { getFilteredLinks } from "@/services/linksService";
import { Link } from "@/types";
import { Megaphone, LinkIcon } from "lucide-react";
import { formatRelativeTime, formatUrl } from "@/utils/formatters";
import { supabase } from "@/integrations/supabase/client";

export function Sidebar() {
  const [recentLinks, setRecentLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [adContent, setAdContent] = useState<string>("");

  useEffect(() => {
    const fetchRecentLinks = async () => {
      try {
        setIsLoading(true);
        const links = await getFilteredLinks("", "", "newest");
        setRecentLinks(links.slice(0, 3)); // Get only the first 3 links
      } catch (error) {
        console.error("Error fetching recent links:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentLinks();
  }, []);

  // Fetch advertisement content from admin_settings
  useEffect(() => {
    const fetchAdContent = async () => {
      try {
        // Use the correct typing for Supabase query
        const { data, error } = await supabase
          .from('admin_settings')
          .select('*')
          .eq('key', 'advertisement_content')
          .maybeSingle();
          
        if (error) {
          console.error("Error fetching ad content:", error);
          return;
        }
        
        if (data?.value) {
          setAdContent(data.value);
        }
      } catch (error) {
        console.error("Error fetching ad content:", error);
      }
    };
    
    fetchAdContent();
  }, []);

  return (
    <div className="w-full lg:w-80 space-y-4">
      {/* Recently Added Links Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">Recently Added</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-48 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))
          ) : recentLinks.length > 0 ? (
            recentLinks.map(link => (
              <RouterLink 
                key={link.id} 
                to={`/link/${link.id}`} 
                className="flex items-start space-x-3 hover:bg-muted/50 p-2 rounded-md transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <LinkIcon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-sm line-clamp-1">{link.title}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1">
                    {formatUrl(link.url)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <span>by {link.username}</span>
                    <span>•</span>
                    <span>{formatRelativeTime(link.createdAt)}</span>
                  </div>
                </div>
              </RouterLink>
            ))
          ) : (
            <div className="text-sm text-center text-muted-foreground py-2">
              No links yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advertisement Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            <span>Sponsored</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {adContent ? (
            <div dangerouslySetInnerHTML={{ __html: adContent }} />
          ) : (
            <div className="bg-muted aspect-video rounded-md flex items-center justify-center text-muted-foreground">
              <div className="text-center p-4">
                <p className="font-medium">Advertisement Space</p>
                <p className="text-sm">Place your ad here</p>
              </div>
            </div>
          )}
          <div className="mt-2 text-xs text-muted-foreground text-center">
            Interested in advertising? Contact us!
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
