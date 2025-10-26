"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { TheoAvatar } from "@/components/theo-avatar"
import { X, HeadphonesIcon, FileText, Upload, Sparkles } from "lucide-react"

interface OnboardingProps {
  onComplete: () => void
  onSkip: () => void
}

const steps = [
  {
    title: "Olá! Sou o Theo 👋",
    description: "Seu companheiro digital para acessar os direitos do seu filho.",
    longText: "Estou aqui para tornar sua jornada mais simples e acolhedora. Vamos juntos descobrir todos os benefícios e direitos que sua família tem acesso.",
    icon: HeadphonesIcon,
    iconColor: "text-theo-purple",
    bgColor: "bg-theo-lavanda-light",
  },
  {
    title: "Como posso ajudar? 💙",
    description: "Ofereço suporte completo em cada etapa",
    features: [
      "Identifico benefícios aplicáveis ao seu caso",
      "Crio checklists detalhados passo a passo",
      "Gero documentos oficiais prontos",
      "Valido seus documentos antes do envio",
    ],
    icon: Sparkles,
    iconColor: "text-theo-coral",
    bgColor: "bg-theo-lavanda-light",
  },
  {
    title: "Envie seu laudo 📄",
    description: "Análise inteligente em segundos",
    longText: "Faça upload do laudo médico do seu filho e eu vou analisá-lo automaticamente. Em poucos segundos, você terá uma lista personalizada de todos os benefícios aplicáveis ao seu caso.",
    icon: Upload,
    iconColor: "text-theo-mint",
    bgColor: "bg-theo-lavanda-light",
  },
  {
    title: "Vamos começar! 🚀",
    description: "Sua jornada pelos direitos começa agora",
    longText: "Estou aqui sempre que você precisar. Pode me perguntar sobre qualquer benefício, solicitar documentos ou tirar dúvidas. Vamos juntos nessa!",
    icon: FileText,
    iconColor: "text-theo-yellow",
    bgColor: "bg-theo-lavanda-light",
  },
]

export function Onboarding({ onComplete, onSkip }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const step = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1

  const handleNext = () => {
    if (isLastStep) {
      onComplete()
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-theo-lg overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Close Button */}
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-100">
          <motion.div
            className="h-full bg-gradient-to-r from-theo-purple to-theo-coral"
            initial={{ width: "0%" }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            className="p-8 md:p-12"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Avatar and Icon */}
            <div className="flex items-center justify-center mb-6 space-x-4">
              <TheoAvatar state={currentStep === 0 ? "happy" : "idle"} size="lg" />
              {step.icon && (
                <div className={`${step.iconColor} ${step.bgColor} p-4 rounded-2xl`}>
                  <step.icon className="w-8 h-8" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-gray-900">{step.title}</h2>
              <p className="text-lg text-gray-600">{step.description}</p>
              
              {step.longText && (
                <p className="text-base text-gray-500 leading-relaxed max-w-xl mx-auto">
                  {step.longText}
                </p>
              )}

              {step.features && (
                <ul className="space-y-3 text-left max-w-md mx-auto mt-6">
                  {step.features.map((feature, index) => (
                    <motion.li
                      key={index}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-theo-mint flex items-center justify-center mt-0.5">
                        <span className="text-white text-sm">✓</span>
                      </div>
                      <span className="text-gray-700 leading-relaxed">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="px-8 pb-8 md:px-12 md:pb-12 flex items-center justify-between gap-4">
          {/* Step Indicator */}
          <div className="flex items-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? "w-8 bg-theo-purple"
                    : index < currentStep
                    ? "w-2 bg-theo-purple"
                    : "w-2 bg-gray-200"
                }`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="border-2 border-theo-lavanda hover:bg-theo-lavanda"
              >
                Anterior
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="bg-theo-purple hover:bg-theo-purple-dark text-white px-8"
            >
              {isLastStep ? "Começar!" : "Próximo"}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

