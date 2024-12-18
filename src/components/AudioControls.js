/* global chrome */
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
} from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import { styled, alpha } from "@mui/material/styles";
import { Mic, StopCircle, ScreenShare } from "lucide-react";
import { PulseLoader } from "react-spinners";

const StyledSelect = styled(Select)(({ theme }) => ({
  borderRadius: 20, // Pill-shaped select dropdown
  backgroundColor: theme.palette.background.default, // Slightly darker background
  "& .MuiOutlinedInput-notchedOutline": {
    // Styling for the outline/border
    borderColor: alpha(theme.palette.divider, 0.1), // Very subtle border
  },
  // Add these additional styles for better interactivity
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: alpha(theme.palette.divider, 0.2), // Slightly more visible on hover
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.primary.main, // Google blue when focused
  },
  // Add styles for the dropdown icon
  "& .MuiSelect-icon": {
    color: theme.palette.text.secondary,
  },
}));

const RecordButton = styled(Button)(({ theme }) => ({
  minWidth: 120, // Ensures button doesn't get too narrow
  height: 40, // Consistent height with select
  borderRadius: 20, // Pill-shaped button
  fontWeight: 500, // Medium weight text
  // Add these additional styles for better UX
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-1px)",
    boxShadow: theme.shadows[4],
  },
  // Different styles based on recording state
  "&.recording": {
    backgroundColor: theme.palette.error.main,
    "&:hover": {
      backgroundColor: theme.palette.error.dark,
    },
  },
}));

function AudioControls({
  isRecording,
  onStartRecording,
  onStopRecording,
  onAudioData,
  isListening,
}) {
  const [selectedSource, setSelectedSource] = useState("microphone");
  const [stream, setStream] = useState(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const recordingChunksRef = useRef([]);

  useEffect(() => {
    return () => {
      if (stream) {
        console.log("Stopping existing stream");
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const startRecording = (audioStream) => {
    console.log("Starting recording...");
    const mediaRecorder = new MediaRecorder(audioStream);
    let isRecordingAudio = false;

    if (selectedSource === "screen") {
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source =
        audioContextRef.current.createMediaStreamSource(audioStream);
      source.connect(analyserRef.current);

      const checkAudioLevel = () => {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const average =
          dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;

        if (average > 13) {
          // Adjust this threshold as needed
          if (!isRecordingAudio) {
            isRecordingAudio = true;
            mediaRecorder.start();
            console.log("Audio detected, starting recording");
          }
          clearTimeout(silenceTimeoutRef.current);
          silenceTimeoutRef.current = setTimeout(() => {
            if (isRecordingAudio) {
              mediaRecorder.stop();
              isRecordingAudio = false;
              console.log("Silence detected, stopping recording");
            }
          }, 1000); // Adjust this delay as needed
        }
        requestAnimationFrame(checkAudioLevel);
      };

      checkAudioLevel();
    } else {
      mediaRecorder.start(100); // Reduce chunk size for more responsive listening indicator
    }

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        if (selectedSource === "screen") {
          recordingChunksRef.current.push(event.data);
        } else {
          onAudioData(event.data);
        }
      }
    };

    mediaRecorder.onstop = () => {
      if (
        selectedSource === "screen" &&
        recordingChunksRef.current.length > 0
      ) {
        const blob = new Blob(recordingChunksRef.current, {
          type: "audio/webm",
        });
        onAudioData(blob);
        recordingChunksRef.current = [];
      }
    };

    mediaRecorder.onerror = (error) => {
      console.error("MediaRecorder error:", error);
    };

    console.log("MediaRecorder started");
    onStartRecording();
  };

  const handleStartRecording = async () => {
    try {
      let audioStream;

      if (selectedSource === "screen") {
        console.log("Starting screen capture");
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        // Extract audio track from the display stream
        const audioTrack = displayStream.getAudioTracks()[0];
        if (!audioTrack) {
          throw new Error("No audio track found in the screen share stream");
        }

        audioStream = new MediaStream([audioTrack]);

        // Stop video track as we only need audio
        displayStream.getVideoTracks().forEach((track) => track.stop());
      } else {
        console.log("Starting microphone capture");
        audioStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
      }

      console.log(`${selectedSource} stream received`);
      setStream(audioStream);
      startRecording(audioStream);
    } catch (error) {
      console.error(`Error accessing ${selectedSource}:`, error);
      alert(
        `Could not access the ${selectedSource}. Please check permissions.`
      );
    }
  };

  const handleStopRecording = () => {
    if (stream) {
      console.log("Stopping recording...");
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    onStopRecording();
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <FormControl size="small" sx={{ minWidth: 120, mr: 2 }}>
        <StyledSelect
          value={selectedSource}
          onChange={(e) => setSelectedSource(e.target.value)}
          disabled={isRecording}
          sx={{ height: 40 }}
        >
          <MenuItem value="microphone">Microphone</MenuItem>
          <MenuItem value="screen">Screen Audio</MenuItem>
        </StyledSelect>
      </FormControl>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <RecordButton
          variant="contained"
          color={isRecording ? "secondary" : "primary"}
          startIcon={
            isRecording ? (
              <StopCircle />
            ) : selectedSource === "screen" ? (
              <ScreenShare />
            ) : (
              <Mic />
            )
          }
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          disabled={!selectedSource}
          sx={{ height: 40 }}
        >
          {isRecording ? "Stop" : "Record"}
        </RecordButton>

        {/* {isListening && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PulseLoader size={8} color="#8ab4f8" />
            <Typography variant="caption" color="primary">
              Listening...
            </Typography>
          </Box>
        )} */}
      </Box>
    </Box>
  );
}

export default AudioControls;
