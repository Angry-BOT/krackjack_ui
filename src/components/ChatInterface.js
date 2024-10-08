import React, { useRef, useEffect } from "react";
import {
  CircularProgress,
  Avatar,
  Typography,
  Paper,
  Box,
} from "@mui/material";
import { styled } from "@mui/system";
import { UserCircle } from "lucide-react";

const MessageContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
}));

const MessageContent = styled(Typography)(({ theme }) => ({
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
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
