import toast from "react-hot-toast";
import { QueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/types/common-types";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
      onError: (error) => {
        const err = error as { response?: { data?: ApiError } };
        const message = err.response?.data?.message ?? "Something went wrong";
        toast.error(message);
      },
    },
  },
});
