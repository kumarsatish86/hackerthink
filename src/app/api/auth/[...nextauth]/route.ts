import NextAuth from 'next-auth';
import { authConfig } from '../authOptions';

// Initialize NextAuth
const nextAuth = NextAuth(authConfig);

if (!nextAuth.handlers) {
  throw new Error('NextAuth handlers are not available. Please ensure AUTH_SECRET or NEXTAUTH_SECRET is set.');
}

export const { GET, POST } = nextAuth.handlers; 