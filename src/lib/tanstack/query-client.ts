import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false, // disable automatic refetching when window gains focus
        retry: 1, // retry failed queries once before showing error
        staleTime: 5 * 60 * 1000, // data stays fresh for 5 minutes
      },
    },
  })