
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLinkById } from "@/services/linksService";
import { Link } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { LoadingSpinner } from "@/components/admin/LoadingSpinner";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { LinkEditForm } from "@/components/admin/LinkEditForm";

export default function AdminEditLink() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin, isLoading: isCheckingAdmin, authState } = useAdminCheck();
  const [isLoading, setIsLoading] = useState(true);
  const [link, setLink] = useState<Link | null>(null);

  // Load link data
  useEffect(() => {
    const fetchLink = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const linkData = await getLinkById(id);
        
        if (!linkData) {
          toast.error("Link not found");
          navigate('/admin');
          return;
        }
        
        setLink(linkData);
      } catch (error) {
        console.error("Error fetching link:", error);
        toast.error("Error loading link");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAdmin) {
      fetchLink();
    }
  }, [id, isAdmin, navigate]);

  if (authState === 'LOADING') {
    return <LoadingSpinner />;
  }

  if (!isAdmin) {
    return <AccessDenied />;
  }

  return (
    <div className="container max-w-7xl mx-auto py-8">
      <Button
        variant="outline"
        onClick={() => navigate('/admin')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>
      
      {isLoading || !link ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <LinkEditForm link={link} isLoading={isLoading} />
      )}
    </div>
  );
}
