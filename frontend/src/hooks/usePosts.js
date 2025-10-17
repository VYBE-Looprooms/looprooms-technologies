import { useState, useEffect, useCallback } from 'react';
import { postsAPI } from '@/lib/api-client';

export function usePosts(initialParams = {}) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);



  const refreshPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await postsAPI.getFeedPosts({
        ...initialParams,
        page: 1
      });

      if (response.success) {
        setPosts(response.data.posts);
        setPage(2);
        setHasMore(response.data.pagination.page < response.data.pagination.pages);
      } else {
        setError('Failed to fetch posts');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  }, [initialParams]);

  const loadMorePosts = useCallback(async () => {
    if (loading || !hasMore) return;
    
    try {
      setLoading(true);
      setError(null);

      const response = await postsAPI.getFeedPosts({
        ...initialParams,
        page: page
      });

      if (response.success) {
        setPosts(prev => [...prev, ...response.data.posts]);
        setPage(prev => prev + 1);
        setHasMore(response.data.pagination.page < response.data.pagination.pages);
      } else {
        setError('Failed to fetch posts');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  }, [initialParams, loading, hasMore, page]);

  const createPost = useCallback(async (postData) => {
    try {
      const response = await postsAPI.createPost(postData);
      if (response.success) {
        // Add new post to the beginning of the list
        setPosts(prev => [response.data, ...prev]);
        return { success: true, post: response.data };
      } else {
        return { success: false, error: response.error || 'Failed to create post' };
      }
    } catch (error) {
      return { success: false, error: error.message || 'Failed to create post' };
    }
  }, []);

  const reactToPost = useCallback(async (postId, reactionType) => {
    // Optimistic update first
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const wasLiked = post.isLiked;
        const newIsLiked = !wasLiked;
        return {
          ...post,
          isLiked: newIsLiked,
          reactionCount: newIsLiked ? (post.reactionCount || 0) + 1 : Math.max((post.reactionCount || 0) - 1, 0)
        };
      }
      return post;
    }));

    try {
      const response = await postsAPI.reactToPost(postId, reactionType);
      if (response.success) {
        // Update with server response to ensure accuracy
        setPosts(prev => prev.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              userReaction: response.data.reactionAdded ? response.data.reactionType : null,
              isLiked: response.data.reactionAdded,
              reactionCount: response.data.reactionCount
            };
          }
          return post;
        }));
        return { success: true };
      } else {
        // Revert optimistic update on failure
        setPosts(prev => prev.map(post => {
          if (post.id === postId) {
            const wasLiked = !post.isLiked; // Revert the optimistic change
            return {
              ...post,
              isLiked: wasLiked,
              reactionCount: wasLiked ? (post.reactionCount || 0) + 1 : Math.max((post.reactionCount || 0) - 1, 0)
            };
          }
          return post;
        }));
        return { success: false, error: response.error || 'Failed to react to post' };
      }
    } catch (error) {
      // Revert optimistic update on error
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          const wasLiked = !post.isLiked; // Revert the optimistic change
          return {
            ...post,
            isLiked: wasLiked,
            reactionCount: wasLiked ? (post.reactionCount || 0) + 1 : Math.max((post.reactionCount || 0) - 1, 0)
          };
        }
        return post;
      }));
      return { success: false, error: error.message || 'Failed to react to post' };
    }
  }, []);

  const deletePost = useCallback(async (postId) => {
    try {
      const response = await postsAPI.deletePost(postId);
      if (response.success) {
        // Remove post from the list
        setPosts(prev => prev.filter(post => post.id !== postId));
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Failed to delete post' };
      }
    } catch (error) {
      return { success: false, error: error.message || 'Failed to delete post' };
    }
  }, []);

  // Initial load
  useEffect(() => {
    const initialLoad = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await postsAPI.getFeedPosts({
          ...initialParams,
          page: 1
        });

        if (response.success) {
          setPosts(response.data.posts);
          setPage(2);
          setHasMore(response.data.pagination.page < response.data.pagination.pages);
        } else {
          setError('Failed to fetch posts');
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch posts');
      } finally {
        setLoading(false);
      }
    };

    initialLoad();
  }, []); // Empty dependency array to run only once

  return {
    posts,
    loading,
    error,
    hasMore,
    refreshPosts,
    loadMorePosts,
    createPost,
    reactToPost,
    deletePost
  };
}

export function usePost(postId) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPost = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await postsAPI.getPost(postId);
      if (response.success) {
        setPost(response.data);
      } else {
        setError('Failed to fetch post');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch post');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId, fetchPost]);

  return {
    post,
    loading,
    error,
    refreshPost: fetchPost
  };
}

export default usePosts;