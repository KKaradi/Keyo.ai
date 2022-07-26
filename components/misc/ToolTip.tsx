import type { NextPage } from "next/types";
import { ReactElement } from "react";
import Tooltip from "@mui/material/Tooltip";

type ToolTipProps = {
  title: string;
  children: ReactElement;
  offset?: number;
};

const ToolTip: NextPage<ToolTipProps> = ({ title, children, offset }) => {
  return (
    <Tooltip
      style={{ cursor: "pointer" }}
      title={title}
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
