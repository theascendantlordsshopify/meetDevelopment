'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CustomQuestionBuilder } from './custom-question-builder';
import { eventTypeSchema, type EventTypeData, type CustomQuestionData } from '@/lib/validations/events';
import { EVENT_DURATIONS, LOCATION_TYPES, BUFFER_TIME_OPTIONS, SLOT_INTERVAL_OPTIONS } from '@/constants';
import { slugify } from '@/lib/utils';
import toast from 'react-hot-toast';

interface EventTypeFormProps {
  initialData?: Partial<EventTypeData>;
  initialQuestions?: CustomQuestionData[];
  onSubmit: (data: EventTypeData, questions: CustomQuestionData[]) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function EventTypeForm({
  initialData,
  initialQuestions = [],
  onSubmit,
  onCancel,
  isLoading = false,
}: EventTypeFormProps) {
  const [customQuestions, setCustomQuestions] = useState<CustomQuestionData[]>(initialQuestions);
  const [activeTab, setActiveTab] = useState('basic');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EventTypeData>({
    resolver: zodResolver(eventTypeSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      event_type_slug: initialData?.event_type_slug ?? '',
      description: initialData?.description ?? '',
      duration: initialData?.duration ?? 30,
      max_attendees: initialData?.max_attendees ?? 1,
      enable_waitlist: initialData?.enable_waitlist ?? false,
      is_active: initialData?.is_active ?? true,
      is_private: initialData?.is_private ?? false,
      min_scheduling_notice: initialData?.min_scheduling_notice ?? 0,
      max_scheduling_horizon: initialData?.max_scheduling_horizon ?? 10080,
      buffer_time_before: initialData?.buffer_time_before ?? 0,
      buffer_time_after: initialData?.buffer_time_after ?? 0,
      max_bookings_per_day: initialData?.max_bookings_per_day,
      slot_interval_minutes: initialData?.slot_interval_minutes ?? 15,
      location_type: initialData?.location_type ?? 'video_call',
      location_details: initialData?.location_details ?? '',
      redirect_url_after_booking: initialData?.redirect_url_after_booking ?? '',
    },
  });

  const watchedValues = watch();

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setValue('name', name);
    if (!initialData?.event_type_slug) {
      setValue('event_type_slug', slugify(name));
    }
  };

