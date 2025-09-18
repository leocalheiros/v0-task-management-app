-- Add status column to tasks table
ALTER TABLE tasks ADD COLUMN status TEXT DEFAULT 'open' CHECK (status IN ('open', 'done', 'deleted', 'canceled'));

-- Update existing tasks to have 'open' status
UPDATE tasks SET status = 'open' WHERE status IS NULL;

-- Create index on status for better query performance
CREATE INDEX idx_tasks_status ON tasks(status);
