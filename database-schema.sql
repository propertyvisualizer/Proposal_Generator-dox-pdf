-- ============================================
-- PROPOSAL GENERATOR DATABASE SCHEMA
-- ============================================
-- Database for storing proposals, clients, projects, and services
-- Created: December 8, 2025
-- ============================================

-- Enable UUID extension (PostgreSQL)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. CLIENTS TABLE
-- ============================================
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_number VARCHAR(50) UNIQUE,
    company_name VARCHAR(255) NOT NULL,
    street VARCHAR(255) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'Deutschland',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- Index for faster lookups
CREATE INDEX idx_clients_client_number ON clients(client_number);
CREATE INDEX idx_clients_company_name ON clients(company_name);

-- ============================================
-- 2. PROJECTS TABLE
-- ============================================
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_number VARCHAR(50) UNIQUE,
    project_name VARCHAR(255),
    unit_count INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- Index for faster lookups
CREATE INDEX idx_projects_project_number ON projects(project_number);

-- ============================================
-- 3. SERVICES CATALOG TABLE
-- ============================================
CREATE TABLE services_catalog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'exterior-ground', 'interior'
    service_name VARCHAR(255) NOT NULL,
    description JSONB, -- Stores array of description points (can include nested bullet points)
    default_price DECIMAL(10, 2), -- Fixed price if applicable
    has_pricing_tiers BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX idx_services_catalog_service_id ON services_catalog(service_id);
CREATE INDEX idx_services_catalog_is_active ON services_catalog(is_active);

-- ============================================
-- 4. PRICING TIERS TABLE
-- ============================================
CREATE TABLE pricing_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_catalog_id UUID NOT NULL REFERENCES services_catalog(id) ON DELETE CASCADE,
    quantity_min INTEGER NOT NULL,
    quantity_max INTEGER, -- NULL means no upper limit
    price_per_unit DECIMAL(10, 2) NOT NULL,
    label VARCHAR(255), -- e.g., '1 Ansicht Netto: 599,00 €'
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX idx_pricing_tiers_service_id ON pricing_tiers(service_catalog_id);
CREATE INDEX idx_pricing_tiers_quantity ON pricing_tiers(quantity_min, quantity_max);

-- ============================================
-- 5. PROPOSALS TABLE
-- ============================================
CREATE TABLE proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    offer_number VARCHAR(50) UNIQUE NOT NULL, -- e.g., '2025-12-08-1'
    client_id UUID NOT NULL REFERENCES clients(id),
    project_id UUID REFERENCES projects(id),
    
    -- Proposal dates
    proposal_date DATE NOT NULL,
    valid_until DATE NOT NULL,
    delivery_days INTEGER NOT NULL DEFAULT 14,
    
    -- Pricing summary
    subtotal_net DECIMAL(10, 2) NOT NULL,
    discount_description VARCHAR(255),
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    vat_rate DECIMAL(5, 2) DEFAULT 19.00,
    vat_amount DECIMAL(10, 2) NOT NULL,
    total_gross DECIMAL(10, 2) NOT NULL,
    
    -- Terms and signatures
    payment_terms TEXT,
    delivery_method VARCHAR(255) DEFAULT 'Digital via Email',
    signature_name VARCHAR(255) DEFAULT 'Christopher Helm',
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'draft', -- draft, sent, accepted, rejected, expired
    
    -- Document storage
    document_url VARCHAR(500), -- Path to generated DOCX file
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP NULL,
    accepted_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL
);

