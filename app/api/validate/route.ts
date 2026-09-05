import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { generateValidationReport } from '@/lib/mock-data';

// Helper to clean JSON response from markdown wrappers
function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      title, 
      description, 
      category, 
      targetMarket, 
      uniqueValue,
      whoWillPay,
      whatProblemSolved,
      howSolvingNow,
      whySolutionBetter,
      howGetFirst100Users
    } = body;

    // Check if API Key is set and valid (not default placeholder)
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const isKeyConfigured = apiKey && apiKey !== 'your_anthropic_api_key_here' && apiKey.trim() !== '';

    if (!isKeyConfigured) {
      console.warn('WARNING: ANTHROPIC_API_KEY is not configured or using placeholder. Falling back to mock generator.');
      
      // Generate a mock report
      const mockReport = generateValidationReport({
        id: 'idea_fallback_' + Math.random().toString(36).substr(2, 9),
        userId: 'user_fallback',
        userName: 'System Fallback',
        userAvatar: '',
        title,
        description,
        category,
        votes: 0,
        comments: 0,
        saved: false,
        createdAt: new Date().toISOString(),
      });

      return NextResponse.json({
        ...mockReport,
        isMock: true,
        warning: 'API Key not configured. Using fallback simulation.'
      });
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    const systemPrompt = `You are an expert venture capitalist, startup incubator director, and business analyst. 
Your task is to provide an extreme, high-quality, professional, and detailed business idea validation report.

You MUST respond ONLY with a valid JSON object matching the TypeScript interface below. Do not output any chat explanation, greetings, or markdown formatting outside the JSON object. The response must be directly parseable as JSON.

TypeScript Interface:
interface ValidationReport {
  marketPotential: number;      // overall market potential score from 0 to 100
  techFeasibility: number;      // technical feasibility score from 0 to 100
  overallScore: number;         // overall score from 0 to 100
  targetMarket: string;         // detailed target market analysis (2-3 paragraphs, discussing demographics, TAM, and customer profile)
  uniqueValue: string;          // unique value proposition and differentiator analysis (2-3 paragraphs, discussing competitor edges)
  businessModel: string;        // proposed business model and revenue stream options (2-3 paragraphs, explaining pricing strategies)
  competitorAnalysis: string;   // detailed analysis of the competitive landscape and major competitors (2-3 paragraphs)
  riskFactors: string;          // key risk factors (market, tech, legal, execution) and concrete mitigation strategies (2-3 paragraphs)
  nextSteps: string;            // recommended next steps, formatted as a numbered list (e.g. "1. Step one\\n2. Step two")
  recommendations: string[];    // an array of exactly 5 concrete, highly specific, and actionable recommendations
  
  // Advanced Practical Metrics
  buildDifficulty: string;      // "Easy", "Medium", or "Hard"
  estimatedMvpCost: string;     // Estimated cost range in USD to launch MVP, e.g. "Free (Self-built)", "$100 - $500", "$500 - $1,500", etc.
  timeToBuild: string;          // Estimated build timeline, e.g. "1-2 weeks", "3-4 weeks", "2-3 months"
  first5Features: string[];     // Array of exactly 5 core features to build first for the MVP
  biggestRisk: string;          // Summary of the single biggest risk/hurdle (1-2 sentences)
  realityCheck: string;         // A blunt assessment of why this idea might fail (e.g. "This idea may fail because users may not pay unless the problem is extremely painful.")
  competitorComparison: {
    competitor: string;
    price: string;
    strength: string;
    weakness: string;
    opportunity: string;
  }[];                          // List of 2-3 key competitors
  mvpRoadmap: {
    week: string;               // "Week 1", "Week 2", "Week 3", "Week 4"
    tasks: string;              // Specific, practical milestone for that week
  }[];                          // Array of exactly 4 entries
  pivotSuggestions: string[];   // 2-3 alternate versions or directions of the same idea if the score is low or execution is too hard
  first100UsersStrategy: {
    platform: string;           // E.g., "Reddit/LinkedIn", "College groups", "WhatsApp communities", "Instagram", "Local businesses", "Direct outreach"
    strategy: string;           // Concrete steps to acquire users on this platform
  }[];                          // 4 platforms with customized strategies
}`;

    const userPrompt = `Please analyze the following business idea details and validation responses:
Title: ${title}
Category: ${category}
Description: ${description}
Target Market Inputs: ${targetMarket}
Unique Value Proposition Inputs: ${uniqueValue}

Validation Question Responses:
1. Who will pay?
Answer: ${whoWillPay}

2. What problem is solved?
Answer: ${whatProblemSolved}

3. How are users solving it now?
Answer: ${howSolvingNow}

4. Why is your solution better?
Answer: ${whySolutionBetter}

5. How will you get first 100 users?
Answer: ${howGetFirst100Users}`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 3500,
      temperature: 0.2,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt }
      ]
    });

    const responseText = response.content[0].type === 'text' ? response.content[0].text : '';
    const cleanedText = cleanJsonResponse(responseText);
    
    try {
      const parsedReport = JSON.parse(cleanedText);
      return NextResponse.json({
        ...parsedReport,
        isMock: false
      });
    } catch (parseError) {
      console.error('Failed to parse Claude JSON response. Raw text:', responseText);
      return NextResponse.json({ error: 'Failed to parse AI response as structured JSON' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Claude API Route Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
