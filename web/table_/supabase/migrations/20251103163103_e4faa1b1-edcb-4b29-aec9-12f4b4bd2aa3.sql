-- Create branch table
CREATE TABLE public.branch (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  location text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id uuid NOT NULL REFERENCES public.branch(id) ON DELETE CASCADE,
  table_number integer NOT NULL CHECK (table_number >= 1 AND table_number <= 9),
  adults_count integer NOT NULL DEFAULT 0 CHECK (adults_count >= 0),
  kids_count integer NOT NULL DEFAULT 0 CHECK (kids_count >= 0),
  refills_count integer NOT NULL DEFAULT 0 CHECK (refills_count >= 0),
  total_amount numeric(10, 2) NOT NULL DEFAULT 0,
  start_time timestamp with time zone NOT NULL DEFAULT now(),
  end_time timestamp with time zone,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  payment_url text,
  order_date date NOT NULL DEFAULT current_date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.branch ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (POS system doesn't require user authentication)
CREATE POLICY "Enable read access for all users" ON public.branch FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.branch FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.branch FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.orders FOR UPDATE USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample branches
INSERT INTO public.branch (name, location) VALUES
  ('Main Branch', 'Downtown District'),
  ('North Branch', 'North District'),
  ('South Branch', 'South District');