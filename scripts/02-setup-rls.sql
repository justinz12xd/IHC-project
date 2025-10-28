-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_event_history ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Vendors policies
CREATE POLICY "Anyone can view active vendors" ON vendors
  FOR SELECT USING (true);

CREATE POLICY "Vendors can update own profile" ON vendors
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.id = vendors.user_id
    )
  );

CREATE POLICY "Vendors can create own profile" ON vendors
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'vendor'
      AND profiles.id = user_id
    )
  );

-- Events policies
CREATE POLICY "Anyone can view approved events" ON events
  FOR SELECT USING (
    status IN ('approved', 'active', 'completed') 
    OR organizer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Organizers can create events" ON events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('organizer', 'admin')
      AND profiles.id = organizer_id
    )
  );

CREATE POLICY "Organizers can update own events" ON events
  FOR UPDATE USING (
    organizer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Products policies
CREATE POLICY "Anyone can view active products" ON products
  FOR SELECT USING (is_active = true OR EXISTS (
    SELECT 1 FROM vendors 
    WHERE vendors.id = products.vendor_id 
    AND vendors.user_id = auth.uid()
  ));

CREATE POLICY "Vendors can manage own products" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM vendors 
      WHERE vendors.id = products.vendor_id 
      AND vendors.user_id = auth.uid()
    )
  );

-- Event vendors policies
CREATE POLICY "Users can view event vendors for approved events" ON event_vendors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_vendors.event_id 
      AND events.status IN ('approved', 'active', 'completed')
    )
    OR EXISTS (
      SELECT 1 FROM vendors 
      WHERE vendors.id = event_vendors.vendor_id 
      AND vendors.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_vendors.event_id 
      AND events.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Vendors can apply to events" ON event_vendors
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM vendors 
      WHERE vendors.id = vendor_id 
      AND vendors.user_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can manage event vendors" ON event_vendors
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_vendors.event_id 
      AND events.organizer_id = auth.uid()
    )
  );

-- Event registrations policies
CREATE POLICY "Users can view own registrations" ON event_registrations
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_registrations.event_id 
      AND events.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Users can register for events" ON event_registrations
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own registrations" ON event_registrations
  FOR UPDATE USING (user_id = auth.uid());

-- Inventory policies
CREATE POLICY "Users can view inventory for approved events" ON inventory
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM event_vendors ev
      JOIN events e ON e.id = ev.event_id
      WHERE ev.id = inventory.event_vendor_id
      AND e.status IN ('approved', 'active', 'completed')
    )
  );

CREATE POLICY "Vendors can manage own inventory" ON inventory
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM event_vendors ev
      JOIN vendors v ON v.id = ev.vendor_id
      WHERE ev.id = inventory.event_vendor_id
      AND v.user_id = auth.uid()
    )
  );

-- Sales policies
CREATE POLICY "Vendors can view own sales" ON sales
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM inventory i
      JOIN event_vendors ev ON ev.id = i.event_vendor_id
      JOIN vendors v ON v.id = ev.vendor_id
      WHERE i.id = sales.inventory_id
      AND v.user_id = auth.uid()
    )
  );

CREATE POLICY "Vendors can record sales" ON sales
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM inventory i
      JOIN event_vendors ev ON ev.id = i.event_vendor_id
      JOIN vendors v ON v.id = ev.vendor_id
      WHERE i.id = inventory_id
      AND v.user_id = auth.uid()
    )
  );

-- Vendor event history policies
CREATE POLICY "Anyone can view vendor history" ON vendor_event_history
  FOR SELECT USING (true);

CREATE POLICY "Vendors can manage own history" ON vendor_event_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM vendors 
      WHERE vendors.id = vendor_event_history.vendor_id 
      AND vendors.user_id = auth.uid()
    )
  );
