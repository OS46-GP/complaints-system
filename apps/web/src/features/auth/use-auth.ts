import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { authApi } from "./api";
import { persistAuthFromToken } from "./store";
import { PATHS } from "@/router/paths";

export function useLogin() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      const user = persistAuthFromToken(data.access_token);
      if (user) {
        const dashboard =
          user.role === "Admin" ? PATHS.ADMIN.DASHBOARD : PATHS.USER.DASHBOARD;
        navigate(dashboard, { replace: true });
      }
    },
  });
}
