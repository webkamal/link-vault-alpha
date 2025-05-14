
import { Comment } from "@/types";
import { formatRelativeTime } from "@/utils/formatters";
import { Card } from "@/components/ui/card";

interface CommentItemProps {
  comment: Comment;
}

const CommentItem = ({ comment }: CommentItemProps) => {
  return (
    <Card className="mb-3 p-4 border-l-2 border-l-primary/20 animate-fade-in">
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="font-medium text-sm">
            {comment.username}
          </div>
          <div className="text-xs text-muted-foreground">
            {formatRelativeTime(comment.createdAt)}
          </div>
        </div>
        <div className="text-sm whitespace-pre-line">{comment.text}</div>
      </div>
    </Card>
  );
};

export default CommentItem;
