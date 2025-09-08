'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, MessageSquare, TestTube, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { TemplateVariableHelper } from '@/components/workflows/template-variable-helper';
import { notificationTemplateSchema, type NotificationTemplateData } from '@/lib/validations/notifications';
import toast from 'react-hot-toast';

interface NotificationTemplateFormProps {
  initialData?: Partial<NotificationTemplateData>;
  onSubmit: (data: NotificationTemplateData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const TEMPLATE_TYPES = [
  { value: 'booking_confirmation', label: 'Booking Confirmation' },
  { value: 'booking_reminder', label: 'Booking Reminder' },
  { value: 'booking_cancellation', label: 'Booking Cancellation' },
  { value: 'booking_rescheduled', label: 'Booking Rescheduled' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'custom', label: 'Custom' },
];

export function NotificationTemplateForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: NotificationTemplateFormProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState({ subject: '', message: '' });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<NotificationTemplateData>({
    resolver: zodResolver(notificationTemplateSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      template_type: initialData?.template_type ?? 'booking_confirmation',
      notification_type: initialData?.notification_type ?? 'email',
      subject: initialData?.subject ?? '',
      message: initialData?.message ?? '',
      is_active: initialData?.is_active ?? true,
      is_default: initialData?.is_default ?? false,
      required_placeholders: initialData?.required_placeholders ?? [],
    },
  });

  const watchedValues = watch();

  const handleFormSubmit = async (data: NotificationTemplateData) => {
    try {
      await onSubmit(data);
      toast.success('Template saved successfully');
    } catch (error: any) {
      toast.error(error.error || 'Failed to save template');
    }
  };

  const insertVariable = (field: 'subject' | 'message', variable: string) => {
    const currentValue = watchedValues[field] || '';
    setValue(field, currentValue + `{{${variable}}}`);
  };

  const generatePreview = () => {
    // Mock data for preview
    const mockData = {
      invitee_name: 'John Doe',
      event_type_name: '30 Minute Meeting',
      organizer_name: 'Jane Smith',
      start_time: 'January 15, 2024 at 2:00 PM',
      end_time: 'January 15, 2024 at 2:30 PM',
      meeting_link: 'https://zoom.us/j/123456789',
      booking_url: 'https://app.com/booking/abc123/manage',
    };

    let previewSubject = watchedValues.subject || '';
    let previewMessage = watchedValues.message || '';

    // Simple variable replacement for preview
    Object.entries(mockData).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      previewSubject = previewSubject.replace(regex, value);
      previewMessage = previewMessage.replace(regex, value);
    });

    setPreviewContent({ subject: previewSubject, message: previewMessage });
  };

  const isEmailTemplate = watchedValues.notification_type === 'email';
  const characterCount = watchedValues.message?.length || 0;
  const smsLimit = 160;

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {isEmailTemplate ? <Mail className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
          <span>{initialData ? 'Edit Template' : 'Create Template'}</span>
        </CardTitle>
        <CardDescription>
          Create customizable notification templates with dynamic content variables.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            {/* Basic Information */}
            <TabsContent value="basic" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name *</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="e.g., Welcome Email"
                    disabled={isSubmitting || isLoading}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template_type">Template Type *</Label>
                  <Select
                    value={watchedValues.template_type}
                    onValueChange={(value: any) => setValue('template_type', value)}
                    disabled={isSubmitting || isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEMPLATE_TYPES.filter(t => t.value !== 'all').map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.template_type && (
                    <p className="text-sm text-destructive">{errors.template_type.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notification_type">Notification Method *</Label>
                <Select
                  value={watchedValues.notification_type}
                  onValueChange={(value: any) => setValue('notification_type', value)}
                  disabled={isSubmitting || isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>Email</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="sms">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4" />
                        <span>SMS</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.notification_type && (
                  <p className="text-sm text-destructive">{errors.notification_type.message}</p>
                )}
              </div>

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
                    id="is_default"
                    checked={watchedValues.is_default}
                    onCheckedChange={(checked) => setValue('is_default', checked)}
                    disabled={isSubmitting || isLoading}
                  />
                  <Label htmlFor="is_default">Default template</Label>
                </div>
              </div>
            </TabsContent>

            {/* Content */}
            <TabsContent value="content" className="space-y-6">
              {isEmailTemplate && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="subject">Email Subject *</Label>
                    <TemplateVariableHelper
                      onVariableInsert={(variable) => insertVariable('subject', variable)}
                    />
                  </div>
                  <Input
                    id="subject"
                    {...register('subject')}
                    placeholder="e.g., Your booking with {{organizer_name}} is confirmed"
                    disabled={isSubmitting || isLoading}
                  />
                  {errors.subject && (
                    <p className="text-sm text-destructive">{errors.subject.message}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="message">
                    {isEmailTemplate ? 'Email Message' : 'SMS Message'} *
                  </Label>
                  <TemplateVariableHelper
                    onVariableInsert={(variable) => insertVariable('message', variable)}
                  />
                </div>
                <Textarea
                  id="message"
                  {...register('message')}
                  placeholder={
                    isEmailTemplate 
                      ? 'Hi {{invitee_name}},\n\nYour booking for {{event_type_name}} with {{organizer_name}} is confirmed!\n\nDetails:\n- Date & Time: {{start_time}}\n- Duration: {{duration}} minutes\n- Meeting Link: {{meeting_link}}\n\nBest regards,\n{{organizer_name}}'
                      : 'Hi {{invitee_name}}, reminder: {{event_type_name}} at {{start_time}}. Join: {{meeting_link}}'
                  }
                  rows={isEmailTemplate ? 12 : 4}
                  disabled={isSubmitting || isLoading}
                />
                {errors.message && (
                  <p className="text-sm text-destructive">{errors.message.message}</p>
                )}
                
                {/* Character count for SMS */}
                {!isEmailTemplate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Character count: {characterCount}/{smsLimit}
                    </span>
                    {characterCount > smsLimit && (
                      <span className="text-destructive">
                        Message may be split into multiple SMS
                      </span>
                    )}
                  </div>
                )}
              </div>

              <Alert>
                <AlertDescription>
                  Use template variables like {{`invitee_name`}} and {{`event_type_name`}} to personalize your messages. 
                  Click "Insert Variable" to see all available options.
                </AlertDescription>
              </Alert>
            </TabsContent>

            {/* Preview */}
            <TabsContent value="preview" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Template Preview</h3>
                <Button
                  type="button"
                  variant="outline"
                  onClick={generatePreview}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Generate Preview
                </Button>
              </div>

              {previewContent.subject || previewContent.message ? (
                <Card>
                  <CardContent className="p-6">
                    {isEmailTemplate && previewContent.subject && (
                      <div className="mb-4">
                        <Label className="text-sm font-medium">Subject:</Label>
                        <div className="mt-1 p-3 bg-muted rounded-lg">
                          {previewContent.subject}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <Label className="text-sm font-medium">Message:</Label>
                      <div className="mt-1 p-3 bg-muted rounded-lg whitespace-pre-wrap">
                        {previewContent.message}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Alert>
                  <AlertDescription>
                    Click "Generate Preview" to see how your template will look with sample data.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <div className="flex space-x-2 pt-6 border-t">
            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="flex-1"
            >
              {isSubmitting ? 'Saving...' : initialData ? 'Update Template' : 'Create Template'}
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