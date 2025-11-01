"use client";

import { Button } from "@crayonai/react-ui";
import { StoredResponse } from "../hooks/useUIState";
import { useState, useMemo } from "react";

type AppDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  storedResponses: StoredResponse[];
  onLoadResponse: (r: StoredResponse) => void;
  onReRun: (r: StoredResponse) => void;
  onDelete: (id: string) => void;
  onUpdate: (
    id: string,
    updates: Partial<Pick<StoredResponse, "title" | "query" | "response">>
  ) => void;
  setC1Response: (response: string) => void;
};

export function AppDrawer({
  isOpen,
  onClose,
  storedResponses,
  onLoadResponse,
  onReRun,
  onDelete,
  onUpdate, 
  setC1Response,
}: AppDrawerProps) {
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editQuery, setEditQuery] = useState("");
  const [editResponse, setEditResponse] = useState("");

  const filtered = useMemo(() => {
    if (!search) return storedResponses;
    const s = search.toLowerCase();
    return storedResponses.filter(
      (r) => r.query.toLowerCase().includes(s) || r.response.toLowerCase().includes(s)
    );
  }, [search, storedResponses]);

  return (
    <div
      className={`fixed inset-0 z-40 ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
    >
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity ${isOpen ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <aside
        className={`absolute right-0 top-0 h-full w-[22rem] bg-gray-50 border-l border-gray-200 p-6 overflow-y-auto
        transition-transform ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-modal="true"
        aria-label="Response History Drawer"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Response History</h3>
            <Button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 bg-transparent hover:bg-gray-100"
              size="small"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>

          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search history..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* List */}
          <div className="space-y-2 max-h-[70vh] overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">
                {search ? "No matching responses found" : "No saved responses yet"}
              </p>
            ) : (
              filtered.map((response) => (
                <div key={response.id} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                  {editingId === response.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        placeholder="Title"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                      />
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        placeholder="Query"
                        value={editQuery}
                        onChange={(e) => setEditQuery(e.target.value)}
                      />
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm h-24"
                        placeholder="Response"
                        value={editResponse}
                        onChange={(e) => setEditResponse(e.target.value)}
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => {
                            onUpdate(response.id, {
                              title: editTitle || editQuery || response.title,
                              query: editQuery,
                              response: editResponse,
                            });
                            setEditingId(null);
                          }}
                          className="bg-black text-white hover:bg-gray-800"
                          size="small"
                        >
                          Save
                        </Button>
                        <Button
                          onClick={() => setEditingId(null)}
                          className="bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                          size="small"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {response.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(response.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <Button
                          onClick={() => {
                            setC1Response(response.response);
                            onLoadResponse(response);
                            onClose();
                          }}
                          className="text-gray-500 hover:text-gray-700 bg-transparent hover:bg-gray-100"
                          size="small"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Button>
                        <Button
                          onClick={() => onReRun(response)}
                          className="text-gray-500 hover:text-gray-700 bg-transparent hover:bg-gray-100"
                          size="small"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582M20 20v-5h-.581M5 9a7.5 7.5 0 0114.356-2.133M19 15a7.5 7.5 0 01-14.356 2.134" />
                          </svg>
                        </Button>
                        <Button
                          onClick={() => {
                            setEditingId(response.id);
                            setEditTitle(response.title);
                            setEditQuery(response.query);
                            setEditResponse(response.response);
                          }}
                          className="text-gray-500 hover:text-gray-700 bg-transparent hover:bg-gray-100"
                          size="small"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </Button>
                        <Button
                          onClick={() => onDelete(response.id)}
                          className="text-red-500 hover:text-red-700 bg-transparent hover:bg-red-50"
                          size="small"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}


