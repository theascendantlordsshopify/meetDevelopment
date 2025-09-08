'use client';

import { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, GripVertical, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { type CustomQuestionData } from '@/lib/validations/events';
import { generateId } from '@/lib/utils';

interface CustomQuestionBuilderProps {
  questions: CustomQuestionData[];
  onQuestionsChange: (questions: CustomQuestionData[]) => void;
  disabled?: boolean;
}

const QUESTION_TYPES = [
  { value: 'text', label: 'Short Text' },
  { value: 'textarea', label: 'Long Text' },
  { value: 'select', label: 'Dropdown' },
  { value: 'multiselect', label: 'Multiple Choice' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone Number' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'time', label: 'Time' },
  { value: 'url', label: 'URL' },
];

function SortableQuestionItem({ 
  question, 
  onEdit, 
  onDelete, 
  disabled 
}: { 
  question: CustomQuestionData; 
  onEdit: (question: CustomQuestionData) => void;
  onDelete: (id: string) => void;
  disabled?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: question.order.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getQuestionTypeLabel = (type: string) => {
    return QUESTION_TYPES.find(t => t.value === type)?.label || type;
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-white border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab hover:cursor-grabbing text-muted-foreground"
          >
            <GripVertical className="h-4 w-4" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-medium">{question.question_text}</h4>
              {question.is_required && (
                <Badge variant="secondary" className="text-xs">Required</Badge>
              )}
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>{getQuestionTypeLabel(question.question_type)}</span>
              {question.options && question.options.length > 0 && (
                <span>• {question.options.length} options</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(question)}
            disabled={disabled}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(question.order.toString())}
            disabled={disabled}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function QuestionForm({ 
  question, 
  onSave, 
  onCancel 
}: { 
  question?: CustomQuestionData;
  onSave: (question: CustomQuestionData) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<CustomQuestionData>(
    question || {
      question_text: '',
      question_type: 'text',
      is_required: false,
      order: 0,
      options: [],
    }
  );

  const [optionsText, setOptionsText] = useState(
    question?.options?.join('\n') || ''
  );

  const needsOptions = ['select', 'multiselect', 'radio'].includes(formData.question_type);

  const handleSave = () => {
    const finalData = { ...formData };
    
    if (needsOptions) {
      finalData.options = optionsText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    } else {
      finalData.options = undefined;
    }

    onSave(finalData);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="question_text">Question Text *</Label>
        <Input
          id="question_text"
          value={formData.question_text}
          onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
          placeholder="What would you like to ask?"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="question_type">Question Type *</Label>
        <Select
          value={formData.question_type}
          onValueChange={(value: any) => setFormData({ ...formData, question_type: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {QUESTION_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {needsOptions && (
        <div className="space-y-2">
          <Label htmlFor="options">Options *</Label>
          <Textarea
            id="options"
            value={optionsText}
            onChange={(e) => setOptionsText(e.target.value)}
            placeholder="Enter each option on a new line"
            rows={4}
          />
          <p className="text-sm text-muted-foreground">
            Enter each option on a separate line
          </p>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Switch
          id="is_required"
          checked={formData.is_required}
          onCheckedChange={(checked) => setFormData({ ...formData, is_required: checked })}
        />
        <Label htmlFor="is_required">Required field</Label>
      </div>

      <div className="flex space-x-2">
        <Button onClick={handleSave} disabled={!formData.question_text.trim()}>
          {question ? 'Update Question' : 'Add Question'}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

export function CustomQuestionBuilder({ 
  questions, 
  onQuestionsChange, 
  disabled = false 
}: CustomQuestionBuilderProps) {
  const [editingQuestion, setEditingQuestion] = useState<CustomQuestionData | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = questions.findIndex(q => q.order.toString() === active.id);
      const newIndex = questions.findIndex(q => q.order.toString() === over.id);
      
      const reorderedQuestions = arrayMove(questions, oldIndex, newIndex);
      const updatedQuestions = reorderedQuestions.map((q, index) => ({
        ...q,
        order: index,
      }));
      
      onQuestionsChange(updatedQuestions);
    }
  };

  const handleAddQuestion = (questionData: CustomQuestionData) => {
    const newQuestion = {
      ...questionData,
      order: questions.length,
    };
    onQuestionsChange([...questions, newQuestion]);
    setShowAddDialog(false);
  };

  const handleEditQuestion = (questionData: CustomQuestionData) => {
    const updatedQuestions = questions.map(q => 
      q.order === editingQuestion?.order ? questionData : q
    );
    onQuestionsChange(updatedQuestions);
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (order: string) => {
    const updatedQuestions = questions
      .filter(q => q.order.toString() !== order)
      .map((q, index) => ({ ...q, order: index }));
    onQuestionsChange(updatedQuestions);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Custom Questions</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Collect additional information from invitees when they book
            </p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button disabled={disabled}>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Custom Question</DialogTitle>
              </DialogHeader>
              <QuestionForm
                onSave={handleAddQuestion}
                onCancel={() => setShowAddDialog(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {questions.length === 0 ? (
          <Alert>
            <AlertDescription>
              No custom questions added yet. Click "Add Question" to collect additional information from invitees.
            </AlertDescription>
          </Alert>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={questions.map(q => q.order.toString())}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {questions
                  .sort((a, b) => a.order - b.order)
                  .map((question) => (
                    <SortableQuestionItem
                      key={question.order}
                      question={question}
                      onEdit={setEditingQuestion}
                      onDelete={handleDeleteQuestion}
                      disabled={disabled}
                    />
                  ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Edit Question Dialog */}
        <Dialog open={!!editingQuestion} onOpenChange={() => setEditingQuestion(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Question</DialogTitle>
            </DialogHeader>
            {editingQuestion && (
              <QuestionForm
                question={editingQuestion}
                onSave={handleEditQuestion}
                onCancel={() => setEditingQuestion(null)}
              />
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}