// Jest setup file
// Add any global test setup here

// Mock environment variables for testing
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test_db";
process.env.NEXTAUTH_SECRET = "test-secret-key-minimum-32-characters-long";
process.env.NEXTAUTH_URL = "http://localhost:3000";

// Global mocks
jest.mock('@/lib/db', () => ({
  prisma: {
    user: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn() },
    customer: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    job: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() },
    invoice: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), aggregate: jest.fn() },
    quote: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() },
    part: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    stockAlert: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() },
    auditLog: { findMany: jest.fn(), create: jest.fn() },
    sMSProviderConfig: { findMany: jest.fn(), upsert: jest.fn() },
    sMSCampaign: { findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    supplierDelivery: { findMany: jest.fn(), create: jest.fn(), delete: jest.fn() },
    wasteRecord: { findMany: jest.fn(), create: jest.fn(), delete: jest.fn() },
    $transaction: jest.fn((callback) => callback(prisma)),
  },
}));

// Mock next-auth
jest.mock('next-auth/next', () => ({
  __esModule: true,
  default: () => (req: any, res: any, callback: any) => callback(req, res),
}));

// Mock next/cache
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  useParams: () => ({}),
}));
