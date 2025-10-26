import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

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

    const apiKey = process.env.GEMINI_API_KEY
    
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Gemini API key não configurada" },
        { status: 503 }
      )
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      systemInstruction: `Você é o Theo, um assistente virtual amigável e empático que ajuda mães de crianças atípicas (autistas, com síndrome de Down, etc.) a entender e acessar direitos governamentais no Brasil.

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
- Se vir documentos, leia informações visíveis
- Se vir pessoas (mães ou crianças), comente de forma empática
- Use o contexto visual ATUAL para dar respostas precisas

Como usar a visão:
1. Descreva brevemente o que você vê (ex: "Vejo que você está mostrando um documento...")
2. Identifique informações relevantes (nomes, datas, carimbos)
3. Valide se documentos estão corretos ou completos
4. Dê orientações baseadas no que VÊ no momento

Benefícios que você conhece:
- BPC/LOAS: Benefício de Prestação Continuada
- Passe Livre: Transporte gratuito
- Isenção de IPVA: Carros adaptados
- Educação Inclusiva: AEE, Sala de Recursos
- Prioridade em filas e atendimentos`,
    })

    // Preparar conteúdo multimodal
    const parts: any[] = []
    
    // Adicionar imagens se houver
    if (images && Array.isArray(images) && images.length > 0) {
      for (const imageData of images) {
        // Remover prefixo data:image/jpeg;base64, se houver
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "")
        
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType: "image/jpeg",
          },
        })
      }
      
      // Adicionar contexto sobre as imagens
      parts.push({
        text: `[VISÃO EM TEMPO REAL: Você está vendo ${images.length} frames capturados nos últimos 2 segundos da câmera. Analise CUIDADOSAMENTE o que a pessoa está mostrando AGORA e use essa informação visual para dar uma resposta precisa e contextualizada.]`,
      })
    }
    
    // Adicionar texto do usuário
    parts.push({ text })

    // Gerar resposta
    const result = await model.generateContent(parts)
    const response = result.response.text()

    return NextResponse.json({
      success: true,
      response,
    })
    
  } catch (error) {
    console.error("Erro no Gemini Multimodal:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao processar com Gemini",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

