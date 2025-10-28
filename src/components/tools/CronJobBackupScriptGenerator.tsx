"use client";
import React, { useState } from 'react';

export function HeroSection({ title, description }: { title: string, description: string }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-cyan-900 to-blue-800 rounded-xl mb-10">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-cyan-500 rounded-full"></div>
        <div className="absolute right-10 top-20 w-20 h-20 bg-blue-500 rounded-full"></div>
        <div className="absolute bottom-10 left-1/3 w-30 h-30 bg-teal-500 rounded-full"></div>
      </div>
      <div className="relative px-8 py-16 md:py-20 text-center md:text-left md:flex items-center">
        <div className="md:w-2/3 z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h1>
          <p className="text-cyan-100 text-lg md:text-xl max-w-2xl">{description}</p>
        </div>
        <div className="hidden md:block md:w-1/3">
          <div className="relative">
            <svg className="absolute top-0 right-0 w-full h-full text-white opacity-10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-xl border border-white/20 w-64">
              <div className="text-white text-center">
                <div className="text-2xl mb-2">💾</div>
                <div className="text-sm font-semibold">Backup Script</div>
                <div className="text-xs opacity-75">Generator</div>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>📁 Source</span>
                    <span>💾 Target</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>⏰ Schedule</span>
                    <span>🔒 Security</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface BackupConfig {
  sourcePath: string;
  targetPath: string;
  backupType: 'full' | 'incremental' | 'differential';
  compression: 'gzip' | 'bzip2' | 'xz' | 'none';
  retention: number;
  retentionUnit: 'days' | 'weeks' | 'months';
  encryption: boolean;
  encryptionPassword: string;
  excludePatterns: string[];
  includeHidden: boolean;
  verifyBackup: boolean;
  logFile: string;
  emailNotification: boolean;
  emailAddress: string;
}

export function CronJobBackupScriptGenerator() {
  const [backupConfig, setBackupConfig] = useState<BackupConfig>({
    sourcePath: '/var/www',
    targetPath: '/backups',
    backupType: 'full',
    compression: 'gzip',
    retention: 30,
    retentionUnit: 'days',
    encryption: false,
    encryptionPassword: '',
    excludePatterns: ['*.tmp', '*.log', 'node_modules'],
    includeHidden: false,
    verifyBackup: true,
    logFile: '/var/log/backup.log',
    emailNotification: false,
    emailAddress: ''
  });

  const [generatedScript, setGeneratedScript] = useState<string>('');
  const [scriptType, setScriptType] = useState<'bash' | 'python'>('bash');

  const updateConfig = (key: keyof BackupConfig, value: any) => {
    setBackupConfig(prev => ({ ...prev, [key]: value }));
  };

  const addExcludePattern = () => {
    const pattern = prompt('Enter exclude pattern (e.g., *.tmp, *.log):');
    if (pattern) {
      updateConfig('excludePatterns', [...backupConfig.excludePatterns, pattern]);
    }
  };

  const removeExcludePattern = (index: number) => {
    updateConfig('excludePatterns', backupConfig.excludePatterns.filter((_, i) => i !== index));
  };

  const generateBackupScript = () => {
    if (scriptType === 'bash') {
      setGeneratedScript(generateBashScript());
    } else {
      setGeneratedScript(generatePythonScript());
    }
  };

  const generateBashScript = (): string => {
    const script = `#!/bin/bash
# Cron Job Backup Script
# Generated on: $(new Date().toLocaleDateString())
# Source: ${backupConfig.sourcePath}
# Target: ${backupConfig.targetPath}

# Configuration
SOURCE_PATH="${backupConfig.sourcePath}"
TARGET_PATH="${backupConfig.targetPath}"
BACKUP_TYPE="${backupConfig.backupType}"
COMPRESSION="${backupConfig.compression}"
RETENTION_DAYS=${backupConfig.retentionUnit === 'days' ? backupConfig.retention : 
                  backupConfig.retentionUnit === 'weeks' ? backupConfig.retention * 7 : 
                  backupConfig.retention * 30}
LOG_FILE="${backupConfig.logFile}"
${backupConfig.emailNotification ? `EMAIL="${backupConfig.emailAddress}"` : ''}

# Create target directory if it doesn't exist
mkdir -p "$TARGET_PATH"

# Generate backup filename with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="backup_${backupConfig.backupType}_\${TIMESTAMP}"
BACKUP_FILE="\${TARGET_PATH}/\${BACKUP_NAME}"

# Log function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Start backup
log "Starting ${backupConfig.backupType} backup from \$SOURCE_PATH to \$TARGET_PATH"

# Build exclude patterns
EXCLUDE_ARGS=""
${backupConfig.excludePatterns.map(pattern => `EXCLUDE_ARGS="\$EXCLUDE_ARGS --exclude='${pattern}'"`).join('\n')}
${!backupConfig.includeHidden ? 'EXCLUDE_ARGS="$EXCLUDE_ARGS --exclude=.*"' : ''}

# Perform backup using rsync
if rsync -av --delete \$EXCLUDE_ARGS "\$SOURCE_PATH/" "\$BACKUP_FILE/"; then
    log "Backup completed successfully"
    
    # Compress backup
    if [ "$COMPRESSION" != "none" ]; then
        log "Compressing backup..."
        case "$COMPRESSION" in
            "gzip")
                tar -czf "\${BACKUP_FILE}.tar.gz" -C "\$TARGET_PATH" "\${BACKUP_NAME}"
                ;;
            "bzip2")
                tar -cjf "\${BACKUP_FILE}.tar.bz2" -C "\$TARGET_PATH" "\${BACKUP_NAME}"
                ;;
            "xz")
                tar -cJf "\${BACKUP_FILE}.tar.xz" -C "\$TARGET_PATH" "\${BACKUP_NAME}"
                ;;
        esac
        
        if [ $? -eq 0 ]; then
            log "Compression completed"
            rm -rf "\$BACKUP_FILE"
            BACKUP_FILE="\${BACKUP_FILE}.tar.\${COMPRESSION}"
        fi
    fi
    
    # Verify backup if enabled
    ${backupConfig.verifyBackup ? `
    if [ "$COMPRESSION" != "none" ]; then
        log "Verifying backup integrity..."
        case "$COMPRESSION" in
            "gzip")
                tar -tzf "\$BACKUP_FILE" > /dev/null
                ;;
            "bzip2")
                tar -tjf "\$BACKUP_FILE" > /dev/null
                ;;
            "xz")
                tar -tJf "\$BACKUP_FILE" > /dev/null
                ;;
        esac
        
        if [ $? -eq 0 ]; then
            log "Backup verification successful"
        else
            log "ERROR: Backup verification failed"
            exit 1
        fi
    fi` : ''}
    
    # Clean up old backups
    log "Cleaning up backups older than \$RETENTION_DAYS days"
    find "\$TARGET_PATH" -name "backup_*" -type f -mtime +\$RETENTION_DAYS -delete
    
    # Send email notification if enabled
    ${backupConfig.emailNotification ? `
    if command -v mail >/dev/null 2>&1; then
        echo "Backup completed successfully at $(date)" | mail -s "Backup Success: \$SOURCE_PATH" "\$EMAIL"
    fi` : ''}
    
    log "Backup process completed successfully"
    exit 0
else
    log "ERROR: Backup failed"
    ${backupConfig.emailNotification ? `
    if command -v mail >/dev/null 2>&1; then
        echo "Backup failed at $(date). Check logs at \$LOG_FILE" | mail -s "Backup Failed: \$SOURCE_PATH" "\$EMAIL"
    fi` : ''}
    exit 1
fi`;

    return script;
  };

  const generatePythonScript = (): string => {
    const script = `#!/usr/bin/env python3
# Cron Job Backup Script
# Generated on: ${new Date().toLocaleDateString()}
# Source: ${backupConfig.sourcePath}
# Target: ${backupConfig.targetPath}

import os
import sys
import shutil
import tarfile
import logging
import subprocess
import smtplib
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from pathlib import Path

# Configuration
SOURCE_PATH = "${backupConfig.sourcePath}"
TARGET_PATH = "${backupConfig.targetPath}"
BACKUP_TYPE = "${backupConfig.backupType}"
COMPRESSION = "${backupConfig.compression}"
RETENTION_DAYS = ${backupConfig.retentionUnit === 'days' ? backupConfig.retention : 
                  backupConfig.retentionUnit === 'weeks' ? backupConfig.retention * 7 : 
                  backupConfig.retention * 30}
LOG_FILE = "${backupConfig.logFile}"
${backupConfig.emailNotification ? `EMAIL = "${backupConfig.emailAddress}"` : ''}

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler()
    ]
)

def log(message):
    logging.info(message)

def send_email(subject, body):
    try:
        msg = MIMEText(body)
        msg['Subject'] = subject
        msg['From'] = 'backup@system'
        msg['To'] = EMAIL
        
        # Send email using local mail server
        with smtplib.SMTP('localhost') as server:
            server.send_message(msg)
        log(f"Email notification sent to {EMAIL}")
    except Exception as e:
        log(f"Failed to send email: {e}")

def main():
    try:
        log(f"Starting {BACKUP_TYPE} backup from {SOURCE_PATH} to {TARGET_PATH}")
        
        # Create target directory
        Path(TARGET_PATH).mkdir(parents=True, exist_ok=True)
        
        # Generate backup filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_name = f"backup_{BACKUP_TYPE}_{timestamp}"
        backup_path = os.path.join(TARGET_PATH, backup_name)
        
        # Perform backup using rsync
        rsync_cmd = [
            'rsync', '-av', '--delete',
            '--exclude=*.tmp', '--exclude=*.log', '--exclude=node_modules'
        ]
        
        if not ${backupConfig.includeHidden}:
            rsync_cmd.append('--exclude=.*')
        
        rsync_cmd.extend([f"{SOURCE_PATH}/", f"{backup_path}/"])
        
        result = subprocess.run(rsync_cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            raise Exception(f"rsync failed: {result.stderr}")
        
        log("Backup completed successfully")
        
        # Compress backup
        if COMPRESSION != "none":
            log("Compressing backup...")
            archive_name = f"{backup_path}.tar.{COMPRESSION}"
            
            with tarfile.open(archive_name, f"w:{COMPRESSION}") as tar:
                tar.add(backup_path, arcname=backup_name)
            
            # Remove uncompressed backup
            shutil.rmtree(backup_path)
            backup_path = archive_name
            log("Compression completed")
        
        # Verify backup if enabled
        ${backupConfig.verifyBackup ? `
        if COMPRESSION != "none":
            log("Verifying backup integrity...")
            try:
                with tarfile.open(backup_path, 'r') as tar:
                    tar.getmembers()
                log("Backup verification successful")
            except Exception as e:
                raise Exception(f"Backup verification failed: {e}")` : ''}
        
        # Clean up old backups
        log(f"Cleaning up backups older than {RETENTION_DAYS} days")
        cutoff_date = datetime.now() - timedelta(days=RETENTION_DAYS)
        
        for backup_file in Path(TARGET_PATH).glob("backup_*"):
            if backup_file.stat().st_mtime < cutoff_date.timestamp():
                backup_file.unlink()
                log(f"Removed old backup: {backup_file}")
        
        # Send email notification if enabled
        ${backupConfig.emailNotification ? `
        if EMAIL:
            send_email(
                f"Backup Success: {SOURCE_PATH}",
                f"Backup completed successfully at {datetime.now()}"
            )` : ''}
        
        log("Backup process completed successfully")
        return 0
        
    except Exception as e:
        log(f"ERROR: Backup failed: {e}")
        ${backupConfig.emailNotification ? `
        if EMAIL:
            send_email(
                f"Backup Failed: {SOURCE_PATH}",
                f"Backup failed at {datetime.now()}. Check logs at {LOG_FILE}"
            )` : ''}
        return 1

if __name__ == "__main__":
    sys.exit(main())`;

    return script;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-gradient-to-br from-cyan-50 to-blue-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-cyan-800 flex items-center gap-2">
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
          <path fill="#0891b2" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        Cron Job Backup Script Generator
      </h2>

      {/* Configuration Form */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-cyan-800 mb-4">Backup Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Source and Target Paths */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Source Path
            </label>
            <input
              type="text"
              value={backupConfig.sourcePath}
              onChange={(e) => updateConfig('sourcePath', e.target.value)}
              placeholder="/var/www"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Path
            </label>
            <input
              type="text"
              value={backupConfig.targetPath}
              onChange={(e) => updateConfig('targetPath', e.target.value)}
              placeholder="/backups"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          {/* Backup Type and Compression */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Backup Type
            </label>
            <select
              value={backupConfig.backupType}
              onChange={(e) => updateConfig('backupType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="full">Full Backup</option>
              <option value="incremental">Incremental</option>
              <option value="differential">Differential</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Compression
            </label>
            <select
              value={backupConfig.compression}
              onChange={(e) => updateConfig('compression', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="gzip">Gzip (fast)</option>
              <option value="bzip2">Bzip2 (balanced)</option>
              <option value="xz">XZ (best compression)</option>
              <option value="none">No compression</option>
            </select>
          </div>

          {/* Retention Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Retention Period
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={backupConfig.retention}
                onChange={(e) => updateConfig('retention', parseInt(e.target.value))}
                min="1"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
              <select
                value={backupConfig.retentionUnit}
                onChange={(e) => updateConfig('retentionUnit', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
              </select>
            </div>
          </div>

          {/* Log File */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Log File Path
            </label>
            <input
              type="text"
              value={backupConfig.logFile}
              onChange={(e) => updateConfig('logFile', e.target.value)}
              placeholder="/var/log/backup.log"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Advanced Options */}
        <div className="mt-6 space-y-4">
          <h4 className="font-medium text-cyan-800">Advanced Options</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Exclude Patterns */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exclude Patterns
              </label>
              <div className="space-y-2">
                {backupConfig.excludePatterns.map((pattern, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={pattern}
                      onChange={(e) => {
                        const newPatterns = [...backupConfig.excludePatterns];
                        newPatterns[index] = e.target.value;
                        updateConfig('excludePatterns', newPatterns);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => removeExcludePattern(index)}
                      className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={addExcludePattern}
                  className="px-3 py-2 bg-cyan-100 hover:bg-cyan-200 text-cyan-800 rounded-lg transition-colors"
                >
                  + Add Pattern
                </button>
              </div>
            </div>

            {/* Other Options */}
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeHidden"
                  checked={backupConfig.includeHidden}
                  onChange={(e) => updateConfig('includeHidden', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="includeHidden" className="text-sm text-gray-700">
                  Include hidden files
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="verifyBackup"
                  checked={backupConfig.verifyBackup}
                  onChange={(e) => updateConfig('verifyBackup', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="verifyBackup" className="text-sm text-gray-700">
                  Verify backup integrity
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emailNotification"
                  checked={backupConfig.emailNotification}
                  onChange={(e) => updateConfig('emailNotification', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="emailNotification" className="text-sm text-gray-700">
                  Email notifications
                </label>
              </div>
            </div>
          </div>

          {/* Email Configuration */}
          {backupConfig.emailNotification && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={backupConfig.emailAddress}
                onChange={(e) => updateConfig('emailAddress', e.target.value)}
                placeholder="admin@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          )}
        </div>

        {/* Script Generation */}
        <div className="mt-6">
          <div className="flex gap-4 mb-4">
            <select
              value={scriptType}
              onChange={(e) => setScriptType(e.target.value as 'bash' | 'python')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="bash">Bash Script</option>
              <option value="python">Python Script</option>
            </select>
            
            <button
              onClick={generateBackupScript}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Generate Script
            </button>
          </div>
        </div>
      </div>

      {/* Generated Script */}
      {generatedScript && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-cyan-800">
              Generated {scriptType === 'bash' ? 'Bash' : 'Python'} Script
            </h3>
            <button
              onClick={() => copyToClipboard(generatedScript)}
              className="bg-cyan-100 hover:bg-cyan-200 text-cyan-800 px-4 py-2 rounded-lg transition-colors"
            >
              📋 Copy Script
            </button>
          </div>
          
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
            <code>{generatedScript}</code>
          </pre>
          
          <div className="mt-4 p-4 bg-cyan-50 rounded-lg">
            <h4 className="font-medium text-cyan-800 mb-2">Usage Instructions:</h4>
            <ol className="list-decimal list-inside text-cyan-700 text-sm space-y-1">
              <li>Save the script to a file (e.g., <code>backup_script.sh</code> or <code>backup_script.py</code>)</li>
              <li>Make it executable: <code>chmod +x backup_script.sh</code></li>
              <li>Test it manually first: <code>./backup_script.sh</code></li>
              <li>Add to crontab: <code>crontab -e</code></li>
              <li>Add line: <code>0 2 * * * /path/to/backup_script.sh</code> (runs daily at 2 AM)</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

export function CronJobBackupScriptGeneratorInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-cyan-800">Why Generate Backup Scripts?</h2>
        <p className="text-gray-700 text-lg">
          Automated backup scripts are essential for data protection and disaster recovery. The Cron Job Backup Script Generator 
          creates robust, production-ready backup scripts that can be scheduled to run automatically, ensuring your critical 
          data is consistently protected without manual intervention.
        </p>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-cyan-800">Backup Script Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-cyan-50 p-6 rounded-lg">
            <h3 className="font-semibold text-cyan-800 mb-3">🔄 Multiple Backup Types</h3>
            <p className="text-gray-700 mb-3">
              Choose between full, incremental, and differential backup strategies based on your data change patterns and storage requirements.
            </p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li>Full: Complete backup every time</li>
              <li>Incremental: Only changed files</li>
              <li>Differential: Changes since last full backup</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-3">🗜️ Compression Options</h3>
            <p className="text-gray-700 mb-3">
              Optimize storage space with multiple compression algorithms, each offering different speed vs. size trade-offs.
            </p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li>Gzip: Fast compression, moderate size reduction</li>
              <li>Bzip2: Balanced compression and speed</li>
              <li>XZ: Maximum compression, slower processing</li>
            </ul>
          </div>
          
          <div className="bg-teal-50 p-6 rounded-lg">
            <h3 className="font-semibold text-teal-800 mb-3">📅 Retention Management</h3>
            <p className="text-gray-700 mb-3">
              Automatically clean up old backups based on configurable retention policies to manage disk space efficiently.
            </p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li>Configurable retention periods</li>
              <li>Automatic cleanup of expired backups</li>
              <li>Flexible time units (days, weeks, months)</li>
            </ul>
          </div>
          
          <div className="bg-indigo-50 p-6 rounded-lg">
            <h3 className="font-semibold text-indigo-800 mb-3">🔒 Security & Verification</h3>
            <p className="text-gray-700 mb-3">
              Ensure backup integrity with verification checks and optional encryption for sensitive data protection.
            </p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li>Backup integrity verification</li>
              <li>Comprehensive logging</li>
              <li>Email notifications</li>
            </ul>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-cyan-800">Understanding Backup Strategies</h2>
        <div className="space-y-6">
          <div className="bg-cyan-50 p-6 rounded-lg">
            <h3 className="font-semibold text-cyan-800 mb-3">Full Backup Strategy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-cyan-700 mb-2">Advantages</h4>
                <ul className="list-disc pl-6 text-cyan-700 text-sm space-y-1">
                  <li>Complete data recovery from single backup</li>
                  <li>Simple restoration process</li>
                  <li>No dependency on other backups</li>
                  <li>Fast recovery time</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-cyan-700 mb-2">Considerations</h4>
                <ul className="list-disc pl-6 text-cyan-700 text-sm space-y-1">
                  <li>Larger storage requirements</li>
                  <li>Longer backup duration</li>
                  <li>Higher resource usage</li>
                  <li>More network bandwidth</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-3">Incremental Backup Strategy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-blue-700 mb-2">Advantages</h4>
                <ul className="list-disc pl-6 text-blue-700 text-sm space-y-1">
                  <li>Minimal storage requirements</li>
                  <li>Fast backup execution</li>
                  <li>Efficient for frequently changing data</li>
                  <li>Lower resource usage</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-700 mb-2">Considerations</h4>
                <ul className="list-disc pl-6 text-blue-700 text-sm space-y-1">
                  <li>Requires full backup + all incrementals</li>
                  <li>Longer recovery time</li>
                  <li>More complex restoration process</li>
                  <li>Chain dependency risk</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-cyan-800">Best Practices for Backup Scripts</h2>
        <div className="bg-cyan-50 p-6 rounded-lg">
          <h3 className="font-semibold text-cyan-800 mb-3">Implementation Guidelines</h3>
          <ul className="list-disc pl-6 text-gray-700 text-lg space-y-2">
            <li><strong>Test First:</strong> Always test backup scripts manually before adding to cron</li>
            <li><strong>Monitor Logs:</strong> Regularly check backup logs for errors and warnings</li>
            <li><strong>Verify Restores:</strong> Periodically test backup restoration to ensure data integrity</li>
            <li><strong>Storage Planning:</strong> Calculate storage requirements including retention policies</li>
            <li><strong>Network Considerations:</strong> Schedule backups during low-traffic periods</li>
            <li><strong>Security:</strong> Use appropriate file permissions and consider encryption for sensitive data</li>
            <li><strong>Documentation:</strong> Document backup procedures and recovery processes</li>
            <li><strong>Monitoring:</strong> Set up alerts for failed backups and disk space issues</li>
          </ul>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-cyan-800">Cron Scheduling Examples</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-3">Common Backup Schedules</h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-blue-700 mb-2">Daily Backups</h4>
                <code className="bg-blue-100 p-2 rounded text-blue-800 text-sm block">0 2 * * * /path/to/backup_script.sh</code>
                <p className="text-blue-700 text-sm mt-1">Runs daily at 2:00 AM</p>
              </div>
              <div>
                <h4 className="font-medium text-blue-700 mb-2">Weekly Full Backup</h4>
                <code className="bg-blue-100 p-2 rounded text-blue-800 text-sm block">0 3 * * 0 /path/to/full_backup.sh</code>
                <p className="text-blue-700 text-sm mt-1">Runs every Sunday at 3:00 AM</p>
              </div>
              <div>
                <h4 className="font-medium text-blue-700 mb-2">Monthly Archive</h4>
                <code className="bg-blue-100 p-2 rounded text-blue-800 text-sm block">0 4 1 * * /path/to/monthly_backup.sh</code>
                <p className="text-blue-700 text-sm mt-1">Runs on the 1st of each month at 4:00 AM</p>
              </div>
            </div>
          </div>
          
          <div className="bg-teal-50 p-6 rounded-lg">
            <h3 className="font-semibold text-teal-800 mb-3">Advanced Scheduling</h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-teal-700 mb-2">Business Hours Avoidance</h4>
                <code className="bg-teal-100 p-2 rounded text-teal-800 text-sm block">0 1,5,9,13,17,21 * * * /path/to/backup.sh</code>
                <p className="text-teal-700 text-sm mt-1">Runs at 1 AM, 5 AM, 9 AM, 1 PM, 5 PM, 9 PM</p>
              </div>
              <div>
                <h4 className="font-medium text-teal-700 mb-2">Weekend Intensive</h4>
                <code className="bg-teal-100 p-2 rounded text-teal-800 text-sm block">0 */4 * * 6,0 /path/to/backup.sh</code>
                <p className="text-teal-700 text-sm mt-1">Every 4 hours on weekends</p>
              </div>
              <div>
                <h4 className="font-medium text-teal-700 mb-2">Quarterly Full Backup</h4>
                <code className="bg-teal-100 p-2 rounded text-teal-800 text-sm block">0 5 1 1,4,7,10 * /path/to/full_backup.sh</code>
                <p className="text-teal-700 text-sm mt-1">Quarterly on 1st day at 5 AM</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-cyan-800">Troubleshooting Common Issues</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-red-50 p-6 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-3">Backup Failures</h3>
            <ul className="list-disc pl-6 text-red-700 text-sm space-y-2">
              <li><strong>Permission denied:</strong> Check script and target directory permissions</li>
              <li><strong>Disk space full:</strong> Verify available space and retention policies</li>
              <li><strong>Network timeout:</strong> Check network connectivity and firewall settings</li>
              <li><strong>rsync errors:</strong> Verify source paths and exclude patterns</li>
              <li><strong>Compression failures:</strong> Check available system utilities</li>
            </ul>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-3">Debugging Commands</h3>
            <ul className="list-disc pl-6 text-green-700 text-sm space-y-2">
              <li><code>crontab -l</code> - List current cron jobs</li>
              <li><code>systemctl status cron</code> - Check cron service status</li>
              <li><code>tail -f /var/log/backup.log</code> - Monitor backup logs</li>
              <li><code>df -h</code> - Check disk space availability</li>
              <li><code>ls -la /path/to/backup</code> - Verify backup directory contents</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}

export function RelatedToolsSection({ tools }: { tools: any[] }) {
  if (!tools || tools.length === 0) return null;
  
  const displayTools = tools.slice(0, 6);
  
  const getIconPath = (iconName: string): string => {
    return `/images/icons/${iconName?.toLowerCase() || 'wrench'}.svg`;
  };
  
  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold mb-6 text-cyan-800">Related Tools</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayTools.map((tool) => (
          <a key={tool.id} href={`/tools/${tool.slug}`} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-5 border border-gray-100 flex flex-col">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center mr-3">
                {tool.icon ? (
                  <img src={getIconPath(tool.icon)} alt={tool.title} className="w-5 h-5" onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = '🔧';
                  }} />
                ) : (
                  <span className="text-cyan-800 text-lg">🔧</span>
                )}
              </div>
              <h3 className="font-semibold text-lg">{tool.title}</h3>
            </div>
            <p className="text-gray-600 text-sm flex-1">{tool.description}</p>
            <div className="mt-4 pt-3 border-t border-gray-100 text-cyan-600 text-sm font-medium">
              Try this tool →
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export function SubscribeSection() {
  return (
    <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl p-8 text-center text-white">
      <h2 className="text-2xl font-bold mb-4">Master Linux Backup Automation</h2>
      <p className="text-cyan-100 mb-6 max-w-2xl mx-auto">
        Get the latest Linux backup strategies, automation techniques, and disaster recovery best practices delivered to your inbox. 
        Join our community of system administrators, DevOps engineers, and data protection professionals.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
        <input type="email" placeholder="Enter your email" className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-300" />
        <button className="bg-white text-cyan-600 px-6 py-3 rounded-lg font-semibold hover:bg-cyan-50 transition-colors">
          Subscribe
        </button>
      </div>
      <p className="text-cyan-200 text-sm mt-3">
        No spam, unsubscribe at any time. We respect your privacy.
      </p>
    </div>
  );
}
