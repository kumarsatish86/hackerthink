const { Pool } = require('pg');

// Create a pool connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

async function main() {
  try {
    console.log('Updating lab exercise: shell-scripting-basics');
    
    // Define more detailed content for the lab exercise
    const content = `
      <h2>Introduction to Shell Scripting</h2>
      <p>Shell scripting is a powerful way to automate tasks in Linux. A shell script is a text file containing a series of commands that the shell can execute. In this lab, we'll focus on bash (Bourne Again SHell), which is the most commonly used shell in Linux systems.</p>
      
      <h3>Why Learn Shell Scripting?</h3>
      <ul>
        <li>Automate repetitive tasks</li>
        <li>Combine multiple commands into a single script</li>
        <li>Schedule tasks to run at specific times</li>
        <li>Create custom commands and utilities</li>
        <li>Manipulate files and directories programmatically</li>
      </ul>
      
      <h3>Prerequisites</h3>
      <p>Before starting this lab, you should be familiar with:</p>
      <ul>
        <li>Basic Linux commands (ls, cd, mkdir, etc.)</li>
        <li>File permissions in Linux</li>
        <li>Text editors like nano, vim, or VSCode</li>
      </ul>
      
      <h2>Understanding Shell Scripts</h2>
      <p>A shell script typically starts with a "shebang" line that tells the system which interpreter to use. For bash scripts, this is:</p>
      <pre><code>#!/bin/bash</code></pre>
      
      <p>Comments in shell scripts start with the # character:</p>
      <pre><code># This is a comment</code></pre>
      
      <p>Variables are defined without spaces around the equals sign:</p>
      <pre><code>name="John"
echo "Hello, $name!"</code></pre>
      
      <h2>Key Concepts We'll Cover</h2>
      <ul>
        <li>Creating and executing shell scripts</li>
        <li>Working with variables and environment variables</li>
        <li>Using conditional statements (if-else)</li>
        <li>Implementing loops (for, while)</li>
        <li>Writing and using functions</li>
        <li>Processing command-line arguments</li>
      </ul>
    `;
    
    const instructions = `
      <h2>Step 1: Create Your First Shell Script</h2>
      <p>Let's create a simple "Hello World" script:</p>
      <ol>
        <li>Open a terminal window</li>
        <li>Create a new file called <code>hello.sh</code> using a text editor of your choice:
          <pre><code>nano hello.sh</code></pre>
        </li>
        <li>Add the following content to the file:
          <pre><code>#!/bin/bash
# My first shell script
echo "Hello, World!"</code></pre>
        </li>
        <li>Save the file and exit the editor (in nano: Ctrl+O, Enter, then Ctrl+X)</li>
        <li>Make the script executable:
          <pre><code>chmod +x hello.sh</code></pre>
        </li>
        <li>Run the script:
          <pre><code>./hello.sh</code></pre>
        </li>
      </ol>
      
      <h2>Step 2: Working with Variables</h2>
      <p>Create a new script that uses variables:</p>
      <ol>
        <li>Create a file called <code>variables.sh</code>:
          <pre><code>nano variables.sh</code></pre>
        </li>
        <li>Add this content:
          <pre><code>#!/bin/bash
# Script demonstrating variables
name="Linux User"
current_dir=$(pwd)
file_count=$(ls | wc -l)

echo "Hello, $name!"
echo "You are in: $current_dir"
echo "This directory contains $file_count files or directories"</code></pre>
        </li>
        <li>Save, make executable, and run:
          <pre><code>chmod +x variables.sh
./variables.sh</code></pre>
        </li>
      </ol>
      
      <h2>Step 3: Conditional Statements</h2>
      <p>Let's create a script with decision-making capabilities:</p>
      <ol>
        <li>Create <code>check_file.sh</code>:
          <pre><code>nano check_file.sh</code></pre>
        </li>
        <li>Add this content:
          <pre><code>#!/bin/bash
# Script to check if a file exists

filename="test_file.txt"

if [ -f "$filename" ]; then
    echo "$filename exists."
    echo "Its content is:"
    cat "$filename"
else
    echo "$filename does not exist."
    echo "Creating $filename..."
    echo "This is a test file created by my script" > "$filename"
    echo "$filename created successfully."
fi</code></pre>
        </li>
        <li>Save, make executable, and run the script twice:
          <pre><code>chmod +x check_file.sh
./check_file.sh
./check_file.sh</code></pre>
        </li>
        <li>Notice how the behavior changes on the second run</li>
      </ol>
      
      <h2>Step 4: Loops</h2>
      <p>Let's create a script that uses loops:</p>
      <ol>
        <li>Create <code>loops.sh</code>:
          <pre><code>nano loops.sh</code></pre>
        </li>
        <li>Add this content:
          <pre><code>#!/bin/bash
# Script demonstrating loops

echo "FOR loop example:"
for i in {1..5}; do
    echo "Iteration number $i"
done

echo -e "\\nWHILE loop example:"
count=1
while [ $count -le 3 ]; do
    echo "Count: $count"
    count=$((count + 1))
done</code></pre>
        </li>
        <li>Save, make executable, and run:
          <pre><code>chmod +x loops.sh
./loops.sh</code></pre>
        </li>
      </ol>
      
      <h2>Step 5: Create a Useful Script</h2>
      <p>Finally, let's create a more practical script that backs up files:</p>
      <ol>
        <li>Create <code>backup.sh</code>:
          <pre><code>nano backup.sh</code></pre>
        </li>
        <li>Add this content:
          <pre><code>#!/bin/bash
# Script to backup files to a directory

# Check if backup directory exists, create if not
backup_dir="backup_$(date +%Y%m%d)"
if [ ! -d "$backup_dir" ]; then
    mkdir "$backup_dir"
    echo "Created backup directory: $backup_dir"
fi

# Get files to backup from command line arguments
if [ $# -eq 0 ]; then
    echo "Usage: $0 file1 [file2 ...]"
    exit 1
fi

# Copy each file to the backup directory
for file in "$@"; do
    if [ -f "$file" ]; then
        cp "$file" "$backup_dir/"
        echo "Backed up: $file"
    else
        echo "Warning: $file not found"
    fi
done

echo "Backup completed to directory: $backup_dir"</code></pre>
        </li>
        <li>Save, make executable, and run with some test files:
          <pre><code>chmod +x backup.sh
# Create some test files
echo "Test content 1" > test1.txt
echo "Test content 2" > test2.txt
# Run the backup script
./backup.sh test1.txt test2.txt test3.txt</code></pre>
        </li>
        <li>Check the backup directory:
          <pre><code>ls -l backup_*</code></pre>
        </li>
      </ol>
    `;
    
    const solution = `
      <h2>Solution: Hello World Script</h2>
      <pre><code>#!/bin/bash
# My first shell script
echo "Hello, World!"</code></pre>
      
      <h2>Solution: Variables Script</h2>
      <pre><code>#!/bin/bash
# Script demonstrating variables
name="Linux User"
current_dir=$(pwd)
file_count=$(ls | wc -l)

echo "Hello, $name!"
echo "You are in: $current_dir"
echo "This directory contains $file_count files or directories"</code></pre>
      
      <h2>Solution: Conditional Script</h2>
      <pre><code>#!/bin/bash
# Script to check if a file exists

filename="test_file.txt"

if [ -f "$filename" ]; then
    echo "$filename exists."
    echo "Its content is:"
    cat "$filename"
else
    echo "$filename does not exist."
    echo "Creating $filename..."
    echo "This is a test file created by my script" > "$filename"
    echo "$filename created successfully."
fi</code></pre>
      
      <h2>Solution: Loops Script</h2>
      <pre><code>#!/bin/bash
# Script demonstrating loops

echo "FOR loop example:"
for i in {1..5}; do
    echo "Iteration number $i"
done

echo -e "\\nWHILE loop example:"
count=1
while [ $count -le 3 ]; do
    echo "Count: $count"
    count=$((count + 1))
done</code></pre>
      
      <h2>Solution: Backup Script</h2>
      <pre><code>#!/bin/bash
# Script to backup files to a directory

# Check if backup directory exists, create if not
backup_dir="backup_$(date +%Y%m%d)"
if [ ! -d "$backup_dir" ]; then
    mkdir "$backup_dir"
    echo "Created backup directory: $backup_dir"
fi

# Get files to backup from command line arguments
if [ $# -eq 0 ]; then
    echo "Usage: $0 file1 [file2 ...]"
    exit 1
fi

# Copy each file to the backup directory
for file in "$@"; do
    if [ -f "$file" ]; then
        cp "$file" "$backup_dir/"
        echo "Backed up: $file"
    else
        echo "Warning: $file not found"
    fi
done

echo "Backup completed to directory: $backup_dir"</code></pre>
      
      <h2>Explanation of Key Concepts</h2>
      <ul>
        <li><strong>Shebang line</strong>: <code>#!/bin/bash</code> tells the system to use the bash interpreter</li>
        <li><strong>Variables</strong>: Define with <code>name="value"</code> (no spaces) and use with <code>$name</code></li>
        <li><strong>Command substitution</strong>: <code>$(command)</code> executes the command and returns its output</li>
        <li><strong>Conditional statements</strong>: <code>if [ condition ]; then ... else ... fi</code></li>
        <li><strong>File test operators</strong>: <code>-f</code> checks if file exists, <code>-d</code> for directories</li>
        <li><strong>Loops</strong>: <code>for variable in list; do ... done</code> and <code>while [ condition ]; do ... done</code></li>
        <li><strong>Command line arguments</strong>: <code>$0</code> is the script name, <code>$1</code>, <code>$2</code>, etc. are the arguments, <code>$@</code> is all arguments</li>
      </ul>
    `;
    
    // Update the lab exercise
    const result = await pool.query(
      `UPDATE lab_exercises 
       SET content = $1, instructions = $2, solution = $3,
           description = $4, difficulty = $5, duration = $6
       WHERE slug = $7
       RETURNING id, title, slug`,
      [
        content,
        instructions,
        solution,
        'Learn the fundamentals of bash shell scripting to automate common tasks in Linux. Create your first scripts with variables, conditions, and loops.',
        'beginner',
        90,
        'shell-scripting-basics'
      ]
    );
    
    if (result.rows.length === 0) {
      console.log('No lab exercise found to update.');
    } else {
      console.log('Successfully updated lab exercise:');
      console.log(result.rows[0]);
    }
  } catch (error) {
    console.error('Error updating lab exercise:', error);
  } finally {
    await pool.end();
  }
}

main(); 