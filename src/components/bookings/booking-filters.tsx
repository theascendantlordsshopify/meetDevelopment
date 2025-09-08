'use client';

import { useState } from 'react';
import { Search, Filter, Calendar, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { BOOKING_STATUSES } from '@/constants';
import { cn } from '@/lib/utils';
import { type BookingFilterData } from '@/lib/validations/bookings';

interface BookingFiltersProps {
  filters: BookingFilterData;
  onFiltersChange: (filters: BookingFilterData) => void;
  onExport: () => void;
  onRefresh: () => void;
  eventTypes: Array<{ id: string; name: string }>;
  isLoading?: boolean;
}

export function BookingFilters({
  filters,
  onFiltersChange,
  onExport,
  onRefresh,
  eventTypes,
  isLoading = false,
}: BookingFiltersProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(
    filters.start_date ? new Date(filters.start_date) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    filters.end_date ? new Date(filters.end_date) : undefined
  );
  const [startCalendarOpen, setStartCalendarOpen] = useState(false);
  const [endCalendarOpen, setEndCalendarOpen] = useState(false);

  const updateFilter = (key: keyof BookingFilterData, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
    updateFilter('start_date', date ? format(date, 'yyyy-MM-dd') : undefined);
    setStartCalendarOpen(false);
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    updateFilter('end_date', date ? format(date, 'yyyy-MM-dd') : undefined);
    setEndCalendarOpen(false);
  };

  const clearDateFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    onFiltersChange({
      ...filters,
      start_date: undefined,
      end_date: undefined,
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.start_date) count++;
    if (filters.end_date) count++;
    if (filters.event_type) count++;
    if (filters.search) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Search and Quick Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search bookings..."
                  value={filters.search || ''}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {activeFilterCount > 0 && (
                <Badge variant="secondary">
                  {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                disabled={isLoading}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value: any) => updateFilter('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {BOOKING_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Event Type Filter */}
            <div className="space-y-2">
              <Label>Event Type</Label>
              <Select
                value={filters.event_type || 'all'}
                onValueChange={(value) => updateFilter('event_type', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Event Types</SelectItem>
                  {eventTypes.map((eventType) => (
                    <SelectItem key={eventType.id} value={eventType.id}>
                      {eventType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start Date Filter */}
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover open={startCalendarOpen} onOpenChange={setStartCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !startDate && 'text-muted-foreground'
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'MMM d, yyyy') : 'Start date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={handleStartDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date Filter */}
            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover open={endCalendarOpen} onOpenChange={setEndCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !endDate && 'text-muted-foreground'
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'MMM d, yyyy') : 'End date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={handleEndDateChange}
                    disabled={(date) => startDate ? date < startDate : false}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm text-muted-foreground">
                {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} applied
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStartDate(undefined);
                  setEndDate(undefined);
                  onFiltersChange({
                    status: 'all',
                    start_date: undefined,
                    end_date: undefined,
                    event_type: undefined,
                    search: undefined,
                  });
                }}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}