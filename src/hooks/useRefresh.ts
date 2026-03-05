import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export const useRefresh = () => {
  const queryClient = useQueryClient();

  const refresh = useCallback(async () => {
    // Invalidate all queries to trigger refetch
    await queryClient.invalidateQueries();
  }, [queryClient]);

  return refresh;
};
