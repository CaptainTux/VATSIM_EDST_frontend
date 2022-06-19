import React, { useRef, useState } from "react";
import styled from "styled-components";
import { computeFrdString, convertBeaconCodeToString, getDepString, getDestString } from "../../lib";
import { EdstButton } from "../resources/EdstButton";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { aselEntrySelector } from "../../redux/slices/entriesSlice";
import { aselSelector, closeWindow, windowPositionSelector, pushZStack, zStackSelector } from "../../redux/slices/appSlice";
import { openMenuThunk } from "../../redux/thunks/thunks";
import { EdstTooltip } from "../resources/EdstTooltip";
import { Tooltips } from "../../tooltips";
import { useCenterCursor, useDragging, useFocused } from "../../hooks/utils";
import { EdstInput, EdstTextArea, OptionsBody, OptionsMenu, OptionsMenuHeader } from "../../styles/optionMenuStyles";
import { EdstDraggingOutline } from "../../styles/draggingStyles";
import { EdstWindow } from "../../namespaces";

const TemplateDiv = styled(OptionsMenu)`
  width: 850px;
`;
const TemplateBodyDiv = styled(OptionsBody)`
  padding: 10px 0 2px 0;
`;

const TemplateRowDiv = styled.div<{ alignRight?: boolean }>`
  padding: 2px 12px;
  display: flex;
  flex-grow: 1;
  border: none;
  overflow: hidden;

  ${props => props.alignRight && { width: "auto" }};

  &.left {
    flex-grow: 1;
  }
`;

const TemplateCol = styled.div<{ bottomRow?: boolean; alignRight?: boolean; width?: number; textIndent?: boolean }>`
  align-items: center;
  vertical-align: center;
  padding: 0 2px;
  justify-content: left;
  display: flex;
  flex-shrink: 0;
  width: ${props => (props.width ? `${props.width}px` : "auto")};
  ${props => props.textIndent && { "text-indent": "6px" }}

  ${props =>
    props.bottomRow && {
      padding: "2px"
    }}

  ${props =>
    props.alignRight && {
      width: "auto",
      "margin-left": "auto"
    }}
`;

const FlexCol = styled(TemplateCol)`
  flex-grow: 1;
  flex-shrink: 1;
  width: auto;
`;

type TemplateInputProps = {
  title?: string;
  value: string | number;
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  rows?: number;
};

const TemplateInput: React.FC<TemplateInputProps> = ({ title, ...props }) => {
  return (
    <EdstTooltip title={title} style={{ flexGrow: 1, width: "auto" }}>
      <TemplateCol style={{ flexGrow: 1, width: "auto", border: "1px solid transparent" }}>
        <EdstInput {...props} />
      </TemplateCol>
    </EdstTooltip>
  );
};
const TemplateTextArea: React.FC<TemplateInputProps> = ({ title, ...props }) => {
  return (
    <EdstTooltip title={title} style={{ flexGrow: 1, width: "auto" }}>
      <TemplateCol style={{ flexGrow: 1, width: "auto", border: "1px solid transparent" }}>
        <EdstTextArea {...props} />
      </TemplateCol>
    </EdstTooltip>
  );
};

