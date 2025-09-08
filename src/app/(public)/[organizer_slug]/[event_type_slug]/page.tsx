'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Clock, MapPin, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TimeSlotPicker } from '@/components/booking/time-slot-picker';
import { BookingForm } from '@/components/booking/booking-form';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS, LOCATION_TYPES } from '@/constants';
import { getInitials } from '@/lib/utils';
import toast from 'react-hot-toast';

interface TimeSlot {
  start_time: string;
  end_time: string;
  available_spots?: number;
  total_spots?: number;
}

interface EventType {
  id: string;
  name: string;
  event_type_slug: string;
  description?: string;
  duration: number;
  max_attendees: number;
  location_type: string;
  location_details?: string;
  custom_questions?: any[];
}

interface Organizer {
  organizer_slug: string;
  display_name: string;
  bio?: string;
  profile_picture?: string;
  brand_color?: string;
  company?: string;
  website?: string;
}

interface BookingPageData {
  event_type: EventType;
  organizer: Organizer;
}

type BookingStep = 'select-time' | 'enter-details' | 'confirmation';

export default function EventBookingPage() {
  const params = useParams();
  const organizerSlug = params.organizer_slug as string;
  const eventTypeSlug = params.event_type_slug as string;

  const [bookingData, setBookingData] = useState<BookingPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<BookingStep>('select-time');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot>();
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  useEffect(() => {
    fetchBookingPageData();
  }, [organizerSlug, eventTypeSlug]);

  const fetchBookingPageData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get(
        API_ENDPOINTS.EVENT_TYPES.PUBLIC(organizerSlug, eventTypeSlug)
      );
      
      setBookingData(response.data.data);
    } catch (error: any) {
      setError(error.error || 'Failed to load booking page');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSlotSelection = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setCurrentStep('enter-details');
  };

  const handleBookingSuccess = (booking: any) => {
    setConfirmedBooking(booking);
    setCurrentStep('confirmation');
  };

  const handleBackToTimeSelection = () => {
    setCurrentStep('select-time');
    setSelectedSlot(undefined);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) return `${hours}h`;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getLocationDisplay = (eventType: EventType) => {
    const locationType = LOCATION_TYPES.find(l => l.value === eventType.location_type);
    if (eventType.location_type === 'in_person' || eventType.location_type === 'custom') {
      return eventType.location_details || locationType?.label;
    }
    return locationType?.label;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading booking page...</p>
        </div>
      </div>
    );
  }

  if (error || !bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <Alert>
              <AlertDescription>
                {error || 'Booking page not found. Please check the URL and try again.'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { event_type: eventType, organizer } = bookingData;

  // Apply organizer branding
  const brandColor = organizer.brand_color || '#0066cc';
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Custom CSS for branding */}
      <style jsx>{`
        :global(.brand-primary) {
          background-color: ${brandColor} !important;
          border-color: ${brandColor} !important;
        }
        :global(.brand-text) {
          color: ${brandColor} !important;
        }
      `}</style>

      <div className="container max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <Avatar className="h-16 w-16">
              <AvatarImage src={organizer.profile_picture} />
              <AvatarFallback className="text-lg font-semibold">
                {getInitials(organizer.display_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{organizer.display_name}</h1>
              {organizer.company && (
                <p className="text-muted-foreground">{organizer.company}</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold mb-2">{eventType.name}</h2>
                {eventType.description && (
                  <p className="text-muted-foreground mb-4">{eventType.description}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{formatDuration(eventType.duration)}</span>
              </div>

              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{getLocationDisplay(eventType)}</span>
              </div>

              {eventType.max_attendees > 1 && (
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Up to {eventType.max_attendees} attendees</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Booking Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Event Info (always visible) */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Booking Steps</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === 'select-time' ? 'bg-primary text-primary-foreground' : 
                    selectedSlot ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    1
                  </div>
                  <div>
                    <div className="font-medium">Select Date & Time</div>
                    <div className="text-sm text-muted-foreground">
                      Choose your preferred slot
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === 'enter-details' ? 'bg-primary text-primary-foreground' : 
                    confirmedBooking ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    2
                  </div>
                  <div>
                    <div className="font-medium">Enter Details</div>
                    <div className="text-sm text-muted-foreground">
                      Provide your information
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === 'confirmation' ? 'bg-primary text-primary-foreground' : 'bg-gray-100 text-gray-600'
                  }`}>
                    3
                  </div>
                  <div>
                    <div className="font-medium">Confirmation</div>
                    <div className="text-sm text-muted-foreground">
                      Booking confirmed
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Booking Interface */}
          <div className="lg:col-span-2">
            {currentStep === 'select-time' && (
              <TimeSlotPicker
                organizerSlug={organizerSlug}
                eventTypeSlug={eventTypeSlug}
                selectedDate={selectedDate}
                selectedSlot={selectedSlot}
                onDateChange={setSelectedDate}
                onSlotChange={handleSlotSelection}
              />
            )}

            {currentStep === 'enter-details' && selectedSlot && (
              <BookingForm
                eventType={eventType}
                organizerSlug={organizerSlug}
                selectedSlot={selectedSlot}
                onSuccess={handleBookingSuccess}
                onCancel={handleBackToTimeSelection}
              />
            )}

            {currentStep === 'confirmation' && confirmedBooking && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">Booking Confirmed!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertDescription>
                      Your booking has been confirmed. You should receive a confirmation email shortly 
                      with all the details and calendar invite.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <h3 className="font-medium">Booking Details:</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div><strong>Event:</strong> {eventType.name}</div>
                      <div><strong>Date & Time:</strong> {confirmedBooking.start_time}</div>
                      <div><strong>Duration:</strong> {formatDuration(eventType.duration)}</div>
                      <div><strong>Location:</strong> {getLocationDisplay(eventType)}</div>
                    </div>
                  </div>

                  {confirmedBooking.meeting_link && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Meeting Link:</h3>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <a 
                          href={confirmedBooking.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {confirmedBooking.meeting_link}
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="pt-4">
                    <Button
                      onClick={() => window.location.href = `/${organizerSlug}`}
                      variant="outline"
                      className="w-full"
                    >
                      Book Another Meeting
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}