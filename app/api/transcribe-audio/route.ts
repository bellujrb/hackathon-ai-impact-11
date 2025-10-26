import { NextRequest, NextResponse } from "next/server"
import { SpeechClient } from "@google-cloud/speech"

export const maxDuration = 60

// Fallback: usar OpenAI Whisper para transcrição se Google Speech não estiver disponível
async function transcribeWithWhisper(audioBuffer: Buffer, mimeType: string = "audio/webm"): Promise<string> {
  const openaiApiKey = process.env.OPENAI_API_KEY
  
  if (!openaiApiKey) {
    throw new Error("Nenhum serviço de transcrição configurado (Google Speech ou OpenAI Whisper)")
  }

  // Mapear MIME type para extensão de arquivo
  // Remover parâmetros de codec para evitar problemas
  const cleanMimeType = mimeType.split(';')[0].trim()
  
  const extensionMap: Record<string, string> = {
    "audio/webm": "webm",
    "audio/mp4": "m4a",
    "audio/mpeg": "mp3",
    "audio/wav": "wav",
    "audio/ogg": "ogg",
  }
  
  const extension = extensionMap[cleanMimeType] || "webm"
  const filename = `audio.${extension}`
  
  console.log(`🎵 Áudio recebido:`)
  console.log(`   - MIME original: ${mimeType}`)
  console.log(`   - MIME limpo: ${cleanMimeType}`)
  console.log(`   - Arquivo: ${filename}`)
  console.log(`   - Tamanho: ${audioBuffer.length} bytes`)

  // Criar FormData para enviar o áudio ao Whisper
  // IMPORTANTE: Usar MIME type LIMPO (sem codecs) no Blob
  const formData = new FormData()
  const audioBlob = new Blob([audioBuffer], { type: cleanMimeType })
  formData.append("file", audioBlob, filename)
  formData.append("model", "whisper-1")
  formData.append("language", "pt")
  
  console.log(`   - Blob type: ${audioBlob.type}`)
  console.log(`   - Blob size: ${audioBlob.size} bytes`)

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
    const mimeType = audioFile.type || "audio/webm"

    // Validar tamanho do áudio
    if (audioBuffer.length === 0) {
      console.error("❌ Áudio vazio recebido")
      return NextResponse.json({
        success: false,
        error: "Áudio vazio. Por favor, grave novamente.",
      }, { status: 400 })
    }
    
    if (audioBuffer.length < 100) {
      console.error("❌ Áudio muito curto:", audioBuffer.length, "bytes")
      return NextResponse.json({
        success: false,
        error: "Áudio muito curto. Fale por mais tempo.",
      }, { status: 400 })
    }

    let transcription = ""

    // Usar OpenAI Whisper diretamente (mais confiável e simples)
    try {
      transcription = await transcribeWithWhisper(audioBuffer, mimeType)
      console.log("✅ Transcrição bem-sucedida:", transcription.substring(0, 50) + "...")
    } catch (whisperError) {
      console.error("❌ Erro ao usar OpenAI Whisper:", whisperError)
      
      // Se Whisper falhar, tentar Google Speech como fallback
      const privateKey = process.env.GOOGLE_CLOUD_PRIVATE_KEY?.split(String.raw`\n`).join("\n")
      const clientEmail = process.env.GOOGLE_CLOUD_CLIENT_EMAIL

      if (privateKey && clientEmail) {
        try {
          console.log("Tentando Google Speech-to-Text como fallback...")
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
          return NextResponse.json({
            success: false,
            error: "Serviço de transcrição temporariamente indisponível",
            fallback: true,
          }, { status: 503 })
        }
      } else {
        return NextResponse.json({
          success: false,
          error: "Serviço de transcrição temporariamente indisponível",
          details: whisperError instanceof Error ? whisperError.message : "Unknown error",
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

