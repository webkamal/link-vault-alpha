import { supabase } from "@/integrations/supabase/client";
import { Link, Comment } from "@/types";

// Get all links
export const getLinks = async (): Promise<Link[]> => {
  try {
    const { data: links, error } = await supabase
      .from('links')
      .select(`
        id, 
        title, 
        url, 
        votes, 
        user_id,
        created_at
      `);
    
    if (error) {
      console.error('Error fetching links:', error);
      return [];
    }

    if (!links) {
      return [];
    }

    // Get usernames for each link
    const linksWithUsernames = await Promise.all(
      links.map(async (link) => {
        // Get username
        const { data: usernameData } = await supabase
          .rpc('get_username', { user_id: link.user_id });
        
        // Get comments
        const { data: comments } = await supabase
          .from('comments')
          .select(`
            id, 
            link_id, 
            user_id, 
            text, 
            created_at
          `)
          .eq('link_id', link.id);
          
        // Get comment usernames
        const commentsWithUsernames = await Promise.all(
          (comments || []).map(async (comment) => {
            const { data: commentUsername } = await supabase
              .rpc('get_username', { user_id: comment.user_id });
            
            return {
              id: comment.id,
              linkId: comment.link_id,
              userId: comment.user_id,
              username: commentUsername || 'anonymous',
              text: comment.text,
              createdAt: comment.created_at
            };
          })
        );

        // Get tags
        const { data: linkWithTags } = await supabase
          .from('links')
          .select('tags')
          .eq('id', link.id)
          .single();
          
        return {
          id: link.id,
          title: link.title,
          url: link.url,
          votes: link.votes,
          userId: link.user_id,
          username: usernameData || 'anonymous',
          createdAt: link.created_at,
          comments: commentsWithUsernames,
          tags: linkWithTags?.tags || []
        };
      })
    );

    return linksWithUsernames;
  } catch (error) {
    console.error('Error in getLinks:', error);
    return [];
  }
};

// Get links filtered and sorted
export const getFilteredLinks = async (
  searchTerm: string = "", 
  tag: string = "", 
  sortBy: string = "votes"
): Promise<Link[]> => {
  try {
    let query = supabase
      .from('links')
      .select(`
        id, 
        title, 
        url, 
        votes, 
        user_id,
        created_at,
        tags
      `);
    
    // Apply search filter if provided
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      query = query.or(`title.ilike.%${term}%,url.ilike.%${term}%`);
    }
    
    // Apply tag filter if provided
    if (tag) {
      query = query.contains('tags', [tag]);
    }
    
    // Apply sorting
    if (sortBy === "votes") {
      query = query.order('votes', { ascending: false });
    } else if (sortBy === "newest") {
      query = query.order('created_at', { ascending: false });
    }
    
    const { data: links, error } = await query;
    
    if (error) {
      console.error('Error fetching filtered links:', error);
      return [];
    }

    if (!links) {
      return [];
    }

    // Get usernames and comments for each link
    const linksWithUsernames = await Promise.all(
      links.map(async (link) => {
        // Get username
        const { data: usernameData } = await supabase
          .rpc('get_username', { user_id: link.user_id });
        
        // Get comments
        const { data: comments } = await supabase
          .from('comments')
          .select(`
            id, 
            link_id, 
            user_id, 
            text, 
            created_at
          `)
          .eq('link_id', link.id);
          
        // Get comment usernames
        const commentsWithUsernames = await Promise.all(
          (comments || []).map(async (comment) => {
            const { data: commentUsername } = await supabase
              .rpc('get_username', { user_id: comment.user_id });
            
            return {
              id: comment.id,
              linkId: comment.link_id,
              userId: comment.user_id,
              username: commentUsername || 'anonymous',
              text: comment.text,
              createdAt: comment.created_at
            };
          })
        );
          
        return {
          id: link.id,
          title: link.title,
          url: link.url,
          votes: link.votes,
          userId: link.user_id,
          username: usernameData || 'anonymous',
          createdAt: link.created_at,
          comments: commentsWithUsernames,
          tags: link.tags || []
        };
      })
    );

    return linksWithUsernames;
  } catch (error) {
    console.error('Error in getFilteredLinks:', error);
    return [];
  }
};

