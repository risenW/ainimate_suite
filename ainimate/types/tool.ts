import { LucideIcon } from "lucide-react";

export interface ToolItem {
  id: string;
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  shapeType?: string;
}

export interface ToolGroupSection {
  group: string;
  items: ToolItem[];
} 
