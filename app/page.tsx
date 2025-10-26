"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { ChatInterface } from "@/components/chat-interface"
import { ChecklistSidebar } from "@/components/checklist-sidebar"
import { DocumentVerifier } from "@/components/document-verifier"
import { DesignationRequest } from "@/components/designation-request"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Onboarding } from "@/components/onboarding"
import { LiveMode } from "@/components/live-mode"
import { useFirstVisit } from "@/lib/use-first-visit"
import { AnimatePresence } from "framer-motion"
import { CheckSquare, MessageSquare } from "lucide-react"

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
  const [isLiveModeOpen, setIsLiveModeOpen] = useState(false)
  const [mobileView, setMobileView] = useState<"chat" | "checklist">("chat")
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

      <div className="flex h-screen w-full bg-white dark:bg-gray-950 overflow-hidden">
        <Sidebar
          benefitRequests={benefitRequests}
          selectedBenefit={selectedBenefit}
          onSelectBenefit={setSelectedBenefit}
          selectedTab={selectedTab}
          onSelectTab={setSelectedTab}
          onOpenLiveMode={() => setIsLiveModeOpen(true)}
        />
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {/* Content Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Desktop: Show both side by side */}
            <div className="hidden md:flex md:flex-1 flex-col overflow-hidden">
              {selectedTab === "inicio" && (
                <ChatInterface
                  onCreateBenefitRequest={handleCreateBenefitRequest}
                  askingAboutBenefit={askingAboutBenefit}
                  onClearAskingAbout={() => setAskingAboutBenefit(null)}
                  onSetInput={(text) => setChatInputValue(text)}
                  mobileView={mobileView}
                  onMobileViewChange={setMobileView}
                  benefitRequestsCount={benefitRequests.length}
                />
              )}
              {selectedTab === "verificador" && <DocumentVerifier />}
              {selectedTab === "designacoes" && <DesignationRequest />}
            </div>

            {/* Mobile: Toggle between chat and checklist */}
            <div className="md:hidden flex-1 overflow-hidden">
              {mobileView === "chat" ? (
                selectedTab === "inicio" && (
                  <ChatInterface
                    onCreateBenefitRequest={handleCreateBenefitRequest}
                    askingAboutBenefit={askingAboutBenefit}
                    onClearAskingAbout={() => setAskingAboutBenefit(null)}
                    onSetInput={(text) => setChatInputValue(text)}
                    mobileView={mobileView}
                    onMobileViewChange={setMobileView}
                    benefitRequestsCount={benefitRequests.length}
                  />
                )
              ) : (
                <div className="h-full overflow-hidden">
                  <ChecklistSidebar
                    benefitRequests={benefitRequests}
                    selectedBenefit={selectedBenefit}
                    onSelectBenefit={setSelectedBenefit}
                    onAskAboutBenefit={handleAskAboutBenefit}
                    onDeleteBenefit={handleDeleteBenefit}
                    chatInputValue={chatInputValue}
                    mobileView={mobileView}
                    onMobileViewChange={setMobileView}
                    benefitRequestsCount={benefitRequests.length}
                  />
                </div>
              )}
              {selectedTab === "verificador" && <DocumentVerifier />}
              {selectedTab === "designacoes" && <DesignationRequest />}
            </div>
          </div>
        </main>

        {/* Desktop: Show checklist sidebar */}
        <div className="hidden md:block">
          <ChecklistSidebar
            benefitRequests={benefitRequests}
            selectedBenefit={selectedBenefit}
            onSelectBenefit={setSelectedBenefit}
            onAskAboutBenefit={handleAskAboutBenefit}
            onDeleteBenefit={handleDeleteBenefit}
            chatInputValue={chatInputValue}
          />
        </div>
      </div>
      
      {/* Live Mode Modal */}
      <LiveMode
        isOpen={isLiveModeOpen}
        onClose={() => setIsLiveModeOpen(false)}
      />
    </SidebarProvider>
  )
}
