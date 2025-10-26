import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import type { BenefitInfo } from "./rights-specialist"
import type { ChecklistItem } from "../langgraph-config"

export class GuideAgent {
  private model: ChatGoogleGenerativeAI

  constructor(apiKey: string) {
    this.model = new ChatGoogleGenerativeAI({
      model: "gemini-2.0-flash-exp",
      temperature: 0.7,
      apiKey: apiKey,
    })
  }

  async generateDetailedChecklist(benefit: BenefitInfo): Promise<ChecklistItem[]> {
    const prompt = `Você é um especialista em ajudar famílias de crianças autistas no Brasil a acessar benefícios.

Benefício: ${benefit.name}
Tipo: ${benefit.type}
Descrição: ${benefit.description}

Crie um checklist detalhado e prático para solicitar este benefício. O checklist deve conter entre 5 a 12 passos.

Para cada passo, forneça:
1. Título curto e objetivo (ex: "Obter laudo médico")
2. Descrição breve (1 frase)
3. Detalhes completos com instruções práticas (2-3 frases)

Características:
- Seja específico e prático
- Use linguagem clara e acessível
- Inclua prazos e órgãos responsáveis quando relevante
- Seja empático e encorajador
- Organize os passos em ordem lógica de execução

Responda APENAS em formato JSON:
{
  "items": [
    {
      "id": "1",
      "title": "Título do passo",
      "description": "Descrição breve",
      "details": "Detalhes completos"
    }
  ]
}`

    const response = await this.model.invoke([{ role: "user", content: prompt }])
    const content = response.content as string
    
    // Tentar extrair JSON da resposta
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0])
        if (parsed.items && Array.isArray(parsed.items)) {
          return parsed.items.map((item: any, index: number) => ({
            id: item.id || String(index + 1),
            title: item.title || "",
            description: item.description || "",
            details: item.details || "",
            completed: false,
          }))
        }
      } catch (e) {
        console.error("Error parsing checklist JSON:", e)
      }
    }
    
    // Fallback em caso de erro
    return [
      {
        id: "1",
        title: "Consultar informações sobre o benefício",
        description: "Pesquise sobre os requisitos e documentos necessários",
        details: "Acesse o site oficial do órgão responsável pelo benefício para obter informações atualizadas sobre os requisitos e documentos necessários.",
        completed: false,
      },
      {
        id: "2",
        title: "Reunir a documentação necessária",
        description: "Separe todos os documentos solicitados",
        details: "Organize uma pasta com todos os documentos originais e cópias. Verifique se todos os documentos estão dentro da validade.",
        completed: false,
      },
      {
        id: "3",
        title: "Protocolar a solicitação",
        description: "Entregue o pedido no órgão responsável",
        details: "Vá pessoalmente ou entregue online conforme permitido. Peça o número de protocolo e guarde com cuidado.",
        completed: false,
      },
    ]
  }
}
