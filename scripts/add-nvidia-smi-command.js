const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

const nvidiaSmiCommand = {
  title: 'nvidia-smi',
  slug: 'nvidia-smi',
  description: 'NVIDIA System Management Interface (nvidia-smi) is a command-line utility that provides monitoring and management capabilities for NVIDIA GPU devices. It displays GPU utilization, memory usage, temperature, power consumption, and driver information. Essential for monitoring GPU performance, debugging CUDA applications, and managing GPU resources in AI/ML workloads.',
  syntax: `nvidia-smi [OPTIONS]

Common Options:
  -q, --query-gpu=<query>       Query specific GPU attributes
  -f, --filename=<file>         Output to file
  -i, --id=<GPU_ID>             Target specific GPU by ID
  -l, --loop=<seconds>          Continuously query at specified interval
  -d, --display=<display_mode>  Display mode (DEFAULT, CSV, JSON, XML)
  --format=<format>              Output format (csv, noheader, nounits)
  -h, --help                    Show help message`,
  examples: `# Basic GPU information display
nvidia-smi

# Monitor GPU continuously every 2 seconds
nvidia-smi -l 2

# Query specific GPU attributes
nvidia-smi --query-gpu=name,memory.total,memory.used,temperature.gpu --format=csv

# Monitor specific GPU by ID
nvidia-smi -i 0

# Save output to file
nvidia-smi -f /tmp/gpu_status.txt

# Get detailed GPU information in JSON format
nvidia-smi --query-gpu=all --format=json

# Monitor GPU utilization and processes
nvidia-smi --query-gpu=utilization.gpu,utilization.memory --format=csv,noheader,nounits

# Watch GPU metrics in real-time
watch -n 1 nvidia-smi

# Check GPU driver and CUDA version
nvidia-smi --query-gpu=driver_version,cuda_version --format=csv

# Monitor power consumption
nvidia-smi --query-gpu=power.draw,power.limit --format=csv

# Get memory information
nvidia-smi --query-gpu=memory.total,memory.used,memory.free --format=csv

# Check running processes using GPU
nvidia-smi pmon -c 1`,
  options: `Query Options:
  -q, --query-gpu=<query>       Query GPU attributes
  -q, --query-compute-apps      Query compute applications
  -q, --query-display           Query display attributes
  -q, --query-ecc               Query ECC errors
  -q, --query-remapped-rows      Query remapped rows
  -q, --query-page-retirements  Query page retirements
  
Display Options:
  -f, --filename=<file>         Write output to file
  -d, --display=<mode>          Display mode (DEFAULT, CSV, JSON, XML)
  --format=<format>             Output format specification
  
Monitoring Options:
  -l, --loop=<seconds>          Loop query at specified interval
  -i, --id=<GPU_ID>             Target specific GPU by ID
  -c, --count=<num>             Number of times to loop (with -l)
  
Other Options:
  -h, --help                    Show help
  -V, --version                 Show version
  --driver-name                 Display driver name`,
  notes: `**Use Cases:**
- **AI/ML Workloads:** Monitor GPU utilization during model training or inference
- **CUDA Development:** Debug CUDA applications and check GPU availability
- **Resource Management:** Monitor GPU memory usage and temperature
- **Performance Tuning:** Identify bottlenecks and optimize GPU usage
- **System Administration:** Check GPU health and driver status

**Common Query Attributes:**
- \`name\` - GPU model name
- \`memory.total\` - Total GPU memory
- \`memory.used\` - Used GPU memory
- \`memory.free\` - Free GPU memory
- \`temperature.gpu\` - GPU temperature
- \`utilization.gpu\` - GPU utilization percentage
- \`utilization.memory\` - Memory utilization percentage
- \`power.draw\` - Current power consumption
- \`power.limit\` - Power limit
- \`driver_version\` - NVIDIA driver version
- \`cuda_version\` - CUDA version
- \`compute_mode\` - Compute mode
- \`persistence_mode\` - Persistence mode

**Monitoring Best Practices:**
- Use \`-l 1\` for continuous monitoring during training
- Save output to file with \`-f\` for later analysis
- Use CSV format for easy data processing
- Monitor temperature to prevent thermal throttling
- Track memory usage to avoid OOM errors

**Integration with AI Tools:**
- Essential for monitoring GPU usage in AI model training
- Helps optimize batch sizes based on available memory
- Useful for multi-GPU setups to balance load
- Critical for debugging CUDA out-of-memory errors`,
  category: 'gpu-cuda-nvidia',
  platform: 'Linux',
  icon: '🎮',
  published: true,
  seo_title: 'nvidia-smi - NVIDIA GPU System Management Interface Command Guide',
  seo_description: 'Complete guide to nvidia-smi command for monitoring NVIDIA GPUs. Learn how to check GPU utilization, memory usage, temperature, and performance. Essential for AI/ML workloads, CUDA development, and GPU resource management on Linux systems.',
  seo_keywords: 'nvidia-smi, nvidia gpu, cuda monitoring, gpu monitoring, nvidia command, gpu utilization, cuda development, ai gpu monitoring, nvidia system management, gpu memory, gpu temperature, gpu performance, linux gpu commands, machine learning gpu'
};

async function addNvidiaSmiCommand() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    console.log('Adding nvidia-smi command to database...\n');

    // Check if nvidia-smi command already exists
    const commandCheck = await client.query(
      'SELECT * FROM commands WHERE slug = $1',
      ['nvidia-smi']
    );
    
    if (commandCheck.rows.length > 0) {
      console.log('nvidia-smi command already exists. Updating...');
      
      const result = await client.query(
        `UPDATE commands SET
          title = $1,
          description = $2,
          syntax = $3,
          examples = $4,
          options = $5,
          notes = $6,
          category = $7,
          platform = $8,
          icon = $9,
          published = $10,
          seo_title = $11,
          seo_description = $12,
          seo_keywords = $13,
          updated_at = CURRENT_TIMESTAMP
        WHERE slug = 'nvidia-smi'
        RETURNING *`,
        [
          nvidiaSmiCommand.title,
          nvidiaSmiCommand.description,
          nvidiaSmiCommand.syntax,
          nvidiaSmiCommand.examples,
          nvidiaSmiCommand.options,
          nvidiaSmiCommand.notes,
          nvidiaSmiCommand.category,
          nvidiaSmiCommand.platform,
          nvidiaSmiCommand.icon,
          nvidiaSmiCommand.published,
          nvidiaSmiCommand.seo_title,
          nvidiaSmiCommand.seo_description,
          nvidiaSmiCommand.seo_keywords
        ]
      );
      
      console.log('✅ nvidia-smi command updated successfully:', result.rows[0].id);
    } else {
      // Insert nvidia-smi command
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
          nvidiaSmiCommand.title,
          nvidiaSmiCommand.slug,
          nvidiaSmiCommand.description,
          nvidiaSmiCommand.syntax,
          nvidiaSmiCommand.examples,
          nvidiaSmiCommand.options,
          nvidiaSmiCommand.notes,
          nvidiaSmiCommand.category,
          nvidiaSmiCommand.platform,
          nvidiaSmiCommand.icon,
          nvidiaSmiCommand.published,
          nvidiaSmiCommand.seo_title,
          nvidiaSmiCommand.seo_description,
          nvidiaSmiCommand.seo_keywords
        ]
      );
      
      console.log('✅ nvidia-smi command added successfully:', result.rows[0].id);
    }

    await client.query('COMMIT');
    console.log('\n🎉 nvidia-smi command has been added/updated in the database!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  addNvidiaSmiCommand()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { addNvidiaSmiCommand, nvidiaSmiCommand };

