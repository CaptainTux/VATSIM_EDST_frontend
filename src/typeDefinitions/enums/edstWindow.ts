export enum EdstWindow {
  ACL = "ACL_WINDOW",
  DEP = "DEP_WINDOW",
  GPD = "GPD_WINDOW",
  PLANS_DISPLAY = "PLANS_DISPLAY_WINDOW",
  MESSAGE_COMPOSE_AREA = "MESSAGE_COMPOSE_AREA_WINDOW",
  MESSAGE_RESPONSE_AREA = "MESSAGE_RESPONSE_AREA_WINDOW",
  STATUS = "STATUS_WINDOW",
  OUTAGE = "OUTAGE_WINDOW",
  METAR = "METAR_WINDOW",
  UA = "UA_WINDOW",
  SIGMETS = "SIGMETS_WINDOW",
  NOTAMS = "NOTAMS_WINDOW",
  GI = "GI_WINDOW",
  ADSB = "ADSB_WINDOW",
  SAT = "SAT_WINDOW",
  MSG = "MSG_WINDOW",
  WIND = "WIND_WINDOW",
  ALTIMETER = "ALTIMETER_WINDOW",
  FEL = "FEL_WINDOW",
  MORE = "MORE_WINDOW",
  CPDLC_HIST = "CPDLC_HIST_WINDOW",
  CPDLC_MSG = "CPDLC_MSG_WINDOW",
  // MENUS
  PLAN_OPTIONS = "PLAN_OPTIONS_WINDOW",
  ACL_SORT_MENU = "ACL_SORT_MENU_WINDOW",
  DEP_SORT_MENU = "DEP_SORT_MENU_WINDOW",
  TOOLS_MENU = "TOOLS_MENU_WINDOW",
  ALTITUDE_MENU = "ALTITUDE_MENU_WINDOW",
  ROUTE_MENU = "ROUTE_MENU_WINDOW",
  SPEED_MENU = "SPEED_MENU_WINDOW",
  HEADING_MENU = "HEADING_MENU_WINDOW",
  HOLD_MENU = "HOLD_MENU_WINDOW",
  TEMPLATE_MENU = "TEMPLATE_MENU_WINDOW",
  EQUIPMENT_TEMPLATE_MENU = "EQUIPMENT_TEMPLATE_MENU_WINDOW",
  GPD_MAP_OPTIONS_MENU = "GPD_MAP_OPTIONS_MENU_WINDOW",
  // PROMPTS
  PREV_ROUTE_MENU = "PREV_ROUTE_MENU_WINDOW",
  CANCEL_HOLD_MENU = "CANCEL_HOLD_MENU_WINDOW",
  CHANGE_DEST_MENU = "CHANGE_DEST_MENU_WINDOW"
}

export const EDST_MENU_LIST = [
  EdstWindow.PLAN_OPTIONS,
  EdstWindow.ACL_SORT_MENU,
  EdstWindow.DEP_SORT_MENU,
  EdstWindow.TOOLS_MENU,
  EdstWindow.ALTITUDE_MENU,
  EdstWindow.ROUTE_MENU,
  EdstWindow.PREV_ROUTE_MENU,
  EdstWindow.SPEED_MENU,
  EdstWindow.HEADING_MENU,
  EdstWindow.HOLD_MENU,
  EdstWindow.CANCEL_HOLD_MENU,
  EdstWindow.TEMPLATE_MENU,
  EdstWindow.EQUIPMENT_TEMPLATE_MENU,
  EdstWindow.GPD_MAP_OPTIONS_MENU
];