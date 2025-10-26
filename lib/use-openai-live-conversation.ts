"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useAudioRecorder } from "./use-audio-recorder"

export type ConversationState = "idle" | "listening" | "processing" | "speaking"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface UseOpenAILiveConversationProps {
  captureVideoFrame: () => string | null
}

interface UseOpenAILiveConversationReturn {
  conversationState: ConversationState
  messages: Message[]
  recordingTime: number
  isTalking: boolean
  startListening: () => Promise<void>
  stopListening: () => Promise<void>
  cancelListening: () => void
  error: string | null
}

export function useOpenAILiveConversation({
  captureVideoFrame,
}: UseOpenAILiveConversationProps): UseOpenAILiveConversationReturn {
  const [conversationState, setConversationState] = useState<ConversationState>("idle")
  const [messages, setMessages] = useState<Message[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isTalking, setIsTalking] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const videoFramesRef = useRef<string[]>([])
  const frameIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  const {
    recordingState,
    recordingTime,
    startRecording,
    stopRecording,
    cancelRecording,
    resetState,
  } = useAudioRecorder()

  // Limpar erro automaticamente após 5 segundos
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const startListening = useCallback(async () => {
    try {
      setError(null)
      setConversationState("listening")
      videoFramesRef.current = []
      
      // Iniciar gravação de áudio
      await startRecording()
      
      // Iniciar captura de frames de vídeo (2 frames por segundo para real-time)
      frameIntervalRef.current = setInterval(() => {
        const frame = captureVideoFrame()
        if (frame) {
          videoFramesRef.current.push(frame)
          // Manter apenas últimos 6 frames (3 segundos de contexto)
          if (videoFramesRef.current.length > 6) {
            videoFramesRef.current.shift()
          }
        }
      }, 500) // Captura 2 frames/segundo para melhor real-time
      
    } catch (err) {
      console.error("Erro ao iniciar gravação:", err)
      setError("Não foi possível acessar o microfone")
      setConversationState("idle")
    }
  }, [startRecording, captureVideoFrame])

  const stopListening = useCallback(async () => {
    try {
      // Parar captura de frames
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current)
        frameIntervalRef.current = null
      }

      const audioBlob = await stopRecording()
      const videoFrames = videoFramesRef.current
      
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

      if (!transcribeData.success || !transcribeData.data?.transcription) {
        // Mensagens de erro mais amigáveis
        if (transcribeData.error?.includes("muito curto")) {
          throw new Error("⏱️ Áudio muito curto! Fale por mais tempo.")
        } else if (transcribeData.error?.includes("Audio file is too short")) {
          throw new Error("⏱️ Áudio muito curto! Fale por mais tempo (mínimo 0.1s).")
        } else if (transcribeData.error?.includes("temporariamente indisponível")) {
          throw new Error("🔄 Serviço de transcrição temporariamente indisponível. Tente novamente!")
        } else if (transcribeData.error?.includes("Invalid file format")) {
          throw new Error("🎤 Erro no formato do áudio. Tente gravar novamente!")
        } else {
          throw new Error(`❌ ${transcribeData.error || "Não consegui entender o áudio. Tente falar mais claramente!"}`)
        }
      }

      const userMessage = transcribeData.data.transcription.trim()
      
      // Validar se a transcrição não está vazia
      if (!userMessage || userMessage.length < 2) {
        throw new Error("🎤 Não consegui ouvir nada. Fale mais alto ou mais perto do microfone!")
      }

      // Adicionar mensagem do usuário
      setMessages((prev) => [
        ...prev,
        { role: "user", content: userMessage, timestamp: new Date() },
      ])

      // 2. Enviar para OpenAI Multimodal (áudio transcrito + frames de vídeo)
      let assistantMessage = ""
      
      // Usar OpenAI Vision (GPT-4o) para análise multimodal
      const openaiResponse = await fetch("/api/openai-multimodal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: userMessage,
          images: videoFrames.slice(-4), // Enviar últimos 4 frames para melhor contexto real-time
        }),
      })

      if (openaiResponse.ok) {
        const openaiData = await openaiResponse.json()
        if (openaiData.success && openaiData.response) {
          assistantMessage = openaiData.response
        }
      }
      
      // Fallback: usar API de chat normal se OpenAI Multimodal falhar
      if (!assistantMessage) {
        console.warn("OpenAI Multimodal indisponível, usando chat normal como fallback")
        
        const chatResponse = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userMessage,
            history: messages.map(msg => ({
              role: msg.role,
              content: msg.content,
            })),
          }),
        })

        if (!chatResponse.ok) {
          throw new Error("Erro ao processar resposta")
        }

        const chatData = await chatResponse.json()
        assistantMessage = chatData.message || chatData.response || ""
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
      
      // Limpar interval se ainda estiver rodando
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current)
        frameIntervalRef.current = null
      }
    }
  }, [stopRecording, resetState, captureVideoFrame])

  const cancelListening = useCallback(() => {
    cancelRecording()
    setConversationState("idle")
    setError(null)
    
    // Limpar captura de frames
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current)
      frameIntervalRef.current = null
    }
    videoFramesRef.current = []
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

