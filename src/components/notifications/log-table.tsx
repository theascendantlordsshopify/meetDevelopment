'use client';

import { format } from 'date-fns';
import { 
  Mail, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface NotificationLog {
  id: string;
  notification_type: string;
  recipient_email: string;
  recipient_phone?: string;
  subject: string;
  status: string;
  sent_at?: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  error_message?: string;
  retry_count: number;
  template?: {
    name: string;
    template_type: string;
  };
}

interface NotificationLogTableProps {
  logs: NotificationLog[];
  onResend?: (log: NotificationLog) => void;
  onViewDetails?: (log: NotificationLog) => void;
  showPagination?: boolean;
  isLoading?: boolean;
}

export function NotificationLogTable({
  logs,
  onResend,
  onViewDetails,
  showPagination = true,
  isLoading = false,
}: NotificationLogTableProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
      case 'bounced':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'opened':
        return <Eye className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'failed':
      case 'bounced':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'opened':
      case 'clicked':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getNotificationIcon = (type: string) => {
    return type === 'email' ? <Mail className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />;
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '—';
    try {
      return format(new Date(dateString), 'MMM d, h:mm a');
    } catch {
      return 'Invalid date';
    }
  };

  const canResend = (log: NotificationLog) => {
    return ['failed', 'bounced'].includes(log.status) && log.retry_count < 3;
  };

  if (logs.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          No notification logs found. Logs will appear here as notifications are sent.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead>Subject/Template</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead>Delivered</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {getNotificationIcon(log.notification_type)}
                    <span className="capitalize">{log.notification_type}</span>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{log.recipient_email}</div>
                    {log.recipient_phone && (
                      <div className="text-sm text-muted-foreground">{log.recipient_phone}</div>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium truncate max-w-48">{log.subject}</div>
                    {log.template && (
                      <Badge variant="outline" className="text-xs">
                        {log.template.name}
                      </Badge>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(log.status)}
                    <Badge className={getStatusColor(log.status)}>
                      {log.status}
                    </Badge>
                    {log.retry_count > 0 && (
                      <span className="text-xs text-muted-foreground">
                        (retry {log.retry_count})
                      </span>
                    )}
                  </div>
                  {log.error_message && (
                    <div className="text-xs text-red-600 mt-1 truncate max-w-32">
                      {log.error_message}
                    </div>
                  )}
                </TableCell>

                <TableCell>
                  <div className="text-sm">{formatDateTime(log.sent_at)}</div>
                </TableCell>

                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm">{formatDateTime(log.delivered_at)}</div>
                    {log.opened_at && (
                      <div className="text-xs text-muted-foreground">
                        Opened: {formatDateTime(log.opened_at)}
                      </div>
                    )}
                    {log.clicked_at && (
                      <div className="text-xs text-muted-foreground">
                        Clicked: {formatDateTime(log.clicked_at)}
                      </div>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" disabled={isLoading}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onViewDetails && (
                        <DropdownMenuItem onClick={() => onViewDetails(log)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                      )}
                      {onResend && canResend(log) && (
                        <DropdownMenuItem onClick={() => onResend(log)}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Resend
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}