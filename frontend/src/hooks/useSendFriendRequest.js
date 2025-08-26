// src/hooks/useSendFriendRequest.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendFriendRequest } from "../lib/api";
import { toast } from "react-toastify";

export const useSendFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      toast.success("Friend request sent!");
      queryClient.invalidateQueries(["recommended-users"]);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to send friend request"
      );
    },
  });
};
