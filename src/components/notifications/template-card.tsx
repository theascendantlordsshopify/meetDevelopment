'use client';

import { format } from 'date-fns';
import { Mail, MessageSquare, Edit, TestTube, Trash2, MoreHorizontal, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

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

interface NotificationTemplateCardProps {
  template: NotificationTemplate;
  onEdit: (template: NotificationTemplate) => void;
  onTest: (template: NotificationTemplate) => void;
  onDelete: (template: NotificationTemplate) => void;
  onDuplicate?: (template: NotificationTemplate) => void;
  isLoading?: boolean;
}

export function NotificationTemplateCard({
  template,
  onEdit,
  onTest,
  onDelete,
  onDuplicate,
  isLoading = false,
}: NotificationTemplateCardProps) {
  const getTemplateTypeLabel = (type: string) => {
    const types = {
      booking_confirmation: 'Booking Confirmation',
      booking_reminder: 'Booking Reminder',
      booking_cancellation: 'Booking Cancellation',
      booking_rescheduled: 'Booking Rescheduled',
      follow_up: 'Follow Up',
      custom: 'Custom',
    };
    return types[type as keyof typeof types] || type;
  };

  const getTemplateTypeColor = (type: string) => {
    switch (type) {
      case 'booking_confirmation': return 'bg-green-100 text-green-800';
      case 'booking_reminder': return 'bg-blue-100 text-blue-800';
      case 'booking_cancellation': return 'bg-red-100 text-red-800';
      case 'booking_rescheduled': return 'bg-yellow-100 text-yellow-800';
      case 'follow_up': return 'bg-purple-100 text-purple-800';
      case 'custom': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNotificationIcon = (type: string) => {
    return type === 'email' ? <Mail className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />;
  };

  const formatLastUsed = (dateString?: string) => {
    if (!dateString) return 'Never used';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <Card className={cn(
      'transition-all duration-200 hover:shadow-md',
      !template.is_active && 'opacity-60',
      template.is_default && 'border-primary/50'
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg leading-tight flex items-center space-x-2">
              <span>{template.name}</span>
              {template.is_default && (
                <Badge variant="outline" className="text-xs">Default</Badge>
              )}
            </CardTitle>
            <div className="flex items-center space-x-2 mt-2">
              <Badge className={getTemplateTypeColor(template.template_type)}>
                {getTemplateTypeLabel(template.template_type)}
              </Badge>
              <div className="flex items-center space-x-1">
                {getNotificationIcon(template.notification_type)}
                <span className="text-xs text-muted-foreground capitalize">
                  {template.notification_type}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={template.is_active ? 'default' : 'secondary'}>
              {template.is_active ? 'Active' : 'Inactive'}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" disabled={isLoading}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(template)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Template
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onTest(template)}>
                  <TestTube className="h-4 w-4 mr-2" />
                  Send Test
                </DropdownMenuItem>
                {onDuplicate && (
                  <DropdownMenuItem onClick={() => onDuplicate(template)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete(template)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Content Preview */}
        <div className="space-y-2">
          {template.subject && (
            <div>
              <div className="text-sm font-medium text-muted-foreground">Subject:</div>
              <div className="text-sm bg-muted p-2 rounded truncate">
                {template.subject}
              </div>
            </div>
          )}
          
          <div>
            <div className="text-sm font-medium text-muted-foreground">Message:</div>
            <div className="text-sm bg-muted p-2 rounded">
              <div className="line-clamp-3">
                {template.message}
              </div>
            </div>
          </div>
        </div>

        {/* Usage Statistics */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t text-center text-sm">
          <div>
            <div className="font-semibold">{template.usage_count || 0}</div>
            <div className="text-xs text-muted-foreground">Times Used</div>
          </div>
          <div>
            <div className="font-semibold">{formatLastUsed(template.last_used)}</div>
            <div className="text-xs text-muted-foreground">Last Used</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex space-x-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onTest(template)}
            className="flex-1"
          >
            <TestTube className="h-4 w-4 mr-1" />
            Test
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(template)}
            className="flex-1"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}