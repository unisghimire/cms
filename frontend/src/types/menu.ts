import { ReactNode } from 'react';

/**
 * Base interface for menu items from the database
 */
export interface BaseMenuItem {
  /** Unique identifier for the menu item */
  id: string;
  /** Display title of the menu item */
  title: string;
  /** URL path for navigation */
  path: string;
  /** Whether the menu item is currently active/visible */
  is_active: boolean;
  /** Reference to parent menu item for nested structure */
  parent_id?: string;
  /** Order number for custom sorting (lower numbers appear first) */
  sort_order: number;
  /** Timestamp when the menu item was created */
  created_at: string;
  /** Timestamp when the menu item was last updated */
  updated_at: string;
}

/**
 * Interface for menu items from the database
 */
export interface MenuItem extends BaseMenuItem {
  /** Icon name that maps to a Material-UI icon component */
  icon: string;
  /** Nested child menu items */
  children?: MenuItem[];
}

/**
 * Interface for menu items with React icon components
 */
export interface MenuItemWithIcon extends BaseMenuItem {
  /** React component for the icon */
  icon: ReactNode;
  /** Nested child menu items */
  children?: MenuItemWithIcon[];
} 