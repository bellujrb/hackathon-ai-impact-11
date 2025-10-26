import { NextRequest, NextResponse } from "next/server"
import { SpeechClient } from "@google-cloud/speech"

export const maxDuration = 60

// Fallback: usar OpenAI Whisper para transcrição se Google Speech não estiver disponível
async function transcribeWithWhisper(audioBuffer: Buffer): Promise<string> {
  const openaiApiKey = process.env.OPENAI_API_KEY
  
  if (!openaiApiKey) {
    throw new Error("Nenhum serviço de transcrição configurado (Google Speech ou OpenAI Whisper)")
  }

  // Criar FormData para enviar o áudio ao Whisper
  const formData = new FormData()
  const audioBlob = new Blob([audioBuffer], { type: "audio/webm" })
  formData.append("file", audioBlob, "audio.webm")
  formData.append("model", "whisper-1")
  formData.append("language", "pt")

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiApiKey}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Erro no Whisper: ${error}`)
  }

  const data = await response.json()
  return data.text || ""
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
        // Fallback para OpenAI Whisper
        try {
          transcription = await transcribeWithWhisper(audioBuffer)
        } catch (whisperError) {
          console.error("Erro ao usar OpenAI Whisper:", whisperError)
          throw new Error("Todos os serviços de transcrição falharão")
        }
      }
    } else {
      // Sem credenciais do Google - tentar OpenAI Whisper como fallback
      try {
        transcription = await transcribeWithWhisper(audioBuffer)
      } catch (whisperError) {
        console.error("Erro ao usar OpenAI Whisper:", whisperError)
        return NextResponse.json({
          success: false,
          error: "Serviço de transcrição temporariamente indisponível",
          fallback: true,
        }, { status: 503 })
      }
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

