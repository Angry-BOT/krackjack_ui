/* global chrome */
import React, { useState, useEffect, useRef } from "react";
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
import ScreenShareIcon from "@mui/icons-material/ScreenShare";

function AudioControls({
  isRecording,
  onStartRecording,
  onStopRecording,
  onAudioData,
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
      mediaRecorder.start(10000); // For microphone, keep the original behavior
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
        <Select
          value={selectedSource}
          onChange={(e) => setSelectedSource(e.target.value)}
          disabled={isRecording}
          sx={{ height: 40 }}
        >
          <MenuItem value="microphone">Microphone</MenuItem>
          <MenuItem value="screen">Screen Audio</MenuItem>
        </Select>
      </FormControl>
      <Button
        variant="contained"
        color={isRecording ? "secondary" : "primary"}
        startIcon={
          isRecording ? (
            <StopIcon />
          ) : selectedSource === "screen" ? (
            <ScreenShareIcon />
          ) : (
            <MicIcon />
          )
        }
        onClick={isRecording ? handleStopRecording : handleStartRecording}
        disabled={!selectedSource}
        sx={{ height: 40 }}
      >
        {isRecording ? "Stop" : "Record"}
      </Button>
    </Box>
  );
}

export default AudioControls;
