-- Segmentos de cases para filtro na home (JSON array de ids)

ALTER TABLE cases ADD COLUMN segments TEXT NOT NULL DEFAULT '[]';
