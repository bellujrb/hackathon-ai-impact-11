"use client"

import { useState, useRef, useCallback } from "react"

export type RecordingState = "idle" | "recording" | "processing" | "error"

interface UseAudioRecorderReturn {
  recordingState: RecordingState
  recordingTime: number
  startRecording: () => Promise<void>
  stopRecording: () => Promise<Blob | null>
  cancelRecording: () => void
  resetState: () => void
  error: string | null
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle")
  const [recordingTime, setRecordingTime] = useState(0)
  const [error, setError] = useState<string | null>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = useCallback(async () => {
    try {
      setError(null)
      
      // Solicitar permissão de microfone
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000, // Otimizado para speech-to-text
        } 
      })

      // Criar MediaRecorder com formato compatível
      // Tentar usar formatos em ordem de preferência para melhor compatibilidade com Whisper
      let mimeType = 'audio/webm' // fallback
      
      if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4'
      } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus'
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm'
      }
      
      console.log('Using audio format:', mimeType)
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      // Event listeners
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onerror = () => {
        setError("Erro ao gravar áudio")
        setRecordingState("error")
      }

      // Iniciar gravação
      mediaRecorder.start(100) // Capturar a cada 100ms
      setRecordingState("recording")
      setRecordingTime(0)

      // Timer para mostrar tempo de gravação
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)

    } catch (err) {
      console.error("Erro ao acessar microfone:", err)
      if (err instanceof Error && err.name === "NotAllowedError") {
        setError("Permissão de microfone negada. Por favor, permita o acesso ao microfone.")
      } else {
        setError("Erro ao acessar microfone. Verifique se está conectado.")
      }
      setRecordingState("error")
    }
  }, [])

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current
      
      if (!mediaRecorder || mediaRecorder.state === "inactive") {
        resolve(null)
        return
      }

      mediaRecorder.onstop = () => {
        // Criar blob do áudio
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: mediaRecorder.mimeType 
        })
        
        // Limpar recursos
        mediaRecorder.stream.getTracks().forEach(track => track.stop())
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
        
        setRecordingState("processing")
        resolve(audioBlob)
      }

      mediaRecorder.stop()
    })
  }, [])

  const cancelRecording = useCallback(() => {
    const mediaRecorder = mediaRecorderRef.current
    
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop()
      mediaRecorder.stream.getTracks().forEach(track => track.stop())
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    
    audioChunksRef.current = []
    setRecordingState("idle")
    setRecordingTime(0)
    setError(null)
  }, [])

  const resetState = useCallback(() => {
    setRecordingState("idle")
    setRecordingTime(0)
    setError(null)
  }, [])

  return {
    recordingState,
    recordingTime,
    startRecording,
    stopRecording,
    cancelRecording,
    resetState,
    error,
  }
}

