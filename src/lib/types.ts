export interface JobWithDetails {
  id: string;
  status: string;
  description: string;
  kmCount: number;
  laborCost: number;   // Costo manodopera
  partsCost: number;   // Costo ricambi dal magazzino
  totalCost: number;   // Totale complessivo
  createdAt: Date;
  vehicle: {
    plate: string;
    model: string;
    customer: {
      id: string;
      firstName: string;
      lastName: string;
      phone: string;
    };
  };
}