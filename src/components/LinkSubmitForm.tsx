
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { addLink } from "@/services/linksService";
import { CURRENT_USER } from "@/types";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const LinkSubmitForm = () => {
  const navigate = useNavigate();
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
  
  const handleSubmit = (e: React.FormEvent) => {
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
    
    setIsSubmitting(true);
    
    // Process tags
    const tags = formData.tags
      .split(",")
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0);
    
    // Add link
    const newLink = addLink({
      title: formData.title.trim(),
      url: formData.url.trim(),
      userId: CURRENT_USER.id,
      username: CURRENT_USER.username,
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
