import React, { useState, useEffect, useRef } from "react";
import { ThemeProvider, createTheme, CssBaseline, Box } from "@mui/material";
import SetupDialog from "./components/SetupDialog";
import ChatInterface from "./components/ChatInterface";
import Header from "./components/Header";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#36393f",
      paper: "#2f3136",
    },
    primary: {
      main: "#7289da",
    },
    secondary: {
      main: "#43b581",
    },
    text: {
      primary: "#dcddde",
      secondary: "#8e9297",
    },
  },
});

function App() {
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [intervieweeBackground, setIntervieweeBackground] = useState("");
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    console.log("Initializing WebSocket connection...");
    socketRef.current = new WebSocket("ws://localhost:8080/interview");

    socketRef.current.onopen = () => {
      console.log("WebSocket connection established successfully");
    };

    socketRef.current.onmessage = (event) => {
      console.log("Received WebSocket message");
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

    socketRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      if (socketRef.current) {
        console.log("Closing WebSocket connection...");
        socketRef.current.close();
      }
    };
  }, []);

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
  };

  const handleStopRecording = () => {
    console.log("Stopping audio recording...");
    setIsRecording(false);
  };

  const handleAudioData = (audioBlob) => {
    console.log("Received audio data. Blob size:", audioBlob.size, "bytes");
    console.log("Sending audio data to WebSocket server...");
    socketRef.current.send(audioBlob);
  };

  const audioControlsProps = {
    isRecording,
    onStartRecording: handleStartRecording,
    onStopRecording: handleStopRecording,
    onAudioData: handleAudioData,
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
        {!isSetupComplete ? (
          <SetupDialog onSetupComplete={handleSetupComplete} />
        ) : (
          <>
            <Header
              title="Interview Assistant"
              audioControlsProps={audioControlsProps}
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
                />
              </Box>
            </Box>
          </>
        )}
      </Box>
    </ThemeProvider>
  );
}

export default App;
