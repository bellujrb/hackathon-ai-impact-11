"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"

interface BenefitItem {
  id: string
  title: string
  description: string
  status: "pending" | "in-progress" | "completed"
  checked: boolean
}

export function BenefitsChecklist() {
  const [benefits, setBenefits] = useState<BenefitItem[]>([
    {
      id: "1",
      title: "BPC/LOAS",
      description: "Benefício de Prestação Continuada",
      status: "pending",
      checked: false,
    },
    {
      id: "2",
      title: "Passe Livre",
      description: "Transporte público gratuito",
      status: "pending",
      checked: false,
    },
    {
      id: "3",
      title: "Isenção de IPVA",
      description: "Isenção de imposto sobre veículo",
      status: "pending",
      checked: false,
    },
    {
      id: "4",
      title: "Cartão de Estacionamento",
      description: "Vaga especial para deficientes",
      status: "pending",
      checked: false,
    },
    {
      id: "5",
      title: "Medicamentos Gratuitos",
      description: "Acesso a medicamentos pelo SUS",
      status: "pending",
      checked: false,
    },
  ])

  const toggleBenefit = (id: string) => {
    setBenefits(benefits.map((benefit) => (benefit.id === id ? { ...benefit, checked: !benefit.checked } : benefit)))
  }

  const completedCount = benefits.filter((b) => b.checked).length
  const totalCount = benefits.length

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
        <h3 className="mb-1 text-sm font-semibold">Progresso</h3>
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold">
            {completedCount}/{totalCount}
          </div>
          <span className="text-sm opacity-90">benefícios solicitados</span>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full bg-white transition-all duration-300"
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {benefits.map((benefit) => (
          <Card key={benefit.id} className="border-indigo-100 p-3 transition-colors hover:bg-indigo-50/50">
            <div className="flex items-start gap-3">
              <Checkbox
                id={benefit.id}
                checked={benefit.checked}
                onCheckedChange={() => toggleBenefit(benefit.id)}
                className="mt-1 border-indigo-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
              />
              <div className="flex-1">
                <label htmlFor={benefit.id} className="block cursor-pointer text-sm font-medium text-indigo-900">
                  {benefit.title}
                </label>
                <p className="mt-0.5 text-xs text-indigo-600">{benefit.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
