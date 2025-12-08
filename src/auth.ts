import NextAuth from 'next-auth';
import { authConfig } from '@/app/api/auth/authOptions';

const nextAuth = NextAuth(authConfig);

export const auth = nextAuth.auth;
export const signIn = nextAuth.signIn;
export const signOut = nextAuth.signOut;

