/**
 * Preserves table structure by ensuring rows and cells are properly maintained
 * This function parses HTML content, ensures tables have proper row structure,
 * and rebuilds them correctly to prevent rows from flattening
 */
export function preserveTableStructure(htmlContent: string): string {
  // Return empty string if no content
  if (!htmlContent) return '';
  
  // If no tables, return original content
  if (!htmlContent.includes('<table')) return htmlContent;
  
  try {
    // Create a DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // Find all tables
    const tables = doc.querySelectorAll('table');
    
    tables.forEach(table => {
      // Make sure table has a tbody
      let tbody: HTMLTableSectionElement | null = table.querySelector('tbody');
      
      // If no tbody exists, create one
      if (!tbody) {
        tbody = document.createElement('tbody');
        // Move all direct tr children to tbody
        const rows = table.querySelectorAll(':scope > tr');
        rows.forEach(row => tbody!.appendChild(row));
        table.appendChild(tbody);
      }
      
      // Now fix any issues with rows
      const rows = tbody.querySelectorAll('tr');
      
      // Check if we have a single row with too many cells
      // that might actually need to be multiple rows
      if (rows.length === 1) {
        const cells = rows[0].querySelectorAll('td');
        
        // If cells count is even and > 2, it might be flattened rows
        if (cells.length > 2 && cells.length % 2 === 0) {
          const rowCount = cells.length / 2; // Assuming 2 columns
          
          // Keep the first row, but remove excess cells
          const firstRow = rows[0];
          
          // Create new rows for the additional content
          for (let i = 1; i < rowCount; i++) {
            const newRow = document.createElement('tr');
            
            // Move cells to the new row (2 cells per row)
            newRow.appendChild(cells[i*2]);
            newRow.appendChild(cells[i*2 + 1]);
            
            // Add the new row to tbody
            tbody.appendChild(newRow);
          }
        }
      }
    });
    
    // Return the fixed HTML
    return doc.body.innerHTML;
  } catch (error) {
    console.error('Error preserving table structure:', error);
    return htmlContent; // Return original content if error occurs
  }
}

/**
 * Cleans HTML content and properly structures tables before saving
 * @param htmlContent The HTML content to clean
 */
export function cleanHtmlBeforeSave(htmlContent: string): string {
  if (!htmlContent) return '';
  
  // First, preserve table structures
  const fixedTables = preserveTableStructure(htmlContent);
  
  // Additional cleaning can be added here if needed
  
  return fixedTables;
} 