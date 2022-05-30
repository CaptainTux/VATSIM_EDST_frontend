import React, { RefObject, useCallback, useEffect, useState } from "react";
import { useEventListener } from "usehooks-ts";
import { invoke } from "@tauri-apps/api/tauri";
import { EdstMenu, EdstWindow } from "./enums";
import { anyDraggingSelector, menusSelector, setAnyDragging, setMenuPosition, setWindowPosition, windowsSelector } from "./redux/slices/appSlice";
import { useRootDispatch, useRootSelector } from "./redux/hooks";
import { WindowPosition } from "./types";

export const useFocused = (element: RefObject<HTMLElement>) => {
  const [focused, setFocused] = useState(false);
  useEventListener("mouseenter", () => setFocused(true), element);
  useEventListener("mouseleave", () => setFocused(false), element);
  return focused;
};

export const useCenterCursor = (element: RefObject<HTMLElement>, deps: any[] = []) => {
  useEffect(() => {
    // eslint-disable-next-line no-underscore-dangle
    if (window.__TAURI__ && element.current) {
      const rect = element.current.getBoundingClientRect();
      const newCursorPos = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      invoke("set_cursor_position", newCursorPos).then();
    } // eslint-disable-next-line
  }, deps);
};

const DRAGGING_REPOSITION_CURSOR: (EdstWindow | EdstMenu)[] = [
  EdstWindow.status,
  EdstWindow.outage,
  EdstWindow.messageComposeArea,
  EdstWindow.messageResponseArea,
  EdstWindow.altimeter,
  EdstWindow.metar,
  EdstWindow.sigmets
];

export const useDragging = (element: RefObject<HTMLElement>, edstWindow: EdstWindow | EdstMenu) => {
  const dispatch = useRootDispatch();
  const anyDragging = useRootSelector(anyDraggingSelector);
  const [dragging, setDragging] = useState(false);
  const windows = useRootSelector(windowsSelector);
  const menus = useRootSelector(menusSelector);
  const repositionCursor = DRAGGING_REPOSITION_CURSOR.includes(edstWindow);
  const [dragPreviewStyle, setDragPreviewStyle] = useState<any | null>(null);
  let ppos: WindowPosition | null = null;
  if (edstWindow in EdstWindow) {
    ppos = windows[edstWindow as EdstWindow].position;
  } else if (edstWindow in EdstMenu) {
    ppos = menus[edstWindow as EdstMenu].position;
  }

  useEffect(() => {
    return () => {
      dispatch(setAnyDragging(false));
    }; // eslint-disable-next-line
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const computePreviewPos = (x: number, y: number, _width: number, _height: number): { left: number; top: number } => {
    return {
      left: x - 1,
      top: y
    };
  };

  const draggingHandler = useCallback(
    (event: MouseEvent) => {
      if (event && element.current) {
        if (repositionCursor) {
          setDragPreviewStyle((prevStyle: any) => ({
            ...prevStyle,
            left: event.clientX,
            top: event.clientY
          }));
        } else {
          const { clientWidth: width, clientHeight: height } = element.current;
          setDragPreviewStyle((prevStyle: any) => ({
            ...prevStyle,
            ...computePreviewPos(event.pageX + prevStyle.relX, event.pageY + prevStyle.relY, width, height)
          }));
        }
      }
    },
    [element, repositionCursor]
  );

  const startDrag = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (element.current && ppos && !anyDragging) {
        let previewPos;
        let relX = 0;
        let relY = 0;
        // eslint-disable-next-line no-underscore-dangle
        if (window.__TAURI__) {
          invoke("set_cursor_grab", { value: true }).then();
        }
        if (DRAGGING_REPOSITION_CURSOR.includes(edstWindow)) {
          // eslint-disable-next-line no-underscore-dangle
          if (window.__TAURI__) {
            previewPos = { x: ppos.x, y: ppos.y };
            invoke("set_cursor_position", previewPos).then();
          } else {
            previewPos = { x: event.pageX, y: event.pageY };
          }
        } else {
          previewPos = { x: event.pageX, y: event.pageY };
          relX = ppos.x - event.pageX;
          relY = ppos.y - event.pageY;
        }
        const style = {
          left: previewPos.x + relX - 1,
          top: previewPos.y + relY,
          relX,
          relY,
          height: element.current.clientHeight,
          width: element.current.clientWidth
        };
        setDragPreviewStyle(style);
        setDragging(true);
        dispatch(setAnyDragging(true));
        window.addEventListener("mousemove", draggingHandler);
      }
    },
    [anyDragging, dispatch, draggingHandler, edstWindow, element, ppos]
  );

  const stopDrag = useCallback(() => {
    if (dragging && element?.current) {
      const { left: x, top: y } = dragPreviewStyle;
      const newPos = { x: x + 1, y };
      // eslint-disable-next-line no-underscore-dangle
      if (window.__TAURI__) {
        invoke("set_cursor_grab", { value: false }).then();
      }
      if (edstWindow in EdstWindow) {
        dispatch(
          setWindowPosition({
            window: edstWindow as EdstWindow,
            pos: newPos
          })
        );
      } else if (edstWindow in EdstMenu) {
        dispatch(
          setMenuPosition({
            menu: edstWindow as EdstMenu,
            pos: newPos
          })
        );
      }
      dispatch(setAnyDragging(false));
      setDragging(false);
      setDragPreviewStyle(null);
      window.removeEventListener("mousemove", draggingHandler);
    }
  }, [dispatch, dragPreviewStyle, dragging, draggingHandler, edstWindow, element]);

  return { startDrag, stopDrag, dragPreviewStyle, anyDragging };
};
