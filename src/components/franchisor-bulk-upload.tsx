import React, { useState } from 'react';
import { Upload, Download, FileText, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { FranchisorToolsService, type BulkUploadResult } from '@/lib/franchisor-tools-service';

interface BulkUploadProps {
  franchiseId: string;
  onComplete?: (result: BulkUploadResult) => void;
}

export function FranchisorBulkUpload({ franchiseId, onComplete }: BulkUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<BulkUploadResult | null>(null);
  const [autoGeocode, setAutoGeocode] = useState(true);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setResult(null);
    setProgress(0);

    try {
      const csvContent = await file.text();
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      const uploadResult = await FranchisorToolsService.bulkUploadLocations(
        franchiseId,
        csvContent,
        autoGeocode
      );

      clearInterval(progressInterval);
      setProgress(100);
      setResult(uploadResult);

      if (onComplete) {
        onComplete(uploadResult);
      }
    } catch (error: any) {
      setResult({
        success: 0,
        failed: 0,
        errors: [{ row: 0, error: error.message }],
        locations: [],
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Upload Locations</CardTitle>
        <CardDescription>
          Upload multiple franchise locations at once using a CSV file
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Download Template */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-sm">CSV Template</p>
              <p className="text-xs text-muted-foreground">
                Download the template to see required format
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => FranchisorToolsService.downloadCSVTemplate()}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>

        {/* Auto-geocoding Option */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="auto-geocode" className="text-sm font-medium">
              Auto-geocode Addresses
            </Label>
            <p className="text-xs text-muted-foreground">
              Automatically find latitude/longitude for addresses without coordinates
            </p>
          </div>
          <Switch
            id="auto-geocode"
            checked={autoGeocode}
            onCheckedChange={setAutoGeocode}
          />
        </div>

        {/* Upload Area */}
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            id="csv-upload"
          />
          <label htmlFor="csv-upload" className="cursor-pointer">
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm font-medium mb-1">
              Click to upload CSV file
            </p>
            <p className="text-xs text-muted-foreground">
              or drag and drop your file here
            </p>
          </label>
        </div>

        {/* Progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Uploading locations...</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold text-green-900">{result.success}</p>
                      <p className="text-sm text-green-700">Successful</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <XCircle className="h-8 w-8 text-red-600" />
                    <div>
                      <p className="text-2xl font-bold text-red-900">{result.failed}</p>
                      <p className="text-sm text-red-700">Failed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {result.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertDescription>
                  <p className="font-medium mb-2">Errors found:</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {result.errors.slice(0, 5).map((err, index) => (
                      <li key={index}>
                        Row {err.row}: {err.error}
                      </li>
                    ))}
                    {result.errors.length > 5 && (
                      <li>... and {result.errors.length - 5} more errors</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
