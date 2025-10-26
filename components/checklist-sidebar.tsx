"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ChevronDown, ChevronRight, MessageCircle, Trash2 } from "lucide-react"
import type { BenefitRequest } from "@/app/page"

interface ChecklistItem {
  id: string
  title: string
  description: string
  details: string
  completed: boolean
}

interface ChecklistSidebarProps {
  benefitRequests: BenefitRequest[]
  selectedBenefit: BenefitRequest | null
  onSelectBenefit: (benefit: BenefitRequest | null) => void
  onAskAboutBenefit: (benefit: BenefitRequest) => void
  onDeleteBenefit: (benefit: BenefitRequest) => void
}

const getChecklistForBenefit = (type: BenefitRequest["type"]): ChecklistItem[] => {
  const checklists = {
    bpc: [
      {
        id: "1",
        title: "Obter laudo médico atualizado",
        description: "Solicite ao médico um laudo detalhado sobre o diagnóstico de autismo (TEA)",
        details:
          "O laudo deve conter o CID F84 (Transtorno do Espectro Autista), estar em papel timbrado, com carimbo e assinatura do médico. Deve descrever as limitações e necessidades da criança. Validade recomendada: até 6 meses.",
        completed: false,
      },
      {
        id: "2",
        title: "Reunir documentos pessoais da criança",
        description: "Separe RG, CPF e certidão de nascimento originais e cópias",
        details:
          "Você vai precisar dos documentos originais para apresentar no INSS e cópias para anexar ao processo. Se a criança não tiver RG ou CPF ainda, providencie com antecedência pois são obrigatórios.",
        completed: false,
      },
      {
        id: "3",
        title: "Reunir documentos pessoais do responsável",
        description: "RG, CPF e comprovante de residência atualizado",
        details:
          "O comprovante de residência deve estar no nome do responsável ou ter declaração de residência reconhecida em cartório. Pode ser conta de luz, água, telefone ou contrato de aluguel dos últimos 3 meses.",
        completed: false,
      },
      {
        id: "4",
        title: "Comprovar renda familiar",
        description: "Reúna documentos que comprovem a renda de todos que moram na casa",
        details:
          "Para ter direito ao BPC, a renda por pessoa da família deve ser menor que 1/4 do salário mínimo. Junte: contracheques dos últimos 3 meses, declaração de imposto de renda, ou declaração de não contribuinte (se não trabalhar formalmente). Inclua renda de TODOS os moradores da casa.",
        completed: false,
      },
      {
        id: "5",
        title: "Fazer o cadastro no CadÚnico",
        description: "Se ainda não tem, procure o CRAS mais próximo para fazer o cadastro",
        details:
          "O Cadastro Único é obrigatório para solicitar o BPC. Leve todos os documentos da família. O cadastro é gratuito e pode ser feito no CRAS (Centro de Referência de Assistência Social) do seu bairro. Anote o número do NIS que será gerado.",
        completed: false,
      },
      {
        id: "6",
        title: "Agendar perícia no INSS",
        description: "Ligue 135 ou acesse o aplicativo/site Meu INSS para agendar",
        details:
          "No Meu INSS, escolha 'Agendar Perícia' > 'Benefício Assistencial à Pessoa com Deficiência'. Escolha data e horário disponíveis. Guarde o número do protocolo. Se tiver dificuldade, vá pessoalmente a uma agência do INSS.",
        completed: false,
      },
      {
        id: "7",
        title: "Comparecer à perícia médica",
        description: "Vá ao INSS na data agendada com TODOS os documentos",
        details:
          "Chegue com 30 minutos de antecedência. Leve: todos os documentos originais e cópias, laudos médicos, exames, receitas, relatórios de terapias. O médico perito vai avaliar a criança. Seja honesta sobre as dificuldades e limitações. Pode levar um acompanhante.",
        completed: false,
      },
      {
        id: "8",
        title: "Acompanhar o resultado",
        description: "Verifique o resultado pelo Meu INSS ou pelo telefone 135",
        details:
          "O resultado sai em até 45 dias. Se aprovado, o benefício começa a ser pago no mês seguinte. Se negado, você pode entrar com recurso em até 30 dias. Procure a Defensoria Pública ou um advogado especializado para ajudar com o recurso, se necessário.",
        completed: false,
      },
    ],
    "passe-livre": [
      {
        id: "1",
        title: "Obter laudo médico específico",
        description: "Solicite laudo que comprove a necessidade de transporte para tratamento",
        details:
          "O laudo deve estar em papel timbrado, com CID F84, e especificar que a criança necessita de acompanhamento terapêutico regular (fonoaudiologia, terapia ocupacional, psicologia, etc). Deve conter frequência recomendada das terapias.",
        completed: false,
      },
      {
        id: "2",
        title: "Baixar e preencher o formulário",
        description: "Acesse o site do Ministério dos Transportes ou da prefeitura",
        details:
          "O formulário varia por cidade/estado. Para transporte intermunicipal, acesse o site do Ministério dos Transportes. Para transporte municipal, procure a Secretaria de Transportes da sua cidade. Preencha com letra legível ou digitalmente.",
        completed: false,
      },
      {
        id: "3",
        title: "Reunir documentos necessários",
        description: "RG, CPF, comprovante de residência e 2 fotos 3x4 recentes",
        details:
          "As fotos devem ser recentes e com fundo branco. O comprovante de residência deve ser dos últimos 3 meses. Faça cópias de todos os documentos. Alguns estados também pedem declaração de renda.",
        completed: false,
      },
      {
        id: "4",
        title: "Obter declaração médica adicional",
        description: "Peça ao médico uma declaração sobre a frequência das terapias",
        details:
          "Essa declaração deve informar quantas vezes por semana/mês a criança precisa ir às terapias e a distância aproximada. Isso ajuda a justificar a necessidade do passe livre. Deve ter data, carimbo e assinatura do médico.",
        completed: false,
      },
      {
        id: "5",
        title: "Protocolar a solicitação",
        description: "Entregue os documentos no órgão responsável",
        details:
          "Para passe intermunicipal: protocole em uma agência dos Correios ou no posto do Ministério dos Transportes. Para passe municipal: vá à Secretaria de Transportes ou local indicado pela prefeitura. Peça o protocolo de entrega e guarde.",
        completed: false,
      },
      {
        id: "6",
        title: "Aguardar análise e retirar o cartão",
        description: "O prazo é de até 30 dias para resposta",
        details:
          "Você será notificada por carta ou e-mail. Se aprovado, será informada onde retirar o cartão do passe livre. Leve um documento com foto para retirar. O cartão geralmente tem validade de 2 a 3 anos e precisa ser renovado.",
        completed: false,
      },
    ],
    "isencao-ipva": [
      {
        id: "1",
        title: "Verificar se seu estado oferece a isenção",
        description: "Confirme as regras específicas do seu estado",
        details:
          "Nem todos os estados oferecem isenção de IPVA para autistas. Acesse o site da Secretaria da Fazenda do seu estado ou ligue para confirmar. Alguns estados têm limite de valor do veículo. Anote os requisitos específicos.",
        completed: false,
      },
      {
        id: "2",
        title: "Obter laudo médico atualizado",
        description: "Laudo que comprove o diagnóstico de autismo com CID F84",
        details:
          "O laudo deve ser recente (até 6 meses), em papel timbrado, com carimbo e assinatura do médico. Deve conter o CID F84 e descrever as limitações. Alguns estados exigem que seja emitido por médico do SUS ou credenciado pelo DETRAN.",
        completed: false,
      },
      {
        id: "3",
        title: "Reunir documentos do veículo",
        description: "CRLV (documento do carro), nota fiscal ou documento de compra",
        details:
          "O veículo deve estar no nome da pessoa com deficiência ou do responsável legal. Se for financiado, pode precisar de autorização do banco. Verifique se não há multas ou débitos pendentes no veículo.",
        completed: false,
      },
      {
        id: "4",
        title: "Reunir documentos pessoais",
        description: "RG, CPF e comprovante de residência da pessoa com deficiência e do responsável",
        details:
          "Separe documentos originais e cópias. Se o carro estiver no nome do responsável, será necessário comprovar a relação (certidão de nascimento da criança). O comprovante de residência deve ser recente (últimos 3 meses).",
        completed: false,
      },
      {
        id: "5",
        title: "Preencher o requerimento",
        description: "Baixe o formulário no site da Secretaria da Fazenda do seu estado",
        details:
          "Cada estado tem seu próprio formulário. Preencha com atenção, sem rasuras. Alguns estados permitem preencher online, outros exigem formulário impresso. Assine onde indicado.",
        completed: false,
      },
      {
        id: "6",
        title: "Protocolar o pedido",
        description: "Entregue na Secretaria da Fazenda ou DETRAN do seu estado",
        details:
          "Verifique se seu estado aceita protocolo online ou se é necessário ir presencialmente. Leve todos os documentos originais e cópias. Peça o número do protocolo e guarde. O prazo de análise varia de 30 a 90 dias conforme o estado.",
        completed: false,
      },
      {
        id: "7",
        title: "Acompanhar o processo",
        description: "Consulte o andamento pelo site ou telefone da Secretaria da Fazenda",
        details:
          "Use o número do protocolo para acompanhar. Se aprovado, a isenção vale a partir do ano seguinte. Você precisará renovar a isenção periodicamente (geralmente a cada 2 anos), apresentando novo laudo médico.",
        completed: false,
      },
    ],
    outros: [
      {
        id: "1",
        title: "Identificar o benefício específico",
        description: "Pesquise sobre o benefício que você deseja solicitar",
        details:
          "Procure informações oficiais sobre o benefício. Acesse sites do governo, CRAS, ou procure orientação na Defensoria Pública. Anote os requisitos e documentos necessários.",
        completed: false,
      },
      {
        id: "2",
        title: "Verificar se você atende aos requisitos",
        description: "Confirme se você e sua família atendem aos critérios necessários",
        details:
          "Cada benefício tem requisitos específicos de renda, idade, documentação, etc. Faça uma lista do que você já tem e do que precisa providenciar. Se tiver dúvidas, procure orientação no CRAS.",
        completed: false,
      },
      {
        id: "3",
        title: "Reunir toda a documentação",
        description: "Separe todos os documentos necessários, originais e cópias",
        details:
          "Organize os documentos em uma pasta. Faça cópias de tudo. Verifique se os documentos estão dentro da validade. Se faltar algum documento, providencie antes de protocolar.",
        completed: false,
      },
      {
        id: "4",
        title: "Protocolar a solicitação",
        description: "Entregue o pedido no órgão responsável pelo benefício",
        details:
          "Verifique onde deve protocolar (INSS, prefeitura, DETRAN, etc). Leve todos os documentos. Peça o número do protocolo e guarde. Pergunte qual o prazo de resposta e como acompanhar o processo.",
        completed: false,
      },
    ],
  }

  return checklists[type] || checklists.outros
}

