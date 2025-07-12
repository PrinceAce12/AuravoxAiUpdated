import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/providers/ThemeProvider";
import WebhookInitializer from "./components/WebhookInitializer";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import NotFound from "./pages/NotFound";
import SecureAdmin from './pages/admin/SecureAdmin';
import UserSettings from './pages/UserSettings';
import AuthCallback from './pages/AuthCallback';
import QRScanner from './components/QRScanner';
import WebhookDemo from './pages/WebhookDemo';
import { VoiceTest } from './components/VoiceTest';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="auravox-ui-theme">
      <TooltipProvider>
        <WebhookInitializer>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Chat />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/admin/access" element={<QRScanner />} />
              <Route path="/admin/test" element={<AdminDashboard />} />
              <Route path="/1234567899765432134567867544/kervee/syp/lus/admin/" element={
                <ProtectedAdminRoute>
                  <SecureAdmin />
                </ProtectedAdminRoute>
              } />
              <Route path="/admin/dashboard" element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              } />
              {/* Redirect old admin route to new QR access */}
              <Route path="/admin" element={<Navigate to="/admin/access" replace />} />
              <Route path="/welcome" element={<Index />} />
              <Route path="/settings" element={<UserSettings />} />
              <Route path="/webhook-demo" element={<WebhookDemo />} />
              <Route path="/voice-test" element={<VoiceTest />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </WebhookInitializer>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
