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
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-2xl h-[80vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-theo-purple to-theo-lavanda">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Bot className="h-6 w-6" />
              Conversa com Theo
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Fechar"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Bot className="h-16 w-16 text-theo-purple/20 mb-4" />
                <p className="text-gray-500 text-lg">
                  Nenhuma mensagem ainda
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Comece uma conversa com o Theo!
                </p>
              </div>
            ) : (
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    className={`flex gap-3 ${
                      message.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {/* Avatar */}
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        message.role === "user"
                          ? "bg-theo-coral"
                          : "bg-theo-purple"
                      }`}
                    >
                      {message.role === "user" ? (
                        <User className="h-5 w-5 text-white" />
                      ) : (
                        <Bot className="h-5 w-5 text-white" />
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`flex-1 max-w-[75%] ${
                        message.role === "user" ? "items-end" : "items-start"
                      } flex flex-col`}
                    >
                      <div
                        className={`px-4 py-3 rounded-2xl shadow-sm ${
                          message.role === "user"
                            ? "bg-theo-coral text-white rounded-tr-sm"
                            : "bg-white text-gray-900 rounded-tl-sm border border-gray-200"
                        }`}
                      >
                        {message.role === "assistant" ? (
                          <div className="prose prose-sm max-w-none prose-headings:mt-3 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                p: ({ children }) => (
                                  <p className="text-gray-900 leading-relaxed">
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
                          <p className="text-sm leading-relaxed">
                            {message.content}
                          </p>
                        )}
                      </div>
                      <span
                        className={`text-xs text-gray-500 mt-1 px-2 ${
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
          <div className="px-6 py-4 border-t border-gray-200 bg-white">
            <p className="text-sm text-gray-500 text-center">
              {messages.length} mensagem{messages.length !== 1 ? "s" : ""}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

