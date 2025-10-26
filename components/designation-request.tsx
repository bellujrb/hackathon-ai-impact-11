"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText, Upload, ChevronRight, ChevronLeft, CheckCircle2, Clock, Send } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import emailjs from "@emailjs/browser"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function DesignationRequest() {
  const RECIPIENT_EMAIL = "fmarcus549@gmail.com"
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
  const [isConfirming, setIsConfirming] = useState(false)

  const benefitName = BENEFIT_TYPES.find(b => b.id === formData.benefitType)?.name ?? "Não especificado"
  const emailBody = `Prezados(as) Defensores(as) Públicos(as),

Eu, ${formData.applicantName}, portador(a) do CPF nº ${formData.applicantCPF} e RG nº ${formData.applicantRG}, residente no endereço ${formData.applicantAddress}, venho por meio deste e-mail solicitar respeitosamente assistência jurídica gratuita.

A presente solicitação visa garantir o direito ao benefício de "${benefitName}" para meu/minha filho(a), ${formData.beneficiaryName}, de ${formData.beneficiaryAge} anos, diagnosticado(a) com Transtorno do Espectro Autista (TEA).

Nossa renda familiar mensal é de R$ ${formData.monthlyIncome}, composta por ${formData.familyComposition}, o que nos enquadra nos critérios para o atendimento pela Defensoria Pública. Enfrentamos dificuldades para acessar o benefício, que é fundamental para o desenvolvimento e qualidade de vida do(a) meu/minha filho(a).

Diante do exposto, solicito o auxílio de um(a) Defensor(a) Público(a) para me representar e orientar no processo administrativo ou judicial para a obtenção do referido benefício, assegurando que os direitos do(a) beneficiário(a) sejam plenamente atendidos conforme a legislação vigente.

Seguem anexos os documentos necessários para a análise do caso. Coloco-me à inteira disposição para fornecer quaisquer informações adicionais.

Agradeço a atenção.

Atenciosamente,

${formData.applicantName}
Telefone: ${formData.applicantPhone}
E-mail: ${formData.applicantEmail}`

  const handleSubmit = async () => {
    setIsSubmitting(true)

    function toBase64(file: File): Promise<string> {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = error => reject(error)
      })
    }
    
    const emailData: any = {
      email: RECIPIENT_EMAIL,
      benefit_type: benefitName,
      applicant_name: formData.applicantName,
      applicant_email: formData.applicantEmail,
      email_body: emailBody,
    }

    for (let i = 0; i < formData.documents.length; i++) {
      emailData[`document_${i + 1}`] = await toBase64(formData.documents[i])
      emailData[`document_name_${i + 1}`] = formData.documents[i].name
    }

    try {
      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

      if (!serviceId || !templateId || !publicKey) {
        const missing = [
          !serviceId && "NEXT_PUBLIC_EMAILJS_SERVICE_ID",
          !templateId && "NEXT_PUBLIC_EMAILJS_TEMPLATE_ID",
          !publicKey && "NEXT_PUBLIC_EMAILJS_PUBLIC_KEY",
        ].filter(Boolean).join(", ")

        throw new Error(`Variáveis de ambiente ausentes: ${missing}. Verifique seu .env e reinicie a aplicação.`)
      }
      
      await emailjs.send(
        serviceId,
        templateId,
        emailData,
        publicKey
      )
      setSubmitted(true)
    } catch (error: any) {
      alert("Erro ao enviar o e-mail: " + (error?.text?.toString() || ""))
      console.error("Erro ao enviar o e-mail:", error)
    }
    setIsSubmitting(false)
    setIsConfirming(false)
  }

  if (submitted) {
    return (
      <div className="flex h-full flex-col bg-white dark:bg-gray-950">
        <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-800 px-4 md:px-6 py-4">
          <SidebarTrigger />
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Solicitação Enviada</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-2xl">
            <Card className="p-8 text-center dark:bg-gray-800">
              <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Solicitação Enviada com Sucesso!</h2>
              <p className="mb-6 text-gray-600 dark:text-gray-300">
                Sua solicitação foi enviada para a Defensoria Pública. Você receberá uma resposta no e-mail{" "}
                <strong className="text-gray-900 dark:text-white">{formData.applicantEmail}</strong> assim que o caso for analisado.
              </p>
              <div className="bg-gray-900 dark:bg-gray-700 text-white p-4 rounded-lg font-mono text-xl font-bold mb-6">
                REQ-{Date.now()}
              </div>
              <div className="flex items-center justify-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-6">
                <Clock className="h-5 w-5" />
                <span>Status: Pendente de Análise</span>
              </div>
              <p className="mb-6 text-xs text-gray-500 dark:text-gray-400">
                Guarde este número de protocolo para referência futura. Verifique sua caixa de spam.
              </p>
              <Button className="w-full bg-theo-purple dark:bg-purple-600 hover:bg-theo-purple-dark dark:hover:bg-purple-700" onClick={() => window.location.reload()}>
                Fazer Nova Solicitação
              </Button>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-white dark:bg-gray-950">
      <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-800 px-4 md:px-6 py-4">
        <SidebarTrigger />
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
            <div className="flex items-center justify-between gap-1">
              {[1, 2, 3, 4, 5, 6].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm ${
                    step === currentStep ? "bg-gray-900 dark:bg-gray-700 text-white" : step < currentStep ? "bg-green-600 dark:bg-green-700 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  }`}>
                    {step < currentStep ? "✓" : step}
                  </div>
                  {step < 6 && <div className={`flex-1 h-1 min-w-[8px] ${step < currentStep ? "bg-green-600 dark:bg-green-700" : "bg-gray-200 dark:bg-gray-700"}`} />}
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
                  <div><Label className="text-gray-900 dark:text-gray-100">Nome Completo *</Label><Input value={formData.applicantName} onChange={(e) => setFormData(prev => ({ ...prev, applicantName: e.target.value }))} className="dark:bg-gray-900 dark:border-gray-700 dark:text-white" /></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><Label className="text-gray-900 dark:text-gray-100">CPF *</Label><Input value={formData.applicantCPF} onChange={(e) => setFormData(prev => ({ ...prev, applicantCPF: e.target.value }))} className="dark:bg-gray-900 dark:border-gray-700 dark:text-white" /></div>
                    <div><Label className="text-gray-900 dark:text-gray-100">RG *</Label><Input value={formData.applicantRG} onChange={(e) => setFormData(prev => ({ ...prev, applicantRG: e.target.value }))} className="dark:bg-gray-900 dark:border-gray-700 dark:text-white" /></div>
                  </div>
                  <div><Label className="text-gray-900 dark:text-gray-100">Endereço *</Label><Textarea value={formData.applicantAddress} onChange={(e) => setFormData(prev => ({ ...prev, applicantAddress: e.target.value }))} rows={2} className="dark:bg-gray-900 dark:border-gray-700 dark:text-white" /></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><Label className="text-gray-900 dark:text-gray-100">Telefone *</Label><Input value={formData.applicantPhone} onChange={(e) => setFormData(prev => ({ ...prev, applicantPhone: e.target.value }))} className="dark:bg-gray-900 dark:border-gray-700 dark:text-white" /></div>
                    <div><Label className="text-gray-900 dark:text-gray-100">E-mail *</Label><Input value={formData.applicantEmail} onChange={(e) => setFormData(prev => ({ ...prev, applicantEmail: e.target.value }))} className="dark:bg-gray-900 dark:border-gray-700 dark:text-white" /></div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Passo 3: Dados do Beneficiário</h2>
                <div className="space-y-3">
                  <div><Label className="text-gray-900 dark:text-gray-100">Nome da Criança/Adulto com Autismo *</Label><Input value={formData.beneficiaryName} onChange={(e) => setFormData(prev => ({ ...prev, beneficiaryName: e.target.value }))} className="dark:bg-gray-900 dark:border-gray-700 dark:text-white" /></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><Label className="text-gray-900 dark:text-gray-100">CPF *</Label><Input value={formData.beneficiaryCPF} onChange={(e) => setFormData(prev => ({ ...prev, beneficiaryCPF: e.target.value }))} className="dark:bg-gray-900 dark:border-gray-700 dark:text-white" /></div>
                    <div><Label className="text-gray-900 dark:text-gray-100">RG *</Label><Input value={formData.beneficiaryRG} onChange={(e) => setFormData(prev => ({ ...prev, beneficiaryRG: e.target.value }))} className="dark:bg-gray-900 dark:border-gray-700 dark:text-white" /></div>
                  </div>
                  <div><Label className="text-gray-900 dark:text-gray-100">Idade *</Label><Input type="number" value={formData.beneficiaryAge} onChange={(e) => setFormData(prev => ({ ...prev, beneficiaryAge: e.target.value }))} className="dark:bg-gray-900 dark:border-gray-700 dark:text-white" /></div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Passo 4: Composição Familiar / Renda</h2>
                <div className="space-y-3">
                  <div><Label className="text-gray-900 dark:text-gray-100">Renda Mensal da Família (R$) *</Label><Input type="number" value={formData.monthlyIncome} onChange={(e) => setFormData(prev => ({ ...prev, monthlyIncome: e.target.value }))} className="dark:bg-gray-900 dark:border-gray-700 dark:text-white" /></div>
                  <div><Label className="text-gray-900 dark:text-gray-100">Número de Dependentes *</Label><Input type="number" value={formData.dependents} onChange={(e) => setFormData(prev => ({ ...prev, dependents: e.target.value }))} className="dark:bg-gray-900 dark:border-gray-700 dark:text-white" /></div>
                  <div><Label className="text-gray-900 dark:text-gray-100">Composição Familiar *</Label><Textarea value={formData.familyComposition} onChange={(e) => setFormData(prev => ({ ...prev, familyComposition: e.target.value }))} rows={3} className="dark:bg-gray-900 dark:border-gray-700 dark:text-white" /></div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Passo 5: Anexar Documentos</h2>
                <div className="space-y-3">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                    <Upload className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                    <Label htmlFor="file-upload" className="cursor-pointer text-gray-900 dark:text-gray-100">
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

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline" onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))} disabled={currentStep === 1} className="gap-2 dark:border-gray-600 w-full sm:w-auto">
                <ChevronLeft className="h-4 w-4" /> Anterior
              </Button>
              {currentStep < 6 ? (
                <Button onClick={() => setCurrentStep(prev => Math.min(6, prev + 1))} className="gap-2 bg-theo-purple dark:bg-purple-700 hover:bg-theo-purple-dark dark:hover:bg-purple-800 w-full sm:w-auto">
                  Próximo <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={() => setIsConfirming(true)} disabled={isSubmitting} className="gap-2 bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-800 w-full sm:w-auto">
                  {isSubmitting ? "Enviando..." : "Enviar Solicitação"}
                </Button>
              )}
            </div>
          </Card>

          <Dialog open={isConfirming} onOpenChange={setIsConfirming}>
            <DialogContent className="sm:max-w-[525px] dark:bg-gray-800 dark:border-gray-700 mx-4">
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-white text-lg">Confirmar Envio da Solicitação</DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400 text-sm">
                  Sua solicitação será enviada para a <strong className="text-gray-900 dark:text-white">Defensoria Pública</strong> para análise.
                  Revise as informações abaixo antes de confirmar.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4 text-sm">
                <div className="space-y-1">
                  <p className="text-gray-900 dark:text-gray-100 text-sm break-words"><strong>Para:</strong> {RECIPIENT_EMAIL}</p>
                  <p className="text-gray-900 dark:text-gray-100 text-sm break-words"><strong>Assunto:</strong> Solicitação de Apoio Jurídico - {BENEFIT_TYPES.find(b => b.id === formData.benefitType)?.name}</p>
                </div>
                <div className="max-h-60 overflow-y-auto rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 whitespace-pre-wrap text-gray-700 dark:text-gray-300 text-xs">
                  <h4 className="font-semibold mb-2 text-sm">Visualização do E-mail</h4>
                  <p className="text-xs">{emailBody}</p>
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setIsConfirming(false)} className="dark:border-gray-600 w-full sm:w-auto">Cancelar</Button>
                <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2 bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-800 w-full sm:w-auto">
                  {isSubmitting ? "Enviando..." : (<> <Send className="h-4 w-4" /> Confirmar e Enviar </>)}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
