import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'No content provided' },
        { status: 400 }
      );
    }

    // Process the content with table structure preservation
    const fixedContent = preserveTableStructure(content);

    return NextResponse.json({ content: fixedContent });
  } catch (error) {
    console.error('Error fixing table content:', error);
    return NextResponse.json(
      { error: 'Failed to process content' },
      { status: 500 }
    );
  }
}

// Function to preserve table structure
function preserveTableStructure(htmlContent: string): string {
  if (typeof window === 'undefined' || !htmlContent) {
    return htmlContent;
  }

  // If no tables, return original content
  if (!htmlContent.includes('<table')) return htmlContent;

  // Create a temporary DOM element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;

  // Find all tables in the content
  const tables = tempDiv.querySelectorAll('table');
  
  tables.forEach(table => {
    // Ensure table has tbody
    let tbody = table.querySelector('tbody');
    if (!tbody) {
      tbody = document.createElement('tbody');
      // Move all rows to tbody
      while (table.querySelector('tr:not(tbody tr)')) {
        const row = table.querySelector('tr:not(tbody tr)');
        if (row) tbody.appendChild(row);
      }
      table.appendChild(tbody);
    }
    
    // Check for flattened rows (single row with many cells)
    const rows = tbody.querySelectorAll('tr');
    if (rows.length === 1) {
      const cells = rows[0].querySelectorAll('td');
      
      // If we have multiple of 2 or 4 cells in a single row, it might be flattened
      if (cells.length >= 4 && (cells.length % 2 === 0 || cells.length % 4 === 0)) {
        const cellsPerRow = 2; // Assume 2 cells per row (can be adjusted)
        const rowCount = Math.ceil(cells.length / cellsPerRow);
        
        // Keep first row with first 2 cells
        const firstRow = rows[0];
        
        // Remove all cells except first two
        while (firstRow.children.length > cellsPerRow) {
          firstRow.removeChild(firstRow.lastChild!);
        }
        
        // Create new rows for remaining cells
        for (let i = 1; i < rowCount; i++) {
          const newRow = document.createElement('tr');
          
          // Add two cells to this row
          for (let j = 0; j < cellsPerRow; j++) {
            const cellIndex = i * cellsPerRow + j;
            if (cellIndex < cells.length) {
              newRow.appendChild(cells[cellIndex]);
            }
          }
          
          tbody.appendChild(newRow);
        }
      }
    }
  });
  
  return tempDiv.innerHTML;
} 