export const TemplateMenu: React.FC = () => {
  const dispatch = useRootDispatch();
  const asel = useRootSelector(aselSelector);
  const entry = useRootSelector(aselEntrySelector);
  const pos = useRootSelector(windowPositionSelector(EdstWindow.TEMPLATE_MENU));
  const zStack = useRootSelector(zStackSelector);
  // const [displayRawRoute, setDisplayRawRoute] = useState(false);

  const route =
    (asel?.window === EdstWindow.DEP
      ? entry?.route?.concat(getDestString(entry?.destination) ?? "")
      : entry?.currentRoute?.replace(/^\.*/, "")?.concat(getDestString(entry?.destination) ?? "")) ?? "";
  const frd = entry?.referenceFix ? computeFrdString(entry.referenceFix) : "";

  const [aidInput, setAidInput] = useState(entry?.aircraftId ?? "");
  const [numInput, setNumInput] = useState(entry ? 1 : "");
  const [saiInput, setSaiInput] = useState("");
  const [typeInput, setTypeInput] = useState(entry?.equipment ?? "");
  const [equipInput, setEquipInput] = useState(entry?.equipment ?? "");
  const [beaconInput, setBeaconInput] = useState(convertBeaconCodeToString(entry?.assignedBeaconCode));
  const [speedInput, setSpeedInput] = useState(entry?.speed ?? "");
  const [frdInput, setFrdInput] = useState(frd);
  const [timeInput, setTimeInput] = useState("EXX00");
  const [altInput, setAltInput] = useState(entry?.altitude ?? "");
  const [routeInput, setRouteInput] = useState((asel?.window === EdstWindow.DEP ? (getDepString(entry?.departure) ?? "") + route : route) ?? "");
  const [rmkInput, setRmkInput] = useState(entry?.remarks ?? "");

  const ref = useRef<HTMLDivElement | null>(null);
  const focused = useFocused(ref);
  useCenterCursor(ref, [asel]);

  const { startDrag, stopDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.TEMPLATE_MENU);

  return (
    pos && (
      <TemplateDiv
        ref={ref}
        pos={pos}
        zIndex={zStack.indexOf(EdstWindow.TEMPLATE_MENU)}
        onMouseDown={() => zStack.indexOf(EdstWindow.TEMPLATE_MENU) > 0 && dispatch(pushZStack(EdstWindow.TEMPLATE_MENU))}
        anyDragging={anyDragging}
        id="template-menu"
      >
        {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} onMouseDown={stopDrag} onMouseUp={stopDrag} />}
        <OptionsMenuHeader focused={focused} onMouseDown={startDrag}>
          {asel ? "Amendment" : "Flight Plan"} Menu
        </OptionsMenuHeader>
        <TemplateBodyDiv>
          <TemplateRowDiv>
            <TemplateCol width={90} textIndent>
              AID
            </TemplateCol>
            <TemplateCol width={50} textIndent>
              NUM
            </TemplateCol>
            <TemplateCol width={50} textIndent>
              SAI
            </TemplateCol>
            <TemplateCol width={62} textIndent>
              TYP
            </TemplateCol>
            <TemplateCol width={66}>
              <EdstButton
                content="EQP..."
                onMouseDown={() => dispatch(openMenuThunk(EdstWindow.EQUIPMENT_TEMPLATE_MENU, ref.current))}
                title={Tooltips.templateMenuEqpButton}
              />
            </TemplateCol>
            <TemplateCol width={60} textIndent>
              BCN
            </TemplateCol>
            <TemplateCol width={70} textIndent>
              SPD
            </TemplateCol>
            <TemplateCol width={120} textIndent>
              FIX
            </TemplateCol>
            <TemplateCol width={70} textIndent>
              TIM
            </TemplateCol>
            <FlexCol textIndent>ALT</FlexCol>
            <TemplateCol>
              <EdstButton margin="0 2px 0 0" disabled content="More..." title={Tooltips.templateMenuMore} />
            </TemplateCol>
          </TemplateRowDiv>
          <TemplateRowDiv>
            <TemplateCol width={90}>
              <EdstTooltip title={Tooltips.templateMenuAid}>
                <TemplateInput value={aidInput} onChange={event => setAidInput(event.target.value.toUpperCase())} />
              </EdstTooltip>
            </TemplateCol>
            <TemplateCol width={50}>
              <EdstTooltip title={Tooltips.templateMenuNum}>
                <TemplateInput value={numInput} onChange={event => setNumInput(event.target.value.toUpperCase())} />
              </EdstTooltip>
            </TemplateCol>
            <TemplateCol width={50}>
              <EdstTooltip title={Tooltips.templateMenuSai}>
                <TemplateInput value={saiInput} onChange={event => setSaiInput(event.target.value.toUpperCase())} />
              </EdstTooltip>
            </TemplateCol>
            <TemplateCol width={60}>
              <EdstTooltip title={Tooltips.templateMenuTyp}>
                <TemplateInput value={typeInput} onChange={event => setTypeInput(event.target.value.toUpperCase())} />
              </EdstTooltip>
            </TemplateCol>
            <TemplateCol width={69}>
              <EdstTooltip title={Tooltips.templateMenuEqpBox}>
                <TemplateInput value={equipInput} onChange={event => setEquipInput(event.target.value.toUpperCase())} />
              </EdstTooltip>
            </TemplateCol>
            <TemplateCol width={60}>
              <EdstTooltip title={Tooltips.templateMenuBcn}>
                <TemplateInput value={beaconInput} onChange={event => setBeaconInput(event.target.value.toUpperCase())} />
              </EdstTooltip>
            </TemplateCol>
            <TemplateCol width={70}>
              <EdstTooltip title={Tooltips.templateMenuSpd}>
                <TemplateInput value={speedInput} onChange={event => setSpeedInput(event.target.value.toUpperCase())} />
              </EdstTooltip>
            </TemplateCol>
            <TemplateCol width={120}>
              <EdstTooltip title={Tooltips.templateMenuFix}>
                <TemplateInput value={frdInput} onChange={event => setFrdInput(event.target.value.toUpperCase())} />
              </EdstTooltip>
            </TemplateCol>
            <TemplateCol width={70}>
              <EdstTooltip title={Tooltips.templateMenuTim}>
                <TemplateInput value={timeInput} onChange={event => setTimeInput(event.target.value.toUpperCase())} />
              </EdstTooltip>
            </TemplateCol>
            <FlexCol>
              <EdstTooltip title={Tooltips.templateMenuAlt}>
                <TemplateInput value={altInput} onChange={event => setAltInput(event.target.value.toUpperCase())} />
              </EdstTooltip>
            </FlexCol>
          </TemplateRowDiv>
          <TemplateRowDiv>
            <TemplateCol width={50} textIndent>
              RTE
            </TemplateCol>
          </TemplateRowDiv>
          <TemplateRowDiv>
            <TemplateTextArea
              title={Tooltips.templateMenuRte}
              value={routeInput}
              onChange={event => setRouteInput(event.target.value.toUpperCase())}
              rows={3}
            />
          </TemplateRowDiv>
          <TemplateRowDiv>
            <TemplateCol width={50} textIndent>
              RMK
            </TemplateCol>
            <TemplateRowDiv alignRight />
            <TemplateCol>
              <EdstButton disabled content="Create FP..." title={Tooltips.templateMenuCreateFp} />
            </TemplateCol>
          </TemplateRowDiv>
          <TemplateRowDiv>
            <TemplateTextArea
              title={Tooltips.templateMenuRmk}
              value={rmkInput}
              onChange={event => setRmkInput(event.target.value.toUpperCase())}
              rows={3}
            />
          </TemplateRowDiv>
          <TemplateRowDiv>
            <TemplateCol bottomRow>
              <EdstButton disabled content="Send" title={Tooltips.templateMenuSend} />
            </TemplateCol>
            <TemplateCol bottomRow alignRight>
              <EdstButton content="Exit" title={Tooltips.templateMenuExit} onMouseDown={() => dispatch(closeWindow(EdstWindow.TEMPLATE_MENU))} />
            </TemplateCol>
          </TemplateRowDiv>
        </TemplateBodyDiv>
      </TemplateDiv>
    )
  );
};
