-- Add Applications menu item
insert into menu_items (title, path, icon, is_active, sort_order) values
  ('Applications', '/leads/applications', 'Description', true, 5);

-- Add Documents menu item if it doesn't exist
insert into menu_items (title, path, icon, is_active, sort_order)
select 'Documents', '/leads/documents', 'Description', true, 6
where not exists (
  select 1 from menu_items where path = '/leads/documents'
); 