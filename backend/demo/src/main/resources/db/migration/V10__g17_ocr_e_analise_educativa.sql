-- G17: metadados de rastreabilidade. As migrações V1--V9 permanecem imutáveis.
ALTER TABLE pressure_ocr_document
  ADD COLUMN model_version varchar(120) NOT NULL DEFAULT 'tesseract-eng-psm6',
  ADD COLUMN criteria_version varchar(120) NOT NULL DEFAULT 'ocr-safety-v1',
  ADD COLUMN review_required boolean NOT NULL DEFAULT true,
  ADD COLUMN review_reason varchar(80);

ALTER TABLE food_analysis_attempt
  ADD COLUMN provider_name varchar(120),
  ADD COLUMN model_version varchar(120),
  ADD COLUMN criteria_version varchar(120),
  ADD COLUMN contract_version varchar(120),
  ADD COLUMN approval_reference varchar(240),
  ADD COLUMN confidence real,
  ADD COLUMN assessment jsonb,
  ADD COLUMN failure_code varchar(80),
  ADD COLUMN completed_at timestamptz;

CREATE INDEX food_analysis_attempt_version ON food_analysis_attempt(meal_id,criteria_version,model_version,created_at DESC);
