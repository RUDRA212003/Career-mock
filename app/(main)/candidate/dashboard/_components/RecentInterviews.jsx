'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@/app/provider';
import { supabase } from '@/services/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Video,
  Calendar,
  Star,
  CheckCircle,
  Clock,
  VerifiedIcon,
} from 'lucide-react';
import moment from 'moment';
import Link from 'next/link';

export default function RecentInterviews() {
  const { user } = useUser();
  const [recentInterviews, setRecentInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email) {
      fetchRecentInterviews();
    }
  }, [user]);

  const fetchRecentInterviews = async () => {
    try {
      setLoading(true);
      const { data: results, error } = await supabase
        .from('interview_results')
        .select(
          `
          *,
          interviews (
            jobposition,
            jobdescription,
            type,
            duration,
            created_at
          )
        `
        )
        .eq('email', user.email)
        .order('completed_at', { ascending: false })
        .limit(3);

      if (error) console.error('Error fetching recent interviews:', error);
      setRecentInterviews(results || []);
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallScore = (feedback) => {
    if (!feedback?.rating) return 'N/A';
    const ratings = Object.values(feedback.rating).filter(
      (val) => typeof val === 'number'
    );
    if (ratings.length === 0) return 'N/A';
    const average = Math.round(
      ratings.reduce((a, b) => a + b, 0) / ratings.length
    );
    return `${average}/10`;
  };

  const getScoreColor = (score) => {
    if (score === 'N/A') return 'bg-gray-100 text-gray-600';
    const numScore = parseInt(score);
    if (numScore >= 8) return 'bg-green-100 text-green-700';
    if (numScore >= 6) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Video className="w-5 h-5" />
            Recent Interviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="mt-2 text-gray-600 text-sm">Loading...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Video className="w-5 h-5" />
            Recent Interviews
          </CardTitle>

          {recentInterviews.length > 0 && (
            <Link href="/candidate/interviews" className="ml-auto">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        {recentInterviews.length === 0 ? (
          <div className="text-center py-8">
            <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm sm:text-base">
              No interviews yet
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Your interview history will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {recentInterviews.map((result) => {
              const interview = result.interviews;
              const feedback = result.conversation_transcript?.feedback;
              const overallScore = calculateOverallScore(feedback);

              return (
                <div
                  key={result.id}
                  className="p-3 sm:p-4 bg-gray-50 hover:bg-gray-100 transition-all rounded-lg shadow-sm sm:shadow-md"
                >
                  {/* Job Title & Type */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm sm:text-base">
                        {interview?.jobposition || 'Interview'}
                      </h4>
                      <Badge variant="outline" className="text-[10px] sm:text-xs">
                        {interview?.type || 'Interview'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 mt-2 sm:mt-0 text-xs text-gray-500 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {moment(interview?.created_at).format('MMM DD')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {interview?.duration || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Score / Status */}
                  <div className="flex items-center justify-between mt-2">
                    {result.completed_at ? (
                      // ✅ Interview completed
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {feedback ? (
                          <Badge className={`text-xs ${getScoreColor(overallScore)}`}>
                            <Star className="w-3 h-3 mr-1" />
                            {overallScore}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Completed
                          </Badge>
                        )}
                      </div>
                    ) : (
                      // 🚧 Still in progress (not yet completed)
                      <div className="flex items-center gap-2">
                        <VerifiedIcon className="w-4 h-4 text-yellow-500" />
                        <Badge variant="secondary" className="text-xs">
                          In Progress
                        </Badge>
                      </div>
                    )}


                    {/* Details button (only on mobile for better UX) */}

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
