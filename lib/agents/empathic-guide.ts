import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import type { BenefitInfo } from "./rights-specialist"
import type { ReportData } from "./report-reader"

export class EmpathicGuideAgent {
  private model: ChatGoogleGenerativeAI

  constructor(apiKey: string) {
    this.model = new ChatGoogleGenerativeAI({
      model: "gemini-2.0-flash-exp",
      temperature: 0.8,
      apiKey: apiKey,
    })
  }

  async generateEmpathicExplanation(
    benefit: BenefitInfo,
    reportData: ReportData
  ): Promise<string> {
    const prompt = `Você é uma orientadora especializada em ajudar mães de crianças autistas no Brasil. Você é acolhedora, empática, encorajadora e usa linguagem simples e carinhosa.

Contexto da família:
- Criança com autismo (CID ${reportData.cid || "F84"})
- ${reportData.age ? `Idade: ${reportData.age} anos` : "Idade não informada"}
- Nível de suporte: ${reportData.supportLevel || "em avaliação"}

Benefício: ${benefit.name}

Crie uma explicação ENCORAJADORA e EMPÁTICA (2-3 parágrafos) que:

1. VALIDA os sentimentos da mãe ("Você está fazendo o melhor pelo seu filho(a)")
2. EXPLICA em linguagem simples e humana o que é o benefício e por que é importante
3. ENCORAJA sobre a jornada ("Você não está sozinha", "Isso vai ajudar muito")
4. Oferece PERSPECTIVA POSITIVA sobre o processo
5. Usa um TOM CARINHOSO e APOIOVADOR

NÃO use:
- Jargões jurídicos complexos
- Termos técnicos sem explicação
- Tom formal ou frio
- Frases como "É necessário", "Deve-se"

USE:
- "Você pode", "Isso vai ajudar", "Este benefício significa"
- Linguagem conversacional e acolhedora
- Metáforas simples quando útil
- Emojis discretos (💙, 🙏, ✨) no máximo 2-3

Lembre-se: esta mãe pode estar cansada, preocupada e sobrecarregada. Sua mensagem deve acolher E fortalecer.

Gere APENAS o texto da explicação empática, sem formatação adicional.`

    const response = await this.model.invoke([{ role: "user", content: prompt }])
    return response.content as string
  }

  async generateStepByStepEncouragement(
    stepNumber: number,
    totalSteps: number,
    stepDescription: string
  ): Promise<string> {
    const prompt = `Você é uma orientadora acolhedora ajudando uma mãe a acessar benefícios para seu filho autista.

Ela está no passo ${stepNumber} de ${totalSteps}: "${stepDescription}"

Crie uma mensagem curta (2-3 frases) que:
1. RECONHECE o esforço dela ("Ótimo, você está indo bem!")
2. DÁ DICAS PRÁTICAS sobre este passo específico
3. ENCORAJA a continuar ("Você consegue!", "Está quase lá!")
4. Usa tom acolhedor e positivo

NÃO seja genérica. Seja específica sobre este passo.

Use emoji discreto (💙 ou ✨) apenas se fizer sentido.

Gere APENAS a mensagem de encorajamento, sem formatação.`

    const response = await this.model.invoke([{ role: "user", content: prompt }])
    return response.content as string
  }

  async generateEmotionalSupport(reportData: ReportData): Promise<string> {
    const prompt = `Você é uma conselheira empática especializada em apoiar mães de crianças autistas.

Esta mãe está iniciando a jornada de acessar benefícios para seu filho(a) autista.

Crie uma mensagem de APOIO EMOCIONAL e ENCORAJAMENTO (1 parágrafo) que:

1. VALIDA o que ela está sentindo (pode estar cansada, com medo, sobrecarregada)
2. RECONHECE o amor e dedicação dela
3. ENCORAJA sobre a jornada pela frente
4. LEMBRA que ela tem direitos e ferramentas disponíveis
5. USA linguagem CALMANTE e POSITIVA

Tom: carinhoso, acolhedor, fortalecido.
Não seja superficial - seja genuinamente empática.

Use no máximo 1 emoji (💙)

Gere APENAS a mensagem de apoio emocional.`

    const response = await this.model.invoke([{ role: "user", content: prompt }])
    return response.content as string
  }
}
