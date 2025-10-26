"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { generateReport, ReportData } from "@/lib/report-generator"

export default function ReportGenerator() {
  const [professionalName, setProfessionalName] = useState("")
  const [professionalRegistry, setProfessionalRegistry] = useState("")
  const [professionalSpecialty, setProfessionalSpecialty] = useState("")
  const [professionalLocation, setProfessionalLocation] = useState("")

  const [childName, setChildName] = useState("")
  const [childBirthDate, setChildBirthDate] = useState("")
  const [childEnrollment, setChildEnrollment] = useState("")
  const [childGuardian, setChildGuardian] = useState("")
  const [childDiagnosis, setChildDiagnosis] = useState("")

  const [clinicalDescription, setClinicalDescription] = useState("")
  const [technicalJustification, setTechnicalJustification] = useState("")
  const [recommendations, setRecommendations] = useState("")
  const [conclusion, setConclusion] = useState("")
  const [legalReferences, setLegalReferences] = useState("Lei nº 13.146/2015; Decreto nº 10.502/2020; Lei nº 12.764/2012")

  const [preview, setPreview] = useState("")

  const handleGenerate = () => {
    const data: ReportData = {
      professional: {
        name: professionalName,
        registry: professionalRegistry,
        specialty: professionalSpecialty,
        location: professionalLocation,
      },
      child: {
        name: childName,
        birthDate: childBirthDate,
        schoolEnrollment: childEnrollment,
        guardianName: childGuardian,
        diagnosis: childDiagnosis,
      },
      clinicalDescription,
      technicalJustification,
      recommendations,
      conclusion,
      legalReferences: legalReferences.split(";").map((s) => s.trim()).filter(Boolean),
    }

    const text = generateReport(data)
    setPreview(text)
  }

  const handleCopy = async () => {
    if (!preview) return
    try {
      await navigator.clipboard.writeText(preview)
      alert("Relatório copiado para a área de transferência")
    } catch (err) {
      alert("Não foi possível copiar. Tente manualmente.")
    }
  }

  const handleDownload = () => {
    if (!preview) return
    const blob = new Blob([preview], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${childName || "relatorio"}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mt-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Gerador de Relatório</h2>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <h3 className="font-medium">1) Identificação do Profissional</h3>
            <Label>Nome completo</Label>
            <Input value={professionalName} onChange={(e) => setProfessionalName(e.target.value)} className="mt-1" />
            <Label className="mt-2">Registro profissional</Label>
            <Input value={professionalRegistry} onChange={(e) => setProfessionalRegistry(e.target.value)} className="mt-1" />
            <Label className="mt-2">Especialidade / Local</Label>
            <Input value={professionalSpecialty} onChange={(e) => setProfessionalSpecialty(e.target.value)} className="mt-1" placeholder="Ex: Psicólogo - Clínica X" />
          </div>

          <div>
            <h3 className="font-medium">2) Identificação da Criança</h3>
            <Label>Nome completo</Label>
            <Input value={childName} onChange={(e) => setChildName(e.target.value)} className="mt-1" />
            <Label className="mt-2">Data de Nascimento</Label>
            <Input value={childBirthDate} onChange={(e) => setChildBirthDate(e.target.value)} className="mt-1" placeholder="DD/MM/AAAA" />
            <Label className="mt-2">Número de matrícula</Label>
            <Input value={childEnrollment} onChange={(e) => setChildEnrollment(e.target.value)} className="mt-1" />
            <Label className="mt-2">Nome do responsável</Label>
            <Input value={childGuardian} onChange={(e) => setChildGuardian(e.target.value)} className="mt-1" />
            <Label className="mt-2">Diagnóstico (CID)</Label>
            <Input value={childDiagnosis} onChange={(e) => setChildDiagnosis(e.target.value)} className="mt-1" placeholder="Ex: F84.0 – Transtorno do Espectro Autista" />
          </div>

          <div>
            <h3 className="font-medium">3) Quadro Clínico</h3>
            <Textarea value={clinicalDescription} onChange={(e) => setClinicalDescription(e.target.value)} rows={4} className="mt-1" placeholder="Descreva o quadro clínico e funcional" />
          </div>

          <div>
            <h3 className="font-medium">4) Justificativa Técnica</h3>
            <Textarea value={technicalJustification} onChange={(e) => setTechnicalJustification(e.target.value)} rows={4} className="mt-1" placeholder="Explique a necessidade do apoio escolar" />
          </div>

          <div>
            <h3 className="font-medium">5) Recomendações</h3>
            <Textarea value={recommendations} onChange={(e) => setRecommendations(e.target.value)} rows={3} className="mt-1" placeholder="Indique ações práticas (adaptações, acompanhamento, periodicidade)" />
          </div>

          <div>
            <h3 className="font-medium">6) Conclusão / Assinatura</h3>
            <Textarea value={conclusion} onChange={(e) => setConclusion(e.target.value)} rows={2} className="mt-1" placeholder="Texto de conclusão (opcional)" />
          </div>

          <div>
            <Label>Fundamentação legal (separar por ; )</Label>
            <Input value={legalReferences} onChange={(e) => setLegalReferences(e.target.value)} className="mt-1" />
          </div>

          <div className="flex gap-2 mt-3">
            <Button onClick={handleGenerate}>Gerar Relatório</Button>
            <Button onClick={handleCopy} disabled={!preview} variant="outline">Copiar</Button>
            <Button onClick={handleDownload} disabled={!preview} variant="ghost">Baixar .txt</Button>
          </div>

          {preview && (
            <div>
              <h4 className="font-medium mt-4 mb-2">Pré-visualização</h4>
              <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded border border-gray-200 text-sm">{preview}</pre>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
