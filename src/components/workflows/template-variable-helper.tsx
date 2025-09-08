'use client';

import { useState } from 'react';
import { Search, Copy, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import toast from 'react-hot-toast';

interface TemplateVariable {
  name: string;
  description: string;
  example: string;
  category: string;
}

interface TemplateVariableHelperProps {
  onVariableInsert: (variable: string) => void;
  className?: string;
}

const TEMPLATE_VARIABLES: TemplateVariable[] = [
  // Booking Variables
  { name: 'booking_id', description: 'Unique booking identifier', example: 'abc123-def456', category: 'Booking' },
  { name: 'invitee_name', description: 'Full name of the invitee', example: 'John Doe', category: 'Booking' },
  { name: 'invitee_email', description: 'Email address of the invitee', example: 'john@example.com', category: 'Booking' },
  { name: 'invitee_phone', description: 'Phone number of the invitee', example: '+1 (555) 123-4567', category: 'Booking' },
  { name: 'invitee_timezone', description: 'Timezone of the invitee', example: 'America/New_York', category: 'Booking' },
  { name: 'attendee_count', description: 'Number of attendees', example: '3', category: 'Booking' },
  { name: 'start_time', description: 'Meeting start time (organizer timezone)', example: 'Jan 15, 2024 at 2:00 PM', category: 'Booking' },
  { name: 'end_time', description: 'Meeting end time (organizer timezone)', example: 'Jan 15, 2024 at 3:00 PM', category: 'Booking' },
  { name: 'start_time_invitee', description: 'Start time in invitee timezone', example: 'Jan 15, 2024 at 3:00 PM', category: 'Booking' },
  { name: 'end_time_invitee', description: 'End time in invitee timezone', example: 'Jan 15, 2024 at 4:00 PM', category: 'Booking' },
  { name: 'duration', description: 'Meeting duration in minutes', example: '60', category: 'Booking' },
  { name: 'meeting_link', description: 'Video meeting URL', example: 'https://zoom.us/j/123456789', category: 'Booking' },
  { name: 'meeting_id', description: 'Meeting ID or room number', example: '123 456 789', category: 'Booking' },
  { name: 'meeting_password', description: 'Meeting password', example: 'abc123', category: 'Booking' },
  { name: 'cancellation_reason', description: 'Reason for cancellation', example: 'Schedule conflict', category: 'Booking' },
  
  // Event Type Variables
  { name: 'event_type_name', description: 'Name of the event type', example: '30 Minute Meeting', category: 'Event Type' },
  { name: 'event_type_description', description: 'Event type description', example: 'Quick consultation call', category: 'Event Type' },
  { name: 'event_type_duration', description: 'Event duration in minutes', example: '30', category: 'Event Type' },
  { name: 'event_type_location_type', description: 'Type of meeting location', example: 'video_call', category: 'Event Type' },
  
  // Organizer Variables
  { name: 'organizer_name', description: 'Full name of the organizer', example: 'Jane Smith', category: 'Organizer' },
  { name: 'organizer_email', description: 'Email address of the organizer', example: 'jane@company.com', category: 'Organizer' },
  { name: 'organizer_first_name', description: 'First name of the organizer', example: 'Jane', category: 'Organizer' },
  { name: 'organizer_last_name', description: 'Last name of the organizer', example: 'Smith', category: 'Organizer' },
  { name: 'organizer_company', description: 'Organizer company name', example: 'Acme Corp', category: 'Organizer' },
  { name: 'organizer_timezone', description: 'Organizer timezone', example: 'America/Los_Angeles', category: 'Organizer' },
  
  // URLs
  { name: 'booking_url', description: 'Booking management URL', example: 'https://app.com/booking/abc123/manage', category: 'URLs' },
  { name: 'reschedule_url', description: 'Reschedule booking URL', example: 'https://app.com/reschedule/abc123', category: 'URLs' },
  { name: 'cancel_url', description: 'Cancel booking URL', example: 'https://app.com/cancel/abc123', category: 'URLs' },
  
  // Time-based Variables
  { name: 'booking_date', description: 'Date of the booking', example: 'January 15, 2024', category: 'Time' },
  { name: 'booking_time', description: 'Time of the booking', example: '2:00 PM', category: 'Time' },
  { name: 'booking_day_of_week', description: 'Day of the week', example: 'Monday', category: 'Time' },
  
  // Derived Variables
  { name: 'invitee_first_name', description: 'First name extracted from full name', example: 'John', category: 'Derived' },
  { name: 'invitee_domain', description: 'Email domain of invitee', example: 'example.com', category: 'Derived' },
];

export function TemplateVariableHelper({ onVariableInsert, className }: TemplateVariableHelperProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(TEMPLATE_VARIABLES.map(v => v.category)))];

  const filteredVariables = TEMPLATE_VARIABLES.filter(variable => {
    const matchesSearch = variable.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         variable.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || variable.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleVariableClick = (variable: TemplateVariable) => {
    onVariableInsert(variable.name);
    toast.success(`Inserted {{${variable.name}}}`);
  };

  const copyVariable = async (variable: TemplateVariable) => {
    await navigator.clipboard.writeText(`{{${variable.name}}}`);
    toast.success('Variable copied to clipboard');
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Info className="h-4 w-4 mr-2" />
          Insert Variable
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Template Variables</CardTitle>
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search variables..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-80">
              <div className="p-4 space-y-2">
                {filteredVariables.map((variable) => (
                  <div
                    key={variable.name}
                    className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <code className="text-sm font-mono bg-muted px-1 rounded">
                          {`{{${variable.name}}}`}
                        </code>
                        <Badge variant="outline" className="text-xs">
                          {variable.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {variable.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Example: {variable.example}
                      </p>
                    </div>
                    <div className="flex space-x-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyVariable(variable)}
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVariableClick(variable)}
                        className="h-8 px-2 text-xs"
                      >
                        Insert
                      </Button>
                    </div>
                  </div>
                ))}
                
                {filteredVariables.length === 0 && (
                  <div className="text-center text-muted-foreground py-4">
                    No variables found matching your search.
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}