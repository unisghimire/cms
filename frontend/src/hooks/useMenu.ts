import { useState, useEffect } from 'react';
import React from 'react';
import { supabase } from '../lib/supabase';
import { MenuItem, MenuItemWithIcon } from '../types/menu';
import * as Icons from '@mui/icons-material';

/**
 * Maps icon names to Material-UI icon components
 * Add new mappings here as needed
 */
const iconMap: { [key: string]: React.ComponentType } = {
  Dashboard: Icons.Dashboard,
  People: Icons.People,
  Settings: Icons.Settings,
  Article: Icons.Article,
  Category: Icons.Category,
  Tag: Icons.Tag,
  Comment: Icons.Comment,
  Analytics: Icons.Analytics,
  Help: Icons.Help,
  Info: Icons.Info,
  // Add more icon mappings as needed
};

/**
 * Custom hook for managing menu items
 * Handles fetching, transforming, and organizing menu items into a tree structure
 */
export const useMenu = () => {
  /** State for storing the menu items tree */
  const [menuItems, setMenuItems] = useState<MenuItemWithIcon[]>([]);
  /** Loading state while fetching menu items */
  const [loading, setLoading] = useState(true);
  /** Error state for handling fetch failures */
  const [error, setError] = useState<string | null>(null);

  /** Fetch menu items on component mount */
  useEffect(() => {
    fetchMenuItems();
  }, []);

  /**
   * Fetches menu items from Supabase and transforms them into a tree structure
   */
  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      // Fetch active menu items ordered by sort_order and creation date
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Transform database items to include React icon components
      const transformedMenuItems = data.map((item: MenuItem): MenuItemWithIcon => {
        const IconComponent = iconMap[item.icon] || Icons.Info;
        return {
          ...item,
          icon: React.createElement(IconComponent),
          children: [],
        };
      });

      // Build and set the menu tree
      const menuTree = buildMenuTree(transformedMenuItems);
      setMenuItems(menuTree);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch menu items');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Builds a tree structure from flat menu items
   * @param items - Array of menu items with icon components
   * @returns Array of root-level menu items with nested children
   */
  const buildMenuTree = (items: MenuItemWithIcon[]): MenuItemWithIcon[] => {
    // Map to store all items for quick lookup
    const itemMap = new Map<string, MenuItemWithIcon>();
    // Array to store root-level items (no parent)
    const roots: MenuItemWithIcon[] = [];

    // First pass: create a map of all items
    items.forEach(item => {
      itemMap.set(item.id, item);
    });

    // Second pass: build the tree structure by connecting parents and children
    items.forEach(item => {
      if (item.parent_id) {
        const parent = itemMap.get(item.parent_id);
        if (parent) {
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(item);
        }
      } else {
        roots.push(item);
      }
    });

    /**
     * Recursively sorts menu items by sort_order and creation date
     * @param items - Array of menu items to sort
     */
    const sortChildren = (items: MenuItemWithIcon[]) => {
      // Sort items by sort_order first, then by creation date
      items.sort((a, b) => {
        if (a.sort_order !== b.sort_order) {
          return a.sort_order - b.sort_order;
        }
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });

      // Recursively sort children
      items.forEach(item => {
        if (item.children && item.children.length > 0) {
          sortChildren(item.children);
        }
      });
    };

    // Sort the entire tree
    sortChildren(roots);
    return roots;
  };

  return { menuItems, loading, error, refetch: fetchMenuItems };
}; 