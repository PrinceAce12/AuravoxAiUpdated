import { useState, useCallback } from 'react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

export const useMessages = (onSaveMessage?: (content: string, role: 'user' | 'assistant') => Promise<any>) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content,
      role: 'user',
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Save user message to database if callback provided
    if (onSaveMessage) {
      try {
        await onSaveMessage(content, 'user');
      } catch (error) {
        console.error('Error saving user message:', error);
      }
    }
    
    setIsLoading(true);

    try {
      // Get the webhook URL from localStorage
      const webhookUrl = localStorage.getItem('webhook_url');
      
      if (webhookUrl) {
        // Try to call the actual webhook
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: content,
            timestamp: new Date().toISOString(),
            user_id: 'anonymous' // You can replace this with actual user ID when auth is implemented
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const aiResponseContent = data.ai_response || data.response || data.message || "I received your message but couldn't generate a proper response.";
          const aiResponse: Message = {
            id: `ai-${Date.now()}`,
            content: aiResponseContent,
            role: 'assistant',
            created_at: new Date().toISOString()
          };
          setMessages(prev => [...prev, aiResponse]);
          
          // Save AI response to database if callback provided
          if (onSaveMessage) {
            try {
              await onSaveMessage(aiResponseContent, 'assistant');
            } catch (error) {
              console.error('Error saving AI message:', error);
            }
          }
        } else {
          throw new Error(`Webhook returned status: ${response.status}`);
        }
      } else {
        // Fallback to mock response if no webhook is configured
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        const mockResponseContent = generateMockResponse(content);
        const aiResponse: Message = {
          id: `ai-${Date.now()}`,
          content: mockResponseContent,
          role: 'assistant',
          created_at: new Date().toISOString()
        };

        setMessages(prev => [...prev, aiResponse]);
        
        // Save AI response to database if callback provided
        if (onSaveMessage) {
          try {
            await onSaveMessage(mockResponseContent, 'assistant');
          } catch (error) {
            console.error('Error saving AI message:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessageContent = "I'm sorry, I'm having trouble responding right now. Please check your internet connection or try again later.";
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: errorMessageContent,
        role: 'assistant',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      // Save error message to database if callback provided
      if (onSaveMessage) {
        try {
          await onSaveMessage(errorMessageContent, 'assistant');
        } catch (error) {
          console.error('Error saving error message:', error);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [onSaveMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const setMessagesDirectly = useCallback((newMessages: Message[]) => {
    setMessages(newMessages);
  }, []);

  const addAIMessage = useCallback((content: string) => {
    const aiMessage: Message = {
      id: `ai-${Date.now()}`,
      content,
      role: 'assistant',
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, aiMessage]);
  }, []);

  return {
    messages,
    addMessage,
    clearMessages,
    setMessagesDirectly,
    addAIMessage,
    isLoading
  };
};

// Mock response generator for demonstration (fallback)
const generateMockResponse = (userMessage: string): string => {
  const responses = [
    `I'd be happy to help you with that! ${userMessage} is a great topic to explore.

Here are some key insights:

• **Understanding the basics**: It's important to start with a solid foundation
• **Best practices**: Following established patterns can save time and prevent issues
• **Common pitfalls**: Being aware of potential challenges helps avoid them

Would you like me to dive deeper into any specific aspect? I can provide more detailed explanations, code examples, or practical tips based on what you're working on.

*Note: This is a fallback response. For more personalized assistance, please configure the webhook in the admin panel to connect your preferred AI service.*`,

    `Thanks for asking about ${userMessage}! This is actually a really interesting area.

Let me break this down for you:

**What you should know:**
- The fundamentals are crucial for success
- There are several approaches you could take
- Context matters a lot in this situation

**My recommendation:**
Start with the basics and build up from there. Don't try to tackle everything at once - focus on one aspect at a time.

What specific part would you like to explore first? I'm here to help guide you through it step by step.

*Configure your webhook in the admin panel for more advanced AI capabilities.*`,

    `Great question! ${userMessage} is something many people struggle with.

Here's my take on it:

**The Challenge:**
This can be complex because there are multiple factors to consider.

**The Solution:**
I'd suggest starting with a simple approach and iterating from there. Sometimes the best solution is the one you can implement quickly and improve over time.

**Next Steps:**
1. Identify your specific needs
2. Research the options available
3. Start with a minimal viable solution
4. Iterate and improve

What's your current situation? That would help me give you more targeted advice.

*For more sophisticated AI assistance, please set up the webhook in the admin panel.*`,

    `I understand you're looking into ${userMessage}. This is definitely worth exploring!

**Key Considerations:**
- Every situation is unique, so context is important
- There's usually more than one way to approach this
- The best solution depends on your specific requirements

**My thoughts:**
Without knowing more about your specific case, I'd recommend starting with the most straightforward approach. You can always optimize later once you have a working solution.

Could you tell me more about what you're trying to achieve? That would help me provide more specific guidance.

*Set up the webhook in the admin panel for enhanced AI capabilities and more detailed responses.*`,

    `That's a really good question about ${userMessage}! Let me share what I know.

**The Big Picture:**
This topic touches on several important concepts that work together.

**What I'd suggest:**
Focus on understanding the core principles first. Once you have those down, the details will make more sense.

**Common approaches:**
- Start simple and add complexity as needed
- Learn from others who've solved similar problems
- Don't be afraid to experiment and iterate

What's your experience level with this? That would help me tailor my advice to be most useful for you.

*For more advanced AI assistance, configure the webhook in the admin panel.*`
  ];

  return responses[Math.floor(Math.random() * responses.length)];
};
