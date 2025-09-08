'use client';

import { format } from 'date-fns';
import { 
  Mail, 
  Phone, 
  Building, 
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  UserPlus,
  MessageSquare
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
import { getInitials } from '@/lib/utils';
import { Contact } from '@/types';

interface ContactCardProps {
  contact: Contact;
  onView: (contact: Contact) => void;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
  onAddToGroup: (contact: Contact) => void;
  onAddInteraction: (contact: Contact) => void;
  isLoading?: boolean;
}

export function ContactCard({
  contact,
  onView,
  onEdit,
  onDelete,
  onAddToGroup,
  onAddInteraction,
  isLoading = false,
}: ContactCardProps) {
  const fullName = `${contact.first_name} ${contact.last_name || ''}`.trim();

  const formatLastBooking = (dateString: string | null) => {
    if (!dateString) return 'No bookings';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                {getInitials(fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg leading-tight">{fullName}</CardTitle>
              {contact.company && (
                <p className="text-sm text-muted-foreground mt-1">{contact.company}</p>
              )}
              {contact.job_title && (
                <p className="text-xs text-muted-foreground">{contact.job_title}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={contact.is_active ? 'default' : 'secondary'}>
              {contact.is_active ? 'Active' : 'Inactive'}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" disabled={isLoading}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(contact)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(contact)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Contact
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAddToGroup(contact)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add to Group
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAddInteraction(contact)}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Add Interaction
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete(contact)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Contact
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Contact Information */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{contact.email}</span>
          </div>
          
          {contact.phone && (
            <div className="flex items-center space-x-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{contact.phone}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {contact.tags && contact.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {contact.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {contact.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{contact.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t text-center">
          <div>
            <div className="text-lg font-semibold">{contact.total_bookings}</div>
            <div className="text-xs text-muted-foreground">Bookings</div>
          </div>
          <div>
            <div className="text-sm font-medium">
              {formatLastBooking(contact.last_booking_date)}
            </div>
            <div className="text-xs text-muted-foreground">Last Booking</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex space-x-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(contact)}
            className="flex-1"
          >
            View Details
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddInteraction(contact)}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}