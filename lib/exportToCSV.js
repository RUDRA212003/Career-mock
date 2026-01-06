import { saveAs } from 'file-saver';
import Papa from 'papaparse';

/**
 * Exports candidate data to a CSV file.
 * @param {Array} candidates - The list of candidate objects from the database.
 * @param {string} interviewName - The name of the job position/interview.
 */
const exportToCSV = (candidates, interviewName = "Interview") => {
  if (!candidates || candidates.length === 0) return;

  const data = candidates.map(c => {
    // --- ROBUST DATA NORMALIZATION ---
    let raw = c.conversation_transcript ?? c.feedback ?? null;
    let fb = {};

    try {
      // Handle potential stringified JSON with markdown code fences
      if (typeof raw === "string") {
        const fenceMatch = raw.match(/```(?:json)?\n([\s\S]*?)```/i);
        const jsonStr = fenceMatch ? fenceMatch[1] : raw;
        raw = JSON.parse(jsonStr);
      }
      
      // Unwrap { content: ... } if it exists from API responses
      if (raw?.content) raw = typeof raw.content === 'string' ? JSON.parse(raw.content) : raw.content;

      // Extract the feedback object from common nested shapes
      fb = raw?.feedback ?? raw?.conversation_transcript?.feedback ?? raw ?? {};
    } catch (e) {
      console.error("CSV Export: Error parsing candidate data", e);
      fb = {};
    }

    // --- DATA MAPPING ---
    const rating = fb.rating || {};
    
    return {
      "Name": c.fullname || c.userName || 'N/A',
      "Email": c.email || c.userEmail || 'N/A',
      "Completed Date": c.completed_at ? new Date(c.completed_at).toLocaleDateString() : 'N/A',
      "Overall Score": fb.overallScore ?? 'N/A',
      "Recommendation": fb.recommendation || fb.Recommendation || 'N/A',
      "Technical Skills": rating.TechnicalSkills ?? 'N/A',
      "Communication": rating.Communication ?? 'N/A',
      "Problem Solving": rating.ProblemSolving ?? 'N/A',
      "Experience": rating.Experience ?? 'N/A',
      "Behavioral": rating.Behavioral ?? 'N/A',
      "Summary": Array.isArray(fb.summary || fb.summery)
        ? (fb.summary || fb.summery).join('; ')
        : (fb.summary || fb.summery || '').replace(/\n/g, ' '), // Clean newlines for CSV
      "Recommendation Message": (fb.RecommendationMessage || fb.recommendationMessage || '').replace(/\n/g, ' ')
    };
  });

  // Convert to CSV
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

  // --- DYNAMIC FILENAME ---
  // Replaces spaces/special chars with underscores and appends date
  const safeName = interviewName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const dateStr = new Date().toISOString().split('T')[0];
  const fileName = `${safeName}_candidates_${dateStr}.csv`;

  saveAs(blob, fileName);
};

export default exportToCSV;