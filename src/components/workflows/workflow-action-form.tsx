'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, MessageSquare, Link, Edit, Plus, Trash2 } from 'lucide-react';
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
import { ConditionBuilder } from './condition-builder';
import { TemplateVariableHelper } from './template-variable-helper';
import { workflowActionSchema, type WorkflowActionData } from '@/lib/validations/workflows';
import { WORKFLOW_ACTION_TYPES } from '@/constants';
import toast from 'react-hot-toast';

interface WorkflowActionFormProps {
  workflowId: string;
  initialData?: Partial<WorkflowActionData>;
  onSubmit: (data: WorkflowActionData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function WorkflowActionForm({
  workflowId,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: WorkflowActionFormProps) {
  const [conditions, setConditions] = useState(initialData?.conditions || []);
  const [webhookData, setWebhookData] = useState(initialData?.webhook_data || {});
  const [updateFields, setUpdateFields] = useState(initialData?.update_booking_fields || {});

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<WorkflowActionData>({
    resolver: zodResolver(workflowActionSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      action_type: initialData?.action_type ?? 'send_email',
      order: initialData?.order ?? 0,
      recipient: initialData?.recipient ?? 'invitee',
      custom_email: initialData?.custom_email ?? '',
      subject: initialData?.subject ?? '',
      message: initialData?.message ?? '',
      webhook_url: initialData?.webhook_url ?? '',
      webhook_data: initialData?.webhook_data ?? {},
      conditions: initialData?.conditions ?? [],
      update_booking_fields: initialData?.update_booking_fields ?? {},
      is_active: initialData?.is_active ?? true,
    },
  });

  const watchedValues = watch();

  const handleFormSubmit = async (data: WorkflowActionData) => {
    try {
      const actionData = {
        ...data,
        conditions,
        webhook_data: webhookData,
        update_booking_fields: updateFields,
      };
      await onSubmit(actionData);
      toast.success('Action saved successfully');
    } catch (error: any) {
      toast.error(error.error || 'Failed to save action');
    }
  };

  const getActionTypeIcon = (type: string) => {
    switch (type) {
      case 'send_email': return <Mail className="h-4 w-4" />;
      case 'send_sms': return <MessageSquare className="h-4 w-4" />;
      case 'webhook': return <Link className="h-4 w-4" />;
      case 'update_booking': return <Edit className="h-4 w-4" />;
      default: return <Edit className="h-4 w-4" />;
    }
  };

  const insertVariable = (field: 'subject' | 'message', variable: string) => {
    const currentValue = watchedValues[field] || '';
    setValue(field, currentValue + `{{${variable}}}`);
  };

  const needsSubject = watchedValues.action_type === 'send_email';
  const needsWebhookUrl = watchedValues.action_type === 'webhook';
  const needsCustomEmail = watchedValues.recipient === 'custom';
  const needsUpdateFields = watchedValues.action_type === 'update_booking';

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {getActionTypeIcon(watchedValues.action_type)}
          <span>{initialData ? 'Edit Action' : 'Create Action'}</span>
        </CardTitle>
        <CardDescription>
          Configure an automated action that will execute as part of your workflow.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="conditions">Conditions</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            {/* Basic Configuration */}
            <TabsContent value="basic" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Action Name *</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="e.g., Send Welcome Email"
                    disabled={isSubmitting || isLoading}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="action_type">Action Type *</Label>
                  <Select
                    value={watchedValues.action_type}
                    onValueChange={(value: any) => setValue('action_type', value)}
                    disabled={isSubmitting || isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WORKFLOW_ACTION_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center space-x-2">
                            {getActionTypeIcon(type.value)}
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.action_type && (
                    <p className="text-sm text-destructive">{errors.action_type.message}</p>
                  )}
                </div>
              </div>

              {/* Recipient Configuration */}
              {(watchedValues.action_type === 'send_email' || watchedValues.action_type === 'send_sms') && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipient">Recipient *</Label>
                    <Select
                      value={watchedValues.recipient}
                      onValueChange={(value: any) => setValue('recipient', value)}
                      disabled={isSubmitting || isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="organizer">Organizer</SelectItem>
                        <SelectItem value="invitee">Invitee</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                        <SelectItem value="custom">Custom Email</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {needsCustomEmail && (
                    <div className="space-y-2">
                      <Label htmlFor="custom_email">Custom Email Address *</Label>
                      <Input
                        id="custom_email"
                        type="email"
                        {...register('custom_email')}
                        placeholder="custom@example.com"
                        disabled={isSubmitting || isLoading}
                      />
                      {errors.custom_email && (
                        <p className="text-sm text-destructive">{errors.custom_email.message}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Webhook URL */}
              {needsWebhookUrl && (
                <div className="space-y-2">
                  <Label htmlFor="webhook_url">Webhook URL *</Label>
                  <Input
                    id="webhook_url"
                    type="url"
                    {...register('webhook_url')}
                    placeholder="https://your-app.com/webhook"
                    disabled={isSubmitting || isLoading}
                  />
                  {errors.webhook_url && (
                    <p className="text-sm text-destructive">{errors.webhook_url.message}</p>
                  )}
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={watchedValues.is_active}
                  onCheckedChange={(checked) => setValue('is_active', checked)}
                  disabled={isSubmitting || isLoading}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </TabsContent>

            {/* Content Configuration */}
            <TabsContent value="content" className="space-y-6">
              {needsSubject && (
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
                    placeholder="e.g., Your booking is confirmed!"
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
                    {watchedValues.action_type === 'send_email' ? 'Email Message' : 
                     watchedValues.action_type === 'send_sms' ? 'SMS Message' : 'Message'} *
                  </Label>
                  <TemplateVariableHelper
                    onVariableInsert={(variable) => insertVariable('message', variable)}
                  />
                </div>
                <Textarea
                  id="message"
                  {...register('message')}
                  placeholder={
                    watchedValues.action_type === 'send_email' 
                      ? 'Hi {{invitee_name}}, your booking for {{event_type_name}} is confirmed...'
                      : watchedValues.action_type === 'send_sms'
                      ? 'Hi {{invitee_name}}, reminder: {{event_type_name}} at {{start_time}}'
                      : 'Enter your message...'
                  }
                  rows={8}
                  disabled={isSubmitting || isLoading}
                />
                {errors.message && (
                  <p className="text-sm text-destructive">{errors.message.message}</p>
                )}
              </div>

              {/* Character count for SMS */}
              {watchedValues.action_type === 'send_sms' && (
                <div className="text-sm text-muted-foreground">
                  Character count: {watchedValues.message?.length || 0}/160
                  {(watchedValues.message?.length || 0) > 160 && (
                    <span className="text-destructive ml-2">
                      Message may be split into multiple SMS
                    </span>
                  )}
                </div>
              )}

              {/* Template Preview */}
              <Alert>
                <AlertDescription>
                  <strong>Tip:</strong> Use template variables like {{`invitee_name`}} and {{`event_type_name`}} 
                  to personalize your messages. Click "Insert Variable" to see all available options.
                </AlertDescription>
              </Alert>
            </TabsContent>

            {/* Conditions */}
            <TabsContent value="conditions" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Conditional Logic</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add conditions to control when this action should execute. Leave empty to always execute.
                </p>
                
                <ConditionBuilder
                  conditions={conditions}
                  onConditionsChange={setConditions}
                  disabled={isSubmitting || isLoading}
                />
              </div>
            </TabsContent>

            {/* Advanced Configuration */}
            <TabsContent value="advanced" className="space-y-6">
              {/* Webhook Data */}
              {watchedValues.action_type === 'webhook' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Webhook Configuration</h3>
                  
                  <div className="space-y-2">
                    <Label>Additional Webhook Data (JSON)</Label>
                    <Textarea
                      value={JSON.stringify(webhookData, null, 2)}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          setWebhookData(parsed);
                        } catch {
                          // Invalid JSON, keep typing
                        }
                      }}
                      placeholder='{"custom_field": "value", "priority": "high"}'
                      rows={4}
                      disabled={isSubmitting || isLoading}
                    />
                    <p className="text-sm text-muted-foreground">
                      Additional data to include in the webhook payload
                    </p>
                  </div>
                </div>
              )}

              {/* Update Booking Fields */}
              {needsUpdateFields && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Booking Update Fields</h3>
                  
                  <div className="space-y-2">
                    <Label>Fields to Update (JSON)</Label>
                    <Textarea
                      value={JSON.stringify(updateFields, null, 2)}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          setUpdateFields(parsed);
                        } catch {
                          // Invalid JSON, keep typing
                        }
                      }}
                      placeholder='{"status": "completed", "meeting_link": "https://..."}'
                      rows={4}
                      disabled={isSubmitting || isLoading}
                    />
                    <p className="text-sm text-muted-foreground">
                      Booking fields to update when this action executes
                    </p>
                  </div>

                  <Alert>
                    <AlertDescription>
                      <strong>Allowed fields:</strong> status, cancellation_reason, meeting_link, 
                      meeting_id, meeting_password, custom_answers
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Action Order */}
              <div className="space-y-2">
                <Label htmlFor="order">Execution Order</Label>
                <Input
                  id="order"
                  type="number"
                  min="0"
                  {...register('order', { valueAsNumber: true })}
                  disabled={isSubmitting || isLoading}
                />
                <p className="text-sm text-muted-foreground">
                  Actions execute in order from lowest to highest number
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <div className="flex space-x-2 pt-6 border-t">
            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="flex-1"
            >
              {isSubmitting ? 'Saving...' : initialData ? 'Update Action' : 'Create Action'}
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