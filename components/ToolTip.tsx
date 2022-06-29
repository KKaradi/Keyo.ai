import Tooltip from "@mui/material/Tooltip";
import type { NextPage } from "next/types";
import { ReactElement } from "react";

type ToolTipProps = {
  title: string;
  children: ReactElement;
};

const ToolTip: NextPage<ToolTipProps> = ({ title, children }) => {
  return (
    <Tooltip
      title={title}
      PopperProps={{
        modifiers: [
          {
            name: "offset",
            options: {
              offset: [0, -10],
            },
          },
        ],
      }}
    >
      {children}
    </Tooltip>
  );
};

export default ToolTip;
