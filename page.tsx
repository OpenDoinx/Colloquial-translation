"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Globe, Languages, Loader2 } from "lucide-react"

export default function ColloquialTranslator() {
  const [selectedDialect, setSelectedDialect] = useState("peso-pluma")
  const [textToTranslate, setTextToTranslate] = useState("I'm going to the store to buy some groceries")
  const [customDialect, setCustomDialect] = useState("Translate to Mexican street slang like Peso Pluma uses - casual, reggaeton-influenced language")
  const [translation, setTranslation] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const dialects = [
    { 
      id: "peso-pluma", 
      name: "Peso Pluma Style", 
      flag: "🇲🇽",
      prompt: "Translate to Mexican street slang like Peso Pluma uses - casual, reggaeton-influenced language"
    },
    { 
      id: "chinese-gen-z", 
      name: "Chinese Gen Z", 
      flag: "🇨🇳",
      prompt: "Translate to Chinese Gen Z internet slang with modern expressions"
    },
    { 
      id: "uk-roadman", 
      name: "UK Roadman", 
      flag: "🇬🇧",
      prompt: "Translate to British roadman slang from London"
    },
    { 
      id: "gen-z-text", 
      name: "Gen Z Text", 
      flag: "🇺🇸",
      prompt: "Translate to American Gen Z text speak and social media language"
    },
    { 
      id: "nigerian-pidgin", 
      name: "Nigerian Pidgin", 
      flag: "🇳🇬",
      prompt: "Translate to Nigerian Pidgin English casual conversation style"
    },
  ]

  const handleDialectChange = (dialectId) => {
    setSelectedDialect(dialectId)
    const dialect = dialects.find(d => d.id === dialectId)
    if (dialect) {
      setCustomDialect(dialect.prompt)
    }
  }

  const translateText = async () => {
    // Basic validation
    if (!textToTranslate.trim()) {
      setError("Please enter text to translate")
      return
    }
    if (!customDialect.trim()) {
      setError("Please enter a dialect description")
      return
    }
    if (textToTranslate.length > 500) {
      setError("Text too long. Please keep it under 500 characters.")
      return
    }

    setIsLoading(true)
    setError("")
    setTranslation("")

    try {
      // Add base delay for better UX
      await new Promise(resolve => setTimeout(resolve, 2000))

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyDyWJ5dZvjG2Boc3hTV1K837Lltlba6HgY`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${customDialect}: "${textToTranslate}"`
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 150,
          }
        })
      })

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("High demand! Please wait 30 seconds and try again.")
        }
        throw new Error(`Service temporarily unavailable`)
      }

      const data = await response.json()
      const result = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
      
      if (!result) {
        throw new Error("No translation received. Please try again.")
      }

      setTranslation(result)
      
    } catch (err) {
      setError(err.message || "Translation failed. Please try again.")
      console.error("Translation error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-400 to-orange-500 px-6 py-8 text-white text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Globe className="w-6 h-6" />
          <h1 className="text-xl font-bold">Colloquial Translator</h1>
        </div>
        <p className="text-sm opacity-90">Speak like a local - anywhere in the world</p>
      </div>

      <div className="p-4 space-y-6">
        {/* Advertisement */}
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="p-6 text-center text-gray-500">
            <div className="text-sm mb-2">Advertisement</div>
            <div className="text-xs bg-gradient-to-r from-gray-100 to-gray-200 rounded p-4">
              Google AdSense - 320x100
            </div>
          </CardContent>
        </Card>

        {/* Dialect Presets */}
        <div>
          <h2 className="font-semibold mb-3">Choose Style:</h2>
          <div className="grid grid-cols-1 gap-2">
            {dialects.map((dialect) => (
              <Button
                key={dialect.id}
                variant={selectedDialect === dialect.id ? "default" : "outline"}
                className={`w-full justify-start h-auto py-3 px-4 ${
                  selectedDialect === dialect.id
                    ? "bg-orange-100 border-orange-300 text-orange-900"
                    : "bg-white hover:bg-gray-50"
                }`}
                onClick={() => handleDialectChange(dialect.id)}
              >
                <span className="mr-2">{dialect.flag}</span>
                <span className="text-sm">{dialect.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Dialect */}
        <div>
          <h3 className="font-medium mb-2 text-sm">Custom Style:</h3>
          <Textarea
            value={customDialect}
            onChange={(e) => setCustomDialect(e.target.value)}
            placeholder="Describe your desired style..."
            className="min-h-[60px] text-sm"
          />
        </div>

        {/* Text to Translate */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold">Text to Translate:</h2>
            <span className={`text-xs ${textToTranslate.length > 400 ? 'text-red-500' : 'text-gray-500'}`}>
              {textToTranslate.length}/500
            </span>
          </div>
          <Textarea
            value={textToTranslate}
            onChange={(e) => {
              if (e.target.value.length <= 500) {
                setTextToTranslate(e.target.value)
              }
            }}
            className="min-h-[80px]"
            placeholder="Enter text to translate..."
          />
        </div>

        {/* Translate Button */}
        <Button 
          onClick={translateText}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white py-3 text-base font-medium"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Translating...
            </>
          ) : (
            <>
              <Languages className="w-4 h-4 mr-2" />
              Translate Now
            </>
          )}
        </Button>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Translation Result */}
        {translation && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <h3 className="font-semibold text-green-800 mb-2">Translation:</h3>
              <p className="text-green-700 text-lg leading-relaxed">{translation}</p>
              <div className="mt-3 pt-3 border-t border-green-200">
                <p className="text-xs text-green-600">
                  Style: {dialects.find(d => d.id === selectedDialect)?.name || 'Custom'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bottom Ad */}
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="p-8 text-center text-gray-500">
            <div className="text-sm mb-2">Advertisement</div>
            <div className="text-xs bg-gradient-to-r from-gray-100 to-gray-200 rounded p-6">
              Google AdSense - 300x250
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-gray-600 py-4 border-t">
          Made with <span className="text-red-500">❤️</span> for breaking language barriers
          <br />
          <span className="text-gray-500">Free forever thanks to our sponsors</span>
        </div>
      </div>
    </div>
  )
}
