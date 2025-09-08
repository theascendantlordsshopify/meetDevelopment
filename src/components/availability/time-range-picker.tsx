'use client';

import { useState } from 'react';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface TimeRangePickerProps {
  startTime: string;
  endTime: string;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  className?: string;
  disabled?: boolean;
}

export function TimeRangePicker({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  className,
  disabled = false,
}: TimeRangePickerProps) {
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push(timeString);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  const formatDisplayTime = (time: string) => {
    if (!time) return 'Select time';
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
    return `${displayHour}:${minute} ${ampm}`;
  };

  const spansmidnight = startTime && endTime && startTime > endTime;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center space-x-2">
        <div className="flex-1">
          <Label htmlFor="start-time">Start Time</Label>
          <Popover open={startOpen} onOpenChange={setStartOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !startTime && 'text-muted-foreground'
                )}
                disabled={disabled}
              >
                <Clock className="mr-2 h-4 w-4" />
                {formatDisplayTime(startTime)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="max-h-60 overflow-y-auto">
                {timeOptions.map((time) => (
                  <Button
                    key={time}
                    variant="ghost"
                    className="w-full justify-start font-normal"
                    onClick={() => {
                      onStartTimeChange(time);
                      setStartOpen(false);
                    }}
                  >
                    {formatDisplayTime(time)}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex-1">
          <Label htmlFor="end-time">End Time</Label>
          <Popover open={endOpen} onOpenChange={setEndOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !endTime && 'text-muted-foreground'
                )}
                disabled={disabled}
              >
                <Clock className="mr-2 h-4 w-4" />
                {formatDisplayTime(endTime)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="max-h-60 overflow-y-auto">
                {timeOptions.map((time) => (
                  <Button
                    key={time}
                    variant="ghost"
                    className="w-full justify-start font-normal"
                    onClick={() => {
                      onEndTimeChange(time);
                      setEndOpen(false);
                    }}
                  >
                    {formatDisplayTime(time)}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {spansMiddnight && (
        <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded-md">
          ⚠️ This time range spans midnight (e.g., 11:00 PM - 2:00 AM next day)
        </div>
      )}
    </div>
  );
}