  const handleFormSubmit = async (data: EventTypeData) => {
    try {
      await onSubmit(data, customQuestions);
      toast.success('Event type saved successfully');
    } catch (error: any) {
      toast.error(error.error || 'Failed to save event type');
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) return `${hours}h`;
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatNotice = (minutes: number) => {
    if (minutes === 0) return 'No minimum notice';
    if (minutes < 60) return `${minutes} minutes`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} hours`;
    return `${Math.floor(minutes / 1440)} days`;
  };

  const isGroupEvent = watchedValues.max_attendees > 1;

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {initialData ? 'Edit Event Type' : 'Create Event Type'}
        </CardTitle>
        <CardDescription>
          Configure your bookable event with all the details invitees will see.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="questions">Questions</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Event Name *</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    onChange={handleNameChange}
                    placeholder="e.g., 30 Minute Meeting"
                    disabled={isSubmitting || isLoading}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event_type_slug">URL Slug *</Label>
                  <Input
                    id="event_type_slug"
                    {...register('event_type_slug')}
                    placeholder="30-minute-meeting"
                    disabled={isSubmitting || isLoading}
                  />
                  {errors.event_type_slug && (
                    <p className="text-sm text-destructive">{errors.event_type_slug.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Describe what this meeting is about..."
                  rows={3}
                  disabled={isSubmitting || isLoading}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration *</Label>
                  <Select
                    value={watchedValues.duration.toString()}
                    onValueChange={(value) => setValue('duration', parseInt(value))}
                    disabled={isSubmitting || isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENT_DURATIONS.map((minutes) => (
                        <SelectItem key={minutes} value={minutes.toString()}>
                          {formatDuration(minutes)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_attendees">Max Attendees</Label>
                  <Input
                    id="max_attendees"
                    type="number"
                    min="1"
                    max="100"
                    {...register('max_attendees', { valueAsNumber: true })}
                    disabled={isSubmitting || isLoading}
                  />
                  {errors.max_attendees && (
                    <p className="text-sm text-destructive">{errors.max_attendees.message}</p>
                  )}
                </div>
              </div>

              {isGroupEvent && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enable_waitlist"
                    checked={watchedValues.enable_waitlist}
                    onCheckedChange={(checked) => setValue('enable_waitlist', checked)}
                    disabled={isSubmitting || isLoading}
                  />
                  <Label htmlFor="enable_waitlist">Enable waitlist when full</Label>
                </div>
              )}

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={watchedValues.is_active}
                    onCheckedChange={(checked) => setValue('is_active', checked)}
                    disabled={isSubmitting || isLoading}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_private"
                    checked={watchedValues.is_private}
                    onCheckedChange={(checked) => setValue('is_private', checked)}
                    disabled={isSubmitting || isLoading}
                  />
                  <Label htmlFor="is_private">Private (link only)</Label>
                </div>
              </div>
            </TabsContent>

            {/* Scheduling Tab */}
            <TabsContent value="scheduling" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min_scheduling_notice">Minimum Notice</Label>
                  <Select
                    value={watchedValues.min_scheduling_notice.toString()}
                    onValueChange={(value) => setValue('min_scheduling_notice', parseInt(value))}
                    disabled={isSubmitting || isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No minimum notice</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                      <SelectItem value="240">4 hours</SelectItem>
                      <SelectItem value="480">8 hours</SelectItem>
                      <SelectItem value="1440">1 day</SelectItem>
                      <SelectItem value="2880">2 days</SelectItem>
                      <SelectItem value="10080">1 week</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    {formatNotice(watchedValues.min_scheduling_notice)}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_scheduling_horizon">Booking Window</Label>
                  <Select
                    value={watchedValues.max_scheduling_horizon.toString()}
                    onValueChange={(value) => setValue('max_scheduling_horizon', parseInt(value))}
                    disabled={isSubmitting || isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1440">1 day</SelectItem>
                      <SelectItem value="10080">1 week</SelectItem>
                      <SelectItem value="20160">2 weeks</SelectItem>
                      <SelectItem value="43200">1 month</SelectItem>
                      <SelectItem value="129600">3 months</SelectItem>
                      <SelectItem value="259200">6 months</SelectItem>
                      <SelectItem value="525600">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    How far in advance can people book
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="buffer_time_before">Buffer Before</Label>
                  <Select
                    value={watchedValues.buffer_time_before.toString()}
                    onValueChange={(value) => setValue('buffer_time_before', parseInt(value))}
                    disabled={isSubmitting || isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BUFFER_TIME_OPTIONS.map((minutes) => (
                        <SelectItem key={minutes} value={minutes.toString()}>
                          {minutes === 0 ? 'No buffer' : `${minutes} min`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buffer_time_after">Buffer After</Label>
                  <Select
                    value={watchedValues.buffer_time_after.toString()}
                    onValueChange={(value) => setValue('buffer_time_after', parseInt(value))}
                    disabled={isSubmitting || isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BUFFER_TIME_OPTIONS.map((minutes) => (
                        <SelectItem key={minutes} value={minutes.toString()}>
                          {minutes === 0 ? 'No buffer' : `${minutes} min`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slot_interval_minutes">Slot Interval</Label>
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
                          {minutes} min
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_bookings_per_day">Daily Booking Limit (Optional)</Label>
                <Input
                  id="max_bookings_per_day"
                  type="number"
                  min="1"
                  placeholder="No limit"
                  {...register('max_bookings_per_day', { valueAsNumber: true })}
                  disabled={isSubmitting || isLoading}
                />
                <p className="text-sm text-muted-foreground">
                  Maximum number of bookings allowed per day
                </p>
              </div>
            </TabsContent>

            {/* Location Tab */}
            <TabsContent value="location" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="location_type">Location Type *</Label>
                  <Select
                    value={watchedValues.location_type}
                    onValueChange={(value: any) => setValue('location_type', value)}
                    disabled={isSubmitting || isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LOCATION_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {(watchedValues.location_type === 'in_person' || watchedValues.location_type === 'custom') && (
                  <div className="space-y-2">
                    <Label htmlFor="location_details">Location Details</Label>
                    <Textarea
                      id="location_details"
                      {...register('location_details')}
                      placeholder={
                        watchedValues.location_type === 'in_person'
                          ? 'Enter the address or meeting location...'
                          : 'Enter custom location details...'
                      }
                      rows={3}
                      disabled={isSubmitting || isLoading}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="redirect_url_after_booking">Redirect URL (Optional)</Label>
                  <Input
                    id="redirect_url_after_booking"
                    type="url"
                    {...register('redirect_url_after_booking')}
                    placeholder="https://example.com/thank-you"
                    disabled={isSubmitting || isLoading}
                  />
                  <p className="text-sm text-muted-foreground">
                    Redirect invitees to this URL after booking
                  </p>
                  {errors.redirect_url_after_booking && (
                    <p className="text-sm text-destructive">{errors.redirect_url_after_booking.message}</p>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Questions Tab */}
            <TabsContent value="questions" className="space-y-6">
              <CustomQuestionBuilder
                questions={customQuestions}
                onQuestionsChange={setCustomQuestions}
                disabled={isSubmitting || isLoading}
              />
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <div className="flex space-x-2 pt-6 border-t">
            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="flex-1"
            >
              {isSubmitting ? 'Saving...' : initialData ? 'Update Event Type' : 'Create Event Type'}
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