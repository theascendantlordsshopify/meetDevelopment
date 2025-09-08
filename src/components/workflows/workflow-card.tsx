'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { 
  Play, 
  Pause, 
  Edit, 
  Copy, 
  Trash2, 
  TestTube,
  BarChart3,
  Clock,
  Zap,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { WORKFLOW_TRIGGERS } from '@/constants';
import { cn } from '@/lib/utils';

interface Workflow {
  id: string;
  name: string;
  description?: string;
  trigger: string;
  event_types: string[];
  delay_minutes: number;
  is_active: boolean;
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  last_executed_at?: string;
  actions?: Array<{ id: string; name: string; action_type: string; is_active: boolean }>;
}

interface WorkflowCardProps {
  workflow: Workflow;
  onEdit: (workflow: Workflow) => void;
  onDelete: (workflow: Workflow) => void;
  onDuplicate: (workflow: Workflow) => void;
  onToggleActive: (workflow: Workflow) => void;
  onTest: (workflow: Workflow) => void;
  onViewExecutions: (workflow: Workflow) => void;
  isLoading?: boolean;
}

export function WorkflowCard({
  workflow,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleActive,
  onTest,
  onViewExecutions,
  isLoading = false,
}: WorkflowCardProps) {
  const getSuccessRate = () => {
    if (workflow.total_executions === 0) return 0;
    return Math.round((workflow.successful_executions / workflow.total_executions) * 100);
  };

  const getTriggerLabel = (trigger: string) => {
    return WORKFLOW_TRIGGERS.find(t => t.value === trigger)?.label || trigger;
  };

  const getStatusColor = () => {
    if (!workflow.is_active) return 'text-gray-500';
    const successRate = getSuccessRate();
    if (successRate >= 90) return 'text-green-500';
    if (successRate >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusIcon = () => {
    if (!workflow.is_active) return Pause;
    const successRate = getSuccessRate();
    if (successRate >= 90) return CheckCircle;
    if (successRate >= 70) return AlertTriangle;
    return XCircle;
  };

  const formatDelay = (minutes: number) => {
    if (minutes === 0) return 'Immediate';
    if (minutes < 60) return `${minutes}m delay`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h delay`;
    return `${Math.floor(minutes / 1440)}d delay`;
  };

  const formatLastExecution = (dateString?: string) => {
    if (!dateString) return 'Never executed';
    try {
      return format(new Date(dateString), 'MMM d, h:mm a');
    } catch {
      return 'Invalid date';
    }
  };

  const successRate = getSuccessRate();
  const StatusIcon = getStatusIcon();

  return (
    <Card className={cn(
      'transition-all duration-200 hover:shadow-md',
      !workflow.is_active && 'opacity-60',
      workflow.is_active && 'border-primary/20'
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                <Zap className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg leading-tight">{workflow.name}</CardTitle>
              {workflow.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {workflow.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <StatusIcon className={cn('h-5 w-5', getStatusColor())} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" disabled={isLoading}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(workflow)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Workflow
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onTest(workflow)}>
                  <TestTube className="h-4 w-4 mr-2" />
                  Test Workflow
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onViewExecutions(workflow)}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Executions
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate(workflow)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onToggleActive(workflow)}>
                  {workflow.is_active ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Disable
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Enable
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete(workflow)}
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
        {/* Workflow Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="font-medium">Trigger</div>
            <Badge variant="outline" className="text-xs">
              {getTriggerLabel(workflow.trigger)}
            </Badge>
          </div>
          
          <div className="space-y-1">
            <div className="font-medium">Timing</div>
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{formatDelay(workflow.delay_minutes)}</span>
            </div>
          </div>
        </div>

        {/* Event Types Filter */}
        {workflow.event_types.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Event Types</div>
            <div className="flex flex-wrap gap-1">
              {workflow.event_types.slice(0, 2).map((eventType, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {eventType}
                </Badge>
              ))}
              {workflow.event_types.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{workflow.event_types.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Actions Summary */}
        {workflow.actions && workflow.actions.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Actions ({workflow.actions.length})</div>
            <div className="flex flex-wrap gap-1">
              {workflow.actions.slice(0, 3).map((action, index) => (
                <Badge 
                  key={index} 
                  variant={action.is_active ? "default" : "secondary"} 
                  className="text-xs"
                >
                  {action.action_type.replace('_', ' ')}
                </Badge>
              ))}
              {workflow.actions.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{workflow.actions.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        <div className="pt-4 border-t space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Success Rate</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div 
                  className={cn(
                    'h-2 rounded-full transition-all duration-300',
                    successRate >= 90 ? 'bg-green-500' :
                    successRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                  )}
                  style={{ width: `${successRate}%` }}
                />
              </div>
              <span className="text-sm font-semibold">{successRate}%</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center text-xs">
            <div>
              <div className="font-semibold">{workflow.total_executions}</div>
              <div className="text-muted-foreground">Total</div>
            </div>
            <div>
              <div className="font-semibold text-green-600">{workflow.successful_executions}</div>
              <div className="text-muted-foreground">Success</div>
            </div>
            <div>
              <div className="font-semibold text-red-600">{workflow.failed_executions}</div>
              <div className="text-muted-foreground">Failed</div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            Last executed: {formatLastExecution(workflow.last_executed_at)}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex space-x-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onTest(workflow)}
            className="flex-1"
          >
            <TestTube className="h-4 w-4 mr-1" />
            Test
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(workflow)}
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