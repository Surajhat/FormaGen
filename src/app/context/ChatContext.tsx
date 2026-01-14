"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { makeApiCall } from "../helpers/api";

export type ChatMessage = {
  id: string;
  timestamp: number;
  query: string;
  response: string;
  title: string;
};

type Theme = "dark" | "light";

type ChatContextType = {
  // State
  query: string;
  currentResponse: string;
  isLoading: boolean;
  messages: ChatMessage[];
  selectedMessageId: string | null;
  theme: Theme;
  
  // Actions
  setQuery: (q: string) => void;
  setCurrentResponse: (r: string) => void;
  sendMessage: (prompt: string) => Promise<void>;
  selectMessage: (id: string) => void;
  deleteMessage: (id: string) => void;
  clearAll: () => void;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
};

const ChatContext = createContext<ChatContextType | null>(null);

const MESSAGES_KEY = "formagen-messages";
const THEME_KEY = "formagen-theme";

export function ChatProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const [currentResponse, setCurrentResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [theme, setThemeState] = useState<Theme>("dark");
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from sessionStorage on mount
  useEffect(() => {
    try {
      const storedMessages = sessionStorage.getItem(MESSAGES_KEY);
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      }
      const storedTheme = localStorage.getItem(THEME_KEY);
      if (storedTheme === "dark" || storedTheme === "light") {
        setThemeState(storedTheme);
      }
    } catch (e) {
      console.error("Error loading state:", e);
    }
    setIsHydrated(true);
  }, []);

  // Save messages to sessionStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      sessionStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
    } catch (e) {
      console.error("Error saving messages:", e);
    }
  }, [messages, isHydrated]);

  // Save theme to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme, isHydrated]);

  const saveMessage = useCallback((prompt: string, response: string) => {
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      query: prompt,
      response,
      title: prompt.length > 50 ? prompt.substring(0, 50) + "..." : prompt,
    };
    setMessages((prev) => [newMsg, ...prev]);
    setSelectedMessageId(newMsg.id);
  }, []);

  const sendMessage = useCallback(async (prompt: string) => {
    if (!prompt.trim() || isLoading) return;
    
    // Keep the query visible during streaming
    // It will be cleared after the message is saved (which happens after streaming completes)
    setCurrentResponse("");
    
    await makeApiCall({
      searchQuery: prompt,
      previousC1Response: currentResponse || undefined,
      setC1Response: setCurrentResponse,
      setIsLoading,
      abortController,
      setAbortController,
      onResponseComplete: (query, response) => {
        // Save the message and clear query after streaming completes
        saveMessage(query, response);
        setQuery("");
      },
    });
  }, [isLoading, currentResponse, abortController, saveMessage]);

  const selectMessage = useCallback((id: string) => {
    const msg = messages.find((m) => m.id === id);
    if (msg) {
      setSelectedMessageId(id);
      setCurrentResponse(msg.response);
      setQuery(msg.query);
    }
  }, [messages]);

  const deleteMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (selectedMessageId === id) {
      setSelectedMessageId(null);
      setCurrentResponse("");
    }
  }, [selectedMessageId]);

  const clearAll = useCallback(() => {
    setMessages([]);
    setSelectedMessageId(null);
    setCurrentResponse("");
    setQuery("");
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return (
    <ChatContext.Provider
      value={{
        query,
        currentResponse,
        isLoading,
        messages,
        selectedMessageId,
        theme,
        setQuery,
        setCurrentResponse,
        sendMessage,
        selectMessage,
        deleteMessage,
        clearAll,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return ctx;
}


