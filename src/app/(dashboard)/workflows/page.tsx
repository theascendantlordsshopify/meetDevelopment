'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Zap, BarChart3, TestTube, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WorkflowCard } from '@/components/workflows/workflow-card';
import { WorkflowForm } from '@/components/workflows/workflow-form';
import { WorkflowBuilder } from '@/components/workflows/workflow-builder';
import { useAuth } from '@/lib/auth/auth-context';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS, WORKFLOW_TRIGGERS } from '@/constants';
import { type WorkflowData } from '@/lib/validations/workflows';
import toast from 'react-hot-toast';

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

interface WorkflowStats {
  total_workflows: number;
  active_workflows: number;
  total_executions: number;
  average_success_rate: number;
  executions_today: number;
}

type ViewMode = 'list' | 'builder';

export default function WorkflowsPage() {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [stats, setStats] = useState<WorkflowStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [triggerFilter, setTriggerFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchWorkflows();
    fetchStats();
  }, []);

  const fetchWorkflows = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(API_ENDPOINTS.WORKFLOWS.LIST);
      setWorkflows(response.data.data || []);
    } catch (error: any) {
      toast.error(error.error || 'Failed to load workflows');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get(`${API_ENDPOINTS.WORKFLOWS.LIST}performance-stats/`);
      setStats(response.data.data);
    } catch (error: any) {
      console.error('Failed to load workflow stats:', error);
    }
  };

  const handleCreateWorkflow = async (data: WorkflowData) => {
    try {
      const response = await api.post(API_ENDPOINTS.WORKFLOWS.LIST, data);
      setWorkflows([...workflows, response.data.data]);
      setShowForm(false);
      fetchStats();
      toast.success('Workflow created successfully');
    } catch (error: any) {
      throw error;
    }
  };

  const handleUpdateWorkflow = async (data: WorkflowData) => {
    if (!editingWorkflow) return;
    
    try {
      const response = await api.put(
        API_ENDPOINTS.WORKFLOWS.DETAIL(editingWorkflow.id), 
        data
      );
      
      setWorkflows(workflows.map(w => 
        w.id === editingWorkflow.id ? response.data.data : w
      ));
      setEditingWorkflow(null);
      fetchStats();
      toast.success('Workflow updated successfully');
    } catch (error: any) {
      throw error;
    }
  };

  const handleDeleteWorkflow = async (workflow: Workflow) => {
    if (!confirm(`Are you sure you want to delete "${workflow.name}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await api.delete(API_ENDPOINTS.WORKFLOWS.DETAIL(workflow.id));
      setWorkflows(workflows.filter(w => w.id !== workflow.id));
      toast.success('Workflow deleted successfully');
      fetchStats();
    } catch (error: any) {
      toast.error(error.error || 'Failed to delete workflow');
    }
  };

  const handleToggleActive = async (workflow: Workflow) => {
    try {
      const response = await api.patch(
        API_ENDPOINTS.WORKFLOWS.DETAIL(workflow.id),
        { is_active: !workflow.is_active }
      );
      
      setWorkflows(workflows.map(w => 
        w.id === workflow.id ? response.data.data : w
      ));
      
      toast.success(`Workflow ${workflow.is_active ? 'disabled' : 'enabled'}`);
      fetchStats();
    } catch (error: any) {
      toast.error(error.error || 'Failed to update workflow');
    }
  };

  const handleDuplicateWorkflow = async (workflow: Workflow) => {
    try {
      const duplicateData = {
        ...workflow,
        name: `${workflow.name} (Copy)`,
        is_active: false, // Start duplicates as inactive
      };
      
      // Remove fields that shouldn't be duplicated
      delete (duplicateData as any).id;
      delete (duplicateData as any).total_executions;
      delete (duplicateData as any).successful_executions;
      delete (duplicateData as any).failed_executions;
      delete (duplicateData as any).last_executed_at;
      delete (duplicateData as any).actions;
      
      const response = await api.post(API_ENDPOINTS.WORKFLOWS.LIST, duplicateData);
      setWorkflows([...workflows, response.data.data]);
      toast.success('Workflow duplicated successfully');
      fetchStats();
    } catch (error: any) {
      toast.error(error.error || 'Failed to duplicate workflow');
    }
  };

  const handleTestWorkflow = async (workflow: Workflow) => {
    // This would open the workflow builder in test mode
    setSelectedWorkflow(workflow);
    setViewMode('builder');
  };

  const handleViewExecutions = async (workflow: Workflow) => {
    // This would show execution history
    toast.info('Execution history coming soon');
  };

  // Filter workflows
  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workflow.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTrigger = triggerFilter === 'all' || workflow.trigger === triggerFilter;
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && workflow.is_active) ||
                         (statusFilter === 'inactive' && !workflow.is_active);
    
    return matchesSearch && matchesTrigger && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="spinner w-8 h-8" />
        </div>
      </div>
    );
  }

  // Show workflow builder if a workflow is selected
  if (viewMode === 'builder' && selectedWorkflow) {
    return (
      <div className="container max-w-7xl mx-auto py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => {
              setViewMode('list');
              setSelectedWorkflow(null);
            }}
            className="mb-4"
          >
            ← Back to Workflows
          </Button>
        </div>
        <WorkflowBuilder
          workflow={selectedWorkflow}
          actions={selectedWorkflow.actions || []}
          onWorkflowUpdate={(updated) => {
            setSelectedWorkflow(updated);
            setWorkflows(workflows.map(w => w.id === updated.id ? updated : w));
          }}
          onActionsUpdate={(actions) => {
            const updated = { ...selectedWorkflow, actions };
            setSelectedWorkflow(updated);
          }}
          onTest={handleTestWorkflow}
        />
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Workflows</h1>
            <p className="text-muted-foreground mt-2">
              Automate your scheduling process with powerful workflow automation
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Workflow
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_workflows}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active</CardTitle>
                <Play className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.active_workflows}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_executions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.average_success_rate}%</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.executions_today}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search workflows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            
            <Select value={triggerFilter} onValueChange={setTriggerFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Triggers</SelectItem>
                {WORKFLOW_TRIGGERS.map((trigger) => (
                  <SelectItem key={trigger.value} value={trigger.value}>
                    {trigger.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-8">
          <WorkflowForm
            onSubmit={handleCreateWorkflow}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {editingWorkflow && (
        <div className="mb-8">
          <WorkflowForm
            initialData={editingWorkflow}
            onSubmit={handleUpdateWorkflow}
            onCancel={() => setEditingWorkflow(null)}
          />
        </div>
      )}

      {/* Workflows List */}
      {filteredWorkflows.length === 0 ? (
        <Alert>
          <AlertDescription>
            {workflows.length === 0 
              ? "No workflows created yet. Create your first workflow to start automating your scheduling process."
              : "No workflows match your current filters."
            }
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkflows.map((workflow) => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              onEdit={(w) => {
                setSelectedWorkflow(w);
                setViewMode('builder');
              }}
              onDelete={handleDeleteWorkflow}
              onDuplicate={handleDuplicateWorkflow}
              onToggleActive={handleToggleActive}
              onTest={handleTestWorkflow}
              onViewExecutions={handleViewExecutions}
            />
          ))}
        </div>
      )}
    </div>
  );
}