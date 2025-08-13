-- Insert sample staff profiles (these will be created after user registration)
-- This is just for reference - actual profiles will be created via the application

-- Sample departments and positions for reference
INSERT INTO staff_profiles (id, employee_id, first_name, last_name, email, department, position, role, hire_date)
VALUES 
  -- This will be populated when users register through the application
  -- Example structure:
  -- ('uuid-here', 'EMP001', 'John', 'Doe', 'john@company.com', 'Engineering', 'Software Developer', 'staff', '2024-01-15'),
  -- ('uuid-here', 'MGR001', 'Jane', 'Smith', 'jane@company.com', 'Engineering', 'Team Lead', 'manager', '2023-06-01')
ON CONFLICT (id) DO NOTHING;

-- Sample task categories and templates
-- These can be used as templates for common recurring tasks
CREATE TABLE IF NOT EXISTS task_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  estimated_hours INTEGER,
  priority task_priority DEFAULT 'medium',
  department VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO task_templates (title, description, estimated_hours, priority, department)
VALUES 
  ('Daily Standup', 'Attend daily team standup meeting', 1, 'medium', 'Engineering'),
  ('Code Review', 'Review pull requests from team members', 2, 'high', 'Engineering'),
  ('Weekly Report', 'Prepare and submit weekly progress report', 1, 'medium', 'All'),
  ('Client Meeting', 'Attend scheduled client meeting', 2, 'high', 'All'),
  ('Documentation Update', 'Update project documentation', 3, 'low', 'Engineering'),
  ('Bug Fix', 'Fix reported bugs and issues', 4, 'high', 'Engineering'),
  ('Feature Development', 'Develop new feature as per requirements', 8, 'medium', 'Engineering'),
  ('Testing', 'Perform testing on developed features', 3, 'medium', 'QA'),
  ('Deployment', 'Deploy changes to production environment', 2, 'high', 'DevOps');
