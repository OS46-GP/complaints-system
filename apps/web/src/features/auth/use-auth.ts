import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { authApi } from "./api";
import { persistAuthFromToken } from "./store";
import { PATHS } from "@/router/paths";

interface LoginArgs {
  username: string;
  password: string;
  remember: boolean;
}

export function useLogin() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ username, password }: LoginArgs) =>
      authApi.login({ username, password }),
    onSuccess: (data, variables) => {
      const user = persistAuthFromToken(data.access_token, variables.remember);
      if (user) {
        const dashboard =
          user.role === "Admin" ? PATHS.ADMIN.DASHBOARD : PATHS.USER.DASHBOARD;
        navigate(dashboard, { replace: true });
      }
    },
  });
}
