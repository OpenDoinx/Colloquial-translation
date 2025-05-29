import { useState, useEffect } from 'react'

export default function ColloquialTranslator() {
  const [selectedDialect, setSelectedDialect] = useState("peso-pluma")
  const [textToTranslate, setTextToTranslate] = useState("I'm going to the store to buy some groceries")
  const [customDialect, setCustomDialect] = useState("Translate to Mexican street slang like Peso Pluma uses - casual, reggaeton-influenced language")
  const [translation, setTranslation] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [totalTranslations, setTotalTranslations] = useState(1247)
  const [activeUsers, setActiveUsers] = useState(23)

  const dialects = [
    { 
      id: "peso-pluma", 
      name: "Peso Pluma Style", 
      flag: "🇲🇽",
      prompt: "Translate to Mexican street slang like Peso Pluma uses - casual, reggaeton-influenced language",
      popularity: 87
    },
    { 
      id: "chinese-gen-z", 
      name: "Chinese Gen Z", 
      flag: "🇨🇳",
      prompt: "Translate to Chinese Gen Z internet slang with modern expressions",
      popularity: 73
    },
    { 
      id: "uk-roadman", 
      name: "UK Roadman", 
      flag: "🇬🇧",
      prompt: "Translate to British roadman slang from London",
      popularity: 65
    },
    { 
      id: "gen-z-text", 
      name: "Gen Z Text", 
      flag: "🇺🇸",
      prompt: "Translate to American Gen Z text speak and social media language",
      popularity: 91
    },
    { 
      id: "nigerian-pidgin", 
      name: "Nigerian Pidgin", 
      flag: "🇳🇬",
      prompt: "Translate to Nigerian Pidgin English casual conversation style",
      popularity: 45
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers(prev => Math.max(15, prev + Math
