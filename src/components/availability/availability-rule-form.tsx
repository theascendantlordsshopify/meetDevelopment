'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TimeRangePicker } from './time-range-picker';
import { DayOfWeekSelector } from './day-of-week-selector';
import { availabilityRuleSchema, type AvailabilityRuleData } from '@/lib/validations/availability';
import { DAYS_OF_WEEK } from '@/constants';
import toast from 'react-hot-toast';

interface AvailabilityRuleFormProps {
  initialData?: Partial<AvailabilityRuleData>;
  onSubmit: (data: AvailabilityRuleData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function AvailabilityRuleForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: AvailabilityRuleFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AvailabilityRuleData>({
    resolver: zodResolver(availabilityRuleSchema),
    defaultValues: {
      day_of_week: initialData?.day_of_week ?? 0,
      start_time: initialData?.start_time ?? '09:00',
      end_time: initialData?.end_time ?? '17:00',
      event_types: initialData?.event_types ?? [],
      is_active: initialData?.is_active ?? true,
    },
  });

  const watchedValues = watch();

  const handleFormSubmit = async (data: AvailabilityRuleData) => {
    try {
      await onSubmit(data);
      toast.success('Availability rule saved successfully');
    } catch (error: any) {
      toast.error(error.error || 'Failed to save availability rule');
    }
  };

  const getDayName = (dayValue: number) => {
    return DAYS_OF_WEEK.find(d => d.value === dayValue)?.label || 'Unknown';
  };

  const spansMiddnight = watchedValues.start_time && watchedValues.end_time && 
    watchedValues.start_time > watchedValues.end_time;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initialData ? 'Edit Availability Rule' : 'Create Availability Rule'}
        </CardTitle>
        <CardDescription>
          Set your recurring weekly availability for {getDayName(watchedValues.day_of_week)}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Day Selection */}
          <div className="space-y-2">
            <Label>Day of Week</Label>
            <DayOfWeekSelector
              selectedDays={[watchedValues.day_of_week]}
              onDaysChange={(days) => setValue('day_of_week', days[0] || 0)}
              multiple={false}
              disabled={isSubmitting || isLoading}
            />
          </div>

          {/* Time Range */}
          <div className="space-y-2">
            <Label>Available Hours</Label>
            <TimeRangePicker
              startTime={watchedValues.start_time}
              endTime={watchedValues.end_time}
              onStartTimeChange={(time) => setValue('start_time', time)}
              onEndTimeChange={(time) => setValue('end_time', time)}
              disabled={isSubmitting || isLoading}
            />
            {errors.start_time && (
              <p className="text-sm text-destructive">{errors.start_time.message}</p>
            )}
            {errors.end_time && (
              <p className="text-sm text-destructive">{errors.end_time.message}</p>
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

          {/* Midnight Spanning Warning */}
          {spansMiddnight && (
            <Alert>
              <AlertDescription>
                This rule spans midnight, meaning it covers time from {watchedValues.start_time} on {getDayName(watchedValues.day_of_week)} 
                until {watchedValues.end_time} on {getDayName((watchedValues.day_of_week + 1) % 7)}.
              </AlertDescription>
            </Alert>
          )}

          {/* Form Actions */}
          <div className="flex space-x-2">
            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="flex-1"
            >
              {isSubmitting ? 'Saving...' : 'Save Rule'}
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