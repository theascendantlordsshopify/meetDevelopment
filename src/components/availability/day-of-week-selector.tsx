'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DAYS_OF_WEEK } from '@/constants';

interface DayOfWeekSelectorProps {
  selectedDays: number[];
  onDaysChange: (days: number[]) => void;
  className?: string;
  disabled?: boolean;
  multiple?: boolean;
}

export function DayOfWeekSelector({
  selectedDays,
  onDaysChange,
  className,
  disabled = false,
  multiple = true,
}: DayOfWeekSelectorProps) {
  const handleDayToggle = (dayValue: number) => {
    if (disabled) return;

    if (multiple) {
      if (selectedDays.includes(dayValue)) {
        onDaysChange(selectedDays.filter(day => day !== dayValue));
      } else {
        onDaysChange([...selectedDays, dayValue]);
      }
    } else {
      onDaysChange([dayValue]);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="grid grid-cols-7 gap-1">
        {DAYS_OF_WEEK.map((day) => (
          <Button
            key={day.value}
            variant={selectedDays.includes(day.value) ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'h-10 text-xs font-medium',
              selectedDays.includes(day.value) && 'bg-primary text-primary-foreground'
            )}
            onClick={() => handleDayToggle(day.value)}
            disabled={disabled}
          >
            {day.short}
          </Button>
        ))}
      </div>
      
      {multiple && (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDaysChange([0, 1, 2, 3, 4])}
            disabled={disabled}
            className="text-xs"
          >
            Weekdays
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDaysChange([5, 6])}
            disabled={disabled}
            className="text-xs"
          >
            Weekends
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDaysChange(DAYS_OF_WEEK.map(d => d.value))}
            disabled={disabled}
            className="text-xs"
          >
            All Days
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDaysChange([])}
            disabled={disabled}
            className="text-xs"
          >
            Clear
          </Button>
        </div>
      )}
    </div>
  );
}