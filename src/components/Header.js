import React from "react";
import { AppBar, Toolbar, Typography, Box, Icon } from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import { Hash } from "lucide-react";
import AudioControls from "./AudioControls";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  backdropFilter: "blur(8px)",
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: "none",
}));

const Header = ({ title, audioControlsProps }) => {
  return (
    <StyledAppBar position="sticky">
      <Toolbar
        sx={{
          justifyContent: "space-between",
          minHeight: 64,
          px: { xs: 2, sm: 4 },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography
            variant="h6"
            sx={{
              color: "primary.main",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Icon component={Hash} sx={{ fontSize: 24 }} />
            {title}
          </Typography>
        </Box>
        <AudioControls {...audioControlsProps} />
      </Toolbar>
    </StyledAppBar>
  );
};

export default Header;
