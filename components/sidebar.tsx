"use client"

import { Home, FileCheck, Scale, HeadphonesIcon } from "lucide-react"
import {
  Sidebar as SidebarUI,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { TheoAvatar } from "@/components/theo-avatar"
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
    <SidebarUI className="border-r border-theo-lavanda bg-theo-lavanda-light">
      <SidebarHeader className="border-b border-theo-lavanda p-6">
        <div className="flex items-center gap-3">
          <TheoAvatar state="idle" size="md" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Theo</h1>
            <p className="text-xs text-gray-600 flex items-center gap-1">
              <HeadphonesIcon className="h-3 w-3" />
              Seu companheiro digital
            </p>
          </div>
        </div>
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
              className="w-full justify-start gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all hover:bg-theo-lavanda data-[active=true]:bg-theo-purple data-[active=true]:text-white data-[active=true]:shadow-theo"
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
              className="w-full justify-start gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all hover:bg-theo-lavanda data-[active=true]:bg-theo-purple data-[active=true]:text-white data-[active=true]:shadow-theo"
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
              className="w-full justify-start gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all hover:bg-theo-lavanda data-[active=true]:bg-theo-purple data-[active=true]:text-white data-[active=true]:shadow-theo"
            >
              <Scale className="h-5 w-5" />
              <span>Designações Oficiais</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-theo-lavanda">
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Feito com 💙 para mães de crianças atípicas
          </p>
        </div>
      </SidebarFooter>
    </SidebarUI>
  )
}
