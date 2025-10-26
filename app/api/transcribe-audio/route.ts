import { NextRequest, NextResponse } from "next/server"
import { SpeechClient } from "@google-cloud/speech"

export const maxDuration = 60

// Fallback: usar Gemini para transcrição se Google Speech não estiver disponível
async function transcribeWithGemini(audioBuffer: Buffer): Promise<string> {
  // Gemini não suporta áudio direto ainda, então retornamos um placeholder
  // Em produção, você pode usar Whisper da OpenAI ou outro serviço
  throw new Error("Google Speech-to-Text credentials not configured")
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const audioFile = formData.get("audio") as File
    
    if (!audioFile) {
      return NextResponse.json(
        { success: false, error: "Arquivo de áudio não fornecido" },
        { status: 400 }
      )
    }

    // Converter File para Buffer
    const arrayBuffer = await audioFile.arrayBuffer()
    const audioBuffer = Buffer.from(arrayBuffer)

    let transcription = ""

    // Tentar usar Google Speech-to-Text se credenciais estiverem disponíveis
    const privateKey = process.env.GOOGLE_CLOUD_PRIVATE_KEY?.split(String.raw`\n`).join("\n")
    const clientEmail = process.env.GOOGLE_CLOUD_CLIENT_EMAIL

    if (privateKey && clientEmail) {
      try {
        const client = new SpeechClient({
          credentials: {
            client_email: clientEmail,
            private_key: privateKey,
          },
        })

        const request = {
          audio: {
            content: audioBuffer.toString("base64"),
          },
          config: {
            encoding: "WEBM_OPUS" as const,
            sampleRateHertz: 16000,
            languageCode: "pt-BR",
            model: "default",
            enableAutomaticPunctuation: true,
            useEnhanced: true,
          },
        }

        const [response] = await client.recognize(request)
        const results = response.results || []
        
        transcription = results
          .map((result) => result.alternatives?.[0]?.transcript || "")
          .join(" ")
          .trim()

      } catch (speechError) {
        console.error("Erro ao usar Google Speech-to-Text:", speechError)
        // Fallback para método alternativo
        transcription = await transcribeWithGemini(audioBuffer)
      }
    } else {
      // Sem credenciais - usar método alternativo ou retornar erro amigável
      return NextResponse.json({
        success: false,
        error: "Serviço de transcrição temporariamente indisponível",
        fallback: true,
      }, { status: 503 })
    }

    if (!transcription) {
      return NextResponse.json({
        success: false,
        error: "Não foi possível transcrever o áudio. Tente falar mais claramente.",
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: {
        transcription,
      },
    })
    
  } catch (error) {
    console.error("Erro ao transcrever áudio:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao processar áudio",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

