
import { Link as RouterLink } from "react-router-dom";
import { Link } from "@/types";
import { formatRelativeTime, formatUrl } from "@/utils/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowUp, ArrowDown, MessageSquare } from "lucide-react";
import { updateVote } from "@/services/linksService";
import { useState } from "react";
import { toast } from "sonner";

interface LinkItemProps {
  link: Link;
  onVoteChange?: () => void;
}

const LinkItem = ({ link, onVoteChange }: LinkItemProps) => {
  const [votes, setVotes] = useState(link.votes);
  const [isVoting, setIsVoting] = useState(false);
  
  const handleVote = async (increment: boolean) => {
    if (isVoting) return;
    
    setIsVoting(true);
    const updatedLink = updateVote(link.id, increment);
    
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
  
  return (
    <Card className="mb-3 p-3 link-card overflow-hidden border-l-4 border-l-primary/30">
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center gap-1 pt-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full"
            onClick={() => handleVote(true)}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">{votes}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full"
            onClick={() => handleVote(false)}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2 flex-wrap">
              <RouterLink to={`/link/${link.id}`} className="font-medium hover:text-primary hover:underline truncate">
                {link.title}
              </RouterLink>
              
              <a 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs text-muted-foreground hover:text-primary hover:underline truncate"
              >
                ({formatUrl(link.url)})
              </a>
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
    </Card>
  );
};

export default LinkItem;
