import NextAuth from 'next-auth';
import { authOptions } from '../authConfig';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
// Export authOptions so it can be imported by other files
export { authOptions }; 