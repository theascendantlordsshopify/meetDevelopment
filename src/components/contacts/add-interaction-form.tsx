'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { contactInteractionSchema, type ContactInteractionData } from '@/lib/validations/contacts';
import toast from 'react-hot-toast';

interface AddInteractionFormProps {
  contactId: string;
  onSubmit: (data: ContactInteractionData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const INTERACTION_TYPES = [
  { value: 'manual_entry', label: 'Manual Entry' },
  { value: 'email_sent', label: 'Email Sent' },
  { value: 'note_added', label: 'Note Added' },
  { value: 'booking_created', label: 'Booking Created' },
  { value: 'booking_completed', label: 'Booking Completed' },
  { value: 'booking_cancelled', label: 'Booking Cancelled' },
];

export function AddInteractionForm({
  contactId,
  onSubmit,
  onCancel,
  isLoading = false,
}: AddInteractionFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ContactInteractionData>({
    resolver: zodResolver(contactInteractionSchema),
    defaultValues: {
      interaction_type: 'manual_entry',
      description: '',
      booking: undefined,
      metadata: {},
    },
  });

  const watchedValues = watch();

  const handleFormSubmit = async (data: ContactInteractionData) => {
    try {
      onSubmit(data);
      toast.success('Interaction added successfully');
    } catch (error: any) {
      toast.error(error.error || 'Failed to add interaction');
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="interaction_type">Interaction Type *</Label>
        <Select
          value={watchedValues.interaction_type}
          onValueChange={(value: any) => setValue('interaction_type', value)}
          disabled={isSubmitting || isLoading}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {INTERACTION_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.interaction_type && (
          <p className="text-sm text-destructive">{errors.interaction_type.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Describe the interaction..."
          rows={4}
          disabled={isSubmitting || isLoading}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      {/* Booking Reference (optional) */}
      {(watchedValues.interaction_type === 'booking_created' || 
        watchedValues.interaction_type === 'booking_completed' || 
        watchedValues.interaction_type === 'booking_cancelled') && (
        <div className="space-y-2">
          <Label htmlFor="booking">Related Booking ID</Label>
          <Input
            id="booking"
            {...register('booking')}
            placeholder="Enter booking ID (optional)"
            disabled={isSubmitting || isLoading}
          />
          <p className="text-sm text-muted-foreground">
            Optional: Link this interaction to a specific booking
          </p>
        </div>
      )}

      <div className="flex space-x-2 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="flex-1"
        >
          {isSubmitting ? 'Adding...' : 'Add Interaction'}
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
  );
}