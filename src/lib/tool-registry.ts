import type { ToolDefinition, ToolCategory } from '../types/tool';
import { CATEGORY_ORDER } from '../types/tool';

const tools = new Map<string, ToolDefinition>();

const VALID_ID = /^[a-z0-9-]+$/;

function validateTool(tool: ToolDefinition): void {
  if (!tool.id || !VALID_ID.test(tool.id)) {
    console.error(`[ToolRegistry] Invalid tool id: "${tool.id}". Must be lowercase alphanumeric with hyphens.`);
  }
  if (!tool.name?.trim()) {
    console.error(`[ToolRegistry] Tool "${tool.id}" missing name.`);
  }
  if (!tool.description?.trim()) {
    console.error(`[ToolRegistry] Tool "${tool.id}" missing description.`);
  }
  if (!tool.keywords?.length) {
    console.warn(`[ToolRegistry] Tool "${tool.id}" has no keywords.`);
  }
  if (!CATEGORY_ORDER.includes(tool.category)) {
    console.error(`[ToolRegistry] Tool "${tool.id}" has invalid category: "${tool.category}".`);
  }
  if (tool.type === 'internal' && !tool.component) {
    console.error(`[ToolRegistry] Internal tool "${tool.id}" missing component.`);
  }
  if (tool.type === 'external') {
    if (!tool.externalUrl) {
      console.error(`[ToolRegistry] External tool "${tool.id}" missing externalUrl.`);
    }
    try {
      new URL(tool.externalUrl);
    } catch {
      console.error(`[ToolRegistry] External tool "${tool.id}" has invalid externalUrl: "${tool.externalUrl}".`);
    }
  }
}

export function registerTool(tool: ToolDefinition): void {
  if (tools.has(tool.id)) {
    console.error(`[ToolRegistry] Duplicate tool id: "${tool.id}". Overwriting previous registration.`);
  }
  validateTool(tool);
  tools.set(tool.id, tool);
}

export function getTool(id: string): ToolDefinition | undefined {
  return tools.get(id);
}

export function getAllTools(): ToolDefinition[] {
  return Array.from(tools.values());
}

export function getToolsByCategory(category: ToolCategory): ToolDefinition[] {
  return Array.from(tools.values()).filter(t => t.category === category);
}

export function getGroupedTools(): Record<ToolCategory, ToolDefinition[]> {
  const grouped = {} as Record<ToolCategory, ToolDefinition[]>;
  for (const cat of CATEGORY_ORDER) {
    grouped[cat] = [];
  }
  for (const tool of tools.values()) {
    if (!grouped[tool.category]) {
      grouped[tool.category] = [];
    }
    grouped[tool.category].push(tool);
  }
  return grouped;
}

export function searchTools(query: string): ToolDefinition[] {
  const q = query.toLowerCase();
  const scored = Array.from(tools.values()).map(tool => {
    let score = 0;
    // id exact match
    if (tool.id === q) score += 100;
    // id starts with
    else if (tool.id.startsWith(q)) score += 50;
    // id contains
    else if (tool.id.includes(q)) score += 30;
    // name starts with
    if (tool.name.toLowerCase().startsWith(q)) score += 40;
    // name contains
    else if (tool.name.toLowerCase().includes(q)) score += 20;
    // keyword match
    for (const k of tool.keywords) {
      if (k.toLowerCase() === q) score += 15;
      else if (k.toLowerCase().includes(q)) score += 5;
    }
    return { tool, score };
  });
  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(s => s.tool);
}

export function clearTools(): void {
  tools.clear();
}
