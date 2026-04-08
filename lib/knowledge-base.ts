import { promises as fs } from "fs";
import path from "path";
import type { AgentId } from "@/lib/types";

const ROOT = path.join(process.cwd(), "knowledge-base");
const PROMPTS = path.join(process.cwd(), "prompts");

export async function readSharedKnowledgeBase() {
  return fs.readFile(path.join(ROOT, "shared.md"), "utf8");
}

export async function readVerticalKnowledgeBase(agent: AgentId) {
  return fs.readFile(path.join(ROOT, `${agent}.md`), "utf8");
}

export async function readPrompt(agent: AgentId) {
  return fs.readFile(path.join(PROMPTS, `${agent}.md`), "utf8");
}

export async function readManagerPrompt() {
  return fs.readFile(path.join(PROMPTS, "manager.md"), "utf8");
}

