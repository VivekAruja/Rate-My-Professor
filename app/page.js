"use client";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello, I am Rate My Professor Support Assistant. How can I help you today?",
    },
  ]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const sendMessage = async () => {
    if (message.trim() === "") return; // Prevent sending empty messages
    setLoading(true);
    setMessage("");
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([...messages, { role: "user", content: message }]),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let result = "";
      await reader.read().then(function processText({ done, value }) {
        if (done) return result;

        const text = decoder.decode(value || new Uint8Array(), {
          stream: true,
        });

        setMessages((messages) => {
          const updatedMessages = [...messages];
          const lastMessage = updatedMessages[updatedMessages.length - 1];
          lastMessage.content += text;
          return updatedMessages;
        });

        return reader.read().then(processText);
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      setMessages((messages) => [
        ...messages,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !loading) {
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{
        backgroundColor: "#f0f0f0", // Light background color
        backgroundImage: "none", // Remove background image
      }}
    >
      <Button
        variant='contained'
        sx={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          backgroundColor: '#004d00', // Dark green color
          color: 'white',
          '&:hover': {
            backgroundColor: '#003300', // Darker green on hover
          },
        }}
        href='/Data-Set'
      >
        Check Data Set
      </Button>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Search For Professor of Your Type
      </Typography>

      <Stack
        direction="column"
        width="60vw"
        height="70vh"
        border="1px solid #004d00" // Dark green border
        p='20px'
        spacing={3}
        sx={{
          mx: "auto",
          borderRadius: "12px",
          backgroundColor: "white", // Light background for chat area
          boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.2)",
          marginTop: '20px',
          overflow: "hidden",
        }}
      >
        <Stack
          direction="column"
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === "assistant" ? "flex-start" : "flex-end"
              }
            >
              <Box
                bgcolor={
                  message.role === "assistant"
                    ? "#e0e0e0" // Light gray for assistant messages
                    : "#bde58e" // Light green for user messages
                }
                color="black"
                borderRadius='15px'
                p={2}
                maxWidth="80%"
              >
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction="row" spacing={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            sx={{
              border: '1px solid #004d00', // Dark green border
              borderRadius: '8px',
              '& .MuiInputBase-input': {
                color: '#333', // Dark text color
              },
              '& .MuiInputLabel-root': {
                color: '#004d00', // Dark green label
              },
            }}
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            disabled={loading}
            aria-label="Send message"
            sx={{
              backgroundColor: '#004d00', // Dark green color
              color: 'white',
              '&:hover': {
                backgroundColor: '#003300', // Darker green on hover
              },
            }}
          >
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
