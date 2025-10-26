"use client"

import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"

interface SuggestionCardProps {
  icon: LucideIcon
  text: string
  onClick: () => void
  delay?: number
  iconColor?: string
}

export function SuggestionCard({ icon: Icon, text, onClick, delay = 0, iconColor = "text-theo-purple" }: SuggestionCardProps) {
  return (
    <motion.button
      className="w-full group relative bg-white dark:bg-gray-800 border-2 border-theo-lavanda dark:border-gray-700 rounded-2xl p-4 text-left transition-all hover:border-theo-purple dark:hover:border-purple-600 hover:shadow-theo"
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 300, damping: 25 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${iconColor}`}>
          <Icon className="w-6 h-6" />
        </div>
        <span className="text-gray-800 dark:text-gray-200 font-medium text-sm leading-relaxed group-hover:text-gray-900 dark:group-hover:text-white">
          {text}
        </span>
      </div>
    </motion.button>
  )
}

