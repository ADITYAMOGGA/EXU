import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';

interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  sender?: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl: string | null;
  };
}

export function useFriendRequests() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get pending friend requests for current user
  const { data: pendingRequests = [], isLoading } = useQuery({
    queryKey: ['friend-requests', 'pending', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/friend-requests/pending/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch friend requests');
      return response.json();
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Poll every 30 seconds
  });

  // Get count of pending requests
  const pendingCount = pendingRequests.length;

  // Mutation to update friend request status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: 'accepted' | 'rejected' }) => {
      const response = await fetch(`/api/friend-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update friend request');
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch friend requests
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
    },
  });

  const acceptRequest = (requestId: string) => {
    updateStatusMutation.mutate({ requestId, status: 'accepted' });
  };

  const rejectRequest = (requestId: string) => {
    updateStatusMutation.mutate({ requestId, status: 'rejected' });
  };

  return {
    pendingRequests,
    pendingCount,
    isLoading,
    acceptRequest,
    rejectRequest,
    isUpdating: updateStatusMutation.isPending,
  };
}