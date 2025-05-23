
import { Link as RouterLink } from "react-router-dom";
import { Link } from "@/types";
import { formatRelativeTime, formatUrl } from "@/utils/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ArrowUp, 
  ArrowDown, 
  MessageSquare, 
  Edit, 
  Trash, 
  MoreVertical 
} from "lucide-react";
import { updateVote, deleteLink } from "@/services/linksService";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { LinkEditForm } from "./LinkEditForm";

interface LinkItemProps {
  link: Link;
  onVoteChange?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

const LinkItem = ({ link, onVoteChange, onDelete, onEdit }: LinkItemProps) => {
  const [votes, setVotes] = useState(link.votes);
  const [isVoting, setIsVoting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { user } = useAuth();
  
  const isOwner = user?.id === link.userId;
  
  const handleVote = async (increment: boolean) => {
    if (isVoting) return;
    
    if (!user) {
      toast.error("You must be logged in to vote", {
        action: {
          label: "Login",
          onClick: () => window.location.href = "/auth",
        },
      });
      return;
    }
    
    setIsVoting(true);
    const updatedLink = await updateVote(link.id, increment);
    
    if (updatedLink) {
      setVotes(updatedLink.votes);
      if (onVoteChange) {
        onVoteChange();
      }
    }
    
    setIsVoting(false);
    
    toast(increment ? "Upvoted" : "Downvoted", {
      description: `You ${increment ? "upvoted" : "downvoted"} "${link.title}"`,
    });
  };
  
  const handleDelete = async () => {
    if (!isOwner) return;
    
    setIsDeleting(true);
    
    const success = await deleteLink(link.id);
    
    if (success) {
      toast.success("Link deleted successfully");
      if (onDelete) {
        onDelete();
      }
    } else {
      toast.error("Failed to delete link");
    }
    
    setIsDeleting(false);
    setShowDeleteDialog(false);
  };
  
  const handleEdit = () => {
    setShowEditDialog(true);
  };
  
  const handleEditComplete = () => {
    setShowEditDialog(false);
    if (onEdit) {
      onEdit();
    }
  };
  
  return (
    <Card className="mb-3 p-3 link-card overflow-hidden border-l-4 border-l-primary/30">
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center gap-1 pt-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full"
            onClick={() => handleVote(true)}
            disabled={isVoting}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">{votes}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full"
            onClick={() => handleVote(false)}
            disabled={isVoting}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex flex-col">
            <div className="flex items-baseline justify-between gap-2">
              <div className="flex items-baseline gap-2 flex-wrap min-w-0 max-w-full pr-2">
                <RouterLink to={`/link/${link.id}`} className="font-medium hover:text-primary hover:underline truncate max-w-full block">
                  {link.title}
                </RouterLink>
                
                <a 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xs text-muted-foreground hover:text-primary hover:underline truncate max-w-full block"
                >
                  ({formatUrl(link.url)})
                </a>
              </div>
              
              {isOwner && (
                <div className="flex shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">More options</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleEdit}>
                        <Edit className="h-4 w-4 mr-2" />
                        <span>Edit Link</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                        <DialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Trash className="h-4 w-4 mr-2 text-destructive" />
                            <span className="text-destructive">Delete Link</span>
                          </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Link</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete this link? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button 
                              variant="outline" 
                              onClick={() => setShowDeleteDialog(false)}
                            >
                              Cancel
                            </Button>
                            <Button 
                              variant="destructive"
                              onClick={handleDelete}
                              disabled={isDeleting}
                            >
                              {isDeleting ? "Deleting..." : "Delete"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
            
            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1.5">
              <div className="text-xs text-muted-foreground">
                by <span className="text-foreground">{link.username}</span> {formatRelativeTime(link.createdAt)}
              </div>
              
              <RouterLink 
                to={`/link/${link.id}`} 
                className="flex items-center text-xs text-muted-foreground hover:text-primary gap-1"
              >
                <MessageSquare className="h-3 w-3" />
                {link.comments.length} comment{link.comments.length !== 1 ? 's' : ''}
              </RouterLink>
              
              <div className="flex flex-wrap gap-1">
                {link.tags.map(tag => (
                  <RouterLink key={tag} to={`/tag/${tag}`}>
                    <Badge variant="outline" className="text-xs bg-secondary/50">
                      {tag}
                    </Badge>
                  </RouterLink>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Link</DialogTitle>
          </DialogHeader>
          <LinkEditForm link={link} onComplete={handleEditComplete} />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default LinkItem;
