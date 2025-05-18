
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getAllTags } from "@/services/linksService";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { Home, Tag, Bookmark, TrendingUp } from "lucide-react";

export function TopicSidebar() {
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const allTags = await getAllTags();
        setTags(allTags);
      } catch (error) {
        console.error("Error fetching tags:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTags();
  }, []);

  const isActive = (path: string) => location.pathname === path || location.search === `?tag=${path.replace('/tag/', '')}`;
  const getNavClass = (active: boolean) => active ? "bg-muted font-medium text-primary" : "hover:bg-muted/50";

  return (
    <div className="hidden md:block">
      <Sidebar collapsible="icon" className="w-60 transition-all duration-300 group-data-[collapsible=icon]:w-14">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/" className={`flex items-center gap-2 ${getNavClass(location.pathname === '/' && !location.search)}`}>
                      <Home className="h-4 w-4" />
                      <span>Home</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/newest" className={`flex items-center gap-2 ${getNavClass(location.pathname === '/newest')}`}>
                      <TrendingUp className="h-4 w-4" />
                      <span>Newest</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/tags" className={`flex items-center gap-2 ${getNavClass(location.pathname === '/tags')}`}>
                      <Tag className="h-4 w-4" />
                      <span>Browse Tags</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          
          <SidebarGroup>
            <SidebarGroupLabel>Topics</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {isLoading ? (
                  // Show loading skeletons
                  Array(5).fill(0).map((_, i) => (
                    <SidebarMenuItem key={i}>
                      <div className="h-8 flex items-center px-2">
                        <Bookmark className="h-4 w-4 mr-2 text-muted-foreground" />
                        <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                      </div>
                    </SidebarMenuItem>
                  ))
                ) : tags.length > 0 ? (
                  tags.slice(0, 10).map((tag) => (
                    <SidebarMenuItem key={tag}>
                      <SidebarMenuButton asChild>
                        <Link to={`/tag/${tag}`} className={`flex items-center gap-2 ${getNavClass(isActive(`/tag/${tag}`))}`}>
                          <Bookmark className="h-4 w-4" />
                          <span>{tag}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                ) : (
                  <SidebarMenuItem>
                    <div className="px-2 py-1 text-sm text-muted-foreground">No tags found</div>
                  </SidebarMenuItem>
                )}
                
                {tags.length > 10 && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/tags" className="flex items-center gap-2 text-primary">
                        <span>View all tags</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </div>
  );
}
