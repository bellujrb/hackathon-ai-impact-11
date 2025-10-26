import { ChatGoogleGenerativeAI } from "@langchain/google-genai"

export interface ReportData {
  cid: string | null
  age: number | null
  supportLevel: string | null
  schoolType: "publica" | "privada" | "nao-informado"
  observations: string
}

export class ReportReaderAgent {
  private model: ChatGoogleGenerativeAI

  constructor(apiKey: string) {
    this.model = new ChatGoogleGenerativeAI({
      model: "gemini-2.0-flash-exp",
      temperature: 0.3,
      apiKey: apiKey,
    })
  }

  async extractReportData(reportText: string): Promise<ReportData> {
    const prompt = `Você é um especialista em análise de laudos médicos de autismo (TEA).

Analise o seguinte texto de laudo médico e extraia APENAS as seguintes informações:

1. **CID**: O código CID mencionado (geralmente F84.0, F84.1, F84.5, F84.9)
2. **Idade**: Idade da criança mencionada no laudo
3. **Nível de suporte**: Se mencionado (Leve, Moderado, Severo, Nível 1/2/3)
4. **Tipo de escola**: Se mencionado se a criança estuda em escola pública ou privada
5. **Observações relevantes**: Resuma em 2-3 frases os pontos principais do laudo

IMPORTANTE:
- NÃO extraia nomes, endereços ou outros dados pessoais
- Se alguma informação não estiver no texto, retorne null
- Seja objetivo e preciso
- Formato de resposta em JSON:

{
  "cid": "F84.0" ou null,
  "age": 5 ou null,
  "supportLevel": "Leve" ou null,
  "schoolType": "publica" ou "privada" ou "nao-informado",
  "observations": "resumo breve"
}

Texto do laudo:
${reportText}

Responda APENAS com o JSON, sem texto adicional.`

    const response = await this.model.invoke([{ role: "user", content: prompt }])
    const content = response.content as string
    
    // Tentar extrair JSON da resposta
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        cid: parsed.cid || null,
        age: parsed.age || null,
        supportLevel: parsed.supportLevel || null,
        schoolType: parsed.schoolType || "nao-informado",
        observations: parsed.observations || "",
      }
    }
    
    // Se não conseguiu extrair JSON, retornar dados vazios
    return {
      cid: null,
      age: null,
      supportLevel: null,
      schoolType: "nao-informado",
      observations: "",
    }
  }

  async generateSummary(reportData: ReportData): Promise<string> {
    const summaryParts: string[] = []

    if (reportData.cid) {
      summaryParts.push(`📋 **CID**: ${reportData.cid}`)
    }

    if (reportData.age !== null) {
      summaryParts.push(`👶 **Idade**: ${reportData.age} anos`)
    }

    if (reportData.supportLevel) {
      summaryParts.push(`🎯 **Nível de suporte**: ${reportData.supportLevel}`)
    }

    if (reportData.schoolType !== "nao-informado") {
      const schoolText = reportData.schoolType === "publica" ? "pública" : "privada"
      summaryParts.push(`🏫 **Tipo de escola**: ${schoolText}`)
    }

    if (reportData.observations) {
      summaryParts.push(`\n📝 **Observações**: ${reportData.observations}`)
    }

    return summaryParts.join("\n")
  }
}
