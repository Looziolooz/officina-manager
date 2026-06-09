import { createJob, updateJobStatus } from "../workshop";
import { prisma } from "@/lib/db";
import { JobStatus } from "@prisma/client";

jest.mock("@/lib/db", () => ({
  prisma: {
    job: {
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    vehicle: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(prisma)),
  },
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

describe("Workshop Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("createJob dovrebbe creare un lavoro con successo", async () => {
    const formData = new FormData();
    formData.append("title", "Cambio olio");
    formData.append("vehicleId", "vehicle-123");
    formData.append("scheduledDate", "2024-12-01");
    formData.append("kmAtEntry", "50000");

    (prisma.vehicle.findUnique as jest.Mock).mockResolvedValueOnce({
      id: "vehicle-123",
      ownerId: "customer-123",
      totalKm: 45000,
    });

    (prisma.job.count as jest.Mock).mockResolvedValueOnce(5);
    (prisma.job.create as jest.Mock).mockResolvedValueOnce({
      id: "job-123",
      jobNumber: "JOB-2024-0006",
    });

    await createJob(formData);

    expect(prisma.job.create).toHaveBeenCalled();
    expect(prisma.vehicle.update).toHaveBeenCalled();
  });

  test("updateJobStatus dovrebbe aggiornare lo stato", async () => {
    (prisma.job.update as jest.Mock).mockResolvedValueOnce({});

    const result = await updateJobStatus("job-123", JobStatus.IN_PROGRESS);

    expect(result.success).toBe(true);
    expect(prisma.job.update).toHaveBeenCalledWith({
      where: { id: "job-123" },
      data: { status: JobStatus.IN_PROGRESS },
    });
  });
});
