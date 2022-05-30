import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { AirwayFix, Fix } from "../../types";

export enum SectorType {
  ultraLow = "UL",
  low = "L",
  high = "H",
  ultraHigh = "UH",
  lowHigh = "LH"
}

export enum mapFeatureOption {
  ultraLowSectors = "Ultra Low",
  lowSectors = "Low",
  highSectors = "High",
  ultraHighSectors = "Ultra High",
  centerBoundaries = "Center Boundaries",
  approachBoundaries = "Approach Control Boundaries",
  airport = "Airport",
  airportLabels = "Airport Labels",
  Jairways = "J Airways",
  Qairways = "Q Airways",
  Vairways = "V Airways",
  Tairways = "T Airways",
  navaid = "NAVAIDS",
  navaidLabels = "NAVAID Labels",
  waypoint = "Waypoints",
  waypointLabels = "Waypoint Labels"
}

export type MapFeatureOptions = Partial<Record<mapFeatureOption, boolean>>;

export type AircraftDisplayOptions = {
  aircraftListFilter: ["Aircraft List Filter", boolean];
  altitudeFilterLimits: ["Altitude Filter Limits", boolean];
  filterAbove: ["Filter Above", number | null];
  filterBelow: ["Filter Below", number | null];
  autoDatablockOffset: ["Auto Datablock Offset", boolean];
  mspLabels: ["MSP/MEP Labels", boolean];
  routePreviewMinutes: ["Route Preview (minutes)", number];
};

export type GpdState = {
  mapFeatureOptions: MapFeatureOptions;
  aircraftDisplayOptions: AircraftDisplayOptions;
  sectorTypes: Record<string, SectorType>;
  navaids: Fix[];
  waypoints: Fix[];
  airways: Record<string, AirwayFix[]>;
  suppressed: boolean;
  planData: Record<string, any>[];
};

const initialMapFeatureOptionsState = {
  [mapFeatureOption.lowSectors]: true,
  [mapFeatureOption.highSectors]: true
};

const initialState: GpdState = {
  mapFeatureOptions: initialMapFeatureOptionsState,
  sectorTypes: {},
  navaids: [],
  waypoints: [],
  airways: {},
  aircraftDisplayOptions: {
    aircraftListFilter: ["Aircraft List Filter", false],
    altitudeFilterLimits: ["Altitude Filter Limits", false],
    filterAbove: ["Filter Above", null],
    filterBelow: ["Filter Below", null],
    autoDatablockOffset: ["Auto Datablock Offset", false],
    mspLabels: ["MSP/MEP Labels", false],
    routePreviewMinutes: ["Route Preview (minutes)", 0]
  },
  suppressed: false,
  planData: []
};

const gpdSlice = createSlice({
  name: "gpd",
  initialState: initialState as GpdState,
  reducers: {
    addGpdPlanData(state, action: { payload: Record<string, any> }) {
      state.planData.push(action.payload);
    },
    removeGpdPlanData(state, action: { payload: number }) {
      if (action.payload < state.planData.length - 1 && action.payload >= 0) {
        state.planData.splice(action.payload);
      }
    },
    setMapFeatureOptions(state, action: { payload: MapFeatureOptions }) {
      state.mapFeatureOptions = action.payload;
    },
    setAircraftDisplayOptions(state, action: { payload: AircraftDisplayOptions }) {
      state.aircraftDisplayOptions = action.payload;
    },
    setSectorTypes(state, action: { payload: Record<string, SectorType> }) {
      state.sectorTypes = action.payload;
    },
    setNavaids(state, action: { payload: Fix[] }) {
      state.navaids = action.payload;
    },
    setWaypoints(state, action: { payload: Fix[] }) {
      state.waypoints = action.payload;
    },
    setAirways(state, action: { payload: AirwayFix[] }) {
      action.payload.forEach(segment => {
        if (!state.airways[segment.airway]) {
          state.airways[segment.airway] = [];
        }
        state.airways[segment.airway].push(segment);
      });
    },
    setSuppressed(state, action: { payload: boolean }) {
      state.suppressed = action.payload;
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    toggleSuppressed(state, action: { payload?: any }) {
      state.suppressed = !state.suppressed;
    }
  }
});

export const {
  addGpdPlanData,
  removeGpdPlanData,
  setMapFeatureOptions,
  setAircraftDisplayOptions,
  setSectorTypes,
  setNavaids,
  setWaypoints,
  setAirways,
  setSuppressed,
  toggleSuppressed
} = gpdSlice.actions;
export default gpdSlice.reducer;

export const gpdMapFeatureOptionsSelector = (state: RootState) => state.gpd.mapFeatureOptions;
export const gpdSuppressedSelector = (state: RootState) => state.gpd.suppressed;
export const gpdAircraftDisplayOptionsSelector = (state: RootState) => state.gpd.aircraftDisplayOptions;
export const gpdSectorTypesSelector = (state: RootState) => state.gpd.sectorTypes;
export const gpdNavaidSelector = (state: RootState) => state.gpd.navaids;
export const gpdWaypointSelector = (state: RootState) => state.gpd.waypoints;
export const gpdAirwaySelector = (state: RootState) => state.gpd.airways;
export const gpdPlanDataSelector = (state: RootState) => state.gpd.planData;
