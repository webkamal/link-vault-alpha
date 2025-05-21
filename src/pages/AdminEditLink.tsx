
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getLinkById, updateLink } from "@/services/linksService";
import { Link } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function AdminEditLink() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, authState } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [link, setLink] = useState<Link | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    tags: ''
  });

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
          .select('is_admin')
          .eq('id', user.id)
          .single();
        
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

  // Load link data
  useEffect(() => {
    const fetchLink = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const linkData = await getLinkById(id);
        
        if (!linkData) {
          toast.error("Link not found");
          navigate('/admin');
          return;
        }
        
        setLink(linkData);
        setFormData({
          title: linkData.title,
          url: linkData.url,
          tags: linkData.tags.join(', ')
        });
      } catch (error) {
        console.error("Error fetching link:", error);
        toast.error("Error loading link");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAdmin) {
      fetchLink();
    }
  }, [id, isAdmin, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!link || !isAdmin || isSaving) return;
    
    // Basic validation
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    
    if (!formData.url.trim()) {
      toast.error("URL is required");
      return;
    }
    
    // Simple URL validation
    try {
      new URL(formData.url);
    } catch (error) {
      toast.error("Please enter a valid URL");
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Process tags
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0);
      
      const updatedLink = await updateLink(link.id, {
        title: formData.title.trim(),
        url: formData.url.trim(),
        tags: tags.length > 0 ? tags : ["uncategorized"]
      });
      
      if (updatedLink) {
        toast.success("Link updated successfully!");
        navigate('/admin');
      } else {
        toast.error("Failed to update link");
      }
    } catch (error) {
      console.error("Error updating link:", error);
      toast.error("An error occurred while updating the link");
    } finally {
      setIsSaving(false);
    }
  };

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
      <Button
        variant="outline"
        onClick={() => navigate('/admin')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Link</CardTitle>
          <CardDescription>Make changes to the link details</CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Link title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    name="url"
                    value={formData.url}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="tech, news, tutorial"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate tags with commas. Example: tech, news, learning
                  </p>
                </div>
                
                {link && (
                  <div className="text-sm text-muted-foreground mt-4 pt-4 border-t">
                    <p>Submitted by: {link.username}</p>
                    <p>Votes: {link.votes}</p>
                    <p>Comments: {link.comments.length}</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
