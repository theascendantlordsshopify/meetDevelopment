'use client';

import { Clock, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DAYS_OF_WEEK } from '@/constants';
import { cn } from '@/lib/utils';

interface AvailabilityRule {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  event_types?: string[];
}

interface AvailabilityRuleCardProps {
  rule: AvailabilityRule;
  onEdit: (rule: AvailabilityRule) => void;
  onDelete: (rule: AvailabilityRule) => void;
  onToggleActive: (rule: AvailabilityRule) => void;
  isLoading?: boolean;
}

export function AvailabilityRuleCard({
  rule,
  onEdit,
  onDelete,
  onToggleActive,
  isLoading = false,
}: AvailabilityRuleCardProps) {
  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
    return `${displayHour}:${minute} ${ampm}`;
  };

  const getDayName = (dayValue: number) => {
    return DAYS_OF_WEEK.find(d => d.value === dayValue)?.label || 'Unknown';
  };

  const spansMiddnight = rule.start_time > rule.end_time;

  return (
    <Card className={cn(
      'transition-all duration-200',
      !rule.is_active && 'opacity-60',
      rule.is_active && 'border-primary/20'
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {getDayName(rule.day_of_week)}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant={rule.is_active ? 'default' : 'secondary'}>
              {rule.is_active ? 'Active' : 'Inactive'}
            </Badge>
            {spansMiddnight && (
              <Badge variant="outline" className="text-amber-600">
                Spans Midnight
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Time Display */}
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            {formatTime(rule.start_time)} - {formatTime(rule.end_time)}
          </span>
        </div>

        {/* Midnight Warning */}
        {spansMiddnight && (
          <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded-md">
            This rule spans midnight (continues to next day)
          </div>
        )}

        {/* Event Types */}
        {rule.event_types && rule.event_types.length > 0 && (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Applies to event types:</p>
            <div className="flex flex-wrap gap-1">
              {rule.event_types.map((eventType, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {eventType}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleActive(rule)}
            disabled={isLoading}
            className="flex items-center space-x-1"
          >
            {rule.is_active ? (
              <ToggleRight className="h-4 w-4" />
            ) : (
              <ToggleLeft className="h-4 w-4" />
            )}
            <span>{rule.is_active ? 'Disable' : 'Enable'}</span>
          </Button>

          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(rule)}
              disabled={isLoading}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(rule)}
              disabled={isLoading}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}