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
- Pode ver imagens e vídeo da câmera do usuário

Quando receber imagens da câmera:
- Observe se há documentos sendo mostrados
- Identifique se há crianças ou pessoas
- Comente sobre o que vê de forma natural
- Use o contexto visual para dar respostas mais precisas

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
        text: `[Você está vendo ${images.length} frame(s) da câmera da pessoa. Considere o que vê na imagem para dar uma resposta mais precisa.]`,
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

