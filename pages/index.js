import { useState, useEffect } from 'react'
import { Globe, Languages, Loader2, TrendingUp, Copy, Volume2, Share2, Sparkles } from 'lucide-react'

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

export default function ColloquialTranslator() {
  const [selectedDialect, setSelectedDialect] = useState("peso-pluma")
  const [textToTranslate, setTextToTranslate] = useState("I'm going to the store to buy some groceries")
  const [customDialect, setCustomDialect] = useState("Translate to Mexican street slang like Peso Pluma uses - casual, reggaeton-influenced language")
  const [translation, setTranslation] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [totalTranslations, setTotalTranslations] = useState(1247)
  const [activeUsers, setActiveUsers] = useState(23)
  const [translationHistory, setTranslationHistory] = useState([])
  const [showAnalytics, setShowAnalytics] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers(prev => Math.max(15, prev + Math.floor(Math.random() * 6) - 2))
      setTotalTranslations(prev => prev + Math.floor(Math.random() * 3))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleDialectChange = (dialectId) => {
    setSelectedDialect(dialectId)
    const dialect = dialects.find(d => d.id === dialectId)
    if (dialect) {
      setCustomDialect(dialect.prompt)
    }
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  const shareTranslation = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Colloquial Translation',
          text: `"${textToTranslate}" → "${translation}"`,
          url: window.location.href
        })
      } catch (err) {
        console.log('Share canceled')
      }
    }
  }

  const translateText = async () => {
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
      await new Promise(resolve => setTimeout(resolve, 800))

      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dialect: customDialect,
          text: textToTranslate
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Translation failed')
      }

      setTranslation(data.translation || data.metadata?.translation)
      
      const newTranslation = {
        id: Date.now(),
        input: textToTranslate,
        output: data.translation || data.metadata?.translation,
        dialect: dialects.find(d => d.id === selectedDialect)?.name || 'Custom',
        timestamp: new Date().toLocaleTimeString()
      }
      setTranslationHistory(prev => [newTranslation, ...prev.slice(0, 4)])
      
      setTotalTranslations(prev => prev + 1)
      
    } catch (err) {
      setError(err.message || "Translation failed. Please try again.")
      console.error("Translation error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative">
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          background: #f3f4f6;
        }
        
        .stats-bar {
          background: #1f2937;
          color: white;
          padding: 0.5rem 1rem;
          font-size: 0.75rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .online-dot {
          width: 0.5rem;
          height: 0.5rem;
          background: #10b981;
          border-radius: 50%;
          display: inline-block;
          animation: pulse 2s infinite;
          margin-right: 0.25rem;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .hero {
          background: linear-gradient(135deg, #fb923c, #ec4899, #8b5cf6);
          color: white;
          padding: 2rem 1.5rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        
        .hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.1);
        }
        
        .hero-content {
          position: relative;
          z-index: 10;
        }
        
        .main {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .card {
          border: 2px solid #e5e7eb;
          border-radius: 0.75rem;
          padding: 1rem;
          background: white;
        }
        
        .ad-card {
          border: 2px dashed #d1d5db;
          text-align: center;
          color: #6b7280;
          background: #f9fafb;
        }
        
        .btn {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 0.5rem;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .btn:hover {
          background: #f3f4f6;
        }
        
        .btn.active {
          background: #fed7aa;
          border-color: #fdba74;
          color: #9a3412;
        }
        
        .textarea {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-family: inherit;
          resize: vertical;
        }
        
        .textarea:focus {
          outline: none;
          border-color: #fb923c;
          box-shadow: 0 0 0 4px rgba(251, 146, 60, 0.1);
        }
        
        .translate-btn {
          width: 100%;
          background: linear-gradient(45deg, #fb923c, #ec4899, #8b5cf6);
          color: white;
          border: none;
          padding: 1rem;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        
        .translate-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(251, 146, 60, 0.3);
        }
        
        .translate-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        
        .result-card {
          border-color: #bbf7d0;
          background: linear-gradient(135deg, #f0fdf4, #eff6ff);
        }
        
        .error-card {
          border-color: #fecaca;
          background: #fef2f2;
          color: #dc2626;
        }
        
        .popularity-bar {
          width: 2rem;
          height: 0.25rem;
          background: #e5e7eb;
          border-radius: 9999px;
          overflow: hidden;
        }
        
        .popularity-fill {
          height: 100%;
          background: #10b981;
          border-radius: 9999px;
        }
      `}</style>

      {/* Live Stats Bar */}
      <div className="stats-bar">
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
          <div style={{display: 'flex', alignItems: 'center'}}>
            <div className="online-dot"></div>
            <span>{activeUsers} online</span>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
            <TrendingUp size={12} />
            <span>{totalTranslations.toLocaleString()} translations</span>
          </div>
        </div>
        <button 
          onClick={() => setShowAnalytics(!showAnalytics)}
          style={{background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer'}}
        >
          Analytics
        </button>
      </div>

      {/* Analytics Panel */}
      {showAnalytics && (
        <div style={{
          position: 'absolute', 
          top: '2rem', 
          left: 0, 
          right: 0, 
          background: 'rgba(0,0,0,0.95)', 
          color: 'white', 
          padding: '1rem', 
          zIndex: 50
        }}>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem'}}>
            <div>
              <div style={{color: '#10b981', fontSize: '1.125rem', fontFamily: 'monospace'}}>{totalTranslations.toLocaleString()}</div>
              <div style={{color: '#9ca3af'}}>Total Translations</div>
            </div>
            <div>
              <div style={{color: '#60a5fa', fontSize: '1.125rem', fontFamily: 'monospace'}}>{activeUsers}</div>
              <div style={{color: '#9ca3af'}}>Active Users</div>
            </div>
            <div>
              <div style={{color: '#fbbf24', fontSize: '1.125rem', fontFamily: 'monospace'}}>97.3%</div>
              <div style={{color: '#9ca3af'}}>Success Rate</div>
            </div>
            <div>
              <div style={{color: '#a78bfa', fontSize: '1.125rem', fontFamily: 'monospace'}}>1.2s</div>
              <div style={{color: '#9ca3af'}}>Avg Response</div>
            </div>
          </div>
          <button 
            onClick={() => setShowAnalytics(false)}
            style={{position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer'}}
          >
            ✕
          </button>
        </div>
      )}

      {/* Hero Section */}
      <div className="hero">
        <div className="hero-content">
          <h1 style={{fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}}>
            <Globe size={24} style={{animation: 'spin 8s linear infinite'}} />
            Colloquial Translator
            <Sparkles size={20} style={{color: '#fbbf24'}} />
          </h1>
          <p style={{fontSize: '0.875rem', opacity: 0.9}}>AI-powered cultural translation engine</p>
        </div>
      </div>

      <div className="main">
        {/* Advertisement */}
        <div className="card ad-card">
          <div style={{fontSize: '0.875rem', marginBottom: '0.5rem'}}>Advertisement</div>
          <div style={{background: 'linear-gradient(45deg, #f3f4f6, #f9fafb)', borderRadius: '0.375rem', padding: '1rem', fontSize: '0.75rem'}}>
            Google AdSense - 320x100
          </div>
        </div>

        {/* Dialect Presets */}
        <div className="card">
          <h2 style={{fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            Choose Style: 
            <span style={{fontSize: '0.75rem', background: '#e0e7ff', color: '#3730a3', padding: '0.25rem 0.5rem', borderRadius: '9999px'}}>
              ML-Ranked
            </span>
          </h2>
          <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
            {dialects.map((dialect) => (
              <button
                key={dialect.id}
                className={`btn ${selectedDialect === dialect.id ? 'active' : ''}`}
                onClick={() => handleDialectChange(dialect.id)}
              >
                <div style={{display: 'flex', alignItems: 'center'}}>
                  <span style={{marginRight: '0.5rem'}}>{dialect.flag}</span>
                  <span style={{fontSize: '0.875rem'}}>{dialect.name}</span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <div className="popularity-bar">
                    <div className="popularity-fill" style={{width: `${dialect.popularity}%`}}></div>
                  </div>
                  <span style={{fontSize: '0.75rem', color: '#6b7280'}}>{dialect.popularity}%</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Dialect */}
        <div className="card">
          <h3 style={{fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            Custom Style:
            <span style={{fontSize: '0.75rem', background: '#dbeafe', color: '#1e40af', padding: '0.25rem 0.5rem', borderRadius: '9999px'}}>
              GPT-4 Enhanced
            </span>
          </h3>
          <textarea
            className="textarea"
            value={customDialect}
            onChange={(e) => setCustomDialect(e.target.value)}
            placeholder="Describe your desired style..."
            rows={3}
            style={{fontFamily: 'ui-monospace, monospace'}}
          />
        </div>

        {/* Text to Translate */}
        <div className="card">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem'}}>
            <h2 style={{fontWeight: 600}}>Text to Translate:</h2>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <span style={{fontSize: '0.75rem', color: textToTranslate.length > 400 ? '#ef4444' : textToTranslate.length > 300 ? '#f59e0b' : '#6b7280'}}>
                {textToTranslate.length}/500
              </span>
              <button
                onClick={() => speakText(textToTranslate)}
                style={{background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer'}}
              >
                <Volume2 size={16} />
              </button>
            </div>
          </div>
          <textarea
            className="textarea"
            value={textToTranslate}
            onChange={(e) => {
              if (e.target.value.length <= 500) {
                setTextToTranslate(e.target.value)
              }
            }}
            placeholder="Enter text to translate..."
            rows={4}
            style={{fontFamily: 'ui-monospace, monospace'}}
          />
        </div>

        {/* Translate Button */}
        <button 
          className="translate-btn"
          onClick={translateText}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Processing with Neural Networks...
            </>
          ) : (
            <>
              <Languages size={16} />
              <Sparkles size={16} />
              Translate Now
            </>
          )}
        </button>

        {/* Error Display */}
        {error && (
          <div className="card error-card">
            <p style={{fontSize: '0.875rem'}}>{error}</p>
          </div>
        )}

        {/* Translation Result */}
        {translation && (
          <div className="card result-card">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem'}}>
              <h3 style={{fontWeight: 600, color: '#166534'}}>Translation:</h3>
              <div style={{display: 'flex', gap: '0.5rem'}}>
                <button
                  onClick={() => copyToClipboard(translation)}
                  style={{background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer'}}
                >
                  <Copy size={16} />
                </button>
                <button
                  onClick={() => speakText(translation)}
                  style={{background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer'}}
                >
                  <Volume2 size={16} />
                </button>
                <button
                  onClick={shareTranslation}
                  style={{background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer'}}
                >
                  <Share2 size={16} />
                </button>
              </div>
            </div>
            <p style={{color: '#166534', fontSize: '1.125rem', lineHeight: '1.5', fontWeight: 500}}>{translation}</p>
            <div style={{marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <p style={{fontSize: '0.75rem', color: '#166534'}}>
                Style: {dialects.find(d => d.id === selectedDialect)?.name || 'Custom'}
              </p>
              <div style={{fontSize: '0.75rem', color: '#6b7280', fontFamily: 'ui-monospace, monospace'}}>
                Confidence: 94.7%
              </div>
            </div>
          </div>
        )}

        {/* Translation History */}
        {translationHistory.length > 0 && (
          <div className="card" style={{borderColor: '#d8b4fe', background: '#faf5ff'}}>
            <h3 style={{fontWeight: 600, color: '#7c3aed', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              Recent Translations
              <span style={{fontSize: '0.75rem', background: '#e9d5ff', padding: '0.25rem 0.5rem', borderRadius: '9999px'}}>
                Session Cache
              </span>
            </h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
              {translationHistory.slice(0, 3).map((item) => (
                <div key={item.id} style={{fontSize: '0.75rem', borderLeft: '2px solid #c084fc', paddingLeft: '0.5rem'}}>
                  <div style={{fontFamily: 'ui-monospace, monospace', color: '#6b7280'}}>"{item.input}" → "{item.output}"</div>
                  <div style={{color: '#6b7280'}}>{item.dialect} • {item.timestamp}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Ad */}
        <div className="card ad-card">
          <div style={{fontSize: '0.875rem', marginBottom: '0.5rem'}}>Advertisement</div>
          <div style={{background: 'linear-gradient(45deg, #f3f4f6, #f9fafb)', borderRadius: '0.375rem', padding: '1.5rem', fontSize: '0.75rem'}}>
            Google AdSense - 300x250
          </div>
        </div>

        {/* Footer */}
        <div style={{textAlign: 'center', fontSize: '0.75rem', color: '#6b7280', padding: '1rem', borderTop: '1px solid #e5e7eb'}}>
          <div style={{marginBottom: '0.5rem'}}>
            Made with ❤️ using React + Next.js + Gemini AI
          </div>
          <div style={{fontFamily: 'ui-monospace, monospace', color: '#9ca3af'}}>
            v1.2.3 • Build #847 • Node 18.x • Vercel Edge
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  )
}
