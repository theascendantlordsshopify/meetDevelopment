'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Bell, Mail, MessageSquare, Clock, Moon, Calendar, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TimeRangePicker } from '@/components/availability/time-range-picker';
import { notificationPreferenceSchema, type NotificationPreferenceData } from '@/lib/validations/notifications';
import toast from 'react-hot-toast';

interface NotificationPreferencesFormProps {
  initialData: NotificationPreferenceData;
  onSubmit: (data: NotificationPreferenceData) => Promise<void>;
  isLoading?: boolean;
}

const REMINDER_OPTIONS = [
  { value: 5, label: '5 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2 hours' },
  { value: 240, label: '4 hours' },
  { value: 480, label: '8 hours' },
  { value: 1440, label: '1 day' },
];

const AGENDA_TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => ({
  value: `${i.toString().padStart(2, '0')}:00`,
  label: `${i === 0 ? 12 : i > 12 ? i - 12 : i}:00 ${i >= 12 ? 'PM' : 'AM'}`,
}));

export function NotificationPreferencesForm({
  initialData,
  onSubmit,
  isLoading = false,
}: NotificationPreferencesFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<NotificationPreferenceData>({
    resolver: zodResolver(notificationPreferenceSchema),
    defaultValues: initialData,
  });

  const watchedValues = watch();

  const handleFormSubmit = async (data: NotificationPreferenceData) => {
    try {
      await onSubmit(data);
      toast.success('Preferences updated successfully');
    } catch (error: any) {
      toast.error(error.error || 'Failed to update preferences');
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="sms">SMS</TabsTrigger>
          <TabsTrigger value="timing">Timing</TabsTrigger>
          <TabsTrigger value="dnd">Do Not Disturb</TabsTrigger>
        </TabsList>

        {/* Email Preferences */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Email Notifications</span>
              </CardTitle>
              <CardDescription>
                Configure which email notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="booking_confirmations_email">Booking Confirmations</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email when new bookings are created
                    </p>
                  </div>
                  <Switch
                    id="booking_confirmations_email"
                    checked={watchedValues.booking_confirmations_email}
                    onCheckedChange={(checked) => setValue('booking_confirmations_email', checked)}
                    disabled={isSubmitting || isLoading}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="booking_reminders_email">Booking Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email reminders before meetings
                    </p>
                  </div>
                  <Switch
                    id="booking_reminders_email"
                    checked={watchedValues.booking_reminders_email}
                    onCheckedChange={(checked) => setValue('booking_reminders_email', checked)}
                    disabled={isSubmitting || isLoading}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="booking_cancellations_email">Booking Cancellations</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email when bookings are cancelled
                    </p>
                  </div>
                  <Switch
                    id="booking_cancellations_email"
                    checked={watchedValues.booking_cancellations_email}
                    onCheckedChange={(checked) => setValue('booking_cancellations_email', checked)}
                    disabled={isSubmitting || isLoading}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="daily_agenda_email">Daily Agenda</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive daily email with your schedule
                    </p>
                  </div>
                  <Switch
                    id="daily_agenda_email"
                    checked={watchedValues.daily_agenda_email}
                    onCheckedChange={(checked) => setValue('daily_agenda_email', checked)}
                    disabled={isSubmitting || isLoading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SMS Preferences */}
        <TabsContent value="sms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>SMS Notifications</span>
              </CardTitle>
              <CardDescription>
                Configure SMS notifications (standard messaging rates apply)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertDescription>
                  SMS notifications require a verified phone number. Standard messaging rates may apply.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="booking_confirmations_sms">Booking Confirmations</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive SMS when new bookings are created
                    </p>
                  </div>
                  <Switch
                    id="booking_confirmations_sms"
                    checked={watchedValues.booking_confirmations_sms}
                    onCheckedChange={(checked) => setValue('booking_confirmations_sms', checked)}
                    disabled={isSubmitting || isLoading}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="booking_reminders_sms">Booking Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive SMS reminders before meetings
                    </p>
                  </div>
                  <Switch
                    id="booking_reminders_sms"
                    checked={watchedValues.booking_reminders_sms}
                    onCheckedChange={(checked) => setValue('booking_reminders_sms', checked)}
                    disabled={isSubmitting || isLoading}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="booking_cancellations_sms">Booking Cancellations</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive SMS when bookings are cancelled
                    </p>
                  </div>
                  <Switch
                    id="booking_cancellations_sms"
                    checked={watchedValues.booking_cancellations_sms}
                    onCheckedChange={(checked) => setValue('booking_cancellations_sms', checked)}
                    disabled={isSubmitting || isLoading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timing Preferences */}
        <TabsContent value="timing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Timing Preferences</span>
              </CardTitle>
              <CardDescription>
                Configure when notifications are sent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="reminder_minutes_before">Reminder Timing</Label>
                <Select
                  value={watchedValues.reminder_minutes_before.toString()}
                  onValueChange={(value) => setValue('reminder_minutes_before', parseInt(value))}
                  disabled={isSubmitting || isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REMINDER_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  How long before meetings to send reminders
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="daily_agenda_time">Daily Agenda Time</Label>
                <Select
                  value={watchedValues.daily_agenda_time}
                  onValueChange={(value) => setValue('daily_agenda_time', value)}
                  disabled={isSubmitting || isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AGENDA_TIME_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  When to send your daily agenda email
                </p>
              </div>

              <div className="space-y-2">
                <Label>Max Reminders Per Day: {watchedValues.max_reminders_per_day}</Label>
                <Slider
                  value={[watchedValues.max_reminders_per_day]}
                  onValueChange={(value) => setValue('max_reminders_per_day', value[0])}
                  min={1}
                  max={50}
                  step={1}
                  disabled={isSubmitting || isLoading}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  Maximum number of reminder notifications per day
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="exclude_weekends_reminders">Exclude Weekend Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Don't send reminders on weekends
                    </p>
                  </div>
                  <Switch
                    id="exclude_weekends_reminders"
                    checked={watchedValues.exclude_weekends_reminders}
                    onCheckedChange={(checked) => setValue('exclude_weekends_reminders', checked)}
                    disabled={isSubmitting || isLoading}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="exclude_weekends_agenda">Exclude Weekend Agenda</Label>
                    <p className="text-sm text-muted-foreground">
                      Don't send daily agenda on weekends
                    </p>
                  </div>
                  <Switch
                    id="exclude_weekends_agenda"
                    checked={watchedValues.exclude_weekends_agenda}
                    onCheckedChange={(checked) => setValue('exclude_weekends_agenda', checked)}
                    disabled={isSubmitting || isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferred_notification_method">Preferred Method</Label>
                <Select
                  value={watchedValues.preferred_notification_method}
                  onValueChange={(value: any) => setValue('preferred_notification_method', value)}
                  disabled={isSubmitting || isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email Only</SelectItem>
                    <SelectItem value="sms">SMS Only</SelectItem>
                    <SelectItem value="both">Both Email and SMS</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Your preferred notification method when both are available
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Do Not Disturb */}
        <TabsContent value="dnd" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Moon className="h-5 w-5" />
                <span>Do Not Disturb</span>
              </CardTitle>
              <CardDescription>
                Set quiet hours when you don't want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dnd_enabled">Enable Do Not Disturb</Label>
                  <p className="text-sm text-muted-foreground">
                    Block notifications during specified hours
                  </p>
                </div>
                <Switch
                  id="dnd_enabled"
                  checked={watchedValues.dnd_enabled}
                  onCheckedChange={(checked) => setValue('dnd_enabled', checked)}
                  disabled={isSubmitting || isLoading}
                />
              </div>

              {watchedValues.dnd_enabled && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Quiet Hours</Label>
                    <TimeRangePicker
                      startTime={watchedValues.dnd_start_time}
                      endTime={watchedValues.dnd_end_time}
                      onStartTimeChange={(time) => setValue('dnd_start_time', time)}
                      onEndTimeChange={(time) => setValue('dnd_end_time', time)}
                      disabled={isSubmitting || isLoading}
                    />
                    <p className="text-sm text-muted-foreground">
                      Notifications will be delayed until after your quiet hours
                    </p>
                  </div>

                  <Alert>
                    <Moon className="h-4 w-4" />
                    <AlertDescription>
                      During Do Not Disturb hours ({watchedValues.dnd_start_time} - {watchedValues.dnd_end_time}), 
                      notifications will be queued and sent when quiet hours end.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Form Actions */}
      <div className="flex space-x-2">
        <Button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="flex-1"
        >
          {isSubmitting ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </form>
  );
}