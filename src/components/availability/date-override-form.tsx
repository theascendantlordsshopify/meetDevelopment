'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TimeRangePicker } from './time-range-picker';
import { dateOverrideRuleSchema, type DateOverrideRuleData } from '@/lib/validations/availability';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface DateOverrideFormProps {
  initialData?: Partial<DateOverrideRuleData>;
  onSubmit: (data: DateOverrideRuleData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function DateOverrideForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: DateOverrideFormProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialData?.date ? new Date(initialData.date) : undefined
  );
  const [calendarOpen, setCalendarOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DateOverrideRuleData>({
    resolver: zodResolver(dateOverrideRuleSchema),
    defaultValues: {
      date: initialData?.date ?? '',
      is_available: initialData?.is_available ?? false,
      start_time: initialData?.start_time ?? '09:00',
      end_time: initialData?.end_time ?? '17:00',
      event_types: initialData?.event_types ?? [],
      reason: initialData?.reason ?? '',
      is_active: initialData?.is_active ?? true,
    },
  });

  const watchedValues = watch();

  const handleFormSubmit = async (data: DateOverrideRuleData) => {
    try {
      await onSubmit(data);
      toast.success('Date override saved successfully');
    } catch (error: any) {
      toast.error(error.error || 'Failed to save date override');
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setValue('date', format(date, 'yyyy-MM-dd'));
      setCalendarOpen(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initialData ? 'Edit Date Override' : 'Create Date Override'}
        </CardTitle>
        <CardDescription>
          Override your regular availability for a specific date.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Date Selection */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !selectedDate && 'text-muted-foreground'
                  )}
                  disabled={isSubmitting || isLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            )}
          </div>

          {/* Available Toggle */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_available"
                checked={watchedValues.is_available}
                onCheckedChange={(checked) => setValue('is_available', checked)}
                disabled={isSubmitting || isLoading}
              />
              <Label htmlFor="is_available">
                {watchedValues.is_available ? 'Available on this date' : 'Unavailable on this date'}
              </Label>
            </div>

            {/* Time Range (only if available) */}
            {watchedValues.is_available && (
              <div className="space-y-2">
                <Label>Available Hours</Label>
                <TimeRangePicker
                  startTime={watchedValues.start_time || '09:00'}
                  endTime={watchedValues.end_time || '17:00'}
                  onStartTimeChange={(time) => setValue('start_time', time)}
                  onEndTimeChange={(time) => setValue('end_time', time)}
                  disabled={isSubmitting || isLoading}
                />
                {errors.start_time && (
                  <p className="text-sm text-destructive">{errors.start_time.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Textarea
              id="reason"
              {...register('reason')}
              placeholder="e.g., Holiday, Vacation, Special event..."
              disabled={isSubmitting || isLoading}
            />
            {errors.reason && (
              <p className="text-sm text-destructive">{errors.reason.message}</p>
            )}
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={watchedValues.is_active}
              onCheckedChange={(checked) => setValue('is_active', checked)}
              disabled={isSubmitting || isLoading}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>

          {/* Form Actions */}
          <div className="flex space-x-2">
            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="flex-1"
            >
              {isSubmitting ? 'Saving...' : 'Save Override'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting || isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}