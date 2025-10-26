export type ProfessionalInfo = {
  name: string
  registry?: string
  specialty?: string
  location?: string
}

export type ChildInfo = {
  name: string
  birthDate?: string
  schoolEnrollment?: string
  guardianName?: string
  diagnosis?: string
}

export type ReportData = {
  professional: ProfessionalInfo
  child: ChildInfo
  clinicalDescription?: string
  technicalJustification?: string
  recommendations?: string
  legalReferences?: string[]
  conclusion?: string
}

export function generateReport(data: ReportData): string {
  const { professional, child, clinicalDescription, technicalJustification, recommendations, legalReferences, conclusion } = data

  const lines: string[] = []

  lines.push("Relatório Técnico para Solicitação de Apoio Educacional")
  lines.push("=".repeat(60))
  lines.push("")

  // 1. Identificação do Profissional
  lines.push("1. Identificação do Profissional")
  lines.push("-")
  lines.push(`Nome: ${professional.name || ""}`)
  if (professional.registry) lines.push(`Registro profissional: ${professional.registry}`)
  if (professional.specialty) lines.push(`Especialidade: ${professional.specialty}`)
  if (professional.location) lines.push(`Local de atendimento: ${professional.location}`)
  lines.push("")

  // 2. Identificação da Criança
  lines.push("2. Identificação da Criança")
  lines.push("-")
  lines.push(`Nome: ${child.name || ""}`)
  if (child.birthDate) lines.push(`Data de nascimento: ${child.birthDate}`)
  if (child.schoolEnrollment) lines.push(`Número de matrícula (se aplicável): ${child.schoolEnrollment}`)
  if (child.guardianName) lines.push(`Responsável legal: ${child.guardianName}`)
  if (child.diagnosis) lines.push(`Diagnóstico (se houver): ${child.diagnosis}`)
  lines.push("")

  // 3. Descrição do Quadro Clínico e Funcional
  lines.push("3. Descrição do Quadro Clínico e Funcional")
  lines.push("-")
  if (clinicalDescription) {
    lines.push(clinicalDescription)
  } else {
    lines.push("(Descrição clínica e funcional não informada.)")
  }
  lines.push("")

  // 4. Justificativa Técnica para o Apoio Escolar
  lines.push("4. Justificativa Técnica para o Apoio Escolar")
  lines.push("-")
  if (technicalJustification) {
    lines.push(technicalJustification)
  } else {
    lines.push("(Justificativa técnica não informada.)")
  }
  lines.push("")

  // 5. Recomendações Específicas
  lines.push("5. Recomendações Específicas")
  lines.push("-")
  if (recommendations) {
    lines.push(recommendations)
  } else {
    lines.push("(Recomendações não informadas.)")
  }
  lines.push("")

  // 6. Conclusão e Assinatura
  lines.push("6. Conclusão e Assinatura")
  lines.push("-")
  if (conclusion) {
    lines.push(conclusion)
  } else {
    lines.push("Diante do exposto, conclui-se que o(a) aluno(a) necessita de apoio educacional especializado, com acompanhamento individualizado, para garantir seu desenvolvimento acadêmico e social de forma inclusiva.")
  }
  lines.push("")

  lines.push("Assinatura do profissional:")
  lines.push("Nome: ________________________________   Registro: ____________________")
  lines.push("")

  if (legalReferences && legalReferences.length > 0) {
    lines.push("Fundamentação legal (exemplos):")
    legalReferences.forEach((r) => lines.push(`- ${r}`))
    lines.push("")
  }

  lines.push("Observações:")
  lines.push("- Este relatório foi gerado a partir das informações fornecidas na plataforma e deve ser revisado e assinado por um profissional habilitado para garantir validade legal.")

  return lines.join("\n")
}
