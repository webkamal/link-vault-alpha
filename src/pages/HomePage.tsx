
import { useState, useEffect } from "react";
import { getFilteredLinks } from "@/services/linksService";
import LinkItem from "@/components/LinkItem";
import { useParams, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SortOption, Link } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Sidebar } from "@/components/Sidebar";

const HomePage = () => {
  const { tag } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("query") || "";
  const queryClient = useQueryClient();
  
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOption, setSortOption] = useState<SortOption>("votes");
  
  useEffect(() => {
    const fetchLinks = async () => {
      setIsLoading(true);
      const data = await getFilteredLinks(searchQuery, tag, sortOption);
      setLinks(data);
      setIsLoading(false);
    };
    
    fetchLinks();
  }, [searchQuery, tag, sortOption]);

  const handleSortChange = (value: string) => {
    setSortOption(value as SortOption);
  };

  const handleDelete = async () => {
    // Refetch links after deletion
    queryClient.invalidateQueries();
    const data = await getFilteredLinks(searchQuery, tag, sortOption);
    setLinks(data);
    toast.success("Link deleted successfully");
  };

  const handleRefresh = async () => {
    const data = await getFilteredLinks(searchQuery, tag, sortOption);
    setLinks(data);
  };
  
  let title = "All Links";
  if (tag) {
    title = `Links tagged with "${tag}"`;
  } else if (searchQuery) {
    title = `Search results for "${searchQuery}"`;
  } else if (sortOption === "newest") {
    title = "Newest Links";
  }

  return (
    <div className="container max-w-7xl mx-auto py-8">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <h1 className="text-2xl font-bold truncate">{title}</h1>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select defaultValue={sortOption} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="votes">Most Votes</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="p-4 h-24"></Card>
              ))}
            </div>
          ) : links.length > 0 ? (
            <div className="space-y-3 overflow-hidden">
              {links.map(link => (
                <LinkItem 
                  key={link.id} 
                  link={link} 
                  onVoteChange={handleRefresh}
                  onDelete={handleDelete}
                  onEdit={handleRefresh}
                />
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">No links found.</p>
              {(searchQuery || tag) && (
                <p className="mt-2 text-sm">Try a different search term or tag.</p>
              )}
            </Card>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
