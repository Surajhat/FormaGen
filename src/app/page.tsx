"use client";

import { useRouter } from "next/navigation";
import { useChat } from "./context/ChatContext";
import { useEffect, useRef } from "react";

export default function HomePage() {
  const router = useRouter();
  const { query, setQuery, sendMessage, isLoading, messages, theme, toggleTheme } = useChat();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isDark = theme === "dark";

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      router.push("/chat");
    }
  }, [messages, router]);

  const handleSend = async () => {
    if (!query.trim() || isLoading) return;
    await sendMessage(query);
    router.push("/chat");
  };

  const suggestions = [
    { icon: "📊", text: "Create a dashboard showing sales metrics" },
    { icon: "👤", text: "Build a user profile card component" },
    { icon: "📋", text: "Generate a data table with sorting" },
    { icon: "💰", text: "Design a pricing comparison chart" },
  ];

  return (
    <div
      className={`min-h-screen flex flex-col transition-all duration-500 ${
        isDark
          ? "bg-gradient-to-b from-[#0a0a0a] via-[#0d0d0d] to-[#111111]"
          : "bg-gradient-to-b from-[#fafafa] via-[#f5f5f5] to-[#f0f0f0]"
      }`}
    >
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 ${
          isDark ? "bg-[#0a0a0a]/90" : "bg-[#fafafa]/90"
        } backdrop-blur-2xl border-b ${isDark ? "border-white/[0.06]" : "border-black/[0.06]"}`}
      >
        <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-20 xl:px-24 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                isDark
                  ? "bg-gradient-to-br from-white to-gray-200 text-black shadow-white/10"
                  : "bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] text-white shadow-black/20"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <div>
              <span className={`text-xl font-bold tracking-tight ${isDark ? "text-white" : "text-[#0d0d0d]"}`}>
                FormaGen
              </span>
              <p className={`text-xs mt-0.5 ${isDark ? "text-white/40" : "text-black/40"}`}>
                AI-Powered UI Generator
              </p>
            </div>
          </div>
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
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 sm:px-12 lg:px-16 xl:px-20 pt-36 pb-24">
        <div className="w-full max-w-5xl">
          {/* Hero */}
          <div className="text-center mb-14">
            <div
              className={`inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-sm font-medium mb-10 ${
                isDark
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
              }`}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              Powered by C1 Components
            </div>
            <h1
              className={`text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.1] ${
                isDark ? "text-white" : "text-[#0d0d0d]"
              }`}
            >
              What can I help you
              <span className={`block mt-2 ${isDark ? "text-white/90" : "text-black/90"}`}>
                build today?
              </span>
            </h1>
            <p className={`text-lg sm:text-xl max-w-xl mx-auto leading-relaxed ${isDark ? "text-white/50" : "text-black/50"}`}>
              Describe what you need and watch it come to life with generative UI components.
            </p>
          </div>

          {/* Input Card */}
          <div
            className={`rounded-3xl shadow-2xl ${
              isDark
                ? "bg-[#161616] shadow-black/40 border border-white/[0.08]"
                : "bg-white shadow-black/[0.08] border border-black/[0.06]"
            }`}
          >
            <div className="px-6 pt-6 pb-4">
              <textarea
                ref={textareaRef}
                rows={4}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && !isLoading) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Describe what you want to build..."
                className={`w-full resize-none text-lg bg-transparent focus:outline-none leading-relaxed ${
                  isDark
                    ? "text-white placeholder-white/30"
                    : "text-[#0d0d0d] placeholder-black/30"
                }`}
              />
            </div>
            <div
              className={`px-6 py-5 flex items-center justify-between border-t ${
                isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-black/[0.04] bg-black/[0.01]"
              }`}
            >
              <span className={`text-sm flex items-center gap-2 ${isDark ? "text-white/30" : "text-black/30"}`}>
                <kbd className={`px-2.5 py-1.5 rounded-lg text-xs font-medium ${isDark ? "bg-white/[0.06] text-white/50" : "bg-black/[0.04] text-black/50"}`}>⌘</kbd>
                <span>+</span>
                <kbd className={`px-2.5 py-1.5 rounded-lg text-xs font-medium ${isDark ? "bg-white/[0.06] text-white/50" : "bg-black/[0.04] text-black/50"}`}>Enter</kbd>
                <span className="ml-1">to send</span>
              </span>
              <button
                onClick={handleSend}
                disabled={!query.trim() || isLoading}
                className={`flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none hover:scale-[1.02] active:scale-[0.98] ${
                  isDark
                    ? "bg-white text-black hover:bg-white/95 shadow-lg shadow-white/10"
                    : "bg-[#0d0d0d] text-white hover:bg-black/90 shadow-lg shadow-black/20"
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <span>Generate UI</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Suggestions */}
          <div className="mt-12">
            <p className={`text-sm font-medium mb-6 ${isDark ? "text-white/40" : "text-black/40"}`}>
              Try one of these examples
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => setQuery(suggestion.text)}
                  className={`group text-left px-6 py-5 rounded-2xl text-sm transition-all duration-200 ${
                    isDark
                      ? "bg-white/[0.03] hover:bg-white/[0.06] text-white/70 hover:text-white border border-white/[0.06] hover:border-white/[0.12]"
                      : "bg-black/[0.02] hover:bg-black/[0.04] text-black/70 hover:text-black border border-black/[0.04] hover:border-black/[0.08]"
                  }`}
                >
                  <span className="flex items-start gap-4">
                    <span className="text-xl mt-0.5">{suggestion.icon}</span>
                    <span className="leading-relaxed flex-1">{suggestion.text}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`py-12 px-8 text-center border-t ${isDark ? "border-white/[0.04]" : "border-black/[0.04]"}`}>
        <p className={`text-sm ${isDark ? "text-white/25" : "text-black/25"}`}>
          Built with C1 by Thesys • Generative UI Components
        </p>
      </footer>
    </div>
  );
}
