import React, {useEffect, useRef, useState} from 'react';
import {REMOVAL_TIMEOUT, removeDestFromRouteString} from "../../../lib";
import {EdstTooltip} from "../../resources/EdstTooltip";
import {Tooltips} from "../../../tooltips";
import {LocalEdstEntryType} from "../../../types";
import {deleteDepEntry, toggleSpa, updateEntry} from "../../../redux/slices/entriesSlice";
import {useRootDispatch, useRootSelector} from "../../../redux/hooks";
import {depRowFieldEnum, menuEnum, windowEnum} from "../../../enums";
import {aselSelector, setInputFocused} from "../../../redux/slices/appSlice";
import {depAircraftSelect} from "../../../redux/thunks/thunks";
import {amendEntryThunk} from "../../../redux/thunks/entriesThunks";
import {BodyRowContainerDiv, BodyRowDiv, FreeTextRow, InnerRow, InnerRow2} from "../../../styles/bodyStyles";
import {
  AircraftTypeCol,
  AltCol,
  AltColDiv,
  DepCol2,
  FidCol,
  HotBox,
  RadioCol,
  RouteAmendmentSpan,
  RouteCol,
  RouteSpan,
  SpecialBox
} from "./DepStyled";
import {CodeCol} from "../acl-components/AclStyled";

const SPA_INDICATOR = '\u2303';
const COMPLETED_SYMBOL = '✓';

type DepRowProps = {
  entry: LocalEdstEntryType,
  hidden: depRowFieldEnum[],
  index: number,
}

