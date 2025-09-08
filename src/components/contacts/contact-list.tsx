'use client';

import { useState } from 'react';
import { Search, Filter, Grid, List, Download, Upload, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ContactCard } from './contact-card';
import { ContactTableView } from './contact-table-view';
import { ContactFilters } from './contact-filters';
import { type ContactFilterData } from '@/lib/validations/contacts';
import { Contact, ContactGroup } from '@/types';
import { cn } from '@/lib/utils';

interface ContactListProps {
  contacts: Contact[];
  groups: ContactGroup[];
  filters: ContactFilterData;
  onFiltersChange: (filters: ContactFilterData) => void;
  onContactView: (contact: Contact) => void;
  onContactEdit: (contact: Contact) => void;
  onContactDelete: (contact: Contact) => void;
  onContactAddToGroup: (contact: Contact) => void;
  onContactAddInteraction: (contact: Contact) => void;
  onImport: () => void;
  onExport: () => void;
  isLoading?: boolean;
  viewMode?: 'grid' | 'table';
  onViewModeChange?: (mode: 'grid' | 'table') => void;
}

export function ContactList({
  contacts,
  groups,
  filters,
  onFiltersChange,
  onContactView,
  onContactEdit,
  onContactDelete,
  onContactAddToGroup,
  onContactAddInteraction,
  onImport,
  onExport,
  isLoading = false,
  viewMode = 'grid',
  onViewModeChange,
}: ContactListProps) {
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  const handleSelectContact = (contactId: string, selected: boolean) => {
    if (selected) {
      setSelectedContacts([...selectedContacts, contactId]);
    } else {
      setSelectedContacts(selectedContacts.filter(id => id !== contactId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedContacts(contacts.map(c => c.id));
    } else {
      setSelectedContacts([]);
    }
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.group) count++;
    if (filters.tags.length > 0) count++;
    if (filters.is_active !== undefined) count++;
    if (filters.has_bookings !== undefined) count++;
    if (filters.company) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search contacts..."
              value={filters.search || ''}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="pl-10 w-64"
            />
          </div>
          
          {activeFilterCount > 0 && (
            <Badge variant="secondary">
              {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={onImport} disabled={isLoading}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" onClick={onExport} disabled={isLoading}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          {onViewModeChange && (
            <div className="flex items-center space-x-1 border rounded-md p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('table')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      <ContactFilters
        filters={filters}
        onFiltersChange={onFiltersChange}
        groups={groups}
        availableTags={[...new Set(contacts.flatMap(c => c.tags))]}
        availableCompanies={[...new Set(contacts.map(c => c.company).filter(Boolean))]}
      />

      {/* Bulk Actions */}
      {selectedContacts.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span className="font-medium">
                  {selectedContacts.length} contact{selectedContacts.length > 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  Add to Group
                </Button>
                <Button variant="outline" size="sm">
                  Export Selected
                </Button>
                <Button variant="outline" size="sm" className="text-destructive">
                  Delete Selected
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedContacts([])}>
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="spinner w-8 h-8" />
          <span className="ml-2">Loading contacts...</span>
        </div>
      ) : contacts.length === 0 ? (
        <Alert>
          <AlertDescription>
            {activeFilterCount > 0 
              ? "No contacts match your current filters."
              : "No contacts found. Add your first contact or import from a CSV file."
            }
          </AlertDescription>
        </Alert>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onView={onContactView}
              onEdit={onContactEdit}
              onDelete={onContactDelete}
              onAddToGroup={onContactAddToGroup}
              onAddInteraction={onContactAddInteraction}
              isLoading={isLoading}
            />
          ))}
        </div>
      ) : (
        <ContactTableView
          contacts={contacts}
          selectedContacts={selectedContacts}
          onSelectContact={handleSelectContact}
          onSelectAll={handleSelectAll}
          onContactView={onContactView}
          onContactEdit={onContactEdit}
          onContactDelete={onContactDelete}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}