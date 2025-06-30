# Database Schema Updates for Registration System

## Required Supabase Database Changes

You need to add the following columns to your `registrations` table in Supabase:

### 1. Age Field
```sql
ALTER TABLE registrations 
ADD COLUMN age INTEGER;

-- Add constraint to ensure age is between 17 and 26
ALTER TABLE registrations 
ADD CONSTRAINT check_age_range CHECK (age >= 17 AND age <= 26);
```

### 2. Educational Information
```sql
-- Educational level dropdown
ALTER TABLE registrations 
ADD COLUMN niveau_scolaire TEXT;

-- School/institution name
ALTER TABLE registrations 
ADD COLUMN school TEXT;
```

### 3. Organization Information
```sql
-- Organization status dropdown
ALTER TABLE registrations 
ADD COLUMN org_status TEXT;

-- Previous camps participation (boolean)
ALTER TABLE registrations 
ADD COLUMN previous_camps BOOLEAN;

-- Can pay 350dh (boolean)
ALTER TABLE registrations 
ADD COLUMN can_pay_350dh BOOLEAN;
```

### 4. Additional Information
```sql
-- Camp expectations (text area)
ALTER TABLE registrations 
ADD COLUMN camp_expectation TEXT;
```

### 5. Participant Scoring (Gemini AI)
```sql
-- Participant score (1-100)
ALTER TABLE registrations 
ADD COLUMN score INTEGER;

-- Score explanation from AI
ALTER TABLE registrations 
ADD COLUMN score_explanation TEXT;

-- Add constraint for score range
ALTER TABLE registrations 
ADD CONSTRAINT check_score_range CHECK (score >= 1 AND score <= 100);
```

## Complete SQL Script

Run this script in your Supabase SQL editor:

```sql
-- Add all new columns to registrations table
ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS niveau_scolaire TEXT,
ADD COLUMN IF NOT EXISTS school TEXT,
ADD COLUMN IF NOT EXISTS org_status TEXT,
ADD COLUMN IF NOT EXISTS previous_camps BOOLEAN,
ADD COLUMN IF NOT EXISTS can_pay_350dh BOOLEAN,
ADD COLUMN IF NOT EXISTS camp_expectation TEXT,
ADD COLUMN IF NOT EXISTS score INTEGER,
ADD COLUMN IF NOT EXISTS score_explanation TEXT;

-- Add constraints
ALTER TABLE registrations 
ADD CONSTRAINT IF NOT EXISTS check_age_range CHECK (age >= 17 AND age <= 26);

ALTER TABLE registrations 
ADD CONSTRAINT IF NOT EXISTS check_score_range CHECK (score >= 1 AND score <= 100);

-- Optional: Add comments for documentation
COMMENT ON COLUMN registrations.age IS 'Participant age (17-26)';
COMMENT ON COLUMN registrations.niveau_scolaire IS 'Educational level: الثانوي التأهيلي, الإجازة, الماستر, اخر';
COMMENT ON COLUMN registrations.school IS 'School or institution name';
COMMENT ON COLUMN registrations.org_status IS 'Organization status: عضو(ة), منخرط(ة), متعاطف(ة)';
COMMENT ON COLUMN registrations.previous_camps IS 'Has participated in previous camps';
COMMENT ON COLUMN registrations.can_pay_350dh IS 'Can afford 350 MAD payment';
COMMENT ON COLUMN registrations.camp_expectation IS 'What participant expects from the camp';
COMMENT ON COLUMN registrations.score IS 'AI-generated participant score (1-100)';
COMMENT ON COLUMN registrations.score_explanation IS 'AI explanation for the score';
```

## Verification

After running the script, verify the changes:

```sql
-- Check table structure
\d registrations;

-- Or use this query to see all columns
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'registrations' 
ORDER BY ordinal_position;
```

## Data Validation Rules

The following validation rules are implemented in the application:

1. **Age**: Must be between 17 and 26 (enforced by database constraint)
2. **Educational Level**: Must be one of: "الثانوي التأهيلي", "الإجازة", "الماستر", "اخر"
3. **Organization Status**: Must be one of: "عضو(ة)", "منخرط(ة)", "متعاطف(ة)"
4. **Boolean Fields**: Stored as true/false, displayed as "نعم"/"لا" in Arabic
5. **All new fields**: Required in the form (NOT NULL values expected)

## Notes

- The existing `extra_info` field is now specifically for health information and special requests
- The new `camp_expectation` field is for participant expectations and goals
- All dropdown values are stored in Arabic for consistency
- Boolean fields use Arabic radio buttons but store standard boolean values in the database 