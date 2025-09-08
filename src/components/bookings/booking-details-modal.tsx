'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { 
  Clock, 
  MapPin, 
  Users, 
  Mail, 
  Phone, 
  Calendar,
  ExternalLink,
  Download,
  Edit,
  Trash2,
  Plus,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { attendeeManagementSchema, type AttendeeManagementData } from '@/lib/validations/bookings';
import { BOOKING_STATUSES, LOCATION_TYPES } from '@/constants';
import { getInitials } from '@/lib/utils';
import { Booking, BookingAttendee } from '@/types';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/constants';
import toast from 'react-hot-toast';

interface BookingDetailsModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onBookingUpdate: (updatedBooking: Booking) => void;
}

export function BookingDetailsModal({
  booking,
  isOpen,
  onClose,
  onBookingUpdate,
}: BookingDetailsModalProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [showAddAttendee, setShowAddAttendee] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AttendeeManagementData>({
    resolver: zodResolver(attendeeManagementSchema),
  });

  const formatDateTime = (dateTimeString: string) => {
    try {
      const date = parseISO(dateTimeString);
      return {
        date: format(date, 'EEEE, MMMM d, yyyy'),
        time: format(date, 'h:mm a'),
        iso: format(date, "yyyy-MM-dd'T'HH:mm:ss"),
      };
    } catch {
      return { date: 'Invalid date', time: '', iso: '' };
    }
  };

  const getStatusConfig = (status: string) => {
    return BOOKING_STATUSES.find(s => s.value === status) || BOOKING_STATUSES[0];
  };

  const getLocationDisplay = () => {
    const locationType = LOCATION_TYPES.find(l => l.value === booking.event_type.location_type);
    if (booking.event_type.location_type === 'in_person' || booking.event_type.location_type === 'custom') {
      return booking.event_type.location_details || locationType?.label;
    }
    return locationType?.label;
  };

  const startTime = formatDateTime(booking.start_time);
  const endTime = formatDateTime(booking.end_time);
  const statusConfig = getStatusConfig(booking.status);
  const isGroupEvent = booking.event_type.max_attendees > 1;

  const handleAddAttendee = async (data: AttendeeManagementData) => {
    try {
      const response = await api.post(
        `${API_ENDPOINTS.BOOKINGS.DETAIL(booking.id)}/attendees/add/`,
        data
      );
      
      const updatedBooking = { ...booking, attendees: [...(booking.attendees || []), response.data.data] };
      onBookingUpdate(updatedBooking);
      setShowAddAttendee(false);
      reset();
      toast.success('Attendee added successfully');
    } catch (error: any) {
      toast.error(error.error || 'Failed to add attendee');
    }
  };

  const handleRemoveAttendee = async (attendeeId: string) => {
    if (!confirm('Are you sure you want to remove this attendee?')) return;

    try {
      await api.post(
        `${API_ENDPOINTS.BOOKINGS.DETAIL(booking.id)}/attendees/${attendeeId}/remove/`
      );
      
      const updatedBooking = {
        ...booking,
        attendees: booking.attendees?.filter(a => a.id !== attendeeId) || [],
      };
      onBookingUpdate(updatedBooking);
      toast.success('Attendee removed successfully');
    } catch (error: any) {
      toast.error(error.error || 'Failed to remove attendee');
    }
  };

  const downloadCalendarEvent = () => {
    const event = {
      title: booking.event_type.name,
      start: startTime.iso,
      end: endTime.iso,
      description: `Meeting with ${booking.invitee_name}`,
      location: getLocationDisplay(),
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CalendlyClone//EN
BEGIN:VEVENT
UID:${booking.id}@calendlyclone.com
DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss'Z'")}
DTSTART:${format(parseISO(booking.start_time), "yyyyMMdd'T'HHmmss'Z'")}
DTEND:${format(parseISO(booking.end_time), "yyyyMMdd'T'HHmmss'Z'")}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${booking.event_type.name.replace(/\s+/g, '-')}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Calendar event downloaded');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>{booking.event_type.name}</span>
            <Badge 
              variant={statusConfig.color === 'success' ? 'default' : 'secondary'}
              className={
                statusConfig.color === 'error' ? 'bg-red-100 text-red-800' :
                statusConfig.color === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                statusConfig.color === 'info' ? 'bg-blue-100 text-blue-800' :
                ''
              }
            >
              {statusConfig.label}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="attendees" disabled={!isGroupEvent}>
              Attendees {isGroupEvent && `(${booking.attendees?.length || 0})`}
            </TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Meeting Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Meeting Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{startTime.date}</div>
                      <div className="text-sm text-muted-foreground">{startTime.dayOfWeek}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{startTime.time} - {endTime.time}</div>
                      <div className="text-sm text-muted-foreground">
                        {booking.event_type.duration} minutes • {booking.invitee_timezone}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{getLocationDisplay()}</div>
                      {booking.meeting_link && (
                        <a
                          href={booking.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center space-x-1"
                        >
                          <span>Join Meeting</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  {isGroupEvent && (
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">
                          {booking.attendee_count}/{booking.event_type.max_attendees} attendees
                        </div>
                        <div className="text-sm text-muted-foreground">Group event</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Invitee Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Invitee Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getInitials(booking.invitee_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{booking.invitee_name}</div>
                      <div className="text-sm text-muted-foreground">{booking.invitee_email}</div>
                    </div>
                  </div>

                  {booking.invitee_phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <span>{booking.invitee_phone}</span>
                    </div>
                  )}

                  <div className="text-sm text-muted-foreground">
                    Timezone: {booking.invitee_timezone}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Custom Answers */}
            {booking.custom_answers && Object.keys(booking.custom_answers).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(booking.custom_answers).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-3 gap-4">
                      <div className="font-medium text-sm">{key}:</div>
                      <div className="col-span-2 text-sm">{String(value)}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex space-x-2">
              <Button onClick={downloadCalendarEvent} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download .ics
              </Button>
              {booking.meeting_link && (
                <Button asChild variant="outline">
                  <a href={booking.meeting_link} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Join Meeting
                  </a>
                </Button>
              )}
            </div>
          </TabsContent>

          {/* Attendees Tab */}
          <TabsContent value="attendees" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Attendees ({booking.attendees?.length || 0}/{booking.event_type.max_attendees})
              </h3>
              {(booking.attendees?.length || 0) < booking.event_type.max_attendees && (
                <Button onClick={() => setShowAddAttendee(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Attendee
                </Button>
              )}
            </div>

            {booking.attendees && booking.attendees.length > 0 ? (
              <div className="space-y-3">
                {booking.attendees.map((attendee) => (
                  <Card key={attendee.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-sm">
                              {getInitials(attendee.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{attendee.name}</div>
                            <div className="text-sm text-muted-foreground">{attendee.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={attendee.status === 'confirmed' ? 'default' : 'secondary'}>
                            {attendee.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveAttendee(attendee.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Alert>
                <AlertDescription>
                  No additional attendees added yet. This is a group event that can accommodate up to {booking.event_type.max_attendees} people.
                </AlertDescription>
              </Alert>
            )}

            {/* Add Attendee Dialog */}
            <Dialog open={showAddAttendee} onOpenChange={setShowAddAttendee}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Attendee</DialogTitle>
                  <DialogDescription>
                    Add another person to this group meeting.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleAddAttendee)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        {...register('name')}
                        placeholder="Enter attendee name"
                        disabled={isSubmitting}
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register('email')}
                        placeholder="Enter attendee email"
                        disabled={isSubmitting}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      {...register('phone')}
                      placeholder="Enter attendee phone"
                      disabled={isSubmitting}
                    />
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddAttendee(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Adding...' : 'Add Attendee'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Booking Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                    <div>
                      <div className="font-medium">Booking Created</div>
                      <div className="text-sm text-muted-foreground">
                        {format(parseISO(booking.created_at), 'MMM d, yyyy at h:mm a')}
                      </div>
                    </div>
                  </div>

                  {booking.cancelled_at && (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2" />
                      <div>
                        <div className="font-medium">Booking Cancelled</div>
                        <div className="text-sm text-muted-foreground">
                          {format(parseISO(booking.cancelled_at), 'MMM d, yyyy at h:mm a')}
                        </div>
                        {booking.cancellation_reason && (
                          <div className="text-sm text-muted-foreground mt-1">
                            Reason: {booking.cancellation_reason}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {booking.rescheduled_at && (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
                      <div>
                        <div className="font-medium">Booking Rescheduled</div>
                        <div className="text-sm text-muted-foreground">
                          {format(parseISO(booking.rescheduled_at), 'MMM d, yyyy at h:mm a')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Calendar Sync Status */}
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Calendar Sync</h4>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      booking.calendar_sync_status === 'succeeded' ? 'bg-green-500' :
                      booking.calendar_sync_status === 'failed' ? 'bg-red-500' :
                      'bg-yellow-500'
                    }`} />
                    <span className="text-sm">Status: {booking.calendar_sync_status}</span>
                  </div>
                  {booking.calendar_sync_error && (
                    <div className="text-sm text-red-600 mt-1">
                      Error: {booking.calendar_sync_error}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}