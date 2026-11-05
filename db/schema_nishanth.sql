-- Create Database
CREATE DATABASE IF NOT EXISTS disaster_relief_db;
USE disaster_relief_db;

-- 1. DISASTER Table
CREATE TABLE IF NOT EXISTS DISASTER (
    Disaster_ID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Type VARCHAR(50) NOT NULL,
    Severity_Level VARCHAR(20) NOT NULL,
    Start_Date DATE NOT NULL,
    Status VARCHAR(30) DEFAULT 'Active',
    City VARCHAR(50) NOT NULL,
    State VARCHAR(50) NOT NULL,
    GPS_Coordinates VARCHAR(100)
);

-- 2. RELIEF_CAMP Table
CREATE TABLE IF NOT EXISTS RELIEF_CAMP (
    Camp_ID INT AUTO_INCREMENT PRIMARY KEY,
    Disaster_ID INT NOT NULL,
    Camp_Name VARCHAR(100) NOT NULL,
    Capacity INT NOT NULL,
    Current_Occupancy INT DEFAULT 0,
    Contact_Person VARCHAR(100),
    FOREIGN KEY (Disaster_ID) REFERENCES DISASTER(Disaster_ID) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 3. WAREHOUSE Table
CREATE TABLE IF NOT EXISTS WAREHOUSE (
    Warehouse_ID INT AUTO_INCREMENT PRIMARY KEY,
    Warehouse_Name VARCHAR(100) NOT NULL,
    Max_Capacity INT NOT NULL,
    City VARCHAR(50) NOT NULL,
    State VARCHAR(50) NOT NULL,
    Pincode VARCHAR(10) NOT NULL
);

-- 4. RESOURCE Table
CREATE TABLE IF NOT EXISTS RESOURCE (
    Resource_ID INT AUTO_INCREMENT PRIMARY KEY,
    Resource_Name VARCHAR(100) NOT NULL,
    Category VARCHAR(50) NOT NULL,
    Unit_Of_Measure VARCHAR(20) NOT NULL
);

-- 5. STORED_IN Table (M:N Warehouse to Resource)
CREATE TABLE IF NOT EXISTS STORED_IN (
    Resource_ID INT NOT NULL,
    Warehouse_ID INT NOT NULL,
    Quantity_In_Stock INT NOT NULL DEFAULT 0 CHECK (Quantity_In_Stock >= 0),
    Last_Restocked TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (Resource_ID, Warehouse_ID),
    FOREIGN KEY (Resource_ID) REFERENCES RESOURCE(Resource_ID) ON DELETE CASCADE,
    FOREIGN KEY (Warehouse_ID) REFERENCES WAREHOUSE(Warehouse_ID) ON DELETE CASCADE
);

-- 6. DISPATCHES Table (Ternary Relationship)
CREATE TABLE IF NOT EXISTS DISPATCHES (
    Resource_ID INT NOT NULL,
    Warehouse_ID INT NOT NULL,
    Camp_ID INT NOT NULL,
    Dispatch_Date DATETIME DEFAULT CURRENT_TIMESTAMP,
    Quantity_Dispatched INT NOT NULL CHECK (Quantity_Dispatched > 0),
    Status VARCHAR(30) DEFAULT 'Dispatched',
    PRIMARY KEY (Resource_ID, Warehouse_ID, Camp_ID, Dispatch_Date),
    FOREIGN KEY (Resource_ID, Warehouse_ID) REFERENCES STORED_IN(Resource_ID, Warehouse_ID) ON DELETE CASCADE,
    FOREIGN KEY (Camp_ID) REFERENCES RELIEF_CAMP(Camp_ID) ON DELETE CASCADE
);

-- ----------------------------------------------------
-- ADVANCED DATABASE CONCEPTS (Triggers & Procedures)
-- ----------------------------------------------------

-- TRIGGER: Automatically deduct stock from STORED_IN upon new DISPATCH entry
DELIMITER //
CREATE TRIGGER trg_After_Dispatch_Insert
AFTER INSERT ON DISPATCHES
FOR EACH ROW
BEGIN
    UPDATE STORED_IN
    SET Quantity_In_Stock = Quantity_In_Stock - NEW.Quantity_Dispatched
    WHERE Resource_ID = NEW.Resource_ID AND Warehouse_ID = NEW.Warehouse_ID;
END //
DELIMITER ;

-- STORED PROCEDURE: Process Dispatch with inventory check and transaction
DELIMITER //
CREATE PROCEDURE sp_ProcessDispatch(
    IN p_Resource_ID INT,
    IN p_Warehouse_ID INT,
    IN p_Camp_ID INT,
    IN p_Quantity INT,
    OUT p_Message VARCHAR(255)
)
BEGIN
    DECLARE current_stock INT DEFAULT 0;
    
    START TRANSACTION;
    
    -- Check stock availability
    SELECT Quantity_In_Stock INTO current_stock
    FROM STORED_IN
    WHERE Resource_ID = p_Resource_ID AND Warehouse_ID = p_Warehouse_ID
    FOR UPDATE;
    
    IF current_stock IS NULL THEN
        SET p_Message = 'Error: Resource not stored in specified warehouse.';
        ROLLBACK;
    ELSEIF current_stock < p_Quantity THEN
        SET p_Message = CONCAT('Error: Insufficient stock. Available: ', current_stock);
        ROLLBACK;
    ELSE
        INSERT INTO DISPATCHES (Resource_ID, Warehouse_ID, Camp_ID, Dispatch_Date, Quantity_Dispatched, Status)
        VALUES (p_Resource_ID, p_Warehouse_ID, p_Camp_ID, NOW(), p_Quantity, 'In-Transit');
        
        COMMIT;
        SET p_Message = 'Success: Dispatch logged and stock updated successfully.';
    END IF;
END //
DELIMITER ;

-- ----------------------------------------------------
-- SEED DATA FOR TESTING
-- ----------------------------------------------------
INSERT INTO DISASTER (Name, Type, Severity_Level, Start_Date, Status, City, State, GPS_Coordinates) VALUES
('Coastal Flood 2026', 'Flood', 'High', '2026-10-15', 'Active', 'Udupi', 'Karnataka', '13.3409, 74.7421'),
('Waynanad Landslide', 'Landslide', 'Critical', '2026-11-01', 'Active', 'Wayanad', 'Kerala', '11.6854, 76.1320');

INSERT INTO RELIEF_CAMP (Disaster_ID, Camp_Name, Capacity, Current_Occupancy, Contact_Person) VALUES
(1, 'Udupi Town Hall Relief Base', 500, 320, 'Ramesh Kumar'),
(2, 'Meppadi High School Shelter', 800, 650, 'Suresh Nair');

INSERT INTO WAREHOUSE (Warehouse_Name, Max_Capacity, City, State, Pincode) VALUES
('Central Logistics Hub Bengaluru', 10000, 'Bengaluru', 'Karnataka', '560085'),
('West Coast Regional Depot', 5000, 'Mangaluru', 'Karnataka', '575001');

INSERT INTO RESOURCE (Resource_Name, Category, Unit_Of_Measure) VALUES
('First Aid Kits', 'Medical', 'Boxes'),
('Packaged Drinking Water (20L)', 'Water', 'Cans'),
('Tarpaulin Sheets 20x20', 'Shelter', 'Units');

INSERT INTO STORED_IN (Resource_ID, Warehouse_ID, Quantity_In_Stock) VALUES
(1, 1, 1500),
(2, 1, 3000),
(3, 2, 800);