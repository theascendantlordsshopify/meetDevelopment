'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { 
  Mail, 
  Phone, 
  Building, 
  Calendar,
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  Tag,
  Clock,
  User,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { InteractionTimeline } from './interaction-timeline';
import { AddInteractionForm } from './add-interaction-form';
import { getInitials } from '@/lib/utils';
import { Contact, ContactInteraction } from '@/types';

interface ContactDetailsModalProps {
  contact: Contact;
  interactions: ContactInteraction[];
  isOpen: boolean;
  onClose: () => void;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
  onAddInteraction: (interaction: Omit<ContactInteraction, 'id' | 'created_at' | 'updated_at'>) => void;
  isLoading?: boolean;
}

export function ContactDetailsModal({
  contact,
  interactions,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onAddInteraction,
  isLoading = false,
}: ContactDetailsModalProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [showAddInteraction, setShowAddInteraction] = useState(false);

  const fullName = `${contact.first_name} ${contact.last_name || ''}`.trim();

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const formatLastBooking = (dateString: string | null) => {
    if (!dateString) return 'No bookings yet';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const handleAddInteraction = (interactionData: any) => {
    onAddInteraction({
      contact: contact.id,
      organizer: contact.organizer,
      ...interactionData,
    });
    setShowAddInteraction(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                {getInitials(fullName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-xl font-bold">{fullName}</div>
              {contact.company && (
                <div className="text-sm text-muted-foreground">{contact.company}</div>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="interactions">
              Interactions ({interactions.length})
            </TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Contact Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{contact.email}</div>
                        <div className="text-sm text-muted-foreground">Email</div>
                      </div>
                    </div>

                    {contact.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{contact.phone}</div>
                          <div className="text-sm text-muted-foreground">Phone</div>
                        </div>
                      </div>
                    )}

                    {contact.company && (
                      <div className="flex items-center space-x-3">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{contact.company}</div>
                          <div className="text-sm text-muted-foreground">
                            {contact.job_title || 'Company'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status</span>
                      <Badge variant={contact.is_active ? 'default' : 'secondary'}>
                        {contact.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Booking Statistics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold">{contact.total_bookings}</div>
                      <div className="text-sm text-muted-foreground">Total Bookings</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">
                        {formatLastBooking(contact.last_booking_date)}
                      </div>
                      <div className="text-sm text-muted-foreground">Last Booking</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Contact since {formatDate(contact.created_at)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tags */}
            {contact.tags && contact.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Tag className="h-5 w-5" />
                    <span>Tags</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {contact.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {contact.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{contact.notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex space-x-2">
              <Button onClick={() => onEdit(contact)} className="flex-1">
                <Edit className="h-4 w-4 mr-2" />
                Edit Contact
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAddInteraction(true)}
                className="flex-1"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Interaction
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => onDelete(contact)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          {/* Interactions Tab */}
          <TabsContent value="interactions" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Interaction Timeline</h3>
              <Button onClick={() => setShowAddInteraction(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Interaction
              </Button>
            </div>

            <InteractionTimeline 
              interactions={interactions}
              contactId={contact.id}
            />

            {/* Add Interaction Dialog */}
            <Dialog open={showAddInteraction} onOpenChange={setShowAddInteraction}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Interaction</DialogTitle>
                  <DialogDescription>
                    Record a new interaction with {fullName}.
                  </DialogDescription>
                </DialogHeader>
                <AddInteractionForm
                  contactId={contact.id}
                  onSubmit={handleAddInteraction}
                  onCancel={() => setShowAddInteraction(false)}
                />
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Booking History</h3>
              <Badge variant="outline">
                {contact.total_bookings} total booking{contact.total_bookings !== 1 ? 's' : ''}
              </Badge>
            </div>

            {contact.total_bookings === 0 ? (
              <Alert>
                <AlertDescription>
                  No bookings found for this contact. Bookings will appear here once they schedule with you.
                </AlertDescription>
              </Alert>
            ) : (
              <Card>
                <CardContent className="p-4">
                  <div className="text-center text-muted-foreground">
                    Booking history integration coming soon. 
                    This will show all bookings made by this contact.
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}