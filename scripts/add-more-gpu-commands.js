const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

const commands = [
  {
    title: 'nvprof',
    slug: 'nvprof',
    description: 'NVIDIA CUDA Profiler (nvprof) is a command-line profiling tool for CUDA applications. It provides detailed performance analysis including kernel execution times, memory transfers, API calls, and GPU utilization. Essential for optimizing CUDA code and identifying performance bottlenecks in GPU-accelerated applications.',
    syntax: `nvprof [options] <application> [application-arguments]

Common Options:
  -o, --output=<file>            Output file for profiling data
  --log-file=<file>              Log file path
  --csv                          Output in CSV format
  --print-gpu-trace             Print GPU trace information
  --print-api-trace             Print API call trace
  --normalize-time=<unit>       Normalize time units (us, ms, s)
  --query-metrics               List available metrics
  --metrics=<metric-list>       Specify metrics to collect
  --events=<event-list>         Specify events to collect
  --profile-child-processes     Profile child processes
  -f, --force-overwrite         Overwrite output files`,
    examples: `# Basic profiling
nvprof ./my_cuda_program

# Profile and save to file
nvprof -o profile.nvprof ./my_cuda_program

# Profile with metrics
nvprof --metrics achieved_occupancy,gld_efficiency ./my_cuda_program

# Profile with events
nvprof --events gpu__time_duration ./my_cuda_program

# Print API trace
nvprof --print-api-trace ./my_cuda_program

# Print GPU trace
nvprof --print-gpu-trace ./my_cuda_program

# Profile child processes
nvprof --profile-child-processes ./my_cuda_program

# CSV output
nvprof --csv ./my_cuda_program

# Query available metrics
nvprof --query-metrics

# Profile specific GPU
CUDA_VISIBLE_DEVICES=0 nvprof ./my_cuda_program`,
    options: `Output Options:
  -o, --output=<file>            Save profiling data to file
  --log-file=<file>              Specify log file path
  --csv                          Output in CSV format
  
Trace Options:
  --print-api-trace              Print CUDA API call trace
  --print-gpu-trace              Print GPU kernel execution trace
  
Metrics & Events:
  --query-metrics                List all available metrics
  --metrics=<list>               Comma-separated list of metrics
  --events=<list>                Comma-separated list of events
  --normalize-time=<unit>       Time unit (us, ms, s)
  
Process Options:
  --profile-child-processes      Include child processes
  
Other Options:
  -f, --force-overwrite          Overwrite existing output files
  -h, --help                     Show help`,
    notes: `**Use Cases:**
- **Performance Analysis:** Analyze CUDA kernel execution times and bottlenecks
- **Memory Optimization:** Track memory transfers and identify inefficient patterns
- **Code Optimization:** Identify slow kernels and optimize CUDA code
- **Profiling Workflows:** Generate profiling reports for performance tuning
- **API Debugging:** Trace CUDA API calls for debugging and optimization

**Common Metrics:**
- \`achieved_occupancy\` - Actual GPU occupancy achieved
- \`gld_efficiency\` - Global memory load efficiency
- \`gst_efficiency\` - Global memory store efficiency
- \`sm_efficiency\` - Streaming multiprocessor efficiency
- \`warp_execution_efficiency\` - Warp execution efficiency

**Note:** nvprof is deprecated in favor of Nsight Systems/Compute. However, it's still widely used for quick profiling. For newer systems, consider using \`nsys profile\` instead.`,
    category: 'gpu-cuda-nvidia',
    platform: 'Linux',
    icon: '📊',
    published: true,
    seo_title: 'nvprof - NVIDIA CUDA Profiler Command Guide',
    seo_description: 'Complete guide to nvprof command for profiling CUDA applications. Learn how to analyze GPU performance, kernel execution times, memory transfers, and optimize CUDA code.',
    seo_keywords: 'nvprof, cuda profiler, nvidia profiling, gpu performance analysis, cuda optimization, cuda profiling, nvidia nvprof, gpu profiling tool'
  },
  {
    title: 'deviceQuery',
    slug: 'devicequery',
    description: 'DeviceQuery is a CUDA sample utility that queries and displays detailed information about CUDA-capable GPUs in the system. It shows GPU properties, compute capability, memory configuration, and driver compatibility. Essential for verifying CUDA installation and GPU capabilities.',
    syntax: `./deviceQuery [options]

Options:
  (Typically no options - displays all GPU information)`,
    examples: `# Query all CUDA devices
./deviceQuery

# Run from CUDA samples directory
cd /usr/local/cuda/samples/1_Utilities/deviceQuery
make
./deviceQuery

# Check specific GPU count
./deviceQuery | grep "Detected"

# Display compute capability
./deviceQuery | grep "Compute Capability"

# Show CUDA version compatibility
./deviceQuery | grep "CUDA Capability"`,
    options: `deviceQuery is a sample program with minimal options.

Default Behavior:
  - Queries all CUDA-capable devices
  - Displays comprehensive GPU information
  - Shows CUDA driver and runtime versions
  
Compilation:
  make              # Compile the sample
  ./deviceQuery     # Run the query`,
    notes: `**Use Cases:**
- **CUDA Installation Verification:** Verify CUDA installation and GPU detection
- **GPU Capabilities:** Check compute capability and CUDA version support
- **Multi-GPU Systems:** Identify all CUDA-capable GPUs in the system
- **Compatibility Checking:** Verify GPU compatibility with CUDA applications
- **Hardware Information:** Get detailed GPU hardware specifications

**Information Displayed:**
- CUDA driver version
- CUDA runtime version
- Number of CUDA-capable devices
- GPU name and compute capability
- Total global memory
- Multiprocessor count
- Maximum threads per block
- Warp size
- Memory clock rate
- Memory bus width

**Note:** This is a CUDA sample that needs to be compiled. Located in \`/usr/local/cuda/samples/1_Utilities/deviceQuery\` or similar path. Part of CUDA Toolkit samples.`,
    category: 'gpu-cuda-nvidia',
    platform: 'Linux',
    icon: '🔍',
    published: true,
    seo_title: 'deviceQuery - CUDA GPU Information Query Tool Command Guide',
    seo_description: 'Complete guide to deviceQuery utility for querying CUDA GPU information. Learn how to verify CUDA installation, check GPU capabilities, and display detailed GPU hardware specifications.',
    seo_keywords: 'devicequery, cuda device query, gpu information, cuda verification, gpu capabilities, cuda installation check, nvidia gpu query'
  },
  {
    title: 'bandwidthTest',
    slug: 'bandwidthtest',
    description: 'BandwidthTest is a CUDA sample utility that measures GPU memory bandwidth and performance. It tests memory transfer speeds between host and device, and memory copy operations. Essential for benchmarking GPU memory performance and identifying memory bottlenecks.',
    syntax: `./bandwidthTest [options]

Options:
  --mode=<mode>                  Test mode (quick, shmoo)
  --device=<id>                  Specify GPU device ID
  --memory=<type>                Memory type (pinned, pageable)
  --htod                         Host to device transfer
  --dtoh                         Device to host transfer
  --dtod                         Device to device transfer`,
    examples: `# Run bandwidth test
./bandwidthTest

# Quick bandwidth test
./bandwidthTest --mode=quick

# Full shmoo test
./bandwidthTest --mode=shmoo

# Test specific GPU
./bandwidthTest --device=0

# Test host to device bandwidth
./bandwidthTest --htod

# Test device to host bandwidth
./bandwidthTest --dtoh

# Test pinned memory
./bandwidthTest --memory=pinned

# Test pageable memory
./bandwidthTest --memory=pageable`,
    options: `Test Mode Options:
  --mode=<mode>                  Test mode:
                                - quick: Fast test
                                - shmoo: Comprehensive test
  
Device Options:
  --device=<id>                  Specify GPU device ID (default: 0)
  
Memory Type Options:
  --memory=<type>                Memory type:
                                - pinned: Pinned (page-locked) memory
                                - pageable: Pageable memory
  
Transfer Direction Options:
  --htod                         Host to device transfer test
  --dtoh                         Device to host transfer test
  --dtod                         Device to device transfer test
  
Other Options:
  -h, --help                     Show help`,
    notes: `**Use Cases:**
- **Performance Benchmarking:** Measure GPU memory bandwidth and transfer speeds
- **System Tuning:** Identify memory performance bottlenecks
- **Hardware Validation:** Verify GPU memory subsystem performance
- **Optimization:** Compare pinned vs pageable memory performance
- **Multi-GPU Testing:** Test bandwidth on multiple GPUs

**Test Types:**
- **Quick Mode:** Fast bandwidth test with standard transfer sizes
- **Shmoo Mode:** Comprehensive test with varying transfer sizes
- **Pinned Memory:** Faster memory transfers using page-locked memory
- **Pageable Memory:** Standard memory transfers using pageable memory

**Performance Factors:**
- PCIe bus speed (for host-device transfers)
- GPU memory bandwidth
- Memory type (pinned vs pageable)
- Transfer size optimization

**Note:** Part of CUDA Toolkit samples. Located in \`/usr/local/cuda/samples/1_Utilities/bandwidthTest\`. Needs to be compiled before use.`,
    category: 'gpu-cuda-nvidia',
    platform: 'Linux',
    icon: '🚀',
    published: true,
    seo_title: 'bandwidthTest - CUDA Memory Bandwidth Test Command Guide',
    seo_description: 'Complete guide to bandwidthTest utility for measuring GPU memory bandwidth. Learn how to benchmark memory transfer speeds, compare pinned vs pageable memory, and optimize GPU memory performance.',
    seo_keywords: 'bandwidthtest, cuda bandwidth, gpu memory test, memory bandwidth, cuda benchmark, gpu performance test, memory transfer speed'
  },
  {
    title: 'nvidia-bug-report.sh',
    slug: 'nvidia-bug-report-sh',
    description: 'NVIDIA Bug Report script is a comprehensive diagnostic tool that collects system information, driver logs, and configuration details for bug reporting and troubleshooting. It generates a detailed report file that can be shared with NVIDIA support for issue resolution.',
    syntax: `nvidia-bug-report.sh [options]

Options:
  --output-file=<file>           Specify output file path
  --extra-system-info            Collect extra system information
  --include-kernel-logs          Include kernel logs
  --no-freeze-fix                Skip freeze fix attempt
  -h, --help                     Show help`,
    examples: `# Generate bug report
nvidia-bug-report.sh

# Save to specific file
nvidia-bug-report.sh --output-file=/tmp/nvidia-bug-report.log

# Include extra system information
nvidia-bug-report.sh --extra-system-info

# Include kernel logs
nvidia-bug-report.sh --include-kernel-logs

# Full diagnostic report
nvidia-bug-report.sh --extra-system-info --include-kernel-logs

# Generate and compress
nvidia-bug-report.sh | gzip > nvidia-bug-report.log.gz`,
    options: `Output Options:
  --output-file=<file>           Specify output file path
                                  (default: nvidia-bug-report.log)
  
Information Collection Options:
  --extra-system-info            Collect additional system information
  --include-kernel-logs          Include kernel log messages
  --no-freeze-fix                Skip automatic freeze fix attempt
  
Other Options:
  -h, --help                     Show help information`,
    notes: `**Use Cases:**
- **Bug Reporting:** Generate comprehensive reports for NVIDIA support
- **Troubleshooting:** Collect diagnostic information for driver issues
- **System Diagnostics:** Get complete system and driver state snapshot
- **Support Requests:** Provide detailed information for technical support
- **Driver Issues:** Document driver-related problems and system state

**Information Collected:**
- NVIDIA driver version and installation details
- GPU hardware information
- System configuration and kernel information
- X server configuration
- Recent driver logs and errors
- Environment variables
- Library versions
- System logs

**Note:** Requires root access to collect full system information. The generated report contains sensitive system information - review before sharing. Typically located in \`/usr/bin/nvidia-bug-report.sh\` or similar.`,
    category: 'gpu-cuda-nvidia',
    platform: 'Linux',
    icon: '🐛',
    published: true,
    seo_title: 'nvidia-bug-report.sh - NVIDIA Diagnostic Script Command Guide',
    seo_description: 'Complete guide to nvidia-bug-report.sh script for generating diagnostic reports. Learn how to collect system information, driver logs, and configuration details for NVIDIA support and troubleshooting.',
    seo_keywords: 'nvidia bug report, nvidia diagnostics, driver troubleshooting, nvidia support, bug reporting, driver logs, nvidia diagnostic tool'
  },
  {
    title: 'nvidia-healthmon',
    slug: 'nvidia-healthmon',
    description: 'NVIDIA Health Monitor (nvidia-healthmon) is a monitoring tool for NVIDIA data center GPUs that provides health status, temperature monitoring, and diagnostic information. It\'s designed for enterprise and data center environments to monitor GPU health and detect potential issues.',
    syntax: `nvidia-healthmon [options]

Common Options:
  -d, --device=<id>              Specify GPU device ID
  -t, --temperature              Display temperature information
  -p, --power                    Display power information
  -f, --frequency                Display clock frequency information
  -v, --verbose                  Verbose output
  --json                         Output in JSON format
  --daemon                       Run as daemon`,
    examples: `# Display health status for all GPUs
nvidia-healthmon

# Monitor specific GPU
nvidia-healthmon -d 0

# Display temperature
nvidia-healthmon -t

# Display power information
nvidia-healthmon -p

# Display frequency information
nvidia-healthmon -f

# Verbose output
nvidia-healthmon -v

# JSON output
nvidia-healthmon --json

# Run as monitoring daemon
nvidia-healthmon --daemon

# Continuous monitoring
watch -n 1 nvidia-healthmon`,
    options: `Device Options:
  -d, --device=<id>              Specify GPU device ID
  
Information Options:
  -t, --temperature              Display temperature monitoring
  -p, --power                    Display power consumption
  -f, --frequency                Display clock frequencies
  
Output Options:
  -v, --verbose                  Verbose output
  --json                         JSON format output
  
Daemon Options:
  --daemon                       Run as background daemon
  
Other Options:
  -h, --help                     Show help`,
    notes: `**Use Cases:**
- **Health Monitoring:** Monitor GPU health status in data center environments
- **Temperature Tracking:** Monitor GPU temperatures and detect overheating
- **Power Monitoring:** Track power consumption and efficiency
- **Frequency Monitoring:** Monitor GPU clock frequencies and performance states
- **Automated Diagnostics:** Integrate into monitoring systems

**Note:** Primarily designed for NVIDIA data center GPUs (Tesla, A100, etc.). May not be available or fully functional on consumer GPUs. Part of NVIDIA data center management tools.`,
    category: 'gpu-cuda-nvidia',
    platform: 'Linux',
    icon: '❤️',
    published: true,
    seo_title: 'nvidia-healthmon - NVIDIA Health Monitor Command Guide',
    seo_description: 'Complete guide to nvidia-healthmon command for monitoring NVIDIA GPU health. Learn how to monitor GPU temperature, power, frequency, and health status in data center environments.',
    seo_keywords: 'nvidia-healthmon, gpu health monitor, nvidia monitoring, data center gpu, gpu temperature, gpu health check, nvidia diagnostics'
  },
  {
    title: 'nvidia-xconfig',
    slug: 'nvidia-xconfig',
    description: 'NVIDIA X Config (nvidia-xconfig) is a utility that automatically configures the X server for NVIDIA GPUs. It generates or modifies X configuration files (xorg.conf) with appropriate NVIDIA driver settings. Essential for setting up multi-GPU systems, display configurations, and custom NVIDIA driver settings.',
    syntax: `nvidia-xconfig [options]

Common Options:
  --output-config=<file>         Output configuration file
  --add-xconfig=<file>          Add X config file
  --extract-edids-from-xorg      Extract EDID information
  --enable-all-gpus              Enable all detected GPUs
  --force-generate               Force configuration generation
  --busid=<busid>                Specify GPU by PCI bus ID
  --depth=<depth>                Set default color depth
  --mode=<mode>                  Set display mode
  --metamodes=<modes>            Configure MetaModes`,
    examples: `# Generate X configuration
sudo nvidia-xconfig

# Enable all GPUs
sudo nvidia-xconfig --enable-all-gpus

# Specify output file
sudo nvidia-xconfig --output-config=/etc/X11/xorg.conf

# Configure specific GPU by bus ID
sudo nvidia-xconfig --busid=PCI:1:0:0

# Set default display mode
sudo nvidia-xconfig --mode=1920x1080

# Configure MetaModes for multi-monitor
sudo nvidia-xconfig --metamodes="GPU-0.DFP-0: 1920x1080_60 +0+0"

# Extract EDID information
sudo nvidia-xconfig --extract-edids-from-xorg

# Force regeneration
sudo nvidia-xconfig --force-generate`,
    options: `File Options:
  --output-config=<file>         Output configuration file path
  --add-xconfig=<file>           Add existing X config file
  
GPU Options:
  --enable-all-gpus              Enable all detected NVIDIA GPUs
  --busid=<busid>                Specify GPU by PCI bus ID
  --twinview                     Enable TwinView mode
  
Display Options:
  --depth=<depth>                Set default color depth (8, 16, 24, 30)
  --mode=<mode>                  Set default display mode
  --metamodes=<modes>            Configure MetaModes for multi-monitor
  
EDID Options:
  --extract-edids-from-xorg      Extract EDID from X server
  
Other Options:
  --force-generate               Force configuration generation
  --help                         Show help`,
    notes: `**Use Cases:**
- **X Server Configuration:** Configure X server for NVIDIA GPUs
- **Multi-GPU Setup:** Configure systems with multiple NVIDIA GPUs
- **Display Configuration:** Set up multi-monitor and custom display modes
- **Driver Settings:** Apply custom NVIDIA driver settings to X config
- **System Setup:** Initial NVIDIA GPU configuration for X server

**Common Configurations:**
- Single GPU with single/multiple displays
- Multi-GPU systems (SLI, separate displays)
- Custom refresh rates and resolutions
- Color depth configuration
- TwinView (multi-monitor on single GPU)

**Note:** Requires root access. Modifies \`/etc/X11/xorg.conf\` or specified file. Always backup existing X configuration before running. May require X server restart to apply changes.`,
    category: 'gpu-cuda-nvidia',
    platform: 'Linux',
    icon: '⚙️',
    published: true,
    seo_title: 'nvidia-xconfig - NVIDIA X Server Configuration Command Guide',
    seo_description: 'Complete guide to nvidia-xconfig command for configuring X server with NVIDIA GPUs. Learn how to set up displays, multi-GPU systems, and customize NVIDIA driver settings for X server.',
    seo_keywords: 'nvidia-xconfig, x server configuration, nvidia display setup, xorg.conf, multi-gpu setup, nvidia driver config, display configuration'
  },
  {
    title: 'nvidia-modprobe',
    slug: 'nvidia-modprobe',
    description: 'NVIDIA Modprobe is a utility that loads NVIDIA kernel modules and creates device files with proper permissions. It ensures NVIDIA device nodes (/dev/nvidia*) are created with correct permissions for non-root users. Essential for CUDA applications and GPU access in multi-user systems.',
    syntax: `nvidia-modprobe [options]

Options:
  -c, --compute                  Create compute device nodes only
  -u, --utility                  Create utility device nodes only
  -s, --uvm                      Create UVM device nodes only
  -h, --help                     Show help`,
    examples: `# Load NVIDIA modules and create device nodes
sudo nvidia-modprobe

# Create compute device nodes
sudo nvidia-modprobe -c

# Create utility device nodes
sudo nvidia-modprobe -u

# Create UVM (Unified Virtual Memory) nodes
sudo nvidia-modprobe -s

# Create all device nodes
sudo nvidia-modprobe -c -u -s

# Check if device nodes exist
ls -la /dev/nvidia*

# Verify permissions
ls -l /dev/nvidia0`,
    options: `Device Node Options:
  -c, --compute                  Create compute device nodes (/dev/nvidia0, etc.)
  -u, --utility                  Create utility device nodes (/dev/nvidiactl, etc.)
  -s, --uvm                      Create UVM device nodes (/dev/nvidia-uvm)
  
Other Options:
  -h, --help                     Show help`,
    notes: `**Use Cases:**
- **Module Loading:** Load NVIDIA kernel modules when needed
- **Device File Creation:** Create /dev/nvidia* device files with proper permissions
- **CUDA Setup:** Ensure CUDA applications can access GPU devices
- **Multi-User Systems:** Set up proper permissions for non-root GPU access
- **System Initialization:** Configure GPU access during system boot

**Device Files Created:**
- \`/dev/nvidia0\`, \`/dev/nvidia1\`, etc. - GPU compute devices
- \`/dev/nvidiactl\` - NVIDIA control device
- \`/dev/nvidia-uvm\` - Unified Virtual Memory device
- \`/dev/nvidia-modeset\` - Mode setting device

**Permissions:**
- Typically created with 0666 permissions (read/write for all)
- May require specific group membership for restricted access
- Used by CUDA applications to communicate with GPU

**Note:** Usually runs automatically during NVIDIA driver installation. May need to run manually if device nodes are missing or after driver updates.`,
    category: 'gpu-cuda-nvidia',
    platform: 'Linux',
    icon: '📦',
    published: true,
    seo_title: 'nvidia-modprobe - NVIDIA Kernel Module Loader Command Guide',
    seo_description: 'Complete guide to nvidia-modprobe command for loading NVIDIA kernel modules and creating device files. Learn how to set up GPU device nodes for CUDA applications and multi-user access.',
    seo_keywords: 'nvidia-modprobe, nvidia kernel modules, gpu device nodes, cuda setup, nvidia device files, gpu permissions, nvidia device access'
  },
  {
    title: 'nvidia-detector',
    slug: 'nvidia-detector',
    description: 'NVIDIA Detector is a utility that detects NVIDIA GPUs in the system and provides information about driver installation status. It helps determine if NVIDIA drivers are installed and which GPUs are detected. Useful for troubleshooting driver installation and GPU detection issues.',
    syntax: `nvidia-detector [options]

Options:
  --version                      Show version
  --help                         Show help`,
    examples: `# Detect NVIDIA GPUs
nvidia-detector

# Check driver installation status
nvidia-detector

# Verify GPU detection
nvidia-detector | grep -i nvidia

# Check in scripts
if nvidia-detector > /dev/null 2>&1; then
  echo "NVIDIA GPU detected"
else
  echo "No NVIDIA GPU found"
fi`,
    options: `nvidia-detector has minimal options:

  --version                      Display version information
  --help                         Show help
  
Output:
  Prints NVIDIA GPU information and driver status
  Exits with code 0 if NVIDIA GPU found, non-zero otherwise`,
    notes: `**Use Cases:**
- **GPU Detection:** Quickly check if NVIDIA GPUs are present
- **Driver Verification:** Verify NVIDIA driver installation
- **Script Integration:** Use in scripts to detect NVIDIA hardware
- **Troubleshooting:** Diagnose GPU detection issues
- **System Setup:** Verify GPU presence during initial setup

**Output Information:**
- GPU model and vendor information
- Driver installation status
- Driver version (if installed)
- Number of detected GPUs

**Note:** Typically used in package installation scripts and system setup. Part of NVIDIA driver package utilities. May not be available on all distributions.`,
    category: 'gpu-cuda-nvidia',
    platform: 'Linux',
    icon: '🔍',
    published: true,
    seo_title: 'nvidia-detector - NVIDIA GPU Detection Tool Command Guide',
    seo_description: 'Complete guide to nvidia-detector command for detecting NVIDIA GPUs and verifying driver installation. Learn how to check GPU presence and driver status in Linux systems.',
    seo_keywords: 'nvidia-detector, gpu detection, nvidia driver check, gpu verification, nvidia hardware detection, driver installation check'
  },
  {
    title: 'prime-select',
    slug: 'prime-select',
    description: 'PRIME Select (prime-select) is a utility for managing PRIME GPU offloading on systems with both integrated and discrete NVIDIA GPUs. It allows switching between integrated GPU, NVIDIA GPU, or automatic selection for power saving and performance optimization. Common on laptops with hybrid graphics.',
    syntax: `prime-select [command]

Commands:
  query                          Query current PRIME profile
  nvidia                         Use NVIDIA GPU
  intel                          Use Intel integrated GPU
  on-demand                      Use automatic GPU selection
  offload                        Enable GPU offloading`,
    examples: `# Query current PRIME profile
sudo prime-select query

# Switch to NVIDIA GPU
sudo prime-select nvidia

# Switch to Intel integrated GPU
sudo prime-select intel

# Enable on-demand (automatic) selection
sudo prime-select on-demand

# Enable GPU offloading
sudo prime-select offload

# Check current selection
prime-select query`,
    options: `Commands:
  query                          Display current PRIME profile
  nvidia                         Set NVIDIA GPU as primary
  intel                          Set Intel integrated GPU as primary
                                (or AMD on some systems)
  on-demand                      Enable automatic GPU selection
  offload                        Enable GPU offloading mode`,
    notes: `**Use Cases:**
- **Power Management:** Switch to integrated GPU for power saving on laptops
- **Performance:** Switch to NVIDIA GPU for maximum performance
- **Hybrid Graphics:** Manage dual-GPU laptop configurations
- **Battery Life:** Optimize battery life by using integrated GPU
- **GPU Offloading:** Use PRIME offloading for specific applications

**PRIME Profiles:**
- **nvidia:** Always use NVIDIA GPU (best performance, higher power)
- **intel/amd:** Always use integrated GPU (power saving, lower performance)
- **on-demand:** Automatic selection based on application needs
- **offload:** Enable offloading for specific applications

**Common Use Cases:**
- Laptops with NVIDIA Optimus technology
- Systems with both integrated and discrete GPUs
- Battery optimization on mobile systems
- Performance optimization for GPU-intensive tasks

**Note:** Requires X server restart (typically logout/login) to apply changes. Part of NVIDIA Optimus/Linux PRIME technology. May not be available on all systems.`,
    category: 'gpu-cuda-nvidia',
    platform: 'Linux',
    icon: '🔄',
    published: true,
    seo_title: 'prime-select - PRIME GPU Selection Command Guide',
    seo_description: 'Complete guide to prime-select command for managing PRIME GPU offloading on hybrid graphics systems. Learn how to switch between NVIDIA and integrated GPUs for power saving and performance.',
    seo_keywords: 'prime-select, prime gpu, nvidia optimus, hybrid graphics, gpu switching, laptop gpu, integrated gpu, discrete gpu, power management'
  },
  {
    title: 'torchrun',
    slug: 'torchrun',
    description: 'TorchRun is PyTorch\'s distributed training launcher (replacement for torch.distributed.launch). It simplifies launching distributed PyTorch training jobs across multiple GPUs or nodes. Essential for multi-GPU training, distributed deep learning, and scaling PyTorch workloads.',
    syntax: `torchrun [options] <training_script.py> [script_args...]

Common Options:
  --nnodes=<n>                   Number of nodes
  --nproc_per_node=<n>           Processes per node (GPUs)
  --node_rank=<rank>             Node rank
  --master_addr=<addr>           Master node address
  --master_port=<port>           Master port
  --standalone                   Run in standalone mode
  --rdzv_backend=<backend>       Rendezvous backend
  --rdzv_endpoint=<endpoint>     Rendezvous endpoint`,
    examples: `# Single node, multiple GPUs
torchrun --nproc_per_node=4 train.py

# Multi-node training
torchrun --nnodes=2 --nproc_per_node=4 --master_addr=192.168.1.1 train.py

# Single GPU training
torchrun --nproc_per_node=1 train.py

# Specific GPUs
CUDA_VISIBLE_DEVICES=0,1 torchrun --nproc_per_node=2 train.py

# Standalone mode
torchrun --standalone --nproc_per_node=4 train.py

# With distributed backend
torchrun --nproc_per_node=2 --rdzv_backend=c10d train.py

# Node rank specification
torchrun --nnodes=2 --node_rank=1 --nproc_per_node=4 train.py`,
    options: `Node Configuration:
  --nnodes=<n>                   Number of nodes in cluster
  --nproc_per_node=<n>           Number of processes (GPUs) per node
  --node_rank=<rank>             Rank of current node (0-based)
  
Master Configuration:
  --master_addr=<addr>           Master node IP address
  --master_port=<port>           Master port (default: 29400)
  
Rendezvous Options:
  --rdzv_backend=<backend>       Backend (static, c10d, etcd)
  --rdzv_endpoint=<endpoint>     Rendezvous endpoint
  
Execution Options:
  --standalone                   Run in standalone mode (single node)
  --max_restarts=<n>             Maximum restart attempts
  --monitor_interval=<sec>       Health check interval
  
Other Options:
  --help                         Show help`,
    notes: `**Use Cases:**
- **Multi-GPU Training:** Launch distributed training across multiple GPUs
- **Multi-Node Training:** Scale training across multiple machines
- **Deep Learning:** Train large models requiring multiple GPUs
- **Distributed Computing:** Run distributed PyTorch workloads
- **Production Training:** Launch production ML training pipelines

**Advantages over torch.distributed.launch:**
- Better error handling and recovery
- Automatic restarts on failure
- Improved process management
- Better logging and monitoring
- More robust distributed initialization

**Common Configurations:**
- **Single Node, Multi-GPU:** \`--nproc_per_node=4\` (4 GPUs)
- **Multi-Node:** \`--nnodes=2 --nproc_per_node=4\` (2 nodes, 4 GPUs each)
- **Standalone:** \`--standalone\` for single-node setups

**Note:** Requires PyTorch with distributed support. Part of PyTorch 1.9+ (replaced torch.distributed.launch). Works with CUDA and other backends.`,
    category: 'gpu-cuda-nvidia',
    platform: 'Linux',
    icon: '🔥',
    published: true,
    seo_title: 'torchrun - PyTorch Distributed Training Launcher Command Guide',
    seo_description: 'Complete guide to torchrun command for launching distributed PyTorch training jobs. Learn how to train models across multiple GPUs and nodes with PyTorch distributed training.',
    seo_keywords: 'torchrun, pytorch distributed, multi-gpu training, distributed training, pytorch launcher, deep learning training, pytorch torchrun, gpu training'
  }
];

