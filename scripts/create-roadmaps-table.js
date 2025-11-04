// Script to create roadmaps table and add initial data

const { Pool } = require('pg');

// Create a pool with default values
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'hackerthink',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// Execute a database query
async function query(text, params = []) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`Executed query: ${text.substring(0, 40)}... | Duration: ${duration}ms | Rows: ${result.rowCount}`);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// End pool when done
async function end() {
  await pool.end();
}

async function createRoadmapsTable() {
  try {
    // Check if table exists
    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'roadmaps'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('Roadmaps table already exists');
    } else {
      // Create roadmaps table
      await query(`
        CREATE TABLE roadmaps (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL UNIQUE,
          description TEXT,
          level VARCHAR(100),
          difficulty VARCHAR(100),
          duration VARCHAR(100),
          is_published BOOLEAN DEFAULT false,
          is_featured BOOLEAN DEFAULT false,
          meta_title VARCHAR(255),
          meta_description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('Roadmaps table created successfully');
    }

    // Check if roadmap_modules table exists
    const moduleTableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'roadmap_modules'
      );
    `);
    
    if (moduleTableCheck.rows[0].exists) {
      console.log('Roadmap modules table already exists');
    } else {
      // Create roadmap_modules table
      await query(`
        CREATE TABLE roadmap_modules (
          id SERIAL PRIMARY KEY,
          roadmap_id INTEGER NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          level VARCHAR(100),
          duration VARCHAR(100),
          order_index INTEGER NOT NULL DEFAULT 0,
          skills TEXT[],
          resources JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('Roadmap modules table created successfully');
    }

    // Add Linux Admin roadmap data
    // First, check if the roadmap already exists
    const existingRoadmap = await query(
      'SELECT id FROM roadmaps WHERE slug = $1',
      ['linux-admin']
    );

    let roadmapId;

    if (existingRoadmap.rows.length > 0) {
      // Roadmap already exists, get its ID
      roadmapId = existingRoadmap.rows[0].id;
      console.log('Linux Admin roadmap already exists with ID:', roadmapId);
      
      // Delete existing modules to recreate them
      await query(
        'DELETE FROM roadmap_modules WHERE roadmap_id = $1',
        [roadmapId]
      );
      console.log('Deleted existing modules for Linux Admin roadmap');
    } else {
      // Create the roadmap
      const roadmapResult = await query(
        `INSERT INTO roadmaps 
          (title, slug, description, level, difficulty, duration, is_published, is_featured, meta_title, meta_description)
        VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id`,
        [
          'Linux System Administrator',
          'linux-admin',
          'Master Linux system administration from basics to advanced server management',
          'All Levels',
          'Intermediate',
          '6-12 months',
          true,
          true,
          'Linux System Administrator Roadmap | Complete Learning Path',
          'Follow this structured roadmap to become a professional Linux system administrator. Learn essential skills from command line basics to advanced server management.'
        ]
      );
      
      roadmapId = roadmapResult.rows[0].id;
      console.log('Created Linux Admin roadmap with ID:', roadmapId);
    }

    // Define roadmap modules data
    const roadmapModules = [
      {
        title: 'Linux Fundamentals',
        description: 'Master the essential concepts and commands for navigating and managing Linux systems',
        level: 'Beginner',
        duration: '4-6 weeks',
        order_index: 1,
        skills: ['Command Line Basics', 'File System Navigation', 'User Management', 'Permissions', 'Package Management', 'Process Management'],
        resources: JSON.stringify([
          { type: 'article', title: 'Linux Command Line Essentials', link: '/articles/linux-command-line-essentials' },
          { type: 'video', title: 'Introduction to the Linux Terminal', link: '/courses/linux-basics/terminal-intro' },
          { type: 'lab', title: 'File System Navigation Lab', link: '/labs/linux-file-system' }
        ])
      },
      {
        title: 'System Configuration',
        description: 'Learn to configure Linux systems, manage services, and understand system initialization',
        level: 'Beginner-Intermediate',
        duration: '3-4 weeks',
        order_index: 2,
        skills: ['System Initialization (systemd)', 'Service Management', 'Network Configuration', 'Storage Management', 'Hardware Configuration', 'Log Management'],
        resources: JSON.stringify([
          { type: 'article', title: 'Understanding systemd', link: '/articles/understanding-systemd' },
          { type: 'video', title: 'Managing System Services', link: '/courses/system-config/service-management' },
          { type: 'lab', title: 'Network Configuration Lab', link: '/labs/network-config' }
        ])
      },
      {
        title: 'User and Security Management',
        description: 'Master user administration, access control, and basic security practices',
        level: 'Intermediate',
        duration: '3-4 weeks',
        order_index: 3,
        skills: ['User and Group Administration', 'Access Control (PAM)', 'Sudo Configuration', 'SSH Hardening', 'Firewall Configuration', 'Security Best Practices'],
        resources: JSON.stringify([
          { type: 'article', title: 'User Management in Linux', link: '/articles/linux-user-management' },
          { type: 'video', title: 'SSH Security Configuration', link: '/courses/linux-security/ssh-hardening' },
          { type: 'lab', title: 'Firewall Configuration Lab', link: '/labs/firewall-setup' }
        ])
      },
      {
        title: 'Storage Management',
        description: 'Configure and manage storage devices, file systems, and advanced storage features',
        level: 'Intermediate',
        duration: '3-4 weeks',
        order_index: 4,
        skills: ['Disk Partitioning', 'Filesystem Management', 'Logical Volume Management (LVM)', 'RAID Configuration', 'Storage Monitoring', 'Backup and Recovery'],
        resources: JSON.stringify([
          { type: 'article', title: 'LVM Fundamentals', link: '/articles/lvm-fundamentals' },
          { type: 'video', title: 'Storage Management in Linux', link: '/courses/storage/lvm-raid' },
          { type: 'lab', title: 'LVM Configuration Lab', link: '/labs/lvm-setup' }
        ])
      },
      {
        title: 'Network Services',
        description: 'Deploy and manage essential network services on Linux systems',
        level: 'Intermediate',
        duration: '4-6 weeks',
        order_index: 5,
        skills: ['DNS Server Configuration', 'DHCP Server Management', 'Web Servers (Apache/Nginx)', 'Database Servers', 'Mail Services', 'Proxy Services'],
        resources: JSON.stringify([
          { type: 'article', title: 'Deploying DNS with BIND', link: '/articles/bind-dns-setup' },
          { type: 'video', title: 'Web Server Configuration', link: '/courses/network-services/web-servers' },
          { type: 'lab', title: 'Database Server Lab', link: '/labs/database-setup' }
        ])
      }
    ];

    // Insert modules
    for (const module of roadmapModules) {
      await query(
        `INSERT INTO roadmap_modules 
          (roadmap_id, title, description, level, duration, order_index, skills, resources)
        VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          roadmapId,
          module.title,
          module.description,
          module.level,
          module.duration,
          module.order_index,
          module.skills,
          module.resources
        ]
      );
      console.log(`Added module: ${module.title}`);
    }

    console.log('Successfully added Linux Admin roadmap with all modules');
    return { success: true, roadmapId };
  } catch (error) {
    console.error('Error creating roadmaps tables:', error);
    return { success: false, error };
  } finally {
    // Close database connection
    await end();
  }
}

// Execute if run directly
if (require.main === module) {
  createRoadmapsTable()
    .then(result => {
      console.log('Script execution completed:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Script execution failed:', error);
      process.exit(1);
    });
}

module.exports = { createRoadmapsTable }; 