import React, { useMemo, useRef, useState } from "react";
import styled from "styled-components";
import type { Nullable } from "types/utility-types";
import { zStackSelector } from "~redux/slices/appSlice";
import type { SigmetEntry } from "~redux/slices/weatherSlice";
import {
  setSigmetAcknowledged,
  setSigmetSuppressed,
  setViewSuppressedSigmet,
  sigmetSelector,
  viewSuppressedSigmetSelector,
} from "~redux/slices/weatherSlice";
import { FloatingWindowRow } from "styles/floatingWindowStyles";
import { ScrollContainer } from "styles/optionMenuStyles";
import { sectorIdSelector } from "~redux/slices/sectorSlice";
import { EdstWindow } from "enums/edstWindow";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { windowOptionsSelector } from "~redux/slices/windowOptionsSlice";
import { FloatingWindowOptionContainer } from "components/utils/FloatingWindowOptionContainer";
import { FloatingWindow } from "components/utils/FloatingWindow";

const SigmetRowDiv = styled(FloatingWindowRow)`
  margin-top: 6px;
`;

type SigmetRowProps = {
  sigmetEntry: SigmetEntry;
  selected: boolean;
  handleMouseDown: React.MouseEventHandler<HTMLDivElement>;
  onSuppress: () => void;
};
const SigmetRow = ({ sigmetEntry, selected, handleMouseDown, onSuppress }: SigmetRowProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const zStack = useRootSelector(zStackSelector);
  const windowOptions = useRootSelector(windowOptionsSelector(EdstWindow.SIGMETS));

  const zIndex = zStack.indexOf(EdstWindow.SIGMETS);
  const rect = ref.current?.getBoundingClientRect();

  return (
    <>
      <SigmetRowDiv
        ref={ref}
        brightness={windowOptions.brightness}
        selected={selected}
        suppressed={sigmetEntry.suppressed}
        onMouseDown={handleMouseDown}
      >
        {sigmetEntry.text}
      </SigmetRowDiv>
      {selected && rect && (
        <FloatingWindowOptionContainer
          parentWidth={rect.width}
          parentPos={rect}
          zIndex={zIndex}
          options={{
            toggleSuppressed: {
              value: !sigmetEntry.suppressed ? "SUPPRESS" : "RESTORE",
              backgroundColor: "#575757",
              onMouseDown: onSuppress,
            },
          }}
        />
      )}
    </>
  );
};

export const SigmetWindow = () => {
  const dispatch = useRootDispatch();
  const sectorId = useRootSelector(sectorIdSelector);
  const viewSuppressed = useRootSelector(viewSuppressedSigmetSelector);
  const sigmetList = useRootSelector(sigmetSelector);
  const [selectedEntry, setSelectedEntry] = useState<Nullable<string>>(null);

  const [showOptions, setShowOptions] = useState(false);
  const extraOptions = useMemo(
    () => ({
      viewSuppressed: {
        value: "VIEW SUPPRESS",
        backgroundColor: viewSuppressed ? "#575757" : "#000000",
        onMouseDown: () => dispatch(setViewSuppressedSigmet(true)),
      },
      hideSuppressed: {
        value: "HIDE SUPPRESS",
        backgroundColor: !viewSuppressed ? "#575757" : "#000000",
        onMouseDown: () => dispatch(setViewSuppressedSigmet(false)),
      },
      printAll: { value: "PRINT ALL", backgroundColor: "#000000" },
    }),
    [dispatch, viewSuppressed]
  );

  const handleEntryMouseDown = (event: React.MouseEvent<HTMLDivElement>, sigmetId: string) => {
    setShowOptions(false);
    if (selectedEntry !== sigmetId) {
      if (!sigmetList[sigmetId].acknowledged) {
        dispatch(setSigmetAcknowledged({ id: sigmetId, value: true }));
      }
      setSelectedEntry(sigmetId);
    } else {
      setSelectedEntry(null);
    }
  };

  const setShowOptionsHandler = (value: boolean) => {
    if (value) {
      setSelectedEntry(null);
    }
    setShowOptions(value);
  };

  return (
    <FloatingWindow
      title={`SIGMETS SECTOR ${sectorId}`}
      optionsHeaderTitle="SIGMETS"
      width="130ch"
      window={EdstWindow.SIGMETS}
      extraOptions={extraOptions}
      showOptions={showOptions}
      setShowOptions={setShowOptionsHandler}
    >
      {Object.values(sigmetList).length > 0 && (
        <ScrollContainer maxHeight="600px">
          {Object.entries(sigmetList).map(
            ([sigmetId, sigmetEntry]) =>
              (!sigmetEntry.suppressed || viewSuppressed) && (
                <SigmetRow
                  key={sigmetId}
                  sigmetEntry={sigmetEntry}
                  selected={selectedEntry === sigmetId}
                  handleMouseDown={(event) => handleEntryMouseDown(event, sigmetId)}
                  onSuppress={() => {
                    dispatch(
                      setSigmetSuppressed({
                        id: sigmetId,
                        value: !sigmetEntry.suppressed,
                      })
                    );
                    setSelectedEntry(null);
                  }}
                />
              )
          )}
        </ScrollContainer>
      )}
    </FloatingWindow>
  );
};