import { useState, useCallback } from 'react';
import { useWebhookSettings } from './useWebhookSettings';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

interface SaveMessageResult {
  id: string;
  content: string;
  role: string;
  conversation_id: string;
  user_id: string;
  created_at: string | null;
}

export const useMessages = (onSaveMessage?: (content: string, role: 'user' | 'assistant') => Promise<SaveMessageResult | null>) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { getWebhookUrl, isWebhookConfigured } = useWebhookSettings();

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
      // Get the webhook URL from database
      const webhookUrl = getWebhookUrl();
      
      if (webhookUrl && isWebhookConfigured()) {
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
  }, [onSaveMessage, getWebhookUrl, isWebhookConfigured]);

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

Here's a simple example:

\`\`\`javascript
function greetUser(name) {
  return \`Hello, \${name}!\`;
}

console.log(greetUser('World'));
\`\`\`

And here's a React component example:

\`\`\`jsx
import React from 'react';

const Greeting = ({ name }) => {
  return <h1>Hello, {name}!</h1>;
};

export default Greeting;
\`\`\`

Would you like me to dive deeper into any specific aspect? I can provide more detailed explanations, code examples, or practical tips based on what you're working on.

*Note: This is a fallback response. For more personalized assistance, please configure the webhook in the admin panel to connect your preferred AI service.*`,

    `Thanks for asking about ${userMessage}! This is actually a really interesting area.

Let me break this down for you:

**What you should know:**
- The fundamentals are crucial for success
- There are several approaches you could take
- Context matters a lot in this situation

Here's a practical example:

\`\`\`python
def calculate_fibonacci(n):
    if n <= 1:
        return n
    return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)

# Test the function
for i in range(10):
    print(f"F({i}) = {calculate_fibonacci(i)}")
\`\`\`

**My recommendation:**
Start with the basics and build up from there. Don't try to tackle everything at once - focus on one aspect at a time.

What specific part would you like to explore first? I'm here to help guide you through it step by step.

*Configure your webhook in the admin panel for more advanced AI capabilities.*`,

    `That's a really good question about ${userMessage}! Let me share what I know.

**The Big Picture:**
This topic touches on several important concepts that work together.

**What I'd suggest:**
Focus on understanding the core principles first. Once you have those down, the details will make more sense.

**Common approaches:**
- Start simple and add complexity as needed
- Learn from others who've solved similar problems
- Don't be afraid to experiment and iterate

Here's a TypeScript example:

\`\`\`typescript
interface User {
  id: string;
  name: string;
  email: string;
}

class UserService {
  async getUser(id: string): Promise<User | null> {
    try {
      const response = await fetch(\`/api/users/\${id}\`);
      return response.ok ? await response.json() : null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }
}
\`\`\`

What's your experience level with this? That would help me tailor my advice to be most useful for you.

*For more advanced AI assistance, configure the webhook in the admin panel.*`
  ];

  return responses[Math.floor(Math.random() * responses.length)];
};
