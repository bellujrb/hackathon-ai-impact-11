"use client"

import { Home, FileCheck, Scale, HeadphonesIcon, Video, Moon, Sun } from "lucide-react"
import { useState, useEffect } from "react"
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
  onOpenLiveMode: () => void
}

export function Sidebar({ benefitRequests, selectedBenefit, onSelectBenefit, selectedTab, onSelectTab, onOpenLiveMode }: SidebarProps) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Check for saved theme preference or default to dark theme
    const saved = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const shouldBeDark = saved === 'dark' || (!saved && prefersDark)
    
    setIsDark(shouldBeDark)
    if (shouldBeDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    
    if (newTheme) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <SidebarUI className="border-r border-theo-lavanda dark:border-gray-800 bg-theo-lavanda-light dark:bg-gray-900">
      <SidebarHeader className="border-b border-theo-lavanda dark:border-gray-800 p-6">
        <div className="flex items-center gap-3">
          <TheoAvatar state="idle" size="md" />
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Theo</h1>
            <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
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
              className="w-full justify-start gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all hover:bg-purple-100 hover:dark:bg-purple-900/30 hover:scale-[1.02] data-[active=true]:bg-theo-purple data-[active=true]:text-white data-[active=true]:shadow-theo dark:data-[active=true]:bg-purple-700"
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
              className="w-full justify-start gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all hover:bg-blue-100 hover:dark:bg-blue-900/30 hover:scale-[1.02] data-[active=true]:bg-theo-purple data-[active=true]:text-white data-[active=true]:shadow-theo dark:data-[active=true]:bg-purple-700"
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
              className="w-full justify-start gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all hover:bg-green-100 hover:dark:bg-green-900/30 hover:scale-[1.02] data-[active=true]:bg-theo-purple data-[active=true]:text-white data-[active=true]:shadow-theo dark:data-[active=true]:bg-purple-700"
            >
              <Scale className="h-5 w-5" />
              <span>Designações Oficiais</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={onOpenLiveMode}
              className="w-full justify-start gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all hover:bg-gradient-to-r hover:from-pink-200 hover:to-purple-200 hover:dark:from-pink-900/40 hover:dark:to-purple-900/40 hover:scale-[1.02] bg-gradient-to-r from-theo-coral/10 to-theo-purple/10 hover:from-theo-coral/20 hover:to-theo-purple/20 border-2 border-theo-purple/30 dark:border-purple-700/50"
            >
              <Video className="h-5 w-5 text-theo-purple dark:text-purple-400" />
              <span className="font-semibold text-theo-purple dark:text-purple-400">Modo Live</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-theo-lavanda dark:border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-gray-200 dark:hover:bg-gray-800 hover:scale-105"
          >
            {isDark ? (
              <>
                <Sun className="h-4 w-4" />
                <span>Modo Claro</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4" />
                <span>Modo Escuro</span>
              </>
            )}
          </button>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Feito com 💙 para mães de crianças atípicas
          </p>
        </div>
      </SidebarFooter>
    </SidebarUI>
  )
}
