"use client";

import ChatInterface from "@/components/ChatInterface";

export default function DashboardChatPage() {
  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-4xl flex-col px-4 sm:px-6">
      <div className="border-b border-zinc-800 py-6">
        <h1 className="text-2xl font-bold text-white">AI Asistan</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Maçları analiz edin, olayları inceleyin ve içgörüler alın
        </p>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatInterface />
      </div>
    </div>
  );
}
