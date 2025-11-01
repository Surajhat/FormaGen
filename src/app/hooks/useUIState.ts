import { useState, useEffect, useRef } from "react";
import { makeApiCall, makeCompletionApiCall } from "../helpers/api";

/**
 * Type definition for stored response data.
 */
export type StoredResponse = {
  id: string;
  timestamp: number;
  query: string;
  response: string;
  title: string;
};

/**
 * Type definition for the UI state.
 * Contains all the state variables needed for the application's UI.
 */
export type UIState = {
  /** The current search query input */
  query: string;
  /** The current response from the C1 API */
  c1Response: string;
  /** Whether an API request is currently in progress */
  isLoading: boolean;
  /** Array of stored responses from localStorage */
  storedResponses: StoredResponse[];
  /** Whether the response history panel is open */
  isHistoryOpen: boolean;
  /** Current search query for filtering stored responses */
  historySearchQuery: string;
  /** Currently selected tab */
  activeTab: "ask" | "completion";
};

/**
 * Custom hook for managing the application's UI state.
 * Provides a centralized way to manage state and API interactions.
 *
 * @returns An object containing:
 * - state: Current UI state
 * - actions: Functions to update state and make API calls
 */
export const useUIState = () => {
  // State for managing the search query input
  const [query, setQuery] = useState("");
  // State for storing the API response
  const [c1Response, setC1Response] = useState("");
  // State for tracking if a request is in progress
  const [isLoading, setIsLoading] = useState(false);
  // State for managing request cancellation
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  // State for stored responses
  const [storedResponses, setStoredResponses] = useState<StoredResponse[]>([]);
  // State for history panel visibility
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  // State for history search query
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  // Tab selection state
  const [activeTab, setActiveTab] = useState<"ask" | "completion">("completion");
  // Guard to auto-load most recent only once
  const hasAutoLoadedMostRecentRef = useRef(false);

  // Load stored responses from localStorage on component mount
  useEffect(() => {
    const loadStoredResponses = () => {
      try {
        const stored = localStorage.getItem("thesys-responses");
        if (stored) {
          const parsed = JSON.parse(stored);
          setStoredResponses(parsed);
        }
      } catch (error) {
        console.error("Error loading stored responses:", error);
      }
    };

    loadStoredResponses();
  }, []);

  // Auto-load most recent stored response into UI once on first load
  useEffect(() => {
    if (
      !hasAutoLoadedMostRecentRef.current &&
      storedResponses.length > 0 &&
      !c1Response
    ) {
      hasAutoLoadedMostRecentRef.current = true;
      const mostRecent = storedResponses[0];
      setQuery(mostRecent.query);
      setC1Response(mostRecent.response);
    }
  }, [storedResponses, c1Response]);

  // Save responses to localStorage whenever storedResponses changes
  useEffect(() => {
    try {
      localStorage.setItem("thesys-responses", JSON.stringify(storedResponses));
    } catch (error) {
      console.error("Error saving responses to localStorage:", error);
    }
  }, [storedResponses]);

  /**
   * Save a response to localStorage
   */
  const saveResponse = (query: string, response: string) => {
    const newResponse: StoredResponse = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      query,
      response,
      title: query.length > 50 ? query.substring(0, 50) + "..." : query,
    };
    setStoredResponses(prev => [newResponse, ...prev]);
  };

  /**
   * Delete a response from localStorage
   */
  const deleteResponse = (id: string) => {
    setStoredResponses(prev => prev.filter(response => response.id !== id));
  };

  /**
   * Update an existing stored response
   */
  const updateResponse = (
    id: string,
    updates: Partial<Pick<StoredResponse, "title" | "query" | "response">>
  ) => {
    setStoredResponses(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  /**
   * Load a response into the current state
   */
  const loadResponse = (response: StoredResponse) => {
    setQuery(response.query);
    setC1Response(response.response);
  };

  /**
   * Load the most recent stored response (if available)
   */
  const loadMostRecentResponse = () => {
    if (storedResponses.length > 0) {
      const mostRecent = storedResponses[0];
      loadResponse(mostRecent);
    }
  };

  /**
   * Search stored responses
   */
  const searchStoredResponses = (searchQuery: string) => {
    return storedResponses.filter(response =>
      response.query.toLowerCase().includes(searchQuery.toLowerCase()) ||
      response.response.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  /**
   * Wrapper function around makeApiCall that provides necessary state handlers.
   * This keeps the component interface simple while handling all state management internally.
   */
  const handleApiCall = async (
    searchQuery: string,
    previousC1Response?: string
  ) => {
    if (activeTab === "ask") {
      await makeApiCall({
        searchQuery,
        previousC1Response,
        setC1Response,
        setIsLoading,
        abortController,
        setAbortController,
        onResponseComplete: saveResponse,
      });
    } else {
      await makeCompletionApiCall({
        searchQuery,
        previousC1Response,
        setC1Response,
        setIsLoading,
        abortController,
        setAbortController,
        onResponseComplete: saveResponse,
      });
    }
  };
  
  const handleCompletionApiCall = async (searchQuery: string, previousC1Response?: string) => {
    await makeCompletionApiCall({
      searchQuery,
      previousC1Response,
      setC1Response,
      setIsLoading,
      abortController,
      setAbortController,
      onResponseComplete: saveResponse,
    });
  };

  /**
   * Re-run API call using a stored response's query and prior response as context
   */
  const reRunWithStored = async (stored: StoredResponse) => {
    await handleApiCall(stored.query, stored.response);
  };

  // Return the state and actions in a structured format
  return {
    state: {
      query,
      c1Response,
      isLoading,
      storedResponses,
      isHistoryOpen,
      historySearchQuery,
      activeTab,
    },
    actions: {
      setQuery,
      setC1Response,
      makeApiCall: handleApiCall,
      saveResponse,
      deleteResponse,
      updateResponse,
      loadResponse,
      loadMostRecentResponse,
      searchStoredResponses,
      reRunWithStored,
      setIsHistoryOpen,
      setHistorySearchQuery,
      setActiveTab,
      handleCompletionApiCall,
    },
  };
};
