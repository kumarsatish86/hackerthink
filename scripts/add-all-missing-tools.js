const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'ainews',
  user: 'postgres',
  password: 'Admin1234',
});

const toolsToAdd = [
  {
    title: 'Anacron Job Generator',
    slug: 'anacron-job-generator',
    description: 'Generate anacron job configurations for daily, weekly, and monthly tasks. Create reliable scheduled jobs that run even when the system is offline.',
    icon: '⏰',
    file_path: 'src/components/tools/AnacronJobGenerator.tsx',
    seo_title: 'Anacron Job Generator - Create Reliable Scheduled Jobs',
    seo_description: 'Generate anacron job configurations for daily, weekly, and monthly tasks. Create reliable scheduled jobs that run even when the system is offline.',
    seo_keywords: 'anacron job generator, scheduled jobs, offline scheduling, daily weekly monthly tasks, linux automation, cron alternative'
  },
  {
    title: 'One-Time Job Scheduler GUI',
    slug: 'one-time-job-scheduler-gui',
    description: 'Schedule one-time jobs with a graphical interface. Generate commands for at, systemd timer, and cron scheduling methods.',
    icon: '🖥️',
    file_path: 'src/components/tools/OneTimeJobSchedulerGui.tsx',
    seo_title: 'One-Time Job Scheduler GUI - Visual Job Scheduling',
    seo_description: 'Schedule one-time jobs with a graphical interface. Generate commands for at, systemd timer, and cron scheduling methods.',
    seo_keywords: 'one-time job scheduler, gui scheduling, at command generator, systemd timer, cron job, visual scheduler'
  },

  {
    title: 'Repetitive Job Planner (At + Sleep loops)',
    slug: 'repetitive-job-planner',
    description: 'Create repetitive job scripts using at commands and sleep loops. Generate bash scripts for tasks that need to run multiple times with configurable intervals.',
    icon: '🔄',
    file_path: 'src/components/tools/RepetitiveJobPlanner.tsx',
    seo_title: 'Repetitive Job Planner - At + Sleep Loops',
    seo_description: 'Create repetitive job scripts using at commands and sleep loops. Generate bash scripts for tasks that need to run multiple times with configurable intervals.',
    seo_keywords: 'repetitive job planner, at command, sleep loops, bash scripts, interval scheduling, linux automation'
  },
  {
    title: 'Systemd Timer Unit Generator',
    slug: 'systemd-timer-unit-generator',
    description: 'Generate systemd timer and service units for scheduled tasks. Create modern Linux scheduling solutions with systemd timers.',
    icon: '⚡',
    file_path: 'src/components/tools/SystemdTimerUnitGenerator.tsx',
    seo_title: 'Systemd Timer Unit Generator - Modern Linux Scheduling',
    seo_description: 'Generate systemd timer and service units for scheduled tasks. Create modern Linux scheduling solutions with systemd timers.',
    seo_keywords: 'systemd timer generator, systemd service, linux scheduling, modern cron alternative, systemd units'
  },
  {
    title: 'Systemd Service File Generator (for timers)',
    slug: 'systemd-service-file-generator',
    description: 'Create systemd service files designed to work with timers. Generate service units with proper configuration for scheduled execution.',
    icon: '🔧',
    file_path: 'src/components/tools/SystemdServiceFileGenerator.tsx',
    seo_title: 'Systemd Service File Generator - Timer Integration',
    seo_description: 'Create systemd service files designed to work with timers. Generate service units with proper configuration for scheduled execution.',
    seo_keywords: 'systemd service generator, timer integration, service units, linux services, systemd configuration'
  },
  {
    title: 'Systemd OnCalendar String Helper',
    slug: 'systemd-oncalendar-string-helper',
    description: 'Generate and understand OnCalendar expressions for systemd timers. Create human-readable calendar-based scheduling expressions.',
    icon: '📅',
    file_path: 'src/components/tools/SystemdOnCalendarStringHelper.tsx',
    seo_title: 'Systemd OnCalendar String Helper - Calendar Scheduling',
    seo_description: 'Generate and understand OnCalendar expressions for systemd timers. Create human-readable calendar-based scheduling expressions.',
    seo_keywords: 'systemd oncalendar, calendar expressions, timer scheduling, human readable scheduling, systemd timers'
  },
  {
    title: 'Systemd Timer Simulation Tool (Next Execution Preview)',
    slug: 'systemd-timer-simulation-tool',
    description: 'Simulate systemd timer executions and preview next run times. Test your OnCalendar expressions before deployment.',
    icon: '🔮',
    file_path: 'src/components/tools/SystemdTimerSimulationTool.tsx',
    seo_title: 'Systemd Timer Simulation Tool - Execution Preview',
    seo_description: 'Simulate systemd timer executions and preview next run times. Test your OnCalendar expressions before deployment.',
    seo_keywords: 'systemd timer simulation, execution preview, next run time, timer testing, calendar validation'
  },
  {
    title: 'Systemd Timer vs Cron Visual Comparison Tool',
    slug: 'systemd-timer-vs-cron-comparison',
    description: 'Compare systemd timers and cron jobs side by side. Understand the differences and choose the right scheduling method.',
    icon: '⚖️',
    file_path: 'src/components/tools/SystemdTimerVsCronComparison.tsx',
    seo_title: 'Systemd Timer vs Cron Comparison - Choose Your Scheduler',
    seo_description: 'Compare systemd timers and cron jobs side by side. Understand the differences and choose the right scheduling method.',
    seo_keywords: 'systemd timer vs cron, scheduling comparison, linux scheduler choice, modern vs traditional, systemd benefits'
  },
  {
    title: 'Timezone Cron Adjuster (convert job to UTC)',
    slug: 'timezone-cron-adjuster',
    description: 'Convert cron expressions between different timezones. Adjust scheduled jobs for UTC or other timezone requirements.',
    icon: '🌍',
    file_path: 'src/components/tools/TimezoneCronAdjuster.tsx',
    seo_title: 'Timezone Cron Adjuster - Convert to UTC',
    seo_description: 'Convert cron expressions between different timezones. Adjust scheduled jobs for UTC or other timezone requirements.',
    seo_keywords: 'timezone cron adjuster, utc conversion, timezone scheduling, cron timezone, global scheduling'
  },
  {
    title: 'Scheduler for Holiday-Safe Execution (skip weekends/holidays)',
    slug: 'holiday-safe-scheduler',
    description: 'Create cron schedules that automatically skip weekends and holidays. Generate business-day-only scheduling expressions.',
    icon: '🎉',
    file_path: 'src/components/tools/HolidaySafeScheduler.tsx',
    seo_title: 'Holiday-Safe Scheduler - Skip Weekends and Holidays',
    seo_description: 'Create cron schedules that automatically skip weekends and holidays. Generate business-day-only scheduling expressions.',
    seo_keywords: 'holiday safe scheduler, skip weekends, business day scheduling, holiday aware cron, workday scheduling'
  },
  {
    title: 'Scheduler with Random Delay Generator',
    slug: 'scheduler-random-delay-generator',
    description: 'Generate cron schedules with random delays to prevent thundering herd problems. Add jitter to your scheduled jobs.',
    icon: '🎲',
    file_path: 'src/components/tools/RandomDelayScheduler.tsx',
    seo_title: 'Scheduler with Random Delay - Prevent Thundering Herd',
    seo_description: 'Generate cron schedules with random delays to prevent thundering herd problems. Add jitter to your scheduled jobs.',
    seo_keywords: 'random delay scheduler, thundering herd prevention, jitter scheduling, distributed cron, load distribution'
  },
  {
    title: 'Command Retry Cron Generator',
    slug: 'command-retry-cron-generator',
    description: 'Create cron jobs with intelligent retry logic and exponential backoff for failed commands. Generate retry scripts, systemd timers, and cron entries with configurable retry strategies.',
    icon: '🔄',
    file_path: 'src/components/tools/CommandRetryCronGenerator.tsx',
    seo_title: 'Command Retry Cron Generator - Create Resilient Cron Jobs with Retry Logic',
    seo_description: 'Generate cron jobs with intelligent retry mechanisms, exponential backoff, and failure handling. Create resilient scheduling solutions for Linux systems.',
    seo_keywords: 'command retry cron generator, retry logic, exponential backoff, cron job retry, systemd timer retry, bash retry script, cron failure handling, job retry mechanism, linux scheduling, resilient cron jobs'
  },
  {
    title: 'Hybrid Cron+Timer Comparator Tool',
    slug: 'hybrid-cron-timer-comparator',
    description: 'Compare traditional cron scheduling with modern systemd timers and get hybrid recommendations. Analyze your requirements to determine the best scheduling approach or combination of both methods for optimal task execution.',
    icon: '⚖️',
    file_path: 'src/components/tools/HybridCronTimerComparator.tsx',
    seo_title: 'Hybrid Cron+Timer Comparator - Choose the Best Linux Scheduling Method',
    seo_description: 'Compare cron vs systemd timer approaches and get hybrid recommendations. Analyze your requirements to determine the optimal scheduling strategy for Linux task automation.',
    seo_keywords: 'hybrid cron timer comparator, cron vs systemd timer, linux scheduling comparison, hybrid scheduling approach, cron job scheduling, systemd timer generator, linux automation, task scheduling tool, cron alternative, systemd vs cron'
  },
  {
    title: 'Generate Cron Jobs for Containerized Apps',
    slug: 'containerized-cron-job-generator',
    description: 'Create cron jobs specifically designed for containerized environments. Generate Kubernetes CronJob manifests, Docker-based cron solutions, and containerized scheduling configurations with proper resource limits, volume mounts, and environment variables.',
    icon: '🐳',
    file_path: 'src/components/tools/ContainerizedCronJobGenerator.tsx',
    seo_title: 'Containerized Cron Job Generator - Kubernetes & Docker Scheduling',
    seo_description: 'Generate cron jobs for containerized applications. Create Kubernetes CronJob manifests, Docker cron solutions, and containerized scheduling with proper resource management and volume configuration.',
    seo_keywords: 'containerized cron job generator, kubernetes cronjob, docker cron, container scheduling, kubernetes scheduling, docker scheduling, container automation, cron jobs containers, kubernetes manifests, docker compose cron'
  },
  {
    title: 'Fstab Entry Generator',
    slug: 'fstab-entry-generator',
    description: 'Generate proper /etc/fstab entries for various filesystem types. Create mount configurations with appropriate options, dump settings, and pass numbers for automatic mounting at boot time.',
    icon: '💾',
    file_path: 'src/components/tools/FstabEntryGenerator.tsx',
    seo_title: 'Fstab Entry Generator - Create Proper Mount Configurations',
    seo_description: 'Generate /etc/fstab entries for any filesystem with proper mount options, dump settings, and pass numbers for automatic boot mounting.',
    seo_keywords: 'fstab entry generator, etc fstab, mount configuration, filesystem mounting, linux mount options, fstab mount, boot mounting, filesystem configuration, mount point setup, linux filesystem'
  },
  {
    title: 'Fstab Entry Validator',
    slug: 'fstab-entry-validator',
    description: 'Validate existing /etc/fstab entries and identify potential configuration issues. Check for syntax errors, invalid mount options, missing directories, and other common problems that could prevent your system from booting properly.',
    icon: '🔍',
    file_path: 'src/components/tools/FstabEntryValidator.tsx',
    seo_title: 'Fstab Entry Validator - Check Your Mount Configuration',
    seo_description: 'Validate existing /etc/fstab entries for syntax errors, invalid mount options, missing directories, and other configuration issues that could prevent proper system boot.',
    seo_keywords: 'fstab entry validator, etc fstab validation, mount configuration checker, fstab syntax checker, mount point validator, filesystem mount validation, linux fstab checker, mount configuration validator, fstab error checker, linux boot validation'
  },
  {
    title: 'Mount Command Generator',
    slug: 'mount-command-generator',
    description: 'Generate proper mount commands for various filesystem types and scenarios. Create mount commands with appropriate options, validate syntax, and get ready-to-use commands for mounting filesystems, network shares, and special devices.',
    icon: '🔗',
    file_path: 'src/components/tools/MountCommandGenerator.tsx',
    seo_title: 'Mount Command Generator - Create Linux Mount Commands',
    seo_description: 'Generate proper mount commands for any filesystem type with appropriate options. Create commands for local filesystems, network shares, and special devices with validation.',
    seo_keywords: 'mount command generator, linux mount command, filesystem mounting, mount options, network filesystem mount, nfs mount, cifs mount, sshfs mount, linux filesystem tools, mount syntax generator'
  },
  {
    title: 'Mount Option Explainer',
    slug: 'mount-option-explainer',
    description: 'Understand what different mount options do and when to use them. Learn about performance options, security settings, network configurations, and how different options affect your filesystem behavior and system performance.',
    icon: '📚',
    file_path: 'src/components/tools/MountOptionExplainer.tsx',
    seo_title: 'Mount Option Explainer - Understand Linux Mount Options',
    seo_description: 'Learn what different mount options do and when to use them. Understand performance, security, network, and behavior options for optimal filesystem configuration.',
    seo_keywords: 'mount option explainer, linux mount options, mount option guide, filesystem mount options, mount performance options, mount security options, mount network options, linux filesystem guide, mount option reference, mount option tutorial'
  },
  {
    title: 'AutoMount Configuration Tool',
    slug: 'automount-configuration-tool',
    description: 'Configure automatic mounting of filesystems and devices at boot time. Create proper fstab entries, configure udev rules, and set up systemd mount units for seamless filesystem access without manual intervention.',
    icon: '🔧',
    file_path: 'src/components/tools/AutoMountConfigurationTool.tsx',
    seo_title: 'AutoMount Configuration Tool - Configure Automatic Filesystem Mounting',
    seo_description: 'Configure automatic mounting of filesystems and devices at boot time. Create fstab entries, udev rules, and systemd mount units for seamless filesystem access.',
    seo_keywords: 'automount configuration tool, automatic mounting, fstab configuration, udev rules, systemd mount units, boot time mounting, filesystem automation, linux mount configuration, persistent mounts, auto mount setup'
  },
  {
    title: 'Disk Labeling Tool (ext4, xfs, etc.)',
    slug: 'disk-labeling-tool',
    description: 'Label and manage filesystem labels for various filesystem types including ext4, xfs, btrfs, fat32, and ntfs. Generate commands to read, set, or remove labels with proper syntax for each filesystem type.',
    icon: '🏷️',
    file_path: 'src/components/tools/DiskLabelingTool.tsx',
    seo_title: 'Disk Labeling Tool - Manage Filesystem Labels for ext4, xfs, btrfs, and More',
    seo_description: 'Label and manage filesystem labels for various filesystem types. Generate commands to read, set, or remove labels with proper syntax for ext4, xfs, btrfs, fat32, ntfs, and other filesystems.',
    seo_keywords: 'disk labeling tool, filesystem labels, ext4 labels, xfs labels, btrfs labels, fat32 labels, ntfs labels, e2label, xfs_admin, btrfs filesystem label, fatlabel, ntfslabel, linux filesystem management, disk labels, partition labels'
  }
];

