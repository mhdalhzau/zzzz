import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Try to get user from localStorage first
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  // Verify user session with server
  const { data: verifiedUser, isLoading: isVerifying } = useQuery({
    queryKey: ["/api/auth/me"],
    enabled: !!user,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  };

  const isAuthenticated = !!user;

  return {
    user: verifiedUser || user,
    isLoading: isLoading || (isAuthenticated && isVerifying),
    isAuthenticated,
    logout,
  };
}