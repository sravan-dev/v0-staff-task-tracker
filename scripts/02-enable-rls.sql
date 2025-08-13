-- Enable Row Level Security on all tables
ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for staff_profiles
CREATE POLICY "Users can view their own profile" ON staff_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON staff_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Managers can view all staff profiles" ON staff_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM staff_profiles 
      WHERE id = auth.uid() AND role IN ('manager', 'admin')
    )
  );

-- RLS Policies for tasks
CREATE POLICY "Staff can view their assigned tasks" ON tasks
  FOR SELECT USING (
    assigned_to = auth.uid() OR 
    assigned_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM staff_profiles 
      WHERE id = auth.uid() AND role IN ('manager', 'admin')
    )
  );

CREATE POLICY "Staff can update their assigned tasks" ON tasks
  FOR UPDATE USING (assigned_to = auth.uid());

CREATE POLICY "Managers can create and manage all tasks" ON tasks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM staff_profiles 
      WHERE id = auth.uid() AND role IN ('manager', 'admin')
    )
  );

-- RLS Policies for attendance
CREATE POLICY "Staff can view their own attendance" ON attendance
  FOR SELECT USING (staff_id = auth.uid());

CREATE POLICY "Staff can insert their own attendance" ON attendance
  FOR INSERT WITH CHECK (staff_id = auth.uid());

CREATE POLICY "Staff can update their own attendance" ON attendance
  FOR UPDATE USING (staff_id = auth.uid());

CREATE POLICY "Managers can view all attendance" ON attendance
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM staff_profiles 
      WHERE id = auth.uid() AND role IN ('manager', 'admin')
    )
  );

-- RLS Policies for time_sessions
CREATE POLICY "Staff can manage their own time sessions" ON time_sessions
  FOR ALL USING (staff_id = auth.uid());

CREATE POLICY "Managers can view all time sessions" ON time_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM staff_profiles 
      WHERE id = auth.uid() AND role IN ('manager', 'admin')
    )
  );

-- RLS Policies for task_comments
CREATE POLICY "Users can view comments on their tasks" ON task_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE id = task_comments.task_id 
      AND (assigned_to = auth.uid() OR assigned_by = auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM staff_profiles 
      WHERE id = auth.uid() AND role IN ('manager', 'admin')
    )
  );

CREATE POLICY "Users can add comments to their tasks" ON task_comments
  FOR INSERT WITH CHECK (
    staff_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE id = task_comments.task_id 
      AND (assigned_to = auth.uid() OR assigned_by = auth.uid())
    )
  );
