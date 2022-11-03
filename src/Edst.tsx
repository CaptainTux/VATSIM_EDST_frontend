import React, { useRef } from "react";

import { useEventListener, useInterval } from "usehooks-ts";
import styled, { ThemeProvider } from "styled-components";
import { HubConnectionState } from "@microsoft/signalr";
import { EdstHeader } from "components/EdstHeader";
import { Acl } from "components/Acl";
import { Dep } from "components/Dep";
import { Status } from "components/Status";
import { RouteMenu } from "components/RouteMenu";
import { Outage } from "components/Outage";
import { AltMenu } from "components/AltMenu";
import { PlanOptions } from "components/PlanOptions";
import { PlansDisplay } from "components/PlansDisplay";
import { SpeedMenu } from "components/spd-hdg/SpeedMenu";
import { HeadingMenu } from "components/spd-hdg/HeadingMenu";
import { HoldMenu } from "components/HoldMenu";
import { MessageComposeArea } from "components/MessageComposeArea";
import { MessageResponseArea } from "components/MessageResponseArea";
import { TemplateMenu } from "components/TemplateMenu";
import { SectorSelector } from "components/SectorSelector";
import {
  aselIsNullSelector,
  mcaCommandStringSelector,
  pushZStack,
  setMcaCommandString,
  showSectorSelectorSelector,
  windowsSelector,
} from "~redux/slices/appSlice";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { ToolsMenu } from "components/tools-components/ToolsMenu";
import { AltimeterWindow } from "components/AltimeterWindow";
import { MetarWindow } from "components/MetarWindow";
import { refreshWeatherThunk } from "~redux/thunks/weatherThunks";
import { EquipmentTemplateMenu } from "components/template-components/EquipmentTemplateMenu";
import { SigmetWindow } from "components/SigmetWindow";
import { Gpd } from "components/Gpd";
import { EdstBodyDiv, EdstDiv } from "styles/edstStyles";
import { GpdMapOptions } from "components/gpd-components/GpdMapOptions";
import { updateSweatboxAircraftThunk } from "~redux/thunks/updateSweatboxAircraftThunk";
import { EdstWindow } from "enums/edstWindow";
import { CancelHoldMenu } from "components/prompts/CancelHoldMenu";
import { GIWindow } from "components/GeneralInforationWindow";
import { AclSortMenu } from "components/acl-components/AclSortMenu";
import { DepSortMenu } from "components/dep-components/DepSortMenu";
import { openWindowThunk } from "~redux/thunks/openWindowThunk";
import { useHubActions } from "hooks/useHubActions";
import { useHubConnection } from "hooks/useHubConnection";
import { fetchAllAircraft } from "api/vNasDataApi";
import { unsafeEntries } from "~/utility-functions";
import { edstTheme } from "~/edstTheme";
import { SocketContextProvider } from "contexts/SocketContext";
import { HubContextProvider } from "contexts/HubContext";
import { WEATHER_REFRESH_RATE } from "~/utils/constants";

const NotConnectedDiv = styled.div`
  font-family: "Consolas", monospace;
  font-size: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  z-index: 100000;
  pointer-events: none;
  color: ${(props) => props.theme.colors.yellow};
`;

const NOT_CONNECTED_MSG = "HOST PROCESS COMMUNICATION DOWN";

const edstComponentMap = {
  [EdstWindow.ACL]: Acl,
  [EdstWindow.DEP]: Dep,
  [EdstWindow.GPD]: Gpd,
  [EdstWindow.PLANS_DISPLAY]: PlansDisplay,
  [EdstWindow.PLAN_OPTIONS]: PlanOptions,
  [EdstWindow.ACL_SORT_MENU]: AclSortMenu,
  [EdstWindow.DEP_SORT_MENU]: DepSortMenu,
  [EdstWindow.TOOLS_MENU]: ToolsMenu,
  [EdstWindow.GPD_MAP_OPTIONS_MENU]: GpdMapOptions,
  [EdstWindow.ROUTE_MENU]: RouteMenu,
  [EdstWindow.TEMPLATE_MENU]: TemplateMenu,
  [EdstWindow.EQUIPMENT_TEMPLATE_MENU]: EquipmentTemplateMenu,
  [EdstWindow.HOLD_MENU]: HoldMenu,
  [EdstWindow.CANCEL_HOLD_MENU]: CancelHoldMenu,
  [EdstWindow.SPEED_MENU]: SpeedMenu,
  [EdstWindow.HEADING_MENU]: HeadingMenu,
  [EdstWindow.ALTITUDE_MENU]: AltMenu,
  [EdstWindow.STATUS]: Status,
  [EdstWindow.OUTAGE]: Outage,
  [EdstWindow.ALTIMETER]: AltimeterWindow,
  [EdstWindow.METAR]: MetarWindow,
  [EdstWindow.SIGMETS]: SigmetWindow,
  [EdstWindow.GI]: GIWindow,
  [EdstWindow.MESSAGE_COMPOSE_AREA]: MessageComposeArea,
  [EdstWindow.MESSAGE_RESPONSE_AREA]: MessageResponseArea,
};