-- Indexes
CREATE INDEX idx_proposals_offer_number ON proposals(offer_number);
CREATE INDEX idx_proposals_client_id ON proposals(client_id);
CREATE INDEX idx_proposals_project_id ON proposals(project_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_proposal_date ON proposals(proposal_date);

-- ============================================
-- 6. PROPOSAL SERVICES TABLE (Line Items)
-- ============================================
CREATE TABLE proposal_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    service_catalog_id UUID NOT NULL REFERENCES services_catalog(id),
    
    service_name VARCHAR(255) NOT NULL, -- Stored for historical accuracy
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    
    -- Custom description (overrides default)
    custom_description JSONB, -- Can store nested bullet points
    modified_defaults JSONB, -- Modified default bullet points
    
    -- Pricing metadata
    custom_price_set BOOLEAN DEFAULT FALSE, -- Manual price override flag
    
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_proposal_services_proposal_id ON proposal_services(proposal_id);
CREATE INDEX idx_proposal_services_service_catalog_id ON proposal_services(service_catalog_id);

-- ============================================
-- 7. PROPOSAL IMAGES TABLE
-- ============================================
CREATE TABLE proposal_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    
    title VARCHAR(255),
    description TEXT,
    
    -- Image storage
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER, -- in bytes
    file_type VARCHAR(50), -- image/png, image/jpeg
    
    -- Base64 data for embedding (optional)
    image_data TEXT,
    
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_proposal_images_proposal_id ON proposal_images(proposal_id);

-- ============================================
-- 8. PROPOSAL NOTES/COMMENTS TABLE
-- ============================================
CREATE TABLE proposal_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    
    note_type VARCHAR(50) DEFAULT 'internal', -- internal, client, revision
    note_text TEXT NOT NULL,
    
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX idx_proposal_notes_proposal_id ON proposal_notes(proposal_id);

-- ============================================
-- 9. PROPOSAL HISTORY TABLE (Audit Log)
-- ============================================
CREATE TABLE proposal_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    
    action VARCHAR(100) NOT NULL, -- created, updated, sent, accepted, rejected, etc.
    changed_fields JSONB, -- Store what fields were changed
    old_values JSONB,
    new_values JSONB,
    
    performed_by VARCHAR(255),
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX idx_proposal_history_proposal_id ON proposal_history(proposal_id);
CREATE INDEX idx_proposal_history_performed_at ON proposal_history(performed_at);

-- ============================================
-- 10. USERS TABLE (Optional - for multi-user support)
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user', -- admin, user, viewer
    
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- VIEWS
-- ============================================

-- View for proposals with client and project information
CREATE OR REPLACE VIEW v_proposals_full AS
SELECT 
    p.id,
    p.offer_number,
    p.proposal_date,
    p.valid_until,
    p.delivery_days,
    p.status,
    p.subtotal_net,
    p.discount_amount,
    p.vat_amount,
    p.total_gross,
    c.id AS client_id,
    c.company_name,
    c.street,
    c.postal_code,
    c.city,
    c.country,
    proj.id AS project_id,
    proj.project_name,
    proj.project_number,
    proj.unit_count,
    COUNT(ps.id) AS service_count,
    COUNT(pi.id) AS image_count,
    p.created_at,
    p.updated_at
FROM proposals p
LEFT JOIN clients c ON p.client_id = c.id
LEFT JOIN projects proj ON p.project_id = proj.id
LEFT JOIN proposal_services ps ON p.id = ps.proposal_id
LEFT JOIN proposal_images pi ON p.id = pi.proposal_id
WHERE p.deleted_at IS NULL
GROUP BY p.id, c.id, proj.id;

-- View for service statistics
CREATE OR REPLACE VIEW v_service_statistics AS
SELECT 
    sc.service_id,
    sc.service_name,
    COUNT(ps.id) AS times_used,
    SUM(ps.quantity) AS total_quantity,
    SUM(ps.total_price) AS total_revenue,
    AVG(ps.unit_price) AS avg_unit_price
FROM services_catalog sc
LEFT JOIN proposal_services ps ON sc.id = ps.service_catalog_id
GROUP BY sc.id, sc.service_id, sc.service_name;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_catalog_updated_at BEFORE UPDATE ON services_catalog
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricing_tiers_updated_at BEFORE UPDATE ON pricing_tiers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposal_services_updated_at BEFORE UPDATE ON proposal_services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposal_images_updated_at BEFORE UPDATE ON proposal_images
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA INSERTS
-- ============================================

-- Insert service catalog from service_description.js
INSERT INTO services_catalog (service_id, service_name, description, default_price, has_pricing_tiers) VALUES
('exterior-ground', '3D-Außenvisualisierung Bodenperspektive', 
 '["Geliefert werden gerenderte Außenansichten des Objektes aus Bodenperspektiven", "Fotorealistische Qualität", "Auf Wunsch eingefügt in von Ihnen zu liefernde Drohnenfotos oder schematische Modellierung der Umgebung", "Inkl. 1 Revisionsrunde", "Format: 2.500 x 1.500 px (300 DPI)"]'::jsonb,
 NULL, TRUE),

('exterior-bird', '3D-Außenvisualisierung Vogelperspektive',
 '["Geliefert wird gerenderte Außenansicht des Objektes aus Vogelperspektive", "Fotorealistische Qualität", "Auf Wunsch eingefügt in von Ihnen zu liefernde Drohnenfotos oder schematische Modellierung der Umgebung", "Inkl. 1 Revisionsrunde", "Format: 2.500 x 1.500 px (300 DPI)", "Nur in Kombination mit allen im Angebot aufgeführten Bodenperspektiven verfügbar"]'::jsonb,
 NULL, TRUE),

('interior', '3D-Innenvisualisierung',
 '["Geliefert werden gerenderte Innenansichten der Räume", "Fotorealistische Qualität", "Eingerichtet individuell nach Ihren Wünschen (allerdings keine individuelle Modellierung konkreter Möbelstücke inkludiert)", "Falls Türen zwischen einzelnen Räumen zu sehen sind, werden diese als geschlossen dargestellt", "Inkl. 1 Revisionsrunde", "Format: 2.500 x 1.500 px (300 DPI)"]'::jsonb,
 NULL, TRUE),

('terrace', '3D-Visualisierung Terrasse',
 '["Geliefert wird gerenderte Ansicht der Terrasse", "Fotorealistische Qualität", "Eingerichtet individuell nach Ihren Wünschen (allerdings keine individuelle Modellierung konkreter Möbelstücke inkludiert)", "Inkl. 1 Revisionsrunde", "Format: 2.500 x 1.500 px (300 DPI)"]'::jsonb,
 NULL, FALSE),

('3d-floorplan', '3D-Grundriss',
 '["Geliefert werden 3D-Grundrisse", "Hochwertig standardmöbliert", "Exklusive Qualität", "Inkl. 1 Revisionsrunde", "2.500px x 1.500 px bei 300 DPI"]'::jsonb,
 69.00, FALSE),

('3d-complete-floor', '3D-Geschossansicht',
 '["Geliefert werden 3D-Geschossansichten", "Hochwertig standardmöbliert", "Exklusive Qualität", "Inkl. 1 Revisionsrunde", "2.500px x 1.500 px bei 300 DPI"]'::jsonb,
 199.00, FALSE),

('2d-floorplan', '2D-Grundriss',
 '["Geliefert werden 2D-Grundrisse", "Hochwertig standardmöbliert", "Exklusive Qualität", "Inkl. 1 Revisionsrunde", "2.500px x 1.500 px bei 300 DPI"]'::jsonb,
 49.00, FALSE),

('home-staging', 'Digital Home Staging',
 '["Geliefert werden Digital Home Staging Fotos der Räume", "Basiert auf vom Kunden bereitgestellten Fotos", "Individuell eingerichtet", "Fotorealistische Qualität", "Exakt identische Perspektive wie zugrundeliegende Fotos", "Inkl. 1 Revisionsrunde"]'::jsonb,
 99.00, FALSE),

('renovation', 'Digitale Renovierung',
 '["Geliefert werden Digitale Renovierungsfotos der Räume", "Basiert auf vom Kunden bereitgestellten Fotos", "Individuell eingerichtet", "Fotorealistische Qualität", "Exakt identische Perspektive wie zugrundeliegende Fotos", "Inkl. 1 Revisionsrunde"]'::jsonb,
 139.00, FALSE),

('360-interior', '360° Tour Innen',
 '["Geliefert wird 1x 360° Tour der Wohneinheit", "Begehung des kompletten Innenbereichs", "Individuell eingerichtet", "Einzigartige Technologie, da vollkommen frei bewegbar", "Intuitive Bedienung", "Passend für alle gängigen Endgeräte", "Inklusive Fensteraussicht (wahlweise mit beispielhafter oder Verwendung der tatsächlichen Aussicht mittels vom Auftraggeber gelieferten Bildern)", "Inkl. 2 Revisionsrunden", "Inkl. Hosting für 12 Monate"]'::jsonb,
 599.00, FALSE),

('360-exterior', '360° Video Außen',
 '["Geliefert wird 1x 360° Video-Tour des Objektes", "Nur in Kombination mit mind. 2x 3D-Außenvisualisierung", "Umgebung schematisch dargestellt", "Fotorealistische Qualität", "Länge ca. 90 Sekunden", "Inkl. 2 Revisionsrunden"]'::jsonb,
 NULL, FALSE),

('slideshow', 'Slideshow Video',
 '["Geliefert wird Slideshow-Video des Objektes", "Inkl. aller Visualisierungen und weiterer Fotos", "Professionell vertont und kommentiert", "Inkl. Untertiteln"]'::jsonb,
 499.00, FALSE),

('site-plan', '3D-Lageplan',
 '["Geliefert wird 3D-Lageplan des Objektes in Draufsicht", "Exklusive Qualität", "Inkl. 1 Revisionsrunde"]'::jsonb,
 99.00, FALSE),

('social-media', 'Social Media Paket',
 '[{"text": "Geliefert wird 1x Social Media Paket für die Visualisierung des Objektes, bestehend aus:", "children": ["Alle statischen Visualisierungen in den für Social Media Posts passenden Formaten", "Video in passendem Format"]}, "Fotorealistische Qualität"]'::jsonb,
 299.00, FALSE),

('video-snippet', 'Video Snippet Außen und Innen',
 '["Geliefert wird 1x Video-Snippet des Objektes, bei dem wir durch Unterstützung von künstlicher Intelligenz aus den statischen Innen- und Außenvisualisierungen ein Video mit Bewegtbildern erstellen", "Nur in Kombination mit mind. 2x Außen- und 2x Innenvisualisierung", "Fotorealistische Qualität", "Basiert auf 2x Außen- und 2x Innenvisualisierungen", "Länge ca. 30 Sekunden, max 9 Fotos", "Da KI-generiert, keine Revisionsrunde"]'::jsonb,
 299.00, FALSE),

('expose-layout', 'Exposé Layout',
 '["Geliefert wird Exposé Layout für den Vertrieb des Objektes", "Nur in Kombination mit allen zuvor genannten Positionen erhältlich", "Layout und Farbkonzept nach Absprache, einfach gehalten", "Bestandteile (Beispiel-Aufbau): Inhaltsverzeichnis, Kurzbeschreibung Projekt, Lagebeschreibung, Bauvorhaben/Objektbeschreibung, Ausstattung, Grundrisse (inkl. m²-Angaben und evtl. Piktogramm für die Lage im Gebäude), Preistabelle und Finanzierung, Kontaktinformationen", "Format: PPT", "Inkl. 2 Revisionsrunden", "Dient auch als Layout für weitere Projekte"]'::jsonb,
 1199.00, FALSE),

('expose-creation', 'Exposé-Erstellung',
 '["Geliefert wird komplettes Exposé für den Vertrieb des Objektes", "In druckfertiger, digitaler Ausführung", "Exklusive Qualität basierend auf gelieferten Texten und Informationen", "Nur in Kombination mit allen zuvor genannten Positionen erhältlich", "Alle Texte werden vom Kunden so zur Verfügung gestellt, dass Sie unverändert übernommen werden können", "Alle zusätzlich benötigten Fotos werden vom Kunden so zur Verfügung gestellt, dass Sie unverändert übernommen werden können", "Inkl. 2 Revisionsrunden"]'::jsonb,
 499.00, FALSE);

-- Insert pricing tiers for exterior-ground
INSERT INTO pricing_tiers (service_catalog_id, quantity_min, quantity_max, price_per_unit, label, display_order)
SELECT id, 1, 1, 599.00, '1 Ansicht Netto: 599,00 €', 1 FROM services_catalog WHERE service_id = 'exterior-ground'
UNION ALL
SELECT id, 2, 2, 399.00, '2 Ansichten: Netto pro Ansicht: 399,00 €', 2 FROM services_catalog WHERE service_id = 'exterior-ground'
UNION ALL
SELECT id, 3, 3, 359.00, '3 Ansichten: Netto pro Ansicht: 359,00 €', 3 FROM services_catalog WHERE service_id = 'exterior-ground'
UNION ALL
SELECT id, 4, 4, 329.00, '4 Ansichten: Netto pro Ansicht: 329,00 €', 4 FROM services_catalog WHERE service_id = 'exterior-ground'
UNION ALL
SELECT id, 5, NULL, 299.00, '5 Ansichten: Netto pro Ansicht: 299,00 €', 5 FROM services_catalog WHERE service_id = 'exterior-ground';

-- Insert pricing tiers for interior
INSERT INTO pricing_tiers (service_catalog_id, quantity_min, quantity_max, price_per_unit, label, display_order)
SELECT id, 1, 1, 399.00, '1 Ansicht Netto: 399,00 €', 1 FROM services_catalog WHERE service_id = 'interior'
UNION ALL
SELECT id, 2, 2, 299.00, '2 Ansichten: Netto pro Ansicht: 299,00 €', 2 FROM services_catalog WHERE service_id = 'interior'
UNION ALL
SELECT id, 3, 3, 289.00, '3 Ansichten: Netto pro Ansicht: 289,00 €', 3 FROM services_catalog WHERE service_id = 'interior'
UNION ALL
SELECT id, 4, 4, 269.00, '4 Ansichten: Netto pro Ansicht: 269,00 €', 4 FROM services_catalog WHERE service_id = 'interior'
UNION ALL
SELECT id, 5, 5, 259.00, '5 Ansichten: Netto pro Ansicht: 259,00 €', 5 FROM services_catalog WHERE service_id = 'interior'
UNION ALL
SELECT id, 6, 6, 249.00, '6 Ansichten: Netto pro Ansicht: 249,00 €', 6 FROM services_catalog WHERE service_id = 'interior'
UNION ALL
SELECT id, 7, 7, 239.00, '7 Ansichten: Netto pro Ansicht: 239,00 €', 7 FROM services_catalog WHERE service_id = 'interior'
UNION ALL
SELECT id, 8, 8, 229.00, '8 Ansichten: Netto pro Ansicht: 229,00 €', 8 FROM services_catalog WHERE service_id = 'interior'
UNION ALL
SELECT id, 9, 9, 219.00, '9 Ansichten: Netto pro Ansicht: 219,00 €', 9 FROM services_catalog WHERE service_id = 'interior'
UNION ALL
SELECT id, 10, NULL, 199.00, '>=10 Ansichten: Netto pro Ansicht: 199,00 €', 10 FROM services_catalog WHERE service_id = 'interior';

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE clients IS 'Stores client/customer information';
COMMENT ON TABLE projects IS 'Stores project information (can have multiple proposals per project)';
COMMENT ON TABLE services_catalog IS 'Master catalog of all available services';
COMMENT ON TABLE pricing_tiers IS 'Tiered pricing structure for services with volume discounts';
COMMENT ON TABLE proposals IS 'Main proposals table with summary information';
COMMENT ON TABLE proposal_services IS 'Line items for each proposal - services ordered';
COMMENT ON TABLE proposal_images IS 'Images attached to proposals (perspective images)';
COMMENT ON TABLE proposal_notes IS 'Notes and comments on proposals';
COMMENT ON TABLE proposal_history IS 'Audit trail for proposal changes';
COMMENT ON TABLE users IS 'System users (if multi-user support is needed)';

-- ============================================
-- END OF SCHEMA
-- ============================================
