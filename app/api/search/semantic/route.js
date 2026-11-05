import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

// Helper function to build term frequency vector from text
function textToVector(text, vocabulary) {
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const vector = new Array(vocabulary.length).fill(0);
  words.forEach(word => {
    const idx = vocabulary.indexOf(word);
    if (idx !== -1) vector[idx] += 1;
  });
  return vector;
}

// Helper function to compute cosine similarity between two vectors
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function POST(request) {
  try {
    const { emergencyDescription } = await request.json();

    if (!emergencyDescription) {
      return NextResponse.json(
        { success: false, error: 'Emergency description text is required.' },
        { status: 400 }
      );
    }

    // Fetch warehouse stock items with detailed context
    const inventory = await executeQuery(`
      SELECT 
        r.Resource_ID,
        r.Resource_Name,
        r.Category,
        r.Unit_Of_Measure,
        w.Warehouse_ID,
        w.Warehouse_Name,
        w.City AS Warehouse_City,
        si.Quantity_In_Stock
      FROM STORED_IN si
      JOIN RESOURCE r ON si.Resource_ID = r.Resource_ID
      JOIN WAREHOUSE w ON si.Warehouse_ID = w.Warehouse_ID
      WHERE si.Quantity_In_Stock > 0
    `);

    // Build vocabulary dictionary across query and database items
    const corpus = inventory.map(item => `${item.Resource_Name} ${item.Category} ${item.Warehouse_Name} ${item.Warehouse_City}`);
    corpus.push(emergencyDescription);
    const vocabulary = Array.from(new Set(corpus.join(' ').toLowerCase().match(/\b\w+\b/g) || []));

    // Vectorize query
    const queryVector = textToVector(emergencyDescription, vocabulary);

    // Score items using vector similarity
    const scoredResults = inventory.map(item => {
      const itemText = `${item.Resource_Name} ${item.Category} ${item.Warehouse_Name} ${item.Warehouse_City}`;
      const itemVector = textToVector(itemText, vocabulary);
      const similarity = cosineSimilarity(queryVector, itemVector);
      return {
        ...item,
        similarityScore: Number(similarity.toFixed(4))
      };
    })
    .filter(item => item.similarityScore > 0)
    .sort((a, b) => b.similarityScore - a.similarityScore);

    return NextResponse.json({
      success: true,
      query: emergencyDescription,
      matchesFound: scoredResults.length,
      data: scoredResults
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}