const windowRequiresAselNotNull: EdstWindow[] = [
  EdstWindow.PLAN_OPTIONS,
  EdstWindow.ROUTE_MENU,
  EdstWindow.HOLD_MENU,
  EdstWindow.CANCEL_HOLD_MENU,
  EdstWindow.SPEED_MENU,
  EdstWindow.HEADING_MENU,
  EdstWindow.ALTITUDE_MENU,
];

const Edst = () => {
  const dispatch = useRootDispatch();
  const windows = useRootSelector(windowsSelector);
  const aselIsNull = useRootSelector(aselIsNullSelector);
  const showSectorSelector = useRootSelector(showSectorSelectorSelector);
  const bodyRef = useRef<HTMLDivElement>(null);
  const hubConnection = useHubConnection();
  const hubActions = useHubActions();
  const mcaCommandString = useRootSelector(mcaCommandStringSelector);

  useInterval(() => {
    fetchAllAircraft().then((aircraftList) => {
      dispatch(updateSweatboxAircraftThunk(aircraftList, hubActions.activateFlightplan));
    });
  }, 5000);

  useInterval(() => dispatch(refreshWeatherThunk), WEATHER_REFRESH_RATE);

  const handleKeyDown = (event: KeyboardEvent) => {
    // console.log(document.activeElement?.localName);
    // event.preventDefault();
    if (
      document.activeElement?.localName !== "input" &&
      document.activeElement?.localName !== "textarea" &&
      !windows[EdstWindow.ALTITUDE_MENU].open
    ) {
      if (!windows[EdstWindow.MESSAGE_COMPOSE_AREA].open) {
        dispatch(openWindowThunk(EdstWindow.MESSAGE_COMPOSE_AREA));
        if (event.key.match(/(\w|\s|\d|\/)/gi) && event.key.length === 1) {
          dispatch(setMcaCommandString(mcaCommandString + event.key.toUpperCase()));
        }
      } else {
        dispatch(pushZStack(EdstWindow.MESSAGE_COMPOSE_AREA));
      }
    }
  };

  useEventListener("keydown", handleKeyDown);

  return (
    <ThemeProvider theme={edstTheme}>
      <EdstDiv
        ref={bodyRef}
        onContextMenu={(event) => event.preventDefault()}
        tabIndex={document.activeElement?.localName !== "input" && document.activeElement?.localName !== "textarea" ? -1 : 0}
      >
        <EdstHeader />
        {hubConnection?.state !== HubConnectionState.Connected && <NotConnectedDiv>{NOT_CONNECTED_MSG}</NotConnectedDiv>}
        <div id="toPrint" />
        <EdstBodyDiv>
          {showSectorSelector && <SectorSelector />}
          {unsafeEntries(edstComponentMap).map(
            ([edstWindow, Component]) =>
              windows[edstWindow].open &&
              (windowRequiresAselNotNull.includes(edstWindow) ? !aselIsNull && <Component key={edstWindow} /> : <Component key={edstWindow} />)
          )}
        </EdstBodyDiv>
      </EdstDiv>
    </ThemeProvider>
  );
};

const EdstProvider = () => (
  <SocketContextProvider>
    <HubContextProvider>
      <React.StrictMode>
        <Edst />
      </React.StrictMode>
    </HubContextProvider>
  </SocketContextProvider>
);

export default EdstProvider;
