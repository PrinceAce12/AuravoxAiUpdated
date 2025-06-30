import { useEffect } from 'react';
import { webhookService } from '@/lib/webhookService';

interface WebhookInitializerProps {
  children: React.ReactNode;
}

const WebhookInitializer: React.FC<WebhookInitializerProps> = ({ children }) => {
  useEffect(() => {
    // Initialize webhook service when app starts
    const initializeWebhook = async () => {
      try {
        console.log('Initializing webhook service...');
        
        // Subscribe to all table changes
        webhookService.subscribeToAllTables((payload) => {
          console.log('Database change detected:', payload);
          
          // You can add custom logic here to handle specific events
          // For example, send notifications, update UI, etc.
        });
        
        console.log('Webhook service initialized successfully');
      } catch (error) {
        console.error('Failed to initialize webhook service:', error);
      }
    };

    initializeWebhook();

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up webhook service...');
      webhookService.unsubscribeFromAllTables();
    };
  }, []);

  return <>{children}</>;
};

export default WebhookInitializer; 