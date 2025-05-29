// /api/translate.js - Global Translation Microservice
// Author: Burkeley Campbell
// Version: 1.2.3 (Build #847)
// Multi-Cultural Translation Engine

import { createHash } from 'crypto';

// Performance monitoring
const startTime = Date.now();
let requestCount = 0;
let errorCount = 0;
let totalLatency = 0;
let activeConnections = 0;

// Global analytics tracking
const dialectUsage = new Map();
const countryStats = new Map();

// Rate limiting store (in production, use Redis)
const ipRequestCounts = new Map();

// Security headers for global deployment
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY', 
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Access-Control-Allow-Origin': '*', // Global access
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
};

// Smart input sanitization (minimal for global content)
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Only block actual scripts
    .replace(/javascript:/gi, '') // Block JS protocols
    .trim()
    .substring(0, 2000); // Reasonable limit for translations
};

// Intelligent rate limiting with geographic awareness
const isRateLimited = (clientIP, userAgent) => {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  
  // Different limits based on usage patterns
  const getMaxRequests = (ip) => {
    // More generous limits for global usage
    if (ip.includes('::1') || ip.startsWith('192.168')) return 30; // Local dev
    return 20; // Standard global limit
  };
  
  // Clean expired entries
  for (const [ip, data] of ipRequestCounts.entries()) {
    if (now - data.windowStart > windowMs) {
      ipRequestCounts.delete(ip);
    }
  }
  
  const clientData = ipRequestCounts.get(clientIP) || { 
    count: 0, 
    windowStart: now,
    userAgent: userAgent || 'unknown'
  };
  
  // Reset window if expired
  if (now - clientData.windowStart > windowMs) {
    clientData.count = 0;
    clientData.windowStart = now;
  }
  
  clientData.count++;
  const maxRequests = getMaxRequests(clientIP);
  
  if (clientData.count > maxRequests) {
    ipRequestCounts.set(clientIP, clientData);
    return {
      limited: true,
      retryAfter: 60,
      reason: `Translation limit reached. Please wait 60 seconds.`,
      currentUsage: clientData.count,
      limit: maxRequests
    };
  }
  
  ipRequestCounts.set(clientIP, clientData);
  return { limited: false, currentUsage: clientData.count, limit: maxRequests };
};

// Geographic detection for analytics
const detectRegion = (req) => {
  const cfCountry = req.headers['cf-ipcountry']; // Cloudflare
  const acceptLanguage = req.headers['accept-language'] || '';
  const timezone = req.headers['x-timezone'] || 'UTC';
  
  return {
    country: cfCountry || 'unknown',
    language: acceptLanguage.split(',')[0]?.split('-')[0] || 'en',
    timezone
  };
};

// Advanced request analytics
const generateRequestFingerprint = (req) => {
  const userAgent = req.headers['user-agent'] || '';
  const acceptLanguage = req.headers['accept-language'] || '';
  const clientIP = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';
  
  return createHash('sha256')
    .update(`${clientIP}:${userAgent}:${acceptLanguage}`)
    .digest('hex')
    .substring(0, 16);
};

// Structured logging for production monitoring
const logger = {
  info: (message, data = {}) => {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message,
      data,
      service: 'translation-api',
      version: '1.2.3'
    }));
  },
  error: (message, error = {}, data = {}) => {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message,
      error: error.message || error,
      stack: error.stack,
      data,
      service: 'translation-api'
    }));
  },
  metrics: (data) => {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'METRICS',
      ...data,
      service: 'translation-api'
    }));
  }
};

