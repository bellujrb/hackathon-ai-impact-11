# Lib - Sistemas de Agentes

Esta pasta contém a lógica do sistema multi-agentes para processamento inteligente de solicitações de benefícios.

## Arquitetura Multi-Agentes

### 1. benefit-agent.ts
Implementação simplificada do sistema multi-agentes usando:
- **Classificação de Benefícios**: Identifica automaticamente o tipo de benefício
- **Geração de Checklist**: Cria checklist detalhado baseado no tipo
- **Resposta Personalizada**: Usa Gemini para gerar respostas acolhedoras

### Fluxo:
```
1. detectBenefitType() → Identifica o tipo de benefício
2. generateBenefitChecklist() → Cria checklist personalizado
3. generateResponse() → Gera resposta com Gemini
4. processBenefitMessage() → Orquestra todo o processo
```

### 2. langgraph-config.ts
Ferramentas e configurações:
- **createChecklistTool**: Tool para gerar checklists
- **getChecklistForBenefit()**: Retorna checklist baseado no tipo
- **createGeminiModel**: Factory para criar modelo Gemini

### Tipos:
```typescript
interface ChecklistItem {
  id: string
  title: string
  description: string
  details: string
  completed: boolean
}

interface BenefitChecklist {
  benefitType: "bpc" | "passe-livre" | "isencao-ipva" | "outros"
  benefitName: string
  items: ChecklistItem[]
}
```

## Uso

### No API Route:
```typescript
import { processBenefitMessage } from "@/lib/benefit-agent"

const result = await processBenefitMessage(userMessage)
// Retorna: { response, checklist, benefitType, benefitName }
```

### Customização
Para adicionar novos tipos de benefícios:
1. Adicione o tipo em `benefit-agent.ts` - função `detectBenefitType()`
2. Adicione checklist em `langgraph-config.ts` - objeto `checklists`

