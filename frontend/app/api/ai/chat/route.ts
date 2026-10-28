import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { message, history = [], systemInstruction, model = 'gemini-1.5-flash' } = await req.json()
    const apiKey = process.env.GEMINI_API_KEY || ''

    if (!apiKey) {
      return NextResponse.json({
        message: `BusinessOS AI: Hello! I received your query "${message}". Set GEMINI_API_KEY in your environment to activate live Gemini AI.`
      })
    }

    let realModel = 'gemini-1.5-flash'
    if (model.includes('pro')) realModel = 'gemini-1.5-pro'

    const contents = [
      ...history.map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      })),
      { role: 'user', parts: [{ text: message }] }
    ]

    const body: any = { contents }
    if (systemInstruction) {
      body.systemInstruction = { parts: [{ text: systemInstruction }] }
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${realModel}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    const data = await response.json()
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || `Received: ${message}`

    return NextResponse.json({
      message: responseText
    })

  } catch (error: any) {
    console.error('AI API Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to generate AI response' }, { status: 500 })
  }
}
