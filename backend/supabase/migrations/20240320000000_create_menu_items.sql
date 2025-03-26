-- Create the menu_items table with all required fields
create table menu_items (
  -- Unique identifier for each menu item
  id uuid default uuid_generate_v4() primary key,
  -- Display title of the menu item
  title text not null,
  -- URL path for navigation
  path text not null,
  -- Icon name that maps to a Material-UI icon component
  icon text not null,
  -- Whether the menu item is currently active/visible
  is_active boolean not null default true,
  -- Reference to parent menu item for nested structure
  parent_id uuid references menu_items(id),
  -- Order number for custom sorting (lower numbers appear first)
  sort_order integer not null default 0,
  -- Timestamp when the menu item was created
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Timestamp when the menu item was last updated
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a trigger to automatically update the updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_menu_items_updated_at
  before update on menu_items
  for each row
  execute function update_updated_at_column();

-- Insert sample menu items with sort_order values
insert into menu_items (title, path, icon, is_active, sort_order) values
  ('Dashboard', '/dashboard', 'Dashboard', true, 1),
  ('Content', '/content', 'Article', true, 2),
  ('Users', '/users', 'People', true, 3),
  ('Settings', '/settings', 'Settings', true, 4);

-- Insert nested menu items with sort_order values
insert into menu_items (title, path, icon, is_active, parent_id, sort_order) values
  ('Articles', '/content/articles', 'Article', true, (select id from menu_items where path = '/content'), 1),
  ('Categories', '/content/categories', 'Category', true, (select id from menu_items where path = '/content'), 2),
  ('Tags', '/content/tags', 'Tag', true, (select id from menu_items where path = '/content'), 3); 