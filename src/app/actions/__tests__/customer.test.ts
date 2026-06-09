import { createCustomer } from "../customer.actions";
import { prisma } from "@/lib/db";

// Mock prisma
jest.mock("@/lib/db", () => ({
  prisma: {
    customer: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    vehicle: {
      create: jest.fn(),
    },
  },
}));

describe("Customer Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("createCustomer dovrebbe creare un cliente con successo", async () => {
    const formData = new FormData();
    formData.append("firstName", "Mario");
    formData.append("lastName", "Rossi");
    formData.append("phone", "+391234567890");
    formData.append("plate", "AB123CD");
    formData.append("brand", "Fiat");
    formData.append("model", "Panda");

    (prisma.customer.findFirst as jest.Mock).mockResolvedValueOnce(null);
    (prisma.customer.create as jest.Mock).mockResolvedValueOnce({
      id: "test-id",
      firstName: "Mario",
      lastName: "Rossi",
    });

    const result = await createCustomer(formData);

    expect(result.success).toBe(true);
    expect(prisma.customer.create).toHaveBeenCalled();
    expect(prisma.vehicle.create).toHaveBeenCalled();
  });

  test("createCustomer dovrebbe fallire se il telefono esiste già", async () => {
    const formData = new FormData();
    formData.append("firstName", "Mario");
    formData.append("lastName", "Rossi");
    formData.append("phone", "+391234567890");

    (prisma.customer.findFirst as jest.Mock).mockResolvedValueOnce({
      id: "existing-id",
      phone: "+391234567890",
    });

    const result = await createCustomer(formData);

    expect(result.success).toBe(false);
    expect(result.message).toContain("telefono");
  });
});
