import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(req: Request) {
  try {
    const { message, history = [], systemInstruction, model = 'gemini-1.5-flash' } = await req.json()

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured in .env.local' }, { status: 500 })
    }

    // Map UI mock models to actual Gemini models available in the SDK
    let realModel = 'gemini-1.5-flash'
    if (model.includes('pro')) realModel = 'gemini-1.5-pro'

    const generativeModel = genAI.getGenerativeModel({
      model: realModel,
      systemInstruction: systemInstruction || undefined,
    })

    // Format history for Gemini SDK
    const formattedHistory = history.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }))

    const chat = generativeModel.startChat({
      history: formattedHistory,
    })

    const result = await chat.sendMessage(message)
    const responseText = result.response.text()

    return NextResponse.json({
      message: responseText
    })

  } catch (error: any) {
    console.error('AI API Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to generate AI response' }, { status: 500 })
  }
}
