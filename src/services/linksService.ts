
import { Link, Comment } from "../types";

// Initial data
const initialLinks: Link[] = [
  {
    id: "1",
    title: "Hacker News",
    url: "https://news.ycombinator.com/",
    votes: 125,
    userId: "user1",
    username: "johnsmith",
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    comments: [
      {
        id: "c1",
        linkId: "1",
        userId: "user2",
        username: "janesmith",
        text: "This is the original inspiration for our app!",
        createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      }
    ],
    tags: ["tech", "news"]
  },
  {
    id: "2",
    title: "Lovable.dev - AI Powered Web Development",
    url: "https://lovable.dev/",
    votes: 84,
    userId: "user2",
    username: "janesmith",
    createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
    comments: [],
    tags: ["development", "ai"]
  },
  {
    id: "3",
    title: "TypeScript Documentation",
    url: "https://www.typescriptlang.org/docs/",
    votes: 67,
    userId: "user3",
    username: "techguy",
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    comments: [],
    tags: ["development", "documentation"]
  },
  {
    id: "4",
    title: "React - A JavaScript library for building user interfaces",
    url: "https://reactjs.org/",
    votes: 92,
    userId: "user1",
    username: "johnsmith",
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    comments: [],
    tags: ["development", "javascript"]
  },
  {
    id: "5",
    title: "Tailwind CSS - Rapidly build modern websites",
    url: "https://tailwindcss.com/",
    votes: 75,
    userId: "user3",
    username: "techguy",
    createdAt: new Date(Date.now() - 72 * 3600000).toISOString(),
    comments: [],
    tags: ["css", "design"]
  }
];

// Mock local storage service
const STORAGE_KEY = "linkvault_data";

// Load links from localStorage if available
const loadLinks = (): Link[] => {
  const storedData = localStorage.getItem(STORAGE_KEY);
  return storedData ? JSON.parse(storedData) : initialLinks;
};

// Save links to localStorage
const saveLinks = (links: Link[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
};

// Get all links
export const getLinks = (): Link[] => {
  return loadLinks();
};

// Get links filtered and sorted
export const getFilteredLinks = (searchTerm: string = "", tag: string = "", sortBy: string = "votes"): Link[] => {
  let links = loadLinks();
  
  // Apply filters
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    links = links.filter(link => 
      link.title.toLowerCase().includes(term) || 
      link.url.toLowerCase().includes(term) ||
      link.tags.some(t => t.toLowerCase().includes(term))
    );
  }
  
  if (tag) {
    links = links.filter(link => link.tags.includes(tag));
  }
  
  // Apply sorting
  links = [...links].sort((a, b) => {
    if (sortBy === "votes") {
      return b.votes - a.votes;
    } else if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return 0;
  });
  
  return links;
};

// Get a single link by ID
export const getLinkById = (id: string): Link | undefined => {
  const links = loadLinks();
  return links.find(link => link.id === id);
};

// Add a new link
export const addLink = (link: Omit<Link, "id" | "votes" | "createdAt" | "comments">): Link => {
  const links = loadLinks();
  const newLink: Link = {
    ...link,
    id: Date.now().toString(),
    votes: 1, // Start with one upvote (the poster's)
    createdAt: new Date().toISOString(),
    comments: []
  };
  
  const updatedLinks = [newLink, ...links];
  saveLinks(updatedLinks);
  
  return newLink;
};

// Update vote for a link
export const updateVote = (id: string, increment: boolean): Link | undefined => {
  const links = loadLinks();
  const updatedLinks = links.map(link => {
    if (link.id === id) {
      return { 
        ...link, 
        votes: increment ? link.votes + 1 : Math.max(0, link.votes - 1)
      };
    }
    return link;
  });
  
  saveLinks(updatedLinks);
  return updatedLinks.find(link => link.id === id);
};

// Add comment to a link
export const addComment = (linkId: string, comment: Omit<Comment, "id" | "createdAt" | "linkId">): Comment | undefined => {
  const links = loadLinks();
  let newComment: Comment | undefined;
  
  const updatedLinks = links.map(link => {
    if (link.id === linkId) {
      newComment = {
        ...comment,
        id: `c${Date.now()}`,
        linkId,
        createdAt: new Date().toISOString()
      };
      
      return {
        ...link,
        comments: [...link.comments, newComment]
      };
    }
    return link;
  });
  
  saveLinks(updatedLinks);
  return newComment;
};

// Delete a link
export const deleteLink = (id: string): boolean => {
  const links = loadLinks();
  const updatedLinks = links.filter(link => link.id !== id);
  
  if (updatedLinks.length < links.length) {
    saveLinks(updatedLinks);
    return true;
  }
  
  return false;
};

// Get all unique tags
export const getAllTags = (): string[] => {
  const links = loadLinks();
  const tagsSet = new Set<string>();
  
  links.forEach(link => {
    link.tags.forEach(tag => tagsSet.add(tag));
  });
  
  return Array.from(tagsSet).sort();
};
