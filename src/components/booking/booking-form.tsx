'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, parseISO } from 'date-fns';
import { Clock, MapPin, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { bookingCreateSchema, type BookingCreateData } from '@/lib/validations/events';
import { COMMON_TIMEZONES, LOCATION_TYPES } from '@/constants';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/constants';
import toast from 'react-hot-toast';

interface TimeSlot {
  start_time: string;
  end_time: string;
  available_spots?: number;
  total_spots?: number;
}

interface EventType {
  id: string;
  name: string;
  description?: string;
  duration: number;
  max_attendees: number;
  location_type: string;
  location_details?: string;
  custom_questions?: CustomQuestion[];
}

interface CustomQuestion {
  id?: string;
  question_text: string;
  question_type: string;
  is_required: boolean;
  options?: string[];
}

interface BookingFormProps {
  eventType: EventType;
  organizerSlug: string;
  selectedSlot: TimeSlot;
  onSuccess: (booking: any) => void;
  onCancel: () => void;
}

export function BookingForm({
  eventType,
  organizerSlug,
  selectedSlot,
  onSuccess,
  onCancel,
}: BookingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customAnswers, setCustomAnswers] = useState<Record<string, any>>({});

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BookingCreateData>({
    resolver: zodResolver(bookingCreateSchema),
    defaultValues: {
      event_type_slug: eventType.id,
      organizer_slug: organizerSlug,
      start_time: selectedSlot.start_time,
      end_time: selectedSlot.end_time,
      invitee_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      attendee_count: 1,
      custom_answers: {},
    },
  });

  const watchedValues = watch();

  const formatTime = (timeString: string) => {
    try {
      const date = parseISO(timeString);
      return format(date, 'h:mm a');
    } catch {
      return timeString;
    }
  };

  const formatDate = (timeString: string) => {
    try {
      const date = parseISO(timeString);
      return format(date, 'EEEE, MMMM d, yyyy');
    } catch {
      return timeString;
    }
  };

  const getLocationDisplay = () => {
    const locationType = LOCATION_TYPES.find(l => l.value === eventType.location_type);
    if (eventType.location_type === 'in_person' || eventType.location_type === 'custom') {
      return eventType.location_details || locationType?.label;
    }
    return locationType?.label;
  };

  const handleCustomAnswerChange = (questionId: string, value: any) => {
    const updatedAnswers = { ...customAnswers, [questionId]: value };
    setCustomAnswers(updatedAnswers);
    setValue('custom_answers', updatedAnswers);
  };

  const renderCustomQuestion = (question: CustomQuestion) => {
    const questionId = question.id || question.question_text;
    const currentValue = customAnswers[questionId];

    switch (question.question_type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'url':
        return (
          <Input
            type={question.question_type === 'email' ? 'email' : 
                  question.question_type === 'phone' ? 'tel' :
                  question.question_type === 'url' ? 'url' : 'text'}
            value={currentValue || ''}
            onChange={(e) => handleCustomAnswerChange(questionId, e.target.value)}
            placeholder={`Enter ${question.question_text.toLowerCase()}`}
            required={question.is_required}
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={currentValue || ''}
            onChange={(e) => handleCustomAnswerChange(questionId, e.target.value)}
            placeholder={`Enter ${question.question_text.toLowerCase()}`}
            required={question.is_required}
            rows={3}
          />
        );

      case 'select':
        return (
          <Select
            value={currentValue || ''}
            onValueChange={(value) => handleCustomAnswerChange(questionId, value)}
            required={question.is_required}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`${questionId}-${index}`}
                  name={questionId}
                  value={option}
                  checked={currentValue === option}
                  onChange={(e) => handleCustomAnswerChange(questionId, e.target.value)}
                  required={question.is_required}
                  className="h-4 w-4"
                />
                <Label htmlFor={`${questionId}-${index}`}>{option}</Label>
              </div>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={questionId}
              checked={currentValue || false}
              onCheckedChange={(checked) => handleCustomAnswerChange(questionId, checked)}
              required={question.is_required}
            />
            <Label htmlFor={questionId}>Yes</Label>
          </div>
        );

      case 'number':
        return (
          <Input
            type="number"
            value={currentValue || ''}
            onChange={(e) => handleCustomAnswerChange(questionId, parseInt(e.target.value))}
            placeholder="Enter a number"
            required={question.is_required}
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            value={currentValue || ''}
            onChange={(e) => handleCustomAnswerChange(questionId, e.target.value)}
            required={question.is_required}
          />
        );

      case 'time':
        return (
          <Input
            type="time"
            value={currentValue || ''}
            onChange={(e) => handleCustomAnswerChange(questionId, e.target.value)}
            required={question.is_required}
          />
        );

      default:
        return (
          <Input
            value={currentValue || ''}
            onChange={(e) => handleCustomAnswerChange(questionId, e.target.value)}
            placeholder={`Enter ${question.question_text.toLowerCase()}`}
            required={question.is_required}
          />
        );
    }
  };

  const handleFormSubmit = async (data: BookingCreateData) => {
    try {
      setIsSubmitting(true);
      
      const bookingData = {
        ...data,
        custom_answers: customAnswers,
      };

      const response = await api.post(API_ENDPOINTS.BOOKINGS.CREATE, bookingData);
      
      toast.success('Booking confirmed successfully!');
      onSuccess(response.data.data);
    } catch (error: any) {
      toast.error(error.error || 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Booking Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Booking Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">{eventType.name}</h3>
            {eventType.description && (
              <p className="text-muted-foreground mt-1">{eventType.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{eventType.duration} minutes</span>
            </div>

            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{getLocationDisplay()}</span>
            </div>

            {eventType.max_attendees > 1 && (
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>Up to {eventType.max_attendees} attendees</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{formatDate(selectedSlot.start_time)}</div>
                <div className="text-sm text-muted-foreground">
                  {formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)}
                </div>
              </div>
              <Badge variant="outline">
                {watchedValues.invitee_timezone}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Form */}
      <Card>
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invitee_name">Full Name *</Label>
                <Input
                  id="invitee_name"
                  {...register('invitee_name')}
                  placeholder="Enter your full name"
                  disabled={isSubmitting}
                />
                {errors.invitee_name && (
                  <p className="text-sm text-destructive">{errors.invitee_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="invitee_email">Email Address *</Label>
                <Input
                  id="invitee_email"
                  type="email"
                  {...register('invitee_email')}
                  placeholder="Enter your email"
                  disabled={isSubmitting}
                />
                {errors.invitee_email && (
                  <p className="text-sm text-destructive">{errors.invitee_email.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invitee_phone">Phone Number</Label>
                <Input
                  id="invitee_phone"
                  type="tel"
                  {...register('invitee_phone')}
                  placeholder="Enter your phone number"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invitee_timezone">Timezone</Label>
                <Select
                  value={watchedValues.invitee_timezone}
                  onValueChange={(value) => setValue('invitee_timezone', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_TIMEZONES.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Group Event Attendee Count */}
            {eventType.max_attendees > 1 && (
              <div className="space-y-2">
                <Label htmlFor="attendee_count">Number of Attendees</Label>
                <Select
                  value={watchedValues.attendee_count.toString()}
                  onValueChange={(value) => setValue('attendee_count', parseInt(value))}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: eventType.max_attendees }, (_, i) => i + 1).map((count) => (
                      <SelectItem key={count} value={count.toString()}>
                        {count} {count === 1 ? 'person' : 'people'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Custom Questions */}
            {eventType.custom_questions && eventType.custom_questions.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium">Additional Information</h3>
                {eventType.custom_questions.map((question, index) => (
                  <div key={index} className="space-y-2">
                    <Label>
                      {question.question_text}
                      {question.is_required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    {renderCustomQuestion(question)}
                  </div>
                ))}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex space-x-4 pt-6 border-t">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Confirming Booking...' : 'Confirm Booking'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Back
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}