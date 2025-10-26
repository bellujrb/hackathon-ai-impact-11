# 🔧 Configuração da API do Gemini

Para usar o **Modo Live com visão em tempo real**, você precisa configurar a API do Google Gemini.

## 📋 Passo a Passo

### 1. Obter API Key do Gemini

1. Acesse: https://aistudio.google.com/app/apikey
2. Faça login com sua conta Google
3. Clique em "Get API Key" ou "Create API Key"
4. Copie a chave gerada

### 2. Adicionar no Projeto

Abra o arquivo `.env.local` (ou crie se não existir) na raiz do projeto e adicione:

```bash
# Gemini API para Modo Live com visão
GEMINI_API_KEY=sua_api_key_aqui
```

**Exemplo:**
```bash
GEMINI_API_KEY=AIzaSyD-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Reiniciar o Servidor

Após adicionar a API key:

```bash
npm run dev
```

## 🎯 O que a API Gemini faz?

- **Visão em Tempo Real**: Analisa frames de vídeo da webcam
- **Compreensão Multimodal**: Entende fala + contexto visual
- **Leitura de Documentos**: Identifica laudos, certidões, documentos
- **Análise Contextual**: Vê gestos, expressões, objetos

## 💡 Fallback Automático

Se a API do Gemini **NÃO** estiver configurada:
- O Modo Live ainda funcionará
- Usará o chat normal (sem visão)
- Áudio e transcrição continuam funcionando
- Apenas não terá análise visual em tempo real

## 🆓 Custo

- **Gratuito**: Gemini 2.0 Flash tem tier gratuito generoso
- ~1500 requisições/dia grátis
- Ideal para hackathon e prototipagem

## 🔒 Segurança

⚠️ **IMPORTANTE**: Nunca commite a `.env.local`! 
- Arquivo já está no `.gitignore`
- API keys são sensíveis
- Cada desenvolvedor deve ter sua própria key

## 📚 Mais Informações

- Documentação: https://ai.google.dev/docs
- Gemini 2.0: https://deepmind.google/technologies/gemini/
- Modelos: https://ai.google.dev/gemini-api/docs/models/gemini

