
import { useState } from "react";
import { Link } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateLink } from "@/services/linksService";

interface LinkEditFormProps {
  link: Link;
  onComplete: () => void;
}

export function LinkEditForm({ link, onComplete }: LinkEditFormProps) {
  const [formData, setFormData] = useState({
    title: link.title,
    url: link.url,
    tags: link.tags.join(", ")
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
    
    setIsSubmitting(true);
    
    // Process tags
    const tags = formData.tags
      .split(",")
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0);
    
    // Update link
    const updatedLink = await updateLink(link.id, {
      title: formData.title.trim(),
      url: formData.url.trim(),
      tags: tags.length > 0 ? tags : ["uncategorized"]
    });
    
    setIsSubmitting(false);
    
    if (updatedLink) {
      toast.success("Link updated successfully!");
      onComplete();
    } else {
      toast.error("Failed to update link");
    }
  };

  const isFormValid = formData.title.trim() && formData.url.trim();
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="edit-title">Title</Label>
        <Input
          id="edit-title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Link title"
          disabled={isSubmitting}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="edit-url">URL</Label>
        <Input
          id="edit-url"
          name="url"
          value={formData.url}
          onChange={handleChange}
          placeholder="https://example.com"
          disabled={isSubmitting}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="edit-tags">Tags (comma separated)</Label>
        <Input
          id="edit-tags"
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
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onComplete} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || !isFormValid}
        >
          {isSubmitting ? "Updating..." : "Update Link"}
        </Button>
      </div>
    </form>
  );
}
