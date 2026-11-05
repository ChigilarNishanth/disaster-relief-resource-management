import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET() {
  try {
    const warehouses = await executeQuery(`
      SELECT Warehouse_ID, Warehouse_Name, Max_Capacity, City, State, Pincode
      FROM WAREHOUSE
      ORDER BY Warehouse_Name ASC
    `);
    return NextResponse.json({ success: true, data: warehouses });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}