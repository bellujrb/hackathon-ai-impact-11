# 🔧 Configuração do OpenAI Vision (GPT-4o)

O **Modo Live do Theo** agora usa **OpenAI GPT-4o** com visão em tempo real para análise multimodal.

## 📋 Por que OpenAI?

✅ **Melhor compatibilidade**: API mais estável e confiável  
✅ **Melhor qualidade**: GPT-4o tem excelente compreensão visual  
✅ **Já configurado**: Você já tem `OPENAI_API_KEY` para Whisper e TTS  
✅ **Mesma API**: Usa a mesma key para tudo (STT, TTS, Vision, Chat)

## 🎯 O que o GPT-4o faz no Modo Live?

- **Visão em Tempo Real**: Analisa 4 frames de vídeo dos últimos 2 segundos
- **Leitura de Documentos**: Lê laudos médicos, certidões, documentos
- **Compreensão Contextual**: Entende fala + contexto visual simultaneamente
- **Alta Resolução**: Modo `detail: "high"` para OCR preciso

## ✅ Já Configurado!

Se você já tem transcrição de áudio funcionando, **o Vision já está pronto!**

A mesma `OPENAI_API_KEY` é usada para:
- ✅ Whisper (transcrição de áudio)
- ✅ TTS-HD (voz do Theo)
- ✅ GPT-4o Vision (análise visual)
- ✅ Chat (fallback se vision falhar)

## 🚀 Como Testar

1. Abra http://localhost:3000
2. Clique em **"Modo Live"** na sidebar
3. Permita acesso à **webcam** e **microfone**
4. Segure o botão **"Segurar para Falar"**
5. Mostre um documento (ex: laudo, certidão)
6. Fale: _"O que você vê neste documento?"_
7. Solte o botão
8. ✨ **Theo vai descrever o que vê e ler informações!**

## 📊 Exemplos de Uso

### Validação de Documentos
```
Você: "Este laudo está completo?"
[mostra laudo médico na câmera]

Theo: "Vejo que você está mostrando um laudo médico. 
Consigo identificar um CID (F84.0 - Autismo), 
data de emissão e carimbo médico. Para o BPC/LOAS, 
este laudo está adequado!"
```

### Identificação de Benefícios
```
Você: "Com este documento, que benefícios posso pedir?"
[mostra certidão de nascimento com anotações]

Theo: "Vejo uma certidão de nascimento. Com ela e um 
laudo médico atualizado, você pode solicitar: BPC/LOAS, 
Passe Livre, Isenção de IPVA..."
```

### Orientação de Preenchimento
```
Você: "Como preencho este formulário?"
[mostra formulário do INSS]

Theo: "Vejo o formulário de requerimento do BPC. 
Na seção que está em branco, você deve preencher..."
```

## 🔧 Troubleshooting

### ❌ Erro: "OpenAI API key não configurada"
**Solução**: Adicione no `.env.local`:
```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx
```

### ❌ Vision não está funcionando, mas chat sim
**Verificar**:
1. Webcam está ativa? (ícone "CÂMERA ATIVA" deve aparecer)
2. Frames estão sendo capturados? (console.log no navegador)
3. Fallback automático para chat normal está ativo

### ❌ "Invalid format" no Whisper
**Solução**: Problema de formato de áudio. Verifique:
- Chrome/Edge: devem usar `audio/mp4`
- Firefox: pode usar `audio/webm`

## 💰 Custos

### GPT-4o Vision
- **Entrada**: $2.50 / 1M tokens (~$0.0025 por request)
- **Imagens**: ~170 tokens por frame em alta resolução
- **Request típico**: 4 frames + texto = ~1000 tokens = $0.0025

### Para hackathon
- ~$0.50-1.00 para centenas de testes
- Muito acessível para MVP/demo

## 🎛️ Configurações Avançadas

### Ajustar qualidade de imagem
Em `app/api/openai-multimodal/route.ts`:
```typescript
detail: "high" // Melhor OCR (atual)
detail: "low"  // Mais rápido, menor custo
```

### Ajustar número de frames
Em `lib/use-openai-live-conversation.ts`:
```typescript
images: videoFrames.slice(-4) // 4 frames (atual)
images: videoFrames.slice(-2) // 2 frames (mais rápido)
images: videoFrames.slice(-6) // 6 frames (mais contexto)
```

### Trocar modelo
Em `app/api/openai-multimodal/route.ts`:
```typescript
model: "gpt-4o"              // Melhor (atual)
model: "gpt-4-turbo"         // Alternativa mais barata
model: "gpt-4-vision-preview" // Versão antiga
```

## 📚 Referências

- OpenAI Vision: https://platform.openai.com/docs/guides/vision
- GPT-4o: https://openai.com/index/hello-gpt-4o/
- Pricing: https://openai.com/api/pricing/

