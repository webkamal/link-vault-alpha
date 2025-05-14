
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { CURRENT_USER } from "@/types";
import { addComment } from "@/services/linksService";
import { toast } from "sonner";

interface CommentFormProps {
  linkId: string;
  onCommentAdded: () => void;
}

const CommentForm = ({ linkId, onCommentAdded }: CommentFormProps) => {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    
    setIsSubmitting(true);
    
    const newComment = addComment(linkId, {
      userId: CURRENT_USER.id,
      username: CURRENT_USER.username,
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
