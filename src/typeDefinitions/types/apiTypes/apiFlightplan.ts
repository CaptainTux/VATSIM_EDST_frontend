import type { HoldAnnotations } from "types/hold/holdAnnotations";
import type { AircraftId } from "types/aircraftId";
import type { Nullable } from "types/utility-types";

export type ApiFlightplan = {
  aircraftId: AircraftId;
  cid: string;
  status: "Proposed" | "Active" | "Tentative";
  assignedBeaconCode: Nullable<number>;
  equipment: string;
  aircraftType: string;
  icaoEquipmentCodes: string;
  icaoSurveillanceCodes: string;
  faaEquipmentSuffix: string;
  speed: number;
  altitude: string;
  departure: string;
  destination: string;
  alternate: string;
  route: string;
  estimatedDepartureTime: number;
  actualDepartureTime: number;
  fuelHours: number;
  fuelMinutes: number;
  hoursEnroute: number;
  minutesEnroute: number;
  pilotCid: string;
  remarks: string;
  holdAnnotations: Nullable<HoldAnnotations>;
};
