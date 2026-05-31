import type { ToolDefinition, ToolCategory } from '../types/tool';
import { CATEGORY_ORDER } from '../types/tool';

const tools = new Map<string, ToolDefinition>();

export function registerTool(tool: ToolDefinition): void {
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
  return Array.from(tools.values()).filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.keywords.some(k => k.toLowerCase().includes(q))
  );
}

export function clearTools(): void {
  tools.clear();
}
