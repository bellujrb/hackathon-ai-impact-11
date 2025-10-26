"use client"

import { useState, useRef, useCallback } from "react"
import { useAudioRecorder } from "./use-audio-recorder"

export type ConversationState = "idle" | "listening" | "processing" | "speaking"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface UseGeminiLiveConversationProps {
  captureVideoFrame: () => string | null
}

interface UseGeminiLiveConversationReturn {
  conversationState: ConversationState
  messages: Message[]
  recordingTime: number
  isTalking: boolean
  startListening: () => Promise<void>
  stopListening: () => Promise<void>
  cancelListening: () => void
  error: string | null
}

export function useGeminiLiveConversation({
  captureVideoFrame,
}: UseGeminiLiveConversationProps): UseGeminiLiveConversationReturn {
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

  const startListening = useCallback(async () => {
    try {
      setError(null)
      setConversationState("listening")
      videoFramesRef.current = []
      
      // Iniciar gravação de áudio
      await startRecording()
      
      // Iniciar captura de frames de vídeo (1 frame por segundo)
      frameIntervalRef.current = setInterval(() => {
        const frame = captureVideoFrame()
        if (frame) {
          videoFramesRef.current.push(frame)
        }
      }, 1000) // Captura 1 frame/segundo para reduzir dados
      
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

      if (!transcribeData.success || !transcribeData.data.transcription) {
        throw new Error(transcribeData.error || "Erro ao transcrever áudio")
      }

      const userMessage = transcribeData.data.transcription

      // Adicionar mensagem do usuário
      setMessages((prev) => [
        ...prev,
        { role: "user", content: userMessage, timestamp: new Date() },
      ])

      // 2. Enviar para Gemini Multimodal (áudio transcrito + frames de vídeo)
      const geminiResponse = await fetch("/api/gemini-multimodal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: userMessage,
          images: videoFrames.slice(-3), // Enviar últimos 3 frames como contexto
        }),
      })

      if (!geminiResponse.ok) {
        throw new Error("Erro ao processar com Gemini")
      }

      const geminiData = await geminiResponse.json()
      const assistantMessage = geminiData.response

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

