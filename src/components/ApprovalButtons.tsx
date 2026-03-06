"use client";

import { useState } from "react";
import { Check, X, Pencil, GitMerge, Loader2 } from "lucide-react";

interface ApprovalButtonsProps {
  incidentId: string;
  currentStatus: string;
  onStatusChange?: (id: string, status: string) => void;
  onEdit?: (id: string) => void;
  onMerge?: (id: string) => void;
}

export default function ApprovalButtons({
  incidentId,
  currentStatus,
  onStatusChange,
  onEdit,
  onMerge,
}: ApprovalButtonsProps) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleAction(action: string) {
    setLoading(action);
    try {
      if (action === "approve" || action === "reject") {
        const status = action === "approve" ? "APPROVED" : "REJECTED";
        const res = await fetch(`/api/incidents/${incidentId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (res.ok) onStatusChange?.(incidentId, status);
      } else if (action === "edit") {
        onEdit?.(incidentId);
      } else if (action === "merge") {
        onMerge?.(incidentId);
      }
    } catch (err) {
      console.error(`Action ${action} failed:`, err);
    } finally {
      setLoading(null);
    }
  }

  const isApproved = currentStatus === "APPROVED";
  const isRejected = currentStatus === "REJECTED";

  return (
    <>
      <button
        onClick={() => handleAction("approve")}
        disabled={isApproved || loading !== null}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
          isApproved
            ? "bg-emerald-500/20 text-emerald-400"
            : "bg-zinc-800 text-zinc-300 hover:bg-emerald-500/10 hover:text-emerald-400"
        } disabled:opacity-50`}
      >
        {loading === "approve" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Check className="h-3.5 w-3.5" />
        )}
        Approve
      </button>

      <button
        onClick={() => handleAction("reject")}
        disabled={isRejected || loading !== null}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
          isRejected
            ? "bg-red-500/20 text-red-400"
            : "bg-zinc-800 text-zinc-300 hover:bg-red-500/10 hover:text-red-400"
        } disabled:opacity-50`}
      >
        {loading === "reject" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <X className="h-3.5 w-3.5" />
        )}
        Reject
      </button>

      <button
        onClick={() => handleAction("edit")}
        disabled={loading !== null}
        className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white disabled:opacity-50"
      >
        <Pencil className="h-3.5 w-3.5" />
        Edit
      </button>

      <button
        onClick={() => handleAction("merge")}
        disabled={loading !== null}
        className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white disabled:opacity-50"
      >
        <GitMerge className="h-3.5 w-3.5" />
        Merge
      </button>
    </>
  );
}
