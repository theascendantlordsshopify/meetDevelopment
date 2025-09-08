'use client';

import { Clock, Users, MapPin, Edit, Trash2, Copy, ExternalLink, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LOCATION_TYPES } from '@/constants';
import { cn } from '@/lib/utils';
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
}

interface EventTypeCardProps {
  eventType: EventType;
  organizerSlug: string;
  onEdit: (eventType: EventType) => void;
  onDelete: (eventType: EventType) => void;
  onToggleActive: (eventType: EventType) => void;
  onDuplicate: (eventType: EventType) => void;
  isLoading?: boolean;
}

export function EventTypeCard({
  eventType,
  organizerSlug,
  onEdit,
  onDelete,
  onToggleActive,
  onDuplicate,
  isLoading = false,
}: EventTypeCardProps) {
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) return `${hours}h`;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getLocationIcon = (type: string) => {
    const locationConfig = LOCATION_TYPES.find(l => l.value === type);
    return locationConfig?.label || 'Unknown';
  };

  const getLocationColor = (type: string) => {
    switch (type) {
      case 'video_call': return 'bg-blue-100 text-blue-800';
      case 'phone_call': return 'bg-green-100 text-green-800';
      case 'in_person': return 'bg-purple-100 text-purple-800';
      case 'custom': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const publicUrl = `${window.location.origin}/${organizerSlug}/${eventType.event_type_slug}`;

  const copyPublicUrl = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast.success('Booking link copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const openPublicPage = () => {
    window.open(publicUrl, '_blank');
  };

  return (
    <Card className={cn(
      'transition-all duration-200 hover:shadow-md',
      !eventType.is_active && 'opacity-60',
      eventType.is_active && 'border-primary/20'
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {eventType.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg leading-tight">{eventType.name}</CardTitle>
              {eventType.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {eventType.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Badge variant={eventType.is_active ? 'default' : 'secondary'}>
              {eventType.is_active ? 'Active' : 'Inactive'}
            </Badge>
            {eventType.is_private && (
              <Badge variant="outline">Private</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Event Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{formatDuration(eventType.duration)}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>
              {eventType.max_attendees === 1 
                ? '1-on-1' 
                : `Up to ${eventType.max_attendees}`
              }
            </span>
          </div>
          
          <div className="flex items-center space-x-2 col-span-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className={getLocationColor(eventType.location_type)}>
              {getLocationIcon(eventType.location_type)}
            </Badge>
          </div>
        </div>

        {/* Statistics */}
        {(eventType.booking_count !== undefined || eventType.success_rate !== undefined) && (
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            {eventType.booking_count !== undefined && (
              <div className="text-center">
                <div className="text-lg font-semibold">{eventType.booking_count}</div>
                <div className="text-xs text-muted-foreground">Bookings</div>
              </div>
            )}
            {eventType.success_rate !== undefined && (
              <div className="text-center">
                <div className="text-lg font-semibold">{eventType.success_rate}%</div>
                <div className="text-xs text-muted-foreground">Success Rate</div>
              </div>
            )}
          </div>
        )}

        {/* Public URL */}
        <div className="pt-2 border-t">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-2">
            <span>Public booking page:</span>
          </div>
          <div className="flex items-center space-x-1">
            <code className="flex-1 px-2 py-1 bg-muted rounded text-xs truncate">
              /{organizerSlug}/{eventType.event_type_slug}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyPublicUrl}
              className="h-7 w-7 p-0"
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={openPublicPage}
              className="h-7 w-7 p-0"
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleActive(eventType)}
            disabled={isLoading}
            className="flex items-center space-x-1"
          >
            {eventType.is_active ? (
              <ToggleRight className="h-4 w-4" />
            ) : (
              <ToggleLeft className="h-4 w-4" />
            )}
            <span>{eventType.is_active ? 'Disable' : 'Enable'}</span>
          </Button>

          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDuplicate(eventType)}
              disabled={isLoading}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(eventType)}
              disabled={isLoading}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(eventType)}
              disabled={isLoading}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}