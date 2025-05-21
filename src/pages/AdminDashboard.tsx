
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getFilteredLinks, deleteLink } from "@/services/linksService";
import { Link } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, LinkIcon, Trash, PenSquare, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { formatUrl, formatRelativeTime } from "@/utils/formatters";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminDashboard() {
  const { user, authState } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [links, setLinks] = useState<Link[]>([]);
  const [adCode, setAdCode] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSavingAd, setIsSavingAd] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }
      
      try {
        // Check if user has admin role in profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error("Error checking admin status:", error);
          navigate('/');
          return;
        }
        
        if (!data?.is_admin) {
          toast.error("You don't have permission to access this page");
          navigate('/');
          return;
        }
        
        setIsAdmin(true);
      } catch (error) {
        console.error("Error:", error);
        navigate('/');
      }
    };
    
    if (authState !== 'LOADING') {
      checkAdmin();
    }
  }, [user, authState, navigate]);

  // Load links
  useEffect(() => {
    const fetchLinks = async () => {
      try {
        setIsLoading(true);
        const data = await getFilteredLinks("", "", "newest");
        setLinks(data);
      } catch (error) {
        console.error("Error fetching links:", error);
      } finally {
        setIsLoading(false);
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

  const handleSaveAd = async () => {
    if (!isAdmin) return;
    
    try {
      setIsSavingAd(true);
      
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
      setIsSavingAd(false);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    if (!isAdmin || isDeleting) return;
    
    if (!confirm("Are you sure you want to delete this link?")) {
      return;
    }
    
    try {
      setIsDeleting(true);
      
      const success = await deleteLink(linkId);
      
      if (success) {
        // Update links list
        setLinks(links.filter(link => link.id !== linkId));
        toast.success("Link deleted successfully");
      } else {
        toast.error("Failed to delete link");
      }
    } catch (error) {
      console.error("Error deleting link:", error);
      toast.error("An error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredLinks = links.filter(link => 
    link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authState === 'LOADING') {
    return (
      <div className="container max-w-7xl mx-auto py-8 flex items-center justify-center h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
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
          <Card>
            <CardHeader>
              <CardTitle>Links Management</CardTitle>
              <CardDescription>
                Manage all links submitted by users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input 
                  placeholder="Search links..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredLinks.length > 0 ? (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLinks.map(link => (
                        <TableRow key={link.id}>
                          <TableCell className="font-medium">{link.title}</TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {formatUrl(link.url)}
                          </TableCell>
                          <TableCell>{link.username}</TableCell>
                          <TableCell>{formatRelativeTime(link.createdAt)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                asChild
                                title="View"
                              >
                                <a href={`/link/${link.id}`} target="_blank" rel="noopener noreferrer">
                                  <Eye className="h-4 w-4" />
                                </a>
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon"
                                asChild
                                title="Edit"
                              >
                                <a href={`/admin/edit-link/${link.id}`}>
                                  <PenSquare className="h-4 w-4" />
                                </a>
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="icon"
                                onClick={() => handleDeleteLink(link.id)}
                                disabled={isDeleting}
                                title="Delete"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No links found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Advertisement Tab */}
        <TabsContent value="ads">
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
                    disabled={isSavingAd}
                  >
                    {isSavingAd ? (
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
