'use client';

import { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ConditionRule {
  field: string;
  operator: string;
  value: any;
}

interface ConditionGroup {
  operator: 'AND' | 'OR';
  rules: ConditionRule[];
}

interface ConditionBuilderProps {
  conditions: ConditionGroup[];
  onConditionsChange: (conditions: ConditionGroup[]) => void;
  disabled?: boolean;
}

const CONTEXT_FIELDS = [
  // Booking Fields
  { value: 'booking_id', label: 'Booking ID', category: 'Booking' },
  { value: 'booking_status', label: 'Booking Status', category: 'Booking' },
  { value: 'invitee_name', label: 'Invitee Name', category: 'Booking' },
  { value: 'invitee_email', label: 'Invitee Email', category: 'Booking' },
  { value: 'invitee_phone', label: 'Invitee Phone', category: 'Booking' },
  { value: 'invitee_timezone', label: 'Invitee Timezone', category: 'Booking' },
  { value: 'attendee_count', label: 'Attendee Count', category: 'Booking' },
  { value: 'start_time', label: 'Start Time', category: 'Booking' },
  { value: 'end_time', label: 'End Time', category: 'Booking' },
  { value: 'duration', label: 'Duration (minutes)', category: 'Booking' },
  
  // Event Type Fields
  { value: 'event_type_name', label: 'Event Type Name', category: 'Event Type' },
  { value: 'event_type_slug', label: 'Event Type Slug', category: 'Event Type' },
  { value: 'event_type_duration', label: 'Event Type Duration', category: 'Event Type' },
  { value: 'event_type_location_type', label: 'Location Type', category: 'Event Type' },
  { value: 'event_type_max_attendees', label: 'Max Attendees', category: 'Event Type' },
  
  // Organizer Fields
  { value: 'organizer_name', label: 'Organizer Name', category: 'Organizer' },
  { value: 'organizer_email', label: 'Organizer Email', category: 'Organizer' },
  { value: 'organizer_company', label: 'Organizer Company', category: 'Organizer' },
  { value: 'organizer_timezone', label: 'Organizer Timezone', category: 'Organizer' },
  
  // Time-based Fields
  { value: 'booking_hour', label: 'Booking Hour (0-23)', category: 'Time' },
  { value: 'booking_day_of_week', label: 'Day of Week (0-6)', category: 'Time' },
  { value: 'booking_date', label: 'Booking Date', category: 'Time' },
  { value: 'is_weekend', label: 'Is Weekend', category: 'Time' },
  { value: 'is_business_hours', label: 'Is Business Hours', category: 'Time' },
  
  // Derived Fields
  { value: 'invitee_domain', label: 'Invitee Email Domain', category: 'Derived' },
  { value: 'has_phone', label: 'Has Phone Number', category: 'Derived' },
  { value: 'has_meeting_link', label: 'Has Meeting Link', category: 'Derived' },
];

const OPERATORS = [
  { value: 'equals', label: 'Equals', types: ['string', 'number', 'boolean'] },
  { value: 'not_equals', label: 'Not Equals', types: ['string', 'number', 'boolean'] },
  { value: 'greater_than', label: 'Greater Than', types: ['number'] },
  { value: 'less_than', label: 'Less Than', types: ['number'] },
  { value: 'greater_than_or_equal', label: 'Greater Than or Equal', types: ['number'] },
  { value: 'less_than_or_equal', label: 'Less Than or Equal', types: ['number'] },
  { value: 'contains', label: 'Contains', types: ['string'] },
  { value: 'not_contains', label: 'Does Not Contain', types: ['string'] },
  { value: 'starts_with', label: 'Starts With', types: ['string'] },
  { value: 'ends_with', label: 'Ends With', types: ['string'] },
  { value: 'is_empty', label: 'Is Empty', types: ['string'] },
  { value: 'is_not_empty', label: 'Is Not Empty', types: ['string'] },
  { value: 'in_list', label: 'In List', types: ['string'] },
  { value: 'not_in_list', label: 'Not In List', types: ['string'] },
  { value: 'regex_match', label: 'Regex Match', types: ['string'] },
];

function ConditionRuleEditor({
  rule,
  onRuleChange,
  onDelete,
  disabled,
}: {
  rule: ConditionRule;
  onRuleChange: (rule: ConditionRule) => void;
  onDelete: () => void;
  disabled?: boolean;
}) {
  const handleFieldChange = (field: string) => {
    onRuleChange({ ...rule, field, operator: 'equals', value: '' });
  };

  const handleOperatorChange = (operator: string) => {
    onRuleChange({ ...rule, operator, value: '' });
  };

  const handleValueChange = (value: any) => {
    onRuleChange({ ...rule, value });
  };

  const needsValue = !['is_empty', 'is_not_empty'].includes(rule.operator);

  return (
    <div className="flex items-center space-x-2 p-3 border rounded-lg">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
        {/* Field Selection */}
        <Select value={rule.field} onValueChange={handleFieldChange} disabled={disabled}>
          <SelectTrigger>
            <SelectValue placeholder="Select field" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(
              CONTEXT_FIELDS.reduce((acc, field) => {
                if (!acc[field.category]) acc[field.category] = [];
                acc[field.category].push(field);
                return acc;
              }, {} as Record<string, typeof CONTEXT_FIELDS>)
            ).map(([category, fields]) => (
              <div key={category}>
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                  {category}
                </div>
                {fields.map((field) => (
                  <SelectItem key={field.value} value={field.value}>
                    {field.label}
                  </SelectItem>
                ))}
              </div>
            ))}
          </SelectContent>
        </Select>

        {/* Operator Selection */}
        <Select value={rule.operator} onValueChange={handleOperatorChange} disabled={disabled}>
          <SelectTrigger>
            <SelectValue placeholder="Select operator" />
          </SelectTrigger>
          <SelectContent>
            {OPERATORS.map((op) => (
              <SelectItem key={op.value} value={op.value}>
                {op.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Value Input */}
        {needsValue && (
          <Input
            value={rule.value || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder="Enter value"
            disabled={disabled}
          />
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onDelete}
        disabled={disabled}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

function ConditionGroupEditor({
  group,
  onGroupChange,
  onDelete,
  disabled,
}: {
  group: ConditionGroup;
  onGroupChange: (group: ConditionGroup) => void;
  onDelete: () => void;
  disabled?: boolean;
}) {
  const addRule = () => {
    const newRule: ConditionRule = { field: '', operator: 'equals', value: '' };
    onGroupChange({
      ...group,
      rules: [...group.rules, newRule],
    });
  };

  const updateRule = (index: number, rule: ConditionRule) => {
    const updatedRules = [...group.rules];
    updatedRules[index] = rule;
    onGroupChange({ ...group, rules: updatedRules });
  };

  const deleteRule = (index: number) => {
    const updatedRules = group.rules.filter((_, i) => i !== index);
    onGroupChange({ ...group, rules: updatedRules });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {group.operator} Group
            </Badge>
            <Select
              value={group.operator}
              onValueChange={(value: 'AND' | 'OR') => onGroupChange({ ...group, operator: value })}
              disabled={disabled}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AND">AND</SelectItem>
                <SelectItem value="OR">OR</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            disabled={disabled}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {group.rules.map((rule, index) => (
          <ConditionRuleEditor
            key={index}
            rule={rule}
            onRuleChange={(updatedRule) => updateRule(index, updatedRule)}
            onDelete={() => deleteRule(index)}
            disabled={disabled}
          />
        ))}
        
        <Button
          variant="outline"
          onClick={addRule}
          disabled={disabled}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Rule
        </Button>
      </CardContent>
    </Card>
  );
}

export function ConditionBuilder({ 
  conditions, 
  onConditionsChange, 
  disabled = false 
}: ConditionBuilderProps) {
  const addGroup = () => {
    const newGroup: ConditionGroup = {
      operator: 'AND',
      rules: [{ field: '', operator: 'equals', value: '' }],
    };
    onConditionsChange([...conditions, newGroup]);
  };

  const updateGroup = (index: number, group: ConditionGroup) => {
    const updatedGroups = [...conditions];
    updatedGroups[index] = group;
    onConditionsChange(updatedGroups);
  };

  const deleteGroup = (index: number) => {
    const updatedGroups = conditions.filter((_, i) => i !== index);
    onConditionsChange(updatedGroups);
  };

  return (
    <div className="space-y-4">
      {conditions.length === 0 ? (
        <Alert>
          <AlertDescription>
            No conditions configured. This action will execute for all matching triggers.
            Add conditions to control when this action should run.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          {conditions.map((group, index) => (
            <div key={index} className="relative">
              {index > 0 && (
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <Badge variant="secondary" className="text-xs">
                    OR
                  </Badge>
                </div>
              )}
              <ConditionGroupEditor
                group={group}
                onGroupChange={(updatedGroup) => updateGroup(index, updatedGroup)}
                onDelete={() => deleteGroup(index)}
                disabled={disabled}
              />
            </div>
          ))}
        </div>
      )}

      <Button
        variant="outline"
        onClick={addGroup}
        disabled={disabled}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Condition Group
      </Button>

      {conditions.length > 0 && (
        <Alert>
          <AlertDescription>
            <strong>Logic:</strong> Multiple condition groups are joined with OR. 
            Within each group, rules are joined with the selected operator (AND/OR).
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}