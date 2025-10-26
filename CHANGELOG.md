# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

## [2.0.0] - Redesign UI/UX Theo - 2024

### 🎨 Adicionado

#### Componentes Novos
- **TheoAvatar**: Avatar animado com 4 estados (idle, thinking, happy, talking)
- **Onboarding**: Fluxo de 4 etapas para primeira visita
- **SuggestionCard**: Cards clicáveis de sugestões de perguntas
- **useFirstVisit**: Hook para gerenciar primeira visita

#### Assets
- `theo-avatar.svg`: Avatar padrão do Theo
- `theo-thinking.svg`: Avatar em estado pensando
- `theo-happy.svg`: Avatar em estado feliz

#### Sistema de Cores
- Roxo principal: `#8B7FD9`
- Lavanda: `#E8E5F5`
- Coral: `#FF9B85`
- Amarelo: `#FFD88A`
- Verde menta: `#7FD9B9`

#### Animações
- Animações de entrada com Framer Motion
- Microinterações em botões e cards
- Loading states animados
- Progress bars com gradiente

### 🔄 Modificado

#### ChatInterface
- Tela inicial completamente redesenhada
- Avatar do Theo em mensagens do assistente
- Mensagens com bordas arredondadas (24px)
- Input com ícone de microfone
- Background lavanda suave
- Loading state: "Theo está pensando"

#### Sidebar
- Header com avatar do Theo
- Background lavanda claro
- Itens ativos com fundo roxo
- Footer com mensagem dedicada

#### ChecklistSidebar
- Cards com shadow roxa
- Progress bars com gradiente (roxo → coral)
- Empty state melhorado

#### Estilos Globais
- Tamanho de fonte base: 16px
- Line-height: 1.6
- Border-radius aumentado (16-24px)
- Shadows suaves e coloridas

### 🔧 Corrigido

#### Build Issues
- Resolvido problema com pdfkit/fontkit no Turbopack
- Configurado webpack como bundler padrão
- Externalizado pdfkit e fontkit no server-side
- Build compilando com sucesso

### 📦 Dependências

#### Adicionadas
- `framer-motion@^11.0.0`: Animações suaves

### 🗑️ Removido
- N/A

---

## [1.0.0] - Sistema AMPARA - 2024

### Adicionado
- Sistema multi-agente com 5 agentes especializados
- OCR com Google Document AI
- Verificador de documentos
- Gerador de relatórios
- Interface de chat básica
- 10 benefícios mapeados

---

### Formato do Changelog

Este changelog segue [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

### Categorias
- **Adicionado**: para novas funcionalidades
- **Modificado**: para mudanças em funcionalidades existentes
- **Depreciado**: para funcionalidades que serão removidas
- **Removido**: para funcionalidades removidas
- **Corrigido**: para correções de bugs
- **Segurança**: em caso de vulnerabilidades

