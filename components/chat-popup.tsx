"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, User, Bot } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ChatPopupProps {
  isOpen: boolean
  onClose: () => void
  messages: Message[]
}

export function ChatPopup({ isOpen, onClose, messages }: ChatPopupProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full sm:max-w-2xl h-[90vh] sm:h-[85vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gradient-to-r from-theo-purple to-theo-lavanda">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Bot className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="hidden sm:inline">Conversa com Theo</span>
              <span className="sm:hidden">Theo</span>
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors touch-manipulation"
              aria-label="Fechar"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <Bot className="h-12 w-12 sm:h-16 sm:w-16 text-theo-purple/20 mb-3 sm:mb-4" />
                <p className="text-gray-500 text-base sm:text-lg font-medium">
                  Nenhuma mensagem ainda
                </p>
                <p className="text-gray-400 text-xs sm:text-sm mt-2">
                  Comece uma conversa com o Theo!
                </p>
              </div>
            ) : (
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    className={`flex gap-2 sm:gap-3 ${
                      message.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {/* Avatar */}
                    <div
                      className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                        message.role === "user"
                          ? "bg-theo-coral"
                          : "bg-theo-purple"
                      }`}
                    >
                      {message.role === "user" ? (
                        <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      ) : (
                        <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`flex-1 max-w-[80%] sm:max-w-[75%] ${
                        message.role === "user" ? "items-end" : "items-start"
                      } flex flex-col`}
                    >
                      <div
                        className={`px-3 py-2 sm:px-4 sm:py-3 rounded-2xl shadow-sm ${
                          message.role === "user"
                            ? "bg-theo-coral text-white rounded-tr-sm"
                            : "bg-white text-gray-900 rounded-tl-sm border border-gray-200"
                        }`}
                      >
                        {message.role === "assistant" ? (
                          <div className="prose prose-sm sm:prose-base max-w-none prose-headings:mt-2 sm:prose-headings:mt-3 prose-headings:mb-1 sm:prose-headings:mb-2 prose-p:my-1 sm:prose-p:my-2 prose-ul:my-1 sm:prose-ul:my-2 prose-ol:my-1 sm:prose-ol:my-2 prose-li:my-0.5 sm:prose-li:my-1">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                p: ({ children }) => (
                                  <p className="text-gray-900 leading-relaxed text-sm sm:text-base">
                                    {children}
                                  </p>
                                ),
                                strong: ({ children }) => (
                                  <strong className="font-bold text-theo-purple">
                                    {children}
                                  </strong>
                                ),
                                ul: ({ children }) => (
                                  <ul className="list-disc list-inside space-y-1 text-gray-900">
                                    {children}
                                  </ul>
                                ),
                                ol: ({ children }) => (
                                  <ol className="list-decimal list-inside space-y-1 text-gray-900">
                                    {children}
                                  </ol>
                                ),
                                li: ({ children }) => (
                                  <li className="text-gray-900">{children}</li>
                                ),
                                h1: ({ children }) => (
                                  <h1 className="text-xl font-bold text-theo-purple">
                                    {children}
                                  </h1>
                                ),
                                h2: ({ children }) => (
                                  <h2 className="text-lg font-bold text-theo-purple">
                                    {children}
                                  </h2>
                                ),
                                h3: ({ children }) => (
                                  <h3 className="text-base font-bold text-theo-purple">
                                    {children}
                                  </h3>
                                ),
                                code: ({ children }) => (
                                  <code className="bg-theo-lavanda-light px-1.5 py-0.5 rounded text-theo-purple font-mono text-xs">
                                    {children}
                                  </code>
                                ),
                                a: ({ children, href }) => (
                                  <a
                                    href={href}
                                    className="text-theo-purple underline hover:text-theo-purple-dark"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {children}
                                  </a>
                                ),
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-sm sm:text-base leading-relaxed">
                            {message.content}
                          </p>
                        )}
                      </div>
                      <span
                        className={`text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 px-1 sm:px-2 ${
                          message.role === "user" ? "text-right" : "text-left"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 bg-white">
            <p className="text-xs sm:text-sm text-gray-500 text-center font-medium">
              {messages.length} mensagem{messages.length !== 1 ? "s" : ""}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

