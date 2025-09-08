'use client';

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, List, Grid, Plus, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookingCard } from '@/components/bookings/booking-card';
import { BookingDetailsModal } from '@/components/bookings/booking-details-modal';
import { BookingFilters } from '@/components/bookings/booking-filters';
import { useAuth } from '@/lib/auth/auth-context';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/constants';
import { type BookingFilterData } from '@/lib/validations/bookings';
import { Booking } from '@/types';
import toast from 'react-hot-toast';

interface BookingStats {
  total_bookings: number;
  confirmed_bookings: number;
  cancelled_bookings: number;
  completed_bookings: number;
  upcoming_bookings: number;
  success_rate: number;
}

export default function BookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [eventTypes, setEventTypes] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [filters, setFilters] = useState<BookingFilterData>({
    status: 'all',
    start_date: undefined,
    end_date: undefined,
    event_type: undefined,
    search: undefined,
  });

  useEffect(() => {
    fetchBookings();
    fetchEventTypes();
    fetchStats();
  }, [filters]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      
      const params = new URLSearchParams();
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.event_type) params.append('event_type', filters.event_type);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`${API_ENDPOINTS.BOOKINGS.LIST}?${params}`);
      setBookings(response.data.data || []);
    } catch (error: any) {
      toast.error(error.error || 'Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEventTypes = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.EVENT_TYPES.LIST);
      setEventTypes(response.data.data || []);
    } catch (error: any) {
      console.error('Failed to load event types:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.BOOKINGS.ANALYTICS);
      setStats(response.data.data);
    } catch (error: any) {
      console.error('Failed to load booking stats:', error);
    }
  };

  const handleBookingUpdate = (updatedBooking: Booking) => {
    setBookings(bookings.map(b => b.id === updatedBooking.id ? updatedBooking : b));
    setSelectedBooking(updatedBooking);
    fetchStats(); // Refresh stats
  };

  const handleCancelBooking = async (booking: Booking) => {
    const reason = prompt('Please provide a reason for cancellation (optional):');
    
    try {
      await api.patch(API_ENDPOINTS.BOOKINGS.DETAIL(booking.id), {
        status: 'cancelled',
        cancellation_reason: reason || 'Cancelled by organizer',
        cancelled_by: 'organizer',
      });
      
      const updatedBooking = {
        ...booking,
        status: 'cancelled' as const,
        cancellation_reason: reason || 'Cancelled by organizer',
        cancelled_by: 'organizer' as const,
        cancelled_at: new Date().toISOString(),
      };
      
      handleBookingUpdate(updatedBooking);
      toast.success('Booking cancelled successfully');
    } catch (error: any) {
      toast.error(error.error || 'Failed to cancel booking');
    }
  };

  const handleRescheduleBooking = async (booking: Booking) => {
    // This would open a reschedule modal with time slot picker
    toast.info('Reschedule functionality coming soon');
  };

  const handleMarkComplete = async (booking: Booking) => {
    try {
      await api.patch(API_ENDPOINTS.BOOKINGS.DETAIL(booking.id), {
        status: 'completed',
      });
      
      const updatedBooking = { ...booking, status: 'completed' as const };
      handleBookingUpdate(updatedBooking);
      toast.success('Booking marked as completed');
    } catch (error: any) {
      toast.error(error.error || 'Failed to update booking');
    }
  };

  const handleMarkNoShow = async (booking: Booking) => {
    try {
      await api.patch(API_ENDPOINTS.BOOKINGS.DETAIL(booking.id), {
        status: 'no_show',
      });
      
      const updatedBooking = { ...booking, status: 'no_show' as const };
      handleBookingUpdate(updatedBooking);
      toast.success('Booking marked as no show');
    } catch (error: any) {
      toast.error(error.error || 'Failed to update booking');
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.event_type) params.append('event_type', filters.event_type);
      if (filters.search) params.append('search', filters.search);

      await api.download(`${API_ENDPOINTS.BOOKINGS.LIST}export/?${params}`, 'bookings.csv');
      toast.success('Bookings exported successfully');
    } catch (error: any) {
      toast.error(error.error || 'Failed to export bookings');
    }
  };

  return (
    <div className="container max-w-7xl mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Bookings</h1>
            <p className="text-muted-foreground mt-2">
              Manage all your scheduled meetings and appointments
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('calendar')}
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_bookings}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.upcoming_bookings}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.confirmed_bookings}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{stats.completed_bookings}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.cancelled_bookings}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.success_rate}%</div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6">
        <BookingFilters
          filters={filters}
          onFiltersChange={setFilters}
          onExport={handleExport}
          onRefresh={fetchBookings}
          eventTypes={eventTypes}
          isLoading={isLoading}
        />
      </div>

      {/* Bookings Content */}
      <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
        <TabsContent value="list" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="spinner w-8 h-8" />
              <span className="ml-2">Loading bookings...</span>
            </div>
          ) : bookings.length === 0 ? (
            <Alert>
              <AlertDescription>
                {Object.values(filters).some(v => v && v !== 'all') 
                  ? "No bookings match your current filters."
                  : "No bookings found. Your first booking will appear here once someone schedules with you."
                }
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onView={setSelectedBooking}
                  onCancel={handleCancelBooking}
                  onReschedule={handleRescheduleBooking}
                  onMarkComplete={handleMarkComplete}
                  onMarkNoShow={handleMarkNoShow}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardContent className="p-8 text-center">
              <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Calendar View</h3>
              <p className="text-muted-foreground mb-4">
                Calendar view is coming soon. For now, use the list view to manage your bookings.
              </p>
              <Button onClick={() => setViewMode('list')} variant="outline">
                Switch to List View
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onBookingUpdate={handleBookingUpdate}
        />
      )}
    </div>
  );
}