'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Mail, 
  MessageSquare, 
  Link, 
  Edit, 
  GripVertical,
  Trash2,
  ToggleLeft,
  ToggleRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  User,
  Users,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface WorkflowAction {
  id: string;
  name: string;
  action_type: string;
  order: number;
  recipient: string;
  subject?: string;
  message: string;
  conditions: any[];
  is_active: boolean;
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  last_executed_at?: string;
}

interface WorkflowActionCardProps {
  action: WorkflowAction;
  onEdit: (action: WorkflowAction) => void;
  onDelete: (action: WorkflowAction) => void;
  onToggleActive: (action: WorkflowAction) => void;
  isLoading?: boolean;
}

export function WorkflowActionCard({
  action,
  onEdit,
  onDelete,
  onToggleActive,
  isLoading = false,
}: WorkflowActionCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: action.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'send_email': return <Mail className="h-5 w-5" />;
      case 'send_sms': return <MessageSquare className="h-5 w-5" />;
      case 'webhook': return <Link className="h-5 w-5" />;
      case 'update_booking': return <Edit className="h-5 w-5" />;
      default: return <Settings className="h-5 w-5" />;
    }
  };

  const getActionTypeLabel = (type: string) => {
    switch (type) {
      case 'send_email': return 'Send Email';
      case 'send_sms': return 'Send SMS';
      case 'webhook': return 'Webhook';
      case 'update_booking': return 'Update Booking';
      default: return type;
    }
  };

  const getRecipientIcon = (recipient: string) => {
    switch (recipient) {
      case 'organizer': return <User className="h-4 w-4" />;
      case 'invitee': return <User className="h-4 w-4" />;
      case 'both': return <Users className="h-4 w-4" />;
      case 'custom': return <Mail className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRecipientLabel = (recipient: string) => {
    switch (recipient) {
      case 'organizer': return 'Organizer';
      case 'invitee': return 'Invitee';
      case 'both': return 'Both';
      case 'custom': return 'Custom';
      default: return recipient;
    }
  };

  const getSuccessRate = () => {
    if (action.total_executions === 0) return 0;
    return Math.round((action.successful_executions / action.total_executions) * 100);
  };

  const getStatusColor = () => {
    if (!action.is_active) return 'text-gray-500';
    const successRate = getSuccessRate();
    if (successRate >= 90) return 'text-green-500';
    if (successRate >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusIcon = () => {
    if (!action.is_active) return ToggleLeft;
    const successRate = getSuccessRate();
    if (successRate >= 90) return CheckCircle;
    if (successRate >= 70) return AlertTriangle;
    return XCircle;
  };

  const successRate = getSuccessRate();
  const StatusIcon = getStatusIcon();

  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging && 'opacity-50')}>
      <Card className={cn(
        'transition-all duration-200',
        !action.is_active && 'opacity-60',
        action.is_active && 'border-primary/20'
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab hover:cursor-grabbing text-muted-foreground mt-1"
              >
                <GripVertical className="h-5 w-5" />
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {getActionIcon(action.action_type)}
                </div>
                <div>
                  <CardTitle className="text-lg leading-tight">{action.name}</CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {getActionTypeLabel(action.action_type)}
                    </Badge>
                    {(action.action_type === 'send_email' || action.action_type === 'send_sms') && (
                      <div className="flex items-center space-x-1">
                        {getRecipientIcon(action.recipient)}
                        <span className="text-xs text-muted-foreground">
                          {getRecipientLabel(action.recipient)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <StatusIcon className={cn('h-5 w-5', getStatusColor())} />
              <Badge variant={action.is_active ? 'default' : 'secondary'}>
                {action.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Content Preview */}
          <div className="space-y-2">
            {action.subject && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">Subject:</div>
                <div className="text-sm bg-muted p-2 rounded truncate">
                  {action.subject}
                </div>
              </div>
            )}
            
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                {action.action_type === 'send_email' ? 'Email Content:' :
                 action.action_type === 'send_sms' ? 'SMS Content:' :
                 action.action_type === 'webhook' ? 'Webhook URL:' :
                 'Update Fields:'}
              </div>
              <div className="text-sm bg-muted p-2 rounded">
                <div className="line-clamp-2">
                  {action.message}
                </div>
              </div>
            </div>
          </div>

          {/* Conditions */}
          {action.conditions && action.conditions.length > 0 && (
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Conditions:</div>
              <Badge variant="secondary" className="text-xs">
                {action.conditions.length} condition group{action.conditions.length > 1 ? 's' : ''}
              </Badge>
            </div>
          )}

          {/* Performance Metrics */}
          {action.total_executions > 0 && (
            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Success Rate</span>
                <span className="text-sm font-semibold">{successRate}%</span>
              </div>
              <Progress value={successRate} className="h-2" />
              
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <div className="font-semibold">{action.total_executions}</div>
                  <div className="text-muted-foreground">Total</div>
                </div>
                <div>
                  <div className="font-semibold text-green-600">{action.successful_executions}</div>
                  <div className="text-muted-foreground">Success</div>
                </div>
                <div>
                  <div className="font-semibold text-red-600">{action.failed_executions}</div>
                  <div className="text-muted-foreground">Failed</div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleActive(action)}
              disabled={isLoading}
              className="flex items-center space-x-1"
            >
              {action.is_active ? (
                <ToggleRight className="h-4 w-4" />
              ) : (
                <ToggleLeft className="h-4 w-4" />
              )}
              <span>{action.is_active ? 'Disable' : 'Enable'}</span>
            </Button>

            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(action)}
                disabled={isLoading}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(action)}
                disabled={isLoading}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}