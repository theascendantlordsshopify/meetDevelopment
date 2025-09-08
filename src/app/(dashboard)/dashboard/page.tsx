'use client';

import { useState, useEffect } from 'react';
import { Calendar, Users, TrendingUp, Clock, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth/auth-context';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS, ROUTES } from '@/constants';
import { formatDateTime, formatRelativeTime } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface DashboardStats {
  total_event_types: number;
  active_event_types: number;
  total_bookings: number;
  upcoming_bookings: number;
  bookings_today: number;
  success_rate: number;
}

interface UpcomingBooking {
  id: string;
  event_type_name: string;
  invitee_name: string;
  start_time: string;
  status: string;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<UpcomingBooking[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch dashboard statistics
      const [statsRes, bookingsRes] = await Promise.all([
        api.get('/api/v1/dashboard/stats/'),
        api.get(`${API_ENDPOINTS.BOOKINGS.LIST}?status=confirmed&limit=5`),
      ]);

      setStats(statsRes.data.data);
      setUpcomingBookings(bookingsRes.data.data || []);
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
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
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.first_name || 'User'}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Here's what's happening with your scheduling
        </p>
      </div>

      {/* Email Verification Alert */}
      {!user?.is_email_verified && (
        <Alert className="mb-6">
          <Mail className="h-4 w-4" />
          <AlertDescription>
            Please verify your email address to ensure you receive important notifications.
            <Button asChild variant="link" className="p-0 h-auto ml-2">
              <Link href={ROUTES.VERIFY_EMAIL}>
                Verify now
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Event Types</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_event_types}</div>
              <p className="text-xs text-muted-foreground">
                {stats.active_event_types} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_bookings}</div>
              <p className="text-xs text-muted-foreground">
                {stats.upcoming_bookings} upcoming
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Bookings</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.bookings_today}</div>
              <p className="text-xs text-muted-foreground">
                scheduled for today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.success_rate}%</div>
              <p className="text-xs text-muted-foreground">
                booking completion
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Bookings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Upcoming Bookings</CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link href={ROUTES.BOOKINGS}>
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingBookings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Upcoming Bookings</h3>
                <p className="text-muted-foreground mb-4">
                  You don't have any upcoming bookings scheduled.
                </p>
                <Button asChild>
                  <Link href={ROUTES.EVENT_TYPES}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event Type
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{booking.event_type_name}</div>
                      <div className="text-sm text-muted-foreground">
                        with {booking.invitee_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDateTime(booking.start_time)}
                      </div>
                    </div>
                    <Badge variant="outline">
                      {booking.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks to get you started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href={ROUTES.EVENT_TYPES}>
                <Calendar className="h-4 w-4 mr-2" />
                Manage Event Types
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href={ROUTES.AVAILABILITY}>
                <Clock className="h-4 w-4 mr-2" />
                Set Availability
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href={ROUTES.INTEGRATIONS}>
                <Link className="h-4 w-4 mr-2" />
                Connect Calendar
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href={ROUTES.PROFILE}>
                <User className="h-4 w-4 mr-2" />
                Complete Profile
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}