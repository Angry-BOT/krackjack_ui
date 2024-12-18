import React from "react";
import { Box, Typography, Button, Container, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const LandingPage = ({ onGetStarted }) => {
  const theme = useTheme();

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          gap: 4,
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
              fontSize: { xs: "3rem", md: "4.5rem" },
              fontWeight: 700,
              color: "text.primary",
              textShadow:
                theme.palette.mode === "dark"
                  ? "0 0 20px rgba(255, 255, 255, 0.1)"
                  : "0 0 20px rgba(0, 0, 0, 0.1)",
              mb: 2,
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
              fontSize: { xs: "1.5rem", md: "2rem" },
              fontWeight: 500,
              color: "text.secondary",
              mb: 6,
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
            size="large"
            onClick={onGetStarted}
            endIcon={<ArrowRight />}
            sx={{
              fontSize: "1.2rem",
              py: 2,
              px: 6,
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
      </Box>
    </Container>
  );
};

export default LandingPage;
