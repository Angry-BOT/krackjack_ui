import React from "react";
import { Box, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

const CodeBlock = ({ content }) => {
  return (
    <Box
      sx={{
        backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
        borderRadius: 1,
        padding: 2,
        margin: "8px 0",
        fontFamily:
          'source-code-pro, Menlo, Monaco, Consolas, "Courier New", monospace',
        position: "relative",
        overflow: "auto",
      }}
    >
      <Typography
        component="pre"
        sx={{
          margin: 0,
          fontSize: "0.9rem",
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
          color: (theme) => theme.palette.text.primary,
        }}
      >
        <code>{content}</code>
      </Typography>
    </Box>
  );
};

export default CodeBlock;
