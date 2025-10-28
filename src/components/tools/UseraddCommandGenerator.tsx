import React from 'react';

// Hero section component
export const HeroSection = ({ title }: { title: string }) => {
  return (
    <div className="bg-blue-600 text-white py-12 px-4 rounded-lg mb-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>
        <p className="text-lg md:text-xl">
          Generate Linux useradd commands with the right options and syntax. Create user accounts
          with custom settings for home directories, shells, expiry dates, and more.
        </p>
      </div>
    </div>
  );
};

// Quick reference section component
export const QuickReferenceSection = () => {
  return (
    <div className="bg-gray-50 p-6 rounded-lg mb-10">
      <h2 className="text-xl font-semibold mb-4">Quick Reference</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-medium mb-2">Common Options</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><code>-m</code>: Create home directory</li>
            <li><code>-s</code>: Specify login shell</li>
            <li><code>-g</code>: Primary group</li>
            <li><code>-G</code>: Additional groups</li>
            <li><code>-c</code>: Comment/description</li>
            <li><code>-d</code>: Custom home directory</li>
            <li><code>-e</code>: Account expiry date</li>
          </ul>
        </div>
        <div>
          <h3 className="font-medium mb-2">Example</h3>
          <pre className="bg-gray-800 text-white p-3 rounded text-sm overflow-x-auto">
            <code>
              useradd -m -s /bin/bash -g users -G sudo,docker -c "John Doe" john
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};

// Main UseraddCommandGenerator component
export const UseraddCommandGenerator = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6">Useradd Command Generator</h2>
        
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Settings */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Settings</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username *
                </label>
                <input 
                  type="text" 
                  id="username"
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="e.g., johndoe"
                />
              </div>
              
              <div className="mb-4">
                <label className="flex items-center">
                  <input type="checkbox" id="create_home" className="mr-2" defaultChecked />
                  <span>Create home directory</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Creates the user's home directory (-m)
                </p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Home Directory
                </label>
                <input 
                  type="text" 
                  id="home_dir"
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="/home/username"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty for default (-d)
                </p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Login Shell
                </label>
                <select 
                  id="login_shell"
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="/bin/bash">/bin/bash (Default)</option>
                  <option value="/bin/sh">/bin/sh</option>
                  <option value="/bin/zsh">/bin/zsh</option>
                  <option value="/usr/bin/fish">/usr/bin/fish</option>
                  <option value="/bin/dash">/bin/dash</option>
                  <option value="/sbin/nologin">/sbin/nologin (No Login)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Shell for the user (-s)
                </p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comment/Full Name
                </label>
                <input 
                  type="text" 
                  id="comment"
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="e.g., John Doe"
                />
                <p className="text-xs text-gray-500 mt-1">
                  GECOS field, commonly used for full name (-c)
                </p>
              </div>
            </div>
            
            {/* Advanced Settings */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Advanced Settings</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Group
                </label>
                <input 
                  type="text" 
                  id="primary_group"
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="e.g., users"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Default group for new user (-g)
                </p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Groups
                </label>
                <input 
                  type="text" 
                  id="secondary_groups"
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="e.g., sudo,docker,audio"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Comma-separated list of supplementary groups (-G)
                </p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Expiry Date
                </label>
                <input 
                  type="date" 
                  id="expiry_date"
                  className="w-full p-2 border border-gray-300 rounded"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Date when account will be disabled (-e)
                </p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User ID (UID)
                </label>
                <input 
                  type="number" 
                  id="uid"
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="e.g., 1000"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Numeric user ID (-u)
                </p>
              </div>
              
              <div className="mb-4">
                <label className="flex items-center">
                  <input type="checkbox" id="system_account" className="mr-2" />
                  <span>System Account</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Create a system account (-r)
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Generated Command</h3>
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm md:text-base overflow-x-auto">
              <code id="command-output">useradd -m -s /bin/bash username</code>
            </div>
            <button 
              id="copy-button"
              className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Copy to Clipboard
            </button>
          </div>
        </div>
        
        <div className="mt-8">
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold mb-4">Post-Creation Actions</h3>
            <p className="mb-3">After creating a user, you may want to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Set a password with <code>passwd username</code></li>
              <li>Set password policies with <code>chage</code></li>
              <li>Set proper permissions for the home directory</li>
              <li>Add SSH keys if needed</li>
              <li>Set resource limits with <code>ulimit</code> or <code>/etc/security/limits.conf</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// User Information Sections component
export const UseraddInfoSections = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6">Understanding Linux User Management</h2>
        
        <div className="space-y-8">
          <section>
            <h3 className="text-xl font-semibold mb-3">User Accounts in Linux</h3>
            <p className="mb-4">
              Linux is a multi-user operating system where each user has their own unique environment. 
              User accounts are defined in several key files:
            </p>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              <li><code>/etc/passwd</code>: Contains basic user information</li>
              <li><code>/etc/shadow</code>: Contains encrypted passwords and expiry info</li>
              <li><code>/etc/group</code>: Contains group definitions</li>
              <li><code>/etc/gshadow</code>: Contains encrypted group passwords</li>
            </ul>
            <p>
              The <code>useradd</code> command is a low-level utility for creating new user accounts 
              that modifies these files and sets up the proper environment.
            </p>
          </section>
          
          <section>
            <h3 className="text-xl font-semibold mb-3">Useradd vs. Adduser</h3>
            <p className="mb-3">
              On many Linux distributions, you'll find both <code>useradd</code> and <code>adduser</code> commands:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>useradd</strong>: Low-level, binary utility that requires specific options 
                to create a fully functional user account. It's consistent across distributions 
                and offers fine-grained control.
              </li>
              <li>
                <strong>adduser</strong>: A more user-friendly Perl script (on Debian/Ubuntu) 
                that calls <code>useradd</code> under the hood, but interactively prompts for 
                information and applies sensible defaults.
              </li>
            </ul>
          </section>
          
          <section>
            <h3 className="text-xl font-semibold mb-3">Security Considerations</h3>
            <p className="mb-3">
              When creating users, consider these security best practices:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use strong passwords (or better yet, SSH keys)</li>
              <li>Assign users only to groups they need</li>
              <li>For service accounts, use system accounts with no login shell</li>
              <li>Set appropriate expiry dates for temporary accounts</li>
              <li>Configure proper password policies with <code>chage</code></li>
              <li>Consider implementing PAM limits for resource control</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

// Subscription section component for promoting newsletter
export const SubscribeSection = () => {
  return (
    <div className="bg-blue-50 p-6 rounded-lg mb-10">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold mb-3">Stay Updated with Linux Tips</h2>
        <p className="mb-4">
          Subscribe to our newsletter for the latest Linux tutorials, tools, and best practices.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            placeholder="your@email.com"
            className="flex-grow p-2 border border-gray-300 rounded"
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );
};

// Related tools section
export const RelatedToolsSection = ({ tools }: { tools: any[] }) => {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-semibold mb-6">Related Tools</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tools.map((tool, index) => (
          <a
            key={index}
            href={`/tools/${tool.slug}`}
            className="group block bg-white rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow"
          >
            <div className="p-5">
              <h3 className="font-semibold text-lg text-blue-600 group-hover:text-blue-700 mb-2">
                {tool.title}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-3">
                {tool.description}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

// Client component script to handle the dynamic functionality
export const UseraddCommandGeneratorScript = () => {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          // Wait for DOM to be fully loaded
          document.addEventListener('DOMContentLoaded', function() {
            // Get all input and select elements
            const usernameInput = document.getElementById('username');
            const createHomeCheck = document.getElementById('create_home');
            const homeDirInput = document.getElementById('home_dir');
            const loginShellSelect = document.getElementById('login_shell');
            const commentInput = document.getElementById('comment');
            const primaryGroupInput = document.getElementById('primary_group');
            const secondaryGroupsInput = document.getElementById('secondary_groups');
            const expiryDateInput = document.getElementById('expiry_date');
            const uidInput = document.getElementById('uid');
            const systemAccountCheck = document.getElementById('system_account');
            
            // Output elements
            const commandOutput = document.getElementById('command-output');
            const copyButton = document.getElementById('copy-button');
            
            // Function to generate the command
            function generateCommand() {
              const username = usernameInput.value.trim();
              
              if (!username) {
                commandOutput.textContent = 'Please enter a username';
                return;
              }
              
              let command = 'useradd';
              
              // Add options
              if (createHomeCheck.checked) {
                command += ' -m';
              }
              
              if (systemAccountCheck.checked) {
                command += ' -r';
              }
              
              const shell = loginShellSelect.value;
              if (shell) {
                command += ' -s ' + shell;
              }
              
              const homeDir = homeDirInput.value.trim();
              if (homeDir) {
                command += ' -d ' + homeDir;
              }
              
              const comment = commentInput.value.trim();
              if (comment) {
                command += ' -c "' + comment + '"';
              }
              
              const primaryGroup = primaryGroupInput.value.trim();
              if (primaryGroup) {
                command += ' -g ' + primaryGroup;
              }
              
              const secondaryGroups = secondaryGroupsInput.value.trim();
              if (secondaryGroups) {
                command += ' -G ' + secondaryGroups;
              }
              
              const expiryDate = expiryDateInput.value;
              if (expiryDate) {
                command += ' -e ' + expiryDate;
              }
              
              const uid = uidInput.value.trim();
              if (uid) {
                command += ' -u ' + uid;
              }
              
              // Add username at the end
              command += ' ' + username;
              
              // Update output
              commandOutput.textContent = command;
            }
            
            // Generate initial command
            generateCommand();
            
            // Add event listeners to all inputs
            [usernameInput, homeDirInput, loginShellSelect, commentInput, 
             primaryGroupInput, secondaryGroupsInput, expiryDateInput, uidInput].forEach(element => {
              element.addEventListener('input', generateCommand);
            });
            
            [createHomeCheck, systemAccountCheck].forEach(element => {
              element.addEventListener('change', generateCommand);
            });
            
            // Add copy to clipboard functionality
            copyButton.addEventListener('click', function() {
              const commandText = commandOutput.textContent;
              navigator.clipboard.writeText(commandText).then(function() {
                const originalText = copyButton.textContent;
                copyButton.textContent = 'Copied!';
                setTimeout(function() {
                  copyButton.textContent = originalText;
                }, 2000);
              });
            });
          });
        `
      }}
    />
  );
};

export default UseraddCommandGenerator; 