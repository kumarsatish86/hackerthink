const { Pool } = require('pg');

// Create a pool connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

// Sample scripts data
const sampleScripts = [
  {
    title: 'System Monitoring Dashboard',
    slug: 'system-monitoring-dashboard',
    description: 'A comprehensive bash script that displays real-time system metrics in a terminal dashboard, including CPU usage, memory, disk I/O, and network statistics.',
    language: 'bash',
    script_type: 'monitoring',
    difficulty: 'Intermediate',
    tags: ['monitoring', 'system', 'dashboard', 'performance'],
    author_id: 1, // Assuming user with ID 1 exists
    script_content: '#!/bin/bash\n\n# System Monitoring Dashboard\n# Displays system metrics in real-time\n\nwhile true; do\n  clear\n  echo "==== SYSTEM MONITORING DASHBOARD ===="\n  echo "Date: $(date)"\n  echo "Hostname: $(hostname)"\n  echo ""\n  echo "CPU USAGE:"\n  top -bn1 | grep "Cpu(s)" | sed "s/.*, *\\([0-9.]*\\)%* id.*/\\1/" | awk \'{print 100 - $1"%"}\'  \n  echo ""\n  echo "MEMORY USAGE:"\n  free -m | awk \'NR==2{printf "%.2f%%\\n", $3*100/$2}\'\n  echo ""\n  echo "DISK USAGE:"\n  df -h | grep "^/dev"\n  echo ""\n  echo "TOP 5 PROCESSES BY CPU:"\n  ps aux --sort=-%cpu | head -6\n  \n  sleep 5\ndone',
  },
  {
    title: 'Automated Backup Solution',
    slug: 'automated-backup-solution',
    description: 'A powerful script that creates compressed, encrypted backups of specified directories and can be scheduled with cron to run at regular intervals.',
    language: 'bash',
    script_type: 'backup',
    difficulty: 'Beginner',
    tags: ['backup', 'automation', 'cron', 'security'],
    author_id: 1,
    script_content: '#!/bin/bash\n\n# Automated Backup Script\n# Creates compressed, encrypted backups\n\n# Configuration\nBACKUP_DIR="/path/to/backup/destination"\nSOURCE_DIR="/path/to/source"\nDATESTAMP=$(date +"%Y-%m-%d")\nBACKUP_FILENAME="backup-$DATESTAMP.tar.gz"\nENCRYPT_PASSWORD="your-secure-password"\n\n# Create backup directory if it doesn\'t exist\nmkdir -p "$BACKUP_DIR"\n\n# Create tar archive\ntar -czf "$BACKUP_DIR/$BACKUP_FILENAME" "$SOURCE_DIR"\n\n# Encrypt the backup\ngpg --batch --yes --passphrase="$ENCRYPT_PASSWORD" -c "$BACKUP_DIR/$BACKUP_FILENAME"\n\n# Remove the unencrypted version\nrm "$BACKUP_DIR/$BACKUP_FILENAME"\n\necho "Backup completed: $BACKUP_DIR/$BACKUP_FILENAME.gpg"',
  },
  {
    title: 'Network Port Scanner',
    slug: 'network-port-scanner',
    description: 'A Python script that scans a network range for open ports, helping identify services and potential security vulnerabilities in your network.',
    language: 'python',
    script_type: 'security',
    difficulty: 'Advanced',
    tags: ['network', 'security', 'scanning', 'ports'],
    author_id: 1,
    script_content: '#!/usr/bin/env python3\n\nimport socket\nimport sys\nimport ipaddress\nfrom concurrent.futures import ThreadPoolExecutor\nfrom datetime import datetime\n\ndef scan_port(ip, port, timeout=1):\n    """Scan a single port on the specified IP address."""\n    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\n    sock.settimeout(timeout)\n    result = sock.connect_ex((ip, port))\n    sock.close()\n    return port, result == 0\n\ndef scan_ip(ip, port_range, max_workers=100):\n    """Scan multiple ports on a single IP address."""\n    open_ports = []\n    with ThreadPoolExecutor(max_workers=max_workers) as executor:\n        future_to_port = {executor.submit(scan_port, ip, port): port for port in port_range}\n        for future in future_to_port:\n            port, is_open = future.result()\n            if is_open:\n                open_ports.append(port)\n    return open_ports\n\ndef main():\n    if len(sys.argv) != 4:\n        print(f"Usage: {sys.argv[0]} <ip_range> <start_port> <end_port>")\n        print("Example: 192.168.1.0/24 1 1024")\n        return\n    \n    try:\n        network = ipaddress.ip_network(sys.argv[1], strict=False)\n        start_port = int(sys.argv[2])\n        end_port = int(sys.argv[3])\n        \n        if start_port < 1 or end_port > 65535 or start_port > end_port:\n            print("Invalid port range. Must be between 1-65535.")\n            return\n        \n        port_range = range(start_port, end_port + 1)\n        total_hosts = sum(1 for _ in network.hosts())\n        \n        print(f"Scanning {total_hosts} hosts for ports {start_port}-{end_port}")\n        print(f"Started at: {datetime.now().strftime(\'%Y-%m-%d %H:%M:%S\')}")\n        \n        for ip in network.hosts():\n            ip_str = str(ip)\n            open_ports = scan_ip(ip_str, port_range)\n            if open_ports:\n                print(f"\\nOpen ports on {ip_str}:")\n                for port in open_ports:\n                    service = "unknown"\n                    try:\n                        service = socket.getservbyport(port)\n                    except:\n                        pass\n                    print(f"  {port}/tcp - {service}")\n        \n        print(f"\\nScan completed at: {datetime.now().strftime(\'%Y-%m-%d %H:%M:%S\')}")\n        \n    except Exception as e:\n        print(f"Error: {e}")\n\nif __name__ == "__main__":\n    main()',
  },
  {
    title: 'Log File Analyzer',
    slug: 'log-file-analyzer',
    description: 'A Perl script that parses and analyzes log files, extracting useful metrics, generating reports, and alerting on suspicious patterns.',
    language: 'perl',
    script_type: 'system-administration',
    difficulty: 'Intermediate',
    tags: ['logs', 'analysis', 'reporting', 'monitoring'],
    author_id: 1,
  },
  {
    title: 'Database Backup & Rotation',
    slug: 'database-backup-rotation',
    description: 'Automatically backup your MySQL/PostgreSQL databases, with configurable retention policies and optional cloud storage integration.',
    language: 'bash',
    script_type: 'database',
    difficulty: 'Intermediate',
    tags: ['database', 'backup', 'mysql', 'postgresql'],
    author_id: 1,
  },
  {
    title: 'System Hardening Script',
    slug: 'system-hardening-script',
    description: 'Improve your Linux system security by applying best-practice hardening configurations automatically with this comprehensive script.',
    language: 'bash',
    script_type: 'security',
    difficulty: 'Advanced',
    tags: ['security', 'hardening', 'configuration', 'compliance'],
    author_id: 1,
  },
  {
    title: 'File Synchronization Utility',
    slug: 'file-synchronization-utility',
    description: 'Keep directories in sync across multiple systems with this robust rsync-based solution that supports encryption and bandwidth limiting.',
    language: 'bash',
    script_type: 'file-management',
    difficulty: 'Beginner',
    tags: ['sync', 'rsync', 'backup', 'automation'],
    author_id: 1,
  },
  {
    title: 'Container Health Monitor',
    slug: 'container-health-monitor',
    description: 'Monitor Docker containers for resource usage, health status, and automatic restart capabilities when containers fail health checks.',
    language: 'python',
    script_type: 'containers',
    difficulty: 'Intermediate',
    tags: ['docker', 'containers', 'monitoring', 'health'],
    author_id: 1,
  },
  {
    title: 'AWS Resource Manager',
    slug: 'aws-resource-manager',
    description: 'Automate AWS resource management including starting/stopping EC2 instances on schedules, cleaning up unused resources, and monitoring costs.',
    language: 'python',
    script_type: 'cloud-computing',
    difficulty: 'Advanced',
    tags: ['aws', 'cloud', 'automation', 'cost-optimization'],
    author_id: 1,
  },
  {
    title: 'MySQL Performance Tuner',
    slug: 'mysql-performance-tuner',
    description: 'Analyze your MySQL configuration and query performance, providing recommendations for performance improvements based on database workload.',
    language: 'bash',
    script_type: 'database',
    difficulty: 'Intermediate',
    tags: ['mysql', 'performance', 'tuning', 'database'],
    author_id: 1,
  },
  {
    title: 'Simple Web Server',
    slug: 'simple-web-server',
    description: 'A lightweight Python-based web server for quick file sharing and testing, with support for custom routing and basic authentication.',
    language: 'python',
    script_type: 'networking',
    difficulty: 'Beginner',
    tags: ['web', 'server', 'http', 'networking'],
    author_id: 1,
  },
  {
    title: 'Automated System Updates',
    slug: 'automated-system-updates',
    description: 'Schedule and manage system updates across multiple Linux distributions with configurable maintenance windows and rollback capabilities.',
    language: 'bash',
    script_type: 'system-administration',
    difficulty: 'Beginner',
    tags: ['updates', 'patching', 'security', 'automation'],
    author_id: 1,
  }
];

