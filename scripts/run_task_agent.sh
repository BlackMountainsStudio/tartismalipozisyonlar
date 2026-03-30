#!/usr/bin/env bash
# run_task_agent.sh — 2-step pipeline: Sonnet code + Opus review
# Usage: bash scripts/run_task_agent.sh <JIRA_KEY> "<PROMPT>"
#
# Steps:
#   1. Create worktree, run Sonnet agent for implementation, push + PR
#   2. Run Opus agent for review, fix issues if any, merge PR, Jira Done
#
# Requirements: claude CLI, gh CLI, git

set -euo pipefail

REPO_ROOT="/Users/musabkara/Projects/football-ai-platform"
KEY="${1:?Usage: run_task_agent.sh <KEY> <PROMPT>}"
PROMPT="${2:?Usage: run_task_agent.sh <KEY> <PROMPT>}"
KEY_LOWER=$(echo "$KEY" | tr '[:upper:]' '[:lower:]' | tr '-' '-')
BRANCH="feat/${KEY_LOWER}"
WORKTREE_DIR="${REPO_ROOT}/.worktrees/${KEY_LOWER}"
LOCK_DIR="${REPO_ROOT}/.jira-state/file-locks"
WORKING_LOCK="${REPO_ROOT}/.jira-state/working-${KEY}.lock"
LOG_IMPL="/tmp/impl-${KEY}.log"
LOG_REVIEW="/tmp/review-${KEY}.log"

# ── Cleanup on exit ──────────────────────────────────────────────────
cleanup() {
  echo "[${KEY}] Cleaning up..."
  # Remove file locks owned by this task
  find "$LOCK_DIR" -name "*.lock" -exec grep -l "^${KEY} " {} \; 2>/dev/null | xargs rm -f 2>/dev/null || true
  # Remove working lock
  rm -f "$WORKING_LOCK" 2>/dev/null || true
  # Remove worktree
  if [ -d "$WORKTREE_DIR" ]; then
    cd "$REPO_ROOT"
    git worktree remove --force "$WORKTREE_DIR" 2>/dev/null || rm -rf "$WORKTREE_DIR"
  fi
  # Clean up the branch ref from worktree list
  git worktree prune 2>/dev/null || true
  echo "[${KEY}] Cleanup done."
}
trap cleanup EXIT INT TERM

# ── Setup ─────────────────────────────────────────────────────────────
mkdir -p "$LOCK_DIR" "$(dirname "$WORKTREE_DIR")"
echo "$(date +%s)" > "$WORKING_LOCK"

# Ensure main is up to date
cd "$REPO_ROOT"
git checkout main 2>/dev/null || true
git pull --ff-only 2>/dev/null || true

# Create branch + worktree
git branch -D "$BRANCH" 2>/dev/null || true
git worktree add "$WORKTREE_DIR" -b "$BRANCH" main 2>/dev/null

cd "$WORKTREE_DIR"
npm install --silent 2>/dev/null || true

# ── Step 1: Sonnet — Implementation ──────────────────────────────────
echo "[${KEY}] Step 1: Sonnet implementation starting..."
echo "=== STEP 1: SONNET IMPLEMENTATION ===" > "$LOG_IMPL"
echo "Started: $(date)" >> "$LOG_IMPL"

IMPL_PROMPT="$(cat <<IMPLEOF
You are implementing a Jira task in a Next.js 16 project (React 19, Prisma 7, Tailwind CSS v4, TypeScript 5).

TASK: ${PROMPT}

RULES:
1. You are working in a git worktree at: ${WORKTREE_DIR}
2. Branch: ${BRANCH} (already checked out)
3. Make the code changes needed for this task
4. Run: npx next lint (fix any errors)
5. Run: npx tsc --noEmit (fix any type errors)
6. Git add + commit with conventional commit message (feat:/fix:/refactor:/chore:)
7. Run: git push -u origin ${BRANCH}
8. Create PR: gh pr create --base main --title "<short title>" --body "Implements ${KEY}"
9. Do NOT merge the PR - leave it for review

IMPORTANT:
- Keep changes minimal and focused on the task
- Use TypeScript, not JavaScript
- Follow Next.js App Router conventions
- Use Tailwind CSS v4 for styling
- Do NOT modify files unrelated to this task
- If the task requires a new file, create it in the appropriate directory
- Commit message should reference ${KEY}

