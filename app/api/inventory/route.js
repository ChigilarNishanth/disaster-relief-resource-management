import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

// GET: Fetch complete inventory stock breakdown across all warehouses
export async function GET() {
  try {
    const inventory = await executeQuery(`
      SELECT 
        r.Resource_ID,
        r.Resource_Name,
        r.Category,
        r.Unit_Of_Measure,
        w.Warehouse_ID,
        w.Warehouse_Name,
        w.City AS Warehouse_City,
        si.Quantity_In_Stock,
        si.Last_Restocked
      FROM STORED_IN si
      JOIN RESOURCE r ON si.Resource_ID = r.Resource_ID
      JOIN WAREHOUSE w ON si.Warehouse_ID = w.Warehouse_ID
      ORDER BY r.Resource_Name ASC, w.Warehouse_Name ASC
    `);

    return NextResponse.json({ success: true, data: inventory });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST: Update inventory quantity or add new resource mapping to warehouse
export async function POST(request) {
  try {
    const body = await request.json();
    const { Resource_ID, Warehouse_ID, Quantity_In_Stock } = body;

    if (!Resource_ID || !Warehouse_ID || Quantity_In_Stock === undefined) {
      return NextResponse.json(
        { success: false, error: 'Resource_ID, Warehouse_ID, and Quantity_In_Stock are required.' },
        { status: 400 }
      );
    }

    await executeQuery(
      `INSERT INTO STORED_IN (Resource_ID, Warehouse_ID, Quantity_In_Stock)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE Quantity_In_Stock = Quantity_In_Stock + VALUES(Quantity_In_Stock)`,
      [Resource_ID, Warehouse_ID, Quantity_In_Stock]
    );

    return NextResponse.json({ success: true, message: 'Inventory updated successfully.' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}