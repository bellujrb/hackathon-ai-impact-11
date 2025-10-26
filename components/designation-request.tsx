"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText, Upload, ChevronRight, ChevronLeft, CheckCircle2, Clock } from "lucide-react"

export function DesignationRequest() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    benefitType: "",
    applicantName: "",
    applicantCPF: "",
    applicantRG: "",
    applicantAddress: "",
    applicantPhone: "",
    applicantEmail: "",
    beneficiaryName: "",
    beneficiaryCPF: "",
    beneficiaryRG: "",
    beneficiaryAge: "",
    monthlyIncome: "",
    dependents: "",
    familyComposition: "",
    documents: [] as File[],
    observations: ""
  })

  const BENEFIT_TYPES = [
    { id: "bpc", name: "BPC/LOAS", description: "Benefício de Prestação Continuada da Assistência Social" },
    { id: "passe-livre", name: "Passe Livre", description: "Transporte gratuito para tratamento e terapias" },
    { id: "isencao-ipva", name: "Isenção de IPVA", description: "Isenção total do Imposto sobre Propriedade de Veículos" },
    { id: "professor-apoio", name: "Professor de Apoio", description: "Atendimento Educacional Especializado" }
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setFormData(prev => ({ ...prev, documents: [...prev.documents, ...files] }))
    }
  }

  const removeDocument = (index: number) => {
    setFormData(prev => ({ ...prev, documents: prev.documents.filter((_, i) => i !== index) }))
  }

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setSubmitted(true)
    setIsSubmitting(false)
  }

  if (submitted) {
    return (
      <div className="flex h-full flex-col bg-white dark:bg-gray-950">
        <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Solicitação Enviada</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-2xl">
            <Card className="p-8 text-center dark:bg-gray-800">
              <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Solicitação Enviada!</h2>
              <div className="bg-gray-900 dark:bg-gray-700 text-white p-4 rounded-lg font-mono text-xl font-bold mb-6">
                REQ-{Date.now()}
              </div>
              <div className="flex items-center justify-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-6">
                <Clock className="h-5 w-5" />
                <span>Status: Pendente de Análise</span>
              </div>
              <Button className="w-full">Baixar Comprovante</Button>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-white dark:bg-gray-950">
      <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Designações Oficiais</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-3xl">
          {/* Banner Informativo */}
          <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">Solicitar Advogado do Governo</h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Esta ferramenta permite solicitar um advogado público para auxiliar no processo de obtenção de benefícios sociais. 
                  Preencha o formulário abaixo com as informações necessárias e sua solicitação será enviada para a Defensoria Pública ou órgão competente.
                </p>
              </div>
            </div>
          </Card>
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4, 5, 6].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step === currentStep ? "bg-gray-900 dark:bg-gray-700 text-white" : step < currentStep ? "bg-green-600 dark:bg-green-700 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  }`}>
                    {step < currentStep ? "✓" : step}
                  </div>
                  {step < 6 && <div className={`w-12 h-1 ${step < currentStep ? "bg-green-600 dark:bg-green-700" : "bg-gray-200 dark:bg-gray-700"}`} />}
                </div>
              ))}
            </div>
          </div>

          <Card className="p-6 dark:bg-gray-800">
            {currentStep === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Passo 1: Seleção do Benefício</h2>
                <div className="space-y-3">
                  {BENEFIT_TYPES.map((benefit) => (
                    <Card
                      key={benefit.id}
                      className={`p-4 cursor-pointer border-2 transition-all ${
                        formData.benefitType === benefit.id ? "border-gray-900 dark:border-gray-600 bg-gray-50 dark:bg-gray-700" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, benefitType: benefit.id }))}
                    >
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{benefit.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{benefit.description}</p>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Passo 2: Dados do Solicitante</h2>
                <div className="space-y-3">
                  <div><Label>Nome Completo *</Label><Input value={formData.applicantName} onChange={(e) => setFormData(prev => ({ ...prev, applicantName: e.target.value }))} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>CPF *</Label><Input value={formData.applicantCPF} onChange={(e) => setFormData(prev => ({ ...prev, applicantCPF: e.target.value }))} /></div>
                    <div><Label>RG *</Label><Input value={formData.applicantRG} onChange={(e) => setFormData(prev => ({ ...prev, applicantRG: e.target.value }))} /></div>
                  </div>
                  <div><Label>Endereço *</Label><Textarea value={formData.applicantAddress} onChange={(e) => setFormData(prev => ({ ...prev, applicantAddress: e.target.value }))} rows={2} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Telefone *</Label><Input value={formData.applicantPhone} onChange={(e) => setFormData(prev => ({ ...prev, applicantPhone: e.target.value }))} /></div>
                    <div><Label>E-mail *</Label><Input value={formData.applicantEmail} onChange={(e) => setFormData(prev => ({ ...prev, applicantEmail: e.target.value }))} /></div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Passo 3: Dados do Beneficiário</h2>
                <div className="space-y-3">
                  <div><Label>Nome da Criança/Adulto com Autismo *</Label><Input value={formData.beneficiaryName} onChange={(e) => setFormData(prev => ({ ...prev, beneficiaryName: e.target.value }))} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>CPF *</Label><Input value={formData.beneficiaryCPF} onChange={(e) => setFormData(prev => ({ ...prev, beneficiaryCPF: e.target.value }))} /></div>
                    <div><Label>RG *</Label><Input value={formData.beneficiaryRG} onChange={(e) => setFormData(prev => ({ ...prev, beneficiaryRG: e.target.value }))} /></div>
                  </div>
                  <div><Label>Idade *</Label><Input type="number" value={formData.beneficiaryAge} onChange={(e) => setFormData(prev => ({ ...prev, beneficiaryAge: e.target.value }))} /></div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Passo 4: Composição Familiar / Renda</h2>
                <div className="space-y-3">
                  <div><Label>Renda Mensal da Família (R$) *</Label><Input type="number" value={formData.monthlyIncome} onChange={(e) => setFormData(prev => ({ ...prev, monthlyIncome: e.target.value }))} /></div>
                  <div><Label>Número de Dependentes *</Label><Input type="number" value={formData.dependents} onChange={(e) => setFormData(prev => ({ ...prev, dependents: e.target.value }))} /></div>
                  <div><Label>Composição Familiar *</Label><Textarea value={formData.familyComposition} onChange={(e) => setFormData(prev => ({ ...prev, familyComposition: e.target.value }))} rows={3} /></div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Passo 5: Anexar Documentos</h2>
                <div className="space-y-3">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                    <Upload className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-blue-600 dark:text-blue-400 font-medium">Clique para fazer upload</span> ou arraste arquivos
                    </Label>
                    <Input id="file-upload" type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="hidden" />
                  </div>
                  {formData.documents.length > 0 && (
                    <div className="space-y-2">
                      {formData.documents.map((file, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <FileText className="h-5 w-5 text-gray-400 dark:text-gray-300" />
                          <span className="flex-1 text-sm text-gray-900 dark:text-gray-100">{file.name}</span>
                          <Button variant="ghost" size="sm" onClick={() => removeDocument(index)} className="dark:text-gray-300">Remover</Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 6 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Passo 6: Revisão</h2>
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-900 dark:text-gray-100">Observações Adicionais</Label>
                    <Textarea value={formData.observations} onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))} rows={4} className="dark:bg-gray-900 dark:border-gray-700 dark:text-white" />
                  </div>
                  <Card className="p-4 bg-gray-50 dark:bg-gray-700">
                    <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Resumo</h3>
                    <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <p><span className="font-medium">Benefício:</span> {BENEFIT_TYPES.find(b => b.id === formData.benefitType)?.name}</p>
                      <p><span className="font-medium">Solicitante:</span> {formData.applicantName}</p>
                      <p><span className="font-medium">Beneficiário:</span> {formData.beneficiaryName} ({formData.beneficiaryAge} anos)</p>
                      <p><span className="font-medium">Documentos:</span> {formData.documents.length} arquivo(s)</p>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline" onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))} disabled={currentStep === 1} className="gap-2 dark:border-gray-600">
                <ChevronLeft className="h-4 w-4" /> Anterior
              </Button>
              {currentStep < 6 ? (
                <Button onClick={() => setCurrentStep(prev => Math.min(6, prev + 1))} className="gap-2 bg-theo-purple dark:bg-purple-700 hover:bg-theo-purple-dark dark:hover:bg-purple-800">
                  Próximo <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2 bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-800">
                  {isSubmitting ? "Enviando..." : "Enviar Solicitação"}
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
