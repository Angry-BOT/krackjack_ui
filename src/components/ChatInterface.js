import React, { useRef, useEffect } from "react";
import {
  CircularProgress,
  Avatar,
  Typography,
  Paper,
  Box,
  alpha,
} from "@mui/material";
import { styled } from "@mui/system";
import { UserCircle } from "lucide-react";

const MessageContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  transition: "transform 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-2px)",
  },
  boxShadow: `0 1px 2px ${alpha(theme.palette.common.black, 0.1)}`,
  "@media (max-width: 600px)": {
    padding: theme.spacing(1.5),
  },
}));

const MessageContent = styled(Typography)(({ theme }) => ({
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  lineHeight: 1.6,
  fontSize: "1rem",
  color: theme.palette.text.primary,
  "@media (max-width: 600px)": {
    fontSize: "0.95rem",
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: "50%",
  boxShadow: theme.shadows[2],
  border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  backgroundColor: theme.palette.background.default,
  "& img": {
    objectFit: "cover",
  },
}));

const ChatInterface = ({ messages, isLoading, isTyping }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  return (
    <Box
      sx={{
        height: "100%",
        overflowY: "auto",
        padding: 2,
        backgroundColor: (theme) => theme.palette.background.default,
      }}
    >
      {messages.map((message, index) => (
        <MessageContainer key={index} elevation={1}>
          <Box sx={{ display: "flex", alignItems: "flex-start", mb: 1 }}>
            <Avatar
              sx={{
                mr: 2,
                bgcolor:
                  message.sender === "user" ? "primary.main" : "secondary.main",
              }}
            >
              <UserCircle />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                {message.sender === "user" ? "User" : "Assistant"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Today at {new Date().toLocaleTimeString()}
              </Typography>
            </Box>
          </Box>
          <MessageContent variant="body1">{message.content}</MessageContent>
        </MessageContainer>
      ))}
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
          <CircularProgress />
        </Box>
      )}
      {isTyping && (
        <MessageContainer elevation={1}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Avatar sx={{ mr: 2, bgcolor: "secondary.main" }}>
              <UserCircle />
            </Avatar>
            <Typography variant="body2" color="text.secondary">
              Assistant is typing...
            </Typography>
          </Box>
        </MessageContainer>
      )}
      <div ref={messagesEndRef} />
    </Box>
  );
};

export default ChatInterface;
