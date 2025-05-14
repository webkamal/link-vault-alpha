
import { useState, useEffect } from "react";
import { getFilteredLinks, getAllTags } from "@/services/linksService";
import { Link } from "@/types";
import LinkItem from "@/components/LinkItem";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSearchParams, Link as RouterLink } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { SortOption } from "@/types";

const HomePage = () => {
  const [searchParams] = useSearchParams();
  const [links, setLinks] = useState<Link[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const searchTerm = searchParams.get("search") || "";
  const tagFilter = searchParams.get("tag") || "";
  const sortBy = (searchParams.get("sort") as SortOption) || "votes";
  
  useEffect(() => {
    setIsLoading(true);
    const filteredLinks = getFilteredLinks(searchTerm, tagFilter, sortBy);
    const allTags = getAllTags();
    
    setLinks(filteredLinks);
    setTags(allTags);
    setIsLoading(false);
  }, [searchTerm, tagFilter, sortBy]);
  
  const refreshLinks = () => {
    const filteredLinks = getFilteredLinks(searchTerm, tagFilter, sortBy);
    setLinks(filteredLinks);
  };
  
  return (
    <div className="container max-w-7xl mx-auto py-8">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-3/4">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold">
              {tagFilter ? `${tagFilter} links` : (
                sortBy === "newest" ? "Newest Links" : "Popular Links"
              )}
            </h1>
            
            <div className="flex gap-2">
              <RouterLink to="/?sort=votes">
                <Button
                  variant={sortBy === "votes" ? "default" : "outline"}
                  size="sm"
                >
                  Popular
                </Button>
              </RouterLink>
              
              <RouterLink to="/?sort=newest">
                <Button
                  variant={sortBy === "newest" ? "default" : "outline"}
                  size="sm"
                >
                  Newest
                </Button>
              </RouterLink>
            </div>
          </div>
          
          {searchTerm && (
            <div className="mb-4 p-2 bg-accent rounded-md">
              <p className="text-sm">
                Showing results for: <span className="font-medium">{searchTerm}</span>
              </p>
            </div>
          )}
          
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <Card key={index} className="p-4 h-20 animate-pulse">
                  <div className="bg-muted/50 h-4 w-2/3 rounded"></div>
                  <div className="bg-muted/50 h-3 w-1/3 rounded mt-2"></div>
                  <div className="bg-muted/50 h-3 w-1/4 rounded mt-2"></div>
                </Card>
              ))}
            </div>
          ) : links.length > 0 ? (
            <div className="space-y-2">
              {links.map(link => (
                <LinkItem key={link.id} link={link} onVoteChange={refreshLinks} />
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">No links found.</p>
              <RouterLink to="/submit">
                <Button className="mt-4">Submit a Link</Button>
              </RouterLink>
            </Card>
          )}
        </div>
        
        <div className="w-full md:w-1/4">
          <Card className="p-4">
            <h2 className="font-semibold mb-3">Popular Tags</h2>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <RouterLink key={tag} to={`/?tag=${tag}`}>
                  <Badge 
                    variant={tagFilter === tag ? "default" : "outline"}
                    className="cursor-pointer"
                  >
                    {tag}
                  </Badge>
                </RouterLink>
              ))}
            </div>
            
            {tagFilter && (
              <div className="mt-3">
                <RouterLink to="/">
                  <Button variant="ghost" size="sm" className="text-xs">
                    Clear filter
                  </Button>
                </RouterLink>
              </div>
            )}
          </Card>
          
          <Card className="p-4 mt-4">
            <h2 className="font-semibold mb-2">About LinkVault</h2>
            <p className="text-sm text-muted-foreground mb-3">
              Save and organize your important links in one place. Vote, comment, and tag links for easy discovery.
            </p>
            <RouterLink to="/submit">
              <Button className="w-full">Submit a Link</Button>
            </RouterLink>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
