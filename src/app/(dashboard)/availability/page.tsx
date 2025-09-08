'use client';

import { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, Settings, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AvailabilityRuleCard } from '@/components/availability/availability-rule-card';
import { AvailabilityRuleForm } from '@/components/availability/availability-rule-form';
import { DateOverrideForm } from '@/components/availability/date-override-form';
import { BufferTimeForm } from '@/components/availability/buffer-time-form';
import { useAuth } from '@/lib/auth/auth-context';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/constants';
import { DAYS_OF_WEEK } from '@/constants';
import toast from 'react-hot-toast';

interface AvailabilityRule {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  event_types?: string[];
}

interface DateOverride {
  id: string;
  date: string;
  is_available: boolean;
  start_time?: string;
  end_time?: string;
  reason?: string;
  is_active: boolean;
}

interface BufferTime {
  default_buffer_before: number;
  default_buffer_after: number;
  minimum_gap: number;
  slot_interval_minutes: number;
}

interface AvailabilityStats {
  total_rules: number;
  active_rules: number;
  total_overrides: number;
  weekly_hours: number;
  busiest_day: string;
}

export default function AvailabilityPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [showOverrideForm, setShowOverrideForm] = useState(false);
  const [editingRule, setEditingRule] = useState<AvailabilityRule | null>(null);
  const [editingOverride, setEditingOverride] = useState<DateOverride | null>(null);
  
  const [rules, setRules] = useState<AvailabilityRule[]>([]);
  const [overrides, setOverrides] = useState<DateOverride[]>([]);
  const [bufferTime, setBufferTime] = useState<BufferTime | null>(null);
  const [stats, setStats] = useState<AvailabilityStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAvailabilityData();
  }, []);

  const fetchAvailabilityData = async () => {
    try {
      setIsLoading(true);
      const [rulesRes, overridesRes, bufferRes, statsRes] = await Promise.all([
        api.get(API_ENDPOINTS.AVAILABILITY.RULES),
        api.get(API_ENDPOINTS.AVAILABILITY.OVERRIDES),
        api.get(API_ENDPOINTS.AVAILABILITY.BUFFER),
        api.get(API_ENDPOINTS.AVAILABILITY.STATS),
      ]);

      setRules(rulesRes.data.data || []);
      setOverrides(overridesRes.data.data || []);
      setBufferTime(bufferRes.data.data);
      setStats(statsRes.data.data);
    } catch (error: any) {
      toast.error(error.error || 'Failed to load availability data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRule = async (data: any) => {
    try {
      const response = await api.post(API_ENDPOINTS.AVAILABILITY.RULES, data);
      setRules([...rules, response.data.data]);
      setShowRuleForm(false);
      fetchAvailabilityData(); // Refresh stats
    } catch (error: any) {
      throw error;
    }
  };

  const handleUpdateRule = async (data: any) => {
    if (!editingRule) return;
    
    try {
      const response = await api.put(`${API_ENDPOINTS.AVAILABILITY.RULES}${editingRule.id}/`, data);
      setRules(rules.map(rule => rule.id === editingRule.id ? response.data.data : rule));
      setEditingRule(null);
      fetchAvailabilityData(); // Refresh stats
    } catch (error: any) {
      throw error;
    }
  };

  const handleDeleteRule = async (rule: AvailabilityRule) => {
    if (!confirm('Are you sure you want to delete this availability rule?')) return;
    
    try {
      await api.delete(`${API_ENDPOINTS.AVAILABILITY.RULES}${rule.id}/`);
      setRules(rules.filter(r => r.id !== rule.id));
      toast.success('Availability rule deleted');
      fetchAvailabilityData(); // Refresh stats
    } catch (error: any) {
      toast.error(error.error || 'Failed to delete rule');
    }
  };

  const handleToggleRuleActive = async (rule: AvailabilityRule) => {
    try {
      const response = await api.patch(`${API_ENDPOINTS.AVAILABILITY.RULES}${rule.id}/`, {
        is_active: !rule.is_active
      });
      setRules(rules.map(r => r.id === rule.id ? response.data.data : r));
      toast.success(`Rule ${rule.is_active ? 'disabled' : 'enabled'}`);
      fetchAvailabilityData(); // Refresh stats
    } catch (error: any) {
      toast.error(error.error || 'Failed to update rule');
    }
  };

  const handleCreateOverride = async (data: any) => {
    try {
      const response = await api.post(API_ENDPOINTS.AVAILABILITY.OVERRIDES, data);
      setOverrides([...overrides, response.data.data]);
      setShowOverrideForm(false);
      fetchAvailabilityData(); // Refresh stats
    } catch (error: any) {
      throw error;
    }
  };

  const handleUpdateBufferTime = async (data: BufferTime) => {
    try {
      const response = await api.put(API_ENDPOINTS.AVAILABILITY.BUFFER, data);
      setBufferTime(response.data.data);
      fetchAvailabilityData(); // Refresh stats
    } catch (error: any) {
      throw error;
    }
  };

  const getDayName = (dayValue: number) => {
    return DAYS_OF_WEEK.find(d => d.value === dayValue)?.label || 'Unknown';
  };

  const groupRulesByDay = () => {
    const grouped: { [key: number]: AvailabilityRule[] } = {};
    rules.forEach(rule => {
      if (!grouped[rule.day_of_week]) {
        grouped[rule.day_of_week] = [];
      }
      grouped[rule.day_of_week].push(rule);
    });
    return grouped;
  };

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="spinner w-8 h-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Availability</h1>
        <p className="text-muted-foreground mt-2">
          Manage when you're available for bookings
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rules">Weekly Rules</TabsTrigger>
          <TabsTrigger value="overrides">Date Overrides</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.active_rules}</div>
                  <p className="text-xs text-muted-foreground">
                    of {stats.total_rules} total rules
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Weekly Hours</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.weekly_hours}</div>
                  <p className="text-xs text-muted-foreground">
                    hours per week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Date Overrides</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_overrides}</div>
                  <p className="text-xs text-muted-foreground">
                    special dates configured
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Busiest Day</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.busiest_day}</div>
                  <p className="text-xs text-muted-foreground">
                    most available hours
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Schedule</CardTitle>
                <CardDescription>
                  Set your regular weekly availability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setShowRuleForm(true)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Availability Rule
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Special Dates</CardTitle>
                <CardDescription>
                  Override availability for specific dates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setShowOverrideForm(true)}
                  variant="outline"
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Date Override
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Rules Preview */}
          {rules.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Your Weekly Schedule</CardTitle>
                <CardDescription>
                  Overview of your regular availability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(groupRulesByDay()).map(([day, dayRules]) => (
                    <div key={day} className="flex items-center justify-between p-2 border rounded">
                      <span className="font-medium">{getDayName(parseInt(day))}</span>
                      <div className="flex space-x-2">
                        {dayRules.map((rule, index) => (
                          <Badge key={index} variant={rule.is_active ? 'default' : 'secondary'}>
                            {rule.start_time} - {rule.end_time}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Rules Tab */}
        <TabsContent value="rules" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Weekly Availability Rules</h2>
              <p className="text-muted-foreground">
                Set your regular weekly schedule
              </p>
            </div>
            <Button onClick={() => setShowRuleForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </div>

          {showRuleForm && (
            <AvailabilityRuleForm
              onSubmit={handleCreateRule}
              onCancel={() => setShowRuleForm(false)}
            />
          )}

          {editingRule && (
            <AvailabilityRuleForm
              initialData={editingRule}
              onSubmit={handleUpdateRule}
              onCancel={() => setEditingRule(null)}
            />
          )}

          {rules.length === 0 ? (
            <Alert>
              <AlertDescription>
                No availability rules configured. Add your first rule to start accepting bookings.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rules.map((rule) => (
                <AvailabilityRuleCard
                  key={rule.id}
                  rule={rule}
                  onEdit={setEditingRule}
                  onDelete={handleDeleteRule}
                  onToggleActive={handleToggleRuleActive}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Overrides Tab */}
        <TabsContent value="overrides" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Date Overrides</h2>
              <p className="text-muted-foreground">
                Override your regular schedule for specific dates
              </p>
            </div>
            <Button onClick={() => setShowOverrideForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Override
            </Button>
          </div>

          {showOverrideForm && (
            <DateOverrideForm
              onSubmit={handleCreateOverride}
              onCancel={() => setShowOverrideForm(false)}
            />
          )}

          {overrides.length === 0 ? (
            <Alert>
              <AlertDescription>
                No date overrides configured. Add overrides for holidays, vacations, or special availability.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {overrides.map((override) => (
                <Card key={override.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{override.date}</h3>
                        <p className="text-sm text-muted-foreground">
                          {override.is_available 
                            ? `Available ${override.start_time} - ${override.end_time}`
                            : 'Unavailable'
                          }
                        </p>
                        {override.reason && (
                          <p className="text-sm text-muted-foreground">{override.reason}</p>
                        )}
                      </div>
                      <Badge variant={override.is_available ? 'default' : 'secondary'}>
                        {override.is_available ? 'Available' : 'Blocked'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Buffer Time Settings</h2>
            <p className="text-muted-foreground">
              Configure default buffer times and scheduling intervals
            </p>
          </div>

          {bufferTime && (
            <BufferTimeForm
              initialData={bufferTime}
              onSubmit={handleUpdateBufferTime}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}