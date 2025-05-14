
import { useState, useEffect } from "react";
import { getAllTags, getFilteredLinks } from "@/services/linksService";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const TagsPage = () => {
  const [tags, setTags] = useState<string[]>([]);
  const [tagCounts, setTagCounts] = useState<Record<string, number>>({});
  
  useEffect(() => {
    const allTags = getAllTags();
    const links = getFilteredLinks();
    
    const counts: Record<string, number> = {};
    allTags.forEach(tag => {
      counts[tag] = links.filter(link => link.tags.includes(tag)).length;
    });
    
    setTags(allTags);
    setTagCounts(counts);
  }, []);
  
  return (
    <div className="container max-w-7xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Browse by Tags</h1>
      
      {tags.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tags.map(tag => (
            <Link key={tag} to={`/?tag=${tag}`}>
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-l-2 border-l-primary/30">
                <div className="flex items-center justify-between">
                  <Badge className="text-sm">{tag}</Badge>
                  <span className="text-sm text-muted-foreground">{tagCounts[tag]} link{tagCounts[tag] !== 1 ? 's' : ''}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">No tags found yet.</p>
        </Card>
      )}
    </div>
  );
};

export default TagsPage;
