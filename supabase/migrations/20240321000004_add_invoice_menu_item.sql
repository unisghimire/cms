-- Insert Invoice menu item
insert into menu_items (title, path, icon, is_active, parent_id, sort_order) values
  ('Invoice', '/leads/invoice', 'Receipt', true, (select id from menu_items where path = '/leads'), 5);

-- Add RLS policy for the new menu item
create policy "Allow authenticated users to view invoice menu item"
  on menu_items for select
  to authenticated
  using (title = 'Invoice'); 