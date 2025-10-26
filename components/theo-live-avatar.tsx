"use client"

import { motion } from "framer-motion"

interface TheoLiveAvatarProps {
  isTalking: boolean
  size?: "md" | "lg" | "xl"
}

export function TheoLiveAvatar({ isTalking, size = "lg" }: TheoLiveAvatarProps) {
  const sizeMap = {
    md: 200,
    lg: 300,
    xl: 400,
  }
  
  const avatarSize = sizeMap[size]

  return (
    <div className="relative" style={{ width: avatarSize, height: avatarSize }}>
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-2xl"
      >
        {/* Cabeça */}
        <circle cx="100" cy="100" r="80" fill="#8B7BE8" />
        
        {/* Olhos */}
        <motion.g
          animate={isTalking ? {
            scaleY: [1, 0.3, 1],
          } : {}}
          transition={{
            repeat: isTalking ? Infinity : 0,
            duration: 3,
            ease: "easeInOut",
          }}
        >
          <circle cx="75" cy="85" r="8" fill="white" />
          <circle cx="125" cy="85" r="8" fill="white" />
          <circle cx="77" cy="87" r="5" fill="#4A3F8F" />
          <circle cx="127" cy="87" r="5" fill="#4A3F8F" />
        </motion.g>

        {/* Sobrancelhas */}
        <motion.path
          d="M 65 75 Q 75 72 85 75"
          stroke="#6B5BB8"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          animate={isTalking ? {
            d: [
              "M 65 75 Q 75 72 85 75",
              "M 65 73 Q 75 70 85 73",
              "M 65 75 Q 75 72 85 75",
            ],
          } : {}}
          transition={{
            repeat: isTalking ? Infinity : 0,
            duration: 2,
          }}
        />
        <motion.path
          d="M 115 75 Q 125 72 135 75"
          stroke="#6B5BB8"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          animate={isTalking ? {
            d: [
              "M 115 75 Q 125 72 135 75",
              "M 115 73 Q 125 70 135 73",
              "M 115 75 Q 125 72 135 75",
            ],
          } : {}}
          transition={{
            repeat: isTalking ? Infinity : 0,
            duration: 2,
          }}
        />

        {/* Boca com animação de fala */}
        {isTalking ? (
          <motion.g
            animate={{
              d: [
                // Fechada
                "M 85 120 Q 100 120 115 120",
                // Meio aberta
                "M 85 120 Q 100 125 115 120",
                // Aberta
                "M 85 120 Q 100 130 115 120",
                // Meio aberta
                "M 85 120 Q 100 125 115 120",
                // Fechada
                "M 85 120 Q 100 120 115 120",
              ],
            }}
            transition={{
              repeat: Infinity,
              duration: 0.6,
              ease: "easeInOut",
            }}
          >
            <motion.path
              d="M 85 120 Q 100 120 115 120"
              stroke="#6B5BB8"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              animate={{
                d: [
                  "M 85 120 Q 100 120 115 120",
                  "M 85 120 Q 100 125 115 120",
                  "M 85 120 Q 100 130 115 120",
                  "M 85 120 Q 100 125 115 120",
                  "M 85 120 Q 100 120 115 120",
                ],
              }}
              transition={{
                repeat: Infinity,
                duration: 0.6,
                ease: "easeInOut",
              }}
            />
            {/* Língua/interior da boca quando aberta */}
            <motion.ellipse
              cx="100"
              cy="125"
              rx="10"
              ry="5"
              fill="#E88B7B"
              animate={{
                opacity: [0, 0, 0.8, 0, 0],
                scaleY: [0.5, 0.5, 1, 0.5, 0.5],
              }}
              transition={{
                repeat: Infinity,
                duration: 0.6,
                ease: "easeInOut",
              }}
            />
          </motion.g>
        ) : (
          // Boca sorrindo quando não está falando
          <path
            d="M 85 120 Q 100 130 115 120"
            stroke="#6B5BB8"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* Cabelo/topete */}
        <motion.path
          d="M 60 60 Q 80 30 100 40 Q 120 30 140 60"
          fill="#6B5BB8"
          animate={isTalking ? {
            d: [
              "M 60 60 Q 80 30 100 40 Q 120 30 140 60",
              "M 60 60 Q 80 28 100 38 Q 120 28 140 60",
              "M 60 60 Q 80 30 100 40 Q 120 30 140 60",
            ],
          } : {}}
          transition={{
            repeat: isTalking ? Infinity : 0,
            duration: 2,
          }}
        />

        {/* Sombra de profundidade */}
        <ellipse
          cx="100"
          cy="180"
          rx="60"
          ry="10"
          fill="black"
          opacity="0.1"
        />
      </svg>

      {/* Indicador de fala */}
      {isTalking && (
        <motion.div
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-theo-purple"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                repeat: Infinity,
                duration: 1,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      )}
    </div>
  )
}

