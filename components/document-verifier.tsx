"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileText, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { SidebarTrigger } from "@/components/ui/sidebar"
import ReportGenerator from "@/components/report-generator"

export function DocumentVerifier() {
  const [file, setFile] = useState<File | null>(null)
  const [benefitType, setBenefitType] = useState("")
  const [documentType, setDocumentType] = useState("")
  const [expectedItems, setExpectedItems] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("/api/process-pdf", {
      method: "POST",
      body: formData,
    })

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || "Erro ao processar PDF")
    }

    return data.data.text
  }

  const handleSubmit = async () => {
    if (!file) {
      setError("Por favor, selecione um arquivo")
      return
    }

    setIsProcessing(true)
    setError(null)
    setResult(null)

    try {
      // Extrair texto do PDF (simulado para MVP)
      const extractedText = await extractTextFromPDF(file)

      // Chamar API para validar
      const response = await fetch("/api/verify-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: extractedText,
          benefitType,
          documentType,
          expectedItems,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.data)
      } else {
        setError(data.error || "Erro ao verificar documento")
      }
    } catch (err) {
      setError("Erro ao processar documento. Tente novamente.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex h-full flex-col bg-white dark:bg-gray-950">
      <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-800 px-4 md:px-6 py-4">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Verificador de Documentos</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Formulário */}
          <Card className="p-6 bg-white dark:bg-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upload e Validação</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="file" className="text-gray-900 dark:text-gray-100">Documento (PDF)</Label>
                <div className="mt-2 flex items-center gap-3">
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    disabled={isProcessing}
                    className="flex-1 dark:bg-gray-900 dark:border-gray-700"
                  />
                  {file && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <FileText className="h-4 w-4" />
                      <span>{file.name}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="benefitType" className="text-gray-900 dark:text-gray-100">Tipo de Benefício</Label>
                <Textarea
                  id="benefitType"
                  value={benefitType}
                  onChange={(e) => setBenefitType(e.target.value)}
                  placeholder="Ex: BPC/LOAS, Professor de Apoio, etc."
                  disabled={isProcessing}
                  className="mt-2 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="documentType" className="text-gray-900 dark:text-gray-100">Tipo de Documento</Label>
                <Input
                  id="documentType"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  placeholder="Ex: Laudo médico, Comprovante de renda, etc."
                  disabled={isProcessing}
                  className="mt-2 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                />
              </div>

              <div>
                <Label htmlFor="expectedItems" className="text-gray-900 dark:text-gray-100">Itens Esperados no Documento</Label>
                <Textarea
                  id="expectedItems"
                  value={expectedItems}
                  onChange={(e) => setExpectedItems(e.target.value)}
                  placeholder="Ex: CID F84.0, Idade da criança, Limitações descritas, etc."
                  disabled={isProcessing}
                  className="mt-2 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                  rows={3}
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!file || isProcessing}
                className="w-full gap-2 bg-theo-purple dark:bg-purple-600 hover:bg-theo-purple-dark dark:hover:bg-purple-700 text-white font-medium"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Verificar Documento
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Erro */}
          {error && (
            <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-900 dark:text-red-200">{error}</p>
              </div>
            </Card>
          )}

          {/* Resultado */}
          {result && (
            <Card className={`p-6 ${result.isValid ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20" : "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20"}`}>
              <div className="flex items-start gap-3 mb-4">
                {result.isValid ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {result.isValid ? "Documento Válido ✓" : "Documento Incompleto ⚠️"}
                  </h3>
                  
                  {/* Análise */}
                  <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown>{result.analysis}</ReactMarkdown>
                    </div>
                  </div>

                  {/* Itens Faltando */}
                  {result.missingItems && result.missingItems.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Itens Faltando:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                        {result.missingItems.map((item: string, index: number) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Sugestões */}
                  {result.suggestions && result.suggestions.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Sugestões:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                        {result.suggestions.map((suggestion: string, index: number) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Gerador de Relatórios */}
          <ReportGenerator />
        </div>
      </div>
    </div>
  )
}
