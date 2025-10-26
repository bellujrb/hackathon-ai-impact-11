"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Send, X } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import ReactMarkdown from 'react-markdown'

interface MarkdownComponentProps {
  children: React.ReactNode
}
import type { BenefitRequest } from "@/app/page"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
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
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userInput, lastAssistant: lastAssistant ? lastAssistant.content : null, previousInteractionType: lastAssistantType }),
      })

      const data = await response.json()

      // store the type returned by the API so next turn can be explicit about the interaction
      if (data && data.type) {
        setLastAssistantType(data.type)
      } else {
        setLastAssistantType(null)
      }

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

  const handleQuickAction = (type: BenefitRequest["type"], name: string, question: string) => {
    setInput(question)
    setTimeout(() => handleSend(), 100)
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-4">
        <SidebarTrigger />
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-4">
            <h1 className="mb-4 text-center text-4xl font-bold text-gray-900 text-balance">
              Como posso te ajudar a acessar benefícios?
            </h1>
            <p className="mb-12 max-w-2xl text-center text-gray-600 leading-relaxed">
              Pergunte sobre qualquer benefício e vou criar um checklist detalhado com todas as etapas que você precisa
              seguir.
            </p>
            <div className="grid gap-4 sm:grid-cols-3 max-w-3xl w-full">
              <Card
                className="cursor-pointer border-gray-200 p-5 transition-all hover:border-gray-900 hover:shadow-md"
                onClick={() => handleQuickAction("bpc", "BPC/LOAS", "Quero solicitar o BPC/LOAS para meu filho")}
              >
                <h3 className="text-base font-semibold text-gray-900 mb-1">BPC/LOAS</h3>
                <p className="text-xs text-gray-600">Benefício de Prestação Continuada</p>
              </Card>
              <Card
                className="cursor-pointer border-gray-200 p-5 transition-all hover:border-gray-900 hover:shadow-md"
                onClick={() =>
                  handleQuickAction("passe-livre", "Passe Livre", "Como solicitar o passe livre intermunicipal?")
                }
              >
                <h3 className="text-base font-semibold text-gray-900 mb-1">Passe Livre</h3>
                <p className="text-xs text-gray-600">Transporte gratuito</p>
              </Card>
              <Card
                className="cursor-pointer border-gray-200 p-5 transition-all hover:border-gray-900 hover:shadow-md"
                onClick={() =>
                  handleQuickAction("isencao-ipva", "Isenção de IPVA", "Quero isenção de IPVA para pessoa autista")
                }
              >
                <h3 className="text-base font-semibold text-gray-900 mb-1">Isenção IPVA</h3>
                <p className="text-xs text-gray-600">Isenção de impostos</p>
              </Card>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <Card
                  className={`max-w-[85%] p-4 ${
                    message.role === "user" ? "bg-gray-900 text-white border-0" : "border-gray-200 bg-white"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <div className="text-sm leading-relaxed text-gray-900 prose prose-sm max-w-none">
                      {message.content ? (
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      ) : (
                        <div className="flex items-center gap-2 py-2">
                          <div className="h-2 w-2 animate-pulse rounded-full bg-gray-400"></div>
                          <div className="h-2 w-2 animate-pulse rounded-full bg-gray-400" style={{ animationDelay: '0.2s' }}></div>
                          <div className="h-2 w-2 animate-pulse rounded-full bg-gray-400" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-line text-white">
                      {message.content}
                    </p>
                  )}
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 p-6">
        <div className="mx-auto max-w-3xl">
          {askingAboutBenefit && (
            <div className="mb-3 flex items-center justify-between rounded-lg bg-gray-100 px-4 py-2 text-sm">
              <span className="text-gray-700">
                Perguntando sobre: <span className="font-semibold">{askingAboutBenefit.name}</span>
              </span>
              <Button variant="ghost" size="sm" onClick={onClearAskingAbout} className="h-6 w-6 p-0 hover:bg-gray-200">
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          <div className="flex gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="Ex: Quero solicitar o BPC/LOAS para meu filho"
              className="min-h-[60px] resize-none border-gray-300 focus:border-gray-900 focus:ring-gray-900"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim()}
              className="h-[60px] bg-gray-900 px-6 hover:bg-gray-800"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
