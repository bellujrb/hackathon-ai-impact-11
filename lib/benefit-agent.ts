import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { createChecklistTool, type BenefitChecklist } from "./langgraph-config"

// Detectar tipo de benefício
export async function detectBenefitType(question: string): Promise<{
  benefitType: "bpc" | "passe-livre" | "isencao-ipva" | "apoio-educacional" | "outros"
  benefitName: string
}> {
  const questionLower = question.toLowerCase()

  if (questionLower.includes("bpc") || questionLower.includes("loas")) {
    return { benefitType: "bpc", benefitName: "BPC/LOAS" }
  } else if (questionLower.includes("passe") || questionLower.includes("transporte") || questionLower.includes("busão")) {
    return { benefitType: "passe-livre", benefitName: "Passe Livre" }
  } else if (questionLower.includes("ipva") || questionLower.includes("isenção") || questionLower.includes("isencao")) {
    return { benefitType: "isencao-ipva", benefitName: "Isenção de IPVA" }
  } else if (questionLower.includes("cartão") || questionLower.includes("cartao") || questionLower.includes("estacionamento")) {
    return { benefitType: "outros", benefitName: "Cartão de Estacionamento" }
  } else if (
    questionLower.includes("professor") || 
    questionLower.includes("particular") || 
    questionLower.includes("educação especial") ||
    questionLower.includes("educacao especial") ||
    questionLower.includes("atendimento educacional")
  ) {
    return { benefitType: "apoio-educacional", benefitName: "Apoio Educacional Especializado" }
  } else if (questionLower.includes("medicamento") || questionLower.includes("remédio") || questionLower.includes("remedio")) {
    return { benefitType: "outros", benefitName: "Medicamentos Gratuitos" }
  } else if (questionLower.includes("terapia") || questionLower.includes("fono") || questionLower.includes("to")) {
    return { benefitType: "outros", benefitName: "Atendimento Terapêutico" }
  }

  return { benefitType: "outros", benefitName: "Benefício" }
}

// Gerar checklist usando a tool
export async function generateBenefitChecklist(
  benefitName: string,
  question: string,
  benefitType: "bpc" | "passe-livre" | "isencao-ipva" | "apoio-educacional" | "outros"
): Promise<BenefitChecklist> {
  return await createChecklistTool.invoke({
    benefitName,
    question,
    benefitType,
  })
}

// Verificar se precisa de checklist personalizado gerado pelo Gemini
async function shouldGenerateCustomChecklist(benefitName: string, question: string): Promise<boolean> {
  const lowerName = benefitName.toLowerCase()
  const lowerQuestion = question.toLowerCase()
  
  // Casos específicos que precisam de orientação personalizada
  const customCases = [
    "apoio educacional",
    "professor",
    "particular",
    "educação especial",
    "educacao especial",
    "terapia",
    "medicamento",
    "medicamentos gratuitos",
    "educação",
    "apoio",
  ]
  
  return customCases.some(caseWord => 
    lowerName.includes(caseWord) || lowerQuestion.includes(caseWord)
  )
}

// Gerar resposta personalizada com Gemini
export async function generateResponse(
  question: string,
  benefitName: string,
  checklist: BenefitChecklist
): Promise<string> {
  if (!process.env.NEXT_PUBLIC_GOOGLE_API_KEY) {
    return defaultResponse(benefitName, checklist)
  }

  try {
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-2.0-flash-lite",
      temperature: 0.7,
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
    })

    const prompt = `Você é uma assistente virtual especializada em ajudar famílias de crianças autistas a acessar benefícios no Brasil. Você é carinhosa, paciente e encorajadora.

Contexto:
- Benefício: ${benefitName}
- Pergunta do usuário: "${question}"
- Checklist criado com ${checklist.items.length} etapas detalhadas

Crie uma resposta personalizada, acolhedora e encorajadora (máximo 150 palavras) que:
1. Confirma que entende a necessidade
2. Informa que criou um checklist detalhado com ${checklist.items.length} etapas
3. Encoraje a família
4. Use tom positivo e acolhedor

Use emojis discreto (💙, 📋, ✨).`

      // Se for um caso especial, pedir orientação mais específica
    const isCustom = await shouldGenerateCustomChecklist(benefitName, question)
    
    let finalPrompt = prompt
    if (isCustom) {
      finalPrompt = `Você é uma assistente virtual especializada em ajudar famílias de crianças autistas no Brasil.

A usuária perguntou: "${question}"

Crie uma resposta acolhedora (máximo 200 palavras) que:
1. Confirma que entende a necessidade
2. Oferece orientações práticas sobre recursos disponíveis (SUS, CRAS, organizações)
3. Sugere alternativas e caminhos possíveis
4. Mantém tom positivo e encorajador

Se for sobre educação especial, mencione possíveis apoios do governo, se for sobre saúde, mencione SUS e serviços especializados, se for sobre apoio social, mencione CRAS e programas locais.

Use emojis discretos (💙, 📋, ✨).`
    }

    const messages = [{ role: "user", content: finalPrompt }]
    const response = await model.invoke(messages)

    return response.content as string
  } catch (error) {
    console.error("Error calling Gemini:", error)
    return defaultResponse(benefitName, checklist)
  }
}

function defaultResponse(benefitName: string, checklist: BenefitChecklist): string {
  return `Olá! Vou te ajudar com o ${benefitName}. 

Criei um checklist completo e detalhado com ${checklist.items.length} etapas para você acompanhar todo o processo passo a passo. Cada item tem instruções detalhadas sobre o que fazer.

Não tenha pressa, faça uma etapa por vez. Você consegue! 💙`
}

// Função principal para processar mensagem
export async function processBenefitMessage(
  message: string
): Promise<{
  response: string
  checklist: BenefitChecklist
  benefitType: "bpc" | "passe-livre" | "isencao-ipva" | "apoio-educacional" | "outros"
  benefitName: string
}> {
  // 1. Detectar tipo de benefício
  const { benefitType, benefitName } = await detectBenefitType(message)

  // 2. Gerar checklist
  const checklist = await generateBenefitChecklist(benefitName, message, benefitType)

  // 3. Gerar resposta personalizada
  const response = await generateResponse(message, benefitName, checklist)

  return {
    response,
    checklist,
    benefitType,
    benefitName,
  }
}

