
import LinkSubmitForm from "@/components/LinkSubmitForm";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const SubmitPage = () => {
  return (
    <div className="container max-w-7xl mx-auto py-8">
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to all links
        </Link>
      </div>
      
      <LinkSubmitForm />
    </div>
  );
};

export default SubmitPage;
