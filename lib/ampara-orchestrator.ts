import { ReportReaderAgent, type ReportData } from "./agents/report-reader"
import { RightsSpecialistAgent, type BenefitInfo } from "./agents/rights-specialist"
import { GuideAgent } from "./agents/guide-agent"
import { OfficialWriterAgent } from "./agents/official-writer"
import { EmpathicGuideAgent } from "./agents/empathic-guide"

export interface AmparaResult {
  reportSummary: {
    cid: string | null
    age: number | null
    supportLevel: string | null
    schoolType: string
    summaryText: string
  }
  applicableBenefits: Array<{
    benefit: {
      id: string
      name: string
      type: string
      description: string
      priority: string
    }
    empathicExplanation: string
    checklist: Array<{
      id: string
      title: string
      description: string
      details: string
      completed: boolean
    }>
    officialDocuments?: Array<{
      type: string
      title: string
      content: string
      subject?: string
    }>
  }>
  emotionalSupport: string
}

export class AmparaOrchestrator {
  private reportReader: ReportReaderAgent
  private rightsSpecialist: RightsSpecialistAgent
  private guide: GuideAgent
  private officialWriter: OfficialWriterAgent
  private empathicGuide: EmpathicGuideAgent

  constructor(apiKey: string) {
    this.reportReader = new ReportReaderAgent(apiKey)
    this.rightsSpecialist = new RightsSpecialistAgent(apiKey)
    this.guide = new GuideAgent(apiKey)
    this.officialWriter = new OfficialWriterAgent(apiKey)
    this.empathicGuide = new EmpathicGuideAgent(apiKey)
  }

  async processReport(reportText: string): Promise<AmparaResult> {
    console.log("🩺 Step 1: Reading report...")
    // 1. Extrair dados do laudo
    const reportData = await this.reportReader.extractReportData(reportText)
    const reportSummary = await this.reportReader.generateSummary(reportData)

    console.log("⚖️ Step 2: Identifying applicable benefits...")
    // 2. Identificar benefícios aplicáveis
    const benefits = await this.rightsSpecialist.identifyApplicableBenefits(reportData)

    console.log("💛 Step 3: Generating emotional support...")
    // 3. Gerar mensagem de apoio emocional
    const emotionalSupport = await this.empathicGuide.generateEmotionalSupport(reportData)

    console.log("📋 Step 4: Creating checklists and explanations...")
    // 4. Para cada benefício, gerar explicação empática, checklist e documentos
    const enrichedBenefits = await Promise.all(
      benefits.map(async (benefit) => {
        const empathicExplanation = await this.empathicGuide.generateEmpathicExplanation(
          benefit,
          reportData
        )

        const checklist = await this.guide.generateDetailedChecklist(benefit)

        // Gerar documentos oficiais para benefícios prioritários
        let officialDocuments
        if (benefit.priority === "alta") {
          officialDocuments = await this.generateOfficialDocuments(benefit, reportData)
        }

        return {
          benefit: {
            id: benefit.id,
            name: benefit.name,
            type: benefit.type,
            description: benefit.description,
            priority: benefit.priority,
          },
          empathicExplanation,
          checklist,
          officialDocuments,
        }
      })
    )

    return {
      reportSummary: {
        cid: reportData.cid,
        age: reportData.age,
        supportLevel: reportData.supportLevel,
        schoolType: reportData.schoolType,
        summaryText: reportSummary,
      },
      applicableBenefits: enrichedBenefits,
      emotionalSupport,
    }
  }

  private async generateOfficialDocuments(
    benefit: BenefitInfo,
    reportData: ReportData
  ): Promise<Array<{
    type: string
    title: string
    content: string
    subject?: string
  }>> {
    const documents = []

    // Gerar requerimento administrativo
    const requirement = await this.officialWriter.generateOfficialDocument(
      benefit,
      reportData,
      "requirement"
    )
    documents.push(requirement)

    // Se for benefício educacional, gerar carta para a escola
    if (benefit.id === "educacao-inclusiva") {
      const letter = await this.officialWriter.generateOfficialDocument(
        benefit,
        reportData,
        "letter"
      )
      documents.push(letter)
    }

    // Gerar e-mail padrão
    const email = await this.officialWriter.generateOfficialDocument(
      benefit,
      reportData,
      "email"
    )
    documents.push(email)

    return documents
  }
}

// Re-export types from agents for convenience
export type { ReportData, BenefitInfo }
export type { OfficialDocument } from "./agents/official-writer"
