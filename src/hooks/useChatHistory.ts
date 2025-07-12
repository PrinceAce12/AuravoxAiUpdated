import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
  conversation_id: string;
  user_id: string;
}

export const useChatHistory = (userId?: string) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load conversations for the user
  const loadConversations = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Create a new conversation
  const createConversation = useCallback(async (title: string = 'New Chat') => {
    if (!userId) return null;
    
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          title,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      
      setConversations(prev => [data, ...prev]);
      setCurrentConversationId(data.id);
      return data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  }, [userId]);

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: string): Promise<ChatMessage[]> => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []).map(msg => ({
        ...msg,
        role: msg.role as 'user' | 'assistant'
      }));
    } catch (error) {
      console.error('Error loading messages:', error);
      return [];
    }
  }, []);

  // Save a message to the current conversation
  const saveMessage = useCallback(async (content: string, role: 'user' | 'assistant') => {
    if (!userId) return null;
    
    let conversationId = currentConversationId;
    
    // If no current conversation, create one
    if (!conversationId) {
      const conversation = await createConversation(content.substring(0, 50) + '...');
      if (conversation) {
        conversationId = conversation.id;
        setCurrentConversationId(conversation.id);
      } else {
        console.error('Failed to create conversation for message');
        return null;
      }
    }
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          content,
          role,
          conversation_id: conversationId,
          user_id: userId,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving message:', error);
      return null;
    }
  }, [currentConversationId, userId, createConversation, setCurrentConversationId]);

  // Update conversation title
  const updateConversationTitle = useCallback(async (conversationId: string, title: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ 
          title,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      if (error) throw error;
      
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, title, updated_at: new Date().toISOString() }
            : conv
        )
      );
    } catch (error) {
      console.error('Error updating conversation title:', error);
    }
  }, []);

  // Delete a conversation
  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      // Delete messages first (due to foreign key constraint)
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId);

      if (messagesError) throw messagesError;

      // Delete conversation
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;
      
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      
      // If we deleted the current conversation, clear it
      if (currentConversationId === conversationId) {
        setCurrentConversationId(null);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  }, [currentConversationId]);

  // Load conversations when userId changes
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return {
    conversations,
    currentConversationId,
    isLoading,
    createConversation,
    loadMessages,
    saveMessage,
    updateConversationTitle,
    deleteConversation,
    setCurrentConversationId,
    loadConversations,
    setConversations,
  };
}; 