/* global chrome */
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";

function AudioControls({
  isRecording,
  onStartRecording,
  onStopRecording,
  onAudioData,
}) {
  const [tabs, setTabs] = useState([]);
  const [selectedTab, setSelectedTab] = useState("");
  const [selectedSource, setSelectedSource] = useState("microphone"); // Default to Microphone
  const [stream, setStream] = useState(null);

  useEffect(() => {
    // Request tab list from the browser if Tab Audio is selected
    if (selectedSource === "tab") {
      console.log("Requesting tabs...");
      window.postMessage({ type: "GET_TABS" }, "*");

      const messageListener = (event) => {
        if (event.source !== window) return;

        if (event.data.type === "TABS_LIST") {
          console.log("Received tabs:", event.data.tabs);
          setTabs(event.data.tabs);
        } else if (event.data.type === "TAB_AUDIO_STREAM") {
          console.log("Received audio stream for tab:", event.data.stream);
          setStream(event.data.stream);
          startRecording(event.data.stream);
        }
      };

      window.addEventListener("message", messageListener);

      return () => {
        window.removeEventListener("message", messageListener);
        if (stream) {
          console.log("Stopping existing stream");
          stream.getTracks().forEach((track) => track.stop());
        }
      };
    }
  }, [selectedSource]);

  const startRecording = (audioStream) => {
    console.log("Starting recording...");
    const mediaRecorder = new MediaRecorder(audioStream);

    mediaRecorder.ondataavailable = (event) => {
      console.log("Recording data available:", event.data);
      if (event.data.size > 0) {
        onAudioData(event.data);
      }
    };

    mediaRecorder.onerror = (error) => {
      console.error("MediaRecorder error:", error);
    };

    mediaRecorder.start(10000); // Capture in 1-second chunks
    console.log("MediaRecorder started");
    onStartRecording();
  };

  const handleStartRecording = () => {
    if (selectedSource === "tab") {
      if (!selectedTab) {
        alert("Please select a tab first");
        return;
      }

      console.log("Starting tab capture for tab ID:", selectedTab);
      chrome.tabs.get(Number(selectedTab), (tab) => {
        console.log("Tab information:", tab);
        startCapture(tab.id); // Start audio capture for the selected tab
      });
    } else if (selectedSource === "microphone") {
      console.log("Starting microphone capture");
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((audioStream) => {
          console.log("Microphone stream received");
          setStream(audioStream);
          startRecording(audioStream);
        })
        .catch((error) => {
          console.error("Error accessing microphone:", error);
          alert("Could not access the microphone. Please check permissions.");
        });
    }
  };

  const handleStopRecording = () => {
    if (stream) {
      console.log("Stopping recording...");
      stream.getTracks().forEach((track) => track.stop());
    }
    window.postMessage({ type: "STOP_TAB_CAPTURE" }, "*");
    onStopRecording();
  };

  const startCapture = (tabId) => {
    console.log("Requesting tab capture for tab ID:", tabId);

    chrome.tabCapture.capture(
      {
        audio: true, // Request audio capture
        video: false, // We only need audio
      },
      (audioStream) => {
        if (!audioStream) {
          console.error("Failed to capture audio from tab");
          return;
        }
        console.log("Audio capture started for tab ID:", tabId);
        setStream(audioStream);
        startRecording(audioStream);
      }
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: 2,
      }}
    >
      <FormControl sx={{ minWidth: 200, mb: 2 }}>
        <InputLabel>Select Audio Source</InputLabel>
        <Select
          value={selectedSource}
          label="Select Audio Source"
          onChange={(e) => setSelectedSource(e.target.value)}
          disabled={isRecording}
        >
          <MenuItem value="microphone">Microphone</MenuItem>
          <MenuItem value="tab">Tab Audio</MenuItem>
        </Select>
      </FormControl>

      {selectedSource === "tab" && (
        <FormControl sx={{ minWidth: 200, mb: 2 }}>
          <InputLabel>Select Tab</InputLabel>
          <Select
            value={selectedTab}
            label="Select Tab"
            onChange={(e) => setSelectedTab(e.target.value)}
            disabled={isRecording}
          >
            {tabs.map((tab) => (
              <MenuItem key={tab.id} value={tab.id}>
                {tab.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <Button
        variant="contained"
        color={isRecording ? "secondary" : "primary"}
        startIcon={isRecording ? <StopIcon /> : <MicIcon />}
        onClick={isRecording ? handleStopRecording : handleStartRecording}
        disabled={isRecording ? false : !selectedSource}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </Button>
    </Box>
  );
}

export default AudioControls;