// Get a single link by ID
export const getLinkById = async (id: string): Promise<Link | undefined> => {
  try {
    const { data: link, error } = await supabase
      .from('links')
      .select(`
        id, 
        title, 
        url, 
        votes, 
        user_id,
        created_at,
        tags
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching link:', error);
      return undefined;
    }

    if (!link) {
      return undefined;
    }

    // Get username
    const { data: usernameData } = await supabase
      .rpc('get_username', { user_id: link.user_id });
    
    // Get comments
    const { data: comments } = await supabase
      .from('comments')
      .select(`
        id, 
        link_id, 
        user_id, 
        text, 
        created_at
      `)
      .eq('link_id', link.id);
      
    // Get comment usernames
    const commentsWithUsernames = await Promise.all(
      (comments || []).map(async (comment) => {
        const { data: commentUsername } = await supabase
          .rpc('get_username', { user_id: comment.user_id });
        
        return {
          id: comment.id,
          linkId: comment.link_id,
          userId: comment.user_id,
          username: commentUsername || 'anonymous',
          text: comment.text,
          createdAt: comment.created_at
        };
      })
    );
      
    return {
      id: link.id,
      title: link.title,
      url: link.url,
      votes: link.votes,
      userId: link.user_id,
      username: usernameData || 'anonymous',
      createdAt: link.created_at,
      comments: commentsWithUsernames,
      tags: link.tags || []
    };
  } catch (error) {
    console.error('Error in getLinkById:', error);
    return undefined;
  }
};

// Add a new link
export const addLink = async (
  link: Omit<Link, "id" | "votes" | "createdAt" | "comments" | "userId" | "username">
): Promise<Link | undefined> => {
  try {
    const user = supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User must be logged in to add a link");
    }
    
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData || !userData.user) {
      throw new Error("User must be logged in to add a link");
    }
    
    const { data: insertedLink, error } = await supabase
      .from('links')
      .insert({
        title: link.title,
        url: link.url,
        user_id: userData.user.id,
        tags: link.tags
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding link:', error);
      return undefined;
    }

    if (!insertedLink) {
      return undefined;
    }

    // Get username
    const { data: usernameData } = await supabase
      .rpc('get_username', { user_id: insertedLink.user_id });
    
    return {
      id: insertedLink.id,
      title: insertedLink.title,
      url: insertedLink.url,
      votes: insertedLink.votes,
      userId: insertedLink.user_id,
      username: usernameData || 'anonymous',
      createdAt: insertedLink.created_at,
      comments: [],
      tags: insertedLink.tags || []
    };
  } catch (error) {
    console.error('Error in addLink:', error);
    return undefined;
  }
};

// Update vote for a link
export const updateVote = async (id: string, increment: boolean): Promise<Link | undefined> => {
  try {
    const { data: updatedLink, error } = await supabase
      .rpc('handle_vote', { 
        link_id: id, 
        vote_increment: increment ? 1 : -1 
      });
    
    if (error) {
      console.error('Error updating vote:', error);
      return undefined;
    }

    if (!updatedLink) {
      return undefined;
    }

    // We need to get the full link with comments and username
    return await getLinkById(id);
  } catch (error) {
    console.error('Error in updateVote:', error);
    return undefined;
  }
};

// Add comment to a link
export const addComment = async (
  linkId: string, 
  comment: Omit<Comment, "id" | "createdAt" | "linkId" | "userId" | "username">
): Promise<Comment | undefined> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData || !userData.user) {
      throw new Error("User must be logged in to add a comment");
    }
    
    const { data: insertedComment, error } = await supabase
      .from('comments')
      .insert({
        link_id: linkId,
        user_id: userData.user.id,
        text: comment.text
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding comment:', error);
      return undefined;
    }

    if (!insertedComment) {
      return undefined;
    }

    // Get username
    const { data: usernameData } = await supabase
      .rpc('get_username', { user_id: insertedComment.user_id });
    
    return {
      id: insertedComment.id,
      linkId: insertedComment.link_id,
      userId: insertedComment.user_id,
      username: usernameData || 'anonymous',
      text: insertedComment.text,
      createdAt: insertedComment.created_at
    };
  } catch (error) {
    console.error('Error in addComment:', error);
    return undefined;
  }
};

// Delete a link
export const deleteLink = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('links')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting link:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteLink:', error);
    return false;
  }
};

// Get all unique tags
export const getAllTags = async (): Promise<string[]> => {
  try {
    const { data: links, error } = await supabase
      .from('links')
      .select('tags');
    
    if (error) {
      console.error('Error fetching tags:', error);
      return [];
    }

    if (!links) {
      return [];
    }

    const tagsSet = new Set<string>();
    
    links.forEach(link => {
      (link.tags || []).forEach(tag => tagsSet.add(tag));
    });
    
    return Array.from(tagsSet).sort();
  } catch (error) {
    console.error('Error in getAllTags:', error);
    return [];
  }
};

// Update a link
export const updateLink = async (
  id: string, 
  link: Partial<Omit<Link, "id" | "userId" | "username" | "createdAt" | "comments">>
): Promise<Link | undefined> => {
  try {
    const { data: updatedLink, error } = await supabase
      .from('links')
      .update({
        title: link.title,
        url: link.url,
        tags: link.tags
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating link:', error);
      return undefined;
    }

    if (!updatedLink) {
      return undefined;
    }

    // We need to get the full link with comments and username
    return await getLinkById(id);
  } catch (error) {
    console.error('Error in updateLink:', error);
    return undefined;
  }
};

// Get recent comments
export const getRecentComments = async (limit = 5): Promise<Comment[]> => {
  try {
    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        id, 
        link_id, 
        user_id, 
        text, 
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching recent comments:', error);
      return [];
    }

    if (!comments) {
      return [];
    }

    // Get comment usernames and link titles
    const commentsWithUsernames = await Promise.all(
      comments.map(async (comment) => {
        // Get username
        const { data: username } = await supabase
          .rpc('get_username', { user_id: comment.user_id });
        
        return {
          id: comment.id,
          linkId: comment.link_id,
          userId: comment.user_id,
          username: username || 'anonymous',
          text: comment.text,
          createdAt: comment.created_at
        };
      })
    );

    return commentsWithUsernames;
  } catch (error) {
    console.error('Error in getRecentComments:', error);
    return [];
  }
};
