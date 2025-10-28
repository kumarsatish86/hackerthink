const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

const breakCommand = {
  title: 'break',
  slug: 'break',
  description: 'The <code>break</code> command is a shell built-in that exits from a <code>for</code>, <code>while</code>, <code>until</code>, or <code>select</code> loop. It terminates the execution of the current loop and continues with the next command after the loop.',
  syntax: 'break [n]',
  examples: `<h3>Basic Examples:</h3>
<pre>
# Simple break to exit a loop
for i in 1 2 3 4 5; do
  echo $i
  if [ $i -eq 3 ]; then
    break
  fi
done
echo "Loop exited"

# Using break in a while loop
count=1
while true; do
  echo $count
  if [ $count -eq 5 ]; then
    break
  fi
  ((count++))
done

# Breaking from an until loop
count=10
until [ $count -lt 1 ]; do
  echo $count
  if [ $count -eq 7 ]; then
    break
  fi
  ((count--))
done
</pre>

<h3>Advanced Examples:</h3>
<pre>
# Break with numeric argument to exit multiple nested loops
for i in 1 2 3; do
  echo "Outer loop: $i"
  for j in a b c; do
    echo "  Inner loop: $j"
    if [ $i -eq 2 ] && [ "$j" = "b" ]; then
      echo "  Breaking out of both loops"
      break 2
    fi
  done
done
echo "Both loops exited"

# Using break in a select menu
echo "Select an option:"
select option in "Option 1" "Option 2" "Option 3" "Exit"; do
  case $option in
    "Option 1")
      echo "You selected Option 1"
      ;;
    "Option 2")
      echo "You selected Option 2"
      ;;
    "Option 3")
      echo "You selected Option 3"
      ;;
    "Exit")
      echo "Exiting menu"
      break
      ;;
    *)
      echo "Invalid option"
      ;;
  esac
done

# Using break in a case statement within a loop
while read -p "Enter a command (quit to exit): " cmd; do
  case $cmd in
    "help")
      echo "Available commands: help, status, list, quit"
      ;;
    "status")
      echo "System status: OK"
      ;;
    "list")
      echo "Item 1, Item 2, Item 3"
      ;;
    "quit")
      echo "Exiting..."
      break
      ;;
    *)
      echo "Unknown command: $cmd"
      ;;
  esac
done
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
      <td class="border px-4 py-2"><code>n</code></td>
      <td class="border px-4 py-2">Optional integer argument that specifies how many nested loops to exit from. Default is 1, meaning it exits only the innermost loop.</td>
    </tr>
  </tbody>
</table>`,
  notes: `<h3>Important Notes:</h3>

<p>The <code>break</code> command is a shell built-in used to exit loop constructs in shell scripts.</p>

<p><strong>Basic Usage:</strong></p>
<ul>
  <li>Without any arguments, <code>break</code> exits only the innermost loop it's currently in.</li>
  <li>It immediately terminates the loop without executing any remaining commands in the current iteration.</li>
  <li>Control passes to the command following the terminated loop.</li>
</ul>

<p><strong>Breaking from Nested Loops:</strong></p>
<ul>
  <li>When used with a numeric argument <code>n</code>, <code>break n</code> exits from <code>n</code> levels of nested loops.</li>
  <li>For example, <code>break 2</code> exits from the current loop and the loop that contains it.</li>
  <li>This is particularly useful in complex scripts with deeply nested loops.</li>
</ul>

<p><strong>Compatible Loop Types:</strong></p>
<ul>
  <li><code>for</code> loops: Used for iterating over a list of items.</li>
  <li><code>while</code> loops: Execute as long as a condition is true.</li>
  <li><code>until</code> loops: Execute until a condition becomes true.</li>
  <li><code>select</code> loops: Used for creating simple menus in scripts.</li>
</ul>

<p><strong>Common Use Cases:</strong></p>
<ul>
  <li>Early termination of loops when a specific condition is met.</li>
  <li>Implementing error handling in loops to exit when an error occurs.</li>
  <li>Providing exit mechanisms in interactive menu systems.</li>
  <li>Optimizing performance by avoiding unnecessary iterations once a result is found.</li>
</ul>

<p><strong>Comparison with Continue:</strong></p>
<ul>
  <li>While <code>break</code> exits the loop entirely, the <code>continue</code> command skips the rest of the current iteration and moves to the next iteration.</li>
  <li>Use <code>break</code> when you want to completely exit the loop processing.</li>
  <li>Use <code>continue</code> when you want to skip only the current iteration but continue with the loop.</li>
</ul>

<p><strong>Shell Compatibility:</strong></p>
<ul>
  <li>The <code>break</code> command is available in all POSIX-compliant shells including bash, sh, ksh, and zsh.</li>
  <li>The behavior of <code>break n</code> for nested loops may vary slightly between different shell implementations.</li>
</ul>`,
  category: 'shell-builtins',
  platform: 'Linux/Unix',
  icon: '🔄',
  published: true,
  seo_title: 'break - Exit from Loops in Shell Scripts',
  seo_description: 'Learn how to use the break command to exit from for, while, until, or select loops in shell scripts, including how to break from nested loops.',
  seo_keywords: 'linux, command, break, shell, script, loop, for, while, until, select, bash, programming, control flow'
};

async function addBreakCommand() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Check if break command already exists
    const commandCheck = await client.query(
      'SELECT * FROM commands WHERE slug = $1',
      ['break']
    );
    
    if (commandCheck.rows.length > 0) {
      console.log('break command already exists.');
    } else {
      // Insert break command
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
          breakCommand.title,
          breakCommand.slug,
          breakCommand.description,
          breakCommand.syntax,
          breakCommand.examples,
          breakCommand.options,
          breakCommand.notes,
          breakCommand.category,
          breakCommand.platform,
          breakCommand.icon,
          breakCommand.published,
          breakCommand.seo_title,
          breakCommand.seo_description,
          breakCommand.seo_keywords
        ]
      );
      
      console.log('break command added successfully:', result.rows[0].id);
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding break command:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  addBreakCommand();
}

// Export the command object for use in other scripts
module.exports = { breakCommand }; 
