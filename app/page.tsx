"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { ChatInterface } from "@/components/chat-interface"
import { ChecklistSidebar } from "@/components/checklist-sidebar"
import { DocumentVerifier } from "@/components/document-verifier"
import { DesignationRequest } from "@/components/designation-request"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Onboarding } from "@/components/onboarding"
import { useFirstVisit } from "@/lib/use-first-visit"
import { AnimatePresence } from "framer-motion"

export interface ChecklistItem {
  id: string
  title: string
  description: string
  details: string
  completed: boolean
}

export type BenefitRequest = {
  id: string
  name: string
  type: "bpc" | "passe-livre" | "isencao-ipva" | "apoio-educacional" | "outros"
  createdAt: Date
  checklist?: ChecklistItem[] // Checklist gerado pela IA
}

export default function Home() {
  const [benefitRequests, setBenefitRequests] = useState<BenefitRequest[]>([])
  const [askingAboutBenefit, setAskingAboutBenefit] = useState<BenefitRequest | null>(null)
  const [selectedBenefit, setSelectedBenefit] = useState<BenefitRequest | null>(null)
  const [chatInputValue, setChatInputValue] = useState("")
  const [selectedTab, setSelectedTab] = useState<"inicio" | "verificador" | "designacoes">("inicio")
  const { isFirstVisit, isLoading, markVisitComplete } = useFirstVisit()

  const handleCreateBenefitRequest = (type: BenefitRequest["type"], name: string, checklist?: ChecklistItem[]) => {
    const newRequest: BenefitRequest = {
      id: Date.now().toString(),
      name,
      type,
      createdAt: new Date(),
      checklist,
    }
    setBenefitRequests((prev) => [...prev, newRequest])
  }

  const handleAskAboutBenefit = (benefit: BenefitRequest) => {
    setAskingAboutBenefit(benefit)
  }

  const handleDeleteBenefit = (benefit: BenefitRequest) => {
    setBenefitRequests((prev) => prev.filter((b) => b.id !== benefit.id))
    if (selectedBenefit?.id === benefit.id) {
      setSelectedBenefit(null)
    }
  }

  return (
    <SidebarProvider>
      {/* Onboarding - exibido apenas na primeira visita */}
      <AnimatePresence>
        {!isLoading && isFirstVisit && (
          <Onboarding
            onComplete={markVisitComplete}
            onSkip={markVisitComplete}
          />
        )}
      </AnimatePresence>

      <div className="flex h-screen w-full bg-white">
        <Sidebar
          benefitRequests={benefitRequests}
          selectedBenefit={selectedBenefit}
          onSelectBenefit={setSelectedBenefit}
          selectedTab={selectedTab}
          onSelectTab={setSelectedTab}
        />
        <main className="flex-1 flex flex-col">
          {selectedTab === "inicio" && (
            <ChatInterface
              onCreateBenefitRequest={handleCreateBenefitRequest}
              askingAboutBenefit={askingAboutBenefit}
              onClearAskingAbout={() => setAskingAboutBenefit(null)}
              onSetInput={(text) => setChatInputValue(text)}
            />
          )}
          {selectedTab === "verificador" && <DocumentVerifier />}
          {selectedTab === "designacoes" && <DesignationRequest />}
        </main>
        <ChecklistSidebar
          benefitRequests={benefitRequests}
          selectedBenefit={selectedBenefit}
          onSelectBenefit={setSelectedBenefit}
          onAskAboutBenefit={handleAskAboutBenefit}
          onDeleteBenefit={handleDeleteBenefit}
          chatInputValue={chatInputValue}
        />
      </div>
    </SidebarProvider>
  )
}
