'use client';
import React from 'react';
import { useUser } from '@/app/provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, Plus, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

function CreditsDisplay() {
  const { user } = useUser();
  const router = useRouter();
  const credits = user?.credits || 0;

  const handleBuyCredits = () => {
    router.push('/recruiter/billing');
  };

  // ✅ Determine background gradient color dynamically
  const getBackgroundClass = () => {
    if (credits >= 3) return 'from-blue-50 to-blue-100 border-blue-200';
    if (credits === 2) return 'from-yellow-50 to-amber-100 border-amber-200';
    return 'from-red-50 to-rose-100 border-rose-200';
  };

  // ✅ Determine text color for header
  const getTextColor = () => {
    if (credits >= 3) return 'text-blue-800';
    if (credits === 2) return 'text-amber-800';
    return 'text-red-800';
  };

  return (
    <div className="mb-6 w-full">
      <Card
        className={`border ${getBackgroundClass()} bg-gradient-to-r rounded-xl shadow-md transition-all duration-300`}
      >
        <CardHeader className="pb-3">
          <CardTitle className={`flex items-center gap-2 ${getTextColor()}`}>
            <Coins className="w-5 h-5" />
            Interview Credits
          </CardTitle>
        </CardHeader>

        <CardContent>
          {/* ✅ Mobile-friendly flex layout */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Left section */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <div className="text-center sm:text-left">
                <div
                  className={`text-4xl font-extrabold ${
                    credits >= 3
                      ? 'text-blue-600'
                      : credits === 2
                      ? 'text-amber-600'
                      : 'text-red-600'
                  }`}
                >
                  {credits}
                </div>
                <div
                  className={`text-sm font-medium ${
                    credits >= 3
                      ? 'text-blue-700'
                      : credits === 2
                      ? 'text-amber-700'
                      : 'text-red-700'
                  }`}
                >
                  Credits Remaining
                </div>
              </div>

              <div className="text-sm text-gray-700 max-w-sm">
                <p className="mb-2 leading-snug">
                  Each interview creation costs <strong>1 credit</strong>.{" "}
                  You can create up to{" "}
                  <strong>{credits > 0 ? credits : 0} more interviews</strong>.
                </p>

                {/* Alert message */}
                {credits <= 2 && (
                  <div
                    className={`flex items-center gap-2 p-2 rounded-md text-xs font-medium ${
                      credits === 2
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4" />
                    {credits === 0
                      ? 'No credits remaining. Purchase more to continue creating interviews.'
                      : credits === 1
                      ? 'Only 1 credit remaining. Consider purchasing more credits.'
                      : 'Low credits remaining. Consider purchasing more credits.'}
                  </div>
                )}
              </div>
            </div>

            {/* Right section */}
            <Button
              onClick={handleBuyCredits}
              className={`w-full sm:w-auto font-semibold text-white shadow-md hover:shadow-lg transition-all duration-300 ${
                credits >= 3
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : credits === 2
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              <Plus className="w-4 h-4 mr-2" />
              Buy Credits
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CreditsDisplay;
