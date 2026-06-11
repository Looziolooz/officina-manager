"use client";

import { Appointment } from "@prisma/client";
import { Clock, User, Car, Wrench } from "lucide-react";

interface AppointmentCardProps {
  appointment: Appointment & {
    customer?: { firstName: string; lastName: string } | null;
    vehicle?: { plate: string; brand: string; modelName: string } | null;
  };
  onClick?: () => void;
}

const typeColors: Record<string, string> = {
  DIAGNOSTIC: "bg-blue-500/20 text-blue-600 border-blue-500/30",
  SCHEDULED_WORK: "bg-green-500/20 text-success border-green-500/30",
  PICKUP: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  OTHER: "bg-gray-500/20 text-muted-foreground border-gray-500/30",
};

const typeLabels: Record<string, string> = {
  DIAGNOSTIC: "Diagnostica",
  SCHEDULED_WORK: "Lavoro programmato",
  PICKUP: "Ritiro auto",
  OTHER: "Altro",
};

export default function AppointmentCard({ appointment, onClick }: AppointmentCardProps) {
  const startDate = new Date(appointment.startAt);
  const endDate = new Date(appointment.endAt);
  
  const timeStr = `${startDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`;
  
  const typeKey = appointment.type ?? "OTHER";
  const colorClass = typeColors[typeKey] || typeColors.OTHER;
  const typeLabel = typeLabels[typeKey] || "Altro";

  const customerName = appointment.customer
    ? `${appointment.customer.firstName} ${appointment.customer.lastName}`
    : appointment.walkInName || "Cliente non specificato";

  const vehicleInfo = appointment.vehicle
    ? `${appointment.vehicle.brand} ${appointment.vehicle.modelName} (${appointment.vehicle.plate})`
    : appointment.walkInPlate || "";

  return (
    <div 
      className={`p-2 rounded-lg border cursor-pointer hover:opacity-80 transition-opacity ${colorClass}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-1 mb-1">
        <Clock size={12} />
        <span className="text-xs font-mono">{timeStr}</span>
      </div>
      
      <p className="text-sm font-bold truncate">{customerName}</p>
      
      {vehicleInfo && (
        <div className="flex items-center gap-1 mt-1">
          <Car size={12} />
          <span className="text-xs truncate">{vehicleInfo}</span>
        </div>
      )}
      
      <div className="flex items-center gap-1 mt-1">
        <Wrench size={12} />
        <span className="text-xs">{typeLabel}</span>
      </div>
      
      {appointment.notes && (
        <p className="text-xs mt-1 opacity-80 truncate">{appointment.notes}</p>
      )}
    </div>
  );
}
