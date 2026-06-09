import { createUser, updateUser, deleteUser } from "../users";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

jest.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  },
}));

jest.mock("bcryptjs", () => ({
  __esModule: true,
  default: {
    hash: jest.fn().mockResolvedValue("hashed-password"),
    compare: jest.fn(),
  },
}));

describe("User Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("createUser dovrebbe creare un utente con successo", async () => {
    const formData = new FormData();
    formData.append("email", "test@example.com");
    formData.append("name", "Test User");
    formData.append("password", "password123");
    formData.append("role", "VIEWER");

    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
    (prisma.user.create as jest.Mock).mockResolvedValueOnce({
      id: "new-user-id",
      email: "test@example.com",
    });

    const result = await createUser(formData);

    expect(result.success).toBe(true);
    expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
    expect(prisma.user.create).toHaveBeenCalled();
  });

  test("createUser dovrebbe fallire se email esiste già", async () => {
    const formData = new FormData();
    formData.append("email", "existing@example.com");
    formData.append("name", "Test User");
    formData.append("password", "password123");

    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
      id: "existing-id",
      email: "existing@example.com",
    });

    const result = await createUser(formData);

    expect(result.success).toBe(false);
    expect(result.message).toContain("già registrata");
  });

  test("deleteUser dovrebbe impedire eliminazione ultimo admin", async () => {
    (prisma.user.count as jest.Mock).mockResolvedValueOnce(1);
    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
      id: "admin-id",
      role: "ADMIN",
    });

    const result = await deleteUser("admin-id");

    expect(result.success).toBe(false);
    expect(result.message).toContain("unico amministratore");
  });
});
