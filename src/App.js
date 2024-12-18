import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Alert,
  Snackbar,
  Button,
} from "@mui/material";
import LandingPage from "./components/LandingPage";
import SetupDialog from "./components/SetupDialog";
import ChatInterface from "./components/ChatInterface";
import Header from "./components/Header";
import { RefreshCw } from "lucide-react";
import ThemeToggle from "./components/ThemeToggle";

const createAppTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      ...(mode === "dark"
        ? {
            // Dark theme
            background: {
              default: "#202124",
              paper: "#292a2d",
            },
            primary: {
              main: "#8ab4f8",
              dark: "#669df6",
              light: "#adc6ff",
            },
            secondary: {
              main: "#81c995",
              dark: "#5bb974",
              light: "#a8dab5",
            },
            text: {
              primary: "#e8eaed",
              secondary: "#9aa0a6",
            },
          }
        : {
            // Light theme
            background: {
              default: "#ffffff",
              paper: "#f8f9fa",
            },
            primary: {
              main: "#1a73e8",
              dark: "#1557b0",
              light: "#4285f4",
            },
            secondary: {
              main: "#34a853",
              dark: "#1e8e3e",
              light: "#81c995",
            },
            text: {
              primary: "#202124",
              secondary: "#5f6368",
            },
          }),
    },
    typography: {
      fontFamily: "'Google Sans', 'Roboto', sans-serif",
      h6: {
        fontWeight: 500,
      },
      button: {
        textTransform: "none",
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            padding: "8px 24px",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
    },
  });

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [intervieweeBackground, setIntervieweeBackground] = useState("");
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const socketRef = useRef(null);
  const [wsStatus, setWsStatus] = useState("connecting");
  const [showRetrySnackbar, setShowRetrySnackbar] = useState(false);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectTimeout = useRef(null);
  const lastMessageTime = useRef(Date.now());
  const connectionCheckInterval = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("theme-mode");
    return savedMode ? savedMode === "dark" : true; // Default to dark mode
  });

  // Save theme preference to localStorage
  useEffect(() => {
    localStorage.setItem("theme-mode", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const theme = createAppTheme(isDarkMode ? "dark" : "light");

  const handleThemeToggle = () => {
    setIsDarkMode((prev) => !prev);
  };

  const connectWebSocket = useCallback(() => {
    console.log("Initializing WebSocket connection...");
    if (socketRef.current) {
      socketRef.current.close();
    }

    socketRef.current = new WebSocket("ws://localhost:8080/interview");

    socketRef.current.onopen = () => {
      console.log("WebSocket connection established successfully");
      lastMessageTime.current = Date.now();
      reconnectAttempts.current = 0;
      setShowRetrySnackbar(false);
    };

    socketRef.current.onmessage = (event) => {
      lastMessageTime.current = Date.now(); // Update last message time
      const response = JSON.parse(event.data);
      if (response.type === "transcription") {
        console.log("Processing transcription:", response.content);
        addMessage("user", response.content);
        setIsLoading(true);
        setIsTyping(true);
      } else if (response.type === "assistant_response") {
        console.log("Processing assistant response:", response.content);
        setIsTyping(false);
        addMessage("assistant", response.content);
        setIsLoading(false);
      } else {
        console.warn("Received unknown message type:", response.type);
      }
    };

    socketRef.current.onclose = () => {
      console.log("WebSocket connection closed");
      handleReconnect();
    };

    socketRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setShowRetrySnackbar(true);
    };
  }, []);

  const handleReconnect = useCallback(() => {
    if (reconnectAttempts.current < maxReconnectAttempts) {
      reconnectAttempts.current += 1;
      setShowRetrySnackbar(true);
      reconnectTimeout.current = setTimeout(() => {
        connectWebSocket();
      }, 500000); // Retry timer
    }
  }, [connectWebSocket]);

  const handleManualRetry = () => {
    reconnectAttempts.current = 0;
    connectWebSocket();
  };

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, [connectWebSocket]);

  const handleSetupComplete = (jd, background) => {
    console.log("Setup completed. Job Description:", jd);
    console.log("Interviewee Background:", background);
    setJobDescription(jd);
    setIntervieweeBackground(background);
    setIsSetupComplete(true);
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      console.log("Sending setup information to WebSocket server...");
      socketRef.current.send(
        JSON.stringify({
          type: "setup",
          jobDescription: jd,
          intervieweeBackground: background,
        })
      );
    } else {
      console.error("WebSocket is not open. Unable to send setup information.");
    }
  };

  const addMessage = (sender, content) => {
    console.log(`Adding new message from ${sender}:`, content);
    setMessages((prevMessages) => [...prevMessages, { sender, content }]);
  };

  const handleStartRecording = () => {
    console.log("Starting audio recording...");
    setIsRecording(true);
    setIsListening(true);
  };

  const handleStopRecording = () => {
    console.log("Stopping audio recording...");
    setIsRecording(false);
    setIsListening(false);
  };

  const handleAudioData = (audioBlob) => {
    console.log("Received audio data. Blob size:", audioBlob.size, "bytes");
    if (audioBlob.size > 0) {
      console.log("Sending audio data to WebSocket server...");
      socketRef.current.send(audioBlob);
    }
  };

  const audioControlsProps = {
    isRecording,
    onStartRecording: handleStartRecording,
    onStopRecording: handleStopRecording,
    onAudioData: handleAudioData,
    isListening,
  };

  const handleGetStarted = () => {
    setShowLanding(false);
  };

  const handleConfigureClick = () => {
    setMessages([]);
    setIsSetupComplete(false);
    setIsLoading(false);
    setIsTyping(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.default",
        }}
      >
        {showLanding ? (
          <>
            <Box sx={{ position: "absolute", top: 16, right: 16 }}>
              <ThemeToggle
                isDarkMode={isDarkMode}
                onToggle={handleThemeToggle}
              />
            </Box>
            <LandingPage onGetStarted={handleGetStarted} />
          </>
        ) : !isSetupComplete ? (
          <>
            <Box sx={{ position: "absolute", top: 16, right: 16 }}>
              <ThemeToggle
                isDarkMode={isDarkMode}
                onToggle={handleThemeToggle}
              />
            </Box>
            <SetupDialog onSetupComplete={handleSetupComplete} />
          </>
        ) : (
          <>
            <Header
              title="Interview Assistant"
              audioControlsProps={audioControlsProps}
              onConfigureClick={handleConfigureClick}
              isRecording={isListening}
              isDarkMode={isDarkMode}
              onThemeToggle={handleThemeToggle}
            />
            <Box
              sx={{
                flexGrow: 1,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box sx={{ flexGrow: 1, overflow: "auto" }}>
                <ChatInterface
                  messages={messages}
                  isLoading={isLoading}
                  isTyping={isTyping}
                  isListening={isListening}
                />
              </Box>
            </Box>
          </>
        )}

        <Snackbar
          open={showRetrySnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                startIcon={<RefreshCw />}
                onClick={handleManualRetry}
              >
                Retry Now
              </Button>
            }
          >
            Connection lost. Attempting to reconnect...
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default App;
