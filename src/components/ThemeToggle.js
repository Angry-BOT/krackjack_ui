import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import { Sun, Moon } from "lucide-react";

const ThemeToggle = ({ isDarkMode, onToggle }) => {
  return (
    <Tooltip title={`Switch to ${isDarkMode ? "light" : "dark"} mode`}>
      <IconButton
        onClick={onToggle}
        sx={{
          color: "text.secondary",
          "&:hover": {
            color: "primary.main",
          },
        }}
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
