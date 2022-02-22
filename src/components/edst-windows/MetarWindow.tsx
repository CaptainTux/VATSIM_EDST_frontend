import React, {useContext, useRef, useState} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/floating-window-styles.scss';
import {EdstContext} from "../../contexts/contexts";
import {windowEnum} from "../../enums";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import {closeWindow, windowPositionSelector} from "../../redux/slices/appSlice";
import {metarSelector, removeAirportAltimeter, removeAirportMetar} from "../../redux/slices/weatherSlice";

export const MetarWindow: React.FC = () => {
  const dispatch = useAppDispatch();
  const pos = useAppSelector(windowPositionSelector(windowEnum.metar));
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedPos, setSelectedPos] = useState<{x: number, y: number, w: number} | null>(null);
  const metarList = useAppSelector(metarSelector);
  const {startDrag} = useContext(EdstContext);
  const ref = useRef(null);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>, airport: string) => {
    if (selected !== airport) {
      setSelected(airport);
      setSelectedPos({x: event.currentTarget.offsetLeft, y: event.currentTarget.offsetTop, w: event.currentTarget.offsetWidth});
    }
    else {
      setSelected(null);
      setSelectedPos(null);
    }
  }

  return pos && (<div className="floating-window metar-window"
                      ref={ref}
                      id="edst-status"
                      style={{left: pos.x + "px", top: pos.y + "px"}}
    >
      <div className="floating-window-header no-select">
        <div className="floating-window-header-left">
          M
        </div>
        <div className="floating-window-header-middle"
             onMouseDown={(event) => startDrag(event, ref, windowEnum.metar)}
        >
          WX
        </div>
        <div className="floating-window-header-right" onMouseDown={() => dispatch(closeWindow(windowEnum.metar))}>
          <div className="floating-window-header-block-6-2"/>
        </div>
      </div>
      {Object.values(metarList).length > 0 && <div className="floating-window-body">
        {Object.entries(metarList).map(([airport, airportMetarEntry]) =>
          <span className="floating-window-outer-row">
            <div className={`floating-window-row no-select margin ${selected === airport ? 'selected' : ''}`}
                 onMouseDown={(event) => handleMouseDown(event, airport)}
            >
              {airportMetarEntry.metar}
            </div>
            {selected === airport && selectedPos &&
            <div className="delete-button no-select"
                 onMouseDown={() => dispatch(removeAirportMetar(airport))}
                 style={{left: (selectedPos.x + selectedPos.w) + "px", top: selectedPos.y + "px"}}
            >
              DELETE {airport}
            </div>}
          </span>)}
      </div>}
    </div>
  );
};