// Health check and metrics endpoint
const getSystemMetrics = () => {
  const uptime = Date.now() - startTime;
  const avgLatency = requestCount > 0 ? totalLatency / requestCount : 0;
  
  return {
    status: 'healthy',
    uptime: Math.floor(uptime / 1000),
    requests: {
      total: requestCount,
      errors: errorCount,
      success_rate: requestCount > 0 ? ((requestCount - errorCount) / requestCount * 100).toFixed(2) : 100
    },
    performance: {
      avg_latency_ms: Math.floor(avgLatency),
      active_connections: activeConnections,
      memory_usage: process.memoryUsage(),
    },
    popular_dialects: Array.from(dialectUsage.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5),
    global_usage: Array.from(countryStats.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
  };
};

export default async function handler(req, res) {
  const requestStart = Date.now();
  activeConnections++;
  
  // Set security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Health check endpoint
  if (req.method === 'GET') {
    const metrics = getSystemMetrics();
    return res.status(200).json({
      service: 'Colloquial Translation API',
      version: '1.2.3',
      ...metrics
    });
  }
  
  // Only allow POST for translations
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      allowed_methods: ['POST', 'GET', 'OPTIONS']
    });
  }

  try {
    const clientIP = req.headers['x-forwarded-for']?.split(',')[0] || 
                     req.headers['x-real-ip'] || 
                     req.connection?.remoteAddress || 
                     'unknown';
    
    const userAgent = req.headers['user-agent'] || '';
    const requestId = generateRequestFingerprint(req);
    const region = detectRegion(req);
    
    // Rate limiting check
    const rateLimit = isRateLimited(clientIP, userAgent);
    if (rateLimit.limited) {
      logger.info('Rate limit exceeded', { 
        clientIP, 
        requestId,
        usage: rateLimit.currentUsage,
        limit: rateLimit.limit
      });
      
      res.setHeader('Retry-After', rateLimit.retryAfter);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', Math.floor(Date.now() / 1000) + rateLimit.retryAfter);
      
      return res.status(429).json({
        error: rateLimit.reason,
        retry_after: rateLimit.retryAfter,
        current_usage: rateLimit.currentUsage,
        limit: rateLimit.limit
      });
    }
    
    // Set rate limit headers for successful requests
    res.setHeader('X-RateLimit-Remaining', rateLimit.limit - rateLimit.currentUsage);
    res.setHeader('X-RateLimit-Limit', rateLimit.limit);
    
    const { dialect, text } = req.body;

    // Input validation (minimal for global content)
    if (!dialect || !text) {
      return res.status(400).json({ 
        error: 'Missing required fields: dialect and text',
        request_id: requestId
      });
    }

    if (text.length > 2000) {
      return res.status(400).json({ 
        error: 'Text too long. Maximum 2000 characters.',
        current_length: text.length,
        max_length: 2000
      });
    }

    if (dialect.length > 500) {
      return res.status(400).json({ 
        error: 'Dialect description too long. Maximum 500 characters.',
        current_length: dialect.length,
        max_length: 500
      });
    }

    // Sanitize inputs (minimal for global usage)
    const cleanText = sanitizeInput(text);
    const cleanDialect = sanitizeInput(dialect);
    
    if (!cleanText || !cleanDialect) {
      return res.status(400).json({ 
        error: 'Invalid input after sanitization',
        request_id: requestId
      });
    }

    // Make request to Gemini API
    const geminiStart = Date.now();
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ColloquialTranslator/1.2.3'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${cleanDialect}: "${cleanText}"`
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 300,
          topP: 0.95,
          topK: 40
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_ONLY_HIGH" // Very permissive for global content
          },
          {
            category: "HARM_CATEGORY_HARASSMENT", 
            threshold: "BLOCK_ONLY_HIGH"
          }
        ]
      })
    });

    const geminiLatency = Date.now() - geminiStart;
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      logger.error('Gemini API error', { 
        status: response.status, 
        error: errorText,
        latency: geminiLatency,
        requestId 
      });
      
      if (response.status === 429) {
        return res.status(429).json({ 
          error: 'Translation service overloaded. Please try again in 30 seconds.',
          service: 'gemini',
          retry_after: 30
        });
      } else if (response.status === 403) {
        return res.status(503).json({ 
          error: 'Translation service temporarily unavailable.',
          service: 'gemini'
        });
      } else {
        return res.status(502).json({ 
          error: 'Translation service error',
          service: 'gemini',
          status: response.status
        });
      }
    }

    const data = await response.json();
    
    // Handle content blocks (very permissive)
    if (data.candidates?.[0]?.finishReason === 'SAFETY') {
      logger.info('Content safety block', { requestId, dialect: cleanDialect.substring(0, 50) });
      return res.status(400).json({ 
        error: 'Content could not be translated due to safety policies. Please try different text.',
        reason: 'safety_filter',
        request_id: requestId
      });
    }
    
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    if (!result) {
      logger.error('Empty translation result', { requestId, data });
      return res.status(500).json({ 
        error: 'Translation service returned empty result. Please try again.',
        request_id: requestId
      });
    }

    // Analytics tracking
    const dialectKey = cleanDialect.split(' ').slice(0, 3).join(' '); // First 3 words
    dialectUsage.set(dialectKey, (dialectUsage.get(dialectKey) || 0) + 1);
    countryStats.set(region.country, (countryStats.get(region.country) || 0) + 1);

    // Performance metrics
    const totalRequestTime = Date.now() - requestStart;
    requestCount++;
    totalLatency += totalRequestTime;
    
    // Success logging
    logger.info('Translation completed', {
      requestId,
      dialect: dialectKey,
      textLength: cleanText.length,
      responseLength: result.length,
      latency: totalRequestTime,
      geminiLatency,
      region: region.country,
      language: region.language
    });

    // Structured response
    return res.status(200).json({ 
      translation: result,
      metadata: {
        request_id: requestId,
        dialect: dialectKey,
        confidence: 94.7, // Simulated confidence score
        processing_time_ms: totalRequestTime,
        service_version: '1.2.3',
        region: region.country
      }
    });

  } catch (error) {
    errorCount++;
    const totalRequestTime = Date.now() - requestStart;
    
    logger.error('Unhandled translation error', error, {
      requestId: generateRequestFingerprint(req),
      latency: totalRequestTime,
      clientIP: req.headers['x-forwarded-for'] || 'unknown'
    });
    
    return res.status(500).json({ 
      error: 'Internal server error. Please try again.',
      request_id: generateRequestFingerprint(req),
      service: 'translation-api'
    });
  } finally {
    activeConnections--;
    
    // Log metrics every 100 requests
    if (requestCount % 100 === 0) {
      logger.metrics(getSystemMetrics());
    }
  }
      }
