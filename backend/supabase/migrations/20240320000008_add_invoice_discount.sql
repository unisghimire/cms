-- Add discount_percentage column to invoices table
ALTER TABLE public.invoices
ADD COLUMN discount_percentage decimal(5,2) default 0 not null;

-- Add a check constraint to ensure discount_percentage is between 0 and 100
ALTER TABLE public.invoices
ADD CONSTRAINT check_discount_percentage 
CHECK (discount_percentage >= 0 AND discount_percentage <= 100); 