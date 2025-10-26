import { NextRequest, NextResponse } from "next/server"
import { DocumentVerifier } from "@/lib/document-verifier"

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { text, benefitType, documentType, expectedItems } = body

    if (!text) {
      return NextResponse.json(
        { success: false, error: "Texto do documento não fornecido" },
        { status: 400 }
      )
    }

    if (!process.env.NEXT_PUBLIC_GOOGLE_API_KEY) {
      return NextResponse.json(
        { success: false, error: "API key não configurada" },
        { status: 500 }
      )
    }

    const verifier = new DocumentVerifier(process.env.NEXT_PUBLIC_GOOGLE_API_KEY)
    
    const result = await verifier.validateDocument(text, {
      benefitType: benefitType || "Benefício não especificado",
      documentType: documentType || "Documento",
      expectedItems: expectedItems || "Itens necessários não especificados",
    })

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("Error in verify-document API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao verificar documento",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
