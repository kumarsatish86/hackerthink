import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: NextRequest) {
  try {
    const client = await pool.connect();
    
    try {
      // Get the current content
      const result = await client.query(
        'SELECT id, content FROM articles WHERE id = $1',
        ['1']
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 });
      }

      const article = result.rows[0];
      let content = article.content;

      if (!content) {
        return NextResponse.json({ message: 'No content to clean' });
      }

      // Clean orphaned table cells more aggressively
      const cleanContent = (htmlContent: string): string => {
        let cleaned = htmlContent;
        
        // Step 1: Remove orphaned <td> elements that appear after </table> tags
        cleaned = cleaned.replace(/<\/table>\s*<td[^>]*>.*?<\/td>/gi, '</table>');
        
        // Step 2: Remove orphaned <td> elements that appear after </tbody> tags
        cleaned = cleaned.replace(/<\/tbody>\s*<td[^>]*>.*?<\/td>/gi, '</tbody>');
        
        // Step 3: Remove any standalone <td> elements not properly nested in <tr> tags
        // This regex finds <td> that isn't preceded by <tr> or <thead> or <tbody>
        cleaned = cleaned.replace(/(?<!<tr[^>]*>)(?<!<thead[^>]*>)(?<!<tbody[^>]*>)\s*<td[^>]*>.*?<\/td>/gi, '');
        
        // Step 4: Remove any orphaned table cells between different HTML elements
        cleaned = cleaned.replace(/<\/(?:p|div|span|h[1-6]|table)>\s*<td[^>]*>.*?<\/td>\s*<(?:p|div|span|h[1-6]|table)/gi, (match) => {
          // Extract the opening and closing tags
          const openMatch = match.match(/<\/([^>]+)>/);
          const closeMatch = match.match(/<([^>\s]+)/g);
          if (openMatch && closeMatch && closeMatch.length >= 2) {
            return `</${openMatch[1]}>${closeMatch[closeMatch.length - 1]}`;
          }
          return match.replace(/<td[^>]*>.*?<\/td>\s*/gi, '');
        });
        
        // Step 5: Ensure proper table class
        cleaned = cleaned.replace(/<table(?![^>]*class=)/gi, '<table class="ql-table"');
        
        // Step 6: Remove duplicate class attributes
        cleaned = cleaned.replace(/class="([^"]*?)"\s+class="([^"]*?)"/gi, 'class="$1 $2"');
        
        // Step 7: Clean up excessive whitespace and empty paragraphs
        cleaned = cleaned.replace(/\s+/g, ' ');
        cleaned = cleaned.replace(/(<p><br><\/p>\s*){3,}/gi, '<p><br></p>');
        
        return cleaned.trim();
      };

      const cleanedContent = cleanContent(content);

      // Update the database with cleaned content
      await client.query(
        'UPDATE articles SET content = $1 WHERE id = $2',
        [cleanedContent, '1']
      );

      return NextResponse.json({
        message: 'Content cleaned successfully',
        originalContent: content,
        cleanedContent: cleanedContent,
        originalLength: content.length,
        cleanedLength: cleanedContent.length
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
