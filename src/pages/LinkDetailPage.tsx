
import { useState, useEffect } from "react";
import { useParams, Link as RouterLink, useNavigate } from "react-router-dom";
import { getLinkById, deleteLink } from "@/services/linksService";
import { Link } from "@/types";
import LinkItem from "@/components/LinkItem";
import CommentItem from "@/components/CommentItem";
import CommentForm from "@/components/CommentForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const LinkDetailPage = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [link, setLink] = useState<Link | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchLink = async () => {
      setIsLoading(true);
      const fetchedLink = await getLinkById(id);
      setLink(fetchedLink || null);
      setIsLoading(false);
    };
    
    fetchLink();
  }, [id]);
  
  const refreshLink = async () => {
    const updatedLink = await getLinkById(id);
    setLink(updatedLink || null);
  };
  
  const handleDelete = async () => {
    const success = await deleteLink(id);
    
    if (success) {
      toast.success("Link deleted successfully");
      queryClient.invalidateQueries();
      navigate("/");
    } else {
      toast.error("Failed to delete link");
    }
  };
  
  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto py-8 animate-pulse">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="h-20 bg-muted/50 rounded-md"></div>
          <div className="h-32 bg-muted/50 rounded-md"></div>
        </div>
      </div>
    );
  }
  
  if (!link) {
    return (
      <div className="container max-w-7xl mx-auto py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-4">Link not found</h2>
            <p className="text-muted-foreground mb-6">
              The link you're looking for doesn't exist or has been removed.
            </p>
            <RouterLink to="/">
              <Button>Return to Home</Button>
            </RouterLink>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-7xl mx-auto py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <RouterLink to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to all links
          </RouterLink>
        </div>
        
        <LinkItem 
          link={link} 
          onVoteChange={refreshLink} 
          onDelete={handleDelete}
          onEdit={refreshLink}
        />
        
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-6">
            Comments ({link.comments.length})
          </h2>
          
          <CommentForm linkId={link.id} onCommentAdded={refreshLink} />
          
          {link.comments.length > 0 ? (
            <div className="space-y-4">
              {[...link.comments]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map(comment => (
                  <CommentItem key={comment.id} comment={comment} />
                ))
              }
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinkDetailPage;
