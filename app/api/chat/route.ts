import { NextRequest, NextResponse } from "next/server"
import { AmparaOrchestrator } from "@/lib/ampara-orchestrator"
import { GuideAgent } from "@/lib/agents/guide-agent"
import { RightsSpecialistAgent } from "@/lib/agents/rights-specialist"
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json()

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    if (!process.env.NEXT_PUBLIC_GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: "Google API key not configured" },
        { status: 500 }
      )
    }

    // Verificar se é uma mensagem de laudo ou pergunta sobre benefício
          const messageLower = message.toLowerCase()
      const isReportRequest =
        messageLower.includes("laudo") ||
        messageLower.includes("diagnóstico") ||
        messageLower.includes("cid") ||
        messageLower.includes("tea")

      // Se a mensagem contém "preciso de ajuda" ou é uma pergunta sobre uma etapa específica,
      // não deve criar um novo checklist
      const isHelpRequest = messageLower.includes("preciso de ajuda") || 
                           messageLower.includes("como posso proceder")

      if (isReportRequest && message.length > 200 && !isHelpRequest) {
      // Processar como laudo completo
      const orchestrator = new AmparaOrchestrator(process.env.NEXT_PUBLIC_GOOGLE_API_KEY)
      const result = await orchestrator.processReport(message)
      
      return NextResponse.json({
        type: "full-report",
        data: result,
      })
    } else {
      // Se for uma solicitação de ajuda (não criar novo checklist)
      const messageLower = message.toLowerCase()
      const isHelpRequest = messageLower.includes("preciso de ajuda")
      
      if (isHelpRequest) {
        // Gerar resposta de ajuda com IA sem criar checklist
        try {
          const model = new ChatGoogleGenerativeAI({
            model: "gemini-2.0-flash-lite",
            temperature: 0.7,
            apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
          })
          
          const prompt = `Você é o AMPARA, um assistente especializado em ajudar mães de crianças autistas no Brasil a acessar benefícios.

A usuária precisa de ajuda com uma etapa específica: "${message}"

Forneça orientações práticas, específicas e empáticas (máximo 200 palavras) sobre:
1. O que fazer nesta etapa específica
2. Documentos ou requisitos necessários
3. Dicas e onde buscar mais informações
4. Seja encorajadora e detalhada

Responda APENAS o texto da mensagem, sem formatação adicional.`

          const response = await model.invoke([{ role: "user", content: prompt }])
          
          return NextResponse.json({
            type: "help-response",
            response: response.content as string,
          })
        } catch (error) {
          console.error("Error generating help response:", error)
          return NextResponse.json({
            type: "help-response",
            response: "Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente.",
          })
        }
      }
      
      // Processar como pergunta sobre benefício específico
      const { benefitType, benefitName } = detectBenefitType(message)
      
      // Se não detectou benefício específico, gerar resposta com IA
      if (benefitType === "outros") {
        try {
          const model = new ChatGoogleGenerativeAI({
            model: "gemini-2.0-flash-lite",
            temperature: 0.7,
            apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
          })
          
          const prompt = `Você é o AMPARA, um assistente especializado em ajudar mães de crianças autistas no Brasil.

A usuária disse: "${message}"

Crie uma resposta acolhedora (máximo 150 palavras) que:
1. Se cumprimenta, seja calorosa
2. Se perguntar algo, responda de forma útil e empática
3. Se for mensagem genérica ("oi", "olá"), apresente o AMPARA e os benefícios disponíveis
4. Use tom carinhoso, empático e encorajador
5. Use emojis discretos (💙, 😊, 📋)

Benefícios disponíveis: BPC/LOAS, Passe Livre, Isenção de IPVA, Professor de Apoio, Medicamentos SUS, Terapias SUS, etc.

Responda APENAS o texto da mensagem, sem formatação adicional.`

          const response = await model.invoke([{ role: "user", content: prompt }])
          
          return NextResponse.json({
            type: "greeting",
            response: response.content as string,
          })
        } catch (error) {
          // Fallback em caso de erro
          return NextResponse.json({
            type: "greeting",
            response: "Olá! 😊 Sou o AMPARA, assistente especializado em ajudar mães de crianças autistas a acessar benefícios e direitos no Brasil.\n\nPosso te ajudar com BPC/LOAS, Passe Livre, Isenção de IPVA, Professor de Apoio e muito mais!\n\nComo posso te ajudar hoje? 💙",
          })
        }
      }
      
      // Criar agentes para gerar checklist com IA
      const rightsAgent = new RightsSpecialistAgent(process.env.NEXT_PUBLIC_GOOGLE_API_KEY)
      const guideAgent = new GuideAgent(process.env.NEXT_PUBLIC_GOOGLE_API_KEY)
      
      // Buscar o benefício completo
      const benefits = await rightsAgent.identifyApplicableBenefits({
        cid: null,
        age: null,
        supportLevel: null,
        schoolType: "nao-informado",
        observations: "",
      })
      
      // Mapear tipo detectado para o ID correto do benefício
      let mappedBenefitId: string = benefitType
      if (benefitType === "apoio-educacional") {
        mappedBenefitId = "educacao-inclusiva"
      }
      
      const benefit = benefits.find(b => b.id === mappedBenefitId) || benefits.find(b => b.id === benefitType) || benefits[0]
      
      // Gerar checklist com IA
      const checklist = await guideAgent.generateDetailedChecklist(benefit)

      return NextResponse.json({
        type: "benefit-question",
        response: `Olá! Vou te ajudar com o ${benefitName}. Criei um checklist completo e detalhado com ${checklist.length} etapas para você acompanhar todo o processo passo a passo. Você consegue! 💙`,
        checklist: {
          items: checklist,
        },
        benefitType,
        benefitName,
      })
    }
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json(
      { error: "Failed to process message", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

function detectBenefitType(message: string): {
  benefitType: "bpc" | "passe-livre" | "isencao-ipva" | "apoio-educacional" | "outros"
  benefitName: string
} {
  const lower = message.toLowerCase()

  if (lower.includes("bpc") || lower.includes("loas")) {
    return { benefitType: "bpc", benefitName: "BPC/LOAS" }
  } else if (lower.includes("passe") || lower.includes("transporte") || lower.includes("busão")) {
    return { benefitType: "passe-livre", benefitName: "Passe Livre" }
  } else if (lower.includes("ipva") || lower.includes("isenção") || lower.includes("isencao")) {
    return { benefitType: "isencao-ipva", benefitName: "Isenção de IPVA" }
  } else if (
    lower.includes("professor") || 
    lower.includes("particular") || 
    lower.includes("educação especial") ||
    lower.includes("educacao especial") ||
    lower.includes("atendimento educacional") ||
    lower.includes("apoio educacional")
  ) {
    return { benefitType: "apoio-educacional", benefitName: "Professor de Apoio (AEE)" }
  }

  return { benefitType: "outros", benefitName: "Benefício" }
}

