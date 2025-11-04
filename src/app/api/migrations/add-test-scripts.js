const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

async function addTestScripts() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // First check if test scripts already exist
    const checkResult = await client.query(
      `SELECT EXISTS (SELECT 1 FROM scripts WHERE title = 'Sample Bash Script')`
    );
    
    if (checkResult.rows[0].exists) {
      console.log('Test scripts already exist, skipping creation');
    } else {
      // Create test scripts
      const scripts = [
        {
          title: 'Sample Bash Script',
          slug: 'sample-bash-script',
          description: 'A simple Bash script that displays system information',
          script_content: `#!/bin/bash
# Sample script to display system information
echo "System Information:"
echo "==================="
echo "Hostname: $(hostname)"
echo "Kernel: $(uname -r)"
echo "CPU Info: $(grep 'model name' /proc/cpuinfo | head -1 | cut -d ':' -f2 | sed 's/^[ \t]*//')"
echo "Memory: $(free -h | grep Mem | awk '{print $2}')"
echo "Disk Usage: $(df -h / | tail -1 | awk '{print $5}')"
echo "Uptime: $(uptime -p)"`,
          program_output: `System Information:
===================
Hostname: ubuntu-server
Kernel: 5.4.0-54-generic
CPU Info: Intel(R) Core(TM) i7-9700K CPU @ 3.60GHz
Memory: 16G
Disk Usage: 45%
Uptime: up 2 days, 5 hours, 10 minutes`,
          script_type: 'System Administration',
          language: 'Bash',
          os_compatibility: 'Linux',
          difficulty: 'Beginner',
          tags: ['bash', 'system-info', 'linux'],
          published: true
        },
        {
          title: 'Python Network Scanner',
          slug: 'python-network-scanner',
          description: 'A Python script that scans the local network for active hosts',
          script_content: `#!/usr/bin/env python3
# Simple network scanner using ping

import os
import platform
import subprocess
import ipaddress

def ping(host):
    """
    Returns True if host responds to a ping request
    """
    # Check OS to determine ping command
    param = '-n' if platform.system().lower() == 'windows' else '-c'
    command = ['ping', param, '1', host]
    
    return subprocess.call(command, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL) == 0

def scan_network(network):
    """
    Scan network for active hosts
    """
    print(f"Scanning network: {network}")
    print("Active hosts:")
    
    # Parse network CIDR
    net = ipaddress.ip_network(network)
    
    active_hosts = 0
    for ip in net.hosts():
        ip_str = str(ip)
        if ping(ip_str):
            print(f"  {ip_str} is active")
            active_hosts += 1
    
    print(f"Found {active_hosts} active hosts")

if __name__ == "__main__":
    # Scan local network
    scan_network('192.168.1.0/24')`,
          program_output: `Scanning network: 192.168.1.0/24
Active hosts:
  192.168.1.1 is active
  192.168.1.10 is active
  192.168.1.15 is active
  192.168.1.23 is active
Found 4 active hosts`,
          script_type: 'Networking',
          language: 'Python',
          os_compatibility: 'Cross-platform',
          difficulty: 'Intermediate',
          tags: ['python', 'networking', 'security'],
          published: true
        }
      ];
      
      for (const script of scripts) {
        await client.query(`
          INSERT INTO scripts (
            title,
            slug,
            description,
            script_content,
            program_output,
            script_type,
            language,
            os_compatibility,
            difficulty,
            tags,
            published,
            created_at,
            updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
          )
        `, [
          script.title,
          script.slug,
          script.description,
          script.script_content,
          script.program_output,
          script.script_type,
          script.language,
          script.os_compatibility,
          script.difficulty,
          script.tags,
          script.published
        ]);
      }
      
      console.log(`Created ${scripts.length} test scripts`);
    }
    
    await client.query('COMMIT');
    console.log('Process completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding test scripts:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Execute the function
addTestScripts()
  .then(() => {
    console.log('Test scripts added successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Process failed:', error);
    process.exit(1);
  }); 
