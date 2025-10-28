import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://postgres:123456@localhost:5432/ainews',
});

export async function POST(request: NextRequest) {
  try {
    console.log('Starting table display fix...');
    
    // Get the specific article
    const result = await pool.query('SELECT id, content FROM articles WHERE id = 1');
    const article = result.rows[0];
    
    console.log('Current content preview:', article.content.substring(0, 300));
    
    let newContent = article.content;
    
    // Replace text-based table representations with proper HTML tables
    newContent = newContent.replace(
      /<p><strong>Table Content:<\/strong><\/p><p>Row 1: Col1: A \| Col2: B<\/p><p>Row 2: Col1: C \| Col2: D<\/p>/gi, 
      '<table style="border-collapse: collapse; width: 100%; margin: 15px 0; border: 1px solid #ddd;"><tbody><tr><td style="border: 1px solid #ddd; padding: 12px; text-align: left;">A</td><td style="border: 1px solid #ddd; padding: 12px; text-align: left;">B</td></tr><tr><td style="border: 1px solid #ddd; padding: 12px; text-align: left;">C</td><td style="border: 1px solid #ddd; padding: 12px; text-align: left;">D</td></tr></tbody></table>'
    );
    
    // Handle the other format too
    newContent = newContent.replace(
      /<p><strong>Table Content:<\/strong><\/p><p>Row 1: Col1: Cell 1 \| Col2: Cell 2<\/p><p>Row 2: Col1: Cell 3 \| Col2: Cell 4<\/p>/gi,
      '<table style="border-collapse: collapse; width: 100%; margin: 15px 0; border: 1px solid #ddd;"><tbody><tr><td style="border: 1px solid #ddd; padding: 12px; text-align: left;">Cell 1</td><td style="border: 1px solid #ddd; padding: 12px; text-align: left;">Cell 2</td></tr><tr><td style="border: 1px solid #ddd; padding: 12px; text-align: left;">Cell 3</td><td style="border: 1px solid #ddd; padding: 12px; text-align: left;">Cell 4</td></tr></tbody></table>'
    );
    
    // Clean any orphaned table cells
    newContent = newContent.replace(/<\/table>\s*<td[^>]*>.*?<\/td>/gi, '</table>');
    newContent = newContent.replace(/<\/tbody>\s*<td[^>]*>.*?<\/td>/gi, '</tbody>');
    
    // Update the database
    await pool.query('UPDATE articles SET content = $1 WHERE id = $2', [newContent, article.id]);
    
    console.log('Table content fixed successfully!');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Table content converted to proper HTML tables',
      preview: newContent.substring(0, 300)
    });
    
  } catch (error) {
    console.error('Error fixing table display:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fix table display' 
    }, { status: 500 });
  }
} 
