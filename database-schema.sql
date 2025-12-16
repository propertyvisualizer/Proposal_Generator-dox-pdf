DELETE TABLE IF EXISTS proposals;
CREATE TABLE proposals (
    id SERIAL PRIMARY KEY,

    client_id uuid REFERENCES clients(id) ON DELETE SET NULL,

    company_name text,
    street_no text,
    city text,
    country text,
    postal_code text,

    project_number text,
    project_name text,
    project_type text,

    offer_number text UNIQUE,

    delivery_time_min integer,
    delivery_time_max integer,

    services jsonb,
    pricing jsonb,

    discount_type text CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value numeric(10,2),

    currency text DEFAULT 'USD',

    total_price numeric(10,2),

    image_urls jsonb,

    document_url text,

    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
