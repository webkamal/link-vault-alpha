
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "@/types";
import { deleteLink } from "@/services/linksService";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, PenSquare, Trash, Loader2 } from "lucide-react";
import { formatUrl, formatRelativeTime } from "@/utils/formatters";

interface LinksManagementProps {
  links: Link[];
  isLoading: boolean;
}

export function LinksManagement({ links, isLoading }: LinksManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteLink = async (linkId: string) => {
    if (isDeleting) return;
    
    if (!confirm("Are you sure you want to delete this link?")) {
      return;
    }
    
    try {
      setIsDeleting(true);
      
      const success = await deleteLink(linkId);
      
      if (success) {
        toast.success("Link deleted successfully");
        // Refresh page to update the links list
        window.location.reload();
      } else {
        toast.error("Failed to delete link");
      }
    } catch (error) {
      console.error("Error deleting link:", error);
      toast.error("An error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredLinks = links.filter(link => 
    link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Links Management</CardTitle>
        <CardDescription>
          Manage all links submitted by users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input 
            placeholder="Search links..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredLinks.length > 0 ? (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLinks.map(link => (
                  <TableRow key={link.id}>
                    <TableCell className="font-medium">{link.title}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {formatUrl(link.url)}
                    </TableCell>
                    <TableCell>{link.username}</TableCell>
                    <TableCell>{formatRelativeTime(link.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          asChild
                          title="View"
                        >
                          <a href={`/link/${link.id}`} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          asChild
                          title="Edit"
                        >
                          <a href={`/admin/edit-link/${link.id}`}>
                            <PenSquare className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="icon"
                          onClick={() => handleDeleteLink(link.id)}
                          disabled={isDeleting}
                          title="Delete"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No links found
          </div>
        )}
      </CardContent>
    </Card>
  );
}
