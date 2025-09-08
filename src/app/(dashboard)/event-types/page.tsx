'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EventTypeCard } from '@/components/events/event-type-card';
import { EventTypeForm } from '@/components/events/event-type-form';
import { useAuth } from '@/lib/auth/auth-context';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/constants';
import { type EventTypeData, type CustomQuestionData } from '@/lib/validations/events';
import toast from 'react-hot-toast';

interface EventType {
  id: string;
  name: string;
  event_type_slug: string;
  description?: string;
  duration: number;
  max_attendees: number;
  location_type: string;
  is_active: boolean;
  is_private: boolean;
  booking_count?: number;
  success_rate?: number;
  custom_questions?: CustomQuestionData[];
}

interface EventTypeStats {
  total_event_types: number;
  active_event_types: number;
  total_bookings: number;
  average_success_rate: number;
}

export default function EventTypesPage() {
  const { user } = useAuth();
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [stats, setStats] = useState<EventTypeStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEventType, setEditingEventType] = useState<EventType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchEventTypes();
    fetchStats();
  }, []);

  const fetchEventTypes = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(API_ENDPOINTS.EVENT_TYPES.LIST);
      setEventTypes(response.data.data || []);
    } catch (error: any) {
      toast.error(error.error || 'Failed to load event types');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // This would be a separate stats endpoint
      // For now, calculate from event types data
      const response = await api.get(API_ENDPOINTS.EVENT_TYPES.LIST);
      const eventTypes = response.data.data || [];
      
      const stats = {
        total_event_types: eventTypes.length,
        active_event_types: eventTypes.filter((et: EventType) => et.is_active).length,
        total_bookings: eventTypes.reduce((sum: number, et: EventType) => sum + (et.booking_count || 0), 0),
        average_success_rate: eventTypes.length > 0 
          ? Math.round(eventTypes.reduce((sum: number, et: EventType) => sum + (et.success_rate || 0), 0) / eventTypes.length)
          : 0,
      };
      
      setStats(stats);
    } catch (error) {
      // Stats are optional, don't show error
    }
  };

  const handleCreateEventType = async (data: EventTypeData, questions: CustomQuestionData[]) => {
    try {
      const payload = {
        ...data,
        custom_questions: questions,
      };
      
      const response = await api.post(API_ENDPOINTS.EVENT_TYPES.LIST, payload);
      setEventTypes([...eventTypes, response.data.data]);
      setShowForm(false);
      fetchStats();
    } catch (error: any) {
      throw error;
    }
  };

  const handleUpdateEventType = async (data: EventTypeData, questions: CustomQuestionData[]) => {
    if (!editingEventType) return;
    
    try {
      const payload = {
        ...data,
        custom_questions: questions,
      };
      
      const response = await api.put(
        API_ENDPOINTS.EVENT_TYPES.DETAIL(editingEventType.id), 
        payload
      );
      
      setEventTypes(eventTypes.map(et => 
        et.id === editingEventType.id ? response.data.data : et
      ));
      setEditingEventType(null);
      fetchStats();
    } catch (error: any) {
      throw error;
    }
  };

  const handleDeleteEventType = async (eventType: EventType) => {
    if (!confirm(`Are you sure you want to delete "${eventType.name}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await api.delete(API_ENDPOINTS.EVENT_TYPES.DETAIL(eventType.id));
      setEventTypes(eventTypes.filter(et => et.id !== eventType.id));
      toast.success('Event type deleted successfully');
      fetchStats();
    } catch (error: any) {
      toast.error(error.error || 'Failed to delete event type');
    }
  };

  const handleToggleActive = async (eventType: EventType) => {
    try {
      const response = await api.patch(
        API_ENDPOINTS.EVENT_TYPES.DETAIL(eventType.id),
        { is_active: !eventType.is_active }
      );
      
      setEventTypes(eventTypes.map(et => 
        et.id === eventType.id ? response.data.data : et
      ));
      
      toast.success(`Event type ${eventType.is_active ? 'disabled' : 'enabled'}`);
      fetchStats();
    } catch (error: any) {
      toast.error(error.error || 'Failed to update event type');
    }
  };

  const handleDuplicateEventType = async (eventType: EventType) => {
    try {
      const duplicateData = {
        ...eventType,
        name: `${eventType.name} (Copy)`,
        event_type_slug: `${eventType.event_type_slug}-copy`,
        is_active: false, // Start duplicates as inactive
      };
      
      // Remove fields that shouldn't be duplicated
      delete (duplicateData as any).id;
      delete (duplicateData as any).booking_count;
      delete (duplicateData as any).success_rate;
      
      const response = await api.post(API_ENDPOINTS.EVENT_TYPES.LIST, duplicateData);
      setEventTypes([...eventTypes, response.data.data]);
      toast.success('Event type duplicated successfully');
      fetchStats();
    } catch (error: any) {
      toast.error(error.error || 'Failed to duplicate event type');
    }
  };

  // Filter event types
  const filteredEventTypes = eventTypes.filter(eventType => {
    const matchesSearch = eventType.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         eventType.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && eventType.is_active) ||
                         (statusFilter === 'inactive' && !eventType.is_active) ||
                         (statusFilter === 'private' && eventType.is_private);
    
    return matchesSearch && matchesStatus;
  });

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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Event Types</h1>
            <p className="text-muted-foreground mt-2">
              Create and manage your bookable events
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Event Type
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Event Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_event_types}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.active_event_types}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_bookings}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.average_success_rate}%</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search event types..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-8">
          <EventTypeForm
            onSubmit={handleCreateEventType}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {editingEventType && (
        <div className="mb-8">
          <EventTypeForm
            initialData={editingEventType}
            initialQuestions={editingEventType.custom_questions || []}
            onSubmit={handleUpdateEventType}
            onCancel={() => setEditingEventType(null)}
          />
        </div>
      )}

      {/* Event Types List */}
      {filteredEventTypes.length === 0 ? (
        <Alert>
          <AlertDescription>
            {eventTypes.length === 0 
              ? "No event types created yet. Create your first event type to start accepting bookings."
              : "No event types match your current filters."
            }
          </AlertDescription>
        </Alert>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {filteredEventTypes.map((eventType) => (
            <EventTypeCard
              key={eventType.id}
              eventType={eventType}
              organizerSlug={user?.profile?.organizer_slug || 'user'}
              onEdit={setEditingEventType}
              onDelete={handleDeleteEventType}
              onToggleActive={handleToggleActive}
              onDuplicate={handleDuplicateEventType}
            />
          ))}
        </div>
      )}
    </div>
  );
}