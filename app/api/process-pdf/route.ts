import { NextRequest, NextResponse } from "next/server"
import { DocumentProcessorServiceClient } from "@google-cloud/documentai"

export const maxDuration = 60

async function processDocumentWithGoogleAI(fileBuffer: Buffer): Promise<string> {
  const location = "us"
  const projectId = process.env.GOOGLE_PROJECT_ID
  const processorId = process.env.GOOGLE_DOCUMENT_AI_PROCESSOR_ID
  const privateKey = process.env.GOOGLE_CLOUD_PRIVATE_KEY?.split(String.raw`\n`).join("\n")
  const clientEmail = process.env.GOOGLE_CLOUD_CLIENT_EMAIL

  if (!projectId || !processorId || !privateKey || !clientEmail) {
    throw new Error("Google Document AI credentials not configured")
  }

  const client = new DocumentProcessorServiceClient({
    apiEndpoint: "us-documentai.googleapis.com",
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
  })

  const name = `projects/${projectId}/locations/${location}/processors/${processorId}`

  const request = {
    name,
    rawDocument: {
      content: fileBuffer.toString("base64"),
      mimeType: "application/pdf",
    },
  }

  const [result] = await client.processDocument(request)

  if (!result || !result.document || !result.document.text) {
    throw new Error("Failed to extract text from document")
  }

  return result.document.text
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Arquivo não fornecido" },
        { status: 400 }
      )
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { success: false, error: "Apenas arquivos PDF são aceitos" },
        { status: 400 }
      )
    }

    // Converter File para Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Extrair texto do PDF usando Google Document AI
    const extractedText = await processDocumentWithGoogleAI(buffer)

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Não foi possível extrair texto do PDF" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        text: extractedText,
      },
    })
  } catch (error) {
    console.error("Error in process-pdf API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao processar PDF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