export const DepRow: React.FC<DepRowProps> = ({entry, hidden, index}) => {
  const dispatch = useRootDispatch();
  const asel = useRootSelector(aselSelector);
  const [aarAvail, setAarAvail] = useState(false);
  const [onAar, setOnAar] = useState(false);
  const [adrAvail, setAdrAvail] = useState(false);
  const [onAdr, setOnAdr] = useState(false);

  const now = new Date().getTime();
  const route = removeDestFromRouteString(entry.route.slice(0), entry.dest);

  const [freeTextContent, setFreeTextContent] = useState(entry.free_text_content ?? '');
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const currentFixNames = entry.route_data.map(fix => fix.name);
    const aarAvail = !!entry.aarList?.filter((aar) => aar.eligible && currentFixNames.includes(aar.tfix)).length;
    const onAar = !!entry.aarList?.filter((aar) => aar.onEligibleAar)?.length;
    setAarAvail(aarAvail);
    setOnAar(onAar);

    const adrAvail = !!entry.adr.filter((adr) => adr.eligible).length;
    const onAdr = entry.adr.filter((adr) => route.startsWith(adr.amendment.adr_amendment))?.length > 0;
    setAdrAvail(adrAvail);
    setOnAdr(onAdr);
  }, [entry.aarList, entry.adr, entry.route_data, route]);

  const checkAarReroutePending = () => {
    const currentFixNames = (entry._route_data ?? entry.route_data).map(fix => fix.name);
    const eligibleAar = entry._aarList?.filter((aar) => aar.eligible);
    if (eligibleAar?.length === 1) {
      const aar = eligibleAar[0];
      if (currentFixNames.includes(aar.tfix)) {
        return aar.aar_amendment_route_string;
      }
    }
    return null;
  };

  const checkAdrReroutePending = (routes: ({ eligible: boolean, order: string, ierr: any[] } & any)[]) => {
    const eligibleRoutes = routes.filter((adr) => adr.eligible);
    if (eligibleRoutes?.length > 0) {
      const eligibleRnavRoutes = eligibleRoutes.filter((adr) => adr.ierr.length > 0);
      if (eligibleRnavRoutes.length > 0) {
        return eligibleRnavRoutes.sort((u: { order: string }, v: { order: string }) => Number(u.order) - Number(v.order))[0].amendment.adr_amendment;
      } else {
        return eligibleRoutes.sort((u: { order: string }, v: { order: string }) => Number(u.order) - Number(v.order))[0].amendment.adr_amendment;
      }
    }
    return null;
  };

  const pendingAdr = checkAdrReroutePending(entry.adr);
  // const pendingAdar = checkAdrReroutePending(entry.adar);
  const pendingAar = checkAarReroutePending();

  const handleHotboxMouseDown = (event: React.MouseEvent) => {
    event.preventDefault();
    if (event.button === 0) {
      dispatch(updateEntry({cid: entry.cid, data: {showFreeText: !entry.showFreeText}}));
      dispatch(amendEntryThunk({cid: entry.cid, planData: {free_text_content: freeTextContent}}));
    }
    if (event.button === 1) {
      dispatch(toggleSpa(entry.cid));
    }
    if (event.button === 2) {
      dispatch(updateEntry({cid: entry.cid, data: {depHighlighted: !entry.depHighlighted}}));
    }
  };

  const updateStatus = () => {
    if (entry.depStatus === -1) {
      dispatch(updateEntry({cid: entry.cid, data: {depStatus: 0}}));
    } else {
      if (entry.depStatus < 1) {
        dispatch(updateEntry({cid: entry.cid, data: {depStatus: 1}}));
      } else {
        dispatch(updateEntry({cid: entry.cid, data: {depStatus: 0}}));
      }
    }
  };

  useEffect(() => (() => {
    if (freeTextContent !== entry.free_text_content) {
      dispatch(amendEntryThunk({cid: entry.cid, planData: {free_text_content: freeTextContent}}));
    } // eslint-disable-next-line
  }), []);

  const handleFidClick = (event: React.MouseEvent) => {
    const now = new Date().getTime();
    switch (event.button) {
      case 2:
        if (now - (entry.pendingRemoval ?? now) > REMOVAL_TIMEOUT) {
          dispatch(deleteDepEntry(entry.cid));
        }
        break;
      default:
        dispatch(depAircraftSelect(event, entry.cid, depRowFieldEnum.fid));
        break;

    }
  };

  const isSelected = (cid: string, field: depRowFieldEnum): boolean => {
    return asel?.window === windowEnum.dep && asel?.cid === cid && asel?.field === field;
  };

  return (<BodyRowContainerDiv separator={index % 3 === 2}
                               key={`dep-row-container-${entry.cid}`}
                               onContextMenu={(event) => event.preventDefault()}>
    <BodyRowDiv pendingRemoval={(now - (entry.pendingRemoval ?? now) > REMOVAL_TIMEOUT)}>
      <EdstTooltip title={Tooltips.depCheckmarkNBtn}>
        <RadioCol checked={entry.depStatus === 1} onMouseDown={updateStatus}>
          {entry.depStatus === -1 && 'N'}{entry.depStatus === 1 && COMPLETED_SYMBOL}
        </RadioCol>
      </EdstTooltip>
      <DepCol2>
        0000
      </DepCol2>
      <InnerRow highlight={entry.depHighlighted} ref={ref}
                style={{minWidth: entry.showFreeText ? '1200px' : 0}}
      >
        <EdstTooltip title={Tooltips.depFlightId}>
          <FidCol hover={true} selected={isSelected(entry.cid, depRowFieldEnum.fid)}
                  onMouseDown={handleFidClick}
                  onContextMenu={(event) => event.preventDefault()}
          >
            {entry.cid} {entry.callsign}{entry.voiceType === 'r' ? '/R' : entry.voiceType === 't' ? '/T' : ''}
          </FidCol>
        </EdstTooltip>
        <SpecialBox disabled={!entry.spa}>
          {entry.spa && SPA_INDICATOR}
        </SpecialBox>
        <EdstTooltip title={Tooltips.depHotbox}>
          <HotBox onMouseDown={handleHotboxMouseDown}>
            {freeTextContent && '*'}
          </HotBox>
        </EdstTooltip>
        <EdstTooltip title={Tooltips.depType}>
          <AircraftTypeCol contentHidden={hidden.includes(depRowFieldEnum.type)} hover={true}
                           selected={isSelected(entry.cid, depRowFieldEnum.type)}
                           onMouseDown={(event) => dispatch(depAircraftSelect(event, entry.cid, depRowFieldEnum.type))}
          >
            {`${entry.type}/${entry.equipment}`}
          </AircraftTypeCol>
        </EdstTooltip>
        <EdstTooltip title={Tooltips.depAlt}>
          <AltCol>
            <AltColDiv selected={isSelected(entry.cid, depRowFieldEnum.alt)}
                       onMouseDown={(event) => dispatch(depAircraftSelect(event, entry.cid, depRowFieldEnum.alt, null, menuEnum.altitudeMenu))}
            >
              {entry.altitude}
            </AltColDiv>
          </AltCol>
        </EdstTooltip>
        <EdstTooltip title={Tooltips.depCode}>
          <CodeCol contentHidden={hidden.includes(depRowFieldEnum.code)} hover={true}
                   selected={isSelected(entry.cid, depRowFieldEnum.code)}
                   onMouseDown={(event) => dispatch(depAircraftSelect(event, entry.cid, depRowFieldEnum.code))}
          >
            {entry.beacon}
          </CodeCol>
        </EdstTooltip>
        <EdstTooltip title={Tooltips.depRoute}>
          <RouteCol hover={true} selected={isSelected(entry.cid, depRowFieldEnum.route)}
                    onMouseDown={(event) => dispatch(depAircraftSelect(event, entry.cid, depRowFieldEnum.route, null, menuEnum.routeMenu))}
          >
            <RouteSpan padding="0 2px">
              <RouteSpan>
                {/*className={`${((aarAvail && !onAar) || (adrAvail && !onAdr)) ? 'amendment-1' : ''} ${isSelected(entry.cid, depRowFieldEnum.route) ? 'selected' : ''}`}>*/}
                {entry.dep}
              </RouteSpan>
              {pendingAdr && !onAdr &&
                  <RouteAmendmentSpan selected={isSelected(entry.cid, depRowFieldEnum.route)}>
                    {`[${pendingAdr}]`}
                  </RouteAmendmentSpan>}
              {route}
              {pendingAar && !onAar &&
                  <RouteAmendmentSpan selected={isSelected(entry.cid, depRowFieldEnum.route)}>
                    {`[${pendingAar}]`}
                  </RouteAmendmentSpan>}
              {route?.slice(-1) !== '.' && '..'}{entry.dest}
            </RouteSpan>
          </RouteCol>
        </EdstTooltip>
      </InnerRow>
    </BodyRowDiv>
    {entry.showFreeText && <BodyRowDiv>
        <RadioCol disabled={true}/>
        <DepCol2/>
        <InnerRow2 highlight={entry.depHighlighted} minWidth={Math.max(1200, ref?.current?.clientWidth ?? 0)}>
            <FreeTextRow marginLeft={202}>
                <input
                    onFocus={() => dispatch(setInputFocused(true))}
                    onBlur={() => dispatch(setInputFocused(false))}
                    value={freeTextContent}
                    onChange={(event) => setFreeTextContent(event.target.value.toUpperCase())}/>
            </FreeTextRow>
        </InnerRow2>
    </BodyRowDiv>}
  </BodyRowContainerDiv>);
};