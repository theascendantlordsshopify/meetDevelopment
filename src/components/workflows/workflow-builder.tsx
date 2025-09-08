'use client';

import { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, Play, Settings, TestTube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WorkflowActionCard } from './workflow-action-card';
import { WorkflowActionForm } from './workflow-action-form';
import { WorkflowTester } from './workflow-tester';
import { type WorkflowActionData } from '@/lib/validations/workflows';

interface Workflow {
  id: string;
  name: string;
  description?: string;
  trigger: string;
  is_active: boolean;
}

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
}

interface WorkflowBuilderProps {
  workflow: Workflow;
  actions: WorkflowAction[];
  onWorkflowUpdate: (workflow: Workflow) => void;
  onActionsUpdate: (actions: WorkflowAction[]) => void;
  onTest: (workflow: Workflow) => void;
}

export function WorkflowBuilder({
  workflow,
  actions,
  onWorkflowUpdate,
  onActionsUpdate,
  onTest,
}: WorkflowBuilderProps) {
  const [activeTab, setActiveTab] = useState('builder');
  const [showActionForm, setShowActionForm] = useState(false);
  const [editingAction, setEditingAction] = useState<WorkflowAction | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = actions.findIndex(action => action.id === active.id);
      const newIndex = actions.findIndex(action => action.id === over.id);
      
      const reorderedActions = arrayMove(actions, oldIndex, newIndex);
      const updatedActions = reorderedActions.map((action, index) => ({
        ...action,
        order: index,
      }));
      
      onActionsUpdate(updatedActions);
    }
  };

  const handleCreateAction = async (actionData: WorkflowActionData) => {
    try {
      setIsLoading(true);
      const response = await api.post(`/api/v1/workflows/${workflow.id}/actions/`, {
        ...actionData,
        order: actions.length,
      });
      
      onActionsUpdate([...actions, response.data.data]);
      setShowActionForm(false);
      toast.success('Action added successfully');
    } catch (error: any) {
      toast.error(error.error || 'Failed to add action');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAction = async (actionData: WorkflowActionData) => {
    if (!editingAction) return;
    
    try {
      setIsLoading(true);
      const response = await api.put(`/api/v1/workflows/actions/${editingAction.id}/`, actionData);
      
      onActionsUpdate(actions.map(action => 
        action.id === editingAction.id ? response.data.data : action
      ));
      setEditingAction(null);
      toast.success('Action updated successfully');
    } catch (error: any) {
      toast.error(error.error || 'Failed to update action');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAction = async (action: WorkflowAction) => {
    if (!confirm(`Are you sure you want to delete the action "${action.name}"?`)) return;
    
    try {
      await api.delete(`/api/v1/workflows/actions/${action.id}/`);
      const updatedActions = actions
        .filter(a => a.id !== action.id)
        .map((a, index) => ({ ...a, order: index }));
      onActionsUpdate(updatedActions);
      toast.success('Action deleted successfully');
    } catch (error: any) {
      toast.error(error.error || 'Failed to delete action');
    }
  };

  const handleToggleActionActive = async (action: WorkflowAction) => {
    try {
      const response = await api.patch(`/api/v1/workflows/actions/${action.id}/`, {
        is_active: !action.is_active
      });
      
      onActionsUpdate(actions.map(a => 
        a.id === action.id ? response.data.data : a
      ));
      toast.success(`Action ${action.is_active ? 'disabled' : 'enabled'}`);
    } catch (error: any) {
      toast.error(error.error || 'Failed to update action');
    }
  };

  const sortedActions = [...actions].sort((a, b) => a.order - b.order);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Workflow Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-6 w-6" />
                <span>{workflow.name}</span>
              </CardTitle>
              {workflow.description && (
                <CardDescription className="mt-2">{workflow.description}</CardDescription>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => onTest(workflow)}
                disabled={actions.length === 0}
              >
                <TestTube className="h-4 w-4 mr-2" />
                Test Workflow
              </Button>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="builder">Workflow Builder</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Builder Tab */}
        <TabsContent value="builder" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Workflow Actions</h2>
              <p className="text-muted-foreground">
                Build your automation sequence by adding and configuring actions
              </p>
            </div>
            <Button onClick={() => setShowActionForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Action
            </Button>
          </div>

          {/* Action Form */}
          {showActionForm && (
            <WorkflowActionForm
              workflowId={workflow.id}
              onSubmit={handleCreateAction}
              onCancel={() => setShowActionForm(false)}
              isLoading={isLoading}
            />
          )}

          {editingAction && (
            <WorkflowActionForm
              workflowId={workflow.id}
              initialData={editingAction}
              onSubmit={handleUpdateAction}
              onCancel={() => setEditingAction(null)}
              isLoading={isLoading}
            />
          )}

          {/* Actions List */}
          {sortedActions.length === 0 ? (
            <Alert>
              <AlertDescription>
                No actions configured yet. Add your first action to start building your workflow automation.
              </AlertDescription>
            </Alert>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortedActions.map(action => action.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {sortedActions.map((action, index) => (
                    <div key={action.id} className="relative">
                      {/* Step Number */}
                      <div className="absolute -left-8 top-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium z-10">
                        {index + 1}
                      </div>
                      
                      {/* Connection Line */}
                      {index < sortedActions.length - 1 && (
                        <div className="absolute -left-5 top-10 w-0.5 h-8 bg-primary/30" />
                      )}
                      
                      <WorkflowActionCard
                        action={action}
                        onEdit={setEditingAction}
                        onDelete={handleDeleteAction}
                        onToggleActive={handleToggleActionActive}
                        isLoading={isLoading}
                      />
                    </div>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {/* Workflow Status */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${workflow.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <span className="font-medium">
                    Workflow is {workflow.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <Button
                  variant="outline"
                  onClick={() => onWorkflowUpdate({ ...workflow, is_active: !workflow.is_active })}
                  disabled={isLoading}
                >
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
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Testing Tab */}
        <TabsContent value="testing" className="space-y-6">
          <WorkflowTester workflow={workflow} actions={sortedActions} />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Performance</CardTitle>
              <CardDescription>
                Analytics and performance metrics for this workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                Workflow analytics coming soon. This will show execution history, 
                performance metrics, and optimization suggestions.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}