'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { contactGroupSchema, type ContactGroupData } from '@/lib/validations/contacts';
import toast from 'react-hot-toast';

interface ContactGroupFormProps {
  initialData?: Partial<ContactGroupData>;
  onSubmit: (data: ContactGroupData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const PRESET_COLORS = [
  '#0066cc', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
];

export function ContactGroupForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: ContactGroupFormProps) {
  const [selectedColor, setSelectedColor] = useState(initialData?.color || '#0066cc');
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ContactGroupData>({
    resolver: zodResolver(contactGroupSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      description: initialData?.description ?? '',
      color: initialData?.color ?? '#0066cc',
      contacts: initialData?.contacts ?? [],
    },
  });

  const handleFormSubmit = async (data: ContactGroupData) => {
    try {
      const groupData = { ...data, color: selectedColor };
      await onSubmit(groupData);
      toast.success('Contact group saved successfully');
    } catch (error: any) {
      toast.error(error.error || 'Failed to save contact group');
    }
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setValue('color', color);
    setColorPickerOpen(false);
  };

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>
          {initialData ? 'Edit Contact Group' : 'Create Contact Group'}
        </CardTitle>
        <CardDescription>
          Organize your contacts into groups for better management and filtering.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Group Name *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Enter group name"
              disabled={isSubmitting || isLoading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe this group..."
              rows={3}
              disabled={isSubmitting || isLoading}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Group Color</Label>
            <div className="flex items-center space-x-2">
              <Popover open={colorPickerOpen} onOpenChange={setColorPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    disabled={isSubmitting || isLoading}
                  >
                    <div 
                      className="w-4 h-4 rounded-full mr-2" 
                      style={{ backgroundColor: selectedColor }}
                    />
                    <Palette className="h-4 w-4 mr-2" />
                    {selectedColor}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3">
                  <div className="grid grid-cols-5 gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className="w-8 h-8 rounded-full border-2 border-gray-200 hover:border-gray-400 transition-colors"
                        style={{ backgroundColor: color }}
                        onClick={() => handleColorSelect(color)}
                      />
                    ))}
                  </div>
                  <div className="mt-3">
                    <Input
                      type="color"
                      value={selectedColor}
                      onChange={(e) => handleColorSelect(e.target.value)}
                      className="w-full h-8"
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="flex-1"
            >
              {isSubmitting ? 'Saving...' : initialData ? 'Update Group' : 'Create Group'}
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