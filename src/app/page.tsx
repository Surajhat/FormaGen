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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 text-black">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white border-b border-gray-800 shadow-lg">
        <div className="max-w-8xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-white to-gray-100 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-white/20 transition-transform hover:scale-105">
                <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent tracking-tight drop-shadow-lg">
                  FormaGen
                </h1>
                <p className="text-gray-300 text-sm mt-1 font-medium tracking-wide">Intelligent Component Interface</p>
              </div>
            </div>
            <Button
              onClick={() => actions.setIsHistoryOpen(!state.isHistoryOpen)}
              className="bg-white text-black hover:bg-gray-100 border border-gray-300 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 font-medium px-4 py-2"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              History ({state.storedResponses.length})
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-93px)] relative">
        {/* Left Sidebar - Form Section */}
        <aside 
          ref={sidebarRef}
          className="flex-shrink-0 bg-gradient-to-b from-gray-50 to-white border-r border-gray-300 overflow-y-auto shadow-inner"
          style={{ width: `${sidebarWidth}px` }}
        >
          <div className="p-6 space-y-6">
            {/* Tabs */}
            <div className="bg-white border border-gray-300 rounded-2xl shadow-lg p-2 backdrop-blur-sm">
              <div className="flex gap-2">
                <button
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold border flex-1 transition-all duration-200 ${
                    state.activeTab === "ask" 
                      ? "bg-gradient-to-r from-black to-gray-800 text-white border-black shadow-lg scale-[1.02]" 
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md"
                  }`}
                  onClick={() => actions.setActiveTab("ask")}
                >
                  Chat
                </button>
                <button
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold border flex-1 transition-all duration-200 ${
                    state.activeTab === "completion" 
                      ? "bg-gradient-to-r from-black to-gray-800 text-white border-black shadow-lg scale-[1.02]" 
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md"
                  }`}
                  onClick={() => actions.setActiveTab("completion")}
               >
                  Forma Mode
                </button>
              </div>
            </div>
            
            {/* Input Section */}
            <div className="bg-white border border-gray-300 rounded-2xl shadow-xl p-6 backdrop-blur-sm">
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {state.activeTab === "ask" ? "Start a Conversation" : "Data Analysis"}
                  </h2>
                  <p className="text-sm text-gray-600 font-medium">
                    {state.activeTab === "ask"
                      ? "Interact with the AI component"
                      : "Send a prompt to render UI response"}
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="prompt-input" className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                      {state.activeTab === "ask" ? "Your Message" : "Completion Prompt"}
                    </label>
                    <div className="relative">
                      <textarea
                        id="prompt-input"
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl
                          bg-gradient-to-br from-white to-gray-50 text-gray-900 text-sm placeholder-gray-400
                          focus:outline-none focus:ring-2 focus:ring-black focus:border-black
                          shadow-md hover:shadow-lg transition-all duration-200 resize-none
                          focus:bg-white"
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
                  <div className="flex flex-col gap-3">
                    <Button
                      onClick={() => {
                        if(state.activeTab=="ask"){
                          actions.makeApiCall(state.query)
                        } else {
                          actions.handleCompletionApiCall(state.query)
                        }
                      }}
                      disabled={state.query.length === 0 || state.isLoading}
                      className="w-full bg-gradient-to-r from-black to-gray-800 text-white hover:from-gray-800 hover:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] font-semibold py-3"
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
                        className="w-full bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 hover:from-gray-200 hover:to-gray-100 border-2 border-gray-300 hover:border-gray-400 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] font-medium"
                        size="small"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Save Response
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 text-center font-medium">
                    Press <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300 shadow-sm">Ctrl</kbd> + <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300 shadow-sm">Enter</kbd> to send
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Resize Handle */}
        <div
          className={`absolute top-0 bottom-0 w-1 bg-gradient-to-b from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500 cursor-col-resize transition-all duration-200 z-10 shadow-lg ${
            isResizing ? 'from-gray-500 to-gray-600' : ''
          }`}
          style={{ left: `${sidebarWidth}px`, transform: 'translateX(-50%)' }}
          onMouseDown={handleMouseDown}
        >
          <div className="absolute inset-y-0 left-1/2 w-6 -translate-x-1/2" />
        </div>

        {/* Main Content - Response Section */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-white via-gray-50 to-white">
          <div className="h-full flex flex-col">
            <div className="bg-gradient-to-r from-white to-gray-50 border-b-2 border-gray-300 px-6 py-5 flex-shrink-0 shadow-md">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-black to-gray-800 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-gray-200">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    AI Response
                  </h3>
                  <p className="text-gray-600 text-sm font-medium">Component interaction and responses will appear below</p>
                </div>
                {state.isLoading && (
                  <div className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 rounded-full shadow-inner">
                    <div className="w-2.5 h-2.5 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full animate-bounce"></div>
                    <div className="w-2.5 h-2.5 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2.5 h-2.5 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 p-8 overflow-y-auto bg-gradient-to-b from-transparent to-gray-50/30">
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
