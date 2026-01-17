import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';

const SECRET = process.env.COOKIE_SECRET || 'local-dev-secret-change-in-production';
const TOKEN_EXPIRY = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;

// In-memory rate limit store (for offline single-server use)
// In production, this would use Redis or similar
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

interface MathChallenge {
  operand1: number;
  operand2: number;
  operator: '+' | '-' | '*';
  answer: number;
  token: string;
  expiresAt: number;
}

// Store active challenges in memory (in production, use Redis or session store)
const challengeStore = new Map<string, MathChallenge>();

/**
 * Generate a math challenge with server-side token
 */
export function generateMathChallenge(): { challenge: string; token: string } {
  const operand1 = Math.floor(Math.random() * 20) + 1;
  const operand2 = Math.floor(Math.random() * 20) + 1;
  const operator = ['+', '-', '*'][Math.floor(Math.random() * 3)] as '+' | '-' | '*';
  
  let answer: number;
  switch (operator) {
    case '+':
      answer = operand1 + operand2;
      break;
    case '-':
      answer = Math.max(0, operand1 - operand2); // Ensure non-negative
      break;
    case '*':
      answer = operand1 * operand2;
      break;
  }

  const token = randomBytes(32).toString('hex');
  const expiresAt = Date.now() + TOKEN_EXPIRY;

  const challenge: MathChallenge = {
    operand1,
    operand2,
    operator,
    answer,
    token,
    expiresAt,
  };

  challengeStore.set(token, challenge);

  // Clean up expired challenges
  setTimeout(() => {
    challengeStore.delete(token);
  }, TOKEN_EXPIRY + 1000);

  const challengeText = `${operand1} ${operator} ${operand2}`;
  return { challenge: challengeText, token };
}

/**
 * Verify math challenge answer
 */
export function verifyMathChallenge(token: string, userAnswer: number): boolean {
  const challenge = challengeStore.get(token);
  
  if (!challenge) {
    return false; // Token not found or expired
  }

  if (Date.now() > challenge.expiresAt) {
    challengeStore.delete(token);
    return false; // Token expired
  }

  const isValid = challenge.answer === userAnswer;
  
  // Delete token after use (one-time use)
  challengeStore.delete(token);
  
  return isValid;
}

/**
 * Rate limiting helper
 */
export function checkRateLimit(identifier: string): { allowed: boolean; resetAt: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetAt) {
    // Reset or create new record
    const resetAt = now + RATE_LIMIT_WINDOW;
    rateLimitStore.set(identifier, { count: 1, resetAt });
    return { allowed: true, resetAt };
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, resetAt: record.resetAt };
  }

  record.count++;
  return { allowed: true, resetAt: record.resetAt };
}

/**
 * Get client identifier for rate limiting
 * Uses IP address from headers or falls back to session
 */
export function getClientIdentifier(headers: Headers): string {
  // Try to get IP from headers
  const forwarded = headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : headers.get('x-real-ip') || 'unknown';
  
  // Also check for session cookie to combine with IP
  const sessionId = headers.get('cookie')?.match(/session_id=([^;]+)/)?.[1] || '';
  
  return `${ip}-${sessionId}`;
}

/**
 * Honeypot check - if field is filled, reject
 */
export function checkHoneypot(honeypotValue: string | undefined): boolean {
  // If honeypot field has any value, it's likely a bot
  return !honeypotValue || honeypotValue.trim() === '';
}

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}
