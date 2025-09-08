    import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { userProfileSchema, type UserProfileData } from '@/lib/validations/users';
import { COMMON_TIMEZONES, LANGUAGES, DATE_FORMATS, TIME_FORMATS } from '@/constants';
import { getInitials } from '@/lib/utils';

interface ProfileFormProps {
  initialData?: Partial<UserProfileData>;
  onSubmit: (data: UserProfileData) => Promise<void>;
  isLoading?: boolean;
}

const PRESET_COLORS = [
  '#0066cc', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#1f2937', '#374151', '#6b7280', '#9ca3af', '#d1d5db'
];

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => ({
  value: i,
  label: `${i.toString().padStart(2, '0')}:00`,
}));

export function ProfileForm({ initialData, onSubmit, isLoading = false }: ProfileFormProps) {
  const [selectedColor, setSelectedColor] = useState(initialData?.brand_color || '#0066cc');
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [profilePreview, setProfilePreview] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UserProfileData>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      display_name: initialData?.display_name ?? '',
      bio: initialData?.bio ?? '',
      profile_picture: initialData?.profile_picture ?? '',
      phone: initialData?.phone ?? '',
      website: initialData?.website ?? '',
      company: initialData?.company ?? '',
      job_title: initialData?.job_title ?? '',
      timezone_name: initialData?.timezone_name ?? 'UTC',
      language: initialData?.language ?? 'en',
      date_format: initialData?.date_format ?? 'MM/DD/YYYY',
      time_format: initialData?.time_format ?? '12h',
      brand_color: initialData?.brand_color ?? '#0066cc',
      brand_logo: initialData?.brand_logo ?? '',
      public_profile: initialData?.public_profile ?? true,
      show_phone: initialData?.show_phone ?? false,
      show_email: initialData?.show_email ?? true,
      reasonable_hours_start: initialData?.reasonable_hours_start ?? 7,
      reasonable_hours_end: initialData?.reasonable_hours_end ?? 22,
    },
  });

  const watchedValues = watch();

  const handleFormSubmit = async (data: UserProfileData) => {
    try {
      const profileData = { ...data, brand_color: selectedColor };
      await onSubmit(profileData);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.error || 'Failed to update profile');
    }
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setValue('brand_color', color);
    setColorPickerOpen(false);
  };

  const handleFileUpload = async (file: File, field: 'profile_picture' | 'brand_logo') => {
    // This would typically upload to a file storage service
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('field', field);
      
      const response = await api.upload('/api/v1/users/upload-image/', formData);
      const imageUrl = response.data.data?.url;
      
      if (imageUrl) {
        setValue(field, imageUrl);
        toast.success('Image uploaded successfully');
      }
    } catch (error: any) {
      toast.error(error.error || 'Failed to upload image');
    }
  };

  const formatHour = (hour: number) => {
    if (watchedValues.time_format === '24h') {
      return `${hour.toString().padStart(2, '0')}:00`;
    }
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${displayHour}:00 ${ampm}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="localization">Localization</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Personal Information</span>
                </CardTitle>
                <CardDescription>
                  Basic information about yourself that will be displayed on your profile.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center space-x-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={watchedValues.profile_picture} />
                    <AvatarFallback className="text-2xl font-semibold">
                      {getInitials(watchedValues.display_name || 'User')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Label>Profile Picture</Label>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) handleFileUpload(file, 'profile_picture');
                          };
                          input.click();
                        }}
                        disabled={isSubmitting || isLoading}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                      {watchedValues.profile_picture && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setValue('profile_picture', '')}
                          disabled={isSubmitting || isLoading}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      JPG, PNG or GIF. Max size 5MB.
                    </p>
                  </div>
                </div>

                {/* Display Name */}
                <div className="space-y-2">
                  <Label htmlFor="display_name">Display Name *</Label>
                  <Input
                    id="display_name"
                    {...register('display_name')}
                    placeholder="Your display name"
                    disabled={isSubmitting || isLoading}
                  />
                  {errors.display_name && (
                    <p className="text-sm text-destructive">{errors.display_name.message}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    This is how your name will appear to invitees on your booking page.
                  </p>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    {...register('bio')}
                    placeholder="Tell people a bit about yourself..."
                    rows={4}
                    disabled={isSubmitting || isLoading}
                  />
                  {errors.bio && (
                    <p className="text-sm text-destructive">{errors.bio.message}</p>
                  )}
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Optional bio that appears on your public profile</span>
                    <span>{watchedValues.bio?.length || 0}/500</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Information Tab */}
          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Phone className="h-5 w-5" />
                  <span>Contact Information</span>
                </CardTitle>
                <CardDescription>
                  Professional contact details and company information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      {...register('phone')}
                      placeholder="+1 (555) 123-4567"
                      disabled={isSubmitting || isLoading}
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive">{errors.phone.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      {...register('website')}
                      placeholder="https://yourwebsite.com"
                      disabled={isSubmitting || isLoading}
                    />
                    {errors.website && (
                      <p className="text-sm text-destructive">{errors.website.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      {...register('company')}
                      placeholder="Your company name"
                      disabled={isSubmitting || isLoading}
                    />
                    {errors.company && (
                      <p className="text-sm text-destructive">{errors.company.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="job_title">Job Title</Label>
                    <Input
                      id="job_title"
                      {...register('job_title')}
                      placeholder="Your job title"
                      disabled={isSubmitting || isLoading}
                    />
                    {errors.job_title && (
                      <p className="text-sm text-destructive">{errors.job_title.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Branding Tab */}
          <TabsContent value="branding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="h-5 w-5" />
                  <span>Branding</span>
                </CardTitle>
                <CardDescription>
                  Customize your brand colors and logo for your public booking pages.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Brand Color */}
                <div className="space-y-2">
                  <Label>Brand Color</Label>
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
                        <div className="space-y-3">
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
                          <div>
                            <Label htmlFor="custom-color">Custom Color</Label>
                            <Input
                              id="custom-color"
                              type="color"
                              value={selectedColor}
                              onChange={(e) => handleColorSelect(e.target.value)}
                              className="w-full h-10"
                            />
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This color will be used for buttons and accents on your booking pages.
                  </p>
                </div>

                {/* Brand Logo */}
                <div className="space-y-2">
                  <Label>Brand Logo</Label>
                  <div className="flex items-center space-x-4">
                    {watchedValues.brand_logo && (
                      <div className="w-16 h-16 border rounded-lg overflow-hidden">
                        <img 
                          src={watchedValues.brand_logo} 
                          alt="Brand logo" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) handleFileUpload(file, 'brand_logo');
                            };
                            input.click();
                          }}
                          disabled={isSubmitting || isLoading}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Logo
                        </Button>
                        {watchedValues.brand_logo && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setValue('brand_logo', '')}
                            disabled={isSubmitting || isLoading}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        PNG or SVG recommended. Max size 2MB.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Brand Preview</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setProfilePreview(!profilePreview)}
                    >
                      {profilePreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      {profilePreview ? 'Hide' : 'Preview'}
                    </Button>
                  </div>
                  
                  {profilePreview && (
                    <div className="p-4 border rounded-lg" style={{ borderColor: selectedColor }}>
                      <div className="flex items-center space-x-3 mb-3">
                        {watchedValues.brand_logo ? (
                          <img src={watchedValues.brand_logo} alt="Logo" className="h-8 w-8 object-contain" />
                        ) : (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback style={{ backgroundColor: selectedColor, color: 'white' }}>
                              {getInitials(watchedValues.display_name || 'User')}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div>
                          <div className="font-semibold">{watchedValues.display_name || 'Your Name'}</div>
                          {watchedValues.company && (
                            <div className="text-sm text-muted-foreground">{watchedValues.company}</div>
                          )}
                        </div>
                      </div>
                      <Button style={{ backgroundColor: selectedColor }} className="text-white">
                        Book a Meeting
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Localization Tab */}
          <TabsContent value="localization" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Localization Settings</span>
                </CardTitle>
                <CardDescription>
                  Configure your timezone, language, and date/time format preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timezone_name">Timezone *</Label>
                    <Select
                      value={watchedValues.timezone_name}
                      onValueChange={(value) => setValue('timezone_name', value)}
                      disabled={isSubmitting || isLoading}
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
                    {errors.timezone_name && (
                      <p className="text-sm text-destructive">{errors.timezone_name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Language *</Label>
                    <Select
                      value={watchedValues.language}
                      onValueChange={(value) => setValue('language', value)}
                      disabled={isSubmitting || isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.language && (
                      <p className="text-sm text-destructive">{errors.language.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date_format">Date Format *</Label>
                    <Select
                      value={watchedValues.date_format}
                      onValueChange={(value) => setValue('date_format', value)}
                      disabled={isSubmitting || isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DATE_FORMATS.map((format) => (
                          <SelectItem key={format.value} value={format.value}>
                            {format.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.date_format && (
                      <p className="text-sm text-destructive">{errors.date_format.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time_format">Time Format *</Label>
                    <Select
                      value={watchedValues.time_format}
                      onValueChange={(value) => setValue('time_format', value)}
                      disabled={isSubmitting || isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_FORMATS.map((format) => (
                          <SelectItem key={format.value} value={format.value}>
                            {format.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.time_format && (
                      <p className="text-sm text-destructive">{errors.time_format.message}</p>
                    )}
                  </div>
                </div>

                {/* Reasonable Hours for Multi-Invitee Scheduling */}
                <div className="space-y-4">
                  <div>
                    <Label>Reasonable Hours for Group Scheduling</Label>
                    <p className="text-sm text-muted-foreground">
                      When scheduling with multiple people across timezones, only suggest times within these hours.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reasonable_hours_start">Start Hour</Label>
                      <Select
                        value={watchedValues.reasonable_hours_start.toString()}
                        onValueChange={(value) => setValue('reasonable_hours_start', parseInt(value))}
                        disabled={isSubmitting || isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {HOUR_OPTIONS.map((hour) => (
                            <SelectItem key={hour.value} value={hour.value.toString()}>
                              {formatHour(hour.value)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reasonable_hours_end">End Hour</Label>
                      <Select
                        value={watchedValues.reasonable_hours_end.toString()}
                        onValueChange={(value) => setValue('reasonable_hours_end', parseInt(value))}
                        disabled={isSubmitting || isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {HOUR_OPTIONS.map((hour) => (
                            <SelectItem key={hour.value} value={hour.value.toString()}>
                              {formatHour(hour.value)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>Privacy Settings</span>
                </CardTitle>
                <CardDescription>
                  Control what information is visible on your public profile.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="public_profile">Public Profile</Label>
                      <p className="text-sm text-muted-foreground">
                        Make your profile visible to anyone with your booking link
                      </p>
                    </div>
                    <Switch
                      id="public_profile"
                      checked={watchedValues.public_profile}
                      onCheckedChange={(checked) => setValue('public_profile', checked)}
                      disabled={isSubmitting || isLoading}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="show_email">Show Email Address</Label>
                      <p className="text-sm text-muted-foreground">
                        Display your email address on your public profile
                      </p>
                    </div>
                    <Switch
                      id="show_email"
                      checked={watchedValues.show_email}
                      onCheckedChange={(checked) => setValue('show_email', checked)}
                      disabled={isSubmitting || isLoading || !watchedValues.public_profile}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="show_phone">Show Phone Number</Label>
                      <p className="text-sm text-muted-foreground">
                        Display your phone number on your public profile
                      </p>
                    </div>
                    <Switch
                      id="show_phone"
                      checked={watchedValues.show_phone}
                      onCheckedChange={(checked) => setValue('show_phone', checked)}
                      disabled={isSubmitting || isLoading || !watchedValues.public_profile || !watchedValues.phone}
                    />
                  </div>
                </div>

                {!watchedValues.public_profile && (
                  <Alert>
                    <AlertDescription>
                      Your profile is private. Only people with direct links to your event types can book with you.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        {/* Form Actions */}
        <div className="flex space-x-2">
          <Button
            type="submit"
            className="flex-1"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
}