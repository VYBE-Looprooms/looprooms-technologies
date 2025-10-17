import { useState, useEffect, useCallback } from "react";

export function useUserStats() {
  const [stats, setStats] = useState({
    postCount: 0,
    followingCount: 0,
    followersCount: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchUserStats = useCallback(async () => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.user) {
          setStats({
            postCount: data.data.user.postCount || 0,
            followingCount: 0, // TODO: Implement when following feature is added
            followersCount: 0, // TODO: Implement when followers feature is added
          });
        }
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserStats();
  }, [fetchUserStats]);

  return { stats, loading, refreshStats: fetchUserStats };
}

export default useUserStats;
