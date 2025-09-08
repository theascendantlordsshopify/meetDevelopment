'use client';

import { format, parseISO } from 'date-fns';
import { 
  Clock, 
  MapPin, 
  Users, 
  Mail, 
  Phone, 
  Calendar,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  RotateCcw,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BOOKING_STATUSES, LOCATION_TYPES } from '@/constants';
import { getInitials } from '@/lib/utils';
import { Booking } from '@/types';

interface BookingCardProps {
  booking: Booking;
  onView: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
  onReschedule: (booking: Booking) => void;
  onMarkComplete: (booking: Booking) => void;
  onMarkNoShow: (booking: Booking) => void;
  isLoading?: boolean;
}

export function BookingCard({
  booking,
  onView,
  onCancel,
  onReschedule,
  onMarkComplete,
  onMarkNoShow,
  isLoading = false,
}: BookingCardProps) {
  const formatDateTime = (dateTimeString: string) => {
    try {
      const date = parseISO(dateTimeString);
      return {
        date: format(date, 'MMM d, yyyy'),
        time: format(date, 'h:mm a'),
        dayOfWeek: format(date, 'EEEE'),
      };
    } catch {
      return { date: 'Invalid date', time: '', dayOfWeek: '' };
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
  const canCancel = booking.status === 'confirmed' && new Date(booking.start_time) > new Date();
  const canReschedule = booking.status === 'confirmed' && new Date(booking.start_time) > new Date();
  const canMarkComplete = booking.status === 'confirmed' && new Date(booking.start_time) <= new Date();

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getInitials(booking.invitee_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg leading-tight">{booking.event_type.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                with {booking.invitee_name}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" disabled={isLoading}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(booking)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                {canReschedule && (
                  <DropdownMenuItem onClick={() => onReschedule(booking)}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reschedule
                  </DropdownMenuItem>
                )}
                {canMarkComplete && (
                  <DropdownMenuItem onClick={() => onMarkComplete(booking)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Complete
                  </DropdownMenuItem>
                )}
                {canMarkComplete && (
                  <DropdownMenuItem onClick={() => onMarkNoShow(booking)}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Mark No Show
                  </DropdownMenuItem>
                )}
                {canCancel && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onCancel(booking)}
                      className="text-destructive"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Booking
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Date and Time */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">{startTime.date}</div>
              <div className="text-sm text-muted-foreground">{startTime.dayOfWeek}</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {startTime.time} - {endTime.time}
            </span>
          </div>
        </div>

        {/* Location and Attendees */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{getLocationDisplay()}</span>
          </div>
          
          {isGroupEvent && (
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>
                {booking.attendee_count}/{booking.event_type.max_attendees} attendees
              </span>
            </div>
          )}
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{booking.invitee_email}</span>
          </div>
          
          {booking.invitee_phone && (
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{booking.invitee_phone}</span>
            </div>
          )}
        </div>

        {/* Meeting Link */}
        {booking.meeting_link && (
          <div className="pt-2 border-t">
            <a
              href={booking.meeting_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline text-sm"
            >
              Join Meeting
            </a>
          </div>
        )}

        {/* Calendar Sync Status */}
        {booking.calendar_sync_status !== 'not_required' && (
          <div className="flex items-center space-x-2 text-xs">
            <div className={`w-2 h-2 rounded-full ${
              booking.calendar_sync_status === 'succeeded' ? 'bg-green-500' :
              booking.calendar_sync_status === 'failed' ? 'bg-red-500' :
              'bg-yellow-500'
            }`} />
            <span className="text-muted-foreground">
              Calendar sync: {booking.calendar_sync_status}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}