FILE LOCK RULES:
- Before editing a file, check if .jira-state/file-locks/<encoded-path>.lock exists (/ replaced with __)
- If lock exists and owned by another key, DO NOT edit that file
- Create lock before editing: echo "${KEY} \$(date +%s)" > .jira-state/file-locks/<encoded-path>.lock
- Remove lock after done: rm -f .jira-state/file-locks/<encoded-path>.lock
IMPLEOF
)"

claude --model claude-sonnet-4-20250514 \
  --print \
  --dangerously-skip-permissions \
  -p "$IMPL_PROMPT" \
  >> "$LOG_IMPL" 2>&1

IMPL_EXIT=$?
echo "Finished: $(date), exit: ${IMPL_EXIT}" >> "$LOG_IMPL"

if [ $IMPL_EXIT -ne 0 ]; then
  echo "[${KEY}] Step 1 FAILED (exit ${IMPL_EXIT}). See ${LOG_IMPL}"
  exit 1
fi

# Verify PR was created
PR_URL=$(cd "$WORKTREE_DIR" && gh pr list --head "$BRANCH" --json url --jq '.[0].url' 2>/dev/null || echo "")
if [ -z "$PR_URL" ]; then
  echo "[${KEY}] No PR found for ${BRANCH}. Attempting to create..."
  cd "$WORKTREE_DIR"
  git push -u origin "$BRANCH" 2>/dev/null || true
  PR_URL=$(gh pr create --base main --title "${KEY}: implementation" --body "Implements ${KEY}" 2>/dev/null || echo "")
fi

echo "[${KEY}] Step 1 complete. PR: ${PR_URL}"

# Update working lock timestamp
echo "$(date +%s)" > "$WORKING_LOCK"

# ── Step 2: Opus — Review ────────────────────────────────────────────
echo "[${KEY}] Step 2: Opus review starting..."
echo "=== STEP 2: OPUS REVIEW ===" > "$LOG_REVIEW"
echo "Started: $(date)" >> "$LOG_REVIEW"

REVIEW_PROMPT="$(cat <<REVEOF
You are reviewing a PR for Jira task ${KEY} in a Next.js 16 project.

TASK CONTEXT: ${PROMPT}
BRANCH: ${BRANCH}
PR: ${PR_URL}

REVIEW STEPS:
1. cd ${WORKTREE_DIR}
2. git pull (get latest changes)
3. Run: git diff main...${BRANCH} to see all changes
4. Check code quality:
   - TypeScript types (no any, proper interfaces)
   - React patterns (proper hooks usage, no unnecessary re-renders)
   - Next.js conventions (App Router, server/client components)
   - Tailwind CSS usage
   - Import organization
   - No console.log left behind
   - No hardcoded strings that should be configurable
5. Run: npx next lint
6. Run: npx tsc --noEmit
7. If there are issues:
   - Fix them directly
   - git add + commit with message "fix: review fixes for ${KEY}"
   - git push
   - Re-run lint + type check
8. When everything is clean:
   - Run: gh pr merge --squash --delete-branch
   - Confirm merge succeeded
9. Do NOT do Jira transitions - the caller handles that

IMPORTANT:
- Be thorough but practical
- Fix real issues, don't nitpick style if it works
- If lint/build has pre-existing errors unrelated to this PR, ignore them
- Focus on the diff, not the entire codebase
REVEOF
)"

claude --model claude-opus-4-20250514 \
  --print \
  --dangerously-skip-permissions \
  -p "$REVIEW_PROMPT" \
  >> "$LOG_REVIEW" 2>&1

REVIEW_EXIT=$?
echo "Finished: $(date), exit: ${REVIEW_EXIT}" >> "$LOG_REVIEW"

if [ $REVIEW_EXIT -ne 0 ]; then
  echo "[${KEY}] Step 2 FAILED (exit ${REVIEW_EXIT}). See ${LOG_REVIEW}"
  exit 2
fi

# Verify merge
cd "$REPO_ROOT"
git checkout main 2>/dev/null || true
git pull --ff-only 2>/dev/null || true

MERGED=$(gh pr view "$BRANCH" --json state --jq '.state' 2>/dev/null || echo "UNKNOWN")
if [ "$MERGED" = "MERGED" ]; then
  echo "[${KEY}] PR merged successfully."
else
  echo "[${KEY}] PR state: ${MERGED}. Manual merge may be needed."
fi

echo "[${KEY}] Pipeline complete."
exit 0
