"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export type TheoState = "idle" | "thinking" | "happy" | "talking"

interface TheoAvatarProps {
  state?: TheoState
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

const sizeMap = {
  sm: 40,
  md: 60,
  lg: 80,
  xl: 120,
}

const avatarMap = {
  idle: "/theo-avatar.svg",
  thinking: "/theo-thinking.svg",
  happy: "/theo-happy.svg",
  talking: "/theo-avatar.svg",
}

export function TheoAvatar({ state = "idle", size = "md", className = "" }: TheoAvatarProps) {
  const pixelSize = sizeMap[size]
  const avatarSrc = avatarMap[state]

  return (
    <motion.div
      className={`relative inline-flex items-center justify-center ${className}`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <motion.div
        animate={
          state === "talking"
            ? {
                scale: [1, 1.05, 1],
                transition: {
                  repeat: Infinity,
                  duration: 1,
                  ease: "easeInOut",
                },
              }
            : state === "thinking"
            ? {
                rotateZ: [-2, 2, -2],
                transition: {
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                },
              }
            : {}
        }
      >
        <Image
          src={avatarSrc}
          alt="Theo - Seu assistente"
          width={pixelSize}
          height={pixelSize}
          className="rounded-full"
          priority
        />
      </motion.div>
      
      {state === "talking" && (
        <motion.div
          className="absolute -bottom-1 -right-1 flex space-x-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-theo-purple rounded-full"
              animate={{
                y: [0, -4, 0],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                repeat: Infinity,
                duration: 0.8,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}

