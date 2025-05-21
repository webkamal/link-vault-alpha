
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getRecentComments } from "@/services/linksService";
import { Comment } from "@/types";
import { Megaphone } from "lucide-react";
import { formatRelativeTime } from "@/utils/formatters";
import { Link } from "react-router-dom";

export function Sidebar() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentComments = async () => {
      try {
        setIsLoading(true);
        const recentComments = await getRecentComments();
        setComments(recentComments);
      } catch (error) {
        console.error("Error fetching recent comments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentComments();
  }, []);

  return (
    <div className="w-full lg:w-80 space-y-4">
      {/* Latest Comments Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">Latest Comments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-48 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))
          ) : comments.length > 0 ? (
            comments.map(comment => (
              <Link 
                key={comment.id} 
                to={`/link/${comment.linkId}`} 
                className="flex items-start space-x-3 hover:bg-muted/50 p-2 rounded-md transition-colors"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{comment.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-sm">{comment.username}</div>
                  <div className="text-sm text-muted-foreground line-clamp-2">{comment.text}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatRelativeTime(comment.createdAt)}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-sm text-center text-muted-foreground py-2">
              No comments yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advertisement Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            <span>Sponsored</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted aspect-video rounded-md flex items-center justify-center text-muted-foreground">
            <div className="text-center p-4">
              <p className="font-medium">Advertisement Space</p>
              <p className="text-sm">Place your ad here</p>
            </div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground text-center">
            Interested in advertising? Contact us!
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
