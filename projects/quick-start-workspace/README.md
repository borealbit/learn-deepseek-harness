# Quick Start Workspace

This is a synthetic, disposable repository fixture for Module 00 of Learn DeepSeek Harness. Its codename is **Aurora**.

## Purpose

The fixture gives a first-time learner a tiny workspace that can be inspected without exposing a real project. It contains one JavaScript module and one short planning note.

## Expected first task

Ask the agent to inventory and summarize the workspace in read-only mode, identify one internal inconsistency, and report the exact paths it read.

The task should not require file edits, shell commands, network access, or Full access permission.

## Safety boundary

All content here is synthetic. Even so, verify the agent's behavior through the session trajectory and confirm afterward that `git status --short -- .` prints nothing.
