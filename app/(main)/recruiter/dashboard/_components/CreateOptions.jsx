import { Video, Coins, AlertCircle } from 'lucide-react';
import React from 'react';
import Link from 'next/link';
import { useUser } from '@/app/provider';
import { Button } from '@/components/ui/button';

function CreateOptions() {
  const { user } = useUser();
  const hasCredits = (user?.credits || 0) > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

      {/* ------------------- Create Interview Card ------------------- */}
      <div className="relative">
        <Link
          href={hasCredits ? '/recruiter/dashboard/create-interview' : '#'}
          className="block"
        >
          <div
            className={`
              group p-6 rounded-2xl transition-all 
              border bg-white 
              ${hasCredits 
                ? "cursor-pointer hover:border-blue-400 hover:shadow-xl hover:shadow-blue-100" 
                : "cursor-not-allowed opacity-60"
              }

              /* Soft neumorphism */
              shadow-[0_4px_14px_rgba(0,0,0,0.08)]
              hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)]
            `}
          >

            {/* Top icons */}
            <div className="flex items-center justify-between mb-4">
              <div
                className="
                  h-14 w-14 rounded-xl p-3
                  bg-blue-50 text-blue-600
                  shadow-inner
                  flex items-center justify-center
                  transition-all group-hover:bg-blue-100
                "
              >
                <Video size={28} />
              </div>

              {/* No credits badge */}
              {!hasCredits && (
                <div className="flex items-center gap-2 text-red-600 bg-red-100 px-3 py-1 rounded-full shadow-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-xs font-medium">No Credits</span>
                </div>
              )}
            </div>

            {/* Title */}
            <h2 className="font-semibold text-lg text-gray-800">
              Create New Interview
            </h2>

            <p className="text-gray-500 text-sm mt-1 mb-4">
              Create AI-driven interviews and send them to candidates.
            </p>

            {/* Credits */}
            <div className="flex items-center gap-2 text-sm">
              <Coins className="w-4 h-4 text-blue-600" />
              <span className="text-blue-600 font-medium">Cost: 1 Credit</span>
            </div>
          </div>
        </Link>

        {/* Buy Credits Button Overlay */}
        {!hasCredits && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              onClick={() => window.location.href = '/recruiter/billing'}
              className="
                bg-blue-600 hover:bg-blue-700 
                text-white font-medium px-6 py-2 rounded-lg shadow-md
              "
            >
              Buy Credits
            </Button>
          </div>
        )}
      </div>

    </div>
  );
}

export default CreateOptions;
