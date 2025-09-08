'use client';

import { useState, useEffect } from 'react';
import { format, parseISO, isSameDay } from 'date-fns';
import { Clock, Users, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar } from '@/components/ui/calendar';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/constants';
import { cn } from '@/lib/utils';

interface TimeSlot {
  start_time: string;
  end_time: string;
  available_spots?: number;
  total_spots?: number;
  is_waitlist_available?: boolean;
}

interface TimeSlotPickerProps {
  organizerSlug: string;
  eventTypeSlug: string;
  attendeeCount?: number;
  inviteeTimezone?: string;
  selectedDate?: Date;
  selectedSlot?: TimeSlot;
  onDateChange: (date: Date) => void;
  onSlotChange: (slot: TimeSlot) => void;
  className?: string;
}

export function TimeSlotPicker({
  organizerSlug,
  eventTypeSlug,
  attendeeCount = 1,
  inviteeTimezone = 'UTC',
  selectedDate,
  selectedSlot,
  onDateChange,
  onSlotChange,
  className,
}: TimeSlotPickerProps) {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate);
    }
  }, [selectedDate, organizerSlug, eventTypeSlug, attendeeCount, inviteeTimezone]);

  const fetchAvailableSlots = async (date: Date) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const startDate = format(date, 'yyyy-MM-dd');
      const endDate = format(date, 'yyyy-MM-dd');
      
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
        timezone: inviteeTimezone,
        attendee_count: attendeeCount.toString(),
      });

      const response = await api.get(
        `${API_ENDPOINTS.AVAILABILITY.SLOTS(organizerSlug, eventTypeSlug)}?${params}`
      );

      const slotsData = response.data.data || [];
      
      // Find slots for the selected date
      const daySlots = slotsData.find((day: any) => 
        isSameDay(parseISO(day.date), date)
      );
      
      setAvailableSlots(daySlots?.slots || []);
    } catch (error: any) {
      setError(error.error || 'Failed to load available time slots');
      setAvailableSlots([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const date = parseISO(timeString);
      return format(date, 'h:mm a');
    } catch {
      return timeString;
    }
  };

  const isSlotSelected = (slot: TimeSlot) => {
    return selectedSlot?.start_time === slot.start_time;
  };

  const getSlotStatus = (slot: TimeSlot) => {
    if (!slot.total_spots || slot.total_spots === 1) {
      return 'available';
    }
    
    const availableSpots = slot.available_spots || 0;
    if (availableSpots === 0) {
      return slot.is_waitlist_available ? 'waitlist' : 'full';
    }
    
    return 'available';
  };

  const getSlotStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'border-primary hover:bg-primary hover:text-primary-foreground';
      case 'waitlist': return 'border-amber-300 bg-amber-50 hover:bg-amber-100';
      case 'full': return 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed';
      default: return 'border-gray-200';
    }
  };

  const renderSlotButton = (slot: TimeSlot) => {
    const status = getSlotStatus(slot);
    const isSelected = isSlotSelected(slot);
    const isDisabled = status === 'full';

    return (
      <Button
        key={slot.start_time}
        variant={isSelected ? 'default' : 'outline'}
        className={cn(
          'h-auto p-3 flex flex-col items-start space-y-1',
          !isSelected && getSlotStatusColor(status),
          isSelected && 'border-primary bg-primary text-primary-foreground'
        )}
        onClick={() => !isDisabled && onSlotChange(slot)}
        disabled={isDisabled}
      >
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4" />
          <span className="font-medium">{formatTime(slot.start_time)}</span>
        </div>
        
        {slot.total_spots && slot.total_spots > 1 && (
          <div className="flex items-center space-x-1 text-xs">
            <Users className="h-3 w-3" />
            <span>
              {status === 'waitlist' 
                ? 'Join waitlist'
                : `${slot.available_spots}/${slot.total_spots} spots`
              }
            </span>
          </div>
        )}
        
        {status === 'waitlist' && (
          <Badge variant="secondary" className="text-xs">
            Waitlist
          </Badge>
        )}
      </Button>
    );
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Date Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select a Date</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && onDateChange(date)}
            disabled={(date) => date < new Date()}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      {/* Time Slot Selection */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle>
              Available Times - {format(selectedDate, 'EEEE, MMMM d')}
            </CardTitle>
            {inviteeTimezone !== 'UTC' && (
              <p className="text-sm text-muted-foreground">
                Times shown in {inviteeTimezone}
              </p>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="spinner w-6 h-6" />
                <span className="ml-2">Loading available times...</span>
              </div>
            ) : error ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : availableSlots.length === 0 ? (
              <Alert>
                <AlertDescription>
                  No available time slots for this date. Please select a different date.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {availableSlots.map(renderSlotButton)}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}