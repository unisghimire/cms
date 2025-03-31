-- Add Followups menu item
INSERT INTO menu_items (title, path, icon, is_active, parent_id, sort_order)
VALUES (
  'Followups',
  '/leads/followups',
  'CalendarToday',
  true,
  (SELECT id FROM menu_items WHERE title = 'Leads'),
  (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM menu_items WHERE parent_id = (SELECT id FROM menu_items WHERE title = 'Leads'))
)
ON CONFLICT (path) DO NOTHING; 