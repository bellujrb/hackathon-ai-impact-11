"use client"

import { useState, useRef, useCallback } from "react"
import { useAudioRecorder } from "./use-audio-recorder"

export type ConversationState = "idle" | "listening" | "processing" | "speaking"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface UseVoiceConversationReturn {
  conversationState: ConversationState
  messages: Message[]
  recordingTime: number
  isTalking: boolean
  startListening: () => Promise<void>
  stopListening: () => Promise<void>
  cancelListening: () => void
  error: string | null
}

export function useVoiceConversation(): UseVoiceConversationReturn {
  const [conversationState, setConversationState] = useState<ConversationState>("idle")
  const [messages, setMessages] = useState<Message[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isTalking, setIsTalking] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const {
    recordingState,
    recordingTime,
    startRecording,
    stopRecording,
    cancelRecording,
    resetState,
  } = useAudioRecorder()

  const startListening = useCallback(async () => {
    try {
      setError(null)
      setConversationState("listening")
      await startRecording()
    } catch (err) {
      console.error("Erro ao iniciar gravação:", err)
      setError("Não foi possível acessar o microfone")
      setConversationState("idle")
    }
  }, [startRecording])

  const stopListening = useCallback(async () => {
    try {
      const audioBlob = await stopRecording()
      
      if (!audioBlob) {
        setConversationState("idle")
        resetState()
        return
      }

      setConversationState("processing")

      // 1. Transcrever áudio do usuário
      const formData = new FormData()
      formData.append("audio", audioBlob, "recording.webm")

      const transcribeResponse = await fetch("/api/transcribe-audio", {
        method: "POST",
        body: formData,
      })

      const transcribeData = await transcribeResponse.json()

      if (!transcribeData.success || !transcribeData.data.transcription) {
        throw new Error(transcribeData.error || "Erro ao transcrever áudio")
      }

      const userMessage = transcribeData.data.transcription

      // Adicionar mensagem do usuário
      setMessages((prev) => [
        ...prev,
        { role: "user", content: userMessage, timestamp: new Date() },
      ])

      // 2. Enviar para o chat (Theo processar)
      const chatResponse = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "user", content: userMessage },
          ],
        }),
      })

      if (!chatResponse.ok) {
        throw new Error("Erro ao processar pergunta")
      }

      const reader = chatResponse.body?.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ""

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value)
          const lines = chunk.split("\n")
          
          for (const line of lines) {
            if (line.startsWith("0:")) {
              const content = line.slice(2)
              assistantMessage += content
            }
          }
        }
      }

      if (!assistantMessage) {
        throw new Error("Theo não respondeu")
      }

      // Adicionar mensagem do assistente
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: assistantMessage, timestamp: new Date() },
      ])

      // 3. Gerar áudio da resposta (TTS)
      setConversationState("speaking")
      
      const ttsResponse = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: assistantMessage }),
      })

      const ttsData = await ttsResponse.json()

      if (!ttsData.success) {
        // Se TTS falhar, apenas voltar ao idle
        console.warn("TTS indisponível, mas mensagem foi processada")
        setConversationState("idle")
        resetState()
        return
      }

      // 4. Reproduzir áudio
      const audioBlob2 = new Blob(
        [Uint8Array.from(atob(ttsData.data.audio), (c) => c.charCodeAt(0))],
        { type: "audio/mpeg" }
      )
      const audioUrl = URL.createObjectURL(audioBlob2)

      const audio = new Audio(audioUrl)
      audioRef.current = audio

      audio.onplay = () => {
        setIsTalking(true)
      }

      audio.onended = () => {
        setIsTalking(false)
        setConversationState("idle")
        resetState()
        URL.revokeObjectURL(audioUrl)
      }

      audio.onerror = () => {
        setIsTalking(false)
        setConversationState("idle")
        resetState()
        URL.revokeObjectURL(audioUrl)
      }

      await audio.play()

    } catch (err) {
      console.error("Erro na conversação:", err)
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      setConversationState("idle")
      resetState()
    }
  }, [stopRecording, resetState])

  const cancelListening = useCallback(() => {
    cancelRecording()
    setConversationState("idle")
    setError(null)
  }, [cancelRecording])

  return {
    conversationState,
    messages,
    recordingTime,
    isTalking,
    startListening,
    stopListening,
    cancelListening,
    error,
  }
}

