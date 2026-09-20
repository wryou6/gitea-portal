CREATE TABLE boards (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  workflow_convention_id text NOT NULL,
  workflow_convention_version text NOT NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);

CREATE TABLE board_repositories (
  board_id uuid NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  repository_owner text NOT NULL,
  repository_name text NOT NULL,
  added_at timestamptz NOT NULL,
  PRIMARY KEY (board_id, repository_owner, repository_name)
);
