import React from "react";
import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import { styled } from "@mui/system";
import { Hash } from "lucide-react";
import AudioControls from "./AudioControls";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow:
    "0 1px 0 rgba(4,4,5,0.2),0 1.5px 0 rgba(6,6,7,0.05),0 2px 0 rgba(4,4,5,0.05)",
}));

const ChannelName = styled(Typography)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  color: theme.palette.text.primary,
  fontWeight: 600,
}));

const Header = ({ title, audioControlsProps }) => {
  return (
    <StyledAppBar position="static">
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Hash size={24} style={{ marginRight: "8px", color: "#8e9297" }} />
          <ChannelName variant="h6">{title}</ChannelName>
        </Box>
        <AudioControls {...audioControlsProps} />
      </Toolbar>
    </StyledAppBar>
  );
};

export default Header;
