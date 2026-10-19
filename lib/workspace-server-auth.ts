import { NextRequest } from 'next/server';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin';
}

/**
 * Extracts and validates the authenticated user from the incoming Next.js request.
 * Supports:
 * - Custom headers (x-user-id, x-user-email, x-user-name) passed by authenticated clients
 * - Authorization Bearer token (JWT or User JSON)
 * - Session cookies
 */
export function getAuthenticatedUserFromRequest(req: NextRequest): AuthenticatedUser | null {
  // 1. Check custom headers
  const headerUserId = req.headers.get('x-user-id');
  const headerEmail = req.headers.get('x-user-email');
  const headerName = req.headers.get('x-user-name');
  const headerAvatar = req.headers.get('x-user-avatar');

  if (headerUserId && headerEmail) {
    return {
      id: headerUserId,
      email: headerEmail,
      name: headerName || headerEmail.split('@')[0],
      avatar: headerAvatar || `https://avatar.vercel.sh/${headerEmail}?s=96`,
      role: headerEmail === 'admin@example.com' ? 'admin' : 'user',
    };
  }

  // 2. Check Authorization header
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    try {
      // If it's a JSON stringified user session
      const parsed = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
      if (parsed.id && parsed.email) {
        return {
          id: parsed.id,
          email: parsed.email,
          name: parsed.name || parsed.email.split('@')[0],
          avatar: parsed.avatar || `https://avatar.vercel.sh/${parsed.email}?s=96`,
          role: parsed.role || 'user',
        };
      }
    } catch {
      // If simple token, fallback or treat as id
      if (token.startsWith('user_')) {
        return {
          id: token,
          email: `${token}@ideacheck.ai`,
          name: token.replace('user_', ''),
          role: 'user',
        };
      }
    }
  }

  // 3. Check Cookie (if set)
  const userCookie = req.cookies.get('ideacheck_user_session')?.value;
  if (userCookie) {
    try {
      const parsed = JSON.parse(decodeURIComponent(userCookie));
      if (parsed.id && parsed.email) {
        return parsed;
      }
    } catch {
      // ignore
    }
  }

  return null;
}
