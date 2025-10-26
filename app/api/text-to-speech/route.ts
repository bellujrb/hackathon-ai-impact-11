import { NextRequest, NextResponse } from "next/server"
import { TextToSpeechClient } from "@google-cloud/text-to-speech"

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()
    
    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { success: false, error: "Texto não fornecido" },
        { status: 400 }
      )
    }

    // Verificar credenciais do Google Cloud
    const privateKey = process.env.GOOGLE_CLOUD_PRIVATE_KEY?.split(String.raw`\n`).join("\n")
    const clientEmail = process.env.GOOGLE_CLOUD_CLIENT_EMAIL

    if (!privateKey || !clientEmail) {
      return NextResponse.json({
        success: false,
        error: "Serviço de voz temporariamente indisponível",
        fallback: true,
      }, { status: 503 })
    }

    // Criar cliente Google Text-to-Speech
    const client = new TextToSpeechClient({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
    })

    // Configurar request para síntese de voz
    const request = {
      input: { text },
      voice: {
        languageCode: "pt-BR",
        // Neural2-C = Voz feminina natural e calorosa (perfeita para Theo)
        name: "pt-BR-Neural2-C",
        ssmlGender: "FEMALE" as const,
      },
      audioConfig: {
        audioEncoding: "MP3" as const,
        speakingRate: 0.95, // Velocidade natural
        pitch: 1.0, // Tom neutro-amigável
        volumeGainDb: 0.0,
        effectsProfileId: ["small-bluetooth-speaker-class-device"], // Otimizado para dispositivos
      },
    }

    const [response] = await client.synthesizeSpeech(request)

    if (!response.audioContent) {
      return NextResponse.json({
        success: false,
        error: "Não foi possível gerar áudio",
      }, { status: 500 })
    }

    // Retornar áudio como base64
    const audioBase64 = Buffer.from(response.audioContent as Uint8Array).toString("base64")

    return NextResponse.json({
      success: true,
      data: {
        audio: audioBase64,
        format: "mp3",
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

