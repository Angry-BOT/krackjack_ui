import React, { useState, useEffect, useRef } from "react";
import { styled } from "@mui/material/styles";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    borderRadius: 20,
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    maxWidth: 600,
  },
}));

function SetupDialog({ onSetupComplete }) {
  const [jobDescription, setJobDescription] = useState("");
  const [intervieweeBackground, setIntervieweeBackground] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSetupComplete(jobDescription, intervieweeBackground);
  };

  return (
    <StyledDialog open={true} fullWidth>
      <DialogTitle
        sx={{
          textAlign: "center",
          fontSize: "1.5rem",
          fontWeight: 500,
          color: "primary.main",
        }}
      >
        Interview Assistant Setup
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ py: 3 }}>
          <TextField
            fullWidth
            margin="normal"
            label="Job Description"
            multiline
            rows={4}
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "background.default",
              },
            }}
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
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "background.default",
              },
            }}
            value={intervieweeBackground}
            onChange={(e) => setIntervieweeBackground(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, justifyContent: "center" }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            sx={{
              minWidth: 200,
              fontWeight: 500,
            }}
          >
            Start Interview
          </Button>
        </DialogActions>
      </form>
    </StyledDialog>
  );
}

export default SetupDialog;
