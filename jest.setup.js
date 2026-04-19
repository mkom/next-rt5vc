import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  })),
}));

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  getSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));
