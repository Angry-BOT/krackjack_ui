import React, { useRef, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";

function ChatInterface({ messages }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  return (
    <Paper elevation={3} sx={{ flexGrow: 1, overflowY: "auto", p: 2, mb: 2 }}>
      <List>
        {messages.map((message, index) => (
          <React.Fragment key={index}>
            <ListItem alignItems="flex-start">
              <ListItemText
                primary={
                  <Typography
                    component="span"
                    variant="body1"
                    color={message.sender === "user" ? "primary" : "secondary"}
                    fontWeight="bold"
                  >
                    {message.sender === "user" ? "You" : "Assistant"}
                  </Typography>
                }
                secondary={
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.primary"
                  >
                    {message.content}
                  </Typography>
                }
              />
            </ListItem>
            {index < messages.length - 1 && (
              <Divider variant="inset" component="li" />
            )}
          </React.Fragment>
        ))}
      </List>
      <div ref={messagesEndRef} />
    </Paper>
  );
}

export default ChatInterface;
