import { ChatGoogleGenerativeAI } from "@langchain/google-genai"

export interface ChecklistItem {
  id: string
  title: string
  description: string
  details: string
  completed: boolean
}

export interface BenefitChecklist {
  benefitType: "bpc" | "passe-livre" | "isencao-ipva" | "apoio-educacional" | "outros"
  benefitName: string
  items: ChecklistItem[]
}

// Tool para criar checklist
export const createChecklistTool = {
  name: "create_checklist",
  description:
    "Cria um checklist personalizado para solicitação de benefício. Identifica o tipo de benefício e gera uma lista de itens necessários para solicitação.",
  invoke: async (input: {
    benefitName: string
    question: string
    benefitType?: "bpc" | "passe-livre" | "isencao-ipva" | "apoio-educacional" | "outros"
  }): Promise<BenefitChecklist> => {
    // Detectar tipo de benefício
    const { benefitName, question, benefitType } = input
    const lowerBenefitName = benefitName.toLowerCase()
    const lowerQuestion = question.toLowerCase()

    let detectedType: BenefitRequest["type"] = benefitType || "outros"

    if (lowerBenefitName.includes("bpc") || lowerBenefitName.includes("loas") || lowerQuestion.includes("bpc") || lowerQuestion.includes("loas")) {
      detectedType = "bpc"
    } else if (
      lowerBenefitName.includes("passe") || lowerBenefitName.includes("transporte") || lowerQuestion.includes("passe") || lowerQuestion.includes("transporte")
    ) {
      detectedType = "passe-livre"
    } else if (lowerBenefitName.includes("ipva") || lowerBenefitName.includes("isenção") || lowerQuestion.includes("ipva") || lowerQuestion.includes("isenção")) {
      detectedType = "isencao-ipva"
    } else if (
      lowerBenefitName.includes("apoio educacional") || lowerBenefitName.includes("professor") || lowerBenefitName.includes("educação especial") ||
      lowerQuestion.includes("professor") || lowerQuestion.includes("particular") || lowerQuestion.includes("educação especial") ||
      lowerQuestion.includes("educacao especial") || lowerQuestion.includes("atendimento educacional")
    ) {
      detectedType = "apoio-educacional"
    }

    // Gerar checklist baseado no tipo
    const checklist = getChecklistForBenefit(detectedType)
    
    const benefitChecklist: BenefitChecklist = {
      benefitType: detectedType,
      benefitName,
      items: checklist,
    }

    return benefitChecklist
  },
}

type BenefitRequest = {
  id: string
  name: string
  type: "bpc" | "passe-livre" | "isencao-ipva" | "apoio-educacional" | "outros"
  createdAt: Date
}

