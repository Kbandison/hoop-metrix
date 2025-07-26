-- Enhanced Products Schema
-- Run this to update the products table with better e-commerce support

-- Drop existing products table (be careful in production!)
-- DROP TABLE IF EXISTS products CASCADE;

-- Enhanced Products table
CREATE TABLE IF NOT EXISTS products_enhanced (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    original_price DECIMAL(10,2), -- For sale prices
    image_url TEXT NOT NULL,
    additional_images TEXT[], -- Array of additional image URLs
    category TEXT NOT NULL,
    subcategory TEXT,
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
    
    -- NBA/WNBA specific fields
    team_id TEXT, -- Reference to teams table
    player_id TEXT, -- Reference to players table  
    league TEXT, -- 'NBA', 'WNBA', or 'both'
    
    -- Product variants
    sizes TEXT[], -- Available sizes ['S', 'M', 'L', 'XL']
    colors TEXT[], -- Available colors ['Red', 'Blue', 'White']
    
    -- Product metadata
    tags TEXT[], -- Searchable tags
    featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    -- Ratings (can be moved to separate table later)
    rating DECIMAL(2,1) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Foreign key constraints (if tables exist)
    CONSTRAINT fk_products_team FOREIGN KEY (team_id) REFERENCES teams(id),
    CONSTRAINT fk_products_player FOREIGN KEY (player_id) REFERENCES players(id)
);

-- Sample data that matches the existing product definitions
INSERT INTO products_enhanced (
    name, description, price, original_price, image_url, additional_images,
    category, subcategory, team_id, player_id, league, sizes, colors,
    tags, featured, stock_quantity, rating, review_count
) VALUES 
(
    'LeBron James Los Angeles Lakers Jersey',
    'Official NBA Nike Swingman Jersey featuring LeBron James #23',
    119.99, 139.99,
    '/products/lebron-jersey-1.jpg',
    ARRAY['/products/lebron-jersey-2.jpg', '/products/lebron-jersey-3.jpg'],
    'Apparel', 'Jerseys',
    '1610612747', -- Lakers team ID (if exists)
    '2544', -- LeBron's player ID (if exists)
    'NBA',
    ARRAY['S', 'M', 'L', 'XL', 'XXL'],
    ARRAY['Purple', 'Gold', 'White'],
    ARRAY['jersey', 'lebron', 'lakers', 'nba', 'official'],
    true, 50, 4.8, 234
),
(
    'Stephen Curry Golden State Warriors Jersey',
    'Official NBA Nike Swingman Jersey featuring Stephen Curry #30',
    119.99, NULL,
    '/products/curry-jersey-1.jpg',
    ARRAY['/products/curry-jersey-2.jpg'],
    'Apparel', 'Jerseys',
    '1610612744', -- Warriors team ID (if exists)
    '201939', -- Curry's player ID (if exists) 
    'NBA',
    ARRAY['S', 'M', 'L', 'XL', 'XXL'],
    ARRAY['Blue', 'White', 'Yellow'],
    ARRAY['jersey', 'curry', 'warriors', 'nba', 'official'],
    true, 45, 4.9, 189
),
(
    'A''ja Wilson Las Vegas Aces Jersey',
    'Official WNBA Nike Swingman Jersey featuring A''ja Wilson #22',
    99.99, NULL,
    '/products/aja-jersey-1.jpg',
    ARRAY['/products/aja-jersey-2.jpg'],
    'Apparel', 'Jerseys',
    'aces', -- Aces team ID
    'aja-wilson', -- A'ja Wilson player ID
    'WNBA',
    ARRAY['XS', 'S', 'M', 'L', 'XL'],
    ARRAY['Red', 'Black', 'White'],
    ARRAY['jersey', 'aja-wilson', 'aces', 'wnba', 'official'],
    true, 30, 4.7, 145
),
(
    'NBA Official Game Basketball',
    'Official NBA Spalding basketball used in professional games',
    149.99, NULL,
    '/products/nba-basketball-1.jpg',
    ARRAY['/products/nba-basketball-2.jpg'],
    'Equipment', 'Basketballs',
    NULL, NULL, 'NBA',
    NULL, ARRAY['Orange'],
    ARRAY['basketball', 'spalding', 'nba', 'official', 'game'],
    false, 25, 4.6, 67
),
(
    'Los Angeles Lakers Championship Hoodie',
    'Celebrate the Lakers championship with this premium hoodie',
    79.99, NULL,
    '/products/lakers-hoodie-1.jpg',
    ARRAY['/products/lakers-hoodie-2.jpg'],
    'Apparel', 'Hoodies',
    '1610612747', -- Lakers team ID
    NULL, 'NBA',
    ARRAY['S', 'M', 'L', 'XL', 'XXL'],
    ARRAY['Purple', 'Gold', 'Black'],
    ARRAY['hoodie', 'lakers', 'championship', 'nba'],
    false, 40, 4.4, 92
),
(
    'Premium Basketball Trading Cards Pack',
    'Collect your favorite NBA and WNBA players with premium trading cards',
    24.99, NULL,
    '/products/trading-cards-1.jpg',
    ARRAY['/products/trading-cards-2.jpg'],
    'Collectibles', 'Trading Cards',
    NULL, NULL, 'both',
    NULL, NULL,
    ARRAY['trading-cards', 'collectibles', 'nba', 'wnba', 'premium'],
    false, 100, 4.3, 78
),
(
    'Warriors Championship Hat',
    '2022 NBA Champions Golden State Warriors Snapback',
    34.99, NULL,
    '/products/warriors-hat-1.jpg',
    NULL,
    'Accessories', 'Hats',
    '1610612744', -- Warriors team ID
    NULL, 'NBA',
    ARRAY['One Size'],
    ARRAY['Blue', 'Gold', 'White'],
    ARRAY['hat', 'warriors', 'championship', 'snapback'],
    false, 75, 4.6, 89
),
(
    'WNBA All-Star Basketball',
    'Official WNBA All-Star Game Basketball',
    89.99, NULL,
    '/products/wnba-basketball-1.jpg',
    NULL,
    'Equipment', 'Basketballs',
    NULL, NULL, 'WNBA',
    NULL, ARRAY['Orange'],
    ARRAY['basketball', 'wnba', 'all-star', 'official'],
    true, 35, 4.9, 156
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_enhanced_category ON products_enhanced(category);
CREATE INDEX IF NOT EXISTS idx_products_enhanced_subcategory ON products_enhanced(subcategory);
CREATE INDEX IF NOT EXISTS idx_products_enhanced_team_id ON products_enhanced(team_id);
CREATE INDEX IF NOT EXISTS idx_products_enhanced_player_id ON products_enhanced(player_id);
CREATE INDEX IF NOT EXISTS idx_products_enhanced_league ON products_enhanced(league);
CREATE INDEX IF NOT EXISTS idx_products_enhanced_featured ON products_enhanced(featured);
CREATE INDEX IF NOT EXISTS idx_products_enhanced_is_active ON products_enhanced(is_active);

-- Add updated_at trigger
CREATE TRIGGER update_products_enhanced_updated_at
    BEFORE UPDATE ON products_enhanced
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- RLS policies
ALTER TABLE products_enhanced ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enhanced products are viewable by everyone" ON products_enhanced
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage enhanced products" ON products_enhanced
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM admin_users 
            WHERE role IN ('admin', 'editor')
        )
    );