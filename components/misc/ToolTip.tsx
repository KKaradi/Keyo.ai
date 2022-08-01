import type { NextPage } from "next/types";
import { ReactElement } from "react";
import Tooltip from "@mui/material/Tooltip";

type Placement =
  | "bottom-end"
  | "bottom-start"
  | "bottom"
  | "left-end"
  | "left-start"
  | "left"
  | "right-end"
  | "right-start"
  | "right"
  | "top-end"
  | "top-start"
  | "top";

type ToolTipProps = {
  title: string;
  children: ReactElement;
  offset?: number;
  placement?: Placement;
};

const ToolTip: NextPage<ToolTipProps> = ({
  title,
  children,
  offset,
  placement,
}) => {
  return (
    <Tooltip
      style={{ cursor: "pointer" }}
      title={title}
      placement={placement}
      PopperProps={{
        modifiers: [
          { name: "offset", options: { offset: [0, offset ?? -10] } },
        ],
      }}
    >
      {children}
    </Tooltip>
  );
};

export default ToolTip;
