import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";

function SetupDialog({ onSetupComplete }) {
  const [jobDescription, setJobDescription] = useState("");
  const [intervieweeBackground, setIntervieweeBackground] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSetupComplete(jobDescription, intervieweeBackground);
  };

  return (
    <Dialog open={true} fullWidth maxWidth="sm">
      <DialogTitle>Interview Assistant Setup</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Job Description"
            multiline
            rows={4}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Your Background"
            multiline
            rows={4}
            value={intervieweeBackground}
            onChange={(e) => setIntervieweeBackground(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button type="submit" variant="contained" color="primary">
            Start Interview Assistant
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default SetupDialog;
