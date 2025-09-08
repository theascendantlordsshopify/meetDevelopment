'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Calendar, Clock, MapPin, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PublicProfileView } from '@/components/profile/public-profile-view';
import { api } from '@/lib/api/client';
import { LOCATION_TYPES } from '@/constants';
import Link from 'next/link';

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
}

interface PublicOrganizerData {
  organizer: {
    organizer_slug: string;
    display_name: string;
    bio?: string;
    profile_picture?: string;
    brand_color?: string;
    brand_logo?: string;
    company?: string;
    website?: string;
    phone?: string;
    email?: string;
    public_profile: boolean;
    show_phone: boolean;
    show_email: boolean;
  };
  event_types: EventType[];
}

export default function PublicOrganizerPage() {
  const params = useParams();
  const organizerSlug = params.organizer_slug as string;
  
  const [data, setData] = useState<PublicOrganizerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrganizerData();
  }, [organizerSlug]);

  const fetchOrganizerData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get(`/api/v1/events/public/${organizerSlug}/`);
      setData(response.data.data);
    } catch (error: any) {
      setError(error.error || 'Organizer not found');
    } finally {
      setIsLoading(false);
    }
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
    return locationType?.label || 'Unknown';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading organizer profile...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <Alert>
              <AlertDescription>
                {error || 'Organizer not found. Please check the URL and try again.'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { organizer, event_types } = data;
  const brandColor = organizer.brand_color || '#0066cc';
  const publicEventTypes = event_types.filter(et => et.is_active && !et.is_private);

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

      <div className="container max-w-4xl mx-auto py-8 px-4">
        {/* Public Profile */}
        <div className="mb-8">
          <PublicProfileView 
            organizerSlug={organizerSlug} 
            showEventTypes={false}
          />
        </div>

        {/* Available Event Types */}
        {publicEventTypes.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-6 w-6" />
                <span>Book a Meeting</span>
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Choose the type of meeting you'd like to schedule
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {publicEventTypes.map((eventType) => (
                  <Card key={eventType.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xl font-semibold mb-2">{eventType.name}</h3>
                          {eventType.description && (
                            <p className="text-muted-foreground text-sm">
                              {eventType.description}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{formatDuration(eventType.duration)}</span>
                          </div>

                          <div className="flex items-center space-x-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{getLocationDisplay(eventType)}</span>
                          </div>

                          {eventType.max_attendees > 1 && (
                            <div className="flex items-center space-x-2 text-sm">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>Up to {eventType.max_attendees} attendees</span>
                            </div>
                          )}
                        </div>

                        <Button 
                          asChild 
                          className="w-full brand-primary"
                        >
                          <Link href={`/${organizerSlug}/${eventType.event_type_slug}`}>
                            Select Time
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Available Meetings</h3>
              <p className="text-muted-foreground">
                This organizer doesn't have any public event types available for booking at the moment.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-8 pt-8 border-t">
          <p className="text-sm text-muted-foreground">
            Powered by <span className="brand-text font-semibold">CalendlyClone</span>
          </p>
        </div>
      </div>
    </div>
  );
}