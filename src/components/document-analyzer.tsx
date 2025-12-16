import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  FileText,
  Upload,
  Loader2,
  CheckCircle,
  AlertTriangle,
  X,
  Download,
  Eye,
} from 'lucide-react';
import { AIDocumentAnalyzerService, type DocumentAnalysis } from '@/lib/ai-document-analyzer-service';
import { cn } from '@/lib/utils';

interface DocumentAnalyzerProps {
  onClose?: () => void;
  className?: string;
}

export function DocumentAnalyzer({ onClose, className }: DocumentAnalyzerProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [analyses, setAnalyses] = useState<Map<string, DocumentAnalysis>>(new Map());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
    setError(null);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setAnalyses(prev => {
      const newMap = new Map(prev);
      newMap.delete(files[index].name);
      return newMap;
    });
  };

  const analyzeDocuments = async () => {
    if (files.length === 0) return;

    setIsAnalyzing(true);
    setError(null);
    const newAnalyses = new Map(analyses);

    for (const file of files) {
      try {
        const text = await AIDocumentAnalyzerService.extractTextFromFile(file);
        const analysis = await AIDocumentAnalyzerService.analyzeDocument(text);
        newAnalyses.set(file.name, analysis);
      } catch (err: any) {
        setError(`Error analyzing ${file.name}: ${err.message}`);
      }
    }

    setAnalyses(newAnalyses);
    setIsAnalyzing(false);
  };

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'financial':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'legal':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'operational':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={cn('w-full', className)}>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-600" />
                AI Document Analyzer
              </CardTitle>
              <CardDescription>
                Upload business documents for AI-powered analysis
              </CardDescription>
            </div>
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* File Upload Area */}
          <div
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
              files.length > 0 ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
            )}
            onClick={() => fileInputRef.current?.click()}
            style={{ cursor: 'pointer' }}
          >
            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-sm font-medium mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">
              PDF, TXT files (Max 10MB per file)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Uploaded Files List */}
          {files.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">
                  Uploaded Documents ({files.length})
                </h3>
                <Button
                  onClick={analyzeDocuments}
                  disabled={isAnalyzing}
                  size="sm"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Analyze All
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-2">
                {files.map((file, index) => {
                  const analysis = analyses.get(file.name);
                  return (
                    <Card key={index} className="border-2">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="h-4 w-4 text-gray-500" />
                              <span className="font-medium text-sm">{file.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ({(file.size / 1024).toFixed(1)} KB)
                              </span>
                              {analysis && (
                                <Badge
                                  className={cn('text-xs', getDocumentTypeColor(analysis.documentType))}
                                >
                                  {analysis.documentType.toUpperCase()}
                                </Badge>
                              )}
                            </div>

                            {/* Analysis Results */}
                            {analysis && (
                              <div className="space-y-3 mt-4">
                                {/* Confidence Score */}
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">
                                    Confidence:
                                  </span>
                                  <span className={cn('text-sm font-semibold', getConfidenceColor(analysis.confidenceScore))}>
                                    {analysis.confidenceScore}%
                                  </span>
                                </div>

                                {/* Summary */}
                                <div>
                                  <h5 className="text-xs font-medium text-gray-700 mb-1">Summary:</h5>
                                  <p className="text-sm text-gray-600">{analysis.summary}</p>
                                </div>

                                {/* Key Findings */}
                                {analysis.keyFindings.length > 0 && (
                                  <div>
                                    <h5 className="text-xs font-medium text-gray-700 mb-1">Key Findings:</h5>
                                    <ul className="space-y-1">
                                      {analysis.keyFindings.map((finding, i) => (
                                        <li key={i} className="flex items-start gap-2 text-xs">
                                          <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                                          <span>{finding}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Red Flags */}
                                {analysis.redFlags.length > 0 && (
                                  <div>
                                    <h5 className="text-xs font-medium text-red-700 mb-1">Red Flags:</h5>
                                    <ul className="space-y-1">
                                      {analysis.redFlags.map((flag, i) => (
                                        <li key={i} className="flex items-start gap-2 text-xs text-red-600">
                                          <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                          <span>{flag}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Recommendations */}
                                {analysis.recommendations.length > 0 && (
                                  <div>
                                    <h5 className="text-xs font-medium text-blue-700 mb-1">Recommendations:</h5>
                                    <ul className="space-y-1">
                                      {analysis.recommendations.map((rec, i) => (
                                        <li key={i} className="text-xs text-blue-600">
                                          • {rec}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Extracted Data */}
                                {analysis.extractedData && Object.keys(analysis.extractedData).length > 0 && (
                                  <div className="bg-gray-50 p-3 rounded-md">
                                    <h5 className="text-xs font-medium text-gray-700 mb-2">Extracted Data:</h5>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      {analysis.extractedData.revenue && (
                                        <div>
                                          <span className="text-muted-foreground">Revenue: </span>
                                          <span className="font-medium">₹{analysis.extractedData.revenue.toLocaleString()}</span>
                                        </div>
                                      )}
                                      {analysis.extractedData.profit && (
                                        <div>
                                          <span className="text-muted-foreground">Profit: </span>
                                          <span className="font-medium">₹{analysis.extractedData.profit.toLocaleString()}</span>
                                        </div>
                                      )}
                                      {analysis.extractedData.assets && (
                                        <div>
                                          <span className="text-muted-foreground">Assets: </span>
                                          <span className="font-medium">₹{analysis.extractedData.assets.toLocaleString()}</span>
                                        </div>
                                      )}
                                      {analysis.extractedData.liabilities && (
                                        <div>
                                          <span className="text-muted-foreground">Liabilities: </span>
                                          <span className="font-medium">₹{analysis.extractedData.liabilities.toLocaleString()}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFile(index)}
                            className="ml-2"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {analyses.size > 0 && (
            <div className="flex gap-3">
              <Button className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Download Analysis Report
              </Button>
              <Button variant="outline" className="flex-1">
                Share with Advisor
              </Button>
            </div>
          )}

          {/* Supported Document Types */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Supported Documents:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
              <div>• Financial Statements (P&L, Balance Sheet)</div>
              <div>• Tax Returns</div>
              <div>• Legal Agreements</div>
              <div>• Contracts</div>
              <div>• Operational Reports</div>
              <div>• Business Plans</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
