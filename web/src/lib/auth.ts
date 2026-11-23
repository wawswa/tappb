import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMe, login, logout } from './api';

export const AUTH_QUERY_KEY = ['auth', 'me'] as const;

export function useAuth() {
  const query = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: getMe,
    staleTime: 30_000,
    retry: false,
  });

  const user = query.data?.user ?? null;
  return {
    user,
    isAdmin: user?.role === 'admin',
    isLoading: query.isPending,
  };
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, data);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, { user: null });
    },
  });
}
