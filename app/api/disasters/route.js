import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

// GET: Retrieve all disasters with their assigned relief camps
export async function GET() {
  try {
    const disasters = await executeQuery(`
      SELECT 
        d.Disaster_ID,
        d.Name AS Disaster_Name,
        d.Type,
        d.Severity_Level,
        d.Start_Date,
        d.Status,
        d.City,
        d.State,
        COUNT(c.Camp_ID) AS Total_Camps,
        COALESCE(SUM(c.Current_Occupancy), 0) AS Total_Occupants
      FROM DISASTER d
      LEFT JOIN RELIEF_CAMP c ON d.Disaster_ID = c.Disaster_ID
      GROUP BY d.Disaster_ID
      ORDER BY d.Start_Date DESC
    `);

    return NextResponse.json({ success: true, data: disasters });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST: Add a new disaster record
export async function POST(request) {
  try {
    const body = await request.json();
    const { Name, Type, Severity_Level, Start_Date, Status, City, State, GPS_Coordinates } = body;

    if (!Name || !Type || !Severity_Level || !Start_Date || !City || !State) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields.' },
        { status: 400 }
      );
    }

    const result = await executeQuery(
      `INSERT INTO DISASTER (Name, Type, Severity_Level, Start_Date, Status, City, State, GPS_Coordinates)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [Name, Type, Severity_Level, Start_Date, Status || 'Active', City, State, GPS_Coordinates || null]
    );

    return NextResponse.json(
      { success: true, message: 'Disaster added successfully', disasterId: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}