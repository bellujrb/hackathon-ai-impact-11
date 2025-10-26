# 🎤 Guia de Transcrição de Áudio do Theo

## 📋 Visão Geral

O Theo agora possui funcionalidade completa de **transcrição de áudio em tempo real**, permitindo que mães de crianças atípicas possam fazer perguntas por voz ao invés de digitar.

## ✨ Funcionalidades

### 🎙️ Gravação de Áudio
- Captura de áudio diretamente do microfone
- Qualidade otimizada para speech-to-text (16kHz)
- Redução de ruído e cancelamento de eco
- Timer de gravação em tempo real
- Visualização de ondas de áudio animadas

### 🔄 Transcrição Inteligente
- Transcrição automática usando Google Speech-to-Text (primário)
- Fallback automático para OpenAI Whisper (se Google falhar)
- Suporte para português brasileiro (pt-BR)
- Pontuação automática
- Modelo otimizado (enhanced model)
- Sistema dual redundante para alta disponibilidade

### 🎨 Interface Visual
- Botão de microfone animado
- Estados visuais claros (idle, gravando, processando)
- Feedback em tempo real (timer, ondas)
- Notificações toast elegantes
- Animações suaves com Framer Motion

---

## 🏗️ Arquitetura

### Componentes Criados

#### 1. `lib/use-audio-recorder.ts`
Hook React customizado para gerenciar gravação de áudio

**Estados:**
- `idle`: Pronto para gravar
- `recording`: Gravando áudio
- `processing`: Processando/transcrevendo
- `error`: Erro ocorreu

**Métodos:**
- `startRecording()`: Inicia gravação
- `stopRecording()`: Para e retorna Blob de áudio
- `cancelRecording()`: Cancela gravação

**Features:**
- Gerenciamento automático de MediaStream
- Timer de gravação
- Limpeza automática de recursos
- Tratamento de erros de permissão

#### 2. `components/audio-recorder-button.tsx`
Componente UI do botão de microfone

**Features:**
- Animações de pulsação durante gravação
- Indicador flutuante com timer
- Botão de cancelar gravação
- Visualização de ondas de áudio
- Mensagens de erro contextuais

#### 3. `app/api/transcribe-audio/route.ts`
API Route para transcrição

**Processo:**
1. Recebe arquivo de áudio (WebM/Opus)
2. Converte para Buffer
3. Tenta Google Speech-to-Text primeiro
4. Se falhar, usa OpenAI Whisper como fallback
5. Retorna transcrição em texto

**Configurações (Google Speech):**
- Encoding: WEBM_OPUS
- Sample Rate: 16000 Hz
- Language: pt-BR
- Pontuação automática
- Modelo enhanced

**Configurações (OpenAI Whisper):**
- Model: whisper-1
- Language: pt
- Automatic transcription

---

## 🔧 Configuração

### Variáveis de Ambiente Necessárias

Para usar a transcrição de áudio, adicione no `.env.local`:

```bash
# Opção 1: Google Cloud Credentials (Recomendado - já configurado para Document AI)
GOOGLE_CLOUD_CLIENT_EMAIL=seu_client_email@project.iam.gserviceaccount.com
GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Opção 2: OpenAI API (Fallback ou alternativa)
OPENAI_API_KEY=sk-...
```

**Sistema Dual:**
- Se ambas estiverem configuradas, usa Google primeiro e OpenAI como fallback
- Se apenas Google estiver configurada, usa apenas Google
- Se apenas OpenAI estiver configurada, usa apenas OpenAI
- Se nenhuma estiver configurada, retorna erro 503

### Habilitar Google Speech-to-Text API

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Selecione seu projeto
3. Navegue para "APIs & Services" > "Library"
4. Busque "Cloud Speech-to-Text API"
5. Clique em "Enable"

**Nota:** As mesmas credenciais do Document AI são usadas!

### Alternativa: Usar OpenAI Whisper

