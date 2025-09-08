'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Play, TestTube, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { workflowTestSchema, type WorkflowTestData } from '@/lib/validations/workflows';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/constants';
import toast from 'react-hot-toast';

interface Workflow {
  id: string;
  name: string;
  trigger: string;
  is_active: boolean;
}

interface WorkflowAction {
  id: string;
  name: string;
  action_type: string;
  order: number;
  is_active: boolean;
}

interface TestResult {
  status: 'success' | 'error' | 'warning';
  message: string;
  execution_time: number;
  actions_executed: number;
  actions_failed: number;
  action_results: Array<{
    action_name: string;
    status: 'success' | 'error' | 'skipped';
    message: string;
    execution_time: number;
  }>;
}

interface WorkflowTesterProps {
  workflow: Workflow;
  actions: WorkflowAction[];
}

export function WorkflowTester({ workflow, actions }: WorkflowTesterProps) {
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [recentBookings, setRecentBookings] = useState<Array<{ id: string; invitee_name: string; event_type_name: string }>>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<WorkflowTestData>({
    resolver: zodResolver(workflowTestSchema),
    defaultValues: {
      test_type: 'mock_data',
      booking_id: undefined,
      mock_context: {},
    },
  });

  const watchedValues = watch();

  const fetchRecentBookings = async () => {
    try {
      const response = await api.get(`${API_ENDPOINTS.BOOKINGS.LIST}?limit=10`);
      setRecentBookings(response.data.data || []);
    } catch (error: any) {
      console.error('Failed to load recent bookings:', error);
    }
  };

  const runTest = async (data: WorkflowTestData) => {
    try {
      setIsRunning(true);
      setTestResult(null);
      
      const response = await api.post(API_ENDPOINTS.WORKFLOWS.TEST(workflow.id), data);
      setTestResult(response.data.data);
      
      if (response.data.data.status === 'success') {
        toast.success('Workflow test completed successfully');
      } else {
        toast.error('Workflow test completed with errors');
      }
    } catch (error: any) {
      toast.error(error.error || 'Failed to run workflow test');
      setTestResult({
        status: 'error',
        message: error.error || 'Test execution failed',
        execution_time: 0,
        actions_executed: 0,
        actions_failed: 0,
        action_results: [],
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getTestTypeDescription = (type: string) => {
    switch (type) {
      case 'mock_data':
        return 'Test with generated sample data. Safe for testing logic without real effects.';
      case 'real_data':
        return 'Test with actual booking data. Actions will be simulated, not executed.';
      case 'live_test':
        return 'Execute real actions with actual data. Use with caution!';
      default:
        return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'skipped': return <Clock className="h-5 w-5 text-gray-500" />;
      default: return <TestTube className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TestTube className="h-5 w-5" />
            <span>Test Workflow</span>
          </CardTitle>
          <CardDescription>
            Test your workflow to ensure it works as expected before activating it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(runTest)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="test_type">Test Type</Label>
              <Select
                value={watchedValues.test_type}
                onValueChange={(value: any) => setValue('test_type', value)}
                disabled={isSubmitting || isRunning}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mock_data">Mock Data (Safe)</SelectItem>
                  <SelectItem value="real_data">Real Data (Simulated)</SelectItem>
                  <SelectItem value="live_test">Live Test (Caution!)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {getTestTypeDescription(watchedValues.test_type)}
              </p>
            </div>

            {watchedValues.test_type === 'real_data' && (
              <div className="space-y-2">
                <Label htmlFor="booking_id">Select Booking</Label>
                <Select
                  value={watchedValues.booking_id || ''}
                  onValueChange={(value) => setValue('booking_id', value)}
                  disabled={isSubmitting || isRunning}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a recent booking" />
                  </SelectTrigger>
                  <SelectContent>
                    {recentBookings.map((booking) => (
                      <SelectItem key={booking.id} value={booking.id}>
                        {booking.invitee_name} - {booking.event_type_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={fetchRecentBookings}
                >
                  Load Recent Bookings
                </Button>
              </div>
            )}

            {watchedValues.test_type === 'mock_data' && (
              <div className="space-y-2">
                <Label htmlFor="mock_context">Mock Context (JSON)</Label>
                <Textarea
                  placeholder='{"invitee_name": "John Doe", "event_type_name": "Demo Call"}'
                  rows={4}
                  disabled={isSubmitting || isRunning}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setValue('mock_context', parsed);
                    } catch {
                      // Invalid JSON, keep typing
                    }
                  }}
                />
                <p className="text-sm text-muted-foreground">
                  Optional: Provide custom context data for testing
                </p>
              </div>
            )}

            {watchedValues.test_type === 'live_test' && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Warning:</strong> Live test will execute real actions (send emails, trigger webhooks, etc.). 
                  Use only when you're confident the workflow is configured correctly.
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={isSubmitting || isRunning || actions.length === 0}
              className="w-full"
            >
              {isRunning ? (
                <>
                  <TestTube className="h-4 w-4 mr-2 animate-pulse" />
                  Running Test...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Test
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getStatusIcon(testResult.status)}
              <span>Test Results</span>
              <Badge variant={
                testResult.status === 'success' ? 'default' :
                testResult.status === 'error' ? 'destructive' : 'secondary'
              }>
                {testResult.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{testResult.execution_time}ms</div>
                <div className="text-sm text-muted-foreground">Execution Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{testResult.actions_executed}</div>
                <div className="text-sm text-muted-foreground">Actions Executed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{testResult.actions_failed}</div>
                <div className="text-sm text-muted-foreground">Actions Failed</div>
              </div>
            </div>

            <Alert>
              <AlertDescription>{testResult.message}</AlertDescription>
            </Alert>

            {/* Action Results */}
            {testResult.action_results && testResult.action_results.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold">Action Results</h4>
                {testResult.action_results.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <div className="font-medium">{result.action_name}</div>
                        <div className="text-sm text-muted-foreground">{result.message}</div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {result.execution_time}ms
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}