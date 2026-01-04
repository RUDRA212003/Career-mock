'use client';
import React, { useEffect, useState } from 'react';
import { useUser } from '@/app/provider';
import { supabase } from '@/services/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, Calendar, Clock, Star, CheckCircle, Clock as ClockIcon } from 'lucide-react';
import moment from 'moment';
import { toast } from 'sonner';

export default function CandidateInterviews() {
  const { user } = useUser();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email) {
      fetchCandidateInterviews();
    }
  }, [user]);

  const fetchCandidateInterviews = async () => {
    try {
      setLoading(true);

      // ✅ Correct lowercase table + lowercase columns
      const { data: results, error } = await supabase
        .from('interview_results')
        .select(`
          *,
          interviews (
            jobposition,
            jobdescription,
            type,
            duration,
            created_at,
            userEmail
          )
        `)
        .eq('email', user.email)
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error fetching interviews:', error);
        toast.error('Failed to load interviews');
        return;
      }

      setInterviews(results || []);
    } catch (err) {
      console.error('Error:', err);
      toast.error('Failed to load interviews');
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

  const getStatusIcon = (isCompleted) =>
    isCompleted ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <ClockIcon className="w-4 h-4 text-yellow-500" />
    );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading your interviews...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Interviews</h1>
        <p className="text-gray-600 mt-1">
          Track all your interview sessions and results
        </p>
      </div>

      {interviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Video className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No interviews yet
            </h3>
            <p className="text-gray-500 text-center max-w-md">
              You haven't participated in any interviews yet. When you complete
              an interview, it will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {interviews.map((result) => {
            const interview = result.interviews;
            const feedback = result.conversation_transcript?.feedback;
            const overallScore = calculateOverallScore(feedback);
            const isCompleted = Boolean(result.completed_at);

            return (
              <Card
                key={result.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Video className="w-5 h-5 text-blue-600" />
                        <CardTitle className="text-lg">
                          {interview?.jobposition || 'Interview'}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {moment(interview?.created_at).format('MMM DD, YYYY')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {interview?.duration || 'N/A'}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {interview?.type || 'Interview'}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusIcon(isCompleted)}
                      <Badge
                        variant={isCompleted ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {isCompleted ? 'Completed' : 'In Progress'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {isCompleted ? (
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-gray-700">
                          Overall Score
                        </span>
                      </div>
                      <Badge className={`text-xs ${getScoreColor(overallScore)}`}>
                        {overallScore}
                      </Badge>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500 text-sm">
                        You will be contacted by your recruiter soon.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
