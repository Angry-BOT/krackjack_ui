import React, { useState, useEffect, useRef } from "react";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Box,
} from "@mui/material";
import SetupDialog from "./components/SetupDialog";
import ChatInterface from "./components/ChatInterface";
import AudioControls from "./components/AudioControls";

const theme = createTheme({
  palette: {
    mode: "dark",
  },
});

function App() {
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [intervieweeBackground, setIntervieweeBackground] = useState("");
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    console.log("Initializing WebSocket connection...");
    socketRef.current = new WebSocket("ws://localhost:8080/interview");

    socketRef.current.onopen = () => {
      console.log("WebSocket connection established successfully");
    };

    socketRef.current.onmessage = (event) => {
      // console.log("Received WebSocket message:", event.data);
      console.log("Received WebSocket message");
      const response = JSON.parse(event.data);
      if (response.type === "transcription") {
        console.log("Processing transcription:", response.content);
        addMessage("user", response.content);
      } else if (response.type === "assistant_response") {
        console.log("Processing assistant response:", response.content);
        addMessage("assistant", response.content);
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
    // if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
    //   console.log("Sending audio data to WebSocket server...");
    //   socketRef.current.send(audioBlob);
    // } else {
    //   console.error("WebSocket is not open. Unable to send audio data.");
    // }
    console.log("Sending audio data to WebSocket server...");
    socketRef.current.send(audioBlob);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md">
        <Box
          sx={{
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {!isSetupComplete ? (
            <SetupDialog onSetupComplete={handleSetupComplete} />
          ) : (
            <>
              <ChatInterface messages={messages} />
              <AudioControls
                isRecording={isRecording}
                onStartRecording={handleStartRecording}
                onStopRecording={handleStopRecording}
                onAudioData={handleAudioData}
              />
            </>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
