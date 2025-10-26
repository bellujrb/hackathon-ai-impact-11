"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { ChatInterface } from "@/components/chat-interface"
import { ChecklistSidebar } from "@/components/checklist-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

export type BenefitRequest = {
  id: string
  name: string
  type: "bpc" | "passe-livre" | "isencao-ipva" | "apoio-educacional" | "outros"
  createdAt: Date
}

export default function Home() {
  const [benefitRequests, setBenefitRequests] = useState<BenefitRequest[]>([])
  const [askingAboutBenefit, setAskingAboutBenefit] = useState<BenefitRequest | null>(null)
  const [selectedBenefit, setSelectedBenefit] = useState<BenefitRequest | null>(null)

  const handleCreateBenefitRequest = (type: BenefitRequest["type"], name: string) => {
    const newRequest: BenefitRequest = {
      id: Date.now().toString(),
      name,
      type,
      createdAt: new Date(),
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
      <div className="flex h-screen w-full bg-white">
        <Sidebar
          benefitRequests={benefitRequests}
          selectedBenefit={selectedBenefit}
          onSelectBenefit={setSelectedBenefit}
        />
        <main className="flex-1 flex flex-col">
          <ChatInterface
            onCreateBenefitRequest={handleCreateBenefitRequest}
            askingAboutBenefit={askingAboutBenefit}
            onClearAskingAbout={() => setAskingAboutBenefit(null)}
          />
        </main>
        <ChecklistSidebar
          benefitRequests={benefitRequests}
          selectedBenefit={selectedBenefit}
          onSelectBenefit={setSelectedBenefit}
          onAskAboutBenefit={handleAskAboutBenefit}
          onDeleteBenefit={handleDeleteBenefit}
        />
      </div>
    </SidebarProvider>
  )
}
