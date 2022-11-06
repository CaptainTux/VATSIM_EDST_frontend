import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { Nullable } from "types/utility-types";
import type { WindowPosition } from "types/windowPosition";
import { EDST_MENU_LIST, EdstWindow } from "enums/edstWindow";
import type { OutageEntry } from "types/outageEntry";
import type { Asel } from "types/asel";
import type { AircraftId } from "types/aircraftId";
import { openWindowThunk } from "~redux/thunks/openWindowThunk";
import sharedSocket from "~socket";
import type { WindowDimension } from "types/windowDimension";
import type { RootState, RootThunkAction } from "~redux/store";

export const AIRCRAFT_MENUS = [
  EdstWindow.PLAN_OPTIONS,
  EdstWindow.ALTITUDE_MENU,
  EdstWindow.ROUTE_MENU,
  EdstWindow.PREV_ROUTE_MENU,
  EdstWindow.SPEED_MENU,
  EdstWindow.HEADING_MENU,
  EdstWindow.HOLD_MENU,
  EdstWindow.CANCEL_HOLD_MENU,
  EdstWindow.TEMPLATE_MENU,
  EdstWindow.EQUIPMENT_TEMPLATE_MENU,
];

export const FULLSCREEN_WINDOWS = [EdstWindow.ACL, EdstWindow.DEP, EdstWindow.GPD, EdstWindow.PLANS_DISPLAY];

type GIEntry = {
  text: string;
  acknowledged: boolean;
};

type AppWindow = {
  open: boolean;
  window: EdstWindow;
  position: WindowPosition;
  dimension: WindowDimension;
  isFullscreen: boolean;
};

type AppState = {
  windows: Record<EdstWindow, AppWindow>;
  anyDragging: boolean;
  mraMsg: string;
  mcaFeedbackString: string;
  giEntryMap: Record<string, GIEntry>;
  tooltipsEnabled: boolean;
  showSectorSelector: boolean;
  asel: Nullable<Asel>;
  zStack: EdstWindow[];
  outages: OutageEntry[];
};

export const defaultWindowPositions: Partial<Record<EdstWindow, WindowPosition>> = {
  [EdstWindow.STATUS]: { left: 400, top: 100 },
  [EdstWindow.OUTAGE]: { left: 400, top: 100 },
  [EdstWindow.MESSAGE_COMPOSE_AREA]: { left: 100, top: 400 },
  [EdstWindow.GPD]: { left: 0, top: 38 },
  [EdstWindow.ACL]: { left: 0, top: 38 },
  [EdstWindow.DEP]: { left: 0, top: 38 },
};

const initialWindowState: Record<EdstWindow, AppWindow> = Object.fromEntries(
  Object.values(EdstWindow).map((value) => [
    value,
    {
      open: false,
      isFullscreen: FULLSCREEN_WINDOWS.includes(value),
      position: defaultWindowPositions[value] ?? { left: 100, top: 100 },
      dimension: { width: "auto", height: "auto" },
    },
  ])
) as Record<EdstWindow, AppWindow>;

const initialState: AppState = {
  windows: initialWindowState,
  anyDragging: false,
  mraMsg: "",
  mcaFeedbackString: "",
  giEntryMap: {},
  tooltipsEnabled: true,
  showSectorSelector: false,
  asel: null,
  zStack: [],
  outages: [],
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    closeWindow(state, action: PayloadAction<EdstWindow | EdstWindow[]>) {
      if (Array.isArray(action.payload)) {
        action.payload.forEach((window) => {
          state.windows[window].open = false;
        });
      } else {
        state.windows[action.payload].open = false;
      }
    },
    openWindow(state, action: PayloadAction<EdstWindow>) {
      state.windows[action.payload].open = true;
      state.zStack = [...state.zStack.filter((window) => window !== action.payload), action.payload];
    },
    setIsFullscreen(state, action: PayloadAction<{ window: EdstWindow; value: boolean }>) {
      state.windows[action.payload.window].isFullscreen = action.payload.value;
    },
    setTooltipsEnabled(state, action: PayloadAction<boolean>) {
      state.tooltipsEnabled = action.payload;
    },
    setShowSectorSelector(state, action: PayloadAction<boolean>) {
      state.showSectorSelector = action.payload;
    },
    setWindowPosition(state, action: PayloadAction<{ window: EdstWindow; pos: WindowPosition }>) {
      state.windows[action.payload.window].position = action.payload.pos;
    },
    setWindowDimension(state, action: PayloadAction<{ window: EdstWindow; dim: WindowDimension }>) {
      state.windows[action.payload.window].dimension = action.payload.dim;
    },
    setMraMessage(state, action: PayloadAction<string>) {
      state.mraMsg = action.payload;
    },
    setMcaFeedbackString(state, action: PayloadAction<string>) {
      state.mcaFeedbackString = action.payload;
    },
    addGIEntries(state, action: PayloadAction<Record<string, GIEntry>>) {
      state.giEntryMap = { ...action.payload, ...state.giEntryMap };
    },
    setGIEntryAcknowledged(state, action: PayloadAction<string>) {
      state.giEntryMap[action.payload].acknowledged = true;
    },
    delGIEntry(state, action: PayloadAction<string>) {
      delete state.giEntryMap[action.payload];
    },
    setAsel(state, action: PayloadAction<Nullable<Asel>>) {
      state.asel = action.payload;
    },
    setAnyDragging(state, action: PayloadAction<boolean>) {
      state.anyDragging = action.payload;
    },
    pushZStack(state, action: PayloadAction<EdstWindow>) {
      state.zStack = [...state.zStack.filter((window) => window !== action.payload), action.payload];
    },
    addOutageMessage(state, action: PayloadAction<OutageEntry>) {
      state.outages = [...state.outages, action.payload];
    },
    // removes outage message at index
    delOutageMessage(state, action: PayloadAction<number>) {
      if (action.payload > -1 && action.payload < state.outages.length) {
        state.outages.splice(action.payload, 1);
      }
    },
  },
});

