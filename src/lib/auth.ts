// lib/auth.ts
import NextAuth from 'next-auth';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcrypt';
import clientPromise from './mongodb_auth';
import { type DefaultSession, type NextAuthConfig } from 'next-auth';
import { JWT } from 'next-auth/jwt';

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
    } & DefaultSession['user']
  }
}

// Extend JWT types
declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
  }
}

export const authOptions: NextAuthConfig = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Early return with proper type checking
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        try {
          const client = await clientPromise;
          const db = client.db('Data');
          const user = await db.collection('users').findOne({ email: credentials.email });
          
          if (!user || !user.password) {
            return null;
          }
          
          // Ensure the password is properly cast to string
          const storedPassword = String(user.password);
          
          // Make sure we have a valid password to compare against
          if (!storedPassword) {
            return null;
          }
          
          // Use explicit type casting to string for credentials.password
          const passwordMatch = await compare(
            String(credentials.password), // Explicitly cast to string
            storedPassword
          );
          
          if (!passwordMatch) {
            return null;
          }
          
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: any }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: JWT }) {
      if (token && session.user) {
        session.user.id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt' as const, // Use 'as const' to ensure literal type
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);

// Use the auth function directly
export const getSession = auth;