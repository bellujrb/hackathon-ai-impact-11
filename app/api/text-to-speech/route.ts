import { NextRequest, NextResponse } from "next/server"

export const maxDuration = 60

// Tentar OpenAI TTS primeiro (melhor qualidade)
async function synthesizeWithOpenAI(text: string): Promise<ArrayBuffer> {
  const openaiApiKey = process.env.OPENAI_API_KEY
  
  if (!openaiApiKey) {
    throw new Error("OpenAI API key não configurada")
  }

  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "tts-1-hd", // Modelo HD de alta qualidade
      input: text,
      voice: "onyx", // Voz masculina profunda e calorosa (perfeita para Theo)
      speed: 0.95, // Velocidade natural
      response_format: "mp3",
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI TTS error: ${error}`)
  }

  return await response.arrayBuffer()
}

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()
    
    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { success: false, error: "Texto não fornecido" },
        { status: 400 }
      )
    }

    // Limitar tamanho do texto (OpenAI TTS tem limite de 4096 caracteres)
    const truncatedText = text.length > 4000 ? text.substring(0, 4000) + "..." : text

    let audioBuffer: ArrayBuffer | null = null
    let usedService = "none"

    // Tentar OpenAI TTS primeiro
    try {
      audioBuffer = await synthesizeWithOpenAI(truncatedText)
      usedService = "openai"
    } catch (openaiError) {
      console.error("Erro ao usar OpenAI TTS:", openaiError)
      
      // Se OpenAI falhar, retornar erro para usar fallback do navegador
      return NextResponse.json({
        success: false,
        error: "Serviço de voz temporariamente indisponível",
        fallback: true,
      }, { status: 503 })
    }

    if (!audioBuffer) {
      return NextResponse.json({
        success: false,
        error: "Não foi possível gerar áudio",
        fallback: true,
      }, { status: 503 })
    }

    // Retornar áudio como base64
    const audioBase64 = Buffer.from(audioBuffer).toString("base64")

    return NextResponse.json({
      success: true,
      data: {
        audio: audioBase64,
        format: "mp3",
        service: usedService,
      },
    })
    
  } catch (error) {
    console.error("Erro ao sintetizar voz:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao processar síntese de voz",
        details: error instanceof Error ? error.message : "Unknown error",
        fallback: true,
      },
      { status: 500 }
    )
  }
}

