import React, { useRef, useEffect, useState } from "react";
import {
  CircularProgress,
  Avatar,
  Typography,
  Paper,
  Box,
  alpha,
  useTheme,
  useMediaQuery,
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
  const parts = [];
  const codeBlockRegex = /```([\s\S]*?)```/g;
  const bulletPointRegex = /^[•\-\*]\s(.+)$/gm;
  const numberedListRegex = /^\d+\.\s(.+)$/gm;
  const boldRegex = /\*\*(.*?)\*\*/g;

  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      const textContent = content.slice(lastIndex, match.index);
      parts.push({
        type: "text",
        content: textContent,
        format: detectTextFormat(textContent),
      });
    }

    // Add code block
    parts.push({
      type: "code",
      content: match[1],
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    const textContent = content.slice(lastIndex);
    parts.push({
      type: "text",
      content: textContent,
      format: detectTextFormat(textContent),
    });
  }

  return parts;
};

const detectTextFormat = (text) => {
  // Check if the text starts with a bullet or number at the beginning of a line
  const lines = text.split("\n");
  const firstNonEmptyLine = lines.find((line) => line.trim().length > 0);

  if (!firstNonEmptyLine) return "normal";

  const bulletPointRegex = /^[•\-\*]\s(.+)$/;
  const numberedListRegex = /^\d+\.\s(.+)$/;

  if (bulletPointRegex.test(firstNonEmptyLine)) return "bullet";
  if (numberedListRegex.test(firstNonEmptyLine)) return "numbered";
  return "normal";
};

const formatTextWithBold = (text) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <Typography key={index} component="span" sx={{ fontWeight: 700 }}>
          {part.slice(2, -2)}
        </Typography>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

const MessageContent = ({ content }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const parts = parseMessageContent(content);

  const renderTextContent = (text, format) => {
    if (format === "bullet" || format === "numbered") {
      const lines = text.split("\n");
      return (
        <Box
          component="ul"
          sx={{
            pl: 3,
            listStyle: format === "bullet" ? "disc" : "decimal",
            "& li": {
              mb: 1,
              pl: 1,
              "&::marker": {
                color: theme.palette.primary.main,
              },
            },
          }}
        >
          {lines.map((line, idx) => {
            if (!line.trim()) return null;
            const cleanLine = line.replace(/^[•\-\*\d+\.]\s/, "").trim();
            if (cleanLine) {
              return <li key={idx}>{formatTextWithBold(cleanLine)}</li>;
            }
            return null;
          })}
        </Box>
      );
    }

    return (
      <Typography
        variant="body1"
        component="div"
        sx={{
          mb: 2,
          whiteSpace: "pre-wrap",
          lineHeight: 1.6,
        }}
      >
        {formatTextWithBold(text)}
      </Typography>
    );
  };

  return (
    <Box
      sx={{
        fontSize: { xs: "0.875rem", sm: "1rem" },
        "& pre": {
          maxWidth: "100%",
          overflow: "auto",
        },
        "& code": {
          fontSize: { xs: "0.8rem", sm: "0.9rem" },
        },
      }}
    >
      {parts.map((part, index) => {
        if (part.type === "code") {
          return <CodeBlock key={index} content={part.content} />;
        } else {
          return renderTextContent(part.content, part.format);
        }
      })}
    </Box>
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
        p: { xs: 1.5, sm: 2, md: 4 },
        maxWidth: "100%",
        margin: "0 auto",
        overflowX: "hidden",
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
