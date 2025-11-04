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
    title: 'nvcc',
    slug: 'nvcc',
    description: 'NVIDIA CUDA Compiler (nvcc) is a compiler driver for NVIDIA CUDA applications. It handles the compilation of CUDA source files (.cu, .cuh) into executable code that can run on NVIDIA GPUs. Essential for CUDA development and building GPU-accelerated applications.',
    syntax: `nvcc [options] <files>

Common Options:
  -o, --output-file=<file>     Specify output file name
  -I<dir>                       Add include directory
  -L<dir>                       Add library directory
  -l<lib>                       Link with library
  -arch=<arch>                  Specify compute architecture (sm_XX)
  -g, --device-debug            Enable device code debugging
  -G, --device-debug-<level>    Device debug level
  -O0, -O1, -O2, -O3           Optimization levels
  -std=<version>                C++ standard version (c++11, c++14, etc.)
  --ptx                          Generate PTX code
  --cubin                        Generate cubin file
  --fatbin                       Generate fatbin file
  -v, --verbose                 Verbose output
  -h, --help                    Show help`,
    examples: `# Compile a simple CUDA program
nvcc -o program program.cu

# Compile with specific compute capability
nvcc -arch=sm_75 -o program program.cu

# Compile with debugging enabled
nvcc -g -G -o program program.cu

# Compile with optimization level 3
nvcc -O3 -o program program.cu

# Compile multiple source files
nvcc -o program main.cu kernel.cu utils.cu

# Compile with include and library paths
nvcc -I/usr/local/cuda/include -L/usr/local/cuda/lib64 -lcudart -o program program.cu

# Generate PTX code for inspection
nvcc --ptx program.cu

# Compile for multiple architectures (fatbin)
nvcc -arch=sm_60 -arch=sm_75 -o program program.cu

# Compile with C++14 standard
nvcc -std=c++14 -o program program.cu

# Verbose compilation output
nvcc -v -o program program.cu`,
    options: `Output Options:
  -o, --output-file=<file>     Output file name
  --ptx                         Generate PTX intermediate code
  --cubin                       Generate CUDA binary
  --fatbin                      Generate fat binary (multiple archs)
  
Architecture Options:
  -arch=<arch>                  Target compute architecture (sm_XX)
  -code=<code>                   PTX/cubin code to generate
  
Debugging Options:
  -g                             Enable host debugging
  -G, --device-debug             Enable device debugging
  -lineinfo                      Generate line number information
  
Optimization Options:
  -O0, -O1, -O2, -O3           Optimization levels
  --use_fast_math                Use fast math operations
  
Include/Library Options:
  -I<dir>                        Add include directory
  -L<dir>                        Add library directory
  -l<lib>                        Link library
  --library-path=<path>          Additional library search path
  
Other Options:
  -std=<version>                 C++ standard version
  -v, --verbose                  Verbose compilation
  -h, --help                     Show help
  --version                      Show version`,
    notes: `**Use Cases:**
- **CUDA Development:** Compile CUDA kernels and host code
- **GPU Programming:** Build GPU-accelerated applications
- **Performance Optimization:** Use different optimization levels for benchmarking
- **Multi-Architecture Support:** Create binaries that run on multiple GPU generations
- **Debugging:** Generate debug symbols for CPU and GPU debugging

**Common Compute Architectures:**
- \`sm_60\` - Pascal (GTX 1080, Tesla P100)
- \`sm_70\` - Volta (Tesla V100)
- \`sm_75\` - Turing (RTX 2080, RTX 3090)
- \`sm_80\` - Ampere (A100, RTX 3090)
- \`sm_86\` - Ampere (RTX 3050, RTX 3090 Ti)
- \`sm_89\` - Ada Lovelace (RTX 4090)

**Best Practices:**
- Always specify target architecture for optimal performance
- Use \`-arch=sm_XX\` for specific GPU generation
- Enable debugging with \`-g -G\` during development
- Use \`-O3\` for production builds
- Generate PTX code to inspect kernel instructions`,
    category: 'gpu-cuda-nvidia',
    platform: 'Linux',
    icon: '⚙️',
    published: true,
    seo_title: 'nvcc - NVIDIA CUDA Compiler Command Guide',
    seo_description: 'Complete guide to nvcc command for compiling CUDA applications. Learn how to compile CUDA source files, specify GPU architectures, enable debugging, and optimize GPU-accelerated code.',
    seo_keywords: 'nvcc, cuda compiler, nvidia cuda, gpu programming, cuda development, cuda kernel, gpu acceleration, cuda compilation, nvidia development'
  },
  {
    title: 'nvidia-settings',
    slug: 'nvidia-settings',
    description: 'NVIDIA Settings is a graphical configuration tool for NVIDIA GPU drivers. It provides a GUI interface to configure display settings, GPU performance, power management, fan speeds, and other NVIDIA-specific features. Essential for GPU tuning and display configuration.',
    syntax: `nvidia-settings [options]

Common Options:
  --display=<display>           Specify X display
  --config=<file>               Use alternate config file
  --config-file=<file>          Save config to file
  --assign=<attr>=<value>       Assign attribute value
  --query=<attr>                Query attribute value
  --load-config-only            Load config and exit
  --no-config                   Don't load config file
  -a, --attr=<attr>=<value>     Assign attribute
  -q, --query=<attr>            Query attribute
  -h, --help                    Show help`,
    examples: `# Launch NVIDIA Settings GUI
nvidia-settings

# Query GPU temperature
nvidia-settings -q [gpu:0]/GPUCoreTemp

# Set GPU power limit
nvidia-settings -a "[gpu:0]/GPUPowerMizerMode=1"

# Enable performance mode
nvidia-settings -a "[gpu:0]/GPUPowerMizerMode=1"

# Set fan speed (if supported)
nvidia-settings -a "[gpu:0]/GPUFanControlState=1" -a "[fan:0]/GPUTargetFanSpeed=80"

# Query clock speeds
nvidia-settings -q [gpu:0]/GPUCurrentClockFreqs

# Enable VSync
nvidia-settings -a "[Screen0]/RegistryDwords/PerfLevelSrc=0x2222"

# Query display information
nvidia-settings -q [Display0]`,
    options: `Display Options:
  --display=<display>           X display to connect to
  --config=<file>               Configuration file path
  
Attribute Options:
  -a, --attr=<attr>=<value>     Assign attribute value
  -q, --query=<attr>            Query attribute value
  --assign=<attr>=<value>       Assign attribute (same as -a)
  
Configuration Options:
  --config-file=<file>          Save configuration to file
  --load-config-only            Load config and exit
  --no-config                   Don't load configuration file
  
Other Options:
  -h, --help                    Show help
  -v, --version                 Show version`,
    notes: `**Use Cases:**
- **Display Configuration:** Configure resolution, refresh rate, and multi-monitor setup
- **GPU Performance Tuning:** Adjust clock speeds, power limits, and performance mode
- **Fan Control:** Manually control GPU fan speeds (if supported)
- **Temperature Monitoring:** Monitor GPU temperature in real-time
- **System Integration:** Configure NVIDIA settings for specific applications

**Important Attributes:**
- \`[gpu:X]/GPUPowerMizerMode\` - Power management mode (0=Auto, 1=Performance, 2=Adaptive)
- \`[gpu:X]/GPUMemoryTransferRateOffset\` - Memory clock offset
- \`[gpu:X]/GPUGraphicsClockOffset\` - Graphics clock offset
- \`[fan:X]/GPUTargetFanSpeed\` - Target fan speed percentage
- \`[gpu:X]/GPUThermalSettings\` - Thermal settings

**Note:** Requires X server and NVIDIA driver with settings support. Some features require root access or specific driver versions.`,
    category: 'gpu-cuda-nvidia',
    platform: 'Linux',
    icon: '⚙️',
    published: true,
    seo_title: 'nvidia-settings - NVIDIA GPU Configuration Tool Command Guide',
    seo_description: 'Complete guide to nvidia-settings command for configuring NVIDIA GPUs. Learn how to adjust GPU performance, display settings, fan speeds, and power management through GUI or command line.',
    seo_keywords: 'nvidia-settings, nvidia gpu configuration, gpu tuning, display settings, nvidia fan control, gpu performance, nvidia power management, gpu overclocking'
  },
  {
    title: 'nvidia-debugdump',
    slug: 'nvidia-debugdump',
    description: 'NVIDIA Debug Dump is a utility that collects comprehensive diagnostic information about the NVIDIA driver and GPU hardware. It generates detailed reports useful for troubleshooting GPU issues, driver problems, and system diagnostics.',
    syntax: `nvidia-debugdump [options]

Common Options:
  -f, --file=<file>             Output file path
  -t, --type=<type>             Dump type (basic, full, minimal)
  -l, --log-level=<level>       Log verbosity level
  --help                        Show help`,
    examples: `# Generate basic debug dump
nvidia-debugdump

# Save to specific file
nvidia-debugdump -f /tmp/nvidia-debug.log

# Generate full diagnostic dump
nvidia-debugdump -t full

# Generate minimal dump
nvidia-debugdump -t minimal

# Generate with verbose logging
nvidia-debugdump -l verbose`,
    options: `Output Options:
  -f, --file=<file>             Specify output file path
  
Dump Type Options:
  -t, --type=<type>             Dump type:
                                - basic: Standard diagnostics
                                - full: Comprehensive information
                                - minimal: Minimal information
  
Logging Options:
  -l, --log-level=<level>       Log verbosity (error, warning, info, verbose)
  
Other Options:
  --help                        Show help`,
    notes: `**Use Cases:**
- **Troubleshooting:** Collect diagnostic information for NVIDIA support
- **Driver Issues:** Debug driver installation or compatibility problems
- **Hardware Diagnostics:** Verify GPU hardware functionality
- **System Analysis:** Analyze GPU configuration and system state
- **Bug Reporting:** Generate debug information for bug reports

**Information Collected:**
- Driver version and installation details
- GPU hardware information
- System configuration
- Recent driver logs and errors
- Kernel module information
- X server configuration

**Note:** This tool requires root access and may take several minutes to complete. The output contains sensitive system information.`,
    category: 'gpu-cuda-nvidia',
    platform: 'Linux',
    icon: '🔍',
    published: true,
    seo_title: 'nvidia-debugdump - NVIDIA Diagnostic Tool Command Guide',
    seo_description: 'Complete guide to nvidia-debugdump command for collecting NVIDIA GPU and driver diagnostic information. Learn how to generate debug reports for troubleshooting GPU issues.',
    seo_keywords: 'nvidia-debugdump, nvidia diagnostics, gpu troubleshooting, nvidia driver debug, gpu diagnostic tool, nvidia support, driver issues'
  },
  {
    title: 'nvidia-persistenced',
    slug: 'nvidia-persistenced',
    description: 'NVIDIA Persistence Daemon (nvidia-persistenced) is a daemon that maintains driver state across process terminations. It keeps the NVIDIA driver loaded even when no processes are using the GPU, reducing driver initialization overhead and improving performance for GPU applications.',
    syntax: `nvidia-persistenced [options]

Options:
  --user=<user>                 Run as specified user
  --group=<group>               Run with specified group
  --verbose                     Verbose logging
  --debug                       Debug mode
  --no-persistence-mode         Disable persistence mode
  --help                        Show help`,
    examples: `# Start persistence daemon
sudo nvidia-persistenced

# Start with verbose logging
sudo nvidia-persistenced --verbose

# Start in debug mode
sudo nvidia-persistenced --debug

# Check if daemon is running
systemctl status nvidia-persistenced

# Stop the daemon
sudo systemctl stop nvidia-persistenced

# Enable at boot
sudo systemctl enable nvidia-persistenced`,
    options: `Service Options:
  --user=<user>                 Run daemon as specified user
  --group=<group>               Run daemon with specified group
  
Logging Options:
  --verbose                     Enable verbose logging
  --debug                       Enable debug mode
  
Configuration Options:
  --no-persistence-mode         Disable persistence mode
  
Other Options:
  --help                        Show help`,
    notes: `**Use Cases:**
- **Performance Optimization:** Reduce GPU initialization latency
- **CUDA Applications:** Improve startup time for CUDA programs
- **GPU Workloads:** Maintain driver state for frequent GPU access
- **AI/ML Training:** Speed up model training initialization
- **Server Environments:** Optimize GPU server performance

**Benefits:**
- Faster GPU application startup
- Reduced driver initialization overhead
- Better performance for frequent GPU access
- Improved responsiveness for GPU workloads

**Note:** Requires root access to start. Consider enabling as a systemd service for automatic startup. The daemon consumes minimal resources and is safe to run continuously.`,
    category: 'gpu-cuda-nvidia',
    platform: 'Linux',
    icon: '🔄',
    published: true,
    seo_title: 'nvidia-persistenced - NVIDIA Persistence Daemon Command Guide',
    seo_description: 'Complete guide to nvidia-persistenced daemon for maintaining NVIDIA driver state. Learn how to reduce GPU initialization overhead and improve performance for CUDA and GPU applications.',
    seo_keywords: 'nvidia-persistenced, nvidia persistence daemon, gpu performance, cuda optimization, driver persistence, gpu startup time, nvidia daemon'
  },
  {
    title: 'lspci',
    slug: 'lspci',
    description: 'List PCI is a utility to display information about all PCI buses and devices in the system, including NVIDIA GPUs. It shows hardware details, PCI addresses, device IDs, and driver information. Essential for identifying and verifying GPU hardware on Linux systems.',
    syntax: `lspci [options]

Common Options:
  -v, --verbose                 Verbose output
  -vv                           Very verbose output
  -k, --kernel                 Show kernel drivers
  -d <vendor>:<device>          Show only specific device
  -s <bus>:<slot>.<func>        Show only specific slot
  -n, --numeric                Show numeric IDs
  -nn                           Show both numeric and names
  -t, --tree                   Show device tree
  -i <file>                     Use specified ID file`,
    examples: `# List all PCI devices
lspci

# Show verbose information
lspci -v

# Show very verbose information with drivers
lspci -vv

# Show kernel drivers for devices
lspci -k

# Find NVIDIA GPUs specifically
lspci | grep -i nvidia

# Show only GPU devices
lspci | grep -i vga

# Show device tree
lspci -t

# Show numeric IDs
lspci -n

# Show specific device
lspci -d 10de:     # All NVIDIA devices

# Show information about specific slot
lspci -s 01:00.0`,
    options: `Output Options:
  -v, --verbose                 Verbose output with more details
  -vv                           Very verbose output
  -k, --kernel                 Show kernel drivers
  
Filtering Options:
  -d <vendor>:<device>          Filter by vendor:device ID
  -s <bus>:<slot>.<func>        Filter by PCI slot
  -n, --numeric                 Show numeric IDs only
  -nn                           Show both numeric and names
  
Display Options:
  -t, --tree                    Show device tree
  -i <file>                     Use custom ID database file
  
Other Options:
  -h, --help                    Show help`,
    notes: `**Use Cases:**
- **Hardware Detection:** Identify all PCI devices including GPUs
- **GPU Verification:** Verify NVIDIA GPU presence and model
- **Driver Debugging:** Check if GPU drivers are loaded correctly
- **System Diagnostics:** Troubleshoot hardware detection issues
- **Multi-GPU Systems:** Identify all GPUs in systems with multiple cards

**Common NVIDIA Vendor IDs:**
- \`10de\` - NVIDIA Corporation
- Common device IDs: \`1b80\` (Tesla V100), \`1e30\` (RTX 3090), etc.

**Understanding Output:**
- First field: PCI address (bus:slot.function)
- Device name includes vendor and model
- Kernel driver shows loaded driver module
- Subsystem shows additional device information`,
    category: 'gpu-cuda-nvidia',
    platform: 'Linux',
    icon: '🔍',
    published: true,
    seo_title: 'lspci - List PCI Devices Command Guide for GPU Detection',
    seo_description: 'Complete guide to lspci command for listing PCI devices and detecting NVIDIA GPUs on Linux. Learn how to identify GPU hardware, verify drivers, and troubleshoot hardware detection.',
    seo_keywords: 'lspci, pci devices, gpu detection, nvidia gpu, hardware detection, linux pci, gpu verification, nvidia hardware, pci bus'
  },
  {
    title: 'lsmod',
    slug: 'lsmod',
    description: 'List Modules (lsmod) displays information about currently loaded kernel modules, including NVIDIA driver modules (nvidia, nvidia_uvm, nvidia_drm). Essential for verifying that NVIDIA drivers are properly loaded and identifying driver-related issues.',
    syntax: `lsmod

Note: lsmod takes no options (simple command)`,
    examples: `# List all loaded kernel modules
lsmod

# Show only NVIDIA modules
lsmod | grep nvidia

# Check if NVIDIA driver is loaded
lsmod | grep -E "nvidia|nouveau"

# Show module sizes and dependencies
lsmod | grep nvidia

# Monitor module loading
watch -n 1 lsmod | grep nvidia

# Count loaded modules
lsmod | wc -l

# Find specific module
lsmod | grep nvidia_uvm

# Show module details with modinfo
lsmod | grep nvidia | head -1 | awk '{print $1}' | xargs modinfo`,
    options: `lsmod has no options - it simply displays all loaded kernel modules.

Output Format:
  Module                  Size  Used by
  nvidia               12345678   45
  nvidia_uvm             456789    12
  nvidia_drm             123456     8

Columns:
  - Module: Module name
  - Size: Memory size in bytes
  - Used by: Number of processes using the module (and dependencies)`,
    notes: `**Use Cases:**
- **Driver Verification:** Verify NVIDIA drivers are loaded
- **Module Dependencies:** Check module dependencies and usage
- **Troubleshooting:** Diagnose driver loading issues
- **System Monitoring:** Monitor kernel module state
- **Resource Analysis:** Check module memory usage

**Common NVIDIA Modules:**
- \`nvidia\` - Main NVIDIA driver module
- \`nvidia_uvm\` - Unified Virtual Memory (CUDA)
- \`nvidia_drm\` - Direct Rendering Manager (X11)
- \`nvidia_modeset\` - Display modesetting
- \`nvidia_peermem\` - Peer memory support

**Troubleshooting Tips:**
- If \`nvidia\` module not found, driver may not be installed
- High "Used by" count indicates active GPU usage
- Module size shows memory footprint
- Use \`modinfo <module>\` for detailed module information`,
    category: 'gpu-cuda-nvidia',
    platform: 'Linux',
    icon: '📦',
    published: true,
    seo_title: 'lsmod - List Kernel Modules Command Guide for NVIDIA Drivers',
    seo_description: 'Complete guide to lsmod command for checking loaded kernel modules, including NVIDIA drivers. Learn how to verify NVIDIA driver installation and troubleshoot module loading issues.',
    seo_keywords: 'lsmod, kernel modules, nvidia driver, loaded modules, driver verification, nvidia modules, kernel drivers, linux modules'
  },
  {
    title: 'gpustat',
    slug: 'gpustat',
    description: 'GPUSTAT is a simple command-line utility for querying and monitoring NVIDIA GPU status. It provides a clean, colorized display of GPU utilization, memory usage, temperature, and running processes. More user-friendly alternative to nvidia-smi for quick GPU monitoring.',
    syntax: `gpustat [options]

Common Options:
  -i, --interval=<sec>          Update interval in seconds
  -c, --color                   Force colored output
  --no-color                    Disable colored output
  -u, --show-user               Show username for processes
  -p, --show-pid                Show PID for processes
  -c, --show-cmd                Show command line
  -F, --show-full-cmdline       Show full command line
  -P, --show-power              Show power draw
  -f, --loop                    Loop mode (like watch)
  --json                        Output in JSON format
  --json-raw                    Raw JSON output`,
    examples: `# Display GPU status once
gpustat

# Monitor continuously (update every 2 seconds)
gpustat -i 2

# Show with user names
gpustat -u

# Show with process IDs
gpustat -p

# Show power draw
gpustat -P

# Show all details
gpustat -u -p -P

# Loop mode (continuous monitoring)
gpustat --loop

# Output as JSON
gpustat --json

# Watch multiple GPUs
gpustat -i 1

# Show full command lines
gpustat -F`,
    options: `Display Options:
  -i, --interval=<sec>          Update interval for continuous mode
  --loop, -f                    Loop mode (continuous updates)
  
Output Format Options:
  --json                        JSON output format
  --json-raw                    Raw JSON output (no formatting)
  -c, --color                   Force colored output
  --no-color                    Disable colored output
  
Process Information Options:
  -u, --show-user               Show username for each process
  -p, --show-pid                Show process ID
  -c, --show-cmd                Show command name
  -F, --show-full-cmdline       Show full command line
  
Additional Information Options:
  -P, --show-power              Show power draw (if supported)
  
Other Options:
  -h, --help                    Show help`,
    notes: `**Use Cases:**
- **Quick GPU Monitoring:** Fast overview of GPU status
- **Development:** Monitor GPU usage during development
- **System Administration:** Track GPU utilization across users
- **Performance Analysis:** Identify GPU-intensive processes
- **Multi-GPU Systems:** Monitor multiple GPUs simultaneously

**Installation:**
\`\`\`
pip install gpustat
\`\`\`

**Advantages over nvidia-smi:**
- Cleaner, more readable output
- Color-coded status indicators
- Shows process details by default
- Built-in loop/watch mode
- JSON output for scripting

**Color Coding:**
- Green: Normal operation
- Yellow: Moderate usage
- Red: High usage or temperature
- Processes shown with color coding based on GPU usage`,
    category: 'gpu-cuda-nvidia',
    platform: 'Linux',
    icon: '📊',
    published: true,
    seo_title: 'gpustat - GPU Monitoring Tool Command Guide',
    seo_description: 'Complete guide to gpustat command for monitoring NVIDIA GPUs. Learn how to monitor GPU utilization, memory, temperature, and processes with this user-friendly alternative to nvidia-smi.',
    seo_keywords: 'gpustat, gpu monitoring, nvidia gpu status, gpu utilization, gpu processes, gpu monitoring tool, nvidia monitoring, gpu stats'
  },
  {
    title: 'glxinfo',
    slug: 'glxinfo',
    description: 'GLX Info is a utility that displays information about the OpenGL and GLX (OpenGL Extension to the X Window System) implementation. It shows GPU details, OpenGL capabilities, extensions, and rendering information. Useful for verifying GPU acceleration and OpenGL configuration.',
    syntax: `glxinfo [options]

Common Options:
  -B, --display=<display>      Specify X display
  -i, --indirect                Use indirect rendering
  -b, --brief                   Brief output
  -v, --verbose                 Verbose output
  -t, --tree                    Show extension tree
  -l, --list-extensions         List supported extensions`,
    examples: `# Show all OpenGL/GLX information
glxinfo

# Show brief information
glxinfo -b

# Show verbose information
glxinfo -v

# Check if using NVIDIA GPU
glxinfo | grep -i nvidia

# Show OpenGL vendor and renderer
glxinfo | grep -E "OpenGL vendor|OpenGL renderer"

# Show OpenGL version
glxinfo | grep "OpenGL version"

# List all extensions
glxinfo | grep "OpenGL extensions"

# Check direct rendering
glxinfo | grep "direct rendering"

# Show display information
glxinfo -B :0.0`,
    options: `Display Options:
  -B, --display=<display>      Specify X display to query
  
Rendering Options:
  -i, --indirect                Force indirect rendering
  -d, --direct                  Force direct rendering
  
Output Options:
  -b, --brief                   Brief output format
  -v, --verbose                 Verbose output
  -t, --tree                    Show extension dependency tree
  
Extension Options:
  -l, --list-extensions         List all supported extensions
  
Other Options:
  -h, --help                    Show help`,
    notes: `**Use Cases:**
- **GPU Verification:** Verify GPU acceleration is working
- **OpenGL Testing:** Check OpenGL capabilities and version
- **Driver Verification:** Confirm GPU drivers are providing OpenGL support
- **Performance Testing:** Verify hardware acceleration
- **Troubleshooting:** Diagnose rendering issues

**Key Information Displayed:**
- OpenGL vendor (NVIDIA Corporation)
- OpenGL renderer (GPU model)
- OpenGL version supported
- OpenGL shading language version
- Supported extensions
- Direct rendering status
- Display capabilities

**Important Checks:**
- "direct rendering: Yes" - Hardware acceleration enabled
- "OpenGL renderer" should show your GPU model
- OpenGL version should be recent (3.0+)
- Extensions list shows available features

**Note:** Requires X server and Mesa or NVIDIA OpenGL drivers. Part of the \`mesa-utils\` or \`glx-utils\` package.`,
    category: 'gpu-cuda-nvidia',
    platform: 'Linux',
    icon: '🖼️',
    published: true,
    seo_title: 'glxinfo - OpenGL/GLX Information Command Guide',
    seo_description: 'Complete guide to glxinfo command for checking OpenGL and GPU acceleration. Learn how to verify NVIDIA GPU rendering, OpenGL capabilities, and hardware acceleration status.',
    seo_keywords: 'glxinfo, opengl info, gpu acceleration, direct rendering, opengl version, nvidia opengl, glx extensions, gpu verification'
  },
  {
    title: 'cat /proc/driver/nvidia/gpus/*/information',
    slug: 'cat-proc-driver-nvidia-gpus-information',
    description: 'Reads detailed GPU hardware information directly from the NVIDIA driver proc filesystem. Displays comprehensive hardware details including GPU model, PCI information, IRQ details, and driver state. Provides low-level hardware information not always available through nvidia-smi.',
    syntax: `cat /proc/driver/nvidia/gpus/*/information

# For specific GPU (replace N with GPU number):
cat /proc/driver/nvidia/gpus/N/information

# Alternative using find:
find /proc/driver/nvidia/gpus -name information -exec cat {} \\;`,
    examples: `# Show information for all GPUs
cat /proc/driver/nvidia/gpus/*/information

# Show information for GPU 0
cat /proc/driver/nvidia/gpus/0/information

# Show information for GPU 1
cat /proc/driver/nvidia/gpus/1/information

# Pretty print with formatting
cat /proc/driver/nvidia/gpus/*/information | less

# Search for specific information
cat /proc/driver/nvidia/gpus/*/information | grep -i "model\|pci"

# Save to file
cat /proc/driver/nvidia/gpus/*/information > gpu-info.txt

# Monitor GPU information changes
watch -n 1 'cat /proc/driver/nvidia/gpus/*/information'`,
    options: `This is a file read operation, not a command with options.

File Path:
  /proc/driver/nvidia/gpus/<N>/information
  
  Where <N> is the GPU number (0, 1, 2, etc.)
  
  Using /*/ matches all GPUs

Common Combinations:
  - Use with grep to filter information
  - Use with less for paginated viewing
  - Use with watch for monitoring
  - Use with redirect (>) to save output`,
    notes: `**Use Cases:**
- **Hardware Details:** Get detailed GPU hardware information
- **Driver Debugging:** Verify driver recognition of GPU hardware
- **Multi-GPU Systems:** Check information for each GPU separately
- **System Diagnostics:** Low-level hardware diagnostics
- **Driver Development:** Access driver internal information

**Information Provided:**
- GPU model name and revision
- PCI bus and device information
- IRQ assignment
- Driver version and state
- Hardware capabilities
- Device power states
- Memory controller information

**Note:** Requires NVIDIA driver to be loaded. Accessible to all users but provides read-only information. The proc filesystem is virtual and created by the driver.`,
    category: 'gpu-cuda-nvidia',
    platform: 'Linux',
    icon: '📄',
    published: true,
    seo_title: 'cat /proc/driver/nvidia/gpus - GPU Hardware Information Command Guide',
    seo_description: 'Complete guide to reading NVIDIA GPU hardware information from /proc filesystem. Learn how to access detailed GPU hardware details, PCI information, and driver state for troubleshooting.',
    seo_keywords: 'nvidia proc filesystem, gpu hardware info, nvidia driver proc, gpu diagnostics, nvidia hardware details, proc driver nvidia'
  },
  {
    title: 'cat /proc/driver/nvidia/version',
    slug: 'cat-proc-driver-nvidia-version',
    description: 'Reads the NVIDIA driver version directly from the driver proc filesystem. Provides the exact driver version number loaded in the kernel, which may differ from nvidia-smi output. Essential for verifying driver installation and troubleshooting driver-related issues.',
    syntax: `cat /proc/driver/nvidia/version

# Alternative using less:
less /proc/driver/nvidia/version

# Check if file exists (driver loaded):
test -f /proc/driver/nvidia/version && cat /proc/driver/nvidia/version || echo "Driver not loaded"`,
    examples: `# Show driver version
cat /proc/driver/nvidia/version

# Check version with error handling
if [ -f /proc/driver/nvidia/version ]; then
  cat /proc/driver/nvidia/version
else
  echo "NVIDIA driver not loaded"
fi

# Pretty print version
cat /proc/driver/nvidia/version | fmt

# Compare with nvidia-smi version
echo "Driver (proc): $(cat /proc/driver/nvidia/version)"
echo "Driver (smi): $(nvidia-smi --query-gpu=driver_version --format=csv,noheader)"`,
    options: `This is a file read operation, not a command with options.

File Path:
  /proc/driver/nvidia/version

Common Combinations:
  - Use with test or [ ] to check if driver is loaded
  - Use with echo for formatted output
  - Use with grep to extract specific information
  - Compare with nvidia-smi output`,
    notes: `**Use Cases:**
- **Driver Verification:** Verify NVIDIA driver is loaded
- **Version Checking:** Check exact driver version number
- **Troubleshooting:** Verify driver installation correctness
- **Scripting:** Use in scripts to check driver availability
- **Compatibility:** Verify driver version for compatibility checks

**Output Format:**
Typically shows version as:
  NVRM version: NVIDIA UNIX x86_64 Kernel Module  <version>  <date>

**Important Notes:**
- File only exists if NVIDIA driver is loaded
- Version may differ from package manager version
- Shows the actual running driver version
- Useful for troubleshooting driver mismatches

**Troubleshooting:**
- If file doesn't exist, driver module not loaded
- Check with \`lsmod | grep nvidia\` to verify module loading
- Compare with \`nvidia-smi\` version output
- Verify driver installation with \`dpkg -l | grep nvidia\` (Debian/Ubuntu)`,
    category: 'gpu-cuda-nvidia',
    platform: 'Linux',
    icon: '📄',
    published: true,
    seo_title: 'cat /proc/driver/nvidia/version - Driver Version Check Command Guide',
    seo_description: 'Complete guide to checking NVIDIA driver version from /proc filesystem. Learn how to verify driver installation, check driver version, and troubleshoot driver loading issues.',
    seo_keywords: 'nvidia driver version, driver verification, proc nvidia version, driver check, nvidia kernel module, driver troubleshooting'
  },
  {
    title: 'watch -n 1 nvidia-smi',
    slug: 'watch-nvidia-smi',
    description: 'Monitor NVIDIA GPU status continuously using the watch command with nvidia-smi. Updates the display every second (or specified interval) to show real-time GPU utilization, memory usage, temperature, and processes. Essential for real-time GPU monitoring during training, rendering, or other GPU-intensive tasks.',
    syntax: `watch -n <interval> nvidia-smi [nvidia-smi options]

Common Options:
  -n, --interval=<sec>          Update interval (default 2 seconds)
  -d, --differences              Highlight differences
  -c, --color                    Use colors (if supported)
  --no-title                     Hide header
  -b, --beep                     Beep on command exit
  -e, --errexit                  Exit on error`,
    examples: `# Monitor every 1 second
watch -n 1 nvidia-smi

# Monitor every 2 seconds (default)
watch -n 2 nvidia-smi

# Monitor with differences highlighted
watch -d -n 1 nvidia-smi

# Monitor specific GPU
watch -n 1 nvidia-smi -i 0

# Monitor with custom query
watch -n 1 'nvidia-smi --query-gpu=utilization.gpu,memory.used,temperature.gpu --format=csv'

# Monitor in compact format
watch -n 1 'nvidia-smi --query-gpu=index,name,utilization.gpu,memory.used --format=csv,noheader'

# Monitor with color (if supported)
watch -c -n 1 nvidia-smi

# Monitor without title bar
watch --no-title -n 1 nvidia-smi`,
    options: `Watch Options:
  -n, --interval=<sec>          Update interval in seconds (default: 2)
  -d, --differences             Highlight changes between updates
  -c, --color                    Force colored output
  --no-title                    Hide header/title bar
  -b, --beep                     Beep when command exits
  -e, --errexit                  Exit if command fails
  
NVIDIA-SMI Options:
  (All standard nvidia-smi options can be used)
  -i, --id=<GPU_ID>             Monitor specific GPU
  -q, --query-gpu=<query>       Query specific attributes
  -f, --filename=<file>         (Note: watch updates will overwrite)
  -l, --loop=<sec>               Not needed with watch
  --format=<format>             Output format`,
    notes: `**Use Cases:**
- **Real-time Monitoring:** Continuous GPU monitoring during workloads
- **Training Monitoring:** Watch GPU during ML model training
- **Performance Analysis:** Monitor GPU usage patterns over time
- **Troubleshooting:** Real-time diagnostics during issues
- **Resource Management:** Track GPU utilization in multi-user systems

**Best Practices:**
- Use \`-n 1\` for real-time monitoring (1 second updates)
- Use \`-d\` to highlight changes between updates
- Combine with nvidia-smi query options for custom views
- Press Ctrl+C to exit watch mode
- Consider using \`gpustat --loop\` as an alternative

**Comparison:**
- \`watch nvidia-smi\`: Full nvidia-smi output updated periodically
- \`gpustat --loop\`: Cleaner, more compact output
- \`nvidia-smi -l 1\`: Built-in loop mode (similar to watch)

**Note:** watch is part of the \`procps\` package and should be available on most Linux distributions.`,
    category: 'gpu-cuda-nvidia',
    platform: 'Linux',
    icon: '👁️',
    published: true,
    seo_title: 'watch nvidia-smi - Real-time GPU Monitoring Command Guide',
    seo_description: 'Complete guide to using watch command with nvidia-smi for real-time GPU monitoring. Learn how to continuously monitor GPU utilization, memory, temperature, and processes.',
    seo_keywords: 'watch nvidia-smi, gpu monitoring, real-time gpu, continuous monitoring, gpu utilization, nvidia-smi watch, gpu status monitoring'
  }
];

async function addGPUCommands() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    console.log('Adding GPU/CUDA/NVIDIA commands to database...\n');

    for (const command of commands) {
      // Check if command already exists
      const commandCheck = await client.query(
        'SELECT * FROM commands WHERE slug = $1',
        [command.slug]
      );
      
      if (commandCheck.rows.length > 0) {
        console.log(`⚠️  ${command.slug} command already exists. Updating...`);
        
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
        
        console.log(`✅ ${command.slug} command updated successfully (ID: ${result.rows[0].id})`);
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
        
        console.log(`✅ ${command.slug} command added successfully (ID: ${result.rows[0].id})`);
      }
      console.log(''); // Empty line between commands
    }

    await client.query('COMMIT');
    console.log('\n🎉 All GPU/CUDA/NVIDIA commands have been added/updated in the database!');
    
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
  addGPUCommands()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { addGPUCommands, commands };

