-- Function to automatically calculate total hours for attendance
CREATE OR REPLACE FUNCTION calculate_attendance_hours()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.check_in_time IS NOT NULL AND NEW.check_out_time IS NOT NULL THEN
    NEW.total_hours = EXTRACT(EPOCH FROM (NEW.check_out_time - NEW.check_in_time)) / 3600.0 - (NEW.break_duration / 60.0);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to calculate hours automatically
CREATE TRIGGER calculate_attendance_hours_trigger
  BEFORE INSERT OR UPDATE ON attendance
  FOR EACH ROW
  EXECUTE FUNCTION calculate_attendance_hours();

-- Function to automatically calculate session duration
CREATE OR REPLACE FUNCTION calculate_session_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.session_end IS NOT NULL AND NEW.session_start IS NOT NULL THEN
    NEW.duration = EXTRACT(EPOCH FROM (NEW.session_end - NEW.session_start)) / 60.0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to calculate session duration automatically
CREATE TRIGGER calculate_session_duration_trigger
  BEFORE INSERT OR UPDATE ON time_sessions
  FOR EACH ROW
  EXECUTE FUNCTION calculate_session_duration();

-- Function to get staff dashboard summary
CREATE OR REPLACE FUNCTION get_staff_dashboard_summary(staff_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'pending_tasks', (
      SELECT COUNT(*) FROM tasks 
      WHERE assigned_to = staff_uuid AND status = 'pending'
    ),
    'in_progress_tasks', (
      SELECT COUNT(*) FROM tasks 
      WHERE assigned_to = staff_uuid AND status = 'in_progress'
    ),
    'completed_tasks_today', (
      SELECT COUNT(*) FROM tasks 
      WHERE assigned_to = staff_uuid 
      AND status = 'completed' 
      AND DATE(completed_at) = CURRENT_DATE
    ),
    'total_hours_today', (
      SELECT COALESCE(total_hours, 0) FROM attendance 
      WHERE staff_id = staff_uuid AND date = CURRENT_DATE
    ),
    'active_session', (
      SELECT json_build_object(
        'id', id,
        'start_time', session_start,
        'task_title', (SELECT title FROM tasks WHERE id = task_id)
      )
      FROM time_sessions 
      WHERE staff_id = staff_uuid AND is_active = true
      ORDER BY session_start DESC
      LIMIT 1
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get manager dashboard summary
CREATE OR REPLACE FUNCTION get_manager_dashboard_summary()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_staff', (
      SELECT COUNT(*) FROM staff_profiles WHERE is_active = true
    ),
    'present_today', (
      SELECT COUNT(*) FROM attendance 
      WHERE date = CURRENT_DATE AND status = 'present'
    ),
    'pending_tasks', (
      SELECT COUNT(*) FROM tasks WHERE status = 'pending'
    ),
    'overdue_tasks', (
      SELECT COUNT(*) FROM tasks 
      WHERE status IN ('pending', 'in_progress') 
      AND due_date < CURRENT_DATE
    ),
    'departments', (
      SELECT json_agg(
        json_build_object(
          'name', department,
          'staff_count', staff_count,
          'present_today', present_today
        )
      )
      FROM (
        SELECT 
          department,
          COUNT(*) as staff_count,
          COUNT(a.staff_id) as present_today
        FROM staff_profiles sp
        LEFT JOIN attendance a ON sp.id = a.staff_id AND a.date = CURRENT_DATE
        WHERE sp.is_active = true
        GROUP BY department
      ) dept_stats
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
