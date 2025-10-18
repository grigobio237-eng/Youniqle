'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Activity, 
  Database, 
  HardDrive,
  Cpu,
  MemoryStick,
  Globe,
  Users,
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface SecurityEvent {
  timestamp: string;
  type: string;
  ip: string;
  userAgent: string;
  details: any;
}

interface PerformanceMetric {
  totalRequests: number;
  averageResponseTime: number;
  errorRate: number;
  slowQueries: number;
  cacheHitRate: number;
  topSlowQueries: Array<{
    name: string;
    avgDuration: number;
    count: number;
  }>;
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  issues: string[];
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  uptime: number;
  cache: {
    connected: boolean;
    memory: string;
    keys: number;
  };
  database: {
    connected: boolean;
    collections: number;
    dataSize: number;
  };
}

interface DashboardData {
  timestamp: string;
  systemHealth: SystemHealth;
  security: {
    stats: {
      totalEvents: number;
      violations: number;
      rateLimits: number;
      invalidAuth: number;
      suspiciousActivity: number;
    };
    recentEvents: SecurityEvent[];
    topSuspiciousIPs: Array<{
      ip: string;
      count: number;
      types: string[];
    }>;
    alerts: {
      critical: number;
      high: number;
      total: number;
    };
  };
  performance: {
    metrics: PerformanceMetric;
    alerts: Array<{
      id: string;
      timestamp: string;
      type: string;
      severity: string;
      message: string;
    }>;
    systemHealth: SystemHealth;
  };
  cache: any;
  database: any;
}

export default function SecurityDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/security/dashboard');
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const data = await response.json();
      setDashboardData(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // 30초마다 데이터 새로고침
    const interval = setInterval(fetchDashboardData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="m-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button onClick={fetchDashboardData} className="ml-2" size="sm">
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-4">
        <p>No data available</p>
      </div>
    );
  }

  const { systemHealth, security, performance, cache, database } = dashboardData;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security & Performance Dashboard</h1>
          <p className="text-gray-600">
            Real-time monitoring of system security and performance
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge className={getStatusColor(systemHealth.status)}>
            {getStatusIcon(systemHealth.status)}
            <span className="ml-1 capitalize">{systemHealth.status}</span>
          </Badge>
          {lastUpdated && (
            <p className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
          <Button onClick={fetchDashboardData} size="sm">
            Refresh
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            {getStatusIcon(systemHealth.status)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{systemHealth.status}</div>
            <p className="text-xs text-gray-600">
              {systemHealth.issues.length} issues detected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <MemoryStick className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemHealth.memory.percentage.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-600">
              {formatBytes(systemHealth.memory.used)} / {formatBytes(systemHealth.memory.total)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Clock className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatUptime(systemHealth.uptime)}
            </div>
            <p className="text-xs text-gray-600">
              System uptime
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Status</CardTitle>
            <HardDrive className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cache.connected ? 'Connected' : 'Disconnected'}
            </div>
            <p className="text-xs text-gray-600">
              {cache.keys} keys, {cache.memory}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="security" className="space-y-4">
        <TabsList>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security Violations</CardTitle>
                <Shield className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{security.stats.violations}</div>
                <p className="text-xs text-gray-600">Last 24 hours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rate Limits</CardTitle>
                <Activity className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{security.stats.rateLimits}</div>
                <p className="text-xs text-gray-600">Rate limit hits</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Invalid Auth</CardTitle>
                <XCircle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{security.stats.invalidAuth}</div>
                <p className="text-xs text-gray-600">Failed attempts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Suspicious Activity</CardTitle>
                <AlertTriangle className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{security.stats.suspiciousActivity}</div>
                <p className="text-xs text-gray-600">Suspicious events</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Security Events</CardTitle>
                <CardDescription>Latest security events and violations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {security.recentEvents.map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{event.type}</p>
                        <p className="text-sm text-gray-600">{event.ip}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{new Date(event.timestamp).toLocaleTimeString()}</p>
                        <Badge variant="outline">{event.type}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Suspicious IPs</CardTitle>
                <CardDescription>IPs with highest security event counts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {security.topSuspiciousIPs.map((ip, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{ip.ip}</p>
                        <p className="text-sm text-gray-600">{ip.types.join(', ')}</p>
                      </div>
                      <Badge variant="destructive">{ip.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <Activity className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performance.metrics.totalRequests.toLocaleString()}</div>
                <p className="text-xs text-gray-600">Last hour</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <Clock className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performance.metrics.averageResponseTime.toFixed(0)}ms</div>
                <p className="text-xs text-gray-600">Average response time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(performance.metrics.errorRate * 100).toFixed(1)}%</div>
                <p className="text-xs text-gray-600">Error percentage</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
                <HardDrive className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(performance.metrics.cacheHitRate * 100).toFixed(1)}%</div>
                <p className="text-xs text-gray-600">Cache efficiency</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Slow Queries</CardTitle>
                <CardDescription>Queries with highest average duration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {performance.metrics.topSlowQueries.map((query, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1">
                        <p className="font-medium text-sm truncate">{query.name}</p>
                        <p className="text-xs text-gray-600">{query.count} executions</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{query.avgDuration.toFixed(0)}ms</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Alerts</CardTitle>
                <CardDescription>Recent performance issues and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {performance.alerts.map((alert, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium text-sm">{alert.message}</p>
                        <p className="text-xs text-gray-600">{alert.type}</p>
                      </div>
                      <Badge 
                        variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Database Status</CardTitle>
                <CardDescription>Database connection and performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Connection Status</span>
                    <Badge className={database.connection.connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {database.connection.connected ? 'Connected' : 'Disconnected'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Collections</span>
                    <span className="font-medium">{database.database.collections}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Data Size</span>
                    <span className="font-medium">{formatBytes(database.database.dataSize)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Storage Size</span>
                    <span className="font-medium">{formatBytes(database.database.storageSize)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cache Status</CardTitle>
                <CardDescription>Redis cache performance and statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Connection Status</span>
                    <Badge className={cache.connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {cache.connected ? 'Connected' : 'Disconnected'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Memory Usage</span>
                    <span className="font-medium">{cache.memory}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total Keys</span>
                    <span className="font-medium">{cache.keys.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Hit Rate</span>
                    <span className="font-medium">{cache.hits} / {cache.hits + cache.misses}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}













