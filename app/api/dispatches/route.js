import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

// GET: Fetch dispatch history logs
export async function GET() {
  try {
    const dispatches = await executeQuery(`
      SELECT 
        d.Dispatch_Date,
        d.Quantity_Dispatched,
        d.Status,
        r.Resource_Name,
        r.Unit_Of_Measure,
        w.Warehouse_Name,
        c.Camp_Name,
        dis.Name AS Disaster_Name
      FROM DISPATCHES d
      JOIN RESOURCE r ON d.Resource_ID = r.Resource_ID
      JOIN WAREHOUSE w ON d.Warehouse_ID = w.Warehouse_ID
      JOIN RELIEF_CAMP c ON d.Camp_ID = c.Camp_ID
      JOIN DISASTER dis ON c.Disaster_ID = dis.Disaster_ID
      ORDER BY d.Dispatch_Date DESC
    `);

    return NextResponse.json({ success: true, data: dispatches });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST: Execute dispatch using MySQL Stored Procedure sp_ProcessDispatch
export async function POST(request) {
  try {
    const body = await request.json();
    const { Resource_ID, Warehouse_ID, Camp_ID, Quantity } = body;

    if (!Resource_ID || !Warehouse_ID || !Camp_ID || !Quantity || Quantity <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid Resource_ID, Warehouse_ID, Camp_ID, and positive Quantity required.' },
        { status: 400 }
      );
    }

    // Call MySQL Stored Procedure with OUT parameter
    await executeQuery(
      `CALL sp_ProcessDispatch(?, ?, ?, ?, @p_Message)`,
      [Resource_ID, Warehouse_ID, Camp_ID, Quantity]
    );

    const [outResult] = await executeQuery(`SELECT @p_Message AS message`);
    const statusMessage = outResult?.message || '';

    if (statusMessage.startsWith('Error')) {
      return NextResponse.json(
        { success: false, error: statusMessage },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: statusMessage
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}