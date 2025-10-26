# Benefits App - Sistema de Benefícios para Crianças Autistas

Uma aplicação Next.js moderna para ajudar famílias de crianças autistas a acessar benefícios do governo, com um sistema inteligente de checklists e assistente virtual.

## 🚀 Recursos

- **Multi-Agentes com LangChain/Gemini**: Sistema inteligente que identifica automaticamente o tipo de benefício e gera checklists personalizados
- **Checklists Interativos**: Cada benefício possui etapas detalhadas com instruções claras
- **Interface Moderna**: Design limpo e acessível com Tailwind CSS
- **Chat Interface**: Assistente virtual para responder dúvidas sobre benefícios

## 📦 Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd benefits-app
```

2. Instale as dependências:
```bash
npm install
# ou
pnpm install
```

3. Configure a variável de ambiente:
```bash
cp .env.local.example .env.local
```

Edite `.env.local` e adicione sua API key do Google Gemini:
```
NEXT_PUBLIC_GOOGLE_API_KEY=your_api_key_here
```

Para obter uma chave de API: https://makersuite.google.com/app/apikey

4. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 🏗️ Arquitetura

### Multi-Agentes

O sistema utiliza uma arquitetura de multi-agentes para processar solicitações:

1. **Agente Classificador** (`lib/benefit-agent.ts`): Identifica o tipo de benefício mencionado
2. **Agente de Checklist**: Gera checklist detalhado baseado no tipo de benefício
3. **Agente de Resposta** (Gemini): Gera respostas personalizadas e acolhedoras

### Estrutura de Arquivos

```
benefits-app/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # API endpoint para processar mensagens
│   ├── page.tsx                  # Página principal
│   └── layout.tsx
├── components/
│   ├── benefit-checklist-view.tsx # Visualização detalhada de checklist
│   ├── chat-interface.tsx        # Interface de chat
│   ├── checklist-sidebar.tsx     # Sidebar com checklists
│   └── ui/                       # Componentes UI
├── lib/
│   ├── benefit-agent.ts          # Lógica do sistema multi-agentes
│   ├── langgraph-config.ts       # Configuração e tools
│   └── utils.ts
└── public/
```

## 💡 Como Funciona

1. Usuário faz uma pergunta sobre um benefício no chat
2. Sistema identifica automaticamente o tipo de benefício (BPC, Passe Livre, etc.)
3. Gera um checklist personalizado com todas as etapas necessárias
4. Gemini gera uma resposta personalizada e acolhedora
5. Usuário pode clicar no checklist para ver etapas detalhadas

## 📋 Benefícios Suportados

- **BPC/LOAS**: Benefício de Prestação Continuada
- **Passe Livre**: Transporte gratuito intermunicipal/municipal
- **Isenção de IPVA**: Isenção de imposto sobre veículo
- **Outros**: Extensível para outros benefícios

## 🛠️ Tecnologias

- **Next.js 16**: Framework React com App Router
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Estilização
- **LangChain**: Framework para LLM
- **Google Gemini**: Modelo de linguagem para geração de respostas
- **Radix UI**: Componentes acessíveis
- **Lucide React**: Ícones

## 📝 Scripts

- `npm run dev`: Inicia servidor de desenvolvimento
- `npm run build`: Build para produção
- `npm run start`: Inicia servidor de produção
- `npm run lint`: Executa o linter

## 🔧 Configuração

### Variáveis de Ambiente

- `NEXT_PUBLIC_GOOGLE_API_KEY`: Chave de API do Google Gemini

## 📄 Licença

MIT

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se livre para abrir issues ou pull requests.

