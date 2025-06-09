// src/app/admin/diagnostics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'checking';
  message: string;
  details?: any;
}

export default function DiagnosticsPage() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [testing, setTesting] = useState(false);
  const supabase = createClient();

  const runDiagnostics = async () => {
    setTesting(true);
    setResults([]);

    // Test 1: Check environment variables
    addResult({
      name: 'Environment Variables',
      status: 'checking',
      message: 'Checking configuration...'
    });

    const r2Url = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
    if (r2Url) {
      updateResult('Environment Variables', {
        status: 'success',
        message: `R2 URL configured: ${r2Url}`,
        details: { r2Url }
      });
    } else {
      updateResult('Environment Variables', {
        status: 'error',
        message: 'R2_PUBLIC_URL not set in environment variables',
        details: { 
          hint: 'Add NEXT_PUBLIC_R2_PUBLIC_URL to your .env.local file',
          example: 'NEXT_PUBLIC_R2_PUBLIC_URL=https://pub-xxxxx.r2.dev'
        }
      });
    }

    // Test 2: Check Supabase connection
    addResult({
      name: 'Supabase Connection',
      status: 'checking',
      message: 'Testing database connection...'
    });

    try {
      const { count, error } = await supabase
        .from('samples')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;

      updateResult('Supabase Connection', {
        status: 'success',
        message: `Connected successfully. Found ${count || 0} samples in database.`,
        details: { sampleCount: count }
      });
    } catch (error: any) {
      updateResult('Supabase Connection', {
        status: 'error',
        message: 'Failed to connect to Supabase',
        details: { error: error.message }
      });
    }

    // Test 3: Test R2 URL accessibility
    if (r2Url) {
      addResult({
        name: 'R2 Public Access',
        status: 'checking',
        message: 'Testing R2 bucket accessibility...'
      });

      try {
        // Try to fetch a test file
        const testUrl = `${r2Url}/test.txt`;
        const response = await fetch(testUrl, { 
          method: 'HEAD',
          mode: 'cors'
        });

        if (response.ok) {
          updateResult('R2 Public Access', {
            status: 'success',
            message: 'R2 bucket is publicly accessible',
            details: { testUrl, status: response.status }
          });
        } else if (response.status === 404) {
          updateResult('R2 Public Access', {
            status: 'warning',
            message: 'R2 bucket is accessible but test file not found',
            details: { 
              testUrl, 
              status: response.status,
              hint: 'This is normal if you haven\'t uploaded a test.txt file'
            }
          });
        } else {
          updateResult('R2 Public Access', {
            status: 'error',
            message: `R2 bucket returned status ${response.status}`,
            details: { 
              testUrl, 
              status: response.status,
              hint: 'Check if your R2 bucket has public access enabled'
            }
          });
        }
      } catch (error: any) {
        updateResult('R2 Public Access', {
          status: 'error',
          message: 'Failed to access R2 bucket',
          details: { 
            error: error.message,
            hint: 'This could be a CORS issue or the bucket is not public'
          }
        });
      }
    }

    // Test 4: Check sample URLs
    addResult({
      name: 'Sample URL Test',
      status: 'checking',
      message: 'Testing sample file accessibility...'
    });

    try {
      const { data: samples } = await supabase
        .from('samples')
        .select('file_url, name')
        .limit(3);

      if (samples && samples.length > 0) {
        let successCount = 0;
        const urlTests = [];

        for (const sample of samples) {
          try {
            const response = await fetch(sample.file_url, { 
              method: 'HEAD',
              mode: 'cors'
            });
            
            if (response.ok) {
              successCount++;
              urlTests.push({ 
                name: sample.name, 
                url: sample.file_url, 
                status: 'accessible' 
              });
            } else {
              urlTests.push({ 
                name: sample.name, 
                url: sample.file_url, 
                status: `Error ${response.status}` 
              });
            }
          } catch (error) {
            urlTests.push({ 
              name: sample.name, 
              url: sample.file_url, 
              status: 'Failed to fetch' 
            });
          }
        }

        if (successCount === samples.length) {
          updateResult('Sample URL Test', {
            status: 'success',
            message: `All ${samples.length} tested samples are accessible`,
            details: { urlTests }
          });
        } else if (successCount > 0) {
          updateResult('Sample URL Test', {
            status: 'warning',
            message: `${successCount} of ${samples.length} samples are accessible`,
            details: { urlTests }
          });
        } else {
          updateResult('Sample URL Test', {
            status: 'error',
            message: 'No sample URLs are accessible',
            details: { urlTests }
          });
        }
      } else {
        updateResult('Sample URL Test', {
          status: 'warning',
          message: 'No samples found in database to test',
          details: { hint: 'Add some samples first' }
        });
      }
    } catch (error: any) {
      updateResult('Sample URL Test', {
        status: 'error',
        message: 'Failed to test sample URLs',
        details: { error: error.message }
      });
    }

    setTesting(false);
  };

  const addResult = (result: DiagnosticResult) => {
    setResults(prev => [...prev, result]);
  };

  const updateResult = (name: string, updates: Partial<DiagnosticResult>) => {
    setResults(prev => prev.map(r => 
      r.name === name ? { ...r, ...updates } : r
    ));
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'checking':
        return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">R2 & System Diagnostics</h1>
          <button
            onClick={runDiagnostics}
            disabled={testing}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 rounded-lg flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
            <span>Re-run Tests</span>
          </button>
        </div>

        <div className="space-y-4">
          {results.map((result, index) => (
            <div key={index} className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{result.name}</h3>
                  <p className="text-neutral-400 mt-1">{result.message}</p>
                  
                  {result.details && (
                    <div className="mt-4 bg-neutral-800/50 rounded-lg p-4">
                      <pre className="text-xs text-neutral-300 overflow-x-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-blue-900/20 border border-blue-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
          <div className="space-y-2">
            <a 
              href="/api/populate-test-data"
              target="_blank"
              className="text-blue-400 hover:text-blue-300 block"
            >
              → Populate database with test samples
            </a>
            <a 
              href="/admin/manual-add"
              className="text-blue-400 hover:text-blue-300 block"
            >
              → Manually add samples
            </a>
            <a 
              href="/"
              className="text-blue-400 hover:text-blue-300 block"
            >
              → View main app
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}