'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { type ContactFilterData } from '@/lib/validations/contacts';
import { ContactGroup } from '@/types';

interface ContactFiltersProps {
  filters: ContactFilterData;
  onFiltersChange: (filters: ContactFilterData) => void;
  groups: ContactGroup[];
  availableTags: string[];
  availableCompanies: string[];
}

export function ContactFilters({
  filters,
  onFiltersChange,
  groups,
  availableTags,
  availableCompanies,
}: ContactFiltersProps) {
  const updateFilter = (key: keyof ContactFilterData, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const addTag = (tag: string) => {
    if (!filters.tags.includes(tag)) {
      updateFilter('tags', [...filters.tags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    updateFilter('tags', filters.tags.filter(t => t !== tag));
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: undefined,
      group: undefined,
      tags: [],
      is_active: undefined,
      has_bookings: undefined,
      company: undefined,
    });
  };

  const hasActiveFilters = () => {
    return filters.search || filters.group || filters.tags.length > 0 || 
           filters.is_active !== undefined || filters.has_bookings !== undefined || filters.company;
  };

  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full">
          Advanced Filters
          {hasActiveFilters() && (
            <Badge variant="secondary" className="ml-2">
              {[
                filters.search && 'search',
                filters.group && 'group',
                filters.tags.length > 0 && 'tags',
                filters.is_active !== undefined && 'status',
                filters.has_bookings !== undefined && 'bookings',
                filters.company && 'company'
              ].filter(Boolean).length} active
            </Badge>
          )}
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <Card className="mt-2">
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Group Filter */}
              <div className="space-y-2">
                <Label>Group</Label>
                <Select
                  value={filters.group || 'all'}
                  onValueChange={(value) => updateFilter('group', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Groups</SelectItem>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: group.color }}
                          />
                          <span>{group.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={filters.is_active === undefined ? 'all' : filters.is_active ? 'active' : 'inactive'}
                  onValueChange={(value) => 
                    updateFilter('is_active', value === 'all' ? undefined : value === 'active')
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Booking Filter */}
              <div className="space-y-2">
                <Label>Booking History</Label>
                <Select
                  value={filters.has_bookings === undefined ? 'all' : filters.has_bookings ? 'with' : 'without'}
                  onValueChange={(value) => 
                    updateFilter('has_bookings', value === 'all' ? undefined : value === 'with')
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Contacts</SelectItem>
                    <SelectItem value="with">With Bookings</SelectItem>
                    <SelectItem value="without">Without Bookings</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Company Filter */}
            <div className="space-y-2">
              <Label>Company</Label>
              <Select
                value={filters.company || 'all'}
                onValueChange={(value) => updateFilter('company', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  {availableCompanies.map((company) => (
                    <SelectItem key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tags Filter */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="space-y-2">
                <Select onValueChange={addTag}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add tag filter..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTags
                      .filter(tag => !filters.tags.includes(tag))
                      .map((tag) => (
                        <SelectItem key={tag} value={tag}>
                          {tag}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                
                {filters.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {filters.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                        <span>{tag}</span>
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters() && (
              <div className="flex justify-end pt-2 border-t">
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  Clear all filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}