'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Mail, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { NotificationTemplateCard } from '@/components/notifications/template-card';
import { NotificationTemplateForm } from '@/components/notifications/template-form';
import { useAuth } from '@/lib/auth/auth-context';
import { api } from '@/lib/api/client';
import { type NotificationTemplateData } from '@/lib/validations/notifications';
import toast from 'react-hot-toast';

interface NotificationTemplate {
  id: string;
  name: string;
  template_type: string;
  notification_type: string;
  subject?: string;
  message: string;
  is_active: boolean;
  is_default: boolean;
  usage_count?: number;
  last_used?: string;
}

const TEMPLATE_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'booking_confirmation', label: 'Booking Confirmation' },
  { value: 'booking_reminder', label: 'Booking Reminder' },
  { value: 'booking_cancellation', label: 'Booking Cancellation' },
  { value: 'booking_rescheduled', label: 'Booking Rescheduled' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'custom', label: 'Custom' },
];

export default function NotificationTemplatesPage() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [notificationTypeFilter, setNotificationTypeFilter] = useState('all');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/v1/notifications/templates/');
      setTemplates(response.data.data || []);
    } catch (error: any) {
      toast.error(error.error || 'Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTemplate = async (data: NotificationTemplateData) => {
    try {
      const response = await api.post('/api/v1/notifications/templates/', data);
      setTemplates([...templates, response.data.data]);
      setShowForm(false);
      toast.success('Template created successfully');
    } catch (error: any) {
      throw error;
    }
  };

  const handleUpdateTemplate = async (data: NotificationTemplateData) => {
    if (!editingTemplate) return;
    
    try {
      const response = await api.put(`/api/v1/notifications/templates/${editingTemplate.id}/`, data);
      setTemplates(templates.map(t => t.id === editingTemplate.id ? response.data.data : t));
      setEditingTemplate(null);
      toast.success('Template updated successfully');
    } catch (error: any) {
      throw error;
    }
  };

  const handleDeleteTemplate = async (template: NotificationTemplate) => {
    if (!confirm(`Are you sure you want to delete "${template.name}"?`)) return;
    
    try {
      await api.delete(`/api/v1/notifications/templates/${template.id}/`);
      setTemplates(templates.filter(t => t.id !== template.id));
      toast.success('Template deleted successfully');
    } catch (error: any) {
      toast.error(error.error || 'Failed to delete template');
    }
  };

  const handleTestTemplate = async (template: NotificationTemplate) => {
    try {
      await api.post(`/api/v1/notifications/templates/${template.id}/test/`);
      toast.success('Test notification sent successfully');
    } catch (error: any) {
      toast.error(error.error || 'Failed to send test notification');
    }
  };

  const handleDuplicateTemplate = async (template: NotificationTemplate) => {
    try {
      const duplicateData = {
        ...template,
        name: `${template.name} (Copy)`,
        is_default: false,
      };
      
      // Remove fields that shouldn't be duplicated
      delete (duplicateData as any).id;
      delete (duplicateData as any).usage_count;
      delete (duplicateData as any).last_used;
      
      const response = await api.post('/api/v1/notifications/templates/', duplicateData);
      setTemplates([...templates, response.data.data]);
      toast.success('Template duplicated successfully');
    } catch (error: any) {
      toast.error(error.error || 'Failed to duplicate template');
    }
  };

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || template.template_type === typeFilter;
    
    const matchesNotificationType = notificationTypeFilter === 'all' || 
                                   template.notification_type === notificationTypeFilter;
    
    return matchesSearch && matchesType && matchesNotificationType;
  });

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="spinner w-8 h-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Notification Templates</h1>
            <p className="text-muted-foreground mt-2">
              Create and manage your automated communication templates
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TEMPLATE_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={notificationTypeFilter} onValueChange={setNotificationTypeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-8">
          <NotificationTemplateForm
            onSubmit={handleCreateTemplate}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {editingTemplate && (
        <div className="mb-8">
          <NotificationTemplateForm
            initialData={editingTemplate}
            onSubmit={handleUpdateTemplate}
            onCancel={() => setEditingTemplate(null)}
          />
        </div>
      )}

      {/* Templates List */}
      {filteredTemplates.length === 0 ? (
        <Alert>
          <AlertDescription>
            {templates.length === 0 
              ? "No templates created yet. Create your first template to customize your automated communications."
              : "No templates match your current filters."
            }
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <NotificationTemplateCard
              key={template.id}
              template={template}
              onEdit={setEditingTemplate}
              onTest={handleTestTemplate}
              onDelete={handleDeleteTemplate}
              onDuplicate={handleDuplicateTemplate}
            />
          ))}
        </div>
      )}
    </div>
  );
}