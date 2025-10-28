const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

const bluetoothctlCommand = {
  title: 'bluetoothctl',
  slug: 'bluetoothctl',
  description: 'The <code>bluetoothctl</code> command is an interactive command-line tool for controlling and managing Bluetooth devices on Linux systems. It provides a comprehensive set of functions for scanning, pairing, connecting, and configuring Bluetooth devices from the terminal.',
  syntax: 'bluetoothctl [command]',
  examples: `<h3>Basic Examples:</h3>
<pre>
# Start the interactive bluetoothctl shell
bluetoothctl

# Show information about the controller
bluetoothctl show

# List available Bluetooth devices
bluetoothctl devices

# Turn Bluetooth adapter on
bluetoothctl power on

# Make your device discoverable
bluetoothctl discoverable on

# Scan for nearby Bluetooth devices
bluetoothctl scan on
</pre>

<h3>Advanced Examples:</h3>
<pre>
# Pair with a specific device by MAC address
bluetoothctl pair 00:11:22:33:44:55

# Connect to a paired device
bluetoothctl connect 00:11:22:33:44:55

# Trust a paired device
bluetoothctl trust 00:11:22:33:44:55

# Remove a paired device
bluetoothctl remove 00:11:22:33:44:55

# Run a specific command without entering the interactive shell
bluetoothctl -- power on

# Run multiple commands in sequence
bluetoothctl -- power on discoverable on pairable on scan on

# Set the device name for your Bluetooth adapter
bluetoothctl -- system-alias "My Linux Device"

# Get information about a specific device
bluetoothctl -- info 00:11:22:33:44:55
</pre>`,
  options: `<table class="table-auto w-full">
  <thead>
    <tr>
      <th class="px-4 py-2 text-left">Command</th>
      <th class="px-4 py-2 text-left">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="border px-4 py-2"><code>help</code></td>
      <td class="border px-4 py-2">Display help for available commands</td>
    </tr>
    <tr>
      <td class="border px-4 py-2"><code>show</code></td>
      <td class="border px-4 py-2">Show controller information</td>
    </tr>
    <tr>
      <td class="border px-4 py-2"><code>list</code></td>
      <td class="border px-4 py-2">List available controllers</td>
    </tr>
    <tr>
      <td class="border px-4 py-2"><code>select</code> [addr]</td>
      <td class="border px-4 py-2">Select a specific controller by address</td>
    </tr>
    <tr>
      <td class="border px-4 py-2"><code>devices</code></td>
      <td class="border px-4 py-2">List available devices</td>
    </tr>
    <tr>
      <td class="border px-4 py-2"><code>paired-devices</code></td>
      <td class="border px-4 py-2">List paired devices</td>
    </tr>
    <tr>
      <td class="border px-4 py-2"><code>power</code> [on/off]</td>
      <td class="border px-4 py-2">Toggle power on the adapter</td>
    </tr>
    <tr>
      <td class="border px-4 py-2"><code>discoverable</code> [on/off]</td>
      <td class="border px-4 py-2">Toggle discoverable mode</td>
    </tr>
    <tr>
      <td class="border px-4 py-2"><code>pairable</code> [on/off]</td>
      <td class="border px-4 py-2">Toggle pairable mode</td>
    </tr>
    <tr>
      <td class="border px-4 py-2"><code>scan</code> [on/off]</td>
      <td class="border px-4 py-2">Scan for devices</td>
    </tr>
    <tr>
      <td class="border px-4 py-2"><code>pair</code> [MAC]</td>
      <td class="border px-4 py-2">Pair with device</td>
    </tr>
    <tr>
      <td class="border px-4 py-2"><code>trust</code> [MAC]</td>
      <td class="border px-4 py-2">Trust device</td>
    </tr>
    <tr>
      <td class="border px-4 py-2"><code>untrust</code> [MAC]</td>
      <td class="border px-4 py-2">Untrust device</td>
    </tr>
    <tr>
      <td class="border px-4 py-2"><code>block</code> [MAC]</td>
      <td class="border px-4 py-2">Block device</td>
    </tr>
    <tr>
      <td class="border px-4 py-2"><code>unblock</code> [MAC]</td>
      <td class="border px-4 py-2">Unblock device</td>
    </tr>
    <tr>
      <td class="border px-4 py-2"><code>connect</code> [MAC]</td>
      <td class="border px-4 py-2">Connect to device</td>
    </tr>
    <tr>
      <td class="border px-4 py-2"><code>disconnect</code> [MAC]</td>
      <td class="border px-4 py-2">Disconnect from device</td>
    </tr>
    <tr>
      <td class="border px-4 py-2"><code>info</code> [MAC]</td>
      <td class="border px-4 py-2">Get device information</td>
    </tr>
    <tr>
      <td class="border px-4 py-2"><code>system-alias</code> [name]</td>
      <td class="border px-4 py-2">Set the device name</td>
    </tr>
    <tr>
      <td class="border px-4 py-2"><code>remove</code> [MAC]</td>
      <td class="border px-4 py-2">Remove device</td>
    </tr>
    <tr>
      <td class="border px-4 py-2"><code>quit</code></td>
      <td class="border px-4 py-2">Exit interactive mode</td>
    </tr>
  </tbody>
</table>`,
  notes: `<h3>Important Notes:</h3>

<p>The <code>bluetoothctl</code> command provides an interactive interface for managing Bluetooth devices on Linux systems using the BlueZ stack.</p>

<p><strong>Interactive Mode:</strong></p>
<ul>
  <li>When run without arguments, bluetoothctl enters an interactive shell with a <code>[bluetooth]#</code> prompt.</li>
  <li>Commands can be entered one at a time in this interactive shell.</li>
  <li>Use <code>help</code> to see all available commands.</li>
  <li>Use <code>quit</code> or press Ctrl+D to exit the interactive shell.</li>
</ul>

<p><strong>Non-Interactive Mode:</strong></p>
<ul>
  <li>Use <code>bluetoothctl -- command1 command2 ...</code> to run commands without entering the interactive shell.</li>
  <li>This is useful for scripting and automation.</li>
</ul>

<p><strong>Common Workflow:</strong></p>
<ol>
  <li>Power on the adapter: <code>power on</code></li>
  <li>Make the adapter discoverable: <code>discoverable on</code></li>
  <li>Scan for devices: <code>scan on</code></li>
  <li>Pair with a device: <code>pair MAC_ADDRESS</code></li>
  <li>Trust the device: <code>trust MAC_ADDRESS</code></li>
  <li>Connect to the device: <code>connect MAC_ADDRESS</code></li>
</ol>

<p><strong>Troubleshooting Tips:</strong></p>
<ul>
  <li>If a device won't pair, try removing it first with <code>remove MAC_ADDRESS</code> and then pair again.</li>
  <li>Some devices require a PIN code for pairing. The PIN will be requested during the pairing process.</li>
  <li>If you're having issues with a device not connecting, ensure it's trusted with <code>trust MAC_ADDRESS</code>.</li>
  <li>Use <code>info MAC_ADDRESS</code> to get detailed information about a device's capabilities and connection status.</li>
</ul>

<p><strong>System Requirements:</strong></p>
<ul>
  <li>Requires the BlueZ package to be installed (usually included in most Linux distributions).</li>
  <li>Your system must have a Bluetooth adapter (built-in or USB dongle).</li>
  <li>You may need root privileges to perform certain operations like scanning or changing adapter settings.</li>
</ul>`,
  category: 'networking',
  platform: 'Linux',
  icon: '📱',
  published: true,
  seo_title: 'bluetoothctl - Linux Bluetooth Control Command',
  seo_description: 'Learn how to use the bluetoothctl command to manage Bluetooth devices on Linux systems, including scanning, pairing, connecting, and configuring Bluetooth devices from the terminal.',
  seo_keywords: 'linux, command, bluetoothctl, bluetooth, pairing, connection, bluez, wireless, device management'
};

async function addBluetoothctlCommand() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Check if bluetoothctl command already exists
    const commandCheck = await client.query(
      'SELECT * FROM commands WHERE slug = $1',
      ['bluetoothctl']
    );
    
    if (commandCheck.rows.length > 0) {
      console.log('bluetoothctl command already exists.');
    } else {
      // Insert bluetoothctl command
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
          bluetoothctlCommand.title,
          bluetoothctlCommand.slug,
          bluetoothctlCommand.description,
          bluetoothctlCommand.syntax,
          bluetoothctlCommand.examples,
          bluetoothctlCommand.options,
          bluetoothctlCommand.notes,
          bluetoothctlCommand.category,
          bluetoothctlCommand.platform,
          bluetoothctlCommand.icon,
          bluetoothctlCommand.published,
          bluetoothctlCommand.seo_title,
          bluetoothctlCommand.seo_description,
          bluetoothctlCommand.seo_keywords
        ]
      );
      
      console.log('bluetoothctl command added successfully:', result.rows[0].id);
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding bluetoothctl command:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  addBluetoothctlCommand();
}

// Export the command object for use in other scripts
module.exports = { bluetoothctlCommand }; 
