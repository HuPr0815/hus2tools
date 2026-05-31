import type { ReactNode, ComponentType } from 'react';

export type ToolCategory = 'format' | 'encode' | 'convert' | 'generate' | 'text' | 'network' | 'office' | 'external';

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  format: '格式化与校验',
  encode: '编码与解码',
  convert: '数据转换',
  generate: '数据生成',
  text: '文本处理',
  network: '网络与API',
  office: '办公工具',
  external: '外部工具',
};

export const CATEGORY_ORDER: ToolCategory[] = ['format', 'encode', 'convert', 'generate', 'text', 'network', 'office', 'external'];

export interface InternalTool {
  type: 'internal';
  id: string;
  name: string;
  description: string;
  icon: ReactNode;
  category: ToolCategory;
  component: ComponentType;
  keywords: string[];
  placeholder?: string;
}

export interface ExternalLink {
  name: string;
  url: string;
  description: string;
}

export interface ExternalTool {
  type: 'external';
  id: string;
  name: string;
  description: string;
  icon: ReactNode;
  category: ToolCategory;
  externalUrl: string;
  alternatives?: ExternalLink[];
  keywords: string[];
}

export type ToolDefinition = InternalTool | ExternalTool;