1. Acesse [OpenAI Platform](https://platform.openai.com/api-keys)
2. Crie uma API Key
3. Adicione `OPENAI_API_KEY` ao `.env.local`

---

## 💻 Como Usar

### Para Usuárias (Mães)

1. **Iniciar Gravação:**
   - Clique no ícone de microfone 🎤
   - Permita acesso ao microfone (primeira vez)
   - Botão ficará vermelho pulsante

2. **Durante Gravação:**
   - Fale claramente sua pergunta
   - Veja o timer contando o tempo
   - Ondas animadas mostram captura de áudio

3. **Finalizar:**
   - Clique novamente no microfone para parar
   - Aguarde alguns segundos enquanto transcreve
   - Texto aparecerá automaticamente no input

4. **Cancelar:**
   - Clique no "X" no indicador flutuante
   - Gravação será descartada

### Para Desenvolvedores

#### Integrar em Outro Componente

```typescript
import { AudioRecorderButton } from "@/components/audio-recorder-button"

<AudioRecorderButton
  onTranscription={(transcribedText) => {
    // Fazer algo com o texto transcrito
    console.log(transcribedText)
    setInputValue(transcribedText)
  }}
/>
```

#### Usar Hook Diretamente

```typescript
import { useAudioRecorder } from "@/lib/use-audio-recorder"

function MyComponent() {
  const {
    recordingState,
    recordingTime,
    startRecording,
    stopRecording,
    cancelRecording,
    error,
  } = useAudioRecorder()

  const handleRecord = async () => {
    await startRecording()
    // ... após algum tempo
    const audioBlob = await stopRecording()
    // Enviar para API de transcrição
  }
}
```

---

## 🎯 Fluxo Completo

```mermaid
graph TD
    A[Usuária clica em microfone] --> B{Permissão concedida?}
    B -->|Não| C[Erro: Permissão negada]
    B -->|Sim| D[Iniciar captura de áudio]
    D --> E[Mostrar timer e ondas]
    E --> F[Usuária clica novamente]
    F --> G[Parar gravação]
    G --> H[Criar Blob de áudio]
    H --> I[Enviar para API /transcribe-audio]
    I --> J{Google credentials?}
    J -->|Sim| K[Google Speech-to-Text]
    J -->|Não| L[OpenAI Whisper]
    K --> M{Sucesso?}
    M -->|Sim| N[Retornar transcrição]
    M -->|Não| L
    L --> O{Sucesso?}
    O -->|Sim| N
    O -->|Não| P[Erro amigável]
    N --> Q[Preencher input com texto]
    Q --> R[Focar no textarea]
```

---

## 📊 Estados e Feedback

### Estados do Botão

| Estado | Visual | Ação |
|--------|--------|------|
| **Idle** | Roxo 🎤 | Clique para gravar |
| **Recording** | Vermelho pulsante 🔴 | Clique para parar |
| **Processing** | Spinner ⏳ | Aguardando transcrição |
| **Error** | Mensagem vermelha ⚠️ | Erro contextual |

### Notificações Toast

- ✅ **Sucesso**: "Áudio transcrito com sucesso!"
- ℹ️ **Cancelado**: "Gravação cancelada"
- ⚠️ **Serviço indisponível**: "Transcrição temporariamente indisponível. Digite sua mensagem."
- ❌ **Erro**: "Erro ao processar áudio. Tente novamente."

---

## 🔒 Permissões do Navegador

### Primeira Vez

O navegador pedirá permissão para acessar o microfone:

**Chrome/Edge:**
```
"hackathon-ai-impact-11.vercel.app" quer usar seu microfone
[Bloquear] [Permitir]
```

**Firefox:**
```
Compartilhar seu microfone com hackathon-ai-impact-11.vercel.app?
[Nunca Compartilhar] [Não Agora] [Compartilhar Selecionado Dispositivo]
```

**Safari:**
```
"hackathon-ai-impact-11.vercel.app" Gostaria de Acessar o Microfone
[Não Permitir] [OK]
```

### Gerenciar Permissões

- **Chrome**: chrome://settings/content/microphone
- **Firefox**: about:preferences#privacy > Permissions > Microphone
- **Safari**: Safari > Preferências > Sites > Microfone

---

## 🐛 Tratamento de Erros

### Erros Comuns e Soluções

#### "Permissão de microfone negada"
**Causa:** Usuária clicou em "Bloquear"  
**Solução:** Ir em configurações do navegador e permitir

#### "Erro ao acessar microfone"
**Causa:** Microfone não conectado ou em uso  
**Solução:** Verificar se microfone está conectado e fechar outros apps usando-o

#### "Serviço temporariamente indisponível"
**Causa:** Google Speech-to-Text não configurado  
**Solução:** Adicionar credenciais do Google Cloud ou usar input manual

#### "Não foi possível transcrever o áudio"
**Causa:** Áudio muito curto, silencioso ou ininteligível  
**Solução:** Falar mais alto e claramente, tentar novamente

---

## 🎨 Animações e Microinterações

### Botão de Microfone
- **Hover**: Background lavanda suave
- **Click**: Scale down para 0.95
- **Recording**: Pulso vermelho expandindo
- **Processing**: Spinner rotativo

### Indicador de Gravação
- **Entrada**: Fade in + slide up
- **Saída**: Fade out + slide down
- **Ondas**: 4 barras animadas em alturas diferentes
- **Timer**: Contagem mm:ss formatada

### Toast Notifications
- Posição: top-center
- Duração: 3 segundos (sucesso), 5 segundos (erro)
- Animação: Slide down suave
- Auto-dismiss: Sim

---

## 🚀 Performance

### Otimizações

- **Codec**: WEBM/Opus (menor tamanho, boa qualidade)
- **Sample Rate**: 16kHz (otimizado para speech)
- **Chunk Size**: 100ms (baixa latência)
- **Noise Suppression**: Ativado
- **Echo Cancellation**: Ativado

### Tamanhos Aproximados

| Duração | Tamanho (KB) |
|---------|--------------|
| 5s | ~25 KB |
| 10s | ~50 KB |
| 30s | ~150 KB |
| 60s | ~300 KB |

---

## 🧪 Testes

### Manual Testing Checklist

- [ ] Botão aparece corretamente no input
- [ ] Clique inicia gravação
- [ ] Timer conta corretamente
- [ ] Ondas animam durante gravação
- [ ] Segundo clique para gravação
- [ ] Transcrição aparece no input
- [ ] Botão cancelar funciona
- [ ] Erro de permissão mostra mensagem
- [ ] Toast de sucesso aparece
- [ ] Focus automático no textarea após transcrição

### Casos de Teste

1. **Happy Path**: Gravar → Parar → Ver transcrição
2. **Cancelar**: Gravar → Cancelar → Nada acontece
3. **Sem Permissão**: Bloquear → Ver erro
4. **Áudio Curto**: Falar < 1s → Ver comportamento
5. **Serviço Off**: Sem credenciais → Ver fallback

---

## 📱 Suporte de Navegadores

| Navegador | Desktop | Mobile | Notas |
|-----------|---------|--------|-------|
| Chrome | ✅ | ✅ | Suporte completo |
| Firefox | ✅ | ✅ | Suporte completo |
| Safari | ✅ | ⚠️ | Requer HTTPS |
| Edge | ✅ | ✅ | Suporte completo |
| Opera | ✅ | ✅ | Suporte completo |

**Requisitos:**
- HTTPS obrigatório (exceto localhost)
- Microfone conectado/disponível
- JavaScript habilitado

---

## 🔮 Melhorias Futuras

### Em Consideração

- [ ] Suporte a comandos de voz ("Enviar", "Cancelar")
- [ ] Transcrição em tempo real (streaming)
- [ ] Múltiplos idiomas (pt-PT, es-ES)
- [ ] Salvar histórico de transcrições
- [ ] Feedback háptico em mobile
- [ ] Detecção de silêncio automática
- [ ] Correção de erros de transcrição com contexto
- [ ] Atalho de teclado (Ctrl+M para gravar)

---

## 💰 Custos

### Google Speech-to-Text

**Preços:**
- **Primeiros 60 minutos/mês**: GRÁTIS 🎉
- **Após 60 min**: $0.006 por 15 segundos
- **Modelo enhanced**: $0.009 por 15 segundos

**Estimativa para Hackathon:**
- **100 usuárias x 5 perguntas/dia** = 500 perguntas
- **~10 segundos por pergunta** = 5.000 segundos
- **= 83 minutos** → $1.50/dia (~$45/mês)

### OpenAI Whisper

**Preços:**
- **$0.006 por minuto** (sem tier gratuito)

**Estimativa para Hackathon:**
- **100 usuárias x 5 perguntas/dia** = 500 perguntas
- **~10 segundos por pergunta** = 5.000 segundos
- **= 83 minutos** → $0.50/dia (~$15/mês)

### Comparação

| Serviço | Tier Gratuito | Custo/mês (hackathon) | Qualidade |
|---------|---------------|----------------------|-----------|
| Google Speech | 60 min | $45 | Excelente (pt-BR) |
| OpenAI Whisper | Não | $15 | Excelente (multilíngue) |
| **Ambos (fallback)** | 60 min | **$0-30** | Máxima disponibilidade |

**Recomendação:** Usar sistema dual (Google + Whisper fallback) para:
- ✅ Aproveitar tier gratuito do Google
- ✅ Garantir alta disponibilidade
- ✅ Custos controlados (~$30/mês no pior caso)

---

## 📞 Suporte

### Problemas Comuns

Se encontrar problemas:

1. Verifique console do navegador (F12)
2. Teste permissões de microfone
3. Verifique variáveis de ambiente
4. Confirme que Google Speech-to-Text está habilitado

### Debug Mode

```javascript
// No console do navegador
localStorage.setItem('debug-audio', 'true')
// Recarregue a página
```

---

## 🎉 Conclusão

A funcionalidade de transcrição de áudio torna o Theo muito mais **acessível e humano**, especialmente para mães que:
- Estão ocupadas cuidando dos filhos
- Têm dificuldade para digitar
- Preferem comunicação verbal
- Precisam de uma experiência mais natural

**Impacto para o Hackathon:**
- ✅ Diferencial competitivo forte
- ✅ Demonstra atenção à acessibilidade
- ✅ Tecnologia de ponta (Speech-to-Text)
- ✅ UX excepcional

---

**Implementado com 💙 para mães de crianças atípicas no Brasil**

