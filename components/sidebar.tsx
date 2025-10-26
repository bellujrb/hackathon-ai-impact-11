"use client"

import { Home, FileCheck, Scale } from "lucide-react"
import {
  Sidebar as SidebarUI,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import type { BenefitRequest } from "@/app/page"

interface SidebarProps {
  benefitRequests: BenefitRequest[]
  selectedBenefit: BenefitRequest | null
  onSelectBenefit: (benefit: BenefitRequest | null) => void
  selectedTab: "inicio" | "verificador" | "designacoes"
  onSelectTab: (tab: "inicio" | "verificador" | "designacoes") => void
}

export function Sidebar({ benefitRequests, selectedBenefit, onSelectBenefit, selectedTab, onSelectTab }: SidebarProps) {
  return (
    <SidebarUI className="border-r border-gray-200 bg-white">
      <SidebarHeader className="border-b border-gray-200 p-6">
        <h1 className="text-xl font-semibold text-gray-900">AMPARA</h1>
        <p className="mt-1 text-xs text-gray-500">Assistente para mães atípicas</p>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                onSelectTab("inicio")
                onSelectBenefit(null)
              }}
              isActive={selectedTab === "inicio"}
              className="w-full justify-start gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-gray-100 data-[active=true]:bg-gray-900 data-[active=true]:text-white"
            >
              <Home className="h-5 w-5" />
              <span>Início</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                onSelectTab("verificador")
                onSelectBenefit(null)
              }}
              isActive={selectedTab === "verificador"}
              className="w-full justify-start gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-gray-100 data-[active=true]:bg-gray-900 data-[active=true]:text-white"
            >
              <FileCheck className="h-5 w-5" />
              <span>Verificador de Documentos</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                onSelectTab("designacoes")
                onSelectBenefit(null)
              }}
              isActive={selectedTab === "designacoes"}
              className="w-full justify-start gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-gray-100 data-[active=true]:bg-gray-900 data-[active=true]:text-white"
            >
              <Scale className="h-5 w-5" />
              <span>Designações Oficiais</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </SidebarUI>
  )
}
