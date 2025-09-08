'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { workflowSchema, type WorkflowData } from '@/lib/validations/workflows';
import { WORKFLOW_TRIGGERS } from '@/constants';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/constants';
import toast from 'react-hot-toast';

interface EventType {
  id: string;
  name: string;
  event_type_slug: string;
}

interface WorkflowFormProps {
  initialData?: Partial<WorkflowData>;
  onSubmit: (data: WorkflowData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const DELAY_OPTIONS = [
  { value: 0, label: 'Immediate' },
  { value: 5, label: '5 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2 hours' },
  { value: 240, label: '4 hours' },
  { value: 480, label: '8 hours' },
  { value: 1440, label: '1 day' },
  { value: 2880, label: '2 days' },
  { value: 10080, label: '1 week' },
];

export function WorkflowForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: WorkflowFormProps) {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>(initialData?.event_types || []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<WorkflowData>({
    resolver: zodResolver(workflowSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      description: initialData?.description ?? '',
      trigger: initialData?.trigger ?? 'booking_created',
      event_types: initialData?.event_types ?? [],
      delay_minutes: initialData?.delay_minutes ?? 0,
      is_active: initialData?.is_active ?? true,
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    fetchEventTypes();
  }, []);

  const fetchEventTypes = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.EVENT_TYPES.LIST);
      setEventTypes(response.data.data || []);
    } catch (error: any) {
      console.error('Failed to load event types:', error);
    }
  };

  const handleFormSubmit = async (data: WorkflowData) => {
    try {
      const workflowData = { ...data, event_types: selectedEventTypes };
      await onSubmit(workflowData);
      toast.success('Workflow saved successfully');
    } catch (error: any) {
      toast.error(error.error || 'Failed to save workflow');
    }
  };

  const handleEventTypeToggle = (eventTypeId: string, checked: boolean) => {
    if (checked) {
      setSelectedEventTypes([...selectedEventTypes, eventTypeId]);
    } else {
      setSelectedEventTypes(selectedEventTypes.filter(id => id !== eventTypeId));
    }
    setValue('event_types', selectedEventTypes);
  };

  const formatDelayDisplay = (minutes: number) => {
    const option = DELAY_OPTIONS.find(opt => opt.value === minutes);
    return option?.label || `${minutes} minutes`;
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="h-6 w-6" />
          <span>{initialData ? 'Edit Workflow' : 'Create Workflow'}</span>
        </CardTitle>
        <CardDescription>
          Create automated sequences that trigger when specific events occur in your scheduling process.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Workflow Name *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="e.g., Welcome New Clients"
                  disabled={isSubmitting || isLoading}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="trigger">Trigger Event *</Label>
                <Select
                  value={watchedValues.trigger}
                  onValueChange={(value: any) => setValue('trigger', value)}
                  disabled={isSubmitting || isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WORKFLOW_TRIGGERS.map((trigger) => (
                      <SelectItem key={trigger.value} value={trigger.value}>
                        {trigger.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.trigger && (
                  <p className="text-sm text-destructive">{errors.trigger.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Describe what this workflow does..."
                rows={3}
                disabled={isSubmitting || isLoading}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Trigger Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Trigger Configuration</h3>
            
            <div className="space-y-2">
              <Label htmlFor="delay_minutes">Execution Delay</Label>
              <Select
                value={watchedValues.delay_minutes.toString()}
                onValueChange={(value) => setValue('delay_minutes', parseInt(value))}
                disabled={isSubmitting || isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DELAY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                How long to wait before executing this workflow after the trigger event
              </p>
              {errors.delay_minutes && (
                <p className="text-sm text-destructive">{errors.delay_minutes.message}</p>
              )}
            </div>

            {/* Event Type Filtering */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Event Type Filter (Optional)</Label>
                <Badge variant="outline" className="text-xs">
                  {selectedEventTypes.length === 0 ? 'All event types' : `${selectedEventTypes.length} selected`}
                </Badge>
              </div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                <div className="text-sm text-muted-foreground mb-2">
                  Leave empty to trigger for all event types, or select specific ones:
                </div>
                {eventTypes.map((eventType) => (
                  <div key={eventType.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={eventType.id}
                      checked={selectedEventTypes.includes(eventType.id)}
                      onCheckedChange={(checked) => handleEventTypeToggle(eventType.id, !!checked)}
                      disabled={isSubmitting || isLoading}
                    />
                    <Label htmlFor={eventType.id} className="text-sm">
                      {eventType.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Workflow Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Status</h3>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={watchedValues.is_active}
                onCheckedChange={(checked) => setValue('is_active', checked)}
                disabled={isSubmitting || isLoading}
              />
              <Label htmlFor="is_active">
                {watchedValues.is_active ? 'Active - Workflow will execute' : 'Inactive - Workflow is disabled'}
              </Label>
            </div>
          </div>

          {/* Preview */}
          <Alert>
            <Zap className="h-4 w-4" />
            <AlertDescription>
              <strong>Preview:</strong> This workflow will trigger {formatDelayDisplay(watchedValues.delay_minutes).toLowerCase()} 
              when "{getTriggerLabel(watchedValues.trigger).toLowerCase()}" occurs
              {selectedEventTypes.length > 0 && ` for ${selectedEventTypes.length} specific event type${selectedEventTypes.length > 1 ? 's' : ''}`}.
            </AlertDescription>
          </Alert>

          {/* Form Actions */}
          <div className="flex space-x-2 pt-6 border-t">
            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="flex-1"
            >
              {isSubmitting ? 'Saving...' : initialData ? 'Update Workflow' : 'Create Workflow'}
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