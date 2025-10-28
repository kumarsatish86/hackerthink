const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

const blogbenchCommand = {
  title: 'blogbench',
  slug: 'blogbench',
  description: 'The <code>blogbench</code> command is a benchmarking tool that simulates a busy file server by performing a mix of read, write, and rewrite operations similar to a blog server, allowing you to test the I/O performance of your storage devices.',
  syntax: 'blogbench [options] -d /path/to/test/directory',
  examples: `<h3>Basic Examples:</h3>
<pre>
# Run a basic benchmark in the current directory
blogbench -d .

# Run benchmark with default settings on a specific directory
blogbench -d /mnt/testdrive

# Display the version information
blogbench --version

# Show help and usage information
blogbench --help
</pre>

<h3>Advanced Examples:</h3>
<pre>
# Run with custom number of iterations (more accurate results)
blogbench -d /mnt/testdrive -i 20

# Specify custom number of writers (4) for more intensive write tests
blogbench -d /mnt/testdrive -w 4

# Set a higher number of rewriters (8) for intensive I/O operations
blogbench -d /mnt/testdrive -R 8

# Run with more readers (15) to simulate higher read load
blogbench -d /mnt/testdrive -r 15

# Custom configuration with all parameters specified
blogbench -d /mnt/testdrive -i 25 -w 5 -R 10 -r 20

# Benchmark with verbose output
blogbench -d /mnt/testdrive --verbose
</pre>`,
  options: `<table class="table-auto w-full">
  <thead>
    <tr>
      <th class="px-4 py-2 text-left">Option</th>
      <th class="px-4 py-2 text-left">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="border px-4 py-2"><code>-d</code>, <code>--directory</code></td>
      <td class="border px-4 py-2">Specify the directory where the benchmark will be run (required)</td>
    </tr>
    <tr>
      <td class="border px-4 py-2"><code>-i</code>, <code>--iterations</code></td>
      <td class="border px-4 py-2">Set the number of iterations to run (default: 10)</td>
    </tr>
    <tr>
      <td class="border px-4 py-2"><code>-w</code>, <code>--writers</code></td>
      <td class="border px-4 py-2">Set the number of concurrent writers (default: 3)</td>
    </tr>
    <tr>
      <td class="border px-4 py-2"><code>-r</code>, <code>--readers</code></td>
      <td class="border px-4 py-2">Set the number of concurrent readers (default: 10)</td>
    </tr>
    <tr>
      <td class="border px-4 py-2"><code>-R</code>, <code>--rewriters</code></td>
      <td class="border px-4 py-2">Set the number of concurrent rewriters (default: 5)</td>
    </tr>
    <tr>
      <td class="border px-4 py-2"><code>-c</code>, <code>--commenters</code></td>
      <td class="border px-4 py-2">Set the number of concurrent commenters (default: 5)</td>
    </tr>
    <tr>
      <td class="border px-4 py-2"><code>-v</code>, <code>--verbose</code></td>
      <td class="border px-4 py-2">Enable verbose output with more details about the benchmark</td>
    </tr>
    <tr>
      <td class="border px-4 py-2"><code>-h</code>, <code>--help</code></td>
      <td class="border px-4 py-2">Display help message and usage information</td>
    </tr>
    <tr>
      <td class="border px-4 py-2"><code>-V</code>, <code>--version</code></td>
      <td class="border px-4 py-2">Display version information</td>
    </tr>
  </tbody>
</table>`,
  notes: `<h3>Important Notes:</h3>

<p>Blogbench is a file system benchmark that tries to recreate the load of a real-world busy file server.</p>

<p><strong>Test Directory Requirements:</strong></p>
<ul>
  <li>The test directory should have at least 1GB of free space for accurate results.</li>
  <li>The directory should be on the filesystem you want to benchmark.</li>
  <li>For accurate results, make sure no other programs are using the filesystem during testing.</li>
</ul>

<p><strong>Performance Metrics:</strong></p>
<ul>
  <li><strong>Read score:</strong> Measures how fast your system can read existing files.</li>
  <li><strong>Write score:</strong> Measures how fast your system can create new files.</li>
  <li><strong>Rewrite score:</strong> Measures how fast your system can modify existing files.</li>
</ul>

<p><strong>Interpreting Results:</strong></p>
<ul>
  <li>Higher scores indicate better performance.</li>
  <li>Run multiple tests and average the results for more accurate benchmarking.</li>
  <li>Compare results between different systems or configurations to evaluate relative performance.</li>
</ul>

<p><strong>Common Use Cases:</strong></p>
<ul>
  <li>Comparing different filesystems (ext4, XFS, Btrfs, etc.)</li>
  <li>Testing performance with different mount options</li>
  <li>Evaluating storage device performance (SSDs, HDDs, RAID arrays)</li>
  <li>Benchmarking cloud storage or network-attached storage</li>
</ul>`,
  category: 'system-management',
  platform: 'Linux',
  icon: '📊',
  published: true,
  seo_title: 'blogbench - Linux File System Benchmark Tool',
  seo_description: 'Learn how to use the blogbench command to benchmark file system performance by simulating a busy blog server with mixed read, write, and rewrite operations.',
  seo_keywords: 'linux, command, blogbench, benchmark, file system, performance testing, I/O performance, storage, disk benchmark'
};

async function addBlogbenchCommand() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Check if blogbench command already exists
    const commandCheck = await client.query(
      'SELECT * FROM commands WHERE slug = $1',
      ['blogbench']
    );
    
    if (commandCheck.rows.length > 0) {
      console.log('blogbench command already exists.');
    } else {
      // Insert blogbench command
      const result = await client.query(
        `INSERT INTO commands (
          title, 
          slug, 
          description, 
          syntax,
          examples,
          options,
          notes,
          category,
          platform,
          icon,
          published,
          seo_title,
          seo_description,
          seo_keywords
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *`,
        [
          blogbenchCommand.title,
          blogbenchCommand.slug,
          blogbenchCommand.description,
          blogbenchCommand.syntax,
          blogbenchCommand.examples,
          blogbenchCommand.options,
          blogbenchCommand.notes,
          blogbenchCommand.category,
          blogbenchCommand.platform,
          blogbenchCommand.icon,
          blogbenchCommand.published,
          blogbenchCommand.seo_title,
          blogbenchCommand.seo_description,
          blogbenchCommand.seo_keywords
        ]
      );
      
      console.log('blogbench command added successfully:', result.rows[0].id);
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding blogbench command:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  addBlogbenchCommand();
}

// Export the command object for use in other scripts
module.exports = { blogbenchCommand }; 
