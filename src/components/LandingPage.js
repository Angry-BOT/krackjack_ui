import React from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const LandingPage = ({ onGetStarted }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          gap: { xs: 3, sm: 4, md: 4 },
          position: "relative",
          px: { xs: 2, sm: 4, md: 6 },
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Typography
            variant="h1"
            sx={{
              fontSize: {
                xs: "2rem",
                sm: "2.5rem",
                md: "3.5rem",
                lg: "4.5rem",
              },
              fontWeight: 700,
              color: "text.primary",
              textShadow:
                theme.palette.mode === "dark"
                  ? "0 0 20px rgba(255, 255, 255, 0.1)"
                  : "0 0 20px rgba(0, 0, 0, 0.1)",
              mb: { xs: 1, sm: 2 },
              wordBreak: "break-word",
            }}
          >
            Welcome to Krackjack
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Typography
            variant="h2"
            sx={{
              fontSize: {
                xs: "1.2rem",
                sm: "1.5rem",
                md: "1.8rem",
                lg: "2rem",
              },
              fontWeight: 500,
              color: "text.secondary",
              mb: { xs: 4, sm: 6 },
              px: { xs: 2, sm: 4 },
              maxWidth: { sm: "80%", md: "100%" },
              mx: "auto",
            }}
          >
            Ace your interviews with AI-powered preparation
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Button
            variant="contained"
            size={isMobile ? "medium" : "large"}
            onClick={onGetStarted}
            endIcon={<ArrowRight />}
            sx={{
              fontSize: { xs: "1rem", sm: "1.1rem", md: "1.2rem" },
              py: { xs: 1.5, sm: 2 },
              px: { xs: 4, sm: 6 },
              borderRadius: 3,
              textTransform: "none",
              background: "linear-gradient(45deg, #8ab4f8 30%, #81c995 90%)",
              boxShadow: "0 3px 15px rgba(138, 180, 248, 0.3)",
              "&:hover": {
                background: "linear-gradient(45deg, #669df6 30%, #5bb974 90%)",
                transform: "translateY(-2px)",
                boxShadow: "0 5px 20px rgba(138, 180, 248, 0.4)",
              },
              transition: "all 0.3s ease-in-out",
            }}
          >
            Get Started
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          style={{
            position: "absolute",
            bottom: isMobile ? 10 : 20,
            width: "100%",
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
              fontSize: { xs: "0.875rem", sm: "1rem" },
              fontStyle: "italic",
              opacity: 0.8,
              px: 2,
              "&:hover": {
                opacity: 1,
              },
              transition: "opacity 0.3s ease",
            }}
          >
            This application does not support cheating but your wish 😉
          </Typography>
        </motion.div>
      </Box>
    </Container>
  );
};

export default LandingPage;
