import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Icon,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import { Hash, Settings } from "lucide-react";
import AudioControls from "./AudioControls";
import ThemeToggle from "./ThemeToggle";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  backdropFilter: "blur(8px)",
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: "none",
}));

const Header = ({
  title,
  audioControlsProps,
  onConfigureClick,
  isRecording,
  isDarkMode,
  onThemeToggle,
}) => {
  const [showWarning, setShowWarning] = useState(false);

  const handleSetupClick = () => {
    if (isRecording) {
      setShowWarning(true);
    } else {
      onConfigureClick();
    }
  };

  return (
    <>
      <StyledAppBar position="sticky">
        <Toolbar
          sx={{
            justifyContent: "space-between",
            minHeight: { xs: 56, sm: 64 },
            px: { xs: 1, sm: 2, md: 4 },
            gap: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              "& .MuiTypography-root": {
                fontSize: { xs: "1rem", sm: "1.25rem" },
              },
            }}
          >
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
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1, sm: 2 },
              "& .MuiIconButton-root": {
                padding: { xs: 1, sm: 1.5 },
              },
            }}
          >
            <AudioControls {...audioControlsProps} />
            <ThemeToggle isDarkMode={isDarkMode} onToggle={onThemeToggle} />
            <Tooltip
              title={isRecording ? "Stop recording to access setup" : "Setup"}
              placement="bottom"
            >
              <span>
                <IconButton
                  onClick={handleSetupClick}
                  disabled={isRecording}
                  sx={{
                    color: "text.secondary",
                    "&:hover": {
                      color: "primary.main",
                      backgroundColor: (theme) =>
                        alpha(theme.palette.primary.main, 0.08),
                    },
                    "&.Mui-disabled": {
                      color: "text.disabled",
                    },
                  }}
                >
                  <Settings size={20} />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Toolbar>
      </StyledAppBar>

      <Snackbar
        open={showWarning}
        autoHideDuration={4000}
        onClose={() => setShowWarning(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowWarning(false)}
          severity="warning"
          sx={{
            width: "100%",
            backgroundColor: (theme) => alpha(theme.palette.warning.main, 0.1),
            color: "warning.main",
            "& .MuiAlert-icon": {
              color: "warning.main",
            },
          }}
        >
          Please stop the recording session before accessing setup
        </Alert>
      </Snackbar>
    </>
  );
};

export default Header;
