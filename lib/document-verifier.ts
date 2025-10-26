import { ChatGoogleGenerativeAI } from "@langchain/google-genai"

export interface DocumentValidationResult {
  isValid: boolean
  missingItems: string[]
  suggestions: string[]
  extractedText: string
  analysis: string
}

export interface DocumentContext {
  benefitType: string
  documentType: string
  expectedItems: string
}

export class DocumentVerifier {
  private model: ChatGoogleGenerativeAI

  constructor(apiKey: string) {
    this.model = new ChatGoogleGenerativeAI({
      model: "gemini-2.0-flash-exp",
      temperature: 0.3,
      apiKey: apiKey,
    })
  }

  async validateDocument(extractedText: string, context: DocumentContext): Promise<DocumentValidationResult> {
    const prompt = `Você é um especialista em verificação de documentos para benefícios sociais de crianças autistas no Brasil.

**Contexto:**
- Tipo de benefício: ${context.benefitType}
- Tipo de documento: ${context.documentType}
- Itens esperados: ${context.expectedItems}

**Texto extraído do documento:**
${extractedText}

Analise o documento e responda APENAS em formato JSON:

{
  "isValid": true ou false,
  "missingItems": ["item que está faltando 1", "item que está faltando 2"],
  "suggestions": ["sugestão 1", "sugestão 2"],
  "analysis": "análise detalhada do documento em português, explicando o que está correto e o que pode estar faltando"
}

IMPORTANTE:
- Seja rigoroso na verificação
- Identifique informações faltantes, incompletas ou ilegíveis
- Forneça sugestões práticas e acionáveis
- Seja empático e claro na análise`

    try {
      const response = await this.model.invoke([{ role: "user", content: prompt }])
      const content = response.content as string

      // Tentar extrair JSON da resposta
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          isValid: parsed.isValid || false,
          missingItems: parsed.missingItems || [],
          suggestions: parsed.suggestions || [],
          extractedText,
          analysis: parsed.analysis || "Não foi possível analisar o documento.",
        }
      }

      // Fallback em caso de erro no parsing
      return {
        isValid: false,
        missingItems: ["Não foi possível validar o documento"],
        suggestions: ["Verifique se o documento está legível e completo"],
        extractedText,
        analysis: "Erro ao processar o documento. Tente novamente ou verifique se o arquivo está no formato correto.",
      }
    } catch (error) {
      console.error("Error validating document:", error)
      return {
        isValid: false,
        missingItems: ["Erro ao processar documento"],
        suggestions: ["Tente fazer upload novamente ou verifique se o arquivo está no formato correto"],
        extractedText,
        analysis: "Ocorreu um erro ao analisar o documento. Por favor, tente novamente.",
      }
    }
  }
}
