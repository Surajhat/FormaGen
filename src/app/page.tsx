"use client";

import "@crayonai/react-ui/styles/index.css";
import { Button } from "@crayonai/react-ui";
import { ThemeProvider, C1Component } from "@thesysai/genui-sdk";
import { useUIState } from "./hooks/useUIState";
import { Loader } from "./components/Loader";
import { useState, useEffect, useRef, useCallback } from "react";
import { AppDrawer } from "./components/AppDrawer";

const Page = () => {
  const { state, actions } = useUIState();
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editQuery, setEditQuery] = useState("");
  const [editResponse, setEditResponse] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState(320); // Default 320px (w-80)
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Show save button when response is complete and not loading
  useEffect(() => {
    if (state.c1Response && !state.isLoading) {
      setShowSaveButton(true);
    }
  }, [state.c1Response, state.isLoading]);

  // Handle resizing
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = e.clientX;
      // Set min and max constraints (200px to 600px)
      const constrainedWidth = Math.min(Math.max(200, newWidth), 600);
      setSidebarWidth(constrainedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  const filteredResponses = state.historySearchQuery 
    ? actions.searchStoredResponses(state.historySearchQuery)
    : state.storedResponses;

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="bg-black text-white border-b border-gray-200">
        <div className="max-w-8xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold">TheSys POC</h1>
                <p className="text-gray-300 text-sm">Intelligent Component Interface</p>
              </div>
            </div>
            <Button
              onClick={() => actions.setIsHistoryOpen(!state.isHistoryOpen)}
              className="bg-white text-black hover:bg-gray-100 border border-gray-300"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              History ({state.storedResponses.length})
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)] relative">
        {/* Left Sidebar - Form Section */}
        <aside 
          ref={sidebarRef}
          className="flex-shrink-0 bg-gray-50 border-r border-gray-200 overflow-y-auto"
          style={{ width: `${sidebarWidth}px` }}
        >
          <div className="p-6 space-y-6">
            {/* Tabs */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-2">
              <div className="flex gap-2">
                <button
                  className={`px-4 py-2 rounded-lg text-sm font-medium border flex-1 ${state.activeTab === "ask" ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"}`}
                  onClick={() => actions.setActiveTab("ask")}
                >
                  Chat
                </button>
                <button
                  className={`px-4 py-2 rounded-lg text-sm font-medium border flex-1 ${state.activeTab === "completion" ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"}`}
                  onClick={() => actions.setActiveTab("completion")}
               >
                  Data Analysis
                </button>
              </div>
            </div>
            
            {/* Input Section */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">
                    {state.activeTab === "ask" ? "Start a Conversation" : "Data Analysis"}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {state.activeTab === "ask"
                      ? "Interact with the AI component"
                      : "Send a prompt to render UI response"}
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label htmlFor="prompt-input" className="block text-xs font-medium text-gray-700 mb-1.5">
                      {state.activeTab === "ask" ? "Your Message" : "Completion Prompt"}
                    </label>
                    <div className="relative">
                      <textarea
                        id="prompt-input"
                        rows={4}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg
                          bg-white text-gray-900 text-sm placeholder-gray-500
                          focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent
                          shadow-sm transition-all duration-200 resize-none"
                        value={state.query}
                        placeholder={state.activeTab === "ask" ? "Type your message here..." : "Type your completion prompt..."}
                        onChange={({ target: { value } }) => actions.setQuery(value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && !state.isLoading) {
                            e.preventDefault();
                            actions.makeApiCall(state.query);
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => {
                        if(state.activeTab=="ask"){
                          actions.makeApiCall(state.query)
                        } else {
                          actions.handleCompletionApiCall(state.query)
                        }
                      }}
                      disabled={state.query.length === 0 || state.isLoading}
                      className="w-full bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      size="medium"
                    >
                      {state.isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader />
                          <span>Sending...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <span>Send</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </div>
                      )}
                    </Button>
                    {showSaveButton && state.c1Response && (
                      <Button
                        onClick={() => {
                          actions.saveResponse(state.query, state.c1Response);
                          setShowSaveButton(false);
                        }}
                        className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                        size="small"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Save Response
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    Press Ctrl+Enter to send
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Resize Handle */}
        <div
          className={`absolute top-0 bottom-0 w-1 bg-gray-300 hover:bg-gray-400 cursor-col-resize transition-colors z-10 ${
            isResizing ? 'bg-gray-500' : ''
          }`}
          style={{ left: `${sidebarWidth}px`, transform: 'translateX(-50%)' }}
          onMouseDown={handleMouseDown}
        >
          <div className="absolute inset-y-0 left-1/2 w-6 -translate-x-1/2" />
        </div>

        {/* Main Content - Response Section */}
        <main className="flex-1 overflow-y-auto bg-white">
          <div className="h-full flex flex-col">
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">AI Response</h3>
                  <p className="text-gray-600 text-sm">Component interaction and responses will appear below</p>
                </div>
                {state.isLoading && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 p-8 overflow-y-auto">
              <ThemeProvider>
                <C1Component
                  c1Response={state.c1Response}
                  isStreaming={state.isLoading}
                  updateMessage={(message) => actions.setC1Response(message)}
                  onAction={({ llmFriendlyMessage }) => {
                    if (!state.isLoading) {
                      actions.makeApiCall(llmFriendlyMessage, state.c1Response);
                    }
                  }}
                />
              </ThemeProvider>
            </div>
          </div>
        </main>

        {/* App Drawer */}
        <AppDrawer
          isOpen={state.isHistoryOpen}
          onClose={() => actions.setIsHistoryOpen(false)}
          storedResponses={filteredResponses}
          onLoadResponse={(r) => actions.loadResponse(r)}
          onReRun={(r) => actions.reRunWithStored(r)}
          onDelete={(id) => actions.deleteResponse(id)}
          onUpdate={(id, updates) => actions.updateResponse(id, updates)}
          setC1Response={actions.setC1Response}
        />
      </div>
    </div>
  );
};

export default Page;
