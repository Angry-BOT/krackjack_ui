import React, { useRef, useEffect, useState } from "react";
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
import { motion, AnimatePresence } from "framer-motion";
import { PulseLoader } from "react-spinners";
import CodeBlock from "./CodeBlock";

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

const TypewriterText = ({ text }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText((prev) => prev + text.charAt(index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 5); // Adjust speed as needed

    return () => clearInterval(timer);
  }, [text]);

  return <span>{displayedText}</span>;
};

const parseMessageContent = (content) => {
  if (!content) return [];

  const codeBlockRegex = /```([\w]*)\n([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: content.slice(lastIndex, match.index),
      });
    }

    // Add code block
    parts.push({
      type: "code",
      language: match[1],
      content: match[2].trim(),
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push({
      type: "text",
      content: content.slice(lastIndex),
    });
  }

  return parts;
};

const MessageContent = ({ content }) => {
  const parts = parseMessageContent(content);

  return (
    <>
      {parts.map((part, index) =>
        part.type === "code" ? (
          <CodeBlock
            key={index}
            content={part.content}
            language={part.language}
          />
        ) : (
          <Typography
            key={index}
            sx={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              lineHeight: 1.6,
              fontSize: "1rem",
              color: "text.primary",
              "@media (max-width: 600px)": {
                fontSize: "0.95rem",
              },
            }}
          >
            {part.content}
          </Typography>
        )
      )}
    </>
  );
};

const ChatInterface = ({ messages, isLoading, isTyping, isListening }) => {
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
      <AnimatePresence>
        {messages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <MessageContainer elevation={1}>
              <Box sx={{ display: "flex", alignItems: "flex-start", mb: 1 }}>
                <Avatar
                  sx={{
                    mr: 2,
                    bgcolor:
                      message.sender === "user"
                        ? "primary.main"
                        : "secondary.main",
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
              <Box sx={{ flex: 1 }}>
                <MessageContent content={message.content} />
              </Box>
            </MessageContainer>
          </motion.div>
        ))}
      </AnimatePresence>

      {isListening && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <MessageContainer elevation={1}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar sx={{ bgcolor: "primary.main" }}>
                <UserCircle />
              </Avatar>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PulseLoader size={8} color="#8ab4f8" />
                <Typography variant="body2" color="text.secondary">
                  Listening...
                </Typography>
              </Box>
            </Box>
          </MessageContainer>
        </motion.div>
      )}

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
