import { BriefcaseBusinessIcon, Code2Icon, User2Icon, Component, Puzzle, Calendar, LayoutDashboard, List, Settings, WalletCards, LogOutIcon, Video } from "lucide-react";

export const SideBarOptions=[
    {
        name:'Dashboard',
        icon:LayoutDashboard,
        path:'/recruiter/dashboard'
    },
    {
        name:'Scheduled Interview',
        icon:Calendar,
        path:'/recruiter/scheduled-interview'
    },
    {
        name:'All Interview',
        icon:List,
        path:'/recruiter/all-interview'
    },
    {
        name:'Profile',
        icon:User2Icon,
        path:'/recruiter/profile'
    },
    {
        name:'Billing',
        icon:WalletCards,
        path:'/recruiter/billing'
    },
   
   
]

export const SideBarCondidate=[
    {
        name:'Dashboard',
        icon:LayoutDashboard,
        path:'/candidate/dashboard'
    },
    {
        name:'Interviews',
        icon:Video,
        path:'/candidate/interviews'
    },
    {
        name:'Profile',
        icon:User2Icon,
        path:'/candidate/profile'
    },
   
   
]

export const InterviewType=[
    {
        name:'Technical',
        icon:Code2Icon,
    },
    {
        name:'Behavioral',
        icon:User2Icon,
    },
    {
        name:'Experience',
        icon:BriefcaseBusinessIcon,
    },
    {
        name:'Problem Solving',
        icon:Puzzle,
    },
    {
        name:'Leadership',
        icon:Component,
    },
]

export const QUESTIONS_PROMPT=`You are an expert technical interviewer.
Based on the following inputs, generate a well-structured list of high-quality interview questions including candidate introduction, salary negotiation, and closing questions.

Job Title: {{jobPosition}}

Job Description:{{jobDescription}}

Interview Duration: {{duration}}

Interview Type: {{type}}

📝 Your task:

Analyze the job description to identify key responsibilities, required skills, and expected experience.

Generate a list of interview questions depends on interview duration

Adjust the number and depth of questions to match the interview duration or more.

Ensure the questions match the tone and structure of a real-life {{type}} interview.

🧩 Format your response in JSON format with array list of questions.
format: interviewQuestions=[
{
 question:'',
 type:'Candidate selfIntroduction about education background, work experience/Candidate home and working locations/worked previous and current working company/Why Should we hire you/Present salary negotiation/Technical/Behavioral/Experience/Problem Solving/Leadership'
},{
...
}]

🎯 The goal is to create a structured, relevant, and time-optimized interview plan for a {{jobPosition}} role.`

export const FEEDBACK_PROMPT = `{{conversation}}

You are an experienced interview evaluator. Based ONLY on the interview conversation provided above, produce a single, strict JSON object (no surrounding text) with a clear numerical evaluation and concise explanations. The JSON must follow this exact schema and field names so the UI can consume it reliably.

Requirements:
- All numeric ratings must be integers from 0 to 10 (0 = very poor, 10 = outstanding).
- Provide a short rationale (1-2 sentences) for each numeric rating explaining why the candidate received that score.
- Compute an 'overallScore' as the arithmetic mean of the numeric ratings (rounded to the nearest integer).
- Provide a 3-line summary (array of three short strings) capturing strengths, weaknesses, and a short suggested next step.
- Provide a 'Recommendation' value chosen from: 'Hire', 'Further Evaluation', 'Do Not Hire' and a one-line 'RecommendationMessage' explaining the reason.
- Do NOT include any additional fields, markdown, or explanatory text outside the JSON.

Output JSON schema (exact):
{
    "feedback": {
        "rating": {
            "TechnicalSkills": 0,
            "Communication": 0,
            "ProblemSolving": 0,
            "Experience": 0,
            "Behavioral": 0,
            "Analysis": 0
        },
        "rationale": {
            "TechnicalSkills": "<1-2 sentence rationale>",
            "Communication": "<1-2 sentence rationale>",
            "ProblemSolving": "<1-2 sentence rationale>",
            "Experience": "<1-2 sentence rationale>",
            "Behavioral": "<1-2 sentence rationale>",
            "Analysis": "<1-2 sentence rationale>"
        },
        "overallScore": 0,
        "summary": ["line1", "line2", "line3"],
        "Recommendation": "Hire|Further Evaluation|Do Not Hire",
        "RecommendationMessage": "<one concise sentence explaining recommendation>"
    }
}

Important scoring anchors for consistency (use these to guide scores):
- 9-10: exceptional evidence of capability and consistent demonstration during interview.
- 7-8: strong performance with minor gaps.
- 4-6: mixed performance with noticeable gaps or weaknesses.
- 0-3: significant deficiencies or incorrect answers for the role level.

When computing scores, base them on the candidate's answers, depth of knowledge, problem solving steps, and communication clarity shown in the conversation. Be specific in the rationale so differences between candidates are clear.

Now produce the JSON only.
`;