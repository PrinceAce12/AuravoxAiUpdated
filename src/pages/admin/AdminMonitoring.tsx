import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  MessageSquare, 
  MessageCircle, 
  TrendingUp, 
  Activity, 
  RefreshCw, 
  UserCheck,
  UserPlus,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useAdminMonitoring } from '@/hooks/useAdminMonitoring';

const AdminMonitoring = () => {
  console.log('AdminMonitoring component rendering');
  
  const {
    userStats,
    messageStats,
    conversationStats,
    activityData,
    isLoading,
    error,
    refetch
  } = useAdminMonitoring();

  console.log('AdminMonitoring data:', { userStats, messageStats, conversationStats, activityData, isLoading, error });

  const StatCard = ({ 
    title, 
    value, 
    description, 
    icon: Icon, 
    trend, 
    trendValue,
    color = "blue" 
  }: {
    title: string;
    value: string | number;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    color?: string;
  }) => (
    <Card className="glass-card border-0">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{description}</p>
            {trend && trendValue && (
              <div className="flex items-center mt-2">
                {trend === 'up' ? (
                  <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                ) : trend === 'down' ? (
                  <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                ) : null}
                <span className={`text-xs ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                  {trendValue}
                </span>
              </div>
            )}
          </div>
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-r from-${color}-500 to-${color}-600 flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    console.log('AdminMonitoring showing loading state');
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">
        <div className="container mx-auto p-6 max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
              <span className="text-gray-600 dark:text-gray-400">Loading monitoring data...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.log('AdminMonitoring showing error state:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">
        <div className="container mx-auto p-6 max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <Button onClick={refetch} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log('AdminMonitoring rendering main content');

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">System Monitoring</h1>
            <p className="text-gray-600 dark:text-gray-300">Real-time analytics and user activity tracking</p>
          </div>
          <Button onClick={refetch} variant="outline" className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
        </div>

        {/* User Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={userStats.totalUsers}
            description="Registered users"
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Active Today"
            value={userStats.activeUsersToday}
            description="Users active today"
            icon={UserCheck}
            color="green"
          />
          <StatCard
            title="New This Week"
            value={userStats.newUsersThisWeek}
            description="New registrations"
            icon={UserPlus}
            color="purple"
          />
          <StatCard
            title="Active This Month"
            value={userStats.activeUsersThisMonth}
            description="Monthly active users"
            icon={Activity}
            color="orange"
          />
        </div>

        {/* Message & Conversation Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Messages"
            value={messageStats.totalMessages}
            description="All time messages"
            icon={MessageSquare}
            color="indigo"
          />
          <StatCard
            title="Messages Today"
            value={messageStats.messagesToday}
            description="Messages sent today"
            icon={MessageSquare}
            color="cyan"
          />
          <StatCard
            title="Total Conversations"
            value={conversationStats.totalConversations}
            description="All time conversations"
            icon={MessageCircle}
            color="pink"
          />
          <StatCard
            title="Avg Messages/User"
            value={messageStats.averageMessagesPerUser.toFixed(1)}
            description="Average per user"
            icon={TrendingUp}
            color="emerald"
          />
        </div>

        {/* Top Active Users */}
        <Card className="glass-card border-0 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Top Active Users</span>
            </CardTitle>
            <CardDescription>Users with the most message activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activityData.topActiveUsers.map((user, index) => (
                <div key={user.user_id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{user.email}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">User ID: {user.user_id.slice(0, 8)}...</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">{user.message_count}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">messages</p>
                  </div>
                </div>
              ))}
              {activityData.topActiveUsers.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No user activity data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-lg">Weekly Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Active Users</span>
                <span className="font-semibold">{userStats.activeUsersThisWeek}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">New Users</span>
                <span className="font-semibold">{userStats.newUsersThisWeek}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Messages</span>
                <span className="font-semibold">{messageStats.messagesThisWeek}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Conversations</span>
                <span className="font-semibold">{conversationStats.conversationsThisWeek}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-lg">Monthly Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Active Users</span>
                <span className="font-semibold">{userStats.activeUsersThisMonth}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">New Users</span>
                <span className="font-semibold">{userStats.newUsersThisMonth}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Messages</span>
                <span className="font-semibold">{messageStats.messagesThisMonth}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Conversations</span>
                <span className="font-semibold">{conversationStats.conversationsThisMonth}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-lg">Averages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Messages/User</span>
                <span className="font-semibold">{messageStats.averageMessagesPerUser.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Messages/Conversation</span>
                <span className="font-semibold">{messageStats.averageMessagesPerConversation.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Conversation Length</span>
                <span className="font-semibold">{conversationStats.averageConversationLength.toFixed(1)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminMonitoring; 