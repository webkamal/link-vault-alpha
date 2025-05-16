
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { addLink } from "@/services/linksService";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const LinkSubmitForm = () => {
  const navigate = useNavigate();
  const { user, authState } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    tags: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
    
    if (!user) {
      toast.error("You must be logged in to submit a link");
      return;
    }
    
    setIsSubmitting(true);
    
    // Process tags
    const tags = formData.tags
      .split(",")
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0);
    
    // Add link
    const newLink = await addLink({
      title: formData.title.trim(),
      url: formData.url.trim(),
      tags: tags.length > 0 ? tags : ["uncategorized"]
    });
    
    setIsSubmitting(false);
    
    if (newLink) {
      toast.success("Link submitted successfully!");
      navigate(`/link/${newLink.id}`);
    } else {
      toast.error("Failed to submit link");
    }
  };
  
  const isFormValid = formData.title.trim() && formData.url.trim();
  
  if (authState === 'LOADING') {
    return (
      <Card className="p-6 max-w-xl mx-auto animate-pulse">
        <div className="space-y-6">
          <div className="h-8 bg-muted rounded-md w-1/2 mx-auto"></div>
          <div className="space-y-2">
            <div className="h-5 bg-muted rounded-md w-20"></div>
            <div className="h-10 bg-muted rounded-md"></div>
          </div>
          <div className="space-y-2">
            <div className="h-5 bg-muted rounded-md w-16"></div>
            <div className="h-10 bg-muted rounded-md"></div>
          </div>
          <div className="space-y-2">
            <div className="h-5 bg-muted rounded-md w-24"></div>
            <div className="h-10 bg-muted rounded-md"></div>
          </div>
          <div className="h-10 bg-muted rounded-md"></div>
        </div>
      </Card>
    );
  }
  
  if (authState === 'SIGNED_OUT') {
    return (
      <Card className="p-6 max-w-xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-6">Submit a New Link</h2>
        <p className="text-muted-foreground mb-6">You need to be logged in to submit links</p>
        <Button asChild className="mx-auto">
          <RouterLink to="/auth">Login / Sign Up</RouterLink>
        </Button>
      </Card>
    );
  }
  
  return (
    <Card className="p-6 max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-2xl font-bold text-center mb-6">Submit a New Link</h2>
        
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Link title"
            disabled={isSubmitting}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="url">URL</Label>
          <Input
            id="url"
            name="url"
            value={formData.url}
            onChange={handleChange}
            placeholder="https://example.com"
            disabled={isSubmitting}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <Input
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="tech, news, tutorial"
            disabled={isSubmitting}
          />
          <p className="text-xs text-muted-foreground">
            Separate tags with commas. Example: tech, news, learning
          </p>
        </div>
        
        <div className="pt-2">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || !isFormValid}
          >
            {isSubmitting ? "Submitting..." : "Submit Link"}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default LinkSubmitForm;
