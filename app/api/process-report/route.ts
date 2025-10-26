import { NextRequest, NextResponse } from "next/server"
import { AmparaOrchestrator } from "@/lib/ampara-orchestrator"

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const { reportText } = await req.json()

    if (!reportText || typeof reportText !== "string") {
      return NextResponse.json({ error: "Report text is required" }, { status: 400 })
    }

    if (!process.env.NEXT_PUBLIC_GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: "Google API key not configured" },
        { status: 500 }
      )
    }

    // Inicializar orquestrador
    const orchestrator = new AmparaOrchestrator(process.env.NEXT_PUBLIC_GOOGLE_API_KEY)

    // Processar laudo
    const result = await orchestrator.processReport(reportText)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("Error processing report:", error)
    return NextResponse.json(
      {
        error: "Failed to process report",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
