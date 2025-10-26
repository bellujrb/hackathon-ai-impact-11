"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Send, X, Scale, FileText, School, DollarSign } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import ReactMarkdown from 'react-markdown'
import { TheoAvatar } from "@/components/theo-avatar"
import { SuggestionCard } from "@/components/suggestion-card"
import { AudioRecorderButton } from "@/components/audio-recorder-button"
import { motion } from "framer-motion"
import { Toaster } from "@/components/ui/sonner"

interface MarkdownComponentProps {
  children: React.ReactNode
}
import type { BenefitRequest } from "@/app/page"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  meta?: {
    pdfContent?: string
    pdfBase64?: string
    title?: string
    filename?: string
  }
}

interface ChecklistItem {
  id: string
  title: string
  description: string
  details: string
  completed: boolean
}

interface ChatInterfaceProps {
  onCreateBenefitRequest: (type: BenefitRequest["type"], name: string, checklist?: ChecklistItem[]) => void
  askingAboutBenefit: BenefitRequest | null
  onClearAskingAbout: () => void
  onSetInput?: (text: string) => void // Callback para que outros componentes possam definir o input
}

export function ChatInterface({ onCreateBenefitRequest, askingAboutBenefit, onClearAskingAbout, onSetInput }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [lastAssistantType, setLastAssistantType] = useState<string | null>(null)
  const [awaitingReportTarget, setAwaitingReportTarget] = useState(false)

  // Listener para eventos de setChatInput de outros componentes
  useEffect(() => {
    const handleSetChatInput = (event: Event) => {
      const customEvent = event as CustomEvent<string>
      if (customEvent.detail) {
        setInput(customEvent.detail)
        if (onSetInput) {
          onSetInput(customEvent.detail)
        }
      }
    }

    window.addEventListener('setChatInput', handleSetChatInput as EventListener)
    return () => {
      window.removeEventListener('setChatInput', handleSetChatInput as EventListener)
    }
  }, [onSetInput])

  useEffect(() => {
    if (askingAboutBenefit) {
      setInput(`Tenho uma dúvida sobre o ${askingAboutBenefit.name}. `)
    }
  }, [askingAboutBenefit])

  const handleSend = async () => {
    if (!input.trim()) return

    const userInput = input.trim()
    setInput("")
    setIsLoading(true)
    
    if (askingAboutBenefit) {
      onClearAskingAbout()
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userInput,
    }

    setMessages([...messages, newMessage])

    // Criar mensagem de streaming
    const assistantMessageId = (Date.now() + 1).toString()
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
    }
    setMessages((prev) => [...prev, assistantMessage])

    try {
      // Chamar API para processar com LangGraph/Gemini
      // send also the last assistant message content as context so the server can handle multi-turn flows
      const lastAssistant = messages.slice().reverse().find(m => m.role === 'assistant')
      const inputLower = userInput.toLowerCase()
      const isUserAskingReport = inputLower.includes('relat') || inputLower.includes('relatorio') || inputLower.includes('laudo')

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userInput,
          lastAssistant: lastAssistant ? lastAssistant.content : null,
          // ensure we send an explicit previousInteractionType when available
          // if the user message itself contains report keywords, force-report to avoid ambiguity
          previousInteractionType: isUserAskingReport ? 'force-report' : (lastAssistantType || (awaitingReportTarget ? 'ask-report-target' : null)),
        }),
      })

      const data = await response.json()

      // store the type returned by the API so next turn can be explicit about the interaction
      if (data && data.type) {
        setLastAssistantType(data.type)
        // If server asked for report target, mark awaitingReportTarget so the next user reply is treated as target
        if (data.type === 'ask-report-target') {
          setAwaitingReportTarget(true)
        } else {
          setAwaitingReportTarget(false)
        }
      } else {
        setLastAssistantType(null)
        setAwaitingReportTarget(false)
      }

      // After sending this user message, we've consumed any awaiting flag
      setAwaitingReportTarget(false)

      const simulateStreaming = async (fullText: string) => {
        let currentText = ""
        for (let i = 0; i < fullText.length; i++) {
          currentText += fullText[i]
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId ? { ...msg, content: currentText } : msg
            )
          )
          await new Promise((resolve) => setTimeout(resolve, 15))
        }
      }

      await simulateStreaming(data.response)

      // If server returned a generated report (text) or a PDF, attach metadata so UI can offer PDF download
      if (data.type === 'report-generated' || data.type === 'report-pdf') {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content: data.response || data.response || '',
                  meta: {
                    // PDF may come as base64 (report-pdf) or as text-only (report-generated)
                    pdfBase64: data.pdfBase64,
                    pdfContent: data.response, // fallback to text for legacy flow
                    title: data.title || `Relatório`,
                    filename: `${(data.title || 'relatorio').replace(/[^a-z0-9\-\_]/gi, '_')}.pdf`,
                  },
                }
              : msg
          )
        )
      }

      if (data.benefitType && data.checklist) {
        onCreateBenefitRequest(data.benefitType, data.benefitName, data.checklist.items)
      }
      
      setIsLoading(false)
    } catch (error) {
      console.error("Error sending message:", error)
      
      // Remover mensagem de streaming
      setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId))

      // Mensagem de erro
      const errorMessage: Message = {
        id: (Date.now() + 3).toString(),
        role: "assistant",
        content: "Desculpe, ocorreu um erro. Tente novamente.",
      }
      setMessages((prev) => [...prev, errorMessage])
      setIsLoading(false)
    }
  }

  const downloadPdfFromText = async (text: string, title?: string, filename?: string) => {
    try {
      const res = await fetch('/api/generate-report-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title || 'Relatório', content: text, filename }),
      })

      if (!res.ok) {
        alert('Não foi possível gerar o PDF. Tente novamente.')
        return
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename || 'relatorio.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Erro ao baixar PDF', err)
      alert('Erro ao gerar PDF')
    }
  }

  const downloadPdfFromBase64 = async (base64: string, filename?: string) => {
    try {
      const byteCharacters = atob(base64)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename || 'relatorio.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Erro ao baixar PDF (base64)', err)
      alert('Erro ao gerar PDF')
    }
  }

  const handleQuickAction = (type: BenefitRequest["type"], name: string, question: string) => {
    setInput(question)
    setTimeout(() => handleSend(), 100)
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className="flex h-full flex-col bg-white">
        <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-4">
          <SidebarTrigger />
        </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-theo-lavanda-light">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-4 py-12">
            {/* Avatar do Theo */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="mb-6"
            >
              <TheoAvatar state="happy" size="xl" />
            </motion.div>

            {/* Boas-vindas */}
            <motion.h1
              className="mb-3 text-center text-4xl font-bold text-gray-900 text-balance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Olá! Sou o Theo.
            </motion.h1>
            <motion.p
              className="mb-12 max-w-2xl text-center text-lg text-gray-600 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Como posso te ajudar a acessar os direitos do seu filho hoje?
            </motion.p>

            {/* Suggestion Cards */}
            <div className="grid gap-4 sm:grid-cols-2 max-w-3xl w-full">
              <SuggestionCard
                icon={Scale}
                text="Quais são meus direitos?"
                onClick={() => handleQuickAction("outros", "Direitos", "Quais são os direitos do meu filho autista?")}
                delay={0.4}
                iconColor="text-theo-purple"
              />
              <SuggestionCard
                icon={FileText}
                text="Como gerar a Ficha Theo?"
                onClick={() => handleQuickAction("outros", "Ficha Theo", "Como funciona a Ficha Theo? Pode me explicar?")}
                delay={0.5}
                iconColor="text-theo-coral"
              />
              <SuggestionCard
                icon={School}
                text="O que é educação inclusiva (AEE)?"
                onClick={() => handleQuickAction("apoio-educacional", "AEE", "Quero saber sobre Atendimento Educacional Especializado (AEE)")}
                delay={0.6}
                iconColor="text-theo-mint"
              />
              <SuggestionCard
                icon={DollarSign}
                text="Quero solicitar o BPC"
                onClick={() => handleQuickAction("bpc", "BPC/LOAS", "Quero solicitar o BPC/LOAS para meu filho")}
                delay={0.7}
                iconColor="text-theo-yellow"
              />
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-6">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Avatar do Theo para mensagens do assistente */}
                {message.role === "assistant" && (
                  <div className="flex-shrink-0">
                    <TheoAvatar state={message.content ? "idle" : "talking"} size="sm" />
                  </div>
                )}

                <Card
                  className={`max-w-[85%] p-4 ${
                    message.role === "user"
                      ? "bg-theo-purple text-white border-0 rounded-2xl shadow-theo"
                      : "border-theo-lavanda bg-white rounded-2xl shadow-theo"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <div className="text-sm leading-relaxed text-gray-900 prose prose-sm max-w-none">
                      {message.content ? (
                        <>
                          <ReactMarkdown>{message.content}</ReactMarkdown>

                          {/* If assistant provided PDF metadata, show download button */}
                          {(message.meta?.pdfContent || message.meta?.pdfBase64) && (
                            <div className="mt-3">
                              <button
                                onClick={() => {
                                  if (message.meta?.pdfBase64) {
                                    downloadPdfFromBase64(message.meta.pdfBase64, message.meta.filename)
                                  } else if (message.meta?.pdfContent) {
                                    downloadPdfFromText(message.meta.pdfContent, message.meta.title, message.meta.filename)
                                  }
                                }}
                                className="inline-flex items-center rounded-xl bg-theo-purple hover:bg-theo-purple-dark text-white px-4 py-2 text-sm font-medium transition-all"
                              >
                                Baixar PDF
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center gap-2 py-2">
                          <span className="text-gray-500 text-sm">Theo está pensando</span>
                          <div className="flex gap-1">
                            <motion.div
                              className="h-2 w-2 rounded-full bg-theo-purple"
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                            />
                            <motion.div
                              className="h-2 w-2 rounded-full bg-theo-purple"
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                            />
                            <motion.div
                              className="h-2 w-2 rounded-full bg-theo-purple"
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-line text-white">
                      {message.content}
                    </p>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-theo-lavanda bg-white p-6">
        <div className="mx-auto max-w-3xl">
          {askingAboutBenefit && (
            <motion.div
              className="mb-3 flex items-center justify-between rounded-xl bg-theo-lavanda px-4 py-3 text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="text-gray-700">
                Perguntando sobre: <span className="font-semibold text-theo-purple">{askingAboutBenefit.name}</span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAskingAbout}
                className="h-6 w-6 p-0 hover:bg-theo-lavanda-light"
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
          <div className="flex gap-3 relative">
            <div className="relative flex-1">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Digite sua pergunta ou pressione o microfone..."
                className="min-h-[60px] resize-none border-2 border-theo-lavanda rounded-2xl focus:border-theo-purple focus:ring-2 focus:ring-theo-purple/20 pr-12 transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <AudioRecorderButton
                  onTranscription={(text) => {
                    setInput(text)
                    // Focar no textarea após transcrição
                    setTimeout(() => {
                      const textarea = document.querySelector('textarea')
                      textarea?.focus()
                    }, 100)
                  }}
                />
              </div>
            </div>
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="h-[60px] px-6 bg-theo-purple hover:bg-theo-purple-dark text-white rounded-2xl shadow-theo transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}
