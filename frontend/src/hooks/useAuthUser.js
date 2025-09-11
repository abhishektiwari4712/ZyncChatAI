// src/hooks/useAuthUser.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { getMe, signup, login, completeOnboarding, logout } from "../lib/api.js";

const useAuthUser = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();

  // Current user - Only run if we have a token
  const authQuery = useQuery({
    queryKey: ["authUser"],
    queryFn: getMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
    enabled: !!localStorage.getItem("token"), // Only run if token exists
    onError: (error) => {
      // Clear token on auth error
      if (error?.response?.status === 401) {
        localStorage.removeItem("token");
        qc.removeQueries({ queryKey: ["authUser"] });
      }
    },
  });

  // Signup → Onboarding
  const signupMutation = useMutation({
    mutationFn: signup,
    onSuccess: (data) => {
      if (data?.token) {
        localStorage.setItem("token", data.token);
      }
      qc.setQueryData(["authUser"], data);
      toast.success("Account created successfully!");
      navigate("/onboarding");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Signup failed");
    },
  });

  // Login → Home or Onboarding
  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      if (data?.token) {
        localStorage.setItem("token", data.token);
      }
      qc.setQueryData(["authUser"], data);
      toast.success("Logged in successfully!");
      const isOnboarded = data?.user?.isOnboarded;
      navigate(isOnboarded ? "/" : "/onboarding");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Invalid credentials");
    },
  });

  // Finish onboarding → Home
  const onboardingMutation = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: (data) => {
      qc.setQueryData(["authUser"], data);
      toast.success("Profile completed!");
      navigate("/");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Onboarding failed");
    },
  });

  // Logout → Login
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      localStorage.removeItem("token");
      qc.removeQueries({ queryKey: ["authUser"] });
      toast.success("Logged out successfully!");
      navigate("/login");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Logout failed");
    },
  });

  const user = authQuery.data?.user || null;

  return {
    authUser: user,
    isLoading: authQuery.isLoading,
    isAuthenticated: !!user,
    isOnboarded: user?.isOnboarded,

    signup: signupMutation.mutateAsync,
    isSigningUp: signupMutation.isLoading,

    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isLoading,

    completeOnboarding: onboardingMutation.mutateAsync,
    isOnboarding: onboardingMutation.isLoading,

    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isLoading,
  };
};

export default useAuthUser;

