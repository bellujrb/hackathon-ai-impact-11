import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const { text, images } = await req.json()
    
    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { success: false, error: "Texto não fornecido" },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENAI_API_KEY
    
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "OpenAI API key não configurada" },
        { status: 503 }
      )
    }

    const openai = new OpenAI({ apiKey })

    // Preparar conteúdo multimodal
    const content: any[] = []
    
    // Adicionar imagens se houver (visão em tempo real)
    if (images && Array.isArray(images) && images.length > 0) {
      // Adicionar contexto sobre as imagens
      content.push({
        type: "text",
        text: `[VISÃO EM TEMPO REAL: Você está vendo ${images.length} frames capturados nos últimos 2-3 segundos da câmera. Analise CUIDADOSAMENTE o que a pessoa está mostrando AGORA e use essa informação visual para dar uma resposta precisa e contextualizada.]`,
      })
      
      // Adicionar cada frame de vídeo
      for (const imageData of images) {
        // Garantir que tem o prefixo correto
        const base64Data = imageData.startsWith('data:image')
          ? imageData
          : `data:image/jpeg;base64,${imageData}`
        
        content.push({
          type: "image_url",
          image_url: {
            url: base64Data,
            detail: "high", // Alta resolução para ler documentos
          },
        })
      }
    }
    
    // Adicionar pergunta do usuário
    content.push({
      type: "text",
      text: text,
    })

    // Chamar OpenAI GPT-4o com visão
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // GPT-4o tem melhor visão que gpt-4-vision-preview
      messages: [
        {
          role: "system",
          content: `Você é o Theo, um assistente virtual amigável e empático que ajuda mães de crianças atípicas (autistas, com síndrome de Down, etc.) a entender e acessar direitos governamentais no Brasil.

Características do Theo:
- Caloroso, paciente e acolhedor
- Usa linguagem simples e clara
- Empático com as dificuldades das mães
- Conhece bem os direitos e benefícios disponíveis
- Tem visão em TEMPO REAL da câmera do usuário

CONTEXTO VISUAL EM TEMPO REAL:
- Você recebe frames de vídeo capturados nos últimos 2-3 segundos
- As imagens mostram o que a pessoa está mostrando AGORA
- Observe documentos, objetos, gestos, expressões faciais
- Se vir documentos, leia informações visíveis (nomes, datas, carimbos)
- Se vir pessoas (mães ou crianças), comente de forma empática
- Use o contexto visual ATUAL para dar respostas precisas

Como usar a visão:
1. Descreva brevemente o que você vê (ex: "Vejo que você está mostrando um laudo médico...")
2. Identifique informações relevantes que consiga ler
3. Valide se documentos estão corretos ou completos
4. Dê orientações baseadas no que VÊ no momento
5. Se não conseguir ler algo, peça que aproxime ou melhore o ângulo

Benefícios que você conhece:
- BPC/LOAS: Benefício de Prestação Continuada (1 salário mínimo/mês)
- Passe Livre: Transporte interestadual gratuito
- Isenção de IPVA: Para carros adaptados
- Isenção de IPI/IOF: Na compra de veículos
- Educação Inclusiva: AEE, Sala de Recursos, Cuidador
- Prioridade em filas e atendimentos
- Meia-entrada em eventos culturais

IMPORTANTE: Seja ESPECÍFICO ao analisar documentos. Se conseguir ler informações, mencione-as.`,
        },
        {
          role: "user",
          content: content,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    })

    const response = completion.choices[0]?.message?.content || ""

    if (!response) {
      throw new Error("OpenAI não retornou resposta")
    }

    return NextResponse.json({
      success: true,
      response,
    })
    
  } catch (error) {
    console.error("Erro no OpenAI Multimodal:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao processar com OpenAI",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

