import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import type { ReportData } from "./report-reader"

export interface BenefitInfo {
  id: string
  name: string
  type: "beneficio-federal" | "beneficio-estadual" | "beneficio-municipal" | "direito-legal"
  description: string
  requirements: string[]
  applicable: boolean
  priority: "alta" | "media" | "baixa"
}

export class RightsSpecialistAgent {
  private model: ChatGoogleGenerativeAI

  constructor(apiKey: string) {
    this.model = new ChatGoogleGenerativeAI({
      model: "gemini-2.0-flash-exp",
      temperature: 0.5,
      apiKey: apiKey,
    })
  }

  async identifyApplicableBenefits(reportData: ReportData): Promise<BenefitInfo[]> {
    const allBenefits = this.getAllAvailableBenefits()
    
    // Filtrar benefícios aplicáveis baseado no laudo
    const applicableBenefits = allBenefits.filter(benefit => {
      if (benefit.id === "bpc" && (!reportData.age || reportData.age > 18)) {
        return false // BPC pode ter restrição de idade dependendo do caso
      }
      return true
    })

    // Gerar descrições personalizadas com IA
    const enrichedBenefits = await Promise.all(
      applicableBenefits.map(benefit => this.enrichBenefitDescription(benefit, reportData))
    )

    return enrichedBenefits.sort((a, b) => {
      const priorityOrder = { alta: 3, media: 2, baixa: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  private getAllAvailableBenefits(): BenefitInfo[] {
    return [
      {
        id: "bpc",
        name: "BPC - Benefício de Prestação Continuada (LOAS)",
        type: "beneficio-federal",
        description: "Auxílio de 1 salário mínimo pago mensalmente a pessoas com deficiência de baixa renda.",
        requirements: [
          "Renda familiar por pessoa inferior a 1/4 do salário mínimo",
          "Laudo médico comprovando deficiência",
          "Cadastro no CadÚnico",
          "Ter até 18 anos ou comprovar deficiência permanente"
        ],
        applicable: true,
        priority: "alta",
      },
      {
        id: "passe-livre",
        name: "Passe Livre Intermunicipal",
        type: "beneficio-federal",
        description: "Transporte gratuito em linhas interestaduais e intermunicipais para acompanhamento de tratamento.",
        requirements: [
          "Laudo médico comprovando necessidade de tratamento regular",
          "Comprovar frequência de tratamentos",
          "Renda familiar limitada",
          "Documentos pessoais atualizados"
        ],
        applicable: true,
        priority: "alta",
      },
      {
        id: "passe-livre-municipal",
        name: "Passe Livre Municipal",
        type: "beneficio-municipal",
        description: "Transporte gratuito no transporte coletivo municipal.",
        requirements: [
          "Laudo médico",
          "Comprovar necessidade de acompanhamento",
          "Residir no município",
          "Documentos pessoais"
        ],
        applicable: true,
        priority: "media",
      },
      {
        id: "isencao-ipva",
        name: "Isenção de IPVA",
        type: "beneficio-estadual",
        description: "Isenção total do Imposto sobre Propriedade de Veículos Automotores (varia por estado).",
        requirements: [
          "Laudo médico comprovando autismo",
          "Veículo no nome do deficiente ou responsável",
          "Não exceder valor máximo definido pelo estado",
          "Renovação periódica"
        ],
        applicable: true,
        priority: "media",
      },
      {
        id: "educacao-inclusiva",
        name: "Professor de Apoio (AEE)",
        type: "direito-legal",
        description: "Atendimento Educacional Especializado com professor de apoio em sala de aula.",
        requirements: [
          "Laudo médico atualizado",
          "Relatório pedagógico da escola",
          "Solicitação formal à Secretaria de Educação",
          "Avaliação de necessidade"
        ],
        applicable: true,
        priority: "alta",
      },
      {
        id: "medicamentos-sus",
        name: "Medicamentos pelo SUS",
        type: "beneficio-federal",
        description: "Dispensação gratuita de medicamentos para TEA pela farmácia do SUS.",
        requirements: [
          "Receita médica atualizada",
          "Cadastro no SUS da cidade",
          "Prescrição de médico credenciado",
          "Disponibilidade do medicamento na farmácia"
        ],
        applicable: true,
        priority: "alta",
      },
      {
        id: "terapia-sus",
        name: "Terapias pelo SUS (CAPS)",
        type: "beneficio-federal",
        description: "Acompanhamento com fonoaudiologia, terapia ocupacional, psicologia no CAPS Infantil.",
        requirements: [
          "Laudo médico",
          "Encaminhamento médico",
          "Cadastro no SUS",
          "Disponibilidade de vagas"
        ],
        applicable: true,
        priority: "alta",
      },
      {
        id: "isencoes-fiscais",
        name: "Isenção IR - Dependente",
        type: "beneficio-federal",
        description: "Deduções no Imposto de Renda por despesas médicas e terapias do dependente autista.",
        requirements: [
          "Dependência do filho(a) comprovada",
          "Notas fiscais de despesas médicas",
          "Receitas e laudos médicos",
          "Declaração de Imposto de Renda"
        ],
        applicable: true,
        priority: "media",
      },
      {
        id: "cartao-estacionamento",
        name: "Cartão de Estacionamento Especial",
        type: "beneficio-municipal",
        description: "Cartão para estacionar em vagas especiais (disponível em algumas cidades).",
        requirements: [
          "Laudo médico comprovando mobilidade reduzida",
          "Solicitação na prefeitura",
          "Documentos pessoais",
          "Foto 3x4"
        ],
        applicable: true,
        priority: "baixa",
      },
      {
        id: "prioridade-fila",
        name: "Prioridade em Filas e Serviços",
        type: "direito-legal",
        description: "Direito à preferência em filas de bancos, órgãos públicos, estabelecimentos comerciais.",
        requirements: [
          "Documento comprobatório (laudo médico)",
          "Declaração de acompanhante (se necessário)",
          "Conhecimento da Lei Brasileira de Inclusão"
        ],
        applicable: true,
        priority: "baixa",
      },
    ]
  }

  private async enrichBenefitDescription(
    benefit: BenefitInfo,
    reportData: ReportData
  ): Promise<BenefitInfo> {
    const prompt = `Você é um especialista em direitos de pessoas autistas no Brasil.

Baseado no perfil do laudo abaixo, crie uma explicação empática e objetiva sobre por que este benefício é importante para esta família.

Dados do laudo:
- Idade: ${reportData.age || "não informado"}
- CID: ${reportData.cid || "não informado"}
- Nível de suporte: ${reportData.supportLevel || "não informado"}
- Tipo de escola: ${reportData.schoolType}

Benefício: ${benefit.name}
Descrição: ${benefit.description}

Crie uma explicação curta (2-3 frases) que:
1. Explica por que este benefício é relevante para este caso
2. Usa linguagem empática e acolhedora
3. Não é técnica demais

Responda APENAS com o texto da explicação, sem formatação.`

    try {
      const response = await this.model.invoke([{ role: "user", content: prompt }])
      const enhancedDescription = response.content as string
      
      return {
        ...benefit,
        description: enhancedDescription || benefit.description,
      }
    } catch (error) {
      console.error("Error enriching benefit:", error)
      return benefit
    }
  }
}
