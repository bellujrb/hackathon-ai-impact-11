"use client"

import { useState, useEffect } from "react"

const FIRST_VISIT_KEY = "theo-first-visit-complete"

export function useFirstVisit() {
  const [isFirstVisit, setIsFirstVisit] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const hasVisited = localStorage.getItem(FIRST_VISIT_KEY)
    setIsFirstVisit(!hasVisited)
    setIsLoading(false)
  }, [])

  const markVisitComplete = () => {
    localStorage.setItem(FIRST_VISIT_KEY, "true")
    setIsFirstVisit(false)
  }

  const resetFirstVisit = () => {
    localStorage.removeItem(FIRST_VISIT_KEY)
    setIsFirstVisit(true)
  }

  return {
    isFirstVisit,
    isLoading,
    markVisitComplete,
    resetFirstVisit,
  }
}

