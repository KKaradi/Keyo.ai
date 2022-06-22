import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import type { NextPage } from "next/types";

const bull = (
  <Box
    component="span"
    sx={{ display: "inline-block", mx: "2px", transform: "scale(0.8)" }}
  >
    •
  </Box>
);

type TextCardProps = {
  text: string;
};

const TextCard: NextPage<TextCardProps> = ({ text }) => {
  return (
    <Box sx={{ minWidth: 275, maxWidth: 400 }}>
      <Card variant="outlined">
        <React.Fragment>
          <CardContent>
            <Typography variant="h4" color="text.primary">
              What is this?
            </Typography>
            <Typography variant="body2">
              Click an image to the right. The image that is, in your opinion,
              the best image. Perhaps it&apos;s particularly appealing to you
              from an aesthetic point of view, perhaps it&apos;s visually
              displeasing but in an impressive way, or maybe you just simply
              like it.
            </Typography>
          </CardContent>
        </React.Fragment>
      </Card>
    </Box>
  );
};

export default TextCard;
