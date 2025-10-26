# Guia do Sistema LangGraph/Gemini para Benefícios

## 🎯 Visão Geral

Este projeto implementa um sistema multi-agentes usando LangChain e Google Gemini para auxiliar famílias de crianças autistas a acessar benefícios governamentais.

## 🏗️ Arquitetura de Multi-Agentes

### Agente 1: Classificador de Benefícios
**Localização:** `lib/benefit-agent.ts` → `detectBenefitType()`

**Responsabilidade:** Analisa a mensagem do usuário e identifica qual tipo de benefício está sendo solicitado.

**Benefícios Detectados:**
- BPC/LOAS: Detecção por palavras-chave "bpc", "loas"
- Passe Livre: Detecção por "passe", "transporte", "busão"
- Isenção de IPVA: Detecção por "ipva", "isenção"
- Outros: Benefícios genéricos

### Agente 2: Gerador de Checklist
**Localização:** `lib/benefit-agent.ts` → `generateBenefitChecklist()`

**Responsabilidade:** Gera um checklist detalhado com todas as etapas necessárias para solicitar o benefício.

**Tool Usada:** `createChecklistTool` de `langgraph-config.ts`

### Agente 3: Gerador de Resposta (Gemini)
**Localização:** `lib/benefit-agent.ts` → `generateResponse()`

**Responsabilidade:** Usa Google Gemini para gerar respostas personalizadas, acolhedoras e encorajadoras.

**Modelo:** Gemini 1.5 Flash
**Temperatura:** 0.7 (para respostas mais criativas)
**Tokens Máx:** ~150 palavras

## 📊 Fluxo de Dados

```
Usuário faz pergunta
    ↓
[API Route] /app/api/chat/route.ts
    ↓
processBenefitMessage()
    ↓
    1. detectBenefitType() → { benefitType, benefitName }
    ↓
    2. generateBenefitChecklist() → { checklist }
    ↓
    3. generateResponse() → { response }
    ↓
Retorna JSON com response, checklist, benefitType, benefitName
    ↓
ChatInterface processa e exibe
    ↓
Benefício criado na lista lateral
```

## 🔧 Configuração

### Variáveis de Ambiente

No arquivo `.env.local`:
```bash
NEXT_PUBLIC_GOOGLE_API_KEY=your_api_key_here
```

### Como Obter API Key:

1. Acesse: https://makersuite.google.com/app/apikey
2. Faça login com sua conta Google
3. Clique em "Create API Key"
4. Copie a chave e cole no `.env.local`

## 🛠️ Modificando Checklists

### Adicionar Novo Item de Checklist

Edite `lib/langgraph-config.ts`:

```typescript
const checklists = {
  bpc: [
    {
      id: "9",
      title: "Novo Item",
      description: "Descrição curta",
      details: "Descrição detalhada com instruções",
      completed: false,
    },
    // ... outros itens
  ],
  // ... outros benefícios
}
```

### Adicionar Novo Tipo de Benefício

1. **Em `lib/benefit-agent.ts`:**
```typescript
// Adicione detecção
if (questionLower.includes("novo-beneficio")) {
  return { benefitType: "novo-tipo", benefitName: "Novo Benefício" }
}
```

2. **Em `lib/langgraph-config.ts`:**
```typescript
// Adicione o checklist
const checklists = {
  // ... outros
  "novo-tipo": [
    // ... itens do checklist
  ]
}
```

3. **Em `app/page.tsx`:**
```typescript
export type BenefitRequest = {
  // ...
  type: "bpc" | "passe-livre" | "isencao-ipva" | "novo-tipo" | "outros"
}
```

## 🧪 Testando

### Teste Local

```bash
npm run dev
```

### Testar Chat

1. Abra http://localhost:3000
2. Digite: "Quero solicitar o BPC para meu filho"
3. O sistema deve:
   - Identificar como BPC
   - Gerar checklist com 8 etapas
   - Criar benefício na sidebar
   - Exibir resposta do Gemini

### Testar API

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Quero solicitar passe livre"}'
```

## 🐛 Troubleshooting

### Erro: "API Key not found"
**Solução:** Adicione `NEXT_PUBLIC_GOOGLE_API_KEY` no `.env.local`

### Erro: "Module not found @langchain/..."
**Solução:** `npm install @langchain/core @langchain/google-genai @langchain/langgraph`

### Gemini não está gerando respostas
**Solução:** Verifique se a API key está válida e se há créditos na conta Google

### Checklist não aparece
**Solução:** Verifique o console do navegador para erros. O checkmark deve ser criado automaticamente.

## 📈 Melhorias Futuras

1. **Caching**: Cache de checklists para evitar regeneração
2. **Contexto**: Manter histórico de conversação
3. **Análise**: Detectar múltiplos benefícios na mesma pergunta
4. **Personalização**: Adaptar checklist baseado no estado do usuário
5. **Notificações**: Lembretes para próxima etapa

## 📚 Documentação das Dependências

- [LangChain](https://js.langchain.com/)
- [Google Gemini](https://ai.google.dev/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

