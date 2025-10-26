"use client"

import { useState, useRef, useCallback, useEffect } from "react"

interface UseWebcamStreamReturn {
  videoRef: React.RefObject<HTMLVideoElement>
  isStreaming: boolean
  error: string | null
  startStream: () => Promise<void>
  stopStream: () => void
  captureFrame: () => string | null
}

export function useWebcamStream(): UseWebcamStreamReturn {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startStream = useCallback(async () => {
    try {
      setError(null)
      
      // Solicitar permissão para câmera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: false, // Áudio já é capturado pelo useAudioRecorder
      })

      streamRef.current = stream

      // Conectar stream ao elemento de vídeo
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      setIsStreaming(true)
    } catch (err) {
      console.error("Erro ao acessar webcam:", err)
      if (err instanceof Error && err.name === "NotAllowedError") {
        setError("Permissão de câmera negada. Por favor, permita o acesso à câmera.")
      } else if (err instanceof Error && err.name === "NotFoundError") {
        setError("Nenhuma câmera encontrada no dispositivo.")
      } else {
        setError("Erro ao acessar câmera. Verifique se está conectada.")
      }
      setIsStreaming(false)
    }
  }, [])

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsStreaming(false)
  }, [])

  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current || !isStreaming) {
      return null
    }

    try {
      // Criar canvas para capturar frame
      const canvas = document.createElement("canvas")
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight

      const ctx = canvas.getContext("2d")
      if (!ctx) return null

      // Desenhar frame atual do vídeo
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)

      // Converter para base64 (JPEG para menor tamanho)
      return canvas.toDataURL("image/jpeg", 0.7)
    } catch (err) {
      console.error("Erro ao capturar frame:", err)
      return null
    }
  }, [isStreaming])

  // Limpar stream ao desmontar
  useEffect(() => {
    return () => {
      stopStream()
    }
  }, [stopStream])

  return {
    videoRef,
    isStreaming,
    error,
    startStream,
    stopStream,
    captureFrame,
  }
}

