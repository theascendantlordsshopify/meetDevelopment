'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/constants';
import toast from 'react-hot-toast';

interface ContactImportWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

type ImportStep = 'upload' | 'mapping' | 'options' | 'preview' | 'importing' | 'complete';

interface ImportResult {
  total_processed: number;
  contacts_created: number;
  contacts_updated: number;
  contacts_skipped: number;
  errors: Array<{ row: number; error: string }>;
}

const CSV_FIELDS = [
  { key: 'first_name', label: 'First Name', required: false },
  { key: 'last_name', label: 'Last Name', required: false },
  { key: 'email', label: 'Email', required: true },
  { key: 'phone', label: 'Phone', required: false },
  { key: 'company', label: 'Company', required: false },
  { key: 'job_title', label: 'Job Title', required: false },
  { key: 'notes', label: 'Notes', required: false },
  { key: 'tags', label: 'Tags', required: false },
];

export function ContactImportWizard({ onComplete, onCancel }: ContactImportWizardProps) {
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const [duplicateHandling, setDuplicateHandling] = useState<'skip' | 'update' | 'merge'>('skip');
  const [updateExisting, setUpdateExisting] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      parseCSVHeaders(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const parseCSVHeaders = async (file: File) => {
    try {
      const text = await file.text();
      const lines = text.split('\n');
      if (lines.length > 0) {
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        setCsvHeaders(headers);
        setCurrentStep('mapping');
      }
    } catch (error) {
      toast.error('Failed to parse CSV file');
    }
  };

  const handleMapping = () => {
    // Validate that email is mapped
    const emailMapped = Object.values(fieldMapping).includes('email');
    if (!emailMapped) {
      toast.error('Email field must be mapped');
      return;
    }
    setCurrentStep('options');
  };

  const handlePreview = async () => {
    try {
      // Generate preview data (first 5 rows)
      if (selectedFile) {
        const text = await selectedFile.text();
        const lines = text.split('\n').slice(1, 6); // Skip header, take first 5 rows
        const preview = lines.map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const mapped: any = {};
          Object.entries(fieldMapping).forEach(([csvField, contactField]) => {
            const index = csvHeaders.indexOf(csvField);
            if (index !== -1 && values[index]) {
              mapped[contactField] = values[index];
            }
          });
          return mapped;
        }).filter(row => row.email); // Only show rows with email

        setPreviewData(preview);
        setCurrentStep('preview');
      }
    } catch (error) {
      toast.error('Failed to generate preview');
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    try {
      setCurrentStep('importing');
      setImportProgress(0);

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('field_mapping', JSON.stringify(fieldMapping));
      formData.append('duplicate_handling', duplicateHandling);
      formData.append('update_existing', updateExisting.toString());

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setImportProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const response = await api.upload(API_ENDPOINTS.CONTACTS.IMPORT, formData);
      
      clearInterval(progressInterval);
      setImportProgress(100);
      setImportResult(response.data.data);
      setCurrentStep('complete');
    } catch (error: any) {
      toast.error(error.error || 'Import failed');
      setCurrentStep('options');
    }
  };

  const downloadTemplate = () => {
    const csvContent = 'first_name,last_name,email,phone,company,job_title,notes,tags\n' +
                      'John,Doe,john@example.com,+1234567890,Acme Corp,CEO,"Great client","vip,enterprise"';
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Template downloaded');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'upload':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Upload CSV File</CardTitle>
              <CardDescription>
                Upload a CSV file containing your contacts. Maximum file size: 10MB.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                {isDragActive ? (
                  <p>Drop the CSV file here...</p>
                ) : (
                  <div>
                    <p className="text-lg font-medium mb-2">
                      Drag & drop a CSV file here, or click to select
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supports .csv files up to 10MB
                    </p>
                  </div>
                )}
              </div>

              {selectedFile && (
                <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <div className="font-medium">{selectedFile.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <Button variant="outline" onClick={downloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={onCancel}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => setCurrentStep('mapping')} 
                    disabled={!selectedFile}
                  >
                    Next: Map Fields
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'mapping':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Map CSV Fields</CardTitle>
              <CardDescription>
                Map your CSV columns to contact fields. Email is required.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CSV_FIELDS.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label>
                      {field.label}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    <Select
                      value={fieldMapping[field.key] || 'none'}
                      onValueChange={(value) => {
                        if (value === 'none') {
                          const newMapping = { ...fieldMapping };
                          delete newMapping[field.key];
                          setFieldMapping(newMapping);
                        } else {
                          setFieldMapping({ ...fieldMapping, [field.key]: value });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Not mapped</SelectItem>
                        {csvHeaders.map((header) => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>

              <div className="flex space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setCurrentStep('upload')}>
                  Back
                </Button>
                <Button onClick={handleMapping} className="flex-1">
                  Next: Import Options
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'options':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Import Options</CardTitle>
              <CardDescription>
                Configure how to handle duplicates and existing contacts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Duplicate Handling</Label>
                <Select
                  value={duplicateHandling}
                  onValueChange={(value: any) => setDuplicateHandling(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="skip">Skip duplicates</SelectItem>
                    <SelectItem value="update">Update existing</SelectItem>
                    <SelectItem value="merge">Merge data</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  How to handle contacts with existing email addresses
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="update_existing"
                  checked={updateExisting}
                  onCheckedChange={setUpdateExisting}
                />
                <Label htmlFor="update_existing">Update existing contact information</Label>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setCurrentStep('mapping')}>
                  Back
                </Button>
                <Button onClick={handlePreview} className="flex-1">
                  Preview Import
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'preview':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Preview Import</CardTitle>
              <CardDescription>
                Review the first few contacts before importing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {previewData.map((contact, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="font-medium">
                      {contact.first_name} {contact.last_name}
                    </div>
                    <div className="text-sm text-muted-foreground">{contact.email}</div>
                    {contact.company && (
                      <div className="text-sm text-muted-foreground">{contact.company}</div>
                    )}
                  </div>
                ))}
              </div>

              <Alert>
                <AlertDescription>
                  This is a preview of the first few contacts. The actual import may contain more records.
                </AlertDescription>
              </Alert>

              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setCurrentStep('options')}>
                  Back
                </Button>
                <Button onClick={handleImport} className="flex-1">
                  Start Import
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'importing':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Importing Contacts</CardTitle>
              <CardDescription>
                Please wait while we import your contacts...
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{importProgress}%</span>
                </div>
                <Progress value={importProgress} className="w-full" />
              </div>

              <div className="text-center text-muted-foreground">
                Processing your contacts... This may take a few moments.
              </div>
            </CardContent>
          </Card>
        );

      case 'complete':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <span>Import Complete</span>
              </CardTitle>
              <CardDescription>
                Your contacts have been imported successfully.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {importResult && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">{importResult.total_processed}</div>
                    <div className="text-sm text-muted-foreground">Processed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{importResult.contacts_created}</div>
                    <div className="text-sm text-muted-foreground">Created</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{importResult.contacts_updated}</div>
                    <div className="text-sm text-muted-foreground">Updated</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">{importResult.contacts_skipped}</div>
                    <div className="text-sm text-muted-foreground">Skipped</div>
                  </div>
                </div>
              )}

              {importResult?.errors && importResult.errors.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {importResult.errors.length} error{importResult.errors.length > 1 ? 's' : ''} occurred during import. 
                    Check the error details for more information.
                  </AlertDescription>
                </Alert>
              )}

              <Button onClick={onComplete} className="w-full">
                Done
              </Button>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {['Upload', 'Mapping', 'Options', 'Preview', 'Import'].map((step, index) => {
            const stepIndex = ['upload', 'mapping', 'options', 'preview', 'importing'].indexOf(currentStep);
            const isActive = index === stepIndex;
            const isCompleted = index < stepIndex;

            return (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  isCompleted ? 'bg-green-500 text-white' :
                  isActive ? 'bg-primary text-primary-foreground' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {isCompleted ? <CheckCircle className="h-4 w-4" /> : index + 1}
                </div>
                <div className="ml-2 text-sm font-medium">{step}</div>
                {index < 4 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    isCompleted ? 'bg-green-500' : 'bg-muted'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {renderStep()}
    </div>
  );
}