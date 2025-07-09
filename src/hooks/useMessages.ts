import { useState, useCallback } from 'react';
import { useMultipleWebhooks } from './useMultipleWebhooks';

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
  const { getCurrentWebhookUrl, isWebhookConfigured } = useMultipleWebhooks();

  // Function to clean and validate AI responses
  const cleanAIResponse = (content: string): string => {
    let cleaned = content;
    
    // Fix common PHP issues
    // If we see ?> without <?php, add the opening tag
    if (cleaned.includes('?>') && !cleaned.includes('<?php') && !cleaned.includes('<?=')) {
      // Find code blocks and fix them
      cleaned = cleaned.replace(
        /```(\w+)?\n?([\s\S]*?)```/g,
        (match, language, code) => {
          if ((language === 'php' || language === '') && code.includes('?>') && !code.includes('<?php') && !code.includes('<?=')) {
            code = '<?php\n' + code;
          }
          return `\`\`\`${language || 'php'}\n${code}\n\`\`\``;
        }
      );
    }
    
    // Ensure code blocks are properly closed
    const codeBlockCount = (cleaned.match(/```/g) || []).length;
    if (codeBlockCount % 2 !== 0) {
      // Add missing closing ```
      cleaned += '\n```';
    }
    
    return cleaned;
  };

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
      const webhookUrl = getCurrentWebhookUrl();
      console.log('Webhook URL:', webhookUrl);
      console.log('Is webhook configured:', isWebhookConfigured());
      
      if (webhookUrl && isWebhookConfigured()) {
        console.log('Calling webhook with message:', content);
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

        console.log('Webhook response status:', response.status);
        console.log('Webhook response ok:', response.ok);

        if (response.ok) {
          const data = await response.json();
          console.log('Webhook response data:', data);
          
          const aiResponseContent = data.output || data.response || data.message || "I received your message but couldn't generate a proper response.";
          console.log('AI response content:', aiResponseContent);
          
          // Clean the AI response before displaying
          const cleanedContent = cleanAIResponse(aiResponseContent);
          
          const aiResponse: Message = {
            id: `ai-${Date.now()}`,
            content: cleanedContent,
            role: 'assistant',
            created_at: new Date().toISOString()
          };
          console.log('AI response object:', aiResponse);
          
          setMessages(prev => {
            console.log('Previous messages:', prev);
            const newMessages = [...prev, aiResponse];
            console.log('New messages array:', newMessages);
            return newMessages;
          });
          
          // Save AI response to database if callback provided
          if (onSaveMessage) {
            try {
              await onSaveMessage(aiResponseContent, 'assistant');
            } catch (error) {
              console.error('Error saving AI message:', error);
            }
          }
        } else {
          console.error('Webhook returned error status:', response.status);
          throw new Error(`Webhook returned status: ${response.status}`);
        }
      } else {
        console.log('No webhook configured, using fallback response');
        // Fallback to mock response if no webhook is configured
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        const mockResponseContent = generateMockResponse(content);
        const cleanedContent = cleanAIResponse(mockResponseContent);
        const aiResponse: Message = {
          id: `ai-${Date.now()}`,
          content: cleanedContent,
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
      const cleanedContent = cleanAIResponse(errorMessageContent);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: cleanedContent,
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
  }, [onSaveMessage, getCurrentWebhookUrl, isWebhookConfigured]);

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

Here's a PHP example with proper tags:

\`\`\`php
<?php
function greetUser($name) {
    return "Hello, " . $name . "!";
}

echo greetUser("World");
?>
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

And here's a PHP example:

\`\`\`php
<?php
function calculateFibonacci($n) {
    if ($n <= 1) {
        return $n;
    }
    return calculateFibonacci($n - 1) + calculateFibonacci($n - 2);
}

// Test the function
for ($i = 0; $i < 10; $i++) {
    echo "F($i) = " . calculateFibonacci($i) . "\n";
}
?>
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

And here's a PHP equivalent:

\`\`\`php
<?php
class User {
    public string $id;
    public string $name;
    public string $email;
}

class UserService {
    public function getUser(string $id): ?User {
        try {
            $response = file_get_contents("/api/users/$id");
            if ($response !== false) {
                $data = json_decode($response, true);
                $user = new User();
                $user->id = $data['id'];
                $user->name = $data['name'];
                $user->email = $data['email'];
                return $user;
            }
            return null;
        } catch (Exception $error) {
            error_log('Error fetching user: ' . $error->getMessage());
            return null;
        }
    }
}
?>
\`\`\`

What's your experience level with this? That would help me tailor my advice to be most useful for you.

*For more advanced AI assistance, configure the webhook in the admin panel.*`
  ];

  return responses[Math.floor(Math.random() * responses.length)];
};
