import React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logout } from '../lib/api.js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const { mutate: logoutMutation, isPending, error } = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // Clear localStorage
      localStorage.removeItem("token");
      
      // Clear all queries
      queryClient.clear();
      
      // Show success message
      toast.success("Logged out successfully!");
      
      // Navigate to login
      navigate("/login");
    },
    onError: (error) => {
      // Even if logout fails, clear local data and redirect
      localStorage.removeItem("token");
      queryClient.clear();
      toast.error("Logout failed, but you've been signed out");
      navigate("/login");
    }
  });
  
  return { logoutMutation, isPending, error };
}

export default useLogout