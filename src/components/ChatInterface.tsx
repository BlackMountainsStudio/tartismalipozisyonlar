"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User } from "lucide-react";
import { track } from "@vercel/analytics";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  matchId?: string;
}

export default function ChatInterface({ matchId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    track("chat_message_sent", { matchId: matchId ?? "global", messageIndex: newMessages.length });
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, matchId }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const suggestions = [
    "Show me incidents with confidence above 0.7",
    "Merge similar penalty incidents",
    "Explain why this incident was detected",
    "Summarize all pending incidents",
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-6">
            <div className="rounded-full bg-emerald-500/10 p-4">
              <Bot className="h-8 w-8 text-emerald-400" />
            </div>
            <div className="text-center">
              <h3 className="mb-1 text-lg font-semibold text-white">
                AI Assistant
              </h3>
              <p className="text-sm text-zinc-400">
                Ask me about matches, incidents, or any football controversy.
              </p>
            </div>
            <div className="grid w-full max-w-lg grid-cols-1 gap-2 sm:grid-cols-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setInput(s)}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-left text-xs text-zinc-400 transition-colors hover:border-zinc-700 hover:text-white"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-4 flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
          >
            {msg.role === "assistant" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                <Bot className="h-4 w-4 text-emerald-400" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-emerald-600 text-white"
                  : "bg-zinc-800 text-zinc-200"
              }`}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-700">
                <User className="h-4 w-4 text-zinc-300" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="mb-4 flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
              <Bot className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="rounded-xl bg-zinc-800 px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-zinc-800 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about incidents, matches, or referee decisions..."
            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-emerald-500"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
