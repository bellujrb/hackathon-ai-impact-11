import { NextRequest, NextResponse } from "next/server"
import { AmparaOrchestrator } from "@/lib/ampara-orchestrator"
import { GuideAgent } from "@/lib/agents/guide-agent"
import { RightsSpecialistAgent } from "@/lib/agents/rights-specialist"
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import PDFDocument from 'pdfkit'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
  const { message, lastAssistant, previousInteractionType } = await req.json()

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

    // Use LLM to classify intent (report vs checklist vs help) to avoid heuristic conflicts
    let classifiedIntent: { intent: string; benefitType: string | null; benefitName: string | null } | null = null
    try {
      const classifier = new ChatGoogleGenerativeAI({ model: 'gemini-2.0-flash-lite', temperature: 0.0, apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY })
      const classifierPrompt = `Você é um classificador de intenção para o assistente AMPARA.
Receba a seguinte entrada:
Usuária: ${message}
Última mensagem do assistente (se houver): ${lastAssistant || ''}

Classifique a intenção em UMA das opções: report, checklist, help, greeting, other.
Também tente identificar se a mensagem menciona um benefício específico entre: BPC/LOAS, Passe Livre, Isenção de IPVA, Professor de Apoio (AEE), Medicamentos SUS, Terapias SUS.

Retorne APENAS um JSON com as chaves: intent, benefitType, benefitName.
Exemplo:
{"intent":"report","benefitType":"passe-livre","benefitName":"Passe Livre"}

Regras importantes:
- "report": quando o usuário quer que seja gerado um relatório ou laudo
- "checklist": quando o usuário quer orientações passo a passo ou um checklist
- "help": pedido de ajuda em uma etapa específica
- "greeting": mensagens de saudação ou apresentação
- "other": qualquer outra coisa

Se não houver benefício detectável, use null para benefitType e benefitName.
Responda APENAS com o JSON, sem texto adicional.`

      const classifierResp = await classifier.invoke([{ role: 'user', content: classifierPrompt }])
      const classifierContent = classifierResp.content as string
      const jsonMatch = classifierContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        classifiedIntent = {
          intent: parsed.intent || 'other',
          benefitType: parsed.benefitType || null,
          benefitName: parsed.benefitName || null,
        }
      }
    } catch (err) {
      console.error('Intent classifier error:', err)
      classifiedIntent = null
    }

    // If classifier returned a clear intent, handle accordingly and return early to avoid heuristic conflicts
    if (classifiedIntent) {
      const intent = classifiedIntent.intent
      // REPORT flow
      if (intent === 'report') {
        const benefitTypeDetected = classifiedIntent.benefitType
        const rightsAgent = new RightsSpecialistAgent(process.env.NEXT_PUBLIC_GOOGLE_API_KEY)
        const officialWriter = new (await import('@/lib/agents/official-writer')).OfficialWriterAgent(process.env.NEXT_PUBLIC_GOOGLE_API_KEY)

        // If classifier already detected the benefit, generate report immediately
        if (benefitTypeDetected && benefitTypeDetected !== 'outros') {
          const benefits = await rightsAgent.identifyApplicableBenefits({ cid: null, age: null, supportLevel: null, schoolType: 'nao-informado', observations: '' })
          let mappedBenefitId: string = benefitTypeDetected as string
          if (benefitTypeDetected === 'apoio-educacional') mappedBenefitId = 'educacao-inclusiva'
          const benefit = benefits.find(b => b.id === mappedBenefitId) || benefits[0]
          try {
            const doc = await officialWriter.generateOfficialDocument(benefit, { cid: null, age: null, supportLevel: null, schoolType: 'nao-informado', observations: '' } as any, 'letter')
            // gerar PDF e retornar em base64 dentro do JSON para download imediato pelo cliente
            try {
              const pdfUint8 = await generatePdfUint8(doc.title, doc.content)
              const pdfBase64 = Buffer.from(pdfUint8).toString('base64')
              return NextResponse.json({ type: 'report-pdf', response: doc.content, title: doc.title, filename: `${(doc.title || 'relatorio').replace(/[^a-z0-9\-]/gi, '_')}.pdf`, pdfBase64 })
            } catch (pdfErr) {
              console.error('PDF generation error (classifier):', pdfErr)
              return NextResponse.json({ type: 'report-generated', response: doc.content, title: doc.title })
            }
          } catch (err) {
            console.error('Error generating report (classifier):', err)
            return NextResponse.json({ type: 'report-generated', response: 'Desculpe, não foi possível gerar o relatório no momento.' })
          }
        }

        // Otherwise ask for the report subject
        return NextResponse.json({ type: 'ask-report-target', response: 'Entendi. Sobre qual assunto/benefício você quer que eu gere o relatório? (ex: conseguir um professor de apoio)' })
      }

      // CHECKLIST flow
      if (intent === 'checklist') {
        const { benefitType, benefitName } = detectBenefitType(message)
        const rightsAgent = new RightsSpecialistAgent(process.env.NEXT_PUBLIC_GOOGLE_API_KEY)
        const guideAgent = new GuideAgent(process.env.NEXT_PUBLIC_GOOGLE_API_KEY)
        const benefits = await rightsAgent.identifyApplicableBenefits({ cid: null, age: null, supportLevel: null, schoolType: 'nao-informado', observations: '' })
        let mappedBenefitId: string = benefitType
        if (benefitType === 'apoio-educacional') mappedBenefitId = 'educacao-inclusiva'
        const benefit = benefits.find(b => b.id === mappedBenefitId) || benefits[0]
        const checklist = await guideAgent.generateDetailedChecklist(benefit)
        return NextResponse.json({ type: 'benefit-question', response: `Olá! Vou te ajudar com o ${benefitName}. Criei um checklist completo e detalhado com ${checklist.length} etapas para você acompanhar todo o processo passo a passo. Você consegue! 💙`, checklist: { items: checklist }, benefitType, benefitName })
      }

      // HELP flow
      if (intent === 'help') {
        try {
          const model = new ChatGoogleGenerativeAI({ model: 'gemini-2.0-flash-lite', temperature: 0.0, apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY })
          const prompt = `Você é o AMPARA, um assistente especializado em ajudar mães de crianças autistas no Brasil a acessar benefícios. A usuária precisa de ajuda com uma etapa específica: "${message}" Forneça orientações práticas, específicas e empáticas (máximo 200 palavras) sobre: 1. O que fazer nesta etapa específica 2. Documentos ou requisitos necessários 3. Dicas e onde buscar mais informações 4. Seja encorajadora e detalhada Responda APENAS o texto da mensagem, sem formatação adicional.`
          const response = await model.invoke([{ role: 'user', content: prompt }])
          return NextResponse.json({ type: 'help-response', response: response.content as string })
        } catch (error) {
          console.error('Error generating help response (classifier):', error)
          return NextResponse.json({ type: 'help-response', response: 'Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente.' })
        }
      }

      // GREETING flow
      if (intent === 'greeting') {
        return NextResponse.json({ type: 'greeting', response: 'Olá! 😊 Sou o AMPARA, assistente especializado em ajudar mães de crianças autistas a acessar benefícios e direitos no Brasil. Posso te ajudar com BPC/LOAS, Passe Livre, Isenção de IPVA, Professor de Apoio e muito mais! Como posso te ajudar hoje? 💙' })
      }

      // fallthrough to default handling
    }

    // Detect explicit request to GENERATE a report (multi-step flow)
    // Use a compact substring match to handle accents and multiple phrasings.
    const isGenerateReportIntent =
      messageLower.includes("relat") || // matches 'relatório' or 'relatorio' or similar
      messageLower.includes("laudo") ||
      messageLower.includes("gerar rel") ||
      messageLower.includes("gere rel") ||
      messageLower.includes("gere um laudo") ||
      messageLower.includes("gerar laudo")

    const isReportRequest =
      messageLower.includes("laudo") ||
      messageLower.includes("diagnóstico") ||
      messageLower.includes("cid") ||
      messageLower.includes("tea")

  // If the message clearly asks for a report AND names a benefit, generate immediately.
  const directDetect = detectBenefitType(message)
  // Also treat short replies like "sobre passe livre" as report-target answers when benefit is detected.
  const isShortReportAnswer = messageLower.startsWith('sobre ') && directDetect.benefitType !== 'outros'

    // If client explicitly requested force-report, generate when benefit detected
    if (previousInteractionType === 'force-report' && directDetect.benefitType !== 'outros') {
    try {
      const rightsAgent = new RightsSpecialistAgent(process.env.NEXT_PUBLIC_GOOGLE_API_KEY)
      const officialWriter = new (await import('@/lib/agents/official-writer')).OfficialWriterAgent(process.env.NEXT_PUBLIC_GOOGLE_API_KEY)

      const benefits = await rightsAgent.identifyApplicableBenefits({
        cid: null,
        age: null,
        supportLevel: null,
        schoolType: 'nao-informado',
        observations: '',
      })

      let mappedBenefitId: string = directDetect.benefitType
      if (directDetect.benefitType === 'apoio-educacional') mappedBenefitId = 'educacao-inclusiva'
      const benefit = benefits.find(b => b.id === mappedBenefitId) || benefits[0]

      const doc = await officialWriter.generateOfficialDocument(benefit, { cid: null, age: null, supportLevel: null, schoolType: 'nao-informado', observations: '' } as any, 'letter')

      try {
  const pdfUint8 = await generatePdfUint8(doc.title, doc.content)
  const pdfBase64 = Buffer.from(pdfUint8).toString('base64')
  return NextResponse.json({ type: 'report-pdf', response: doc.content, title: doc.title, filename: `${(doc.title || 'relatorio').replace(/[^a-z0-9\-]/gi, '_')}.pdf`, pdfBase64 })
      } catch (pdfErr) {
        console.error('PDF generation error (force):', pdfErr)
        return NextResponse.json({ type: 'report-generated', response: doc.content, title: doc.title })
      }
    } catch (err) {
      console.error('Error generating report (force):', err)
      return NextResponse.json({ type: 'report-generated', response: 'Desculpe, não foi possível gerar o relatório no momento.' })
    }
    }

  if (((messageLower.includes('relat') || messageLower.includes('relatorio') || messageLower.includes('laudo')) && directDetect.benefitType !== 'outros') || isShortReportAnswer) {
      try {
        const rightsAgent = new RightsSpecialistAgent(process.env.NEXT_PUBLIC_GOOGLE_API_KEY)
        const officialWriter = new (await import('@/lib/agents/official-writer')).OfficialWriterAgent(process.env.NEXT_PUBLIC_GOOGLE_API_KEY)

        const benefits = await rightsAgent.identifyApplicableBenefits({
          cid: null,
          age: null,
          supportLevel: null,
          schoolType: 'nao-informado',
          observations: '',
        })

        let mappedBenefitId: string = directDetect.benefitType
        if (directDetect.benefitType === 'apoio-educacional') mappedBenefitId = 'educacao-inclusiva'
        const benefit = benefits.find(b => b.id === mappedBenefitId) || benefits[0]

        const doc = await officialWriter.generateOfficialDocument(benefit, { cid: null, age: null, supportLevel: null, schoolType: 'nao-informado', observations: '' } as any, 'letter')

        return NextResponse.json({
          type: 'report-generated',
          response: doc.content,
          title: doc.title,
        })
      } catch (err) {
        console.error('Error generating report (direct):', err)
        return NextResponse.json({ type: 'report-generated', response: 'Desculpe, não foi possível gerar o relatório no momento.' })
      }
    }

  // If the previous assistant message asked for a subject/benefit for the report,
  // treat the current message as the report target and generate the report.
  // Prefer an explicit flag from the client (previousInteractionType) when available.
  const lastAssistantLower = typeof lastAssistant === 'string' ? lastAssistant.toLowerCase() : ''
    // Match several ways the assistant may ask for the report subject (with/without accents)
    const assistantAskedReportTargetText =
      lastAssistantLower.includes('sobre qual assunto') ||
      lastAssistantLower.includes('sobre qual benefício') ||
      lastAssistantLower.includes('sobre o que') ||
      lastAssistantLower.includes('sobre qual assunto/benefício') ||
      lastAssistantLower.includes('o que voce gostaria') ||
      lastAssistantLower.includes('o que você gostaria') ||
      lastAssistantLower.includes('o que deseja que') ||
      lastAssistantLower.includes('o que gostaria que constasse') ||
      lastAssistantLower.includes('qual assunto') ||
      lastAssistantLower.includes('qual beneficio') ||
      // without accents
      lastAssistantLower.includes('o que voce gostaria') ||
      lastAssistantLower.includes('o que deseja que') ||
      lastAssistantLower.includes('o que gostaria que constasse')
  const assistantAskedReportTarget = (typeof previousInteractionType === 'string' && previousInteractionType === 'ask-report-target') || assistantAskedReportTargetText

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
    }

    // If user explicitly asked to generate a report (initial intent), ask for the target
    if (isGenerateReportIntent) {
      // If the same message already contains a clear benefit target, generate immediately
      const { benefitType: directBenefitType, benefitName: directBenefitName } = detectBenefitType(message)
      if (directBenefitType !== 'outros') {
        // Generate report directly
        const rightsAgent = new RightsSpecialistAgent(process.env.NEXT_PUBLIC_GOOGLE_API_KEY)
        const officialWriter = new (await import('@/lib/agents/official-writer')).OfficialWriterAgent(process.env.NEXT_PUBLIC_GOOGLE_API_KEY)

        const benefits = await rightsAgent.identifyApplicableBenefits({
          cid: null,
          age: null,
          supportLevel: null,
          schoolType: 'nao-informado',
          observations: '',
        })

        let mappedBenefitId: string = directBenefitType
        if (directBenefitType === 'apoio-educacional') mappedBenefitId = 'educacao-inclusiva'
        const benefit = benefits.find(b => b.id === mappedBenefitId) || benefits[0]

        try {
          const doc = await officialWriter.generateOfficialDocument(benefit, { cid: null, age: null, supportLevel: null, schoolType: 'nao-informado', observations: '' } as any, 'letter')

          return NextResponse.json({
            type: 'report-generated',
            response: doc.content,
            title: doc.title,
          })
        } catch (err) {
          console.error('Error generating report:', err)
          return NextResponse.json({ type: 'report-generated', response: 'Desculpe, não foi possível gerar o relatório no momento.' })
        }
      }

      return NextResponse.json({
        type: 'ask-report-target',
        response: 'Entendi. Sobre qual assunto/benefício você quer que eu gere o relatório? (ex: conseguir um professor de apoio)'
      })
    }

    // If assistant previously asked for the report target, now the user answered — generate the report
    if (assistantAskedReportTarget) {
      // Determine benefit type from the user's answer
      const { benefitType, benefitName } = detectBenefitType(message)

      // Create agents
      const rightsAgent = new RightsSpecialistAgent(process.env.NEXT_PUBLIC_GOOGLE_API_KEY)
      const officialWriter = new (await import('@/lib/agents/official-writer')).OfficialWriterAgent(process.env.NEXT_PUBLIC_GOOGLE_API_KEY)

      // Fetch available benefits and pick the matching one
      const benefits = await rightsAgent.identifyApplicableBenefits({
        cid: null,
        age: null,
        supportLevel: null,
        schoolType: 'nao-informado',
        observations: '',
      })

      let mappedBenefitId: string = benefitType
      if (benefitType === 'apoio-educacional') mappedBenefitId = 'educacao-inclusiva'
      const benefit = benefits.find(b => b.id === mappedBenefitId) || benefits[0]

      try {
        const doc = await officialWriter.generateOfficialDocument(benefit, { cid: null, age: null, supportLevel: null, schoolType: 'nao-informado', observations: '' } as any, 'letter')

        return NextResponse.json({
          type: 'report-generated',
          response: doc.content,
          title: doc.title,
        })
      } catch (err) {
        console.error('Error generating report:', err)
        return NextResponse.json({ type: 'report-generated', response: 'Desculpe, não foi possível gerar o relatório no momento.' })
      }
    }

    else {
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

// Helper: generate a PDF from title/content and return as Uint8Array
async function generatePdfUint8(title: string | undefined, content: string): Promise<Uint8Array> {
  const doc = new PDFDocument({ size: 'A4', margin: 50 })

  const chunks: Uint8Array[] = []
  doc.on('data', (chunk: Uint8Array) => chunks.push(chunk))

  const endPromise = new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks.map((c) => Buffer.from(c)))))
    doc.on('error', (err: any) => reject(err))
  })

  // Header
  doc.fontSize(14).font('Helvetica-Bold')
  if (title) {
    doc.text(title, { align: 'center' })
    doc.moveDown()
  }

  // Divider
  try {
    doc.moveTo(doc.x, doc.y).lineTo(doc.page.width - (doc as any).options.margin, doc.y).strokeOpacity(0.1).stroke()
  } catch (_) {
    // stroke may fail in some runtimes; ignore to avoid crashing
  }

  doc.moveDown()

  // Body
  doc.fontSize(11).font('Helvetica')

  if (typeof content === 'string') {
    const paragraphs = content.split('\n\n')
    paragraphs.forEach((p: string) => {
      doc.text(p.trim(), {
        align: 'left',
        lineGap: 4,
      })
      doc.moveDown(0.5)
    })
  }

  // Footer note
  doc.moveDown()
  doc.fontSize(9).fillColor('gray')
  doc.text('Este documento foi gerado pela plataforma AMPARA. Deve ser revisado e assinado por um profissional habilitado para ter validade legal.', {
    align: 'left',
  })

  doc.end()

  const pdfBuffer = await endPromise
  return Uint8Array.from(pdfBuffer)
}

