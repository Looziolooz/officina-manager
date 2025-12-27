export interface JobWithDetails {
  id: string;
  status: string;
  description: string;
  kmCount: number;
  createdAt: Date;
  vehicle: {
    plate: string;
    model: string;
    customer: {
      id: string;      // <-- AGGIUNGI QUESTA RIGA
      firstName: string;
      lastName: string;
      phone: string;
    };
  };
}