async function addAllMissingTools() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');

    let addedCount = 0;
    let skippedCount = 0;

    for (const tool of toolsToAdd) {
      try {
        // Check if tool already exists
        const checkQuery = 'SELECT id FROM tools WHERE slug = $1';
        const checkResult = await client.query(checkQuery, [tool.slug]);
        
        if (checkResult.rows.length > 0) {
          console.log(`⏭️  Skipped: ${tool.title} (already exists)`);
          skippedCount++;
          continue;
        }

        // Insert new tool
        const insertQuery = `
          INSERT INTO tools (
            title, 
            slug, 
            description, 
            icon, 
            file_path, 
            published, 
            seo_title, 
            seo_description, 
            seo_keywords, 
            created_at, 
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING id
        `;

        const values = [
          tool.title,
          tool.slug,
          tool.description,
          tool.icon,
          tool.file_path,
          true,
          tool.seo_title,
          tool.seo_description,
          tool.seo_keywords,
          new Date(),
          new Date()
        ];

        const result = await client.query(insertQuery, values);
        console.log(`✅ Added: ${tool.title} (ID: ${result.rows[0].id})`);
        addedCount++;

      } catch (error) {
        console.error(`❌ Error adding ${tool.title}:`, error.message);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Added: ${addedCount} tools`);
    console.log(`⏭️  Skipped: ${skippedCount} tools (already exist)`);
    console.log(`📝 Total processed: ${toolsToAdd.length} tools`);

  } catch (error) {
    console.error('❌ Database connection error:', error);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

addAllMissingTools();
