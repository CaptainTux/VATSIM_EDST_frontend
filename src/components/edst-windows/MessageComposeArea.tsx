import React, {useContext, useEffect, useRef, useState} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/floating-window-styles.scss';
import {EdstContext} from "../../contexts/contexts";
import {computeFrd, formatUtcMinutes} from "../../lib";
import {EdstEntryType} from "../../types";
import {useAppDispatch, useAppSelector} from '../../redux/hooks';
import {setAclManualPosting} from "../../redux/slices/aclSlice";
import {updateEntry} from "../../redux/slices/entriesSlice";
import {aclCleanup, addAclEntryByFid, openWindowThunk} from "../../redux/thunks";
import {windowEnum} from "../../enums";
import {
  closeAllWindows,
  mcaCommandStringSelector,
  setInputFocused,
  setMcaCommandString,
  setMraMessage,
  windowPositionSelector
} from "../../redux/slices/appSlice";
import {addAltimeterThunk, addMetarThunk} from "../../redux/asyncThunks";

type MessageComposeAreaProps = {
  setMcaInputRef: (ref: React.RefObject<HTMLInputElement> | null) => void
}

export const MessageComposeArea: React.FC<MessageComposeAreaProps> = ({setMcaInputRef}) => {
  const [response, setResponse] = useState<string | null>(null);
  const [mcaFocused, setMcaFocused] = useState(false);
  const mcaCommandString = useAppSelector(mcaCommandStringSelector);
  const pos = useAppSelector(windowPositionSelector(windowEnum.messageComposeArea));
  const manualPosting = useAppSelector((state) => state.acl.manualPosting);
  const entries = useAppSelector(state => state.entries);
  const dispatch = useAppDispatch();
  const ref = useRef(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {startDrag} = useContext(EdstContext);

  useEffect(() => {
    setMcaInputRef(inputRef);
    return () => setMcaInputRef(null);
    // eslint-disable-next-line
  }, []);

  const toggleVci = (fid: string) => {
    const entry: EdstEntryType | any = Object.values(entries ?? {})
      ?.find((e: EdstEntryType) => String(e.cid) === fid || String(e.callsign) === fid || String(e.beacon) === fid);
    if (entry) {
      if (entry.vciStatus < 1) {
        dispatch(updateEntry({cid: entry.cid, data: {vciStatus: 1}}));
      } else {
        dispatch(updateEntry({cid: entry.cid, data: {vciStatus: 0}}));
      }
    }
  };

  const toggleHighlightEntry = (fid: string) => {
    const entry: EdstEntryType | any = Object.values(entries ?? {})
      ?.find((entry: EdstEntryType) => String(entry?.cid) === fid || String(entry.callsign) === fid || String(entry.beacon) === fid);
    if (entry) {
      if (entry.aclDisplay) {
        dispatch(updateEntry({cid: entry.cid, data: {aclHighlighted: !entry.aclHighlighted}}));
      }
      if (entry.depDisplay) {
        dispatch(updateEntry({cid: entry.cid, data: {depHighlighted: !entry.depHighlighted}}));
      }
    }
  };

  const flightplanReadout = (fid: string) => {
    const now = new Date();
    const utcMinutes = now.getUTCHours()*60 + now.getUTCMinutes();
    const entry: EdstEntryType | any = Object.values(entries ?? {})
      ?.find((entry: EdstEntryType) => String(entry?.cid) === fid || String(entry.callsign) === fid || String(entry.beacon) === fid);
    if (entry) {
      let msg = formatUtcMinutes(utcMinutes) + '\n'
        + `${entry.cid} ${entry.callsign} ${entry.type}/${entry.equipment} ${entry.beacon} ${entry.flightplan.ground_speed} EXX00`
        + ` ${entry.altitude} ${entry.dep}./${'.' + computeFrd(entry?.reference_fix)}..${entry._route.replace(/^\.+/, '')}`;
      dispatch(setMraMessage(msg));
    }
  };

  const parseCommand = () => {
    // TODO: rename command variable
    const [command, ...args] = mcaCommandString.split(/\s+/);
    // console.log(command, args)
    if (command.match(/\/\/\w+/)) {
      toggleVci(command.slice(2));
      setResponse(`ACCEPT\nD POS KEYBD`);
    } else {
      // TODO: break down switch cases into functions (parseUU, parseFR, ...)
      switch (command) {
        case '//': // should turn vci on/off for a CID
          toggleVci(args[0]);
          setResponse(`ACCEPT\nD POS KEYBD`);
          break;//end case //
        case 'UU':
          switch (args.length) {
            case 0:
              dispatch(openWindowThunk(windowEnum.acl));
              setResponse(`ACCEPT\nD POS KEYBD`);
              break;
            case 1:
              switch (args[0]) {
                case 'C':
                  dispatch(aclCleanup);
                  break;
                case 'D':
                  dispatch(openWindowThunk(windowEnum.dep));
                  break;
                case 'P':
                  dispatch(openWindowThunk(windowEnum.acl));
                  dispatch(setAclManualPosting(!manualPosting));
                  break;
                case 'X':
                  dispatch(closeAllWindows());
                  break;
                default:
                  dispatch(addAclEntryByFid(args[0]));
                  break;
              }
              setResponse(`ACCEPT\nD POS KEYBD`);
              break;
            case 2:
              if (args[0] === 'H') {
                toggleHighlightEntry(args[1]);
                setResponse(`ACCEPT\nD POS KEYBD`);
              } else {
                setResponse(`REJECT\n${mcaCommandString}`);
              }
              break;
            default: // TODO: give error msg
              setResponse(`REJECT\n${mcaCommandString}`);
          }
          break;//end case UU
        case 'QD':
          dispatch(addAltimeterThunk(args));
          break;
        case 'WR':
          dispatch(addMetarThunk(args));
          break;
        case 'FR':
          if (args.length === 1) {
            flightplanReadout(args[0]);
            setResponse(`ACCEPT\nREADOUT\n${mcaCommandString}`);
          } else {
            setResponse(`REJECT: MESSAGE TOO LONG\nREADOUT\n${mcaCommandString}`);
          }
          break;//end case FR
        default: // TODO: give better error msg
          setResponse(`REJECT\n\n${mcaCommandString}`);
      }
    }
    dispatch(setMcaCommandString(''));
  };

  const handleInputChange = (event: React.ChangeEvent<any>) => {
    event.preventDefault();
    dispatch(setMcaCommandString(event.target.value.toUpperCase()));
  };

  const handleKeyDown = (event: React.KeyboardEvent<any>) => {
    if (event.shiftKey) {
      (inputRef.current as HTMLInputElement).blur();
    }
    switch (event.key) {
      case "Enter":
        if (mcaCommandString.length > 0) {
          parseCommand();
        } else {
          setResponse('');
        }
        break;
      case "Escape":
        setMcaCommandString('');
        break;
      default:
        break;
    }
  };

  return pos && (<div className="floating-window mca"
                      ref={ref}
                      id="edst-mca"
                      style={{left: pos.x + "px", top: pos.y + "px"}}
                      onMouseDown={(event) => startDrag(event, ref, windowEnum.messageComposeArea)}
      // onMouseEnter={() => setInputFocus()}
    >
      <div className="mca-input-area">
        <input
          ref={inputRef}
          onFocus={() => {
            dispatch(setInputFocused(true));
            setMcaFocused(true);
          }}
          onBlur={() => {
            dispatch(setInputFocused(false));
            setMcaFocused(false);
          }}
          tabIndex={mcaFocused ? -1 : undefined}
          value={mcaCommandString}
          onChange={handleInputChange}
          onKeyDownCapture={handleKeyDown}
        />
      </div>
      <div className="mca-response-area">
        {response}
      </div>
    </div>
  );
};
