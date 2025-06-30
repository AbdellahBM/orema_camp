import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(request) {
  try {
    // Parse request body
    const participantData = await request.json()

    // Validate required fields
    if (!participantData.name || !participantData.email) {
      return Response.json(
        { error: 'Missing required participant data' },
        { status: 400 }
      )
    }

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    // Prepare the scoring prompt
    const prompt = createScoringPrompt(participantData)

    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // Generate score and explanation
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse the AI response
    const parsedResponse = parseAIResponse(text)

    // Validate the parsed response
    if (!parsedResponse.score || !parsedResponse.explanation) {
      throw new Error('Invalid AI response format')
    }

    // Ensure score is within valid range
    const score = Math.max(1, Math.min(100, parsedResponse.score))

    return Response.json({
      score: score,
      score_explanation: parsedResponse.explanation,
      success: true
    })

  } catch (error) {
    console.error('Error scoring participant:', error)
    
    return Response.json(
      { 
        error: 'Failed to score participant',
        details: error.message,
        success: false 
      },
      { status: 500 }
    )
  }
}

function createScoringPrompt(data) {
  const age = data.age || 'غير محدد'
  const school = data.school || 'غير محدد'
  const niveauScolaire = data.niveau_scolaire || 'غير محدد'
  const orgStatus = data.org_status || 'غير محدد'
  const previousCamps = data.previous_camps ? 'نعم' : 'لا'
  const canPay = data.can_pay_350dh ? 'نعم' : 'لا'
  const campExpectation = data.camp_expectation || 'غير محدد'
  const extraInfo = data.extra_info || 'غير محدد'

  return `
أنت خبير في تقييم المشاركين في المخيمات الصيفية التعليمية والتربوية. سأعطيك معلومات عن مشارك محتمل، وأريدك أن تعطيه درجة من 1 إلى 100 بناءً على مدى ملاءمته للمخيم.

معايير التقييم:
- التحفيز والاهتمام (30%)
- الخلفية التعليمية والعمر المناسب (25%)
- القدرة المالية والالتزام (20%)
- الخبرة السابقة والنضج (15%)
- وضوح التوقعات والأهداف (10%)

معلومات المشارك:
- الاسم: ${data.name}
- العمر: ${age} سنة
- المؤسسة التعليمية: ${school}
- المستوى الدراسي: ${niveauScolaire}
- الحالة التنظيمية: ${orgStatus}
- المشاركة في مخيمات سابقة: ${previousCamps}
- القدرة على دفع 350 درهم: ${canPay}
- توقعات المشارك من المخيم: ${campExpectation}
- معلومات إضافية/صحية: ${extraInfo}

يرجى الرد بالتنسيق التالي بالضبط:
SCORE: [رقم من 1 إلى 100]
EXPLANATION: [شرح مختصر باللغة العربية لا يتجاوز 150 كلمة يوضح أسباب هذه الدرجة]

مثال على الرد:
SCORE: 85
EXPLANATION: المشارك يظهر تحفيزاً عالياً وتوقعات واضحة من المخيم. العمر مناسب والمستوى التعليمي جيد. القدرة المالية متوفرة مما يدل على الالتزام. ينصح بقبوله.
`;
}

function parseAIResponse(text) {
  try {
    // Extract score
    const scoreMatch = text.match(/SCORE:\s*(\d+)/i)
    const score = scoreMatch ? parseInt(scoreMatch[1]) : null

    // Extract explanation
    const explanationMatch = text.match(/EXPLANATION:\s*(.+)/si)
    const explanation = explanationMatch ? explanationMatch[1].trim() : null

    // Clean up explanation if it contains extra formatting
    const cleanExplanation = explanation 
      ? explanation.replace(/\*\*/g, '').replace(/\*/g, '').trim()
      : null

    return {
      score: score,
      explanation: cleanExplanation
    }
  } catch (error) {
    console.error('Error parsing AI response:', error)
    return { score: null, explanation: null }
  }
} 