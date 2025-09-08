'use client';

import { useState } from 'react';
import { Copy, Check, Download, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import toast from 'react-hot-toast';

interface BackupCodesDisplayProps {
  codes: string[];
  onComplete: () => void;
}

export function BackupCodesDisplay({ codes, onComplete }: BackupCodesDisplayProps) {
  const [showCodes, setShowCodes] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyAllCodes = async () => {
    const codesText = codes.join('\n');
    await navigator.clipboard.writeText(codesText);
    setCopied(true);
    toast.success('Backup codes copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCodes = () => {
    const codesText = codes.join('\n');
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mfa-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Backup codes downloaded');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Save Your Backup Codes</CardTitle>
        <CardDescription>
          These backup codes can be used to access your account if you lose your authenticator device.
          Each code can only be used once.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertDescription>
            <strong>Important:</strong> Store these codes in a safe place. You won't be able to see them again.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Your Backup Codes</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCodes(!showCodes)}
            >
              {showCodes ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showCodes ? 'Hide' : 'Show'}
            </Button>
          </div>

          {showCodes && (
            <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg font-mono text-sm">
              {codes.map((code, index) => (
                <div key={index} className="text-center py-1">
                  {code}
                </div>
              ))}
            </div>
          )}

          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={copyAllCodes}
              className="flex-1"
            >
              {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? 'Copied!' : 'Copy All'}
            </Button>
            <Button
              variant="outline"
              onClick={downloadCodes}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">How to use backup codes:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Use a backup code when you can't access your authenticator app</li>
            <li>• Enter the code in place of your regular verification code</li>
            <li>• Each code can only be used once</li>
            <li>• Generate new codes if you run out</li>
          </ul>
        </div>

        <Button onClick={onComplete} className="w-full">
          I've Saved My Backup Codes
        </Button>
      </CardContent>
    </Card>
  );
}