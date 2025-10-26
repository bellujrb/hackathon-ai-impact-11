import { NextRequest, NextResponse } from "next/server"
import { processBenefitMessage } from "@/lib/benefit-agent"

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json()

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Processar mensagem com multi-agentes
    const result = await processBenefitMessage(message)

    return NextResponse.json({
      response: result.response,
      checklist: result.checklist,
      benefitType: result.benefitType,
      benefitName: result.benefitName,
    })
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json(
      { error: "Failed to process message", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

