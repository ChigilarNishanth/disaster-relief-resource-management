USE disaster_relief_db;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE DISPATCHES;
TRUNCATE TABLE STORED_IN;
TRUNCATE TABLE RESOURCE;
TRUNCATE TABLE WAREHOUSE;
TRUNCATE TABLE RELIEF_CAMP;
TRUNCATE TABLE DISASTER;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. DISASTER Data
INSERT INTO DISASTER (Disaster_ID, Name, Type, Severity_Level, Start_Date, Status, City, State, GPS_Coordinates) VALUES
(1, 'Coastal Flood 2026', 'Flood', 'High', '2026-10-15', 'Active', 'Udupi', 'Karnataka', '13.3409, 74.7421'),
(2, 'Wayanad Landslide', 'Landslide', 'Critical', '2026-11-01', 'Active', 'Wayanad', 'Kerala', '11.6854, 76.1320'),
(3, 'Kodagu Flash Floods', 'Flood', 'Moderate', '2026-10-28', 'Active', 'Madikeri', 'Karnataka', '12.4244, 75.7382');

-- 2. RELIEF_CAMP Data
INSERT INTO RELIEF_CAMP (Camp_ID, Disaster_ID, Camp_Name, Capacity, Current_Occupancy, Contact_Person) VALUES
(1, 1, 'Udupi Town Hall Relief Base', 500, 320, 'Ramesh Kumar'),
(2, 2, 'Meppadi High School Shelter', 800, 650, 'Suresh Nair'),
(3, 3, 'Madikeri Community Hall', 400, 180, 'Kavitha Hegde');

-- 3. WAREHOUSE Data
INSERT INTO WAREHOUSE (Warehouse_ID, Warehouse_Name, Max_Capacity, City, State, Pincode) VALUES
(1, 'Central Logistics Hub Bengaluru', 10000, 'Bengaluru', 'Karnataka', '560085'),
(2, 'West Coast Regional Depot', 5000, 'Mangaluru', 'Karnataka', '575001'),
(3, 'North Karnataka Logistics Base', 7500, 'Belagavi', 'Karnataka', '590001');

-- 4. RESOURCE Data
INSERT INTO RESOURCE (Resource_ID, Resource_Name, Category, Unit_Of_Measure) VALUES
(1, 'First Aid Medical Kits', 'Medical', 'Boxes'),
(2, 'Packaged Drinking Water (20L)', 'Water', 'Cans'),
(3, 'Tarpaulin Sheets 20x20', 'Shelter', 'Units'),
(4, 'Emergency Meal Ration Packs', 'Food', 'Packets'),
(5, 'Water Purification Tablets', 'Sanitation', 'Strip Packs'),
(6, 'Thermal Blankets', 'Shelter', 'Units');

-- 5. STORED_IN Data (Stock mapping)
INSERT INTO STORED_IN (Resource_ID, Warehouse_ID, Quantity_In_Stock) VALUES
(1, 1, 1500),
(2, 1, 3500),
(4, 1, 5000),
(6, 1, 2000),
(2, 2, 1200),
(3, 2, 800),
(5, 2, 4000),
(1, 3, 600),
(4, 3, 2500);

-- 6. DISPATCHES Data (Historical records)
INSERT INTO DISPATCHES (Resource_ID, Warehouse_ID, Camp_ID, Dispatch_Date, Quantity_Dispatched, Status) VALUES
(1, 1, 1, '2026-11-02 10:30:00', 100, 'In-Transit'),
(2, 2, 2, '2026-11-03 14:15:00', 300, 'Delivered');
