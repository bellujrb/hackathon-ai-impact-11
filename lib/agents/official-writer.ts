import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import type { BenefitInfo } from "./rights-specialist"
import type { ReportData } from "./report-reader"

export interface OfficialDocument {
  type: "requirement" | "email" | "letter" | "petition"
  title: string
  content: string
  subject?: string
}

export class OfficialWriterAgent {
  private model: ChatGoogleGenerativeAI

  constructor(apiKey: string) {
    this.model = new ChatGoogleGenerativeAI({
      model: "gemini-2.0-flash-exp",
      // Use deterministic output to reduce hallucinations. Temperature set to 0.
      temperature: 0.0,
      apiKey: apiKey,
    })
  }

  async generateOfficialDocument(
    benefit: BenefitInfo,
    reportData: ReportData,
    documentType: OfficialDocument["type"],
    recipient?: string
  ): Promise<OfficialDocument> {
    const prompt = this.buildPrompt(benefit, reportData, documentType, recipient)
    const response = await this.model.invoke([{ role: "user", content: prompt }])
    const content = response.content as string

    return {
      type: documentType,
      title: this.generateTitle(benefit, documentType),
      content: content,
      subject: documentType === "email" ? this.generateEmailSubject(benefit) : undefined,
    }
  }

  private buildPrompt(
    benefit: BenefitInfo,
    reportData: ReportData,
    documentType: OfficialDocument["type"],
    recipient?: string
  ): string {
    const context = `
Dados do laudo:
- CID: ${reportData.cid || "não informado"}
- Idade: ${reportData.age || "não informado"} anos
- Nível de suporte: ${reportData.supportLevel || "não informado"}

Benefício a solicitar: ${benefit.name}
Descrição: ${benefit.description}
`

  // Safety guard: explicit instruction to avoid hallucination
  // This will be appended to each prompt to ensure the model does not invent data.
  const hallucinationGuard = `
IMPORTANTE: Use APENAS os dados fornecidos acima. NÃO invente nomes, diagnósticos, idades, ou qualquer outro detalhe que não esteja no contexto. Se alguma informação estiver ausente, escreva explicitamente "não informado" no lugar. Responda de forma objetiva e não adicione conteúdo médico ou legal não fornecido.
`

    switch (documentType) {
      case "requirement":
  return `${context}

Você precisa redigir um REQUERIMENTO ADMINISTRATIVO formal solicitando o benefício acima.

O documento deve conter:
1. Título: "REQUERIMENTO" centralizado
2. Destinatário: órgão responsável pelo benefício
3. Identificação da pessoa com deficiência (CID, idade)
4. Descrição da necessidade e situação
5. Solicitação clara e objetiva do benefício
6. Fundamentação legal resumida
7. Data e assinatura da responsável

Formato: documento oficial brasileiro, formal, respeitoso, objetivo.
Linguagem: técnica mas acessível, empática mas profissional.
${hallucinationGuard}

Gerar APENAS o conteúdo do documento, sem texto adicional.`

      case "email":
  return `${context}

Você precisa redigir um E-MAIL FORMAL para enviar ao órgão responsável solicitando o benefício acima.

Destinatário: ${recipient || "órgão competente"}

O e-mail deve conter:
1. Assunto objetivo e claro
2. Saudação formal
3. Identificação da criança (CID, idade)
4. Descrição da situação e necessidade
5. Solicitação clara do benefício
6. Anexação de documentos (se aplicável)
7. Agradecimento e solicitação de retorno
8. Assinatura com contatos

Formato: e-mail profissional brasileiro, formal, cortês.
Linguagem: clara, objetiva, respeitosa.
${hallucinationGuard}

Gerar o e-mail completo, incluindo Assunto e corpo.`

      case "letter":
  return `${context}

Você precisa redatir uma CARTA OFICIAL para enviar à escola solicitando ${benefit.name === "Professor de Apoio (AEE)" ? "suporte educacional especializado" : "apoio ao aluno"}.

A carta deve conter:
1. Cabeçalho com data e destinatário (Direção da Escola)
2. Saudação formal
3. Identificação do aluno (CID, características relevantes)
4. Descrição das necessidades educacionais
5. Solicitação específica
6. Fundamentação pedagógica resumida
7. Solicitação de reunião para discussão
8. Agradecimento e disponibilidade
9. Assinatura da responsável

Formato: carta oficial brasileira, formal mas acolhedora.
Linguagem: respeitosa, clara, colaborativa.
${hallucinationGuard}

Gerar a carta completa.`

      case "petition":
  return `${context}

Você precisa redigir um ATO ADMINISTRATIVO (Petição) requerendo o benefício acima.

A petição deve conter:
1. Identificação dos fatos
2. Fundamento legal (mencionar genericamente: Lei Brasileira de Inclusão, Estatuto da Pessoa com Deficiência, etc)
3. Dos Direitos (explicação breve dos direitos)
4. Dos Pedidos (solicitação específica e clara)
5. Protesto por provas (opcional)
6. Pedido de deferimento

Formato: peça jurídica administrativa brasileira, formal, técnica.
Linguagem: jurídica mas acessível, direta.
${hallucinationGuard}

Gerar o conteúdo da petição.`

      default:
        return context
    }
  }

  private generateTitle(benefit: BenefitInfo, documentType: OfficialDocument["type"]): string {
    switch (documentType) {
      case "requirement":
        return `Requerimento - ${benefit.name}`
      case "email":
        return `E-mail - Solicitação ${benefit.name}`
      case "letter":
        return `Carta à Escola - Solicitação de Apoio`
      case "petition":
        return `Petição - ${benefit.name}`
      default:
        return "Documento Oficial"
    }
  }

  private generateEmailSubject(benefit: BenefitInfo): string {
    return `Solicitação: ${benefit.name}`
  }
}
