import React, { useEffect, useRef, useState } from "react";

import _ from "lodash";
import styled from "styled-components";
import type { Nullable } from "types/utility-types";
import { Tooltips } from "~/tooltips";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { aselSelector, zStackSelector, pushZStack, windowPositionSelector, closeWindow } from "~redux/slices/appSlice";
import { aselEntrySelector, updateEntry } from "~redux/slices/entrySlice";
import { EdstInput, FidRow, OptionsBody, OptionsBodyCol, OptionsBodyRow, OptionsMenu, OptionsMenuHeader } from "styles/optionMenuStyles";
import { useDragging } from "hooks/useDragging";
import { useCenterCursor } from "hooks/useCenterCursor";
import { useFocused } from "hooks/useFocused";
import { EdstWindow } from "enums/edstWindow";
import { mod } from "~/utils/mod";
import { EdstDraggingOutline } from "components/utils/EdstDraggingOutline";
import { InputContainer } from "components/utils/InputComponents";
import { Row, Row2, Col1, Col2, ScrollContainer, ScrollRow, ScrollCol, ScrollCol2 } from "components/spd-hdg/styled";
import { EdstTooltip } from "components/utils/EdstTooltip";
import { EdstButton, ExitButton } from "components/utils/EdstButton";

const HeadingDiv = styled(OptionsMenu)`
  width: 20ch;
`;

export const HeadingMenu = () => {
  const asel = useRootSelector(aselSelector)!;
  const entry = useRootSelector(aselEntrySelector)!;
  const pos = useRootSelector((state) => windowPositionSelector(state, EdstWindow.HEADING_MENU));
  const zStack = useRootSelector(zStackSelector);
  const dispatch = useRootDispatch();

  const [heading, setHeading] = useState(280);
  const [deltaY, setDeltaY] = useState(0);
  const [amend, setAmend] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const focused = useFocused(ref);
  useCenterCursor(ref, [asel.aircraftId]);
  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.HEADING_MENU, "mouseup");

  useEffect(() => {
    setHeading(280);
    setDeltaY(0);
    setAmend(true);
  }, [asel]);

  const handleMouseDown = (event: React.MouseEvent, value: number, direction: Nullable<string> = null) => {
    const valueStr = direction === null ? `${amend ? "H" : ""}${value}` : `${value}${direction}`;

    switch (event.button) {
      case 0:
        if (amend) {
          dispatch(
            updateEntry({
              aircraftId: entry.aircraftId,
              data: { scratchpadHeading: null },
            })
          );
          // set assigned heading
        } else {
          dispatch(
            updateEntry({
              aircraftId: entry.aircraftId,
              data: { scratchpadHeading: valueStr },
            })
          );
          // delete assigned heading
        }
        break;
      case 1:
        if (amend) {
          // set assigned heading
        } else {
          dispatch(
            updateEntry({
              aircraftId: entry.aircraftId,
              data: { scratchpadHeading: valueStr },
            })
          );
        }
        break;
      default:
        break;
    }
    dispatch(closeWindow(EdstWindow.HEADING_MENU));
  };

  return (
    pos &&
    entry && (
      <HeadingDiv
        ref={ref}
        pos={pos}
        zIndex={zStack.indexOf(EdstWindow.HEADING_MENU)}
        onMouseDown={() => zStack.indexOf(EdstWindow.HEADING_MENU) < zStack.length - 1 && dispatch(pushZStack(EdstWindow.HEADING_MENU))}
        anyDragging={anyDragging}
        id="heading-menu"
      >
        {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} />}
        <OptionsMenuHeader focused={focused} onMouseDown={startDrag}>
          Heading Information
        </OptionsMenuHeader>
        <OptionsBody>
          <FidRow>
            {entry.aircraftId} {`${entry.aircraftType}/${entry.faaEquipmentSuffix}`}
          </FidRow>
          <Row
          // onMouseDown={() => props.openMenu(routeMenuRef.current, 'spd-hdg-menu', false)}
          >
            <OptionsBodyCol
            // onMouseDown={() => props.openMenu(routeMenuRef.current, 'spd-hdg-menu', false)}
            >
              <EdstButton content="Amend" selected={amend} onMouseDown={() => setAmend(true)} title={Tooltips.aclHdgAmend} />
            </OptionsBodyCol>
            <OptionsBodyCol alignRight>
              <EdstButton content="Scratchpad" selected={!amend} onMouseDown={() => setAmend(false)} title={Tooltips.aclHdgScratchpad} />
            </OptionsBodyCol>
          </Row>
          <Row>
            <OptionsBodyCol>
              Heading &nbsp;
              <InputContainer>
                <EdstInput value={heading} onChange={(e) => setHeading(Number(e.target.value))} />
              </InputContainer>
            </OptionsBodyCol>
          </Row>
          <Row2 topBorder justifyContent="space-between">
            <EdstTooltip title={Tooltips.aclHdgHdg}>
              <Col1>Heading</Col1>
            </EdstTooltip>
            <EdstTooltip title={Tooltips.aclHdgTurn}>
              <Col2>Turn</Col2>
            </EdstTooltip>
          </Row2>
          <Row2 bottomBorder>
            <ScrollCol noHover />
            <ScrollCol noHover />
            <ScrollCol2 noHover>L</ScrollCol2>
            <ScrollCol2 noHover>R</ScrollCol2>
          </Row2>
          <ScrollContainer onWheel={(e) => setDeltaY(deltaY + e.deltaY)}>
            {_.range(50, -70, -10).map((i) => {
              const centerHdg = mod(heading - Math.round(deltaY / 100) * 10 + i, 360);
              const centerRelHdg = 35 + i / 2;
              return (
                <ScrollRow key={i}>
                  <ScrollCol onMouseDown={(e) => handleMouseDown(e, centerHdg)}>{centerHdg.toString().padStart(3, "0")}</ScrollCol>
                  <ScrollCol onMouseDown={(e) => handleMouseDown(e, centerHdg + 5)}>{(centerHdg + 5).toString().padStart(3, "0")}</ScrollCol>
                  <ScrollCol2 onMouseDown={(e) => handleMouseDown(e, centerRelHdg, "L")}>{centerRelHdg}</ScrollCol2>
                  <ScrollCol2 onMouseDown={(e) => handleMouseDown(e, centerRelHdg, "R")}>{centerRelHdg}</ScrollCol2>
                </ScrollRow>
              );
            })}
            <Row margin="8px 0 0 0" justifyContent="center">
              <EdstButton
                content="Present Heading"
                onMouseDown={(event) => {
                  switch (event.button) {
                    case 0:
                      break;
                    case 1:
                      break;
                    default:
                      break;
                  }
                  dispatch(closeWindow(EdstWindow.HEADING_MENU));
                }}
              />
            </Row>
            <OptionsBodyRow margin="0">
              <OptionsBodyCol alignRight>
                <ExitButton onMouseDown={() => dispatch(closeWindow(EdstWindow.HEADING_MENU))} />
              </OptionsBodyCol>
            </OptionsBodyRow>
          </ScrollContainer>
        </OptionsBody>
      </HeadingDiv>
    )
  );
};