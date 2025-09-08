'use client';

import { useState, useEffect } from 'react';
import { Globe, Mail, Phone, Building, ExternalLink, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getInitials } from '@/lib/utils';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/constants';

interface PublicProfile {
  organizer_slug: string;
  display_name: string;
  bio?: string;
  profile_picture?: string;
  phone?: string;
  email?: string;
  website?: string;
  company?: string;
  job_title?: string;
  brand_color?: string;
  brand_logo?: string;
  public_profile: boolean;
  show_phone: boolean;
  show_email: boolean;
  event_types?: Array<{
    id: string;
    name: string;
    event_type_slug: string;
    description?: string;
    duration: number;
    is_active: boolean;
    is_private: boolean;
  }>;
}

interface PublicProfileViewProps {
  organizerSlug: string;
  showEventTypes?: boolean;
  className?: string;
}

export function PublicProfileView({ 
  organizerSlug, 
  showEventTypes = true, 
  className 
}: PublicProfileViewProps) {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPublicProfile();
  }, [organizerSlug]);

  const fetchPublicProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get(`/api/v1/users/public/${organizerSlug}/`);
      setProfile(response.data.data);
    } catch (error: any) {
      setError(error.error || 'Failed to load profile');
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="spinner w-6 h-6" />
        <span className="ml-2">Loading profile...</span>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <Alert>
        <AlertDescription>
          {error || 'Profile not found or not public.'}
        </AlertDescription>
      </Alert>
    );
  }

  if (!profile.public_profile) {
    return (
      <Alert>
        <AlertDescription>
          This organizer's profile is private.
        </AlertDescription>
      </Alert>
    );
  }

  const brandColor = profile.brand_color || '#0066cc';

  return (
    <div className={className}>
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

      <div className="space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start space-x-6">
              <div className="flex flex-col items-center space-y-3">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.profile_picture} />
                  <AvatarFallback 
                    className="text-2xl font-semibold text-white"
                    style={{ backgroundColor: brandColor }}
                  >
                    {getInitials(profile.display_name)}
                  </AvatarFallback>
                </Avatar>
                {profile.brand_logo && (
                  <img 
                    src={profile.brand_logo} 
                    alt="Brand logo" 
                    className="h-8 w-auto object-contain"
                  />
                )}
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold">{profile.display_name}</h1>
                  {profile.job_title && profile.company && (
                    <p className="text-lg text-muted-foreground">
                      {profile.job_title} at {profile.company}
                    </p>
                  )}
                  {profile.job_title && !profile.company && (
                    <p className="text-lg text-muted-foreground">{profile.job_title}</p>
                  )}
                  {!profile.job_title && profile.company && (
                    <p className="text-lg text-muted-foreground">{profile.company}</p>
                  )}
                </div>

                {profile.bio && (
                  <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
                )}

                {/* Contact Information */}
                <div className="flex flex-wrap gap-4">
                  {profile.show_email && profile.email && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={`mailto:${profile.email}`}
                        className="text-primary hover:underline"
                      >
                        {profile.email}
                      </a>
                    </div>
                  )}

                  {profile.show_phone && profile.phone && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={`tel:${profile.phone}`}
                        className="text-primary hover:underline"
                      >
                        {profile.phone}
                      </a>
                    </div>
                  )}

                  {profile.website && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center space-x-1"
                      >
                        <span>Website</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}

                  {profile.company && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.company}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Event Types */}
        {showEventTypes && profile.event_types && profile.event_types.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Available Meetings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.event_types
                  .filter(et => et.is_active && !et.is_private)
                  .map((eventType) => (
                    <Card key={eventType.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-semibold text-lg">{eventType.name}</h3>
                            {eventType.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {eventType.description}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">
                              {formatDuration(eventType.duration)}
                            </Badge>
                            <Button 
                              size="sm"
                              className="brand-primary"
                              asChild
                            >
                              <a href={`/${organizerSlug}/${eventType.event_type_slug}`}>
                                Book Now
                              </a>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}