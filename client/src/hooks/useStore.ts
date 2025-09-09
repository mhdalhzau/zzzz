import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

export function useStore() {
  const { user } = useAuth();
  const [activeStoreId, setActiveStoreId] = useState<string | null>(null);

  // Fetch stores yang bisa diakses user
  const { data: allStores, isLoading: isLoadingStores } = useQuery({
    queryKey: ["/api/stores"],
    enabled: !!user,
  });
  
  // Filter stores berdasarkan storeIds yang dimiliki user
  const stores = allStores?.filter((store: any) => user?.storeIds?.includes(store.id)) || [];

  // Set active store dari localStorage atau default ke store pertama
  useEffect(() => {
    if (user?.storeIds) {
      const savedStoreId = localStorage.getItem("activeStoreId");
      if (savedStoreId && user.storeIds.includes(savedStoreId)) {
        setActiveStoreId(savedStoreId);
      } else if (user.storeIds.length > 0) {
        setActiveStoreId(user.storeIds[0]);
        localStorage.setItem("activeStoreId", user.storeIds[0]);
      }
    }
  }, [user]);

  const switchStore = (storeId: string) => {
    setActiveStoreId(storeId);
    localStorage.setItem("activeStoreId", storeId);
  };

  const activeStore = stores?.find((store: any) => store.id === activeStoreId);

  return {
    activeStoreId,
    activeStore,
    stores,
    isLoadingStores,
    switchStore,
  };
}