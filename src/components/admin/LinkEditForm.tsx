
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateLink } from "@/services/linksService";
import { Link } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface LinkEditFormProps {
  link: Link;
  isLoading: boolean;
}

export function LinkEditForm({ link, isLoading }: LinkEditFormProps) {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: link.title,
    url: link.url,
    tags: link.tags.join(', ')
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSaving) return;
    
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

  return (
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
              
              <div className="text-sm text-muted-foreground mt-4 pt-4 border-t">
                <p>Submitted by: {link.username}</p>
                <p>Votes: {link.votes}</p>
                <p>Comments: {link.comments.length}</p>
              </div>
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
  );
}
