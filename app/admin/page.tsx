"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { TheoAvatar } from "@/components/theo-avatar"
import { Button } from "@/components/ui/button"
import { 
  MessageSquare, 
  FileText, 
  CheckCircle2, 
  TrendingUp, 
  Clock,
  Heart,
  BookOpen,
  Brain,
  Award,
  BarChart3,
  Activity,
  Zap,
  HeadphonesIcon,
  Download,
  Mail,
  FileCheck,
  Sparkles,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"

// Dados mockados baseados no que a IA realmente coleta
const mockData = {
  overview: {
    totalConversations: 3247,
    documentsGenerated: 1856,
    laudosProcessed: 892,
    avgResponseTime: "1.8s",
  },
  aiInteractions: [
    { agent: "Leitor de Laudos", count: 892, percentage: 22, color: "bg-purple-500" },
    { agent: "Especialista em Direitos", count: 1124, percentage: 28, color: "bg-pink-500" },
    { agent: "Guia de Benefícios", count: 987, percentage: 24, color: "bg-blue-500" },
    { agent: "Redator Oficial", count: 654, percentage: 16, color: "bg-green-500" },
    { agent: "Orientador Empático", count: 402, percentage: 10, color: "bg-yellow-500" },
  ],
  documentTypes: [
    { type: "Requerimentos", count: 487, icon: FileText },
    { type: "E-mails Formais", count: 356, icon: Mail },
    { type: "Cartas para Escola", count: 298, icon: FileCheck },
    { type: "Petições", count: 187, icon: Award },
    { type: "Relatórios PDF", count: 528, icon: Download },
  ],
  benefitsAnalyzed: [
    { name: "BPC/LOAS", queries: 387, percentage: 24 },
    { name: "Professor de Apoio (AEE)", queries: 412, percentage: 26 },
    { name: "Passe Livre", queries: 265, percentage: 17 },
    { name: "Medicamentos SUS", queries: 203, percentage: 13 },
    { name: "Terapias CAPS", queries: 189, percentage: 12 },
    { name: "Outros", queries: 131, percentage: 8 },
  ],
  extractedData: {
    cids: [
      { code: "F84.0 (Autismo Infantil)", count: 428, percentage: 48 },
      { code: "F84.1 (Autismo Atípico)", count: 267, percentage: 30 },
      { code: "F84.5 (Asperger)", count: 134, percentage: 15 },
      { code: "Outros TEA", count: 63, percentage: 7 },
    ],
    supportLevels: [
      { level: "Nível 1 (Leve)", count: 401, percentage: 45 },
      { level: "Nível 2 (Moderado)", count: 312, percentage: 35 },
      { level: "Nível 3 (Severo)", count: 179, percentage: 20 },
    ],
    schoolTypes: [
      { type: "Escola Pública", count: 624, percentage: 70 },
      { type: "Escola Particular", count: 178, percentage: 20 },
      { type: "Não Informado", count: 90, percentage: 10 },
    ],
  },
  recentActivity: [
    { id: 1, action: "Laudo processado", detail: "CID F84.0, 5 anos, Nível 1", time: "2 min atrás", type: "laudo" },
    { id: 2, action: "Documento gerado", detail: "Requerimento para BPC/LOAS", time: "5 min atrás", type: "document" },
    { id: 3, action: "Consulta de benefício", detail: "Passe Livre Intermunicipal", time: "8 min atrás", type: "query" },
    { id: 4, action: "Carta personalizada", detail: "Solicitação de Professor de Apoio", time: "12 min atrás", type: "document" },
    { id: 5, action: "Laudo processado", detail: "CID F84.1, 7 anos, Nível 2", time: "15 min atrás", type: "laudo" },
    { id: 6, action: "Apoio emocional", detail: "Orientação empática fornecida", time: "18 min atrás", type: "support" },
  ],
  systemMetrics: {
    totalTokensUsed: 12457832,
    avgTokensPerRequest: 3842,
    successRate: 98.7,
    avgProcessingTime: "1.8s",
  }
}

export default function AdminDashboard() {
  return (
    <div className="flex h-screen w-full bg-white">
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-theo-lavanda bg-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TheoAvatar state="idle" size="md" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Dashboard Administrativo</h1>
              <p className="text-xs text-gray-600 flex items-center gap-1">
                <HeadphonesIcon className="h-3 w-3" />
                Análise de performance do sistema multiagente
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <Badge className="bg-theo-purple text-white hover:bg-theo-purple-dark">
              <Activity className="h-3 w-3 mr-1" />
              Sistema Online
            </Badge>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-theo-lavanda-light p-6">
          <div className="w-full space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-theo-lavanda bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Conversas Totais
                  </CardTitle>
                  <MessageSquare className="h-4 w-4 text-theo-purple" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-theo-purple">
                    {mockData.overview.totalConversations.toLocaleString('pt-BR')}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Interações com o chatbot
                  </p>
                </CardContent>
              </Card>

              <Card className="border-theo-lavanda bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Documentos Gerados
                  </CardTitle>
                  <FileText className="h-4 w-4 text-theo-coral" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-theo-coral">
                    {mockData.overview.documentsGenerated.toLocaleString('pt-BR')}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Cartas, e-mails e requerimentos
                  </p>
                </CardContent>
              </Card>

              <Card className="border-theo-lavanda bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Laudos Processados
                  </CardTitle>
                  <Brain className="h-4 w-4 text-theo-mint" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-theo-mint">
                    {mockData.overview.laudosProcessed.toLocaleString('pt-BR')}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Análise automática pela IA
                  </p>
                </CardContent>
              </Card>

              <Card className="border-theo-lavanda bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Tempo Médio
                  </CardTitle>
                  <Zap className="h-4 w-4 text-theo-yellow-dark" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-theo-yellow-dark">
                    {mockData.overview.avgResponseTime}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Resposta da IA
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="agents" className="space-y-4">
              <TabsList className="bg-white border border-theo-lavanda">
                <TabsTrigger value="agents" className="gap-2 data-[state=active]:bg-theo-purple data-[state=active]:text-white">
                  <Brain className="h-4 w-4" />
                  Agentes IA
                </TabsTrigger>
                <TabsTrigger value="documents" className="gap-2 data-[state=active]:bg-theo-purple data-[state=active]:text-white">
                  <FileText className="h-4 w-4" />
                  Documentos
                </TabsTrigger>
                <TabsTrigger value="benefits" className="gap-2 data-[state=active]:bg-theo-purple data-[state=active]:text-white">
                  <Award className="h-4 w-4" />
                  Benefícios
                </TabsTrigger>
                <TabsTrigger value="extracted" className="gap-2 data-[state=active]:bg-theo-purple data-[state=active]:text-white">
                  <BarChart3 className="h-4 w-4" />
                  Dados Extraídos
                </TabsTrigger>
                <TabsTrigger value="activity" className="gap-2 data-[state=active]:bg-theo-purple data-[state=active]:text-white">
                  <Activity className="h-4 w-4" />
                  Atividade
                </TabsTrigger>
              </TabsList>

              {/* AI Agents Tab */}
              <TabsContent value="agents" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-white border-theo-lavanda">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-theo-purple" />
                        Uso dos Agentes Multiagente
                      </CardTitle>
                      <CardDescription>
                        Distribuição de requisições entre os 5 agentes especializados
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {mockData.aiInteractions.map((agent) => (
                        <div key={agent.agent} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${agent.color}`} />
                              <span className="text-sm font-medium text-gray-900">{agent.agent}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-600">{agent.count} requisições</span>
                              <Badge className="bg-theo-lavanda text-theo-purple hover:bg-theo-lavanda">
                                {agent.percentage}%
                              </Badge>
                            </div>
                          </div>
                          <Progress value={agent.percentage} className="h-2" />
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-theo-lavanda">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-theo-coral" />
                        Métricas de Performance
                      </CardTitle>
                      <CardDescription>
                        Indicadores de eficiência do sistema
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Taxa de Sucesso</span>
                          <span className="text-lg font-bold text-theo-mint">{mockData.systemMetrics.successRate}%</span>
                        </div>
                        <Progress value={mockData.systemMetrics.successRate} className="h-2" />
                      </div>

                      <div className="p-4 rounded-lg bg-theo-lavanda-light border border-theo-lavanda">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Tokens Consumidos</span>
                          <Zap className="h-4 w-4 text-theo-yellow-dark" />
                        </div>
                        <p className="text-2xl font-bold text-theo-purple">
                          {mockData.systemMetrics.totalTokensUsed.toLocaleString('pt-BR')}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Média de {mockData.systemMetrics.avgTokensPerRequest.toLocaleString('pt-BR')} tokens/requisição
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-green-900">Sistema Otimizado</p>
                            <p className="text-sm text-green-700 mt-1">
                              Tempo médio de resposta: {mockData.systemMetrics.avgProcessingTime}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents" className="space-y-4">
                <Card className="bg-white border-theo-lavanda">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-theo-coral" />
                      Documentos Gerados pelo Redator Oficial
                    </CardTitle>
                    <CardDescription>
                      Análise dos tipos de documentos criados pela IA
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {mockData.documentTypes.map((doc) => (
                        <Card key={doc.type} className="bg-theo-lavanda-light border-theo-lavanda">
                          <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                                <doc.icon className="h-6 w-6 text-theo-purple" />
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">{doc.type}</p>
                                <p className="text-2xl font-bold text-theo-purple">{doc.count}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Benefits Tab */}
              <TabsContent value="benefits" className="space-y-4">
                <Card className="bg-white border-theo-lavanda">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-theo-purple" />
                      Benefícios Mais Consultados
                    </CardTitle>
                    <CardDescription>
                      Distribuição de consultas sobre direitos e benefícios
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Chart Visualization */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {mockData.benefitsAnalyzed.map((benefit) => (
                          <Card key={benefit.name} className="bg-theo-lavanda-light border-theo-lavanda">
                            <CardContent className="pt-6 text-center">
                              <div className="mb-2">
                                <div className="text-3xl font-bold text-theo-purple">{benefit.percentage}%</div>
                              </div>
                              <p className="text-sm font-medium text-gray-700">{benefit.name}</p>
                              <p className="text-xs text-gray-600 mt-1">{benefit.queries} consultas</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {/* Detailed List */}
                      <div className="space-y-3">
                        {mockData.benefitsAnalyzed.map((benefit) => (
                          <div key={benefit.name} className="flex items-center gap-4 p-3 rounded-lg border border-theo-lavanda hover:border-theo-purple transition-colors">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{benefit.name}</p>
                              <p className="text-sm text-gray-600">{benefit.queries} consultas realizadas</p>
                            </div>
                            <Badge className="bg-theo-purple text-white hover:bg-theo-purple-dark">
                              {benefit.percentage}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Extracted Data Tab */}
              <TabsContent value="extracted" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* CIDs */}
                  <Card className="bg-white border-theo-lavanda">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileCheck className="h-5 w-5 text-theo-purple" />
                        CIDs Identificados
                      </CardTitle>
                      <CardDescription>Extraídos dos laudos</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {mockData.extractedData.cids.map((cid) => (
                        <div key={cid.code} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700 font-medium">{cid.code}</span>
                            <span className="text-theo-purple font-bold">{cid.count}</span>
                          </div>
                          <Progress value={cid.percentage} className="h-2" />
                          <p className="text-xs text-gray-600">{cid.percentage}% do total</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Support Levels */}
                  <Card className="bg-white border-theo-lavanda">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Heart className="h-5 w-5 text-theo-coral" />
                        Níveis de Suporte
                      </CardTitle>
                      <CardDescription>Classificação TEA</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {mockData.extractedData.supportLevels.map((level) => (
                        <div key={level.level} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700 font-medium">{level.level}</span>
                            <span className="text-theo-coral font-bold">{level.count}</span>
                          </div>
                          <Progress value={level.percentage} className="h-2" />
                          <p className="text-xs text-gray-600">{level.percentage}% do total</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* School Types */}
                  <Card className="bg-white border-theo-lavanda">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-theo-mint" />
                        Tipos de Escola
                      </CardTitle>
                      <CardDescription>Contexto educacional</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {mockData.extractedData.schoolTypes.map((school) => (
                        <div key={school.type} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700 font-medium">{school.type}</span>
                            <span className="text-theo-mint font-bold">{school.count}</span>
                          </div>
                          <Progress value={school.percentage} className="h-2" />
                          <p className="text-xs text-gray-600">{school.percentage}% do total</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="space-y-4">
                <Card className="bg-white border-theo-lavanda">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-theo-purple" />
                      Atividade em Tempo Real
                    </CardTitle>
                    <CardDescription>
                      Últimas ações processadas pelo sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockData.recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-center gap-4 p-4 rounded-lg border border-theo-lavanda hover:border-theo-purple transition-colors">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            activity.type === 'laudo' ? 'bg-purple-100' :
                            activity.type === 'document' ? 'bg-pink-100' :
                            activity.type === 'query' ? 'bg-blue-100' : 'bg-yellow-100'
                          }`}>
                            {activity.type === 'laudo' && <Brain className="h-5 w-5 text-theo-purple" />}
                            {activity.type === 'document' && <FileText className="h-5 w-5 text-theo-coral" />}
                            {activity.type === 'query' && <MessageSquare className="h-5 w-5 text-blue-600" />}
                            {activity.type === 'support' && <Heart className="h-5 w-5 text-theo-yellow-dark" />}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{activity.action}</p>
                            <p className="text-sm text-gray-600">{activity.detail}</p>
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap">{activity.time}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}
