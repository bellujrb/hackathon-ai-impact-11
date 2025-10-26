# Theo - Seu Companheiro na Jornada pelos Direitos das Crianças Atípicas

<div align="center">

**Uma plataforma inteligente com IA que aproxima mães de crianças atípicas de seus direitos governamentais**

*Desenvolvido para o **Hackathon Devs de Impacto** 🚀*

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![LangChain](https://img.shields.io/badge/LangChain-🦜-green)](https://www.langchain.com/)
[![Google Gemini](https://img.shields.io/badge/Gemini-2.0%20Flash-orange)](https://ai.google.dev/)
[![Hackathon](https://img.shields.io/badge/Hackathon-Devs%20de%20Impacto-purple)](https://github.com/bellujrb/hackathon-ai-impact-11)

</div>

---

### Descrição 

Theo é uma plataforma web que ajuda mães de crianças atípicas a identificar direitos, gerar checklists passo-a-passo e produzir documentos formais (relatórios, requerimentos e cartas) necessários para solicitar benefícios públicos no Brasil. A plataforma combina OCR, um sistema multi-agente com LLMs e utilitários para geração de PDFs prontos para impressão.

### Problema

No Brasil, **2 milhões de crianças** são diagnosticadas com autismo/TEA, mas:
- **70% das famílias** desconhecem benefícios disponíveis
- **6-12 meses** é o tempo médio para descobrir um benefício
- **R$ 1.500+/mês** em benefícios são perdidos por falta de informação
- **Sobrecarga emocional** afeta 85% das mães de crianças atípicas

### Equipe 

- Nome: João Rubens Belluzzo Neto
  Email: <bellujrb@atalho.ia>
- Nome: Marcus Felipe dos Santos Valente
  Email: fmarcus549@gmail.com
- Nome: Nicole Riedla Paiva Neves
  Email: nicole.neves@sou.inteli.edu.br
- Nome: Jonathan Batista Ferreira
  Email: jonathan.batista.ferreira.m@gmail.com

### 🔧 Configuração

#### Obter Google Gemini API Key

1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Faça login com sua conta Google
3. Clique em "Create API Key"
4. Copie a chave e adicione no `.env.local`

#### Configurar Google Document AI (Opcional)

Para usar OCR de PDFs, você precisa configurar o Google Document AI:

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto ou selecione um existente
3. Ative a API "Cloud Document AI"
4. Crie um processador de tipo "Document OCR"
5. Crie uma Service Account e baixe as credenciais JSON
6. Adicione as variáveis no `.env.local`

**Nota**: O sistema funciona sem Document AI, mas o OCR de PDFs não estará disponível.

---

### Instruções de configuração rápidas (Windows PowerShell)

1. Clone o repositório e entre na pasta:

```powershell
git clone https://github.com/bellujrb/hackathon-ai-impact-11.git
cd hackathon-ai-impact-11
```

2. Instale dependências:

```powershell
npm install
```

3. Crie o arquivo de variáveis de ambiente (`.env.local`) na raiz e adicione sua chave do Google Gemini:

```powershell
New-Item .env.local -ItemType File -Force
[System.IO.File]::WriteAllText('.env.local', "NEXT_PUBLIC_GOOGLE_API_KEY=your_google_api_key_here")
```

Para habilitar OCR com Google Document AI, adicione também as variáveis: (`GOOGLE_PROJECT_ID`, `GOOGLE_DOCUMENT_AI_PROCESSOR_ID`, `GOOGLE_CLOUD_CLIENT_EMAIL`, `GOOGLE_CLOUD_PRIVATE_KEY`).

4. Inicie em modo de desenvolvimento:

```powershell
npm run dev
```

5. Abra no navegador: http://localhost:3000

### 📁 Estrutura do Projeto

```
hackathon-ai-impact-11/
│
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── chat/                 # Chat com assistente virtual
│   │   ├── process-pdf/          # OCR de PDFs
│   │   ├── process-report/       # Processamento de laudos
│   │   ├── verify-document/      # Validação de documentos
│   │   └── generate-report-pdf/  # Geração de PDF
│   ├── page.tsx                  # Página principal
│   ├── layout.tsx                # Layout global
│   └── globals.css               # Estilos globais
│
├── components/                   # Componentes React
│   ├── chat-interface.tsx        # Interface de chat
│   ├── document-verifier.tsx     # Verificador de documentos
│   ├── report-generator.tsx      # Gerador de relatórios
│   ├── checklist-sidebar.tsx     # Sidebar com checklists
│   ├── benefit-checklist-view.tsx # Visualização de checklist
│   ├── designation-request.tsx   # Solicitação de benefícios
│   ├── sidebar.tsx               # Navegação lateral
│   └── ui/                       # Componentes UI (Radix + shadcn)
│
├── lib/                          # Lógica de negócio
│   ├── agents/                   # Sistema Multi-Agente
│   │   ├── report-reader.ts      # 🩺 Leitor de Laudos
│   │   ├── rights-specialist.ts  # ⚖️ Especialista em Direitos
│   │   ├── guide-agent.ts        # 📋 Guia de Benefícios
│   │   ├── official-writer.ts    # ✍️ Redator Oficial
│   │   └── empathic-guide.ts     # 💛 Orientador Empático
│   ├── ampara-orchestrator.ts    # 🎼 Orquestrador Principal
│   ├── document-verifier.ts      # ✅ Verificador de Documentos
│   ├── report-generator.ts       # 📝 Gerador de Relatórios
│   └── utils.ts                  # Utilitários
│
├── public/                       # Arquivos estáticos
├── styles/                       # Estilos adicionais
├── hooks/                        # React Hooks customizados
│
├── package.json                  # Dependências
├── tsconfig.json                 # Config TypeScript
├── next.config.mjs               # Config Next.js
├── tailwind.config.js            # Config Tailwind
└── README.md                     # Este arquivo
```

---

### Licença

Este projeto está licenciado sob a licença ISC. Consulte o arquivo `LICENSE` para o texto completo.
