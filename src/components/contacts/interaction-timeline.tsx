'use client';

import { format } from 'date-fns';
import { 
  Calendar,
  Mail,
  Phone,
  MessageSquare,
  FileText,
  User,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ContactInteraction } from '@/types';

interface InteractionTimelineProps {
  interactions: ContactInteraction[];
  contactId: string;
}

const INTERACTION_TYPES = {
  booking_created: {
    label: 'Booking Created',
    icon: Calendar,
    color: 'bg-green-100 text-green-800',
  },
  booking_completed: {
    label: 'Booking Completed',
    icon: CheckCircle,
    color: 'bg-blue-100 text-blue-800',
  },
  booking_cancelled: {
    label: 'Booking Cancelled',
    icon: XCircle,
    color: 'bg-red-100 text-red-800',
  },
  email_sent: {
    label: 'Email Sent',
    icon: Mail,
    color: 'bg-purple-100 text-purple-800',
  },
  note_added: {
    label: 'Note Added',
    icon: FileText,
    color: 'bg-yellow-100 text-yellow-800',
  },
  manual_entry: {
    label: 'Manual Entry',
    icon: User,
    color: 'bg-gray-100 text-gray-800',
  },
};

export function InteractionTimeline({ interactions, contactId }: InteractionTimelineProps) {
  const sortedInteractions = [...interactions].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return {
        date: format(date, 'MMM d, yyyy'),
        time: format(date, 'h:mm a'),
        relative: format(date, 'MMM d'),
      };
    } catch {
      return { date: 'Invalid date', time: '', relative: '' };
    }
  };

  if (interactions.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          No interactions recorded yet. Interactions will appear here as you communicate with this contact.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {sortedInteractions.map((interaction) => {
        const typeConfig = INTERACTION_TYPES[interaction.interaction_type as keyof typeof INTERACTION_TYPES];
        const Icon = typeConfig?.icon || MessageSquare;
        const dateTime = formatDateTime(interaction.created_at);

        return (
          <Card key={interaction.id} className="relative">
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                {/* Icon */}
                <div className={`p-2 rounded-full ${typeConfig?.color || 'bg-gray-100 text-gray-800'}`}>
                  <Icon className="h-4 w-4" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{typeConfig?.label || interaction.interaction_type}</h4>
                      <Badge variant="outline" className="text-xs">
                        {dateTime.relative}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{dateTime.time}</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-2">
                    {interaction.description}
                  </p>

                  {/* Related Booking */}
                  {interaction.booking && (
                    <div className="flex items-center space-x-2 mt-2">
                      <Button variant="ghost" size="sm" className="h-auto p-1">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        <span className="text-xs">View Booking</span>
                      </Button>
                    </div>
                  )}

                  {/* Metadata */}
                  {interaction.metadata && Object.keys(interaction.metadata).length > 0 && (
                    <div className="mt-2 p-2 bg-muted rounded text-xs">
                      <details>
                        <summary className="cursor-pointer font-medium">Additional Details</summary>
                        <pre className="mt-1 text-xs overflow-x-auto">
                          {JSON.stringify(interaction.metadata, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}