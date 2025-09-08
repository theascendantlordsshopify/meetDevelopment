'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { bufferTimeSchema, type BufferTimeData } from '@/lib/validations/availability';
import { BUFFER_TIME_OPTIONS, SLOT_INTERVAL_OPTIONS } from '@/constants';
import toast from 'react-hot-toast';

interface BufferTimeFormProps {
  initialData?: Partial<BufferTimeData>;
  onSubmit: (data: BufferTimeData) => Promise<void>;
  isLoading?: boolean;
}

export function BufferTimeForm({
  initialData,
  onSubmit,
  isLoading = false,
}: BufferTimeFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BufferTimeData>({
    resolver: zodResolver(bufferTimeSchema),
    defaultValues: {
      default_buffer_before: initialData?.default_buffer_before ?? 0,
      default_buffer_after: initialData?.default_buffer_after ?? 0,
      minimum_gap: initialData?.minimum_gap ?? 0,
      slot_interval_minutes: initialData?.slot_interval_minutes ?? 15,
    },
  });

  const watchedValues = watch();

  const handleFormSubmit = async (data: BufferTimeData) => {
    try {
      await onSubmit(data);
      toast.success('Buffer time settings saved successfully');
    } catch (error: any) {
      toast.error(error.error || 'Failed to save buffer time settings');
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes === 0) return 'No buffer';
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buffer Time Settings</CardTitle>
        <CardDescription>
          Configure default buffer times and scheduling intervals for all your event types.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Buffer Before */}
          <div className="space-y-2">
            <Label htmlFor="default_buffer_before">Buffer Time Before Meetings</Label>
            <Select
              value={watchedValues.default_buffer_before.toString()}
              onValueChange={(value) => setValue('default_buffer_before', parseInt(value))}
              disabled={isSubmitting || isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BUFFER_TIME_OPTIONS.map((minutes) => (
                  <SelectItem key={minutes} value={minutes.toString()}>
                    {formatDuration(minutes)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Time blocked before each meeting for preparation
            </p>
            {errors.default_buffer_before && (
              <p className="text-sm text-destructive">{errors.default_buffer_before.message}</p>
            )}
          </div>

          {/* Buffer After */}
          <div className="space-y-2">
            <Label htmlFor="default_buffer_after">Buffer Time After Meetings</Label>
            <Select
              value={watchedValues.default_buffer_after.toString()}
              onValueChange={(value) => setValue('default_buffer_after', parseInt(value))}
              disabled={isSubmitting || isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BUFFER_TIME_OPTIONS.map((minutes) => (
                  <SelectItem key={minutes} value={minutes.toString()}>
                    {formatDuration(minutes)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Time blocked after each meeting for notes and follow-up
            </p>
            {errors.default_buffer_after && (
              <p className="text-sm text-destructive">{errors.default_buffer_after.message}</p>
            )}
          </div>

          {/* Minimum Gap */}
          <div className="space-y-2">
            <Label htmlFor="minimum_gap">Minimum Gap Between Meetings</Label>
            <Select
              value={watchedValues.minimum_gap.toString()}
              onValueChange={(value) => setValue('minimum_gap', parseInt(value))}
              disabled={isSubmitting || isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BUFFER_TIME_OPTIONS.filter(m => m <= 60).map((minutes) => (
                  <SelectItem key={minutes} value={minutes.toString()}>
                    {formatDuration(minutes)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Minimum time required between back-to-back meetings
            </p>
            {errors.minimum_gap && (
              <p className="text-sm text-destructive">{errors.minimum_gap.message}</p>
            )}
          </div>

          {/* Slot Interval */}
          <div className="space-y-2">
            <Label htmlFor="slot_interval_minutes">Time Slot Intervals</Label>
            <Select
              value={watchedValues.slot_interval_minutes.toString()}
              onValueChange={(value) => setValue('slot_interval_minutes', parseInt(value))}
              disabled={isSubmitting || isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SLOT_INTERVAL_OPTIONS.map((minutes) => (
                  <SelectItem key={minutes} value={minutes.toString()}>
                    {minutes} minutes
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              How often time slots are offered (e.g., every 15 minutes)
            </p>
            {errors.slot_interval_minutes && (
              <p className="text-sm text-destructive">{errors.slot_interval_minutes.message}</p>
            )}
          </div>

          {/* Preview */}
          <Alert>
            <AlertDescription>
              <strong>Preview:</strong> With these settings, meetings will have {formatDuration(watchedValues.default_buffer_before)} before, 
              {formatDuration(watchedValues.default_buffer_after)} after, with a minimum {formatDuration(watchedValues.minimum_gap)} gap 
              between meetings. Time slots will be offered every {watchedValues.slot_interval_minutes} minutes.
            </AlertDescription>
          </Alert>

          {/* Form Actions */}
          <div className="flex space-x-2">
            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="flex-1"
            >
              {isSubmitting ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}