export const closeAllWindows = (triggerSharedState = false): RootThunkAction => {
  return (dispatch) => {
    Object.values(EdstWindow).forEach((window) => {
      dispatch(closeWindow(window, triggerSharedState));
    });
  };
};

export const closeAllMenus = (triggerSharedState = true): RootThunkAction => {
  return (dispatch) => {
    EDST_MENU_LIST.forEach((window) => {
      dispatch(closeWindow(window, triggerSharedState));
    });
    dispatch(setAsel(null, null, triggerSharedState));
  };
};

export const closeAircraftMenus = (triggerSharedState = false): RootThunkAction => {
  return (dispatch) => {
    AIRCRAFT_MENUS.forEach((window) => {
      dispatch(closeWindow(window, triggerSharedState));
    });
  };
};

export function setAsel(asel: Nullable<Asel>, eventId?: Nullable<string>, triggerSharedState = true): RootThunkAction {
  return (dispatch, getState) => {
    if (asel === null || Object.keys(getState().entries).includes(asel.aircraftId)) {
      dispatch(closeAircraftMenus());
      dispatch(appSlice.actions.setAsel(asel));
      if (triggerSharedState) {
        sharedSocket.setAircraftSelect(asel, eventId ?? null);
      }
    }
  };
}

export const setMcaResponse = (message: string): RootThunkAction => {
  return (dispatch) => {
    dispatch(openWindowThunk(EdstWindow.MESSAGE_COMPOSE_AREA));
    dispatch(appSlice.actions.setMcaFeedbackString(message));
  };
};

export const setMcaAcceptMessage = (message: string) => setMcaResponse(`ACCEPT\n${message}`);

export const setMcaRejectMessage = (message: string) => setMcaResponse(`REJECT\n${message}`);

export const setMraMessage = (message: string): RootThunkAction => {
  return (dispatch) => {
    dispatch(pushZStack(EdstWindow.MESSAGE_RESPONSE_AREA));
    dispatch(appSlice.actions.setMraMessage(message));
  };
};

export const closeWindow = (edstWindow: EdstWindow, triggerSharedState = true): RootThunkAction => {
  return (dispatch) => {
    dispatch(appSlice.actions.closeWindow(edstWindow));
    if (triggerSharedState) {
      sharedSocket.closeSharedWindow(edstWindow);
    }
  };
};

export const toggleWindow = (edstWindow: EdstWindow): RootThunkAction => {
  return (dispatch, getState) => {
    const isOpen = getState().app.windows[edstWindow].open;
    if (isOpen) {
      dispatch(closeWindow(edstWindow));
      sharedSocket.closeSharedWindow(edstWindow);
    } else {
      dispatch(openWindow(edstWindow));
      sharedSocket.openSharedWindow(edstWindow);
    }
  };
};

export const {
  setIsFullscreen,
  setTooltipsEnabled,
  setShowSectorSelector,
  setWindowPosition,
  setWindowDimension,
  openWindow,
  setAnyDragging,
  pushZStack,
  addGIEntries,
  setGIEntryAcknowledged,
  delGIEntry,
  addOutageMessage,
  delOutageMessage,
} = appSlice.actions;
export default appSlice.reducer;

export const mcaFeedbackSelector = (state: RootState) => state.app.mcaFeedbackString;
export const mraMsgSelector = (state: RootState) => state.app.mraMsg;
export const giEntryMapSelector = (state: RootState) => state.app.giEntryMap;
export const windowSelector = (state: RootState, window: EdstWindow) => state.app.windows[window];
export const windowPositionSelector = (state: RootState, window: EdstWindow) => state.app.windows[window].position;
export const windowDimensionSelector = (state: RootState, window: EdstWindow) => state.app.windows[window].dimension;
export const windowIsFullscreenSelector = (state: RootState, window: EdstWindow) => state.app.windows[window].isFullscreen;
export const aselSelector = (state: RootState) => state.app.asel;
export const aselIsNullSelector = (state: RootState) => state.app.asel === null;
export const aclAselSelector = (state: RootState) => (state.app.asel?.window === EdstWindow.ACL ? state.app.asel : null);
export const depAselSelector = (state: RootState) => (state.app.asel?.window === EdstWindow.DEP ? state.app.asel : null);
export const gpdAselSelector = (state: RootState) => (state.app.asel?.window === EdstWindow.GPD ? state.app.asel : null);
export const aircraftIsAselSelector = (state: RootState, aircraftId: AircraftId) =>
  state.app.asel?.aircraftId === aircraftId ? state.app.asel : null;
export const anyDraggingSelector = (state: RootState) => state.app.anyDragging;
export const zStackSelector = (state: RootState) => state.app.zStack;
export const outageSelector = (state: RootState) => state.app.outages;
export const windowsSelector = (state: RootState) => state.app.windows;
export const tooltipsEnabledSelector = (state: RootState) => state.app.tooltipsEnabled;
export const showSectorSelectorSelector = (state: RootState) => state.app.showSectorSelector;