async function main() {
  try {
    console.log('Checking if scripts table exists...');
    
    // Check if the scripts table exists
    try {
      await pool.query(`
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'scripts'
      `);
      console.log('Scripts table exists.');
    } catch (error) {
      console.log('Creating scripts table...');
      // Create the scripts table
      await pool.query(`
        CREATE TABLE scripts (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL UNIQUE,
          description TEXT,
          script_content TEXT NOT NULL,
          language VARCHAR(50),
          script_type VARCHAR(50),
          difficulty VARCHAR(50),
          tags TEXT[],
          author_id INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Scripts table created successfully.');
    }

    // Check if there are already scripts in the database
    const { rows } = await pool.query('SELECT COUNT(*) FROM scripts');
    const count = parseInt(rows[0].count);
    
    if (count > 0) {
      console.log(`There are already ${count} scripts in the database.`);
      console.log('Do you want to add more sample scripts? (y/n)');
      // Since we can't take user input in this script, we'll just proceed
      console.log('Adding sample scripts anyway...');
    } else {
      console.log('No scripts found in the database. Adding sample scripts...');
    }

    // Insert sample scripts
    for (const script of sampleScripts) {
      // Check if script with this slug already exists
      const { rows } = await pool.query(
        'SELECT id FROM scripts WHERE slug = $1',
        [script.slug]
      );
      
      if (rows.length > 0) {
        console.log(`Script with slug "${script.slug}" already exists. Skipping.`);
        continue;
      }
      
      await pool.query(
        `
        INSERT INTO scripts (
          title, 
          slug, 
          description, 
          script_content,
          language, 
          script_type, 
          difficulty, 
          tags, 
          author_id, 
          created_at
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        `,
        [
          script.title,
          script.slug,
          script.description,
          script.script_content,
          script.language,
          script.script_type,
          script.difficulty,
          script.tags,
          script.author_id,
          // The created_at is set to NOW() in the query
        ]
      );
      
      console.log(`Added script: ${script.title}`);
    }

    console.log('Sample scripts have been added to the database successfully!');
  } catch (error) {
    console.error('Error adding sample scripts:', error);
  } finally {
    await pool.end();
  }
}

main(); 