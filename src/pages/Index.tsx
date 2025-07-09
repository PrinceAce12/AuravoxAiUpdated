import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Sparkles, Code, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const features = [
    {
      icon: MessageCircle,
      title: "Intelligent Conversations",
      description: "Engage in natural, context-aware conversations with advanced AI"
    },
    {
      icon: Code,
      title: "Code Generation",
      description: "Generate, explain, and debug code in multiple programming languages"
    },
    {
      icon: Sparkles,
      title: "Creative Writing",
      description: "Get help with creative writing, content creation, and brainstorming"
    },
    {
      icon: Zap,
      title: "Instant Responses",
      description: "Lightning-fast responses powered by cutting-edge AI technology"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">
      <div className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <MessageCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-4">
              Welcome to <span className="gradient-text">Q0</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
              Your intelligent AI assistant powered by advanced language models. 
              Experience the future of conversational AI with beautiful glassmorphism design.
            </p>
            <Link to="/chat">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                Start Chatting
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="glass-card p-6 rounded-2xl hover:scale-105 transition-all duration-200 hover-lift"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Preview Section */}
        <div className="glass-card rounded-3xl p-8 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
              Experience the Interface
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Built with modern glassmorphism design inspired by bolt.new
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <div className="glass-card p-6 rounded-2xl">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="glass-message-bubble assistant-bubble">
                    <p className="text-sm">
                      👋 Hello! I'm Q0, your intelligent assistant. 
                      I can help you with coding, writing, analysis, and much more. 
                      What would you like to explore today?
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3">
                <div className="flex-1 text-right">
                  <div className="glass-message-bubble user-bubble inline-block">
                    <p className="text-sm">
                      Can you help me build a React component?
                    </p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">You</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="glass-card inline-block px-8 py-6 rounded-2xl">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Ready to get started?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Join thousands of users already using Q0
            </p>
            <Link to="/chat">
              <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-2 rounded-lg">
                Launch Chat Interface
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