export function ChecklistSidebar({
  benefitRequests,
  selectedBenefit,
  onSelectBenefit,
  onAskAboutBenefit,
  onDeleteBenefit,
}: ChecklistSidebarProps) {
  const [checklistStates, setChecklistStates] = useState<Record<string, ChecklistItem[]>>({})
  const [expandedItems, setExpandedItems] = useState<Record<string, string | null>>({})

  const getChecklistItems = (benefit: BenefitRequest): ChecklistItem[] => {
    if (!checklistStates[benefit.id]) {
      const items = getChecklistForBenefit(benefit.type)
      setChecklistStates((prev) => ({ ...prev, [benefit.id]: items }))
      return items
    }
    return checklistStates[benefit.id]
  }

  const toggleItem = (benefitId: string, itemId: string) => {
    setChecklistStates((prev) => ({
      ...prev,
      [benefitId]: prev[benefitId].map((item) => (item.id === itemId ? { ...item, completed: !item.completed } : item)),
    }))
  }

  const toggleExpanded = (benefitId: string, itemId: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [benefitId]: prev[benefitId] === itemId ? null : itemId,
    }))
  }

  const getProgress = (benefit: BenefitRequest) => {
    const items = getChecklistItems(benefit)
    const completed = items.filter((item) => item.completed).length
    return Math.round((completed / items.length) * 100)
  }

  if (benefitRequests.length === 0) {
    return (
      <aside className="w-96 border-l border-gray-200 bg-gray-50 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Meus Checklists</h2>
        <div className="text-center py-12">
          <p className="text-sm text-gray-500">Nenhum checklist ainda.</p>
          <p className="text-sm text-gray-500 mt-2">Pergunte sobre um benefício no chat para começar.</p>
        </div>
      </aside>
    )
  }

  return (
    <aside className="w-96 border-l border-gray-200 bg-gray-50 flex flex-col h-full">
      <div className="p-6 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-bold text-gray-900">Meus Checklists</h2>
        <p className="text-sm text-gray-600 mt-1">Acompanhe suas solicitações</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {benefitRequests.map((benefit) => {
          const items = getChecklistItems(benefit)
          const progress = getProgress(benefit)
          const isExpanded = selectedBenefit?.id === benefit.id
          const expandedItemId = expandedItems[benefit.id]

          return (
            <Card key={benefit.id} className="overflow-hidden border-gray-200 bg-white">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">{benefit.name}</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gray-900 transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-700">{progress}%</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm("Tem certeza que deseja excluir este checklist?")) {
                          onDeleteBenefit(benefit)
                        }
                      }}
                      className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSelectBenefit(isExpanded ? null : benefit)}
                      className="h-8 w-8 p-0"
                    >
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="space-y-2 mt-4">
                    <Button
                      onClick={() => onAskAboutBenefit(benefit)}
                      size="sm"
                      className="w-full gap-2 bg-gray-900 hover:bg-gray-800 text-white h-8 text-xs"
                    >
                      <MessageCircle className="h-3 w-3" />
                      Perguntar ao Chat
                    </Button>

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {items.map((item, index) => (
                        <div
                          key={item.id}
                          className={`text-xs border rounded-lg p-3 ${
                            item.completed ? "bg-gray-50 border-gray-200" : "bg-white border-gray-200"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <Checkbox
                              id={`${benefit.id}-${item.id}`}
                              checked={item.completed}
                              onCheckedChange={() => toggleItem(benefit.id, item.id)}
                              className="h-4 w-4 mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="cursor-pointer" onClick={() => toggleExpanded(benefit.id, item.id)}>
                                <div className="flex items-start gap-2">
                                  <span className="font-semibold text-gray-700 flex-shrink-0">{index + 1}.</span>
                                  <p
                                    className={`font-medium ${
                                      item.completed ? "text-gray-500 line-through" : "text-gray-900"
                                    }`}
                                  >
                                    {item.title}
                                  </p>
                                </div>
                              </div>

                              {expandedItemId === item.id && (
                                <div className="mt-2 p-2 bg-gray-100 rounded text-gray-700 leading-relaxed">
                                  <p className="font-semibold mb-1">Como fazer:</p>
                                  <p>{item.details}</p>
                                </div>
                              )}
                            </div>
                            {item.completed && <CheckCircle2 className="h-4 w-4 text-gray-400 flex-shrink-0" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </aside>
  )
}
