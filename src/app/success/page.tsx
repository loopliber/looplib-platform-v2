// app/success/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Download, Mail, ArrowLeft, FileText } from 'lucide-react';
import Link from 'next/link';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    // You could fetch session details here if needed
    // For now, we'll just show a generic success message
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-8 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Purchase Successful!</h1>
          <p className="text-neutral-400 mb-6">
            Thank you for your purchase. Your license has been sent to your email.
          </p>

          <div className="bg-neutral-800/50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-3 text-sm">
              <Mail className="w-5 h-5 text-orange-400" />
              <span className="text-gray-300">Check your email for:</span>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-neutral-400">
              <li>• License agreement PDF</li>
              <li>• Download links for your files</li>
              <li>• Usage guidelines</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Link
              href="/"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Browse More Samples</span>
            </Link>
            
            <a
              href="https://cdn.shopify.com/s/files/1/0816/1257/0973/files/Looplib_Sample_License_Agreement.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-neutral-800 hover:bg-neutral-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>View License Agreement</span>
            </a>
          </div>

          <p className="text-xs text-neutral-500 mt-6">
            Need help? Contact support@looplib.com
          </p>
        </div>
      </div>
    </div>
  );
}