const getChecklistForBenefit = (type: BenefitRequest["type"]): ChecklistItem[] => {
  const checklists: Record<string, ChecklistItem[]> = {
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
    "apoio-educacional": [
      {
        id: "1",
        title: "Obter laudo médico atualizado com CID F84",
        description: "Solicite ao médico um laudo detalhado sobre o TEA do seu filho",
        details:
          "O laudo deve conter o CID F84 (Transtorno do Espectro Autista), estar em papel timbrado, com carimbo e assinatura do médico. Deve descrever as limitações educacionais específicas da criança e recomendar atendimento educacional especializado. Validade recomendada: até 1 ano.",
        completed: false,
      },
      {
        id: "2",
        title: "Entregar laudo na escola e solicitar Professor de Apoio",
        description: "Procure a direção da escola com o laudo e faça a solicitação formal",
        details:
          "Agende reunião com a direção da escola. Apresente o laudo médico e solicite formalmente o Professor de Apoio (AEE - Atendimento Educacional Especializado). A escola é obrigada a oferecer quando há laudo médico. Peça para registrar a solicitação por escrito.",
        completed: false,
      },
      {
        id: "3",
        title: "Obter relatório pedagógico da escola",
        description: "Peça à escola um relatório descrevendo as necessidades do aluno",
        details:
          "A escola precisa emitir um relatório pedagógico descrevendo as necessidades específicas do aluno em sala de aula. Este documento é essencial para justificar a necessidade do professor de apoio. Solicite com prazo de até 15 dias.",
        completed: false,
      },
      {
        id: "4",
        title: "Consultar a Secretaria de Educação do município",
        description: "Entre em contato formal com a Secretaria de Educação",
        details:
          "Telefone ou vá pessoalmente à Secretaria de Educação com: laudo médico, relatório escolar, RG e CPF da criança. Pergunte sobre o processo para solicitar professor de apoio especializado. Peça o formulário oficial.",
        completed: false,
      },
      {
        id: "5",
        title: "Reunir documentos da família",
        description: "RG, CPF, comprovante de residência e documentos escolares",
        details:
          "Separe: RG e CPF da criança e dos responsáveis, certidão de nascimento, comprovante de residência (dos últimos 3 meses), histórico escolar, carteira de vacinação (se exigido). Faça cópias de tudo.",
        completed: false,
      },
      {
        id: "6",
        title: "Preencher formulário de solicitação",
        description: "Complete o formulário solicitando Professor de Apoio Especializado",
        details:
          "Preencha com atenção todas as informações sobre as necessidades educacionais do seu filho. Inclua detalhes sobre dificuldades em sala, adaptações necessárias, e por que o apoio de um professor especializado é essencial.",
        completed: false,
      },
      {
        id: "7",
        title: "Protocolizar a solicitação",
        description: "Entregue todos os documentos na Secretaria de Educação",
        details:
          "Vá com todos os documentos originais e cópias. Peça o número de protocolo e guarde com cuidado. Pergunte qual o prazo para resposta (geralmente 30 a 60 dias). Tire foto do protocolo.",
        completed: false,
      },
      {
        id: "8",
        title: "Acompanhar o andamento",
        description: "Consulte semanalmente o status da solicitação",
        details:
          "Ligue na Secretaria de Educação para saber se precisa de mais documentos ou quando será avaliada. Não desista! Se não atenderem, continue cobrando educadamente. Documente todas as ligações.",
        completed: false,
      },
      {
        id: "9",
        title: "Participar da avaliação pedagógica",
        description: "Compareça quando chamada para avaliação do caso",
        details:
          "A Secretaria vai avaliar a necessidade. Seja clara sobre as dificuldades do seu filho em sala de aula, o impacto sem o apoio, e a importância de um professor especializado. Leve exemplos concretos das necessidades.",
        completed: false,
      },
      {
        id: "10",
        title: "Negociar horas e cronograma do apoio",
        description: "Se aprovado, discuta quantas horas e quais dias o professor atenderá",
        details:
          "Após aprovação, combine com a escola e Secretaria quantas horas semanais de apoio seu filho terá direito. Geralmente varia de 5 a 20 horas semanais dependendo da necessidade. Formalize por escrito.",
        completed: false,
      },
      {
        id: "11",
        title: "Avaliar se o atendimento está adequado",
        description: "Monitore se o professor de apoio está atendendo as necessidades",
        details:
          "Converse com o professor de apoio e coordenação pedagógica regularmente. Verifique se está sendo efetivo. Se não estiver adequado, solicite ajustes ou faça nova solicitação detalhando as necessidades não atendidas.",
        completed: false,
      },
      {
        id: "12",
        title: "Renovar solicitação se necessário",
        description: "O apoio precisa ser renovado anualmente",
        details:
          "Antes do fim do ano letivo, peça renovação do laudo médico (se expirar) e protocole novo pedido para o ano seguinte. Não deixe para última hora! Comece 60 dias antes do fim do período letivo.",
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

// Configuração do modelo Gemini
export const createGeminiModel = (apiKey: string): ChatGoogleGenerativeAI => {
  return new ChatGoogleGenerativeAI({
    model: "gemini-1.5-pro",
    temperature: 0.7,
    apiKey: apiKey,
  })
}

// Node para processar mensagem e gerar resposta
export const generateResponseNode = async (state: any) => {
  const { messages } = state
  const lastMessage = messages[messages.length - 1]

  // Detectar se é uma solicitação de benefício
  const messageContent = lastMessage.content.toLowerCase()
  const isBenefitRequest = messageContent.includes("benefício") ||
    messageContent.includes("bpc") ||
    messageContent.includes("loas") ||
    messageContent.includes("passe livre") ||
    messageContent.includes("ipva") ||
    messageContent.includes("autista") ||
    messageContent.includes("solicitar")

  if (isBenefitRequest) {
    // Chamar tool para criar checklist
    const checklist = await createChecklistTool.invoke({
      benefitName: "Benefício",
      question: messageContent,
    })

    return {
      messages: [
        ...messages,
        {
          role: "assistant",
          content: `Entendi! Vou te ajudar com o ${checklist.benefitName}. Criei um checklist completo e detalhado para você acompanhar todo o processo passo a passo. Cada etapa tem instruções detalhadas sobre o que fazer. Você consegue! 💙`,
          checklist: checklist,
        },
      ],
    }
  }

  return {
    messages: [
      ...messages,
      {
        role: "assistant",
        content:
          "Olá! Sou uma assistente virtual especializada em ajudar famílias de crianças autistas a acessar benefícios. Como posso te ajudar? Você pode perguntar sobre BPC/LOAS, Passe Livre, Isenção de IPVA ou outros benefícios.",
      },
    ],
  }
}

