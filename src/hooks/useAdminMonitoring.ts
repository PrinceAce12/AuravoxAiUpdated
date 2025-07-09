import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserStats {
  totalUsers: number;
  activeUsersToday: number;
  activeUsersThisWeek: number;
  activeUsersThisMonth: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
}

export interface MessageStats {
  totalMessages: number;
  messagesToday: number;
  messagesThisWeek: number;
  messagesThisMonth: number;
  averageMessagesPerUser: number;
  averageMessagesPerConversation: number;
}

export interface ConversationStats {
  totalConversations: number;
  conversationsToday: number;
  conversationsThisWeek: number;
  conversationsThisMonth: number;
  averageConversationLength: number;
}

export interface ActivityData {
  topActiveUsers: Array<{ user_id: string; email: string; message_count: number }>;
}

export interface AdminMonitoringData {
  userStats: UserStats;
  messageStats: MessageStats;
  conversationStats: ConversationStats;
  activityData: ActivityData;
  isLoading: boolean;
  error: string | null;
}

export const useAdminMonitoring = () => {
  const [data, setData] = useState<AdminMonitoringData>({
    userStats: {
      totalUsers: 0,
      activeUsersToday: 0,
      activeUsersThisWeek: 0,
      activeUsersThisMonth: 0,
      newUsersToday: 0,
      newUsersThisWeek: 0,
      newUsersThisMonth: 0,
    },
    messageStats: {
      totalMessages: 0,
      messagesToday: 0,
      messagesThisWeek: 0,
      messagesThisMonth: 0,
      averageMessagesPerUser: 0,
      averageMessagesPerConversation: 0,
    },
    conversationStats: {
      totalConversations: 0,
      conversationsToday: 0,
      conversationsThisWeek: 0,
      conversationsThisMonth: 0,
      averageConversationLength: 0,
    },
    activityData: {
      topActiveUsers: [],
    },
    isLoading: true,
    error: null,
  });

  const fetchMonitoringData = async () => {
    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));

      // Get current date ranges
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Fetch user statistics
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, created_at');

      if (profilesError) throw profilesError;

      const totalUsers = profiles?.length || 0;
      const newUsersToday = profiles?.filter(p => new Date(p.created_at!) >= today).length || 0;
      const newUsersThisWeek = profiles?.filter(p => new Date(p.created_at!) >= weekAgo).length || 0;
      const newUsersThisMonth = profiles?.filter(p => new Date(p.created_at!) >= monthAgo).length || 0;

      // Fetch message statistics
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('id, created_at, user_id, conversation_id');

      if (messagesError) throw messagesError;

      const totalMessages = messages?.length || 0;
      const messagesToday = messages?.filter(m => new Date(m.created_at!) >= today).length || 0;
      const messagesThisWeek = messages?.filter(m => new Date(m.created_at!) >= weekAgo).length || 0;
      const messagesThisMonth = messages?.filter(m => new Date(m.created_at!) >= monthAgo).length || 0;

      // Fetch conversation statistics
      const { data: conversations, error: conversationsError } = await supabase
        .from('conversations')
        .select('id, created_at');

      if (conversationsError) throw conversationsError;

      const totalConversations = conversations?.length || 0;
      const conversationsToday = conversations?.filter(c => new Date(c.created_at!) >= today).length || 0;
      const conversationsThisWeek = conversations?.filter(c => new Date(c.created_at!) >= weekAgo).length || 0;
      const conversationsThisMonth = conversations?.filter(c => new Date(c.created_at!) >= monthAgo).length || 0;

      // Calculate active users (users who sent messages in the time period)
      const activeUsersToday = new Set(messages?.filter(m => new Date(m.created_at!) >= today).map(m => m.user_id)).size;
      const activeUsersThisWeek = new Set(messages?.filter(m => new Date(m.created_at!) >= weekAgo).map(m => m.user_id)).size;
      const activeUsersThisMonth = new Set(messages?.filter(m => new Date(m.created_at!) >= monthAgo).map(m => m.user_id)).size;

      // Calculate averages
      const averageMessagesPerUser = totalUsers > 0 ? totalMessages / totalUsers : 0;
      const averageMessagesPerConversation = totalConversations > 0 ? totalMessages / totalConversations : 0;
      const averageConversationLength = totalConversations > 0 ? totalMessages / totalConversations : 0;

      // Get top active users
      const userMessageCounts = messages?.reduce((acc, message) => {
        acc[message.user_id] = (acc[message.user_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const topActiveUsers = Object.entries(userMessageCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([user_id, count]) => {
          const profile = profiles?.find(p => p.id === user_id);
          return {
            user_id,
            email: profile?.email || 'Unknown',
            message_count: count,
          };
        });

      setData({
        userStats: {
          totalUsers,
          activeUsersToday,
          activeUsersThisWeek,
          activeUsersThisMonth,
          newUsersToday,
          newUsersThisWeek,
          newUsersThisMonth,
        },
        messageStats: {
          totalMessages,
          messagesToday,
          messagesThisWeek,
          messagesThisMonth,
          averageMessagesPerUser,
          averageMessagesPerConversation,
        },
        conversationStats: {
          totalConversations,
          conversationsToday,
          conversationsThisWeek,
          conversationsThisMonth,
          averageConversationLength,
        },
        activityData: {
          topActiveUsers,
        },
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch monitoring data',
      }));
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchMonitoringData();

    // Set up real-time subscription for messages
    const messagesSubscription = supabase
      .channel('admin-monitoring-messages')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'messages' }, 
        () => {
          // Refresh data when messages change
          fetchMonitoringData();
        }
      )
      .subscribe();

    // Set up real-time subscription for profiles
    const profilesSubscription = supabase
      .channel('admin-monitoring-profiles')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles' }, 
        () => {
          // Refresh data when profiles change
          fetchMonitoringData();
        }
      )
      .subscribe();

    // Set up real-time subscription for conversations
    const conversationsSubscription = supabase
      .channel('admin-monitoring-conversations')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'conversations' }, 
        () => {
          // Refresh data when conversations change
          fetchMonitoringData();
        }
      )
      .subscribe();

    // Auto-refresh every 30 seconds as backup
    const interval = setInterval(fetchMonitoringData, 30000);

    return () => {
      // Cleanup subscriptions
      messagesSubscription.unsubscribe();
      profilesSubscription.unsubscribe();
      conversationsSubscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return {
    ...data,
    refetch: fetchMonitoringData,
  };
}; 