async function addMoreGPUCommands() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    console.log('Adding more GPU/CUDA/NVIDIA commands to database...\n');

    for (const command of commands) {
      // Check if command already exists
      const commandCheck = await client.query(
        'SELECT * FROM commands WHERE slug = $1',
        [command.slug]
      );
      
      if (commandCheck.rows.length > 0) {
        console.log('[WARN] ' + command.slug + ' command already exists. Updating...');
        
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
          WHERE slug = $14
          RETURNING *`,
          [
            command.title,
            command.description,
            command.syntax,
            command.examples,
            command.options,
            command.notes,
            command.category,
            command.platform,
            command.icon,
            command.published,
            command.seo_title,
            command.seo_description,
            command.seo_keywords,
            command.slug
          ]
        );
        
        console.log('[OK] ' + command.slug + ' command updated successfully (ID: ' + result.rows[0].id + ')');
      } else {
        // Insert new command
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
            command.title,
            command.slug,
            command.description,
            command.syntax,
            command.examples,
            command.options,
            command.notes,
            command.category,
            command.platform,
            command.icon,
            command.published,
            command.seo_title,
            command.seo_description,
            command.seo_keywords
          ]
        );
        
        console.log('[OK] ' + command.slug + ' command added successfully (ID: ' + result.rows[0].id + ')');
      }
      console.log(''); // Empty line between commands
    }

    await client.query('COMMIT');
    console.log('\n[SUCCESS] All GPU/CUDA/NVIDIA commands have been added/updated in the database!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[ERROR]', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  addMoreGPUCommands()
    .then(() => {
      console.log('\n[OK] Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[ERROR] Script failed:', error);
      process.exit(1);
    });
}

module.exports = { addMoreGPUCommands, commands };

