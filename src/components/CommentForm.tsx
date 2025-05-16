
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { addComment } from "@/services/linksService";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

interface CommentFormProps {
  linkId: string;
  onCommentAdded: () => void;
}

const CommentForm = ({ linkId, onCommentAdded }: CommentFormProps) => {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, authState } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    
    if (!user) {
      toast.error("You must be logged in to comment");
      return;
    }
    
    setIsSubmitting(true);
    
    const newComment = await addComment(linkId, {
      text: text.trim(),
    });
    
    if (newComment) {
      setText("");
      onCommentAdded();
      toast.success("Comment added successfully");
    } else {
      toast.error("Failed to add comment");
    }
    
    setIsSubmitting(false);
  };
  
  if (authState === 'LOADING') {
    return (
      <div className="space-y-3 mb-6 animate-pulse">
        <div className="h-24 bg-muted rounded-md"></div>
        <div className="h-10 w-24 bg-muted rounded-md ml-auto"></div>
      </div>
    );
  }
  
  if (authState === 'SIGNED_OUT') {
    return (
      <div className="space-y-3 mb-6 border p-4 rounded-md text-center">
        <p className="text-muted-foreground">You need to be logged in to comment</p>
        <Button asChild>
          <Link to="/auth">Login / Sign Up</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-3 mb-6">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a comment..."
        className="min-h-24"
        disabled={isSubmitting}
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting || !text.trim()}>
          {isSubmitting ? "Adding..." : "Add Comment"}
        </Button>
      </div>
    </form>
  );
};

export default CommentForm;
