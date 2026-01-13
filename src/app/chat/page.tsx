"use client";

import "@crayonai/react-ui/styles/index.css";
import { ThemeProvider, C1Component } from "@thesysai/genui-sdk";
import { useRouter } from "next/navigation";
import { useChat } from "../context/ChatContext";
import { useEffect, useRef } from "react";

export default function ChatPage() {
  const router = useRouter();
  const {
    query,
    setQuery,
    currentResponse,
    setCurrentResponse,
    isLoading,
    messages,
    selectedMessageId,
    selectMessage,
    deleteMessage,
    sendMessage,
    theme,
    toggleTheme,
    clearAll,
  } = useChat();
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isDark = theme === "dark";

  useEffect(() => {
    if (messages.length === 0 && !isLoading && !currentResponse) {
      router.push("/");
    }
  }, [messages, isLoading, currentResponse, router]);

  useEffect(() => {
    if (messages.length > 0 && !selectedMessageId) {
      selectMessage(messages[0].id);
    }
  }, [messages, selectedMessageId, selectMessage]);

  const handleSend = async () => {
    if (!query.trim() || isLoading) return;
    await sendMessage(query);
  };

  const selectedMessage = messages.find((m) => m.id === selectedMessageId);

  const handleNewChat = () => {
    clearAll();
    router.push("/");
  };

  return (
    <div
      className={`h-screen flex flex-col overflow-hidden transition-all duration-300 ${
        isDark 
          ? "bg-gradient-to-br from-[#0a0a0a] via-[#0d0d0d] to-[#0a0a0a]" 
          : "bg-gradient-to-br from-[#fafafa] via-[#f5f5f5] to-[#fafafa]"
      }`}
    >
      {/* Header */}
      <header
        className={`flex-shrink-0 border-b backdrop-blur-xl ${
          isDark 
            ? "bg-[#0a0a0a]/80 border-white/[0.06]" 
            : "bg-[#fafafa]/80 border-black/[0.06]"
        }`}
      >
        <div className="px-8 sm:px-10 lg:px-12 xl:px-16 py-5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={handleNewChat}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                isDark
                  ? "bg-white/[0.06] hover:bg-white/[0.1] text-white/80 hover:text-white border border-white/[0.08]"
                  : "bg-black/[0.04] hover:bg-black/[0.08] text-black/80 hover:text-black border border-black/[0.06]"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New Chat
            </button>
            <div className={`h-6 w-px ${isDark ? "bg-white/[0.08]" : "bg-black/[0.08]"}`} />
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md ${
                  isDark 
                    ? "bg-gradient-to-br from-white to-gray-200 text-black shadow-white/5" 
                    : "bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] text-white shadow-black/10"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <div>
                <span className={`font-bold text-base ${isDark ? "text-white" : "text-[#0d0d0d]"}`}>FormaGen</span>
                <p className={`text-xs ${isDark ? "text-white/40" : "text-black/40"}`}>Chat Interface</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-xs font-medium px-4 py-2 rounded-lg ${
              isDark ? "bg-white/[0.04] text-white/40" : "bg-black/[0.03] text-black/40"
            }`}>
              {messages.length} conversation{messages.length !== 1 ? "s" : ""}
            </span>
            <button
              onClick={toggleTheme}
              className={`p-3 rounded-xl transition-all duration-200 ${
                isDark
                  ? "bg-white/[0.06] hover:bg-white/[0.1] text-white/70 hover:text-white border border-white/[0.06]"
                  : "bg-black/[0.04] hover:bg-black/[0.08] text-black/70 hover:text-black border border-black/[0.06]"
              }`}
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Chat History */}
        <aside
          className={`w-[340px] flex-shrink-0 flex flex-col border-r ${
            isDark 
              ? "bg-[#111111]/50 border-white/[0.06]" 
              : "bg-white/50 border-black/[0.06]"
          }`}
        >
          {/* Section Header */}
          <div className={`px-6 py-4 border-b ${isDark ? "border-white/[0.04]" : "border-black/[0.04]"}`}>
            <h2 className={`text-sm font-semibold ${isDark ? "text-white/70" : "text-black/70"}`}>
              Recent Conversations
            </h2>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="space-y-2">
              {messages.length === 0 ? (
                <div className={`text-center py-16 px-6 ${isDark ? "text-white/30" : "text-black/30"}`}>
                  <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                  <p className="text-sm">No conversations yet</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => selectMessage(msg.id)}
                    className={`group relative flex items-start gap-3 p-4 rounded-2xl cursor-pointer transition-all duration-200 ${
                      selectedMessageId === msg.id
                        ? isDark
                          ? "bg-white/[0.08] border border-white/[0.1]"
                          : "bg-black/[0.05] border border-black/[0.08]"
                        : isDark
                          ? "hover:bg-white/[0.04] border border-transparent"
                          : "hover:bg-black/[0.02] border border-transparent"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-semibold ${
                        selectedMessageId === msg.id
                          ? isDark
                            ? "bg-white text-black"
                            : "bg-[#0d0d0d] text-white"
                          : isDark 
                            ? "bg-white/[0.08] text-white/70" 
                            : "bg-black/[0.05] text-black/70"
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium truncate leading-tight ${
                          isDark ? "text-white" : "text-[#0d0d0d]"
                        }`}
                      >
                        {msg.title}
                      </p>
                      <p
                        className={`text-xs mt-1.5 ${
                          isDark ? "text-white/40" : "text-black/40"
                        }`}
                      >
                        {new Date(msg.timestamp).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMessage(msg.id);
                      }}
                      className={`opacity-0 group-hover:opacity-100 p-2 rounded-lg transition-all duration-200 ${
                        isDark
                          ? "hover:bg-red-500/20 text-white/40 hover:text-red-400"
                          : "hover:bg-red-500/10 text-black/40 hover:text-red-500"
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Input Area */}
          <div className={`flex-shrink-0 p-4 border-t ${isDark ? "border-white/[0.06]" : "border-black/[0.06]"}`}>
            <div
              className={`rounded-2xl overflow-hidden shadow-lg ${
                isDark 
                  ? "bg-[#0d0d0d] border border-white/[0.08] shadow-black/30" 
                  : "bg-[#fafafa] border border-black/[0.06] shadow-black/[0.05]"
              }`}
            >
              <textarea
                ref={textareaRef}
                rows={3}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && !isLoading) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type your message..."
                className={`w-full resize-none px-4 py-3 text-sm bg-transparent focus:outline-none leading-relaxed ${
                  isDark ? "text-white placeholder-white/30" : "text-[#0d0d0d] placeholder-black/30"
                }`}
              />
              <div
                className={`px-4 py-3 flex items-center justify-between border-t ${
                  isDark ? "border-white/[0.06]" : "border-black/[0.04]"
                }`}
              >
                <span className={`text-xs flex items-center gap-1.5 ${isDark ? "text-white/25" : "text-black/25"}`}>
                  <kbd className={`px-1.5 py-0.5 rounded text-[10px] ${isDark ? "bg-white/[0.06]" : "bg-black/[0.04]"}`}>⌘</kbd>
                  <span>+</span>
                  <kbd className={`px-1.5 py-0.5 rounded text-[10px] ${isDark ? "bg-white/[0.06]" : "bg-black/[0.04]"}`}>↵</kbd>
                </span>
                <button
                  onClick={handleSend}
                  disabled={!query.trim() || isLoading}
                  className={`p-2.5 rounded-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed ${
                    isDark
                      ? "bg-white text-black hover:bg-white/90"
                      : "bg-[#0d0d0d] text-white hover:bg-black/90"
                  }`}
                >
                  {isLoading ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Panel - C1 Response */}
        <main className={`flex-1 flex flex-col overflow-hidden ${isDark ? "bg-[#0d0d0d]" : "bg-[#f5f5f5]"}`}>
          {/* Prompt Header */}
          <div
            className={`flex-shrink-0 px-8 sm:px-10 lg:px-12 py-6 border-b ${
              isDark ? "border-white/[0.06] bg-[#0d0d0d]" : "border-black/[0.04] bg-white"
            }`}
          >
            <div className="flex items-center gap-6">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  isDark 
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" 
                    : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${isDark ? "text-white/40" : "text-black/40"}`}>
                  Your Prompt
                </p>
                <p className={`text-base font-medium truncate ${isDark ? "text-white" : "text-[#0d0d0d]"}`}>
                  {selectedMessage?.query || query || "Select a conversation to view"}
                </p>
              </div>
              {isLoading && (
                <div
                  className={`flex items-center gap-2.5 px-4 py-2 rounded-full text-sm font-medium ${
                    isDark 
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" 
                      : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                  }`}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Generating...
                </div>
              )}
            </div>
          </div>

          {/* C1 Response Area */}
          <div className={`flex-1 overflow-y-auto ${isDark ? "bg-[#111111]" : "bg-white"}`}>
            <div className="p-8 sm:p-10 lg:p-12">
              <div className="flex items-start gap-6">
                <div
                  className={`w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg ${
                    isDark 
                      ? "bg-gradient-to-br from-white to-gray-200 text-black shadow-white/5" 
                      : "bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] text-white shadow-black/10"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold mb-4 ${isDark ? "text-white/60" : "text-black/60"}`}>
                    AI Response
                  </p>
                  <div
                    className={`rounded-2xl p-6 ${
                      isDark 
                        ? "bg-white/[0.03] border border-white/[0.08]" 
                        : "bg-[#fafafa] border border-black/[0.05]"
                    }`}
                  >
                    {(selectedMessage?.response || currentResponse) ? (
                      <ThemeProvider>
                        <C1Component
                          c1Response={selectedMessage?.response || currentResponse}
                          isStreaming={isLoading}
                          updateMessage={(message) => setCurrentResponse(message)}
                          onAction={({ llmFriendlyMessage }) => {
                            if (!isLoading) {
                              setQuery(llmFriendlyMessage);
                              sendMessage(llmFriendlyMessage);
                            }
                          }}
                        />
                      </ThemeProvider>
                    ) : (
                      <div className={`text-center py-20 px-6 ${isDark ? "text-white/30" : "text-black/30"}`}>
                        <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                        </svg>
                        <p className="text-lg font-medium mb-2">No response yet</p>
                        <p className="text-sm">Send a message to generate a UI component</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
