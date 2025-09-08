'use client';

import { format } from 'date-fns';
import { Mail, Phone, Building, Calendar, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getInitials } from '@/lib/utils';
import { Contact } from '@/types';

interface ContactTableViewProps {
  contacts: Contact[];
  selectedContacts: string[];
  onSelectContact: (contactId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onContactView: (contact: Contact) => void;
  onContactEdit: (contact: Contact) => void;
  onContactDelete: (contact: Contact) => void;
  isLoading?: boolean;
}

export function ContactTableView({
  contacts,
  selectedContacts,
  onSelectContact,
  onSelectAll,
  onContactView,
  onContactEdit,
  onContactDelete,
  isLoading = false,
}: ContactTableViewProps) {
  const allSelected = contacts.length > 0 && selectedContacts.length === contacts.length;
  const someSelected = selectedContacts.length > 0 && selectedContacts.length < contacts.length;

  const formatLastBooking = (dateString: string | null) => {
    if (!dateString) return 'Never';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onCheckedChange={onSelectAll}
                disabled={isLoading}
              />
            </TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Contact Info</TableHead>
            <TableHead>Bookings</TableHead>
            <TableHead>Last Booking</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => {
            const fullName = `${contact.first_name} ${contact.last_name || ''}`.trim();
            const isSelected = selectedContacts.includes(contact.id);

            return (
              <TableRow key={contact.id} className="hover:bg-muted/50">
                <TableCell>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => onSelectContact(contact.id, !!checked)}
                    disabled={isLoading}
                  />
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                        {getInitials(fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{fullName}</div>
                      {contact.job_title && (
                        <div className="text-sm text-muted-foreground">{contact.job_title}</div>
                      )}
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  {contact.company ? (
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span>{contact.company}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>

                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span className="truncate max-w-48">{contact.email}</span>
                    </div>
                    {contact.phone && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span>{contact.phone}</span>
                      </div>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="text-center">
                    <div className="font-semibold">{contact.total_bookings}</div>
                    <div className="text-xs text-muted-foreground">bookings</div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span>{formatLastBooking(contact.last_booking_date)}</span>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge variant={contact.is_active ? 'default' : 'secondary'}>
                    {contact.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>

                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" disabled={isLoading}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onContactView(contact)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onContactEdit(contact)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Contact
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onContactDelete(contact)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Contact
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}