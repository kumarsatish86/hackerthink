import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import React from 'react';
import BackToTopButton from '../../../components/BackToTopButton';
import CommandText from '../../../components/CommandText';
import FormattedContent from '../../../components/FormattedContent';
import CommandStructuredData from '@/components/SEO/CommandStructuredData';
import styles from '../../../styles/commands.module.css';

// Define command type
interface Command {
  id: number;
  title: string;
  slug: string;
  description: string;
  syntax: string;
  examples: string;
  options: string;
  notes: string;
  category: string;
  platform: string;
  icon: string;
  file_path: string;
  published: boolean;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  schema_json?: string;
  content?: string;
  related_commands?: string[];
  created_at: string;
  updated_at: string;
}

// Define separate interfaces for clarity
interface UseCase {
  title: string;
  description: string;
}

// Define interfaces for our data structures
interface UseCase {
  title: string;
  description: string;
}

// Create RELATED_COMMANDS as a separate object with correct typing
const RELATED_COMMANDS: Record<string, string[]> = {
  'abort': ['kill', 'killall', 'pkill', 'gdb', 'coredumpctl', 'ulimit', 'crash'],
  'ab': ['curl', 'wget', 'httpie', 'apache2ctl', 'a2enmod', 'a2ensite', 'httperf'],
  'ac': ['last', 'lastb', 'who', 'w', 'finger', 'lastlog', 'sa', 'accton', 'utmpdump'],
  'access': ['test', 'stat', 'ls', 'chmod', 'chown', 'find', 'getfacl', 'setfacl'],
  'aclocal': ['autoconf', 'automake', 'autoreconf', 'libtool', 'autoscan', 'autoheader', 'm4'],
  'add-apt-repository': ['apt', 'apt-get', 'apt-key', 'apt-cache', 'sources.list', 'aptitude', 'dpkg'],
  'addgroup': ['groupadd', 'usermod', 'adduser', 'delgroup', 'groupdel', 'groupmod', 'groups'],
  'adduser': ['useradd', 'usermod', 'passwd', 'addgroup', 'deluser', 'userdel', 'chage'],
  'alias': ['unalias', 'bash', 'zsh', 'source', 'type', 'which', 'command', 'function', 'export'],
  'alsamixer': ['amixer', 'aplay', 'arecord', 'alsactl', 'pactl', 'pavucontrol', 'pulseaudio'],
  'amixer': ['alsamixer', 'alsactl', 'aplay', 'arecord', 'pactl', 'pacmd', 'pavucontrol'],
  'anacron': ['cron', 'crontab', 'at', 'systemd-run', 'systemctl', 'atq', 'atrm', 'batch'],
  'apt': ['apt-get', 'apt-cache', 'dpkg', 'aptitude', 'add-apt-repository', 'apt-key', 'apt-mark'],
  'apt-cache': ['apt', 'apt-get', 'dpkg', 'aptitude', 'apt-file', 'apt-mark', 'apt-key'],
  'apt-get': ['apt', 'apt-cache', 'dpkg', 'aptitude', 'apt-file', 'apt-mark', 'apt-key'],
  'apt-key': ['apt', 'apt-get', 'gpg', 'apt-cache', 'dpkg', 'aptitude', 'add-apt-repository'],
  'apt-mark': ['apt', 'apt-get', 'dpkg', 'apt-cache', 'aptitude', 'apt-file', 'apt-key'],
  'arch': ['uname', 'dpkg', 'rpm', 'lscpu', 'getconf', 'file', 'machine'],
  'arecord': ['aplay', 'alsamixer', 'amixer', 'alsactl', 'pactl', 'pavucontrol', 'ffmpeg'],
  'arp': ['ip', 'ifconfig', 'netstat', 'ping', 'arping', 'tcpdump', 'nmap', 'route'],
  'arping': ['ping', 'arp', 'ip', 'nmap', 'arp-scan', 'tcpdump', 'traceroute', 'ifconfig'],
  'as': ['gcc', 'ld', 'objdump', 'nm', 'gdb', 'readelf', 'ar', 'strip'],
  'aspell': ['ispell', 'hunspell', 'spell', 'grep', 'sed', 'awk', 'languagetool'],
  'at': ['atq', 'atrm', 'batch', 'cron', 'crontab', 'anacron', 'systemd-run', 'sleep'],
  'atq': ['at', 'atrm', 'batch', 'cron', 'crontab', 'anacron', 'systemd-run', 'sleep'],
  'atrm': ['at', 'atq', 'batch', 'cron', 'crontab', 'anacron', 'systemd-run', 'sleep'],
  'basename': ['dirname', 'realpath', 'pwd', 'readlink', 'find', 'path', 'ls', 'cd'],
  'bash': ['sh', 'zsh', 'fish', 'dash', 'csh', 'ksh', 'alias', 'source', 'exec'],
  'batch': ['at', 'atq', 'atrm', 'cron', 'crontab', 'anacron', 'systemd-run', 'nice'],
  'bc': ['dc', 'expr', 'calc', 'awk', 'sed', 'printf', 'numfmt', 'python'],
  'beep': ['play', 'aplay', 'speaker-test', 'espeak', 'paplay', 'echo', 'notify-send', 'tput'],
  'bg': ['fg', 'jobs', 'kill', 'wait', 'disown', 'nohup', 'screen', 'tmux'],
  'blkid': ['lsblk', 'fdisk', 'mount', 'findfs', 'parted', 'df', 'blockdev', 'tune2fs'],
  'blockdev': ['hdparm', 'sdparm', 'blkid', 'lsblk', 'fdisk', 'sfdisk', 'parted', 'dd'],
  'blogbench': ['fio', 'dd', 'hdparm', 'bonnie++', 'iozone', 'sysbench', 'iostat', 'nmon'],
  'bluetoothctl': ['rfkill', 'hcitool', 'hciconfig', 'bluez', 'l2ping', 'btmon', 'blueman', 'bt-device'],
  'break': ['continue', 'exit', 'return', 'for', 'while', 'until', 'if', 'case'],
  'brctl': ['bridge', 'ip', 'ifconfig', 'networkctl', 'nmcli', 'iptables', 'ebtables', 'ethtool'],
  'bridge': ['brctl', 'ip', 'ifconfig', 'vlan', 'nmcli', 'networkctl', 'iptables', 'tc'],
  'btrfs': ['mkfs.btrfs', 'mount', 'lsblk', 'fdisk', 'df', 'tune2fs', 'fsck.btrfs', 'findmnt'],
  'bunzip2': ['bzip2', 'bzcat', 'bzcmp', 'gzip', 'gunzip', 'xz', 'unxz', 'tar'],
  'bzcat': ['bunzip2', 'bzip2', 'bzcmp', 'zcat', 'gzcat', 'xzcat', 'cat', 'less'],
  'bzcmp': ['bunzip2', 'bzip2', 'bzcat', 'cmp', 'diff', 'zdiff', 'bzdiff', 'xzdiff'],
  'bzdiff': ['bzcmp', 'bzgrep', 'bunzip2', 'bzip2', 'bzcat', 'diff', 'zdiff', 'xzdiff'],
  'bzgrep': ['bzcat', 'bzip2', 'bunzip2', 'bzcmp', 'bzdiff', 'grep', 'zgrep', 'xzgrep'],
  'bzless': ['bzmore', 'less', 'zless', 'xzless', 'bzcat', 'bunzip2', 'bzip2', 'pager'],
  'bzmore': ['bzless', 'more', 'zmore', 'xzmore', 'bzcat', 'bunzip2', 'bzip2', 'pager'],
  'bzip2': ['bunzip2', 'bzcat', 'bzcmp', 'gzip', 'xz', 'zip', 'tar', 'compress'],
  'bzip2recover': ['bzip2', 'bunzip2', 'bzcat', 'bzcmp', 'bzdiff', 'bzgrep', 'gzip', 'xz'],
  'cal': ['date', 'ncal', 'gcal', 'calendar', 'when', 'time', 'clock', 'reminder'],
  'cat': ['grep', 'head', 'tail', 'less', 'more', 'tac', 'tee'],
  'cfdisk': ['fdisk', 'parted', 'gdisk', 'sfdisk', 'gparted', 'mkfs', 'mount', 'lsblk'],
  'chage': ['passwd', 'usermod', 'useradd', 'userdel', 'shadow', 'pwck', 'pwconv', 'getent'],
  'chattr': ['lsattr', 'chmod', 'chown', 'ls', 'find', 'stat', 'setfacl', 'getfacl'],
  'chgrp': ['chown', 'chmod', 'ls', 'stat', 'id', 'groups', 'usermod', 'groupmod'],
  'chmod': ['chown', 'chgrp', 'umask', 'ls', 'stat', 'setfacl', 'getfacl', 'acl'],
  'chown': ['chgrp', 'chmod', 'ls', 'stat', 'id', 'usermod', 'groupmod', 'find'],
  'chpasswd': ['passwd', 'chage', 'usermod', 'newusers', 'shadow', 'crypt', 'pwconv', 'pwunconv'],
  'chroot': ['mount', 'pivot_root', 'unshare', 'jail', 'namespace', 'systemd-nspawn', 'lxc-execute', 'docker'],
  'chkconfig': ['systemctl', 'service', 'update-rc.d', 'rc-update', 'insserv', 'ntsysv', 'init.d', 'runlevel'],
  'cksum': ['md5sum', 'sha1sum', 'sha256sum', 'sum', 'wc', 'cmp', 'diff', 'b2sum'],
  'clear': ['reset', 'tput', 'echo', 'cls', 'screen', 'tmux', 'stty', 'tset'],
  'cmp': ['diff', 'comm', 'colordiff', 'vimdiff', 'sdiff', 'cksum', 'md5sum', 'sha256sum'],
  'comm': ['diff', 'cmp', 'uniq', 'sort', 'join', 'sdiff', 'vimdiff', 'colordiff'],
  'command': ['type', 'which', 'whereis', 'hash', 'alias', 'exec', 'eval', 'source'],
  'compress': ['uncompress', 'zcat', 'gzip', 'gunzip', 'bzip2', 'bunzip2', 'xz', 'unxz'],
  'cpio': ['tar', 'find', 'ar', 'rpm', 'dump', 'restore', 'gzip', 'dd'],
  'crontab': ['at', 'batch', 'anacron', 'systemd-run', 'systemctl', 'systemd-timer', 'sleep', 'watch'],
  'csplit': ['split', 'cut', 'sed', 'awk', 'grep', 'head', 'tail', 'cat'],
  'cut': ['awk', 'sed', 'tr', 'paste', 'join', 'column', 'grep', 'colrm'],
  'cvt': ['xrandr', 'gtf', 'fbset', 'xdpyinfo', 'xvinfo', 'glxinfo', 'Xorg', 'xinput'],
  'curl': ['wget', 'httpie', 'lynx', 'aria2c', 'fetch', 'http', 'nc', 'telnet'],
  'date': ['cal', 'time', 'timedatectl', 'hwclock', 'chrony', 'ntpdate', 'tzselect', 'strftime'],
  'dc': ['bc', 'expr', 'calc', 'awk', 'sed', 'python', 'numfmt', 'printf'],
  'debootstrap': ['chroot', 'apt', 'dpkg', 'apt-get', 'schroot', 'pbuilder', 'lxc', 'docker'],
  'declare': ['typeset', 'export', 'local', 'readonly', 'set', 'unset', 'env', 'printenv'],
  'deluser': ['userdel', 'adduser', 'useradd', 'delgroup', 'groupdel', 'passwd', 'usermod', 'gpasswd'],
  'delgroup': ['groupdel', 'addgroup', 'groupadd', 'deluser', 'useradd', 'usermod', 'groups', 'gpasswd'],
  'depmod': ['modprobe', 'insmod', 'lsmod', 'rmmod', 'modinfo', 'kmod', 'dkms', 'uname'],
  'df': ['du', 'lsblk', 'mount', 'fdisk', 'free', 'quota', 'findmnt', 'stat'],
  'diff': ['diff3', 'cmp', 'comm', 'colordiff', 'vimdiff', 'sdiff', 'patch', 'git diff'],
  'diff3': ['diff', 'sdiff', 'merge', 'patch', 'git merge', 'vimdiff', 'cmp', 'colordiff'],
  'dig': ['host', 'nslookup', 'drill', 'ping', 'whois', 'traceroute', 'route', 'ip'],
  'dir': ['ls', 'vdir', 'find', 'tree', 'pwd', 'file', 'stat', 'find'],
  'dircolors': ['ls', 'dir', 'vdir', 'grep', 'less', 'more', 'LS_COLORS', 'console_codes'],
  'dirname': ['basename', 'realpath', 'pwd', 'readlink', 'find', 'path', 'cd', 'ls'],
  'dirs': ['pushd', 'popd', 'cd', 'pwd', 'ls', 'find', 'tree', 'path'],
  'dmesg': ['journalctl', 'logread', 'syslog', 'tail', 'less', 'grep', 'lsmod', 'uname'],
  'dmidecode': ['lshw', 'hwinfo', 'lscpu', 'lspci', 'lsusb', 'inxi', 'uname', 'biosdecode'],
  'dmsetup': ['lvm', 'lvs', 'vgs', 'pvs', 'cryptsetup', 'lsblk', 'fdisk', 'blkid'],
  'dos2unix': ['unix2dos', 'iconv', 'sed', 'awk', 'tr', 'file', 'hexdump', 'fromdos'],
  'du': ['df', 'ncdu', 'ls', 'find', 'sort', 'xargs', 'stat', 'baobab'],
  'dump': ['restore', 'tar', 'cpio', 'mt', 'rsync', 'dd', 'fsck', 'tune2fs'],
  'dumpe2fs': ['fsck', 'e2fsck', 'tune2fs', 'debugfs', 'e2image', 'mount', 'df', 'blkid'],
  'ed': ['vi', 'ex', 'sed', 'awk', 'grep', 'cat', 'more', 'less'],
  'egrep': ['grep', 'fgrep', 'rgrep', 'sed', 'awk', 'find', 'locate', 'strings'],
  'eject': ['mount', 'umount', 'hdparm', 'sdparm', 'cdrecord', 'cdparanoia', 'wodim', 'udisksctl'],
  'enable': ['bash', 'builtin', 'command', 'type', 'which', 'alias', 'source', 'export'],
  'env': ['printenv', 'export', 'set', 'unset', 'bash', 'sh', 'echo', 'source'],
  'ethtool': ['ifconfig', 'ip', 'iwconfig', 'mii-tool', 'tc', 'netstat', 'nmcli', 'iw'],
  'eval': ['source', 'exec', 'bash', 'sh', 'command', 'type', 'alias', 'set'],
  'exec': ['bash', 'sh', 'source', 'eval', 'command', 'fork', 'exit', 'wait'],
  'exit': ['return', 'trap', 'bash', 'sh', 'logout', 'kill', 'status', 'echo $?'],
  'export': ['env', 'printenv', 'set', 'unset', 'declare', 'bash', 'source', 'echo'],
  'ls': ['cd', 'pwd', 'find', 'tree', 'dir'],
  'grep': ['awk', 'sed', 'cat', 'find', 'xargs', 'egrep', 'fgrep', 'rgrep'],
  'cd': ['pwd', 'ls', 'pushd', 'popd', 'dirs'],
  'mkdir': ['rmdir', 'touch', 'cp', 'mv', 'ls'],
  'rmdir': ['mkdir', 'rm', 'find', 'ls', 'cd'],
  'rm': ['rmdir', 'mkdir', 'find', 'mv', 'shred'],
  'find': ['locate', 'grep', 'xargs', 'ls', 'rm'],
  'awk': ['grep', 'sed', 'cut', 'perl', 'tr', 'xargs'],
  'sed': ['awk', 'grep', 'tr', 'cut', 'perl', 'vim'],
  'tr': ['sed', 'awk', 'cut', 'grep', 'col', 'expand'],
  'col': ['tr', 'expand', 'unexpand', 'nroff', 'groff', 'man'],
  'expand': ['unexpand', 'col', 'tr', 'sed', 'pr', 'fmt'],
  'unexpand': ['expand', 'col', 'tr', 'sed', 'pr', 'fmt'],
  'pr': ['expand', 'unexpand', 'fmt', 'fold', 'nl', 'lp', 'cat'],
  'fmt': ['pr', 'fold', 'expand', 'unexpand', 'sed', 'awk', 'groff'],
  'groff': ['nroff', 'troff', 'man', 'tbl', 'eqn', 'pic', 'refer'],
  'nroff': ['groff', 'troff', 'man', 'col', 'tbl', 'eqn', 'pic'],
  'troff': ['groff', 'nroff', 'dpost', 'man', 'tbl', 'eqn', 'pic'],
  'man': ['info', 'apropos', 'whatis', 'groff', 'nroff', 'less', 'help'],
  'info': ['man', 'pinfo', 'apropos', 'whatis', 'help', 'texinfo', 'makeinfo'],
  'whatis': ['man', 'apropos', 'info', 'makewhatis', 'mandb', 'help', 'pinfo'],
  'help': ['man', 'info', 'whatis', 'apropos', 'type', 'which', 'whereis'],
  'apropos': ['man', 'whatis', 'info', 'help', 'mandb', 'makewhatis', 'find'],
  'mandb': ['man', 'whatis', 'apropos', 'makewhatis', 'catman', 'updatedb'],
  'updatedb': ['locate', 'find', 'which', 'whereis', 'slocate', 'mlocate', 'cron'],
  'locate': ['updatedb', 'find', 'which', 'whereis', 'slocate', 'mlocate', 'grep'],
  'mlocate': ['locate', 'updatedb', 'find', 'which', 'whereis', 'slocate', 'grep'],
  'which': ['whereis', 'type', 'command', 'locate', 'find', 'echo', 'PATH'],
  'echo': ['printf', 'cat', 'tee', 'yes', 'write', 'bash', 'variables'],
  'tee': ['cat', 'echo', 'script', 'logger', 'dd', 'grep', 'pipe'],
  'dd': ['cp', 'cat', 'dcfldd', 'ddrescue', 'pv', 'tar', 'gzip'],
  'cp': ['mv', 'rsync', 'dd', 'scp', 'tar', 'ln', 'install'],
  'mv': ['cp', 'rm', 'rename', 'rsync', 'mmv', 'install', 'ln'],
  'ps': ['top', 'htop', 'pgrep', 'pkill', 'kill', 'nice', 'renice', 'pstree'],
  'top': ['ps', 'htop', 'vmstat', 'free', 'uptime', 'kill', 'nice', 'renice'],
  'htop': ['top', 'ps', 'pstree', 'kill', 'nice', 'renice', 'free', 'vmstat'],
  'kill': ['pkill', 'killall', 'ps', 'top', 'htop', 'pgrep', 'xkill', 'fuser'],
  'killall': ['kill', 'pkill', 'pgrep', 'ps', 'top', 'htop', 'xkill', 'fuser'],
  'rsync': ['scp', 'cp', 'mv', 'tar', 'ssh', 'sftp', 'dd'],
  'scp': ['rsync', 'cp', 'sftp', 'ssh', 'tar', 'nc', 'curl'],
  'sftp': ['scp', 'rsync', 'ssh', 'ftp', 'cp', 'curl', 'wget'],
  'ssh': ['scp', 'sftp', 'rsync', 'ssh-keygen', 'ssh-copy-id', 'ssh-agent', 'ssh-add'],
  'ssh-keygen': ['ssh', 'ssh-copy-id', 'ssh-agent', 'ssh-add', 'scp', 'sftp', 'ssh-import-id'],
  'ssh-add': ['ssh', 'ssh-keygen', 'ssh-agent', 'ssh-copy-id', 'scp', 'sftp', 'ssh-import-id'],
  'ssh-agent': ['ssh-add', 'ssh', 'ssh-keygen', 'ssh-copy-id', 'scp', 'sftp', 'ssh-import-id'],
  'ssh-copy-id': ['ssh', 'ssh-keygen', 'ssh-agent', 'ssh-add', 'scp', 'sftp', 'authorized-keys'],
  'authorized-keys': ['ssh', 'ssh-keygen', 'ssh-copy-id', 'ssh-agent', 'ssh-add', 'scp', 'sftp'],
  'wget': ['curl', 'aria2', 'httrack', 'lynx', 'ftp', 'scp', 'sftp', 'youtube-dl'],
  'ftp': ['sftp', 'scp', 'rsync', 'wget', 'curl', 'ssh', 'nc', 'lftp'],
  'a2enmod': ['a2dismod', 'a2ensite', 'a2dissite', 'a2enconf', 'a2disconf', 'apache2ctl', 'systemctl'],
  'a2ensite': ['a2dissite', 'a2enmod', 'a2dismod', 'a2enconf', 'a2disconf', 'apache2ctl', 'systemctl'],
  'a2dismod': ['a2enmod', 'a2ensite', 'a2dissite', 'a2enconf', 'a2disconf', 'apache2ctl', 'systemctl'],
  'a2dissite': ['a2ensite', 'a2enmod', 'a2dismod', 'a2enconf', 'a2disconf', 'apache2ctl', 'systemctl'],
  'fdisk': ['parted', 'gdisk', 'sfdisk', 'cfdisk', 'mkfs', 'partprobe', 'mount', 'lsblk', 'blkid'],
  'expr': ['bc', 'test', 'awk', 'sed', 'cut', 'echo', 'printf', 'bash', 'eval'],
  'fg': ['bg', 'jobs', 'kill', 'wait', 'disown', 'nohup', 'screen', 'tmux', 'suspend'],
  'systemctl': ['systemctl', 'service', 'update-rc.d', 'rc-update', 'insserv', 'ntsysv', 'init.d', 'runlevel'],
  'fgrep': ['grep', 'egrep', 'rgrep', 'sed', 'awk', 'find', 'locate', 'strings'],
  'file': ['stat', 'ls', 'find', 'hexdump', 'strings', 'type', 'identify', 'magic'],
  'finger': ['who', 'w', 'last', 'users', 'id', 'whoami', 'pinky', 'rusers'],
  'flock': ['lockfile', 'lslocks', 'chattr', 'chmod', 'ln', 'mount', 'umount', 'sync'],
  'fold': ['fmt', 'pr', 'expand', 'unexpand', 'col', 'colrm', 'sed', 'awk', 'cut'],
  'for': ['while', 'until', 'if', 'case', 'break', 'continue', 'select', 'bash'],
  'free': ['top', 'vmstat', 'ps', 'htop', 'swapon', 'swapoff', 'sysctl', 'cat /proc/meminfo'],
  'fsck': ['e2fsck', 'badblocks', 'tune2fs', 'debugfs', 'xfs_repair', 'mount', 'umount', 'blkid'],
  'fstat': ['lsof', 'stat', 'ps', 'netstat', 'ss', 'procstat', 'find', 'vmstat'],
  'gawk': ['awk', 'sed', 'grep', 'cut', 'tr', 'perl', 'sort', 'uniq', 'find'],
  'getconf': ['sysctl', 'uname', 'ulimit', 'env', 'printenv', 'lsattr', 'stat', 'df'],
  'getent': ['cat /etc/passwd', 'cat /etc/group', 'nslookup', 'dig', 'host', 'finger', 'id', 'groups'],
  'getfacl': ['setfacl', 'chmod', 'chown', 'ls -l', 'acl', 'chacl', 'attr', 'getattr'],
  'getopts': ['getopt', 'bash', 'sh', 'ksh', 'zsh', 'shift', 'case', 'while'],
  'gpasswd': ['groupadd', 'groupdel', 'groupmod', 'groups', 'newgrp', 'usermod', 'useradd', 'id'],
  'groups': ['id', 'whoami', 'getent', 'usermod', 'gpasswd', 'newgrp', 'groupadd', 'groupdel'],
  'grub-install': ['grub-mkconfig', 'update-grub', 'grub-set-default', 'grub-reboot', 'efibootmgr', 'bootctl', 'os-prober'],
  'grub-mkconfig': ['grub-install', 'update-grub', 'os-prober', 'grub-set-default', 'grub-reboot', 'efibootmgr', 'bootctl'],
  'hash': ['type', 'which', 'whereis', 'command', 'source', 'alias', 'declare', 'export'],
  'head': ['tail', 'cat', 'more', 'less', 'grep', 'sed', 'awk'],
  'hexdump': ['xxd', 'od', 'strings', 'hd', 'hexedit', 'bvi', 'dd', 'file'],
  'history': ['fc', 'bash', 'zsh', 'csh', 'ksh', 'source', 'alias', 'export'],
  'hostname': ['hostnamectl', 'domainname', 'dnsdomainname', 'ypdomainname', 'nisdomainname', 'uname', 'host', 'dig'],
  'hwclock': ['date', 'timedatectl', 'ntpd', 'ntpdate', 'chronyd', 'clock', 'rdate', 'systemd-timesyncd'],
};

// Define COMMAND_USE_CASES with proper typing
const COMMAND_USE_CASES: Record<string, UseCase[]> = {
  'ab': [
    { title: 'Web server performance testing', description: 'Benchmark HTTP server performance by measuring requests per second' },
    { title: 'Load testing', description: 'Simulate multiple concurrent users to test server capacity under load' },
    { title: 'Performance optimization', description: 'Identify bottlenecks and optimize web server configurations' },
    { title: 'Capacity planning', description: 'Determine server capacity requirements for production deployments' },
    { title: 'Regression testing', description: 'Compare performance before and after configuration changes' }
  ],
  'ac': [
    { title: 'User activity monitoring', description: 'Track user login and logout times for system administration' },
    { title: 'Security auditing', description: 'Monitor user access patterns for security analysis and compliance' },
    { title: 'System usage reporting', description: 'Generate reports on system usage and user activity statistics' },
    { title: 'Billing and accounting', description: 'Calculate user session times for billing or resource allocation' },
    { title: 'Compliance reporting', description: 'Generate audit trails for regulatory compliance requirements' }
  ],
  'access': [
    { title: 'File permission checking', description: 'Check if a file can be accessed with current permissions' },
    { title: 'Script automation', description: 'Test file accessibility before performing operations in scripts' },
    { title: 'Security validation', description: 'Verify file access rights for security auditing purposes' },
    { title: 'Error handling', description: 'Prevent script failures by checking file accessibility beforehand' },
    { title: 'Cross-platform compatibility', description: 'Test file access across different filesystem types' }
  ],
  'add-apt-repository': [
    { title: 'Software repository management', description: 'Add third-party repositories to access additional software packages' },
    { title: 'PPA integration', description: 'Add Personal Package Archives for Ubuntu-specific software' },
    { title: 'Development tools installation', description: 'Add repositories for development libraries and tools' },
    { title: 'Latest software access', description: 'Access cutting-edge software versions from external repositories' },
    { title: 'System customization', description: 'Expand available software options beyond default repositories' }
  ],
  'addgroup': [
    { title: 'User group creation', description: 'Create new user groups for organizing system users' },
    { title: 'Permission management', description: 'Set up groups for managing file and directory access permissions' },
    { title: 'System administration', description: 'Organize users into logical groups for easier management' },
    { title: 'Multi-user environments', description: 'Create groups for shared access to resources and files' },
    { title: 'Security organization', description: 'Group users by security clearance or access requirements' }
  ],
  'adduser': [
    { title: 'User account creation', description: 'Create new user accounts with proper home directories and settings' },
    { title: 'System administration', description: 'Add users to the system with appropriate permissions and groups' },
    { title: 'Multi-user setup', description: 'Set up user accounts for shared systems or servers' },
    { title: 'Service account creation', description: 'Create dedicated accounts for running specific services' },
    { title: 'User provisioning', description: 'Automate user account creation in large environments' }
  ],
  'alias': [
    { title: 'Command shortcuts', description: 'Create shorter, easier-to-remember names for frequently used commands' },
    { title: 'Workflow optimization', description: 'Streamline repetitive tasks with custom command aliases' },
    { title: 'Cross-platform compatibility', description: 'Create aliases that work consistently across different systems' },
    { title: 'Shell customization', description: 'Personalize your shell environment with custom command names' },
    { title: 'Team standardization', description: 'Share common aliases across team members for consistency' }
  ],
  'alsamixer': [
    { title: 'Audio level control', description: 'Adjust volume levels for different audio channels and devices' },
    { title: 'Sound card configuration', description: 'Configure and test sound card settings and capabilities' },
    { title: 'Audio troubleshooting', description: 'Diagnose and fix audio playback and recording issues' },
    { title: 'Multi-channel audio', description: 'Manage complex audio setups with multiple input/output channels' },
    { title: 'System audio setup', description: 'Configure system-wide audio settings and device preferences' }
  ],
  'amixer': [
    { title: 'Command-line audio control', description: 'Control audio levels and settings from scripts and command line' },
    { title: 'Audio automation', description: 'Automate audio configuration changes in scripts and applications' },
    { title: 'System integration', description: 'Integrate audio control into system administration scripts' },
    { title: 'Audio device management', description: 'Switch between audio devices and configure their settings' },
    { title: 'Volume automation', description: 'Create scripts to automatically adjust volume based on conditions' }
  ],
  'anacron': [
    { title: 'Scheduled task execution', description: 'Run tasks at specified intervals even when system is not always on' },
    { title: 'System maintenance', description: 'Schedule regular maintenance tasks like log rotation and cleanup' },
    { title: 'Backup automation', description: 'Automate backup tasks that need to run periodically' },
    { title: 'System monitoring', description: 'Schedule health checks and monitoring tasks' },
    { title: 'Desktop task scheduling', description: 'Schedule tasks on desktop systems that may be powered off' }
  ],
  'apt': [
    { title: 'Package installation', description: 'Install software packages with automatic dependency resolution' },
    { title: 'System updates', description: 'Update the system and installed packages to latest versions' },
    { title: 'Package management', description: 'Search, install, remove, and manage software packages' },
    { title: 'Repository management', description: 'Add, remove, and configure software repositories' },
    { title: 'System maintenance', description: 'Clean up package caches and perform system maintenance tasks' }
  ],
  'apt-cache': [
    { title: 'Package information lookup', description: 'Search for package details, dependencies, and metadata' },
    { title: 'Dependency resolution', description: 'Check package dependencies and reverse dependencies' },
    { title: 'Package discovery', description: 'Find available packages and their descriptions' },
    { title: 'Repository analysis', description: 'Analyze package repository contents and statistics' },
    { title: 'Package planning', description: 'Research packages before installation to understand their impact' }
  ],
  'arecord': [
    { title: 'Audio recording', description: 'Record audio from microphones and other input devices' },
    { title: 'Sound testing', description: 'Test audio input devices and verify recording capabilities' },
    { title: 'Audio capture', description: 'Capture audio streams for processing or analysis' },
    { title: 'System audio recording', description: 'Record system audio output for documentation or analysis' },
    { title: 'Audio quality testing', description: 'Test audio quality and troubleshoot recording issues' }
  ],
  'arping': [
    { title: 'Network connectivity testing', description: 'Test if a host is reachable on the local network' },
    { title: 'ARP table verification', description: 'Verify ARP cache entries and detect IP conflicts' },
    { title: 'Network troubleshooting', description: 'Diagnose network connectivity issues at the link layer' },
    { title: 'Security monitoring', description: 'Detect unauthorized devices on the network' },
    { title: 'Network device discovery', description: 'Find active devices on the local network segment' }
  ],
  'as': [
    { title: 'Assembly compilation', description: 'Compile assembly language source code into object files' },
    { title: 'Low-level programming', description: 'Create optimized code for performance-critical applications' },
    { title: 'System programming', description: 'Write code that directly interfaces with hardware' },
    { title: 'Cross-compilation', description: 'Compile assembly for different target architectures' },
    { title: 'Binary analysis', description: 'Generate assembly code for reverse engineering and analysis' }
  ],
  'aspell': [
    { title: 'Text spell checking', description: 'Check spelling in text files and documents' },
    { title: 'Document validation', description: 'Validate spelling in documentation and reports' },
    { title: 'Content quality assurance', description: 'Ensure content quality by checking for spelling errors' },
    { title: 'Automated proofreading', description: 'Automate spell checking in content management systems' },
    { title: 'Multi-language support', description: 'Check spelling in multiple languages and dialects' }
  ],
  'at': [
    { title: 'One-time task scheduling', description: 'Schedule commands to run once at a specific time' },
    { title: 'Delayed execution', description: 'Execute commands after a specified delay' },
    { title: 'System maintenance', description: 'Schedule maintenance tasks during off-peak hours' },
    { title: 'Batch processing', description: 'Queue multiple jobs for execution at specific times' },
    { title: 'Automated workflows', description: 'Create automated sequences of commands' }
  ],
  'atq': [
    { title: 'Job queue monitoring', description: 'View pending jobs in the at queue' },
    { title: 'Task management', description: 'Monitor scheduled tasks and their execution status' },
    { title: 'System administration', description: 'Check what jobs are waiting to be executed' },
    { title: 'Queue maintenance', description: 'Review and manage the job queue' },
    { title: 'Scheduling verification', description: 'Verify that tasks have been properly scheduled' }
  ],
  'atrm': [
    { title: 'Job cancellation', description: 'Remove scheduled jobs from the queue' },
    { title: 'Queue management', description: 'Clean up unwanted or obsolete scheduled tasks' },
    { title: 'System maintenance', description: 'Remove jobs that are no longer needed' },
    { title: 'Error recovery', description: 'Remove failed or problematic scheduled jobs' },
    { title: 'Scheduling cleanup', description: 'Maintain a clean job queue by removing old entries' }
  ],
  'basename': [
    { title: 'File path processing', description: 'Extract the filename from a full path' },
    { title: 'Script automation', description: 'Process file paths in automated scripts' },
    { title: 'File management', description: 'Work with filenames without directory components' },
    { title: 'Path manipulation', description: 'Extract and manipulate file path components' },
    { title: 'Cross-platform compatibility', description: 'Handle file paths consistently across systems' }
  ],
  'bash': [
    { title: 'Interactive shell', description: 'Provide an interactive command-line interface' },
    { title: 'Script execution', description: 'Run shell scripts with advanced features' },
    { title: 'System administration', description: 'Perform administrative tasks with enhanced shell features' },
    { title: 'Development environment', description: 'Use as a development shell with programming features' },
    { title: 'Automation platform', description: 'Create complex automated workflows and scripts' }
  ],
  'batch': [
    { title: 'Load-based scheduling', description: 'Execute jobs when system load is low' },
    { title: 'Resource optimization', description: 'Schedule tasks to run during idle periods' },
    { title: 'System maintenance', description: 'Run maintenance tasks when system is not busy' },
    { title: 'Background processing', description: 'Process jobs in the background during low activity' },
    { title: 'Automated workflows', description: 'Create automated task sequences with load consideration' }
  ],
  'bc': [
    { title: 'Mathematical calculations', description: 'Perform complex mathematical operations' },
    { title: 'Script calculations', description: 'Integrate mathematical operations into shell scripts' },
    { title: 'Financial calculations', description: 'Perform precise financial and accounting calculations' },
    { title: 'Scientific computing', description: 'Handle scientific calculations with high precision' },
    { title: 'Data processing', description: 'Process numerical data with mathematical operations' }
  ],
  'beep': [
    { title: 'System alerts', description: 'Generate audio alerts for system events' },
    { title: 'Script feedback', description: 'Provide audio feedback in automated scripts' },
    { title: 'Testing audio', description: 'Test audio system functionality' },
    { title: 'User notifications', description: 'Notify users of completed tasks or errors' },
    { title: 'System monitoring', description: 'Alert administrators to system events or issues' }
  ],
  'bg': [
    { title: 'Process management', description: 'Resume suspended processes in the background' },
    { title: 'Job control', description: 'Manage multiple processes and their execution states' },
    { title: 'Multitasking', description: 'Continue working while processes run in background' },
    { title: 'System administration', description: 'Manage long-running administrative tasks' },
    { title: 'Development workflow', description: 'Run development processes while continuing to work' }
  ],
  'blkid': [
    { title: 'Device identification', description: 'Identify block devices and their filesystem types' },
    { title: 'System administration', description: 'Manage and configure storage devices' },
    { title: 'Troubleshooting', description: 'Diagnose storage device issues' },
    { title: 'Device mapping', description: 'Map and identify storage devices in the system' },
    { title: 'Storage management', description: 'Manage storage devices and their configurations' }
  ],
  'blockdev': [
    { title: 'Device configuration', description: 'Configure block device parameters' },
    { title: 'Performance tuning', description: 'Optimize block device performance settings' },
    { title: 'System administration', description: 'Manage block devices for optimal performance' },
    { title: 'Storage optimization', description: 'Optimize storage device settings' },
    { title: 'Device management', description: 'Configure and manage storage devices' }
  ],
  'brctl': [
    { title: 'Network bridge management', description: 'Create and manage network bridges' },
    { title: 'Network configuration', description: 'Configure network bridging for virtual machines' },
    { title: 'System administration', description: 'Manage network interfaces and bridges' },
    { title: 'Virtualization support', description: 'Set up network bridges for virtual environments' },
    { title: 'Network troubleshooting', description: 'Diagnose and fix network bridge issues' }
  ],
  'bridge': [
    { title: 'Network bridge configuration', description: 'Configure network bridges for traffic management' },
    { title: 'Virtual network setup', description: 'Set up virtual networks for containers and VMs' },
    { title: 'Network administration', description: 'Manage network bridges and their configurations' },
    { title: 'Traffic management', description: 'Control network traffic flow through bridges' },
    { title: 'Network isolation', description: 'Create isolated network segments using bridges' }
  ],
  'btrfs': [
    { title: 'Filesystem management', description: 'Create and manage Btrfs filesystems' },
    { title: 'Data snapshots', description: 'Create and manage filesystem snapshots' },
    { title: 'Storage optimization', description: 'Optimize storage usage with advanced features' },
    { title: 'Data integrity', description: 'Ensure data integrity with checksums and error correction' },
    { title: 'Storage administration', description: 'Manage advanced storage features and configurations' }
  ],
  'bunzip2': [
    { title: 'File decompression', description: 'Decompress bzip2 compressed files' },
    { title: 'Archive extraction', description: 'Extract files from bzip2 compressed archives' },
    { title: 'Data recovery', description: 'Recover data from compressed backups' },
    { title: 'File processing', description: 'Process compressed files in automated workflows' },
    { title: 'Storage optimization', description: 'Decompress files to save storage space' }
  ],
  'bzcat': [
    { title: 'Compressed file viewing', description: 'View contents of bzip2 compressed files' },
    { title: 'Data inspection', description: 'Inspect compressed data without decompressing' },
    { title: 'Content verification', description: 'Verify contents of compressed files' },
    { title: 'Stream processing', description: 'Process compressed data streams' },
    { title: 'File analysis', description: 'Analyze compressed files without extraction' }
  ],
  'bzcmp': [
    { title: 'Compressed file comparison', description: 'Compare bzip2 compressed files' },
    { title: 'Data verification', description: 'Verify integrity of compressed files' },
    { title: 'File analysis', description: 'Analyze differences between compressed files' },
    { title: 'Quality assurance', description: 'Ensure compressed files are identical' },
    { title: 'Backup verification', description: 'Verify compressed backup files' }
  ],
  'bzdiff': [
    { title: 'Compressed file differences', description: 'Show differences between bzip2 compressed files' },
    { title: 'Data analysis', description: 'Analyze changes in compressed data' },
    { title: 'Version comparison', description: 'Compare different versions of compressed files' },
    { title: 'Content verification', description: 'Verify content differences in compressed files' },
    { title: 'Backup analysis', description: 'Analyze differences in compressed backups' }
  ],
  'bzgrep': [
    { title: 'Compressed file searching', description: 'Search for patterns in bzip2 compressed files' },
    { title: 'Data mining', description: 'Extract specific information from compressed data' },
    { title: 'Log analysis', description: 'Search compressed log files for specific entries' },
    { title: 'Content filtering', description: 'Filter compressed content based on patterns' },
    { title: 'Information retrieval', description: 'Retrieve specific data from compressed files' }
  ],
  'bzip2': [
    { title: 'File compression', description: 'Compress files to save storage space' },
    { title: 'Archive creation', description: 'Create compressed archives of files and directories' },
    { title: 'Data backup', description: 'Create compressed backups of important data' },
    { title: 'Storage optimization', description: 'Reduce storage requirements through compression' },
    { title: 'Data transfer', description: 'Compress files for efficient data transfer' }
  ],
  'bzip2recover': [
    { title: 'Data recovery', description: 'Recover data from corrupted bzip2 files' },
    { title: 'File repair', description: 'Repair damaged compressed files' },
    { title: 'Backup recovery', description: 'Recover data from damaged compressed backups' },
    { title: 'Error correction', description: 'Attempt to correct errors in compressed files' },
    { title: 'Data salvage', description: 'Salvage data from partially corrupted files' }
  ],
  'bzless': [
    { title: 'Compressed file viewing', description: 'View bzip2 compressed files with pagination' },
    { title: 'Data inspection', description: 'Inspect compressed data interactively' },
    { title: 'Content browsing', description: 'Browse through compressed file contents' },
    { title: 'Log analysis', description: 'Analyze compressed log files interactively' },
    { title: 'Document viewing', description: 'View compressed documents without extraction' }
  ],
  'bzmore': [
    { title: 'Compressed file viewing', description: 'View bzip2 compressed files page by page' },
    { title: 'Data inspection', description: 'Inspect compressed data with pagination' },
    { title: 'Content browsing', description: 'Browse compressed file contents' },
    { title: 'Log analysis', description: 'Analyze compressed log files' },
    { title: 'Document viewing', description: 'View compressed documents' }
  ],
  'cal': [
    { title: 'Calendar display', description: 'Display calendar for current month or specified date range' },
    { title: 'Date planning', description: 'Plan events and appointments using calendar view' },
    { title: 'System administration', description: 'Check dates for system maintenance and scheduling' },
    { title: 'Script automation', description: 'Use calendar data in automated scripts and workflows' },
    { title: 'Date calculations', description: 'Calculate date ranges and intervals for planning' }
  ],
  'cat': [
    { title: 'File viewing', description: 'Display contents of text files in the terminal' },
    { title: 'File concatenation', description: 'Combine multiple files into a single output' },
    { title: 'Data inspection', description: 'Quickly inspect file contents without editing' },
    { title: 'Script input', description: 'Provide file contents as input to other commands' },
    { title: 'Content verification', description: 'Verify file contents and check for specific data' }
  ],
  'cfdisk': [
    { title: 'Disk partitioning', description: 'Create and modify disk partitions interactively' },
    { title: 'System installation', description: 'Prepare disks for operating system installation' },
    { title: 'Storage management', description: 'Manage disk space allocation and partition layout' },
    { title: 'Dual boot setup', description: 'Configure partitions for multiple operating systems' },
    { title: 'Storage optimization', description: 'Optimize disk layout for performance and organization' }
  ],
  'chage': [
    { title: 'Password policy management', description: 'Set password expiration and aging policies' },
    { title: 'User account security', description: 'Configure security settings for user accounts' },
    { title: 'System administration', description: 'Manage user account security policies' },
    { title: 'Compliance management', description: 'Enforce password policies for regulatory compliance' },
    { title: 'Account maintenance', description: 'Maintain and update user account security settings' }
  ],
  'chattr': [
    { title: 'File attribute management', description: 'Set special attributes on files and directories' },
    { title: 'Security hardening', description: 'Protect files from accidental deletion or modification' },
    { title: 'System administration', description: 'Manage file attributes for system security' },
    { title: 'Data protection', description: 'Prevent unauthorized changes to critical files' },
    { title: 'File system optimization', description: 'Optimize file system behavior with attributes' }
  ],
  'chgrp': [
    { title: 'Group ownership management', description: 'Change group ownership of files and directories' },
    { title: 'Permission management', description: 'Manage access permissions through group membership' },
    { title: 'System administration', description: 'Organize files by group ownership' },
    { title: 'Multi-user environments', description: 'Set up group access for shared resources' },
    { title: 'Security organization', description: 'Organize file access by security groups' }
  ],
  'chkconfig': [
    { title: 'Service management', description: 'Configure system services to start at boot time' },
    { title: 'System administration', description: 'Manage which services are enabled or disabled' },
    { title: 'Boot optimization', description: 'Optimize system boot time by controlling services' },
    { title: 'Service security', description: 'Disable unnecessary services for security hardening' },
    { title: 'System maintenance', description: 'Manage service configurations for system maintenance' }
  ],
  'chmod': [
    { title: 'Permission management', description: 'Change file and directory permissions' },
    { title: 'Security configuration', description: 'Set appropriate permissions for security' },
    { title: 'System administration', description: 'Manage access permissions for files and directories' },
    { title: 'Multi-user setup', description: 'Configure permissions for shared access' },
    { title: 'Script execution', description: 'Make scripts executable and set appropriate permissions' }
  ],
  'chown': [
    { title: 'Ownership management', description: 'Change file and directory ownership' },
    { title: 'System administration', description: 'Manage file ownership for system organization' },
    { title: 'User account management', description: 'Transfer file ownership between users' },
    { title: 'Service account setup', description: 'Set ownership for service-specific files' },
    { title: 'Security management', description: 'Manage file ownership for security purposes' }
  ],
  'chpasswd': [
    { title: 'Batch password management', description: 'Change passwords for multiple users at once' },
    { title: 'System administration', description: 'Manage user passwords in bulk operations' },
    { title: 'User provisioning', description: 'Set initial passwords for new user accounts' },
    { title: 'Password synchronization', description: 'Synchronize passwords across multiple systems' },
    { title: 'Automated user management', description: 'Automate password changes in scripts' }
  ],
  'chroot': [
    { title: 'System isolation', description: 'Create isolated environments for testing or security' },
    { title: 'System recovery', description: 'Access and repair systems from recovery environments' },
    { title: 'Containerization', description: 'Create container-like environments for applications' },
    { title: 'Security hardening', description: 'Limit application access to specific directories' },
    { title: 'System maintenance', description: 'Perform maintenance tasks in isolated environments' }
  ],
  'cksum': [
    { title: 'Data integrity verification', description: 'Verify file integrity using checksums' },
    { title: 'File corruption detection', description: 'Detect corrupted files by comparing checksums' },
    { title: 'Data transfer validation', description: 'Verify successful data transfers between systems' },
    { title: 'Backup verification', description: 'Ensure backup files are not corrupted' },
    { title: 'Quality assurance', description: 'Validate file integrity in automated workflows' }
  ],
  'clear': [
    { title: 'Terminal cleanup', description: 'Clear the terminal screen for better readability' },
    { title: 'Presentation preparation', description: 'Prepare terminal for demonstrations or presentations' },
    { title: 'Workflow organization', description: 'Organize terminal workspace by clearing clutter' },
    { title: 'Debugging assistance', description: 'Clear screen to focus on specific output or errors' },
    { title: 'User experience improvement', description: 'Improve terminal usability with clean display' }
  ],
  'cmp': [
    { title: 'File comparison', description: 'Compare two files byte by byte for differences' },
    { title: 'Data validation', description: 'Verify that files are identical or detect differences' },
    { title: 'Quality assurance', description: 'Ensure file integrity and consistency' },
    { title: 'Script automation', description: 'Automate file comparison in scripts and workflows' },
    { title: 'Binary file analysis', description: 'Compare binary files for differences or corruption' }
  ],
  'comm': [
    { title: 'Set operations', description: 'Perform set operations on sorted files' },
    { title: 'Data analysis', description: 'Analyze common and unique lines between files' },
    { title: 'File merging', description: 'Identify common lines for file merging operations' },
    { title: 'Data deduplication', description: 'Find duplicate lines across multiple files' },
    { title: 'Text processing', description: 'Process and compare text files systematically' }
  ],
  'command': [
    { title: 'Command execution', description: 'Execute commands with specific behavior' },
    { title: 'Shell scripting', description: 'Control command execution in shell scripts' },
    { title: 'Builtin verification', description: 'Check if a command is a shell builtin' },
    { title: 'Function bypass', description: 'Bypass shell functions to execute original commands' },
    { title: 'Script portability', description: 'Ensure scripts work consistently across different shells' }
  ],
  'compress': [
    { title: 'File compression', description: 'Compress files to save storage space' },
    { title: 'Data archiving', description: 'Create compressed archives of files and directories' },
    { title: 'Storage optimization', description: 'Reduce storage requirements through compression' },
    { title: 'Data transfer', description: 'Compress files for efficient data transfer' },
    { title: 'Backup compression', description: 'Create compressed backups of important data' }
  ],
  'curl': [
    { title: 'Web data transfer', description: 'Transfer data to and from web servers' },
    { title: 'API testing', description: 'Test REST APIs and web services' },
    { title: 'File downloading', description: 'Download files from web servers and FTP sites' },
    { title: 'Web scraping', description: 'Extract data from web pages and services' },
    { title: 'Network troubleshooting', description: 'Test network connectivity and HTTP services' }
  ],
  'cut': [
    { title: 'Text field extraction', description: 'Extract specific fields from text data' },
    { title: 'Data processing', description: 'Process structured data like CSV files' },
    { title: 'Log analysis', description: 'Extract specific information from log files' },
    { title: 'Script automation', description: 'Automate text processing in shell scripts' },
    { title: 'Data transformation', description: 'Transform data formats by extracting columns' }
  ],
  'cvt': [
    { title: 'Display mode generation', description: 'Generate X11 display modes for monitors' },
    { title: 'Monitor configuration', description: 'Configure monitor settings and resolutions' },
    { title: 'X11 setup', description: 'Set up X11 display configurations' },
    { title: 'Display optimization', description: 'Optimize display settings for different monitors' },
    { title: 'System administration', description: 'Configure display settings for multi-monitor setups' }
  ],
  'abort': [
    { title: 'Debugging crashes', description: 'Generate a core dump to analyze application failures and bugs' },
    { title: 'Process termination', description: 'Force termination of a misbehaving process' },
    { title: 'Signal handling', description: 'Test application behavior when receiving SIGABRT signals' },
    { title: 'System diagnostics', description: 'Diagnostic tool for analyzing system behavior during crashes' },
    { title: 'Error handling', description: 'Test error handling routines in applications' }
  ],
  'aclocal': [
    { title: 'Autotools setup', description: 'Generate aclocal.m4 files containing needed macro definitions for autoconf' },
    { title: 'Open source development', description: 'Prepare the build system for C/C++ projects that use the GNU Autotools' },
    { title: 'Custom macro integration', description: 'Include project-specific macros from m4 directories into the build system' },
    { title: 'Cross-platform compatibility', description: 'Collect platform detection and feature testing macros for configure scripts' },
    { title: 'Build system maintenance', description: 'Update macro definitions when adding new features that require configuration checks' }
  ],
  'apt-get': [
    { title: 'Software installation', description: 'Install software packages from repositories with dependency handling' },
    { title: 'System updates', description: 'Keep the system up-to-date with security patches and bug fixes' },
    { title: 'Package removal', description: 'Safely remove unwanted software while maintaining system integrity' },
    { title: 'Source code retrieval', description: 'Download source code of packages for inspection or modification' },
    { title: 'System maintenance', description: 'Clean package caches and perform dependency maintenance tasks' }
  ],
  'apt-key': [
    { title: 'Repository authentication', description: 'Add authentication keys for third-party software repositories' },
    { title: 'Key management', description: 'Manage the keys used to verify the authenticity of packages' },
    { title: 'Security maintenance', description: 'Remove expired or compromised keys from the trusted keyring' },
    { title: 'Key verification', description: 'List and inspect keys to verify their authenticity and origin' },
    { title: 'PPA setup', description: 'Add authentication keys for Personal Package Archives in Ubuntu' }
  ],
  'apt-mark': [
    { title: 'Version locking', description: 'Prevent specific packages from being upgraded to maintain stability' },
    { title: 'Dependency management', description: 'Control which packages are marked as manually or automatically installed' },
    { title: 'System migration', description: 'Export package selection states for replication on other systems' },
    { title: 'Package protection', description: 'Protect critical packages from accidental removal during cleanup' },
    { title: 'Troubleshooting', description: 'Hold problematic packages at working versions until bugs are fixed' }
  ],
  'blogbench': [
    { title: 'Filesystem benchmarking', description: 'Test and compare the I/O performance of different filesystems' },
    { title: 'Storage device evaluation', description: 'Assess the read/write performance of SSDs, HDDs, and other storage media' },
    { title: 'System tuning', description: 'Measure the impact of system configurations on file I/O performance' },
    { title: 'RAID performance testing', description: 'Evaluate different RAID configurations for optimal performance' },
    { title: 'Cloud storage benchmarking', description: 'Compare performance of different cloud storage options and configurations' }
  ],
  'bluetoothctl': [
    { title: 'Device pairing', description: 'Pair Bluetooth devices with your Linux system' },
    { title: 'Connection management', description: 'Connect, disconnect, and manage paired Bluetooth devices' },
    { title: 'Device discovery', description: 'Scan for and identify available Bluetooth devices in range' },
    { title: 'System configuration', description: 'Configure Bluetooth adapter settings like discoverability and name' },
    { title: 'Automation', description: 'Script Bluetooth operations for automated tasks and device management' }
  ],
  'break': [
    { title: 'Loop control', description: 'Exit from loops when certain conditions are met' },
    { title: 'Error handling', description: 'Stop loop execution when an error occurs to prevent further processing' },
    { title: 'Nested loop management', description: 'Exit from multiple levels of nested loops with a single command' },
    { title: 'Interactive menus', description: 'Provide exit functionality in interactive shell script menus' },
    { title: 'Conditional termination', description: 'Terminate repetitive processes early when a target result is achieved' }
  ],
  'arch': [
    { title: 'System information gathering', description: 'Quickly identify the hardware architecture of the current system' },
    { title: 'Installation scripts', description: 'Determine which binary packages to install based on the architecture' },
    { title: 'Cross-platform development', description: 'Verify system architecture for software compatibility' },
    { title: 'Containerization', description: 'Check architecture compatibility in container environments' },
    { title: 'Conditional execution', description: 'Run architecture-specific commands or optimizations in scripts' }
  ],
  'arp': [
    { title: 'Network troubleshooting', description: 'View and manage the ARP cache to diagnose network connectivity issues' },
    { title: 'Security monitoring', description: 'Detect potential ARP spoofing attacks by monitoring for unexpected changes' },
    { title: 'IP conflict detection', description: 'Verify MAC address mappings to detect duplicate IP addresses on the network' },
    { title: 'Static mapping', description: 'Configure permanent IP-to-MAC address mappings to avoid ARP traffic' },
    { title: 'Network device discovery', description: 'Identify active devices on the local network segment' }
  ],
  'cpio': [
    { title: 'File archiving', description: 'Create archives of files and directories with metadata preserved' },
    { title: 'System backups', description: 'Backup system files while preserving permissions and ownership' },
    { title: 'Data recovery', description: 'Extract files from archives during system recovery operations' },
    { title: 'System installation', description: 'Package files for system installation processes like initramfs' },
    { title: 'Data migration', description: 'Move files between systems while preserving all file attributes' }
  ],
  'crontab': [
    { title: 'Scheduled backups', description: 'Automate regular backup tasks at specific times' },
    { title: 'System maintenance', description: 'Schedule routine maintenance tasks like log rotation or cleanup' },
    { title: 'Periodic reporting', description: 'Generate and send reports on a regular schedule' },
    { title: 'Automated monitoring', description: 'Run system checks and monitoring scripts at defined intervals' },
    { title: 'Task automation', description: 'Schedule any repetitive task to run without manual intervention' }
  ],
  'csplit': [
    { title: 'Log file processing', description: 'Split large log files into sections by date or event markers' },
    { title: 'Content extraction', description: 'Extract specific sections from structured documents' },
    { title: 'Data processing', description: 'Break large data files into manageable chunks for processing' },
    { title: 'Document segmentation', description: 'Divide documents by chapters, sections, or other logical units' },
    { title: 'Code analysis', description: 'Split source code files by function or class definitions' }
  ],
  'date': [
    { title: 'Time synchronization', description: 'Display or set the current system date and time' },
    { title: 'Formatting timestamps', description: 'Convert between different date and time formats' },
    { title: 'Script timestamping', description: 'Add timestamps to logs or output in shell scripts' },
    { title: 'Date calculations', description: 'Perform date arithmetic for scheduling and planning' },
    { title: 'Time zone conversion', description: 'Display times adjusted for different time zones' }
  ],
  'dc': [
    { title: 'Complex calculations', description: 'Perform arbitrary-precision arithmetic calculations using RPN notation' },
    { title: 'Scripted math', description: 'Execute mathematical operations in scripts without floating-point errors' },
    { title: 'Base conversion', description: 'Convert numbers between different number bases (decimal, hex, octal, etc.)' },
    { title: 'Stack manipulation', description: 'Work with stack-based data structures for complex operations' },
    { title: 'Programming exercises', description: 'Learn and practice reverse Polish notation and stack-based programming' }
  ],
  'debootstrap': [
    { title: 'Chroot environment creation', description: 'Create a basic Debian/Ubuntu system in a subdirectory' },
    { title: 'Container setup', description: 'Prepare base filesystem for containers or virtual machines' },
    { title: 'Cross-distribution development', description: 'Set up development environments for different Debian versions' },
    { title: 'System recovery', description: 'Create a minimal system for recovering damaged installations' },
    { title: 'OS image creation', description: 'Generate base images for embedded systems or custom installations' }
  ],
  'declare': [
    { title: 'Variable typing', description: 'Declare variables with specific attributes and constraints in Bash' },
    { title: 'Array creation', description: 'Define and manage indexed and associative arrays in shell scripts' },
    { title: 'Function parameter handling', description: 'Create variables with specific behaviors for function inputs' },
    { title: 'Script debugging', description: 'Enable variable tracing and error detection in complex scripts' },
    { title: 'Variable scope control', description: 'Control variable visibility and exportability to child processes' }
  ],
  'deluser': [
    { title: 'User management', description: 'Remove user accounts from the system safely' },
    { title: 'Security maintenance', description: 'Remove unused or compromised accounts to maintain system security' },
    { title: 'Home directory cleanup', description: 'Optionally remove user home directories and mail spools' },
    { title: 'Group removal', description: 'Remove user groups along with user accounts' },
    { title: 'System administration', description: 'Manage system accounts as part of routine maintenance' }
  ],
  'delgroup': [
    { title: 'Group management', description: 'Remove groups from the system when they are no longer needed' },
    { title: 'Security maintenance', description: 'Clean up unused groups to improve system security' },
    { title: 'Access control', description: 'Remove access privileges for a collection of users at once' },
    { title: 'System administration', description: 'Manage group structures as part of routine maintenance' },
    { title: 'User reorganization', description: 'Restructure group assignments when reorganizing user access' }
  ],
  'depmod': [
    { title: 'Kernel module management', description: 'Build a list of module dependencies for the Linux kernel' },
    { title: 'System updates', description: 'Update module dependency information after kernel updates' },
    { title: 'Driver installation', description: 'Configure new hardware drivers to be properly recognized' },
    { title: 'Troubleshooting', description: 'Resolve module loading issues by rebuilding dependency information' },
    { title: 'System initialization', description: 'Prepare module information during boot or system initialization' }
  ],
  'df': [
    { title: 'Disk space monitoring', description: 'Check available disk space on mounted filesystems' },
    { title: 'Storage management', description: 'Identify filesystems that are running low on space' },
    { title: 'System administration', description: 'Monitor disk usage across multiple partitions and drives' },
    { title: 'Capacity planning', description: 'Plan storage upgrades based on current utilization' },
    { title: 'Quota enforcement', description: 'Verify if users or applications are approaching storage limits' }
  ],
  'diff': [
    { title: 'File comparison', description: 'Compare two files line by line to identify differences' },
    { title: 'Code review', description: 'Review changes made to source code files' },
    { title: 'Configuration management', description: 'Track changes to configuration files between versions' },
    { title: 'Patch creation', description: 'Generate patch files that can be applied to update files' },
    { title: 'Quality assurance', description: 'Verify if expected changes have been correctly implemented' }
  ],
  'diff3': [
    { title: 'Three-way file comparison', description: 'Compare three files to identify differences and common elements' },
    { title: 'Conflict resolution', description: 'Resolve merge conflicts when two people modify the same file' },
    { title: 'File merging', description: 'Merge changes from multiple sources into a single file' },
    { title: 'Version control', description: 'Compare original, modified, and third-party versions of a file' },
    { title: 'Collaborative editing', description: 'Reconcile different edits to the same document' }
  ],
  'dig': [
    { title: 'DNS troubleshooting', description: 'Diagnose and resolve DNS-related networking issues' },
    { title: 'Domain verification', description: 'Verify DNS records for domains you own or manage' },
    { title: 'DNS propagation checking', description: 'Check if DNS changes have propagated across the internet' },
    { title: 'Security analysis', description: 'Examine DNS security configurations like DNSSEC' },
    { title: 'Server testing', description: 'Test specific DNS servers for proper configuration and response' }
  ],
  'dir': [
    { title: 'Directory listing', description: 'List files and directories in the current or specified directory' },
    { title: 'File information', description: 'Display detailed file attributes including permissions and size' },
    { title: 'System navigation', description: 'Explore the filesystem structure to locate files' },
    { title: 'File management', description: 'Identify files for operations like copying, moving, or deletion' },
    { title: 'Shell scripting', description: 'Programmatically obtain directory contents in scripts' }
  ],
  'dircolors': [
    { title: 'Terminal customization', description: 'Customize the color scheme for file listings in the terminal' },
    { title: 'Visual file type identification', description: 'Make different file types easily distinguishable by color' },
    { title: 'Shell configuration', description: 'Set up permanent color settings for your shell environment' },
    { title: 'Accessibility improvement', description: 'Enhance terminal readability with custom color schemes' },
    { title: 'User productivity', description: 'Improve file navigation speed by making important files stand out' }
  ],
  'dirname': [
    { title: 'Path manipulation', description: 'Extract the directory portion from a file path' },
    { title: 'Shell scripting', description: 'Build robust scripts that work with file paths' },
    { title: 'Directory navigation', description: 'Change to parent directories of specific files' },
    { title: 'File operations', description: 'Perform operations on directories containing specific files' },
    { title: 'Path standardization', description: 'Process and standardize path formats in scripts' }
  ],
  'dirs': [
    { title: 'Directory navigation', description: 'View and manage the directory stack for quick navigation' },
    { title: 'Multi-directory workflow', description: 'Efficiently work between multiple directories without typing full paths' },
    { title: 'Shell history', description: 'Track previously visited directories for easy return' },
    { title: 'Script path management', description: 'Manage directory context in shell scripts' },
    { title: 'Directory bookmarking', description: 'Use the directory stack as a bookmarking system for important locations' }
  ],
  'ls': [
    { title: 'Directory listing', description: 'List files and directories in a directory' },
    { title: 'File information', description: 'Display detailed information about files and directories' },
    { title: 'Hidden files', description: 'Include hidden files in the listing' },
    { title: 'Human-readable sizes', description: 'Display sizes in a human-readable format' },
    { title: 'Long listing format', description: 'Display detailed information in a long format' }
  ],
  'grep': [
    { title: 'Text searching', description: 'Search for patterns in text files or output' },
    { title: 'Log analysis', description: 'Extract relevant information from log files' },
    { title: 'Code review', description: 'Find specific patterns or strings in source code' },
    { title: 'Data filtering', description: 'Filter and extract specific data from large datasets' },
    { title: 'Text processing', description: 'Manipulate text data in scripts or pipelines' }
  ],
  'cd': [
    { title: 'Directory navigation', description: 'Change the current working directory' },
    { title: 'Path traversal', description: 'Navigate through the filesystem hierarchy' },
    { title: 'Scripting', description: 'Use in shell scripts to change directories programmatically' },
    { title: 'File management', description: 'Easily access and manipulate files in different directories' },
    { title: 'Command execution', description: 'Execute commands in specific directories' }
  ],
  'mkdir': [
    { title: 'Directory creation', description: 'Create new directories in the filesystem' },
    { title: 'File organization', description: 'Organize files and directories hierarchically' },
    { title: 'Project setup', description: 'Create project directories for new projects' },
    { title: 'Temporary directories', description: 'Create temporary directories for temporary files' },
    { title: 'Scripting', description: 'Use in shell scripts to create directories programmatically' }
  ],
  'rmdir': [
    { title: 'Directory removal', description: 'Remove empty directories from the filesystem' },
    { title: 'Cleanup', description: 'Remove unnecessary or temporary directories' },
    { title: 'Scripting', description: 'Use in shell scripts to remove directories programmatically' },
    { title: 'File management', description: 'Manage directories and files in the filesystem' },
    { title: 'Security', description: 'Prevent unauthorized access to sensitive directories' }
  ],
  'rm': [
    { title: 'File removal', description: 'Permanently delete files from the filesystem' },
    { title: 'Cleanup', description: 'Remove unnecessary or temporary files' },
    { title: 'Security', description: 'Securely erase sensitive data from disks' },
    { title: 'Scripting', description: 'Use in shell scripts to remove files programmatically' },
    { title: 'Data management', description: 'Manage files and directories in the filesystem' }
  ],
  'find': [
    { title: 'File searching', description: 'Search for files and directories based on various criteria' },
    { title: 'File management', description: 'Find and manipulate files in the filesystem' },
    { title: 'Scripting', description: 'Use in shell scripts to search and process files programmatically' },
    { title: 'Data recovery', description: 'Recover lost or deleted files' },
    { title: 'Security', description: 'Find and remove sensitive or unauthorized files' }
  ],
  'awk': [
    { title: 'Text processing', description: 'Manipulate text data and extract information' },
    { title: 'Data analysis', description: 'Perform complex data analysis and transformations' },
    { title: 'Scripting', description: 'Use in shell scripts to process text data programmatically' },
    { title: 'Log analysis', description: 'Analyze log files and extract relevant information' },
    { title: 'Report generation', description: 'Generate reports based on processed data' }
  ],
  'sed': [
    { title: 'Text editing', description: 'Perform search and replace operations on text data' },
    { title: 'Data transformation', description: 'Transform and modify data in various formats' },
    { title: 'Scripting', description: 'Use in shell scripts to edit text data programmatically' },
    { title: 'Configuration files', description: 'Modify configuration files automatically' },
    { title: 'Text processing', description: 'Manipulate text data in pipelines and scripts' }
  ],
  'tr': [
    { title: 'Text translation', description: 'Translate or delete characters in text data' },
    { title: 'Text processing', description: 'Manipulate text data in pipelines and scripts' },
    { title: 'Data cleaning', description: 'Clean and sanitize text data' },
    { title: 'Scripting', description: 'Use in shell scripts to process text data programmatically' },
    { title: 'Character set conversion', description: 'Convert between different character sets' }
  ],
  'col': [
    { title: 'Column formatting', description: 'Format and align text columns' },
    { title: 'Text processing', description: 'Manipulate text data in pipelines and scripts' },
    { title: 'Report generation', description: 'Generate reports with formatted columns' },
    { title: 'Scripting', description: 'Use in shell scripts to format text data programmatically' },
    { title: 'Data presentation', description: 'Present data in a structured and readable format' }
  ],
  'expand': [
    { title: 'Tab expansion', description: 'Convert tabs to spaces in text data' },
    { title: 'Text processing', description: 'Manipulate text data in pipelines and scripts' },
    { title: 'Data cleaning', description: 'Clean and sanitize text data' },
    { title: 'Scripting', description: 'Use in shell scripts to process text data programmatically' },
    { title: 'File format conversion', description: 'Convert between different file formats' }
  ],
  'unexpand': [
    { title: 'Space compression', description: 'Convert spaces to tabs in text data' },
    { title: 'Text processing', description: 'Manipulate text data in pipelines and scripts' },
    { title: 'Data cleaning', description: 'Clean and sanitize text data' },
    { title: 'Scripting', description: 'Use in shell scripts to process text data programmatically' },
    { title: 'File format conversion', description: 'Convert between different file formats' }
  ],
  'pr': [
    { title: 'Text pagination', description: 'Format text data for printing' },
    { title: 'Report generation', description: 'Generate reports with page breaks and headers' },
    { title: 'Scripting', description: 'Use in shell scripts to format text data programmatically' },
    { title: 'Text processing', description: 'Manipulate text data in pipelines and scripts' },
    { title: 'Data presentation', description: 'Present data in a structured and readable format' }
  ],
  'fmt': [
    { title: 'Text formatting', description: 'Format text data for optimal readability' },
    { title: 'Report generation', description: 'Generate reports with optimal line wrapping' },
    { title: 'Scripting', description: 'Use in shell scripts to format text data programmatically' },
    { title: 'Text processing', description: 'Manipulate text data in pipelines and scripts' },
    { title: 'Data presentation', description: 'Present data in a structured and readable format' }
  ],
  'groff': [
    { title: 'Document formatting', description: 'Create formatted documents using the groff typesetting system' },
    { title: 'Report generation', description: 'Generate professional-quality reports and documents' },
    { title: 'Scripting', description: 'Use in shell scripts to generate formatted documents programmatically' },
    { title: 'Document processing', description: 'Manipulate and transform document data' },
    { title: 'Typesetting', description: 'Create high-quality typeset documents' }
  ],
  'nroff': [
    { title: 'Document formatting', description: 'Create formatted documents using the nroff typesetting system' },
    { title: 'Report generation', description: 'Generate professional-quality reports and documents' },
    { title: 'Scripting', description: 'Use in shell scripts to generate formatted documents programmatically' },
    { title: 'Document processing', description: 'Manipulate and transform document data' },
    { title: 'Typesetting', description: 'Create high-quality typeset documents' }
  ],
  'troff': [
    { title: 'Document formatting', description: 'Create formatted documents using the troff typesetting system' },
    { title: 'Report generation', description: 'Generate professional-quality reports and documents' },
    { title: 'Scripting', description: 'Use in shell scripts to generate formatted documents programmatically' },
    { title: 'Document processing', description: 'Manipulate and transform document data' },
    { title: 'Typesetting', description: 'Create high-quality typeset documents' }
  ],
  'man': [
    { title: 'Manual pages', description: 'Display manual pages for commands and utilities' },
    { title: 'Documentation', description: 'Access detailed documentation for installed software' },
    { title: 'Command reference', description: 'Quickly look up command syntax and options' },
    { title: 'Learning', description: 'Learn about new commands and utilities' },
    { title: 'Troubleshooting', description: 'Get help with common issues and errors' }
  ],
  'info': [
    { title: 'Info documentation', description: 'Display Info documentation for installed software' },
    { title: 'Detailed guides', description: 'Access comprehensive guides and tutorials' },
    { title: 'Learning', description: 'Learn about advanced topics and concepts' },
    { title: 'Navigation', description: 'Navigate through documentation using hyperlinks' },
    { title: 'Customization', description: 'Customize Info documentation for personal use' }
  ],
  'whatis': [
    { title: 'Command description', description: 'Display a one-line description of a command' },
    { title: 'Quick reference', description: 'Get a brief overview of a command' },
    { title: 'Learning', description: 'Learn about new commands and utilities' },
    { title: 'Scripting', description: 'Use in shell scripts to dynamically retrieve command descriptions' },
    { title: 'Documentation', description: 'Access basic documentation for installed software' }
  ],
  'help': [
    { title: 'Command help', description: 'Display help information for a command' },
    { title: 'Quick reference', description: 'Get a brief overview of command usage' },
    { title: 'Learning', description: 'Learn about new commands and utilities' },
    { title: 'Scripting', description: 'Use in shell scripts to dynamically retrieve command help' },
    { title: 'Documentation', description: 'Access basic documentation for installed software' }
  ],
  'apropos': [
    { title: 'Command search', description: 'Search for commands related to a specific topic' },
    { title: 'Keyword search', description: 'Find commands based on keywords' },
    { title: 'Learning', description: 'Discover new commands and utilities' },
    { title: 'Scripting', description: 'Use in shell scripts to dynamically search for commands' },
    { title: 'Documentation', description: 'Access basic documentation for installed software' }
  ],
  'mandb': [
    { title: 'Manual database', description: 'Update the manual database for faster command lookup' },
    { title: 'Performance', description: 'Improve the speed of manual page searches' },
    { title: 'System maintenance', description: 'Keep the manual database up-to-date' },
    { title: 'Scripting', description: 'Use in shell scripts to update the manual database programmatically' },
    { title: 'Documentation', description: 'Manage and maintain the manual database' }
  ],
  'updatedb': [
    { title: 'File database', description: 'Update the file database for faster file location' },
    { title: 'Performance', description: 'Improve the speed of file searches' },
    { title: 'System maintenance', description: 'Keep the file database up-to-date' },
    { title: 'Scripting', description: 'Use in shell scripts to update the file database programmatically' },
    { title: 'File management', description: 'Manage and maintain the file database' }
  ],
  'locate': [
    { title: 'File search', description: 'Search for files and directories based on name' },
    { title: 'Quick lookup', description: 'Find files quickly without traversing the filesystem' },
    { title: 'Scripting', description: 'Use in shell scripts to search for files programmatically' },
    { title: 'File management', description: 'Locate and manage files in the filesystem' },
    { title: 'Data recovery', description: 'Recover lost or deleted files' }
  ],
  'mlocate': [
    { title: 'File search', description: 'Search for files and directories based on name' },
    { title: 'Quick lookup', description: 'Find files quickly without traversing the filesystem' },
    { title: 'Scripting', description: 'Use in shell scripts to search for files programmatically' },
    { title: 'File management', description: 'Locate and manage files in the filesystem' },
    { title: 'Data recovery', description: 'Recover lost or deleted files' }
  ],
  'which': [
    { title: 'Command location', description: 'Find the location of executable files in the system' },
    { title: 'Path resolution', description: 'Determine which version of a command is being executed' },
    { title: 'Scripting', description: 'Use in shell scripts to dynamically locate commands' },
    { title: 'Troubleshooting', description: 'Diagnose issues with command execution' },
    { title: 'Security', description: 'Prevent execution of malicious commands' }
  ],
  'echo': [
    { title: 'Text output', description: 'Display text on the console or write to files' },
    { title: 'Scripting', description: 'Use in shell scripts to output text or variables' },
    { title: 'Debugging', description: 'Print variables or debug information' },
    { title: 'Automation', description: 'Automate text output in scripts' },
    { title: 'Data processing', description: 'Manipulate and transform text data' }
  ],
  'tee': [
    { title: 'Text redirection', description: 'Redirect output to both the console and files' },
    { title: 'Logging', description: 'Capture output for logging and debugging' },
    { title: 'Scripting', description: 'Use in shell scripts to redirect output programmatically' },
    { title: 'Data processing', description: 'Manipulate and transform text data' },
    { title: 'Automation', description: 'Automate text redirection in scripts' }
  ],
  'dd': [
    { title: 'Data duplication', description: 'Copy and convert data between files or devices' },
    { title: 'Disk cloning', description: 'Create exact copies of disks or partitions' },
    { title: 'Data recovery', description: 'Recover data from damaged or corrupted disks' },
    { title: 'Scripting', description: 'Use in shell scripts to automate data duplication' },
    { title: 'Data manipulation', description: 'Manipulate and transform data streams' }
  ],
  'cp': [
    { title: 'File copying', description: 'Copy files and directories' },
    { title: 'Backup', description: 'Create backups of important files and directories' },
    { title: 'Data migration', description: 'Move files between systems or locations' },
    { title: 'Scripting', description: 'Use in shell scripts to automate file copying' },
    { title: 'File management', description: 'Manage files and directories in the filesystem' }
  ],
  'mv': [
    { title: 'File moving', description: 'Move or rename files and directories' },
    { title: 'File organization', description: 'Organize files and directories hierarchically' },
    { title: 'Data migration', description: 'Move files between systems or locations' },
    { title: 'Scripting', description: 'Use in shell scripts to automate file moving' },
    { title: 'File management', description: 'Manage files and directories in the filesystem' }
  ],
  'ps': [
    { title: 'Process monitoring', description: 'Display information about running processes' },
    { title: 'Resource usage', description: 'Monitor CPU, memory, and I/O usage of processes' },
    { title: 'Troubleshooting', description: 'Diagnose issues with running processes' },
    { title: 'Scripting', description: 'Use in shell scripts to monitor and manage processes' },
    { title: 'System administration', description: 'Manage and optimize system resources' }
  ],
  'top': [
    { title: 'Process monitoring', description: 'Display dynamic information about running processes' },
    { title: 'Resource usage', description: 'Monitor CPU, memory, and I/O usage of processes' },
    { title: 'Troubleshooting', description: 'Diagnose issues with running processes' },
    { title: 'Scripting', description: 'Use in shell scripts to monitor and manage processes' },
    { title: 'System administration', description: 'Manage and optimize system resources' }
  ],
  'htop': [
    { title: 'Process monitoring', description: 'Display dynamic information about running processes' },
    { title: 'Resource usage', description: 'Monitor CPU, memory, and I/O usage of processes' },
    { title: 'Troubleshooting', description: 'Diagnose issues with running processes' },
    { title: 'Scripting', description: 'Use in shell scripts to monitor and manage processes' },
    { title: 'System administration', description: 'Manage and optimize system resources' }
  ],
  'kill': [
    { title: 'Process termination', description: 'Send signals to terminate processes' },
    { title: 'Resource management', description: 'Manage system resources by terminating processes' },
    { title: 'Scripting', description: 'Use in shell scripts to terminate processes programmatically' },
    { title: 'Troubleshooting', description: 'Resolve issues with unresponsive or misbehaving processes' },
    { title: 'Security', description: 'Prevent unauthorized access to system resources' }
  ],
  'killall': [
    { title: 'Process termination', description: 'Terminate processes by name' },
    { title: 'Resource management', description: 'Manage system resources by terminating processes' },
    { title: 'Scripting', description: 'Use in shell scripts to terminate processes programmatically' },
    { title: 'Troubleshooting', description: 'Resolve issues with unresponsive or misbehaving processes' },
    { title: 'Security', description: 'Prevent unauthorized access to system resources' }
  ],
  'rsync': [
    { title: 'File synchronization', description: 'Synchronize files and directories between systems' },
    { title: 'Backup', description: 'Create backups of important files and directories' },
    { title: 'Data migration', description: 'Move files between systems or locations' },
    { title: 'Scripting', description: 'Use in shell scripts to automate file synchronization' },
    { title: 'File management', description: 'Manage files and directories in the filesystem' }
  ],
  'scp': [
    { title: 'Secure file copy', description: 'Copy files securely between systems over SSH' },
    { title: 'Data transfer', description: 'Transfer files between systems securely and efficiently' },
    { title: 'Scripting', description: 'Use in shell scripts to automate secure file copying' },
    { title: 'File management', description: 'Manage files and directories in the filesystem' },
    { title: 'Security', description: 'Ensure secure data transfer between systems' }
  ],
  'sftp': [
    { title: 'Secure file transfer', description: 'Transfer files securely between systems over SSH' },
    { title: 'File management', description: 'Manage files and directories in the filesystem' },
    { title: 'Scripting', description: 'Use in shell scripts to automate secure file transfer' },
    { title: 'Data transfer', description: 'Transfer files between systems securely and efficiently' },
    { title: 'Security', description: 'Ensure secure data transfer between systems' }
  ],
  'ssh': [
    { title: 'Secure shell', description: 'Establish secure remote shell connections' },
    { title: 'Remote administration', description: 'Administer remote systems securely' },
    { title: 'Scripting', description: 'Use in shell scripts to automate remote tasks' },
    { title: 'Data transfer', description: 'Transfer files between systems securely and efficiently' },
    { title: 'Security', description: 'Ensure secure communication between systems' }
  ],
  'ssh-keygen': [
    { title: 'SSH key generation', description: 'Generate SSH keys for secure authentication' },
    { title: 'Security', description: 'Ensure secure communication between systems' },
    { title: 'Scripting', description: 'Use in shell scripts to automate SSH key generation' },
    { title: 'Remote administration', description: 'Administer remote systems securely' },
    { title: 'Data transfer', description: 'Transfer files between systems securely and efficiently' }
  ],
  'ssh-add': [
    { title: 'SSH key management', description: 'Add SSH keys to the SSH agent for password-less authentication' },
    { title: 'Security', description: 'Ensure secure communication between systems' },
    { title: 'Scripting', description: 'Use in shell scripts to automate SSH key management' },
    { title: 'Remote administration', description: 'Administer remote systems securely' },
    { title: 'Data transfer', description: 'Transfer files between systems securely and efficiently' }
  ],
  'ssh-agent': [
    { title: 'SSH key management', description: 'Manage SSH keys in the SSH agent for password-less authentication' },
    { title: 'Security', description: 'Ensure secure communication between systems' },
    { title: 'Scripting', description: 'Use in shell scripts to automate SSH key management' },
    { title: 'Remote administration', description: 'Administer remote systems securely' },
    { title: 'Data transfer', description: 'Transfer files between systems securely and efficiently' }
  ],
  'ssh-copy-id': [
    { title: 'SSH key deployment', description: 'Copy SSH keys to remote systems for password-less authentication' },
    { title: 'Security', description: 'Ensure secure communication between systems' },
    { title: 'Scripting', description: 'Use in shell scripts to automate SSH key deployment' },
    { title: 'Remote administration', description: 'Administer remote systems securely' },
    { title: 'Data transfer', description: 'Transfer files between systems securely and efficiently' }
  ],
  'authorized-keys': [
    { title: 'SSH key management', description: 'Manage authorized SSH keys for secure authentication' },
    { title: 'Security', description: 'Ensure secure communication between systems' },
    { title: 'Scripting', description: 'Use in shell scripts to automate SSH key management' },
    { title: 'Remote administration', description: 'Administer remote systems securely' },
    { title: 'Data transfer', description: 'Transfer files between systems securely and efficiently' }
  ],
  'wget': [
    { title: 'File download', description: 'Download files from the web' },
    { title: 'Data transfer', description: 'Transfer files between systems efficiently' },
    { title: 'Scripting', description: 'Use in shell scripts to automate file downloads' },
    { title: 'Web scraping', description: 'Download data from websites for analysis' },
    { title: 'Backup', description: 'Create backups of important files and directories' }
  ],
  'ftp': [
    { title: 'File transfer', description: 'Transfer files between systems using the FTP protocol' },
    { title: 'Data transfer', description: 'Transfer files between systems efficiently' },
    { title: 'Scripting', description: 'Use in shell scripts to automate file transfers' },
    { title: 'File management', description: 'Manage files and directories in the filesystem' },
    { title: 'Security', description: 'Ensure secure data transfer between systems' }
  ],
  'a2enmod': [
    { title: 'Apache module enablement', description: 'Enable Apache modules to add functionality' },
    { title: 'Web server configuration', description: 'Configure the Apache web server' },
    { title: 'Scripting', description: 'Use in shell scripts to automate module enablement' },
    { title: 'Performance', description: 'Optimize web server performance' },
    { title: 'Security', description: 'Enhance web server security' }
  ],
  'a2ensite': [
    { title: 'Apache site enablement', description: 'Enable Apache sites to serve content' },
    { title: 'Web server configuration', description: 'Configure the Apache web server' },
    { title: 'Scripting', description: 'Use in shell scripts to automate site enablement' },
    { title: 'Web hosting', description: 'Host multiple websites on a single server' },
    { title: 'Load balancing', description: 'Balance traffic across multiple servers' }
  ],
  'a2dismod': [
    { title: 'Apache module disablement', description: 'Disable Apache modules to remove functionality' },
    { title: 'Web server configuration', description: 'Configure the Apache web server' },
    { title: 'Scripting', description: 'Use in shell scripts to automate module disablement' },
    { title: 'Performance', description: 'Optimize web server performance' },
    { title: 'Security', description: 'Enhance web server security' }
  ],
  'a2dissite': [
    { title: 'Apache site disablement', description: 'Disable Apache sites to stop serving content' },
    { title: 'Web server configuration', description: 'Configure the Apache web server' },
    { title: 'Scripting', description: 'Use in shell scripts to automate site disablement' },
    { title: 'Web hosting', description: 'Host multiple websites on a single server' },
    { title: 'Load balancing', description: 'Balance traffic across multiple servers' }
  ],
  'dump': [
    { title: 'Full system backups', description: 'Create complete backups of entire filesystems for disaster recovery' },
    { title: 'Incremental backups', description: 'Perform regular incremental backups to minimize backup size and time' },
    { title: 'Tape archive management', description: 'Back up filesystems to tape devices for long-term storage' },
    { title: 'Selective backups', description: 'Back up specific directories or files while preserving permissions and attributes' },
    { title: 'Backup scheduling', description: 'Automate regular backups based on filesystem usage patterns' }
  ],
  'dumpe2fs': [
    { title: 'Filesystem inspection', description: 'Examine ext2/3/4 filesystem metadata and structure' },
    { title: 'Disk troubleshooting', description: 'Diagnose issues with filesystem structure or corruption' },
    { title: 'Superblock recovery', description: 'Identify backup superblocks for filesystem recovery' },
    { title: 'Filesystem tuning', description: 'Analyze filesystem parameters before making adjustments with tune2fs' },
    { title: 'Bad block identification', description: 'Locate blocks marked as bad in the filesystem' }
  ],
  'ed': [
    { title: 'Script-based editing', description: 'Edit files programmatically in shell scripts' },
    { title: 'Minimal environment editing', description: 'Edit text files in recovery or limited environments' },
    { title: 'Legacy system maintenance', description: 'Maintain compatibility with older Unix scripts and systems' },
    { title: 'Regular expression processing', description: 'Process text using powerful regular expressions' },
    { title: 'Emergency file editing', description: 'Edit configuration files when other editors are unavailable' }
  ],
  'egrep': [
    { title: 'Complex pattern matching', description: 'Search for complex patterns using extended regular expressions' },
    { title: 'Multiple pattern search', description: 'Search for multiple patterns in a single command using alternation' },
    { title: 'Code analysis', description: 'Find and analyze code patterns across multiple files' },
    { title: 'Log file parsing', description: 'Extract specific information from log files using powerful regex' },
    { title: 'Data extraction', description: 'Pull out structured data from text files using capture groups' }
  ],
  'eject': [
    { title: 'Media removal', description: 'Safely eject CD/DVD discs from optical drives' },
    { title: 'USB device unmounting', description: 'Safely remove USB storage devices to prevent data loss' },
    { title: 'Tray control', description: 'Open or close CD/DVD drive trays programmatically' },
    { title: 'Device management', description: 'Manage removable media in headless or server environments' },
    { title: 'Automating media handling', description: 'Script media insertion and removal in automated systems' }
  ],
  'enable': [
    { title: 'Shell customization', description: 'Enable or disable built-in commands to customize shell behavior' },
    { title: 'Command precedence control', description: 'Control whether a built-in or external command is used' },
    { title: 'Script compatibility', description: 'Ensure consistent command behavior across different systems' },
    { title: 'Shell extension', description: 'Load new built-in commands from shared libraries' },
    { title: 'Shell debugging', description: 'Modify shell behavior for testing and diagnostics' }
  ],
  'env': [
    { title: 'Environment inspection', description: 'Display all environment variables to troubleshoot configuration issues' },
    { title: 'Isolated command execution', description: 'Run commands with a clean or customized environment' },
    { title: 'Temporary variable modification', description: 'Change environment variables for a single command without affecting the shell' },
    { title: 'Script portability', description: 'Ensure consistent environment settings across different systems' },
    { title: 'Debugging', description: 'Identify environment-related issues in applications and scripts' }
  ],
  'ethtool': [
    { title: 'Network troubleshooting', description: 'Diagnose network connectivity and performance issues' },
    { title: 'Hardware identification', description: 'Identify network interfaces using the blinking LED feature' },
    { title: 'Performance optimization', description: 'Configure NIC settings for optimal network performance' },
    { title: 'Hardware testing', description: 'Run self-tests on network interfaces to verify functionality' },
    { title: 'Driver inspection', description: 'View detailed information about network device drivers' }
  ],
  'eval': [
    { title: 'Dynamic command execution', description: 'Execute commands constructed at runtime' },
    { title: 'Variable indirection', description: 'Access variables whose names are stored in other variables' },
    { title: 'Command output processing', description: 'Execute the output of a command as shell code' },
    { title: 'Complex command construction', description: 'Build and execute complex commands programmatically' },
    { title: 'Shell initialization', description: 'Process configuration commands from initialization scripts' }
  ],
  'exec': [
    { title: 'Process replacement', description: 'Replace the current shell with another program without creating a new process' },
    { title: 'Resource conservation', description: 'Avoid creating nested processes in scripts' },
    { title: 'File descriptor manipulation', description: 'Permanently redirect I/O for the remainder of a script' },
    { title: 'Shell script chaining', description: 'Transfer control from one script to another without returning' },
    { title: 'Daemon startup', description: 'Launch daemon processes with specific environment configurations' }
  ],
  'exit': [
    { title: 'Script termination', description: 'End script execution with a specific status code' },
    { title: 'Error handling', description: 'Exit scripts when errors occur to prevent further processing' },
    { title: 'Shell termination', description: 'Close the current shell session' },
    { title: 'Conditional termination', description: 'Exit scripts based on specific conditions or user input' },
    { title: 'Program status reporting', description: 'Communicate success or failure to parent processes' }
  ],
  'export': [
    { title: 'Environment configuration', description: 'Make variables available to all child processes' },
    { title: 'Program configuration', description: 'Set up environment variables to control program behavior' },
    { title: 'Development setup', description: 'Configure development environments with appropriate variables' },
    { title: 'Path management', description: 'Modify PATH and other search path variables for command lookup' },
    { title: 'Shell customization', description: 'Set persistent variables for shell behavior and appearance' }
  ],
  'nvidia-smi': [
    { title: 'AI/ML Workload Monitoring', description: 'Monitor GPU utilization, memory usage, and temperature during model training or inference' },
    { title: 'CUDA Development', description: 'Debug CUDA applications, check GPU availability, and verify CUDA installation' },
    { title: 'Resource Management', description: 'Monitor GPU memory usage and temperature to prevent thermal throttling and OOM errors' },
    { title: 'Performance Tuning', description: 'Identify bottlenecks, optimize GPU usage, and balance load across multiple GPUs' },
    { title: 'System Administration', description: 'Check GPU health, driver status, and hardware information for system maintenance' }
  ],
  'nvcc': [
    { title: 'CUDA Application Development', description: 'Compile CUDA kernels and host code for GPU-accelerated applications' },
    { title: 'GPU Programming', description: 'Build and optimize GPU-accelerated programs for high-performance computing' },
    { title: 'Multi-Architecture Support', description: 'Create binaries that run on multiple GPU generations for compatibility' },
    { title: 'Performance Optimization', description: 'Use different optimization levels and compute architectures for benchmarking' },
    { title: 'CUDA Debugging', description: 'Generate debug symbols and PTX code for debugging GPU applications' }
  ],
  'nvidia-settings': [
    { title: 'Display Configuration', description: 'Configure resolution, refresh rate, and multi-monitor setup for NVIDIA GPUs' },
    { title: 'GPU Performance Tuning', description: 'Adjust clock speeds, power limits, and performance modes for optimal performance' },
    { title: 'Fan Control', description: 'Manually control GPU fan speeds for temperature management (if supported)' },
    { title: 'Power Management', description: 'Configure power modes and limits to optimize power consumption and performance' },
    { title: 'System Integration', description: 'Configure NVIDIA settings for specific applications and workloads' }
  ],
  'nvidia-debugdump': [
    { title: 'Troubleshooting', description: 'Collect comprehensive diagnostic information for NVIDIA support and bug reporting' },
    { title: 'Driver Issues', description: 'Debug driver installation, compatibility problems, and configuration issues' },
    { title: 'Hardware Diagnostics', description: 'Verify GPU hardware functionality and identify hardware-related problems' },
    { title: 'System Analysis', description: 'Analyze GPU configuration and system state for optimization' },
    { title: 'Bug Reporting', description: 'Generate detailed debug information for bug reports and technical support' }
  ],
  'nvidia-persistenced': [
    { title: 'Performance Optimization', description: 'Reduce GPU initialization latency for faster application startup' },
    { title: 'CUDA Applications', description: 'Improve startup time and performance for CUDA programs and GPU workloads' },
    { title: 'GPU Workloads', description: 'Maintain driver state for frequent GPU access in multi-user environments' },
    { title: 'AI/ML Training', description: 'Speed up model training initialization and reduce overhead' },
    { title: 'Server Environments', description: 'Optimize GPU server performance for continuous workloads' }
  ],
  'lspci': [
    { title: 'Hardware Detection', description: 'Identify all PCI devices including NVIDIA GPUs in the system' },
    { title: 'GPU Verification', description: 'Verify NVIDIA GPU presence, model, and PCI bus assignment' },
    { title: 'Driver Debugging', description: 'Check if GPU drivers are loaded correctly and identify hardware issues' },
    { title: 'System Diagnostics', description: 'Troubleshoot hardware detection issues and PCI bus problems' },
    { title: 'Multi-GPU Systems', description: 'Identify all GPUs in systems with multiple graphics cards' }
  ],
  'lsmod': [
    { title: 'Driver Verification', description: 'Verify NVIDIA drivers are properly loaded into the kernel' },
    { title: 'Module Dependencies', description: 'Check module dependencies, usage count, and kernel module state' },
    { title: 'Troubleshooting', description: 'Diagnose driver loading issues and module conflicts' },
    { title: 'System Monitoring', description: 'Monitor kernel module state and resource usage' },
    { title: 'Resource Analysis', description: 'Check module memory usage and identify memory-intensive modules' }
  ],
  'gpustat': [
    { title: 'Quick GPU Monitoring', description: 'Get fast, colorized overview of GPU status, utilization, and memory usage' },
    { title: 'Development Workflow', description: 'Monitor GPU usage during development with clean, readable output' },
    { title: 'System Administration', description: 'Track GPU utilization and processes across multiple users' },
    { title: 'Performance Analysis', description: 'Identify GPU-intensive processes and analyze usage patterns' },
    { title: 'Multi-GPU Systems', description: 'Monitor multiple GPUs simultaneously with unified display' }
  ],
  'glxinfo': [
    { title: 'GPU Acceleration Verification', description: 'Verify GPU acceleration is working and OpenGL is properly configured' },
    { title: 'OpenGL Testing', description: 'Check OpenGL capabilities, version, and supported extensions' },
    { title: 'Driver Verification', description: 'Confirm GPU drivers are providing OpenGL support correctly' },
    { title: 'Performance Testing', description: 'Verify hardware acceleration is enabled for graphics applications' },
    { title: 'Troubleshooting', description: 'Diagnose rendering issues and OpenGL configuration problems' }
  ],
  'cat-proc-driver-nvidia-gpus-information': [
    { title: 'Hardware Details', description: 'Get detailed GPU hardware information directly from the NVIDIA driver' },
    { title: 'Driver Debugging', description: 'Verify driver recognition of GPU hardware and check driver state' },
    { title: 'Multi-GPU Systems', description: 'Check information for each GPU separately in multi-GPU setups' },
    { title: 'System Diagnostics', description: 'Perform low-level hardware diagnostics and troubleshooting' },
    { title: 'Driver Development', description: 'Access driver internal information for development and debugging' }
  ],
  'cat-proc-driver-nvidia-version': [
    { title: 'Driver Verification', description: 'Verify NVIDIA driver is loaded and check exact driver version' },
    { title: 'Version Checking', description: 'Check driver version number for compatibility and troubleshooting' },
    { title: 'Troubleshooting', description: 'Verify driver installation correctness and identify version mismatches' },
    { title: 'Scripting', description: 'Use in scripts to check driver availability and version programmatically' },
    { title: 'Compatibility', description: 'Verify driver version for CUDA and application compatibility checks' }
  ],
  'watch-nvidia-smi': [
    { title: 'Real-time Monitoring', description: 'Continuously monitor GPU status during workloads with automatic updates' },
    { title: 'Training Monitoring', description: 'Watch GPU metrics in real-time during ML model training' },
    { title: 'Performance Analysis', description: 'Monitor GPU usage patterns over time and identify trends' },
    { title: 'Troubleshooting', description: 'Real-time diagnostics during GPU issues and performance problems' },
    { title: 'Resource Management', description: 'Track GPU utilization and processes in multi-user systems' }
  ],
  'nvprof': [
    { title: 'Performance Analysis', description: 'Analyze CUDA kernel execution times and identify performance bottlenecks' },
    { title: 'Memory Optimization', description: 'Track memory transfers and identify inefficient memory access patterns' },
    { title: 'Code Optimization', description: 'Identify slow kernels and optimize CUDA code for better performance' },
    { title: 'Profiling Workflows', description: 'Generate profiling reports for performance tuning and optimization' },
    { title: 'API Debugging', description: 'Trace CUDA API calls for debugging and identifying overhead issues' }
  ],
  'devicequery': [
    { title: 'CUDA Installation Verification', description: 'Verify CUDA installation and GPU detection in the system' },
    { title: 'GPU Capabilities', description: 'Check compute capability and CUDA version support for compatibility' },
    { title: 'Multi-GPU Systems', description: 'Identify all CUDA-capable GPUs and their capabilities in multi-GPU setups' },
    { title: 'Compatibility Checking', description: 'Verify GPU compatibility with CUDA applications and frameworks' },
    { title: 'Hardware Information', description: 'Get detailed GPU hardware specifications and compute capabilities' }
  ],
  'bandwidthtest': [
    { title: 'Performance Benchmarking', description: 'Measure GPU memory bandwidth and transfer speeds for performance analysis' },
    { title: 'System Tuning', description: 'Identify memory performance bottlenecks and optimize PCIe/GPU memory performance' },
    { title: 'Hardware Validation', description: 'Verify GPU memory subsystem performance and hardware functionality' },
    { title: 'Optimization', description: 'Compare pinned vs pageable memory performance for optimal configurations' },
    { title: 'Multi-GPU Testing', description: 'Test memory bandwidth on multiple GPUs and PCIe configurations' }
  ],
  'nvidia-bug-report-sh': [
    { title: 'Bug Reporting', description: 'Generate comprehensive diagnostic reports for NVIDIA support and bug tracking' },
    { title: 'Troubleshooting', description: 'Collect complete system and driver information for troubleshooting GPU issues' },
    { title: 'System Diagnostics', description: 'Get detailed system configuration snapshot for diagnostic purposes' },
    { title: 'Support Requests', description: 'Provide detailed information for NVIDIA technical support requests' },
    { title: 'Driver Issues', description: 'Document driver-related problems with complete system state information' }
  ],
  'nvidia-healthmon': [
    { title: 'Health Monitoring', description: 'Monitor GPU health status in data center and enterprise environments' },
    { title: 'Temperature Tracking', description: 'Monitor GPU temperatures and detect overheating or cooling issues' },
    { title: 'Power Monitoring', description: 'Track power consumption and efficiency for power management' },
    { title: 'Frequency Monitoring', description: 'Monitor GPU clock frequencies and performance states' },
    { title: 'Automated Diagnostics', description: 'Integrate into monitoring systems for automated health checks' }
  ],
  'nvidia-xconfig': [
    { title: 'X Server Configuration', description: 'Configure X server for NVIDIA GPUs with proper driver settings' },
    { title: 'Multi-GPU Setup', description: 'Configure systems with multiple NVIDIA GPUs for optimal display configuration' },
    { title: 'Display Configuration', description: 'Set up multi-monitor and custom display modes for NVIDIA GPUs' },
    { title: 'Driver Settings', description: 'Apply custom NVIDIA driver settings and configurations to X server' },
    { title: 'System Setup', description: 'Initial NVIDIA GPU configuration for X server and display management' }
  ],
  'nvidia-modprobe': [
    { title: 'Module Loading', description: 'Load NVIDIA kernel modules when needed for GPU access' },
    { title: 'Device File Creation', description: 'Create /dev/nvidia* device files with proper permissions for CUDA access' },
    { title: 'CUDA Setup', description: 'Ensure CUDA applications can access GPU devices with correct permissions' },
    { title: 'Multi-User Systems', description: 'Set up proper permissions for non-root GPU access in shared systems' },
    { title: 'System Initialization', description: 'Configure GPU access and device nodes during system boot' }
  ],
  'nvidia-detector': [
    { title: 'GPU Detection', description: 'Quickly check if NVIDIA GPUs are present and detected in the system' },
    { title: 'Driver Verification', description: 'Verify NVIDIA driver installation and compatibility status' },
    { title: 'Script Integration', description: 'Use in scripts and automation to detect NVIDIA hardware programmatically' },
    { title: 'Troubleshooting', description: 'Diagnose GPU detection issues and hardware recognition problems' },
    { title: 'System Setup', description: 'Verify GPU presence during initial system setup and driver installation' }
  ],
  'prime-select': [
    { title: 'Power Management', description: 'Switch to integrated GPU for power saving on laptops with hybrid graphics' },
    { title: 'Performance', description: 'Switch to NVIDIA GPU for maximum performance for GPU-intensive workloads' },
    { title: 'Hybrid Graphics', description: 'Manage dual-GPU laptop configurations for optimal performance and battery life' },
    { title: 'Battery Life', description: 'Optimize battery life by using integrated GPU when GPU power is not needed' },
    { title: 'GPU Offloading', description: 'Use PRIME offloading to run specific applications on discrete GPU' }
  ],
  'torchrun': [
    { title: 'Multi-GPU Training', description: 'Launch distributed PyTorch training across multiple GPUs on a single node' },
    { title: 'Multi-Node Training', description: 'Scale PyTorch training across multiple machines and nodes' },
    { title: 'Deep Learning', description: 'Train large deep learning models requiring multiple GPUs for distributed training' },
    { title: 'Distributed Computing', description: 'Run distributed PyTorch workloads across GPU clusters' },
    { title: 'Production Training', description: 'Launch production machine learning training pipelines with fault tolerance' }
  ],
  'deepspeed': [
    { title: 'Large Model Training', description: 'Train massive language models using ZeRO optimization across multiple GPUs' },
    { title: 'Memory Optimization', description: 'Use ZeRO stages to train models that exceed single GPU memory capacity' },
    { title: 'Distributed Training', description: 'Scale training to multiple nodes with efficient parameter distribution' },
    { title: 'CPU Offloading', description: 'Offload optimizer states to CPU for even larger model training' },
    { title: 'Gradient Checkpointing', description: 'Enable automatic gradient checkpointing for memory-efficient training' }
  ],
  'horovodrun': [
    { title: 'PyTorch Distributed', description: 'Launch distributed PyTorch training with efficient ring-allreduce communication' },
    { title: 'TensorFlow Distributed', description: 'Scale TensorFlow training across multiple GPUs and nodes' },
    { title: 'Multi-Node Training', description: 'Coordinate training across multiple machines with automatic worker discovery' },
    { title: 'Efficient Communication', description: 'Use tensor fusion for optimized gradient synchronization' },
    { title: 'Framework Agnostic', description: 'Distributed training that works with PyTorch, TensorFlow, and Keras' }
  ],
  'nvlink': [
    { title: 'Topology Analysis', description: 'Check NVLink topology and GPU interconnect configuration' },
    { title: 'Performance Optimization', description: 'Understand GPU communication paths for optimizing multi-GPU training' },
    { title: 'Hardware Verification', description: 'Verify NVLink connections and bandwidth between GPUs' },
    { title: 'Bandwidth Monitoring', description: 'Monitor NVLink bandwidth utilization during multi-GPU workloads' },
    { title: 'Multi-GPU Setup', description: 'Configure and verify optimal GPU interconnect for distributed training' }
  ],
  'nsys': [
    { title: 'Performance Profiling', description: 'System-wide performance analysis of GPU and CPU activities' },
    { title: 'Timeline Analysis', description: 'Visualize kernel launches, memory transfers, and API calls over time' },
    { title: 'Bottleneck Identification', description: 'Identify performance bottlenecks across application stack' },
    { title: 'API Tracing', description: 'Trace CUDA, cuBLAS, and cuDNN API calls for debugging' },
    { title: 'Optimization', description: 'Analyze application performance to optimize GPU utilization' }
  ],
  'ncu': [
    { title: 'Kernel Profiling', description: 'Detailed profiling of individual CUDA kernels for optimization' },
    { title: 'Occupancy Analysis', description: 'Analyze warp occupancy and thread block efficiency' },
    { title: 'Memory Analysis', description: 'Identify memory access patterns and throughput bottlenecks' },
    { title: 'Performance Metrics', description: 'Get detailed GPU metrics like speed of light and utilization' },
    { title: 'Source Correlation', description: 'Correlate performance metrics with source code for optimization' }
  ],
  'perf': [
    { title: 'System Profiling', description: 'Profile CPU and system events during GPU workloads' },
    { title: 'Driver Tracing', description: 'Trace GPU driver system calls and ioctl operations' },
    { title: 'CPU Overhead', description: 'Analyze CPU-side overhead in GPU applications' },
    { title: 'I/O Analysis', description: 'Profile I/O wait and memory transfer overhead' },
    { title: 'Complete Analysis', description: 'Combine CPU and GPU profiling for complete performance picture' }
  ],
  'rocm-smi': [
    { title: 'AMD GPU Monitoring', description: 'Monitor AMD GPU status, utilization, and health metrics' },
    { title: 'Temperature Monitoring', description: 'Track GPU temperature to prevent overheating' },
    { title: 'Power Management', description: 'Monitor power consumption and optimize GPU power usage' },
    { title: 'Memory Tracking', description: 'Monitor GPU memory usage and allocation patterns' },
    { title: 'Performance Analysis', description: 'Analyze AMD GPU performance metrics during workloads' }
  ],
  'rocminfo': [
    { title: 'GPU Information', description: 'Display detailed AMD GPU hardware specifications and capabilities' },
    { title: 'ROCm Verification', description: 'Verify ROCm installation and GPU detection' },
    { title: 'Capability Checking', description: 'Check GPU compute capabilities and compatibility' },
    { title: 'Library Versions', description: 'Display ROCm library versions and driver information' },
    { title: 'Hardware Details', description: 'Get comprehensive information about AMD GPU hardware' }
  ],
  'hipcc': [
    { title: 'HIP Compilation', description: 'Compile HIP code for execution on AMD GPUs via ROCm' },
    { title: 'CUDA Porting', description: 'Port CUDA applications to AMD GPUs using HIP compiler' },
    { title: 'AMD GPU Development', description: 'Build GPU-accelerated applications for AMD hardware' },
    { title: 'Cross-Platform Code', description: 'Develop portable GPU code using HIP portability layer' },
    { title: 'ROCm Integration', description: 'Compile applications with automatic ROCm library linking' }
  ],
  'update-pciids': [
    { title: 'Hardware Database Update', description: 'Update PCI ID database to identify new or unknown GPUs correctly' },
    { title: 'GPU Recognition', description: 'Ensure accurate GPU name display in lspci and hardware tools' },
    { title: 'New Device Support', description: 'Add support for recently released graphics cards and hardware' },
    { title: 'Device Identification', description: 'Fix unknown device issues by updating device ID mappings' },
    { title: 'System Maintenance', description: 'Keep hardware identification database current for accurate diagnostics' }
  ],
  'lshw': [
    { title: 'GPU Information', description: 'Display detailed GPU model, memory, and PCI bus information' },
    { title: 'Hardware Inventory', description: 'Export complete hardware configuration including all GPUs' },
    { title: 'System Diagnostics', description: 'Troubleshoot GPU detection and hardware identification issues' },
    { title: 'Hardware Documentation', description: 'Generate comprehensive system hardware reports' },
    { title: 'Driver Verification', description: 'Check GPU driver and kernel module information' }
  ],
  'inxi': [
    { title: 'Quick GPU Info', description: 'Get concise GPU information including model and driver version' },
    { title: 'System Summary', description: 'View complete system overview including GPU and display details' },
    { title: 'Driver Check', description: 'Verify GPU driver installation and version quickly' },
    { title: 'OpenGL Information', description: 'Check OpenGL version and renderer information' },
    { title: 'Display Configuration', description: 'View display resolution, refresh rate, and configuration' }
  ],
  'prime-run': [
    { title: 'Discrete GPU Selection', description: 'Run specific applications on high-performance discrete GPU' },
    { title: 'Gaming Performance', description: 'Launch games on discrete GPU for optimal frame rates' },
    { title: 'GPU-Accelerated Apps', description: 'Run GPU-intensive applications (Blender, video editing) on discrete GPU' },
    { title: 'Power Management', description: 'Use integrated GPU for desktop, discrete GPU only when needed' },
    { title: 'CUDA Applications', description: 'Run CUDA workloads on NVIDIA discrete GPU' }
  ],
  'glmark2': [
    { title: 'OpenGL Benchmarking', description: 'Measure OpenGL performance and compare GPU performance' },
    { title: 'Driver Testing', description: 'Test graphics driver performance and stability' },
    { title: 'GPU Capabilities', description: 'Verify OpenGL feature support and capabilities' },
    { title: 'Performance Comparison', description: 'Compare OpenGL performance across different GPUs or drivers' },
    { title: 'Regression Testing', description: 'Test for performance regressions after driver or system updates' }
  ],
  'vulkaninfo': [
    { title: 'Vulkan Verification', description: 'Verify Vulkan installation and GPU support' },
    { title: 'Capability Checking', description: 'Check Vulkan features, extensions, and API version support' },
    { title: 'Driver Information', description: 'Display Vulkan driver version and implementation details' },
    { title: 'Extension Support', description: 'Verify required Vulkan extensions for applications' },
    { title: 'Debugging', description: 'Diagnose Vulkan application issues and compatibility problems' }
  ],
  'clinfo': [
    { title: 'OpenCL Verification', description: 'Verify OpenCL installation and GPU compute device detection' },
    { title: 'Compute Capabilities', description: 'Check GPU compute units, work-group sizes, and capabilities' },
    { title: 'Version Support', description: 'Check supported OpenCL version and extension support' },
    { title: 'Device Information', description: 'Display detailed information about all OpenCL-capable devices' },
    { title: 'Debugging', description: 'Debug OpenCL application issues and device compatibility' }
  ],
  'dxdiag': [
    { title: 'GPU Information', description: 'Display detailed GPU and driver information on Windows' },
    { title: 'DirectX Verification', description: 'Verify DirectX installation and version support' },
    { title: 'Driver Details', description: 'Check graphics driver version, date, and installation status' },
    { title: 'Troubleshooting', description: 'Diagnose Windows graphics issues and compatibility problems' },
    { title: 'System Report', description: 'Generate complete system and graphics diagnostic report' }
  ],
  'wmic': [
    { title: 'GPU Query', description: 'Query GPU information from Windows command line' },
    { title: 'Scripted Information', description: 'Retrieve GPU details in batch scripts and automation' },
    { title: 'Hardware Inventory', description: 'Collect GPU information for system inventory and asset management' },
    { title: 'Driver Version Check', description: 'Programmatically check graphics driver version' },
    { title: 'Remote Queries', description: 'Query GPU information from remote Windows systems' }
  ],
  'get-ciminstance': [
    { title: 'PowerShell GPU Info', description: 'Query GPU information using modern PowerShell cmdlets' },
    { title: 'Automated Scripting', description: 'Retrieve GPU details in PowerShell scripts and automation' },
    { title: 'Hardware Management', description: 'Manage and query GPU information in system administration tasks' },
    { title: 'Modern WMI Queries', description: 'Use CIM/WMI to query GPU hardware (replacement for deprecated wmic)' },
    { title: 'Flexible Formatting', description: 'Format GPU information output in various PowerShell formats (list, table, CSV)' }
  ],
  'huggingface-cli': [
    { title: 'Hub Management', description: 'Manage models, datasets, and spaces on Hugging Face Hub from command line' },
    { title: 'Authentication', description: 'Login and authenticate with Hugging Face account for API access' },
    { title: 'CLI Workflows', description: 'Automate ML workflows and integrate Hugging Face Hub into scripts' },
    { title: 'CI/CD Integration', description: 'Integrate Hugging Face operations into continuous integration pipelines' },
    { title: 'Quick Access', description: 'Access Hugging Face Hub features directly from terminal without web interface' }
  ],
  'huggingface-cli-repo': [
    { title: 'Create Repositories', description: 'Create new model, dataset, or space repositories on Hugging Face Hub' },
    { title: 'Clone Repos', description: 'Clone Hugging Face repositories for local development and editing' },
    { title: 'Repository Management', description: 'Manage repository visibility, organization, and settings' },
    { title: 'Setup Projects', description: 'Quickly set up new ML project repositories with proper structure' },
    { title: 'Organization Workflows', description: 'Create repositories under organizations for team collaboration' }
  ],
  'huggingface-cli-upload': [
    { title: 'Model Deployment', description: 'Upload model weights, checkpoints, and artifacts to Hugging Face Hub' },
    { title: 'Dataset Sharing', description: 'Upload datasets and data files for sharing with the ML community' },
    { title: 'Version Control', description: 'Update repositories with new versions and commit changes' },
    { title: 'Large Files', description: 'Upload large model files with automatic Git LFS handling' },
    { title: 'CI/CD Deployment', description: 'Automate model and dataset uploads in continuous deployment pipelines' }
  ],
  'huggingface-cli-download': [
    { title: 'Model Download', description: 'Download pre-trained models for local use and fine-tuning' },
    { title: 'Dataset Access', description: 'Download datasets for training and research purposes' },
    { title: 'Selective Downloads', description: 'Download specific files (config, tokenizer) without full model' },
    { title: 'Caching', description: 'Leverage automatic caching for faster subsequent downloads' },
    { title: 'Offline Development', description: 'Download models once for offline development and experimentation' }
  ],
  'huggingface-cli-model': [
    { title: 'Model Discovery', description: 'Browse and discover models for specific ML tasks and use cases' },
    { title: 'Model Information', description: 'View detailed model metadata, cards, and documentation' },
    { title: 'Browse by Author', description: 'Explore models published by specific authors or organizations' },
    { title: 'Model Metrics', description: 'Check model performance metrics and evaluation results' },
    { title: 'Model Selection', description: 'Compare and select appropriate models for projects' }
  ],
  'huggingface-cli-dataset': [
    { title: 'Dataset Discovery', description: 'Find datasets for specific ML tasks and research domains' },
    { title: 'Dataset Information', description: 'View dataset cards, metadata, and usage documentation' },
    { title: 'Browse Collections', description: 'Explore datasets from organizations and research groups' },
    { title: 'Dataset Evaluation', description: 'Check dataset size, structure, and quality before use' },
    { title: 'Research Data', description: 'Access datasets for ML research and benchmark evaluation' }
  ],
  'huggingface-cli-space': [
    { title: 'Deploy Applications', description: 'Create and deploy interactive ML demos and applications' },
    { title: 'Gradio Apps', description: 'Deploy Gradio-based interactive ML applications on Hugging Face' },
    { title: 'Streamlit Apps', description: 'Host Streamlit applications on Hugging Face Spaces' },
    { title: 'Model Showcases', description: 'Create interactive demos to showcase ML models' },
    { title: 'Free Hosting', description: 'Host ML applications with free GPU allocation for demos' }
  ],
  'huggingface-cli-search': [
    { title: 'Model Discovery', description: 'Search for models by task, library, or keywords' },
    { title: 'Dataset Finding', description: 'Find datasets matching specific criteria and use cases' },
    { title: 'Advanced Filtering', description: 'Filter search results by metadata, author, or organization' },
    { title: 'Popular Content', description: 'Discover popular models and datasets sorted by downloads or likes' },
    { title: 'Quick Discovery', description: 'Efficiently find relevant ML resources for projects' }
  ],
  'huggingface-cli-inference': [
    { title: 'Quick Testing', description: 'Test models via Inference API without downloading locally' },
    { title: 'Model Evaluation', description: 'Quickly evaluate model performance on sample inputs' },
    { title: 'API Integration', description: 'Test Inference API integration before implementation' },
    { title: 'Model Comparison', description: 'Compare multiple models quickly via API calls' },
    { title: 'Prototyping', description: 'Prototype ML applications without local model setup' }
  ],
  'huggingface-cli-cache': [
    { title: 'Disk Management', description: 'Monitor and manage disk space used by cached models and datasets' },
    { title: 'Cache Cleanup', description: 'Remove old or unused cached files to free up storage space' },
    { title: 'Cache Optimization', description: 'Optimize cache size with size limits and access-based pruning' },
    { title: 'Storage Monitoring', description: 'View cache size and location for storage planning' },
    { title: 'Offline Access', description: 'Manage cached content for offline development workflows' }
  ],
  'huggingface-cli-config': [
    { title: 'Custom Cache', description: 'Configure custom cache directory location for models and datasets' },
    { title: 'Enterprise Setup', description: 'Configure CLI for Hugging Face Enterprise Hub endpoints' },
    { title: 'Default Settings', description: 'Set default repository types and CLI preferences' },
    { title: 'Environment Setup', description: 'Configure CLI for different development environments' },
    { title: 'Configuration Viewing', description: 'View and verify current CLI configuration settings' }
  ],
  'huggingface-cli-org': [
    { title: 'Organization Browsing', description: 'Discover models and datasets from specific organizations' },
    { title: 'Team Management', description: 'View organization members and structure' },
    { title: 'Content Discovery', description: 'Browse repositories published by companies or research groups' },
    { title: 'Research Access', description: 'Access models and datasets from research institutions' },
    { title: 'Enterprise Content', description: 'Explore content from enterprise and organizational accounts' }
  ],
  'modinfo': [
    { title: 'Driver Inspection', description: 'Inspect AMDGPU kernel module details and parameters' },
    { title: 'Version Check', description: 'Check amdgpu driver version and build information' },
    { title: 'Troubleshooting', description: 'Verify module path and dependencies for debugging' },
    { title: 'Kernel Compatibility', description: 'Review supported kernel versions and signatures' },
    { title: 'Parameter Discovery', description: 'Discover tunable module parameters for performance/debug' }
  ],
  'amd-smi': [
    { title: 'GPU Overview', description: 'View high-level AMD GPU status and metrics' },
    { title: 'Temperature & Power', description: 'Check temperature, power draw, and limits' },
    { title: 'Clock Management', description: 'Inspect clocks and DPM states (where supported)' },
    { title: 'Fleet Monitoring', description: 'Baseline multi-GPU systems quickly' },
    { title: 'Automation', description: 'Scriptable AMD GPU health checks in CI/ops' }
  ],
  'amdgpu-top': [
    { title: 'Live Monitoring', description: 'Monitor AMD GPU utilization, clocks, and VRAM live in TUI' },
    { title: 'Performance Debugging', description: 'Spot throttling or underutilization during workloads' },
    { title: 'Thermal Analysis', description: 'Watch thermals and fan response under load' },
    { title: 'Benchmark Observation', description: 'Observe metrics while running benchmarks' },
    { title: 'Headless Monitoring', description: 'Lightweight terminal-based monitoring on servers' }
  ],
  'radeontop': [
    { title: 'Block Utilization', description: 'View per-block usage (3D, UVD/VCE, memory) on AMD GPUs' },
    { title: 'Lightweight Monitor', description: 'Minimal overhead tool for quick checks' },
    { title: 'Driver Validation', description: 'Validate GPU activity with amdgpu/radeon drivers' },
    { title: 'Regression Detection', description: 'Identify performance regressions after updates' },
    { title: 'Scripting Output', description: 'Use in scripts to log utilization over time' }
  ],
  'rocgdb': [
    { title: 'Kernel Debugging', description: 'Debug HIP kernels running on AMD GPUs' },
    { title: 'Breakpoints & Stepping', description: 'Set breakpoints in GPU code and step through execution' },
    { title: 'State Inspection', description: 'Inspect GPU memory, registers, and variables' },
    { title: 'Crash Diagnosis', description: 'Investigate kernel crashes or incorrect results' },
    { title: 'Toolchain Integration', description: 'Integrate with ROCm toolchain for dev workflows' }
  ],
  'hipify-perl': [
    { title: 'CUDA to HIP', description: 'Quickly translate simple CUDA codebases to HIP' },
    { title: 'Porting Kickstart', description: 'Bootstrap AMD GPU support for existing CUDA projects' },
    { title: 'Selective Conversion', description: 'Convert individual files or snippets for testing' },
    { title: 'Diff Review', description: 'Produce HIP diffs for code review discussions' },
    { title: 'Education', description: 'Demonstrate mapping between CUDA and HIP APIs' }
  ],
  'hipify-clang': [
    { title: 'Project-Scale Porting', description: 'Translate larger CUDA projects using Clang-based parser' },
    { title: 'Build System Integration', description: 'Integrate with CMake and compile_commands.json' },
    { title: 'Accurate Parsing', description: 'Handle complex macros and templates better than perl variant' },
    { title: 'Incremental Migration', description: 'Port modules incrementally and validate' },
    { title: 'Modernization', description: 'Update code to HIP idioms while preserving behavior' }
  ],
  'rocprof': [
    { title: 'Counter Collection', description: 'Collect GPU hardware counters for HIP/OpenCL kernels' },
    { title: 'Timeline Tracing', description: 'Trace kernel launches and HSA/hip activity over time' },
    { title: 'Bottleneck Analysis', description: 'Identify memory or compute bottlenecks from counters' },
    { title: 'Regression Checks', description: 'Compare runs across commits to catch perf regressions' },
    { title: 'Report Generation', description: 'Export stats for sharing with performance teams' }
  ],
  'rocprofv2': [
    { title: 'Next-Gen Profiling', description: 'Use improved tooling for newer ROCm stacks' },
    { title: 'HIP/HSA Traces', description: 'Capture traces with better schema and stability' },
    { title: 'Scalable Workflows', description: 'Run profiling in CI and large test matrices' },
    { title: 'Detailed Analysis', description: 'Deeper insights with updated collectors' },
    { title: 'Migration Path', description: 'Transition from rocprof with minimal changes' }
  ],
  'rocm-bandwidth-test': [
    { title: 'PCIe Validation', description: 'Validate PCIe/xGMI bandwidth to GPUs' },
    { title: 'NUMA Effects', description: 'Measure bandwidth vs NUMA locality' },
    { title: 'Peer-to-Peer', description: 'Assess inter-GPU copy bandwidth' },
    { title: 'Baseline Systems', description: 'Create bandwidth baselines for clusters' },
    { title: 'Regression Detection', description: 'Catch bandwidth drops after updates' }
  ],
  'rocblas-bench': [
    { title: 'GEMM Throughput', description: 'Benchmark BLAS operations (e.g., GEMM) on AMD GPUs' },
    { title: 'Tuning & Shapes', description: 'Explore matrix sizes and tuning parameters' },
    { title: 'Model Prep', description: 'Size BLAS workloads for DL/ML models' },
    { title: 'Hardware Compare', description: 'Compare performance across GPUs or nodes' },
    { title: 'CI Benchmarks', description: 'Track perf in CI for changes to math libs' }
  ],
  'rocfft-test': [
    { title: 'Correctness Tests', description: 'Validate FFT results for various sizes/dimensions' },
    { title: 'Feature Checks', description: 'Ensure required transforms are available' },
    { title: 'Perf Smoke', description: 'Quick performance sanity checks' },
    { title: 'Bug Isolation', description: 'Reproduce FFT issues for debugging' },
    { title: 'Upgrade Safety', description: 'Verify after ROCm/library upgrades' }
  ],
  'rocfft-rider': [
    { title: 'Throughput Bench', description: 'Measure FFT throughput across sizes' },
    { title: 'Kernel Selection', description: 'Observe algorithm choices and impacts' },
    { title: 'Capacity Planning', description: 'Inform system sizing for FFT-heavy apps' },
    { title: 'GPU Comparison', description: 'Compare GPUs/drivers for FFT workloads' },
    { title: 'CI Performance', description: 'Automate FFT benchmarks in CI' }
  ],
  'miopen-driver': [
    { title: 'DNN Benchmarking', description: 'Benchmark conv/pool/bn via MIOpen' },
    { title: 'Algorithm Search', description: 'Exercise find-db and algo selection' },
    { title: 'Model Shaping', description: 'Tune tensor shapes for target GPUs' },
    { title: 'Regression Tracking', description: 'Detect perf changes in DL kernels' },
    { title: 'Hardware Baselines', description: 'Establish DL baselines per GPU' }
  ],
  'amdgpu-install': [
    { title: 'Driver Install', description: 'Install AMDGPU/ROCm stack on supported distros' },
    { title: 'Usecase Profiles', description: 'Install subsets (OpenCL, Vulkan, ROCm)' },
    { title: 'Cluster Setup', description: 'Automate installs for multi-node environments' },
    { title: 'Troubleshooting', description: 'Resolve install issues with clear flags' },
    { title: 'Upgrade Paths', description: 'Plan safe upgrades between ROCm releases' }
  ],
  'python': [
    { title: 'Run Scripts', description: 'Execute Python scripts and applications' },
    { title: 'Interactive REPL', description: 'Use the Python interactive shell for quick tests' },
    { title: 'Module Execution', description: 'Run modules with -m for reliable interpreter pairing' },
    { title: 'Version Check', description: 'Check interpreter version and build options' },
    { title: 'Stdlib Tools', description: 'Leverage stdlib entry points (http.server, venv)' }
  ],
  'python3': [
    { title: 'Explicit Python 3', description: 'Ensure Python 3 interpreter on all systems' },
    { title: 'Shebang Consistency', description: 'Use python3 in shebangs for portability' },
    { title: 'Venv Creation', description: 'Create venvs via python3 -m venv' },
    { title: 'Package Mgmt', description: 'Use python3 -m pip to manage packages' },
    { title: 'Script Launch', description: 'Run Python 3 apps and tooling explicitly' }
  ],
  'pyenv': [
    { title: 'Version Management', description: 'Install and switch between Python versions' },
    { title: 'Project Isolation', description: 'Pin per-project Python versions with pyenv local' },
    { title: 'Global Default', description: 'Set global Python version for user shell' },
    { title: 'Dev/Test Matrix', description: 'Test across multiple Python versions' },
    { title: 'Shim Control', description: 'Ensure commands resolve via pyenv shims' }
  ],
  'deactivate': [
    { title: 'Exit Venv', description: 'Leave the currently active virtual environment' },
    { title: 'Reset PATH', description: 'Restore PATH to system interpreter' },
    { title: 'Context Switch', description: 'Switch between environments cleanly' },
    { title: 'Scripting', description: 'Use in scripts to end venv scopes' },
    { title: 'Troubleshooting', description: 'Fix misrouted interpreter due to lingering venv' }
  ],
  'pip': [
    { title: 'Install Packages', description: 'Install dependencies from PyPI and elsewhere' },
    { title: 'Freeze/Lock', description: 'Export exact versions to requirements.txt' },
    { title: 'Show/List', description: 'Inspect installed packages and versions' },
    { title: 'Build Wheels', description: 'Build wheels for distribution or caching' },
    { title: 'Scoped Pip', description: 'Use python -m pip to target interpreter' }
  ],
  'conda': [
    { title: 'Create Envs', description: 'Create isolated environments with specific Python versions' },
    { title: 'Binary Packages', description: 'Install prebuilt scientific stacks via channels' },
    { title: 'Export/Import', description: 'Share envs with environment.yml' },
    { title: 'Channel Mgmt', description: 'Use conda-forge or custom channels' },
    { title: 'Activation', description: 'Activate/deactivate envs reliably' }
  ],
  'poetry': [
    { title: 'Dependency Mgmt', description: 'Manage deps via pyproject.toml and lock file' },
    { title: 'Per-Project Venv', description: 'Automatic virtualenvs for projects' },
    { title: 'Run Tasks', description: 'Run commands within the project env' },
    { title: 'Build/Publish', description: 'Build and publish packages to PyPI' },
    { title: 'Reproducibility', description: 'Lock dependencies for consistent installs' }
  ],
  'pipenv': [
    { title: 'Pip+Venv Combo', description: 'Manage packages and virtualenv together' },
    { title: 'Pipfile Locking', description: 'Use Pipfile.lock for reproducible environments' },
    { title: 'Run & Shell', description: 'Execute commands and spawn shell in env' },
    { title: 'Python Selection', description: 'Choose interpreter for the env' },
    { title: 'Graph Deps', description: 'Inspect dependency graph and conflicts' }
  ],
  'pipdeptree': [
    { title: 'Dependency Tree', description: 'Visualize package dependency relationships' },
    { title: 'Conflict Detection', description: 'Identify conflicting requirements' },
    { title: 'Reverse Lookup', description: 'Find which packages depend on a given one' },
    { title: 'JSON Output', description: 'Export machine-readable tree for tools' },
    { title: 'Cleanup', description: 'Spot unused or redundant dependencies' }
  ],
  'python-m': [
    { title: 'Interpreter Pairing', description: 'Ensure tooling runs under the correct interpreter' },
    { title: 'Module Entry Points', description: 'Run modules like pip, venv, http.server' },
    { title: 'Path Reliability', description: 'Avoid PATH confusion across envs' },
    { title: 'Scripting', description: 'Use -m in scripts for portability' },
    { title: 'One-Liners', description: 'Quickly run useful stdlib modules' }
  ],
  'jupyter': [
    { title: 'Notebook/Lab', description: 'Launch Jupyter Notebook or Lab' },
    { title: 'Kernel Mgmt', description: 'Manage kernels and troubleshoot' },
    { title: 'nbconvert', description: 'Convert notebooks to HTML/PDF/Markdown' },
    { title: 'Server Ops', description: 'Run Jupyter on a server for remote work' },
    { title: 'Data Science', description: 'Interactive analysis and visualization' }
  ],
  'ipython': [
    { title: 'Enhanced REPL', description: 'Use magics, completion, and debugging' },
    { title: 'Script Debugging', description: 'Run scripts interactively with -i' },
    { title: 'Interactive Dev', description: 'Iterate quickly on code and ideas' },
    { title: 'Jupyter Integration', description: 'Leverage IPython features in notebooks' },
    { title: 'Productivity', description: 'History, macros, and extensions' }
  ],
  'virtualenv': [
    { title: 'Isolated Envs', description: 'Create isolated Python environments' },
    { title: 'Custom Interpreter', description: 'Choose interpreter version per env' },
    { title: 'Performance', description: 'Faster, feature-rich alternative to venv' },
    { title: 'System Site-Packages', description: 'Optionally inherit system packages' },
    { title: 'Prompt Customization', description: 'Customize env prompt names' }
  ],
  'tensorboard': [
    { title: 'Training Metrics', description: 'Visualize loss, accuracy, and custom scalars over time' },
    { title: 'Graphs', description: 'Inspect computation graphs and dataflow' },
    { title: 'Profiler', description: 'Analyze performance traces in the Profile tab' },
    { title: 'Embeddings', description: 'Visualize embedding spaces interactively' },
    { title: 'Experiment Tracking', description: 'Compare multiple training runs' }
  ],
  'tf-upgrade-v2': [
    { title: 'Automated Migration', description: 'Migrate TF1 codebases to TF2 APIs' },
    { title: 'Report Generation', description: 'Produce a detailed migration report' },
    { title: 'Batch Upgrade', description: 'Upgrade entire source trees' },
    { title: 'Compat Strategy', description: 'Leverage compat.v1 for incremental migration' },
    { title: 'Refactor Aid', description: 'Reduce manual API rename workload' }
  ],
  'tflite-convert': [
    { title: 'Edge Deployment', description: 'Convert models for mobile/edge devices' },
    { title: 'Quantization', description: 'Apply int8/float16 quantization to reduce size/latency' },
    { title: 'SavedModel/Keras', description: 'Convert from SavedModel or Keras formats' },
    { title: 'GraphDef Conversion', description: 'Fallback conversion from frozen GraphDef' },
    { title: 'Compatibility Tests', description: 'Validate converted models with target runtime' }
  ],
  'saved-model-cli': [
    { title: 'Model Inspection', description: 'List signatures, inputs, outputs, and tags' },
    { title: 'Sanity Inference', description: 'Run inference with provided npz inputs' },
    { title: 'Export Validation', description: 'Validate exported models before serving' },
    { title: 'Signature Debug', description: 'Debug signature definitions and shapes' },
    { title: 'Pipeline QA', description: 'Check artifacts produced by pipelines' }
  ],
  'tf-profiler': [
    { title: 'Performance Tracing', description: 'Capture and analyze training/inference traces' },
    { title: 'Bottleneck ID', description: 'Identify CPU/GPU hotspots and stalls' },
    { title: 'TensorBoard Integration', description: 'View traces in TensorBoard Profile' },
    { title: 'Programmatic Profiling', description: 'Start/stop profiling from code' },
    { title: 'Regression Tracking', description: 'Compare traces across commits' }
  ],
  'tf-experimental-async-scope': [
    { title: 'Async Execution', description: 'Run code in an async scope for throughput' },
    { title: 'Input Pipelines', description: 'Improve tf.data pipeline performance' },
    { title: 'Training Speed', description: 'Overlap execution to reduce stalls' },
    { title: 'Selective Use', description: 'Apply around targeted blocks' },
    { title: 'Advanced Tuning', description: 'Combine with autotune and XLA' }
  ],
  'tf-compat-v1-train-saver-save': [
    { title: 'Checkpointing', description: 'Save model checkpoints in TF1/compat.v1 flows' },
    { title: 'Legacy Support', description: 'Maintain older graph-based models' },
    { title: 'Migration Path', description: 'Stage migration towards TF2 Checkpoint' },
    { title: 'Recovery', description: 'Enable training resume after interruptions' },
    { title: 'Experiment Tracking', description: 'Store periodic checkpoints with global_step' }
  ],
  'torchrun': [
    { title: 'Single-node Multi-GPU', description: 'Launch N GPU processes on one node for DDP' },
    { title: 'Multi-node Training', description: 'Coordinate distributed runs across nodes' },
    { title: 'Elastic Jobs', description: 'Use rendezvous backends for resilient jobs' },
    { title: 'Configurable Restarts', description: 'Auto-restart failed workers up to limits' },
    { title: 'Migration', description: 'Replace legacy torch.distributed.launch flows' }
  ],
  'torchserve': [
    { title: 'Model Serving', description: 'Serve PyTorch models via REST/GRPC endpoints' },
    { title: 'Model Registry', description: 'Register/update models through management API' },
    { title: 'Scaling', description: 'Scale workers per model for throughput' },
    { title: 'Observability', description: 'Use logs/metrics for operations' },
    { title: 'A/B Testing', description: 'Deploy multiple model versions' }
  ],
  'torch-model-archiver': [
    { title: 'Package Models', description: 'Build .mar artifacts for TorchServe' },
    { title: 'Custom Handlers', description: 'Bundle custom inference handlers' },
    { title: 'Extra Assets', description: 'Include labels and auxiliary files' },
    { title: 'Versioning', description: 'Version models for controlled rollout' },
    { title: 'Reproducibility', description: 'Standardize deployment artifacts' }
  ],
  'torch-tensorboard': [
    { title: 'Logging', description: 'Log scalars/images/histograms from PyTorch' },
    { title: 'Visualization', description: 'Visualize runs in TensorBoard' },
    { title: 'Comparison', description: 'Compare experiments and hyperparameters' },
    { title: 'Graph Export', description: 'Export model graph for inspection' },
    { title: 'Profile Viewing', description: 'View PyTorch profiler traces' }
  ],
  'torch-profiler': [
    { title: 'Operator Profiling', description: 'Analyze CPU/GPU operator timings' },
    { title: 'Trace Export', description: 'Export traces for TensorBoard Profile' },
    { title: 'Bottleneck Analysis', description: 'Identify hotspots and stalls' },
    { title: 'Schedule Capture', description: 'Warmup/active/post schedules' },
    { title: 'Shape Tracking', description: 'Record shapes and stack traces' }
  ],
  'torch-distributed-run': [
    { title: 'Compatibility', description: 'Legacy launcher kept for older codebases' },
    { title: 'Migration Aid', description: 'Bridge to torchrun-based workflows' },
    { title: 'DDP Launch', description: 'Start DDP processes via -m entry point' },
    { title: 'Scripts Support', description: 'Continue to run existing scripts' },
    { title: 'Parity', description: 'Use similar flags to torchrun where applicable' }
  ],
  'torch-utils-tensorboard': [
    { title: 'SummaryWriter', description: 'Log scalars, images, histograms from PyTorch' },
    { title: 'Graph Logging', description: 'Log model graphs for inspection' },
    { title: 'Experiment Tracking', description: 'Organize runs under directories' },
    { title: 'TB Integration', description: 'View logs with tensorboard --logdir' },
    { title: 'Lightweight', description: 'Simple API for common logging needs' }
  ],
  'jax-profiler-start-trace': [
    { title: 'Start Tracing', description: 'Begin JAX profiler trace to a log directory' },
    { title: 'TensorBoard Profile', description: 'Enable viewing traces in TensorBoard' },
    { title: 'Perf Analysis', description: 'Capture training/inference performance' },
    { title: 'Scoped Tracing', description: 'Start before workload to capture region' },
    { title: 'Integration', description: 'Combine with stop_trace to complete session' }
  ],
  'jax-profiler-stop-trace': [
    { title: 'Stop Tracing', description: 'Stop the active JAX profiling session' },
    { title: 'Finalize Logs', description: 'Flush trace data to disk' },
    { title: 'View in TB', description: 'Open TensorBoard to inspect session' },
    { title: 'Session Control', description: 'Manage repeated profiling sessions' },
    { title: 'CI Hooks', description: 'End traces in automated runs' }
  ],
  'jax-debug-print': [
    { title: 'JIT-safe Debug', description: 'Print inside jitted functions' },
    { title: 'Inspect Values', description: 'Display tensors/shapes during transforms' },
    { title: 'Minimal Intrusion', description: 'Debug without breaking JIT/vmap/pmap' },
    { title: 'Conditional Prints', description: 'Add formatted, contextual prints' },
    { title: 'Rapid Iteration', description: 'Speed up debugging of JAX programs' }
  ],
  'keras': [
    { title: 'Version Check', description: 'Verify Keras CLI availability and version' },
    { title: 'Docs Pointer', description: 'Discover related subcommands and help' },
    { title: 'Project Ops', description: 'Placeholder wrapper for Keras project CLIs' },
    { title: 'Getting Started', description: 'Quick entrypoint for local installs' },
    { title: 'Env Validation', description: 'Ensure PATH and install are configured' }
  ],
  'keras-autodoc': [
    { title: 'API Docs', description: 'Generate API docs for Keras modules' },
    { title: 'Templates', description: 'Use custom templates for output' },
    { title: 'Selective Targets', description: 'Document specific objects or modules' },
    { title: 'Docs CI', description: 'Integrate into documentation pipelines' },
    { title: 'Navigation', description: 'Produce structured API pages' }
  ],
  'keras-export': [
    { title: 'SavedModel Export', description: 'Export Keras models to SavedModel' },
    { title: 'Keras Format', description: 'Persist models in .keras format' },
    { title: 'Serving Prep', description: 'Prepare models for serving/inference' },
    { title: 'Conversion Prep', description: 'Prepare for TFLite or ONNX conversion' },
    { title: 'Artifact Management', description: 'Standardize export locations' }
  ],
  'keras-tuner': [
    { title: 'HParams Search', description: 'Run hyperparameter tuning experiments' },
    { title: 'Search Spaces', description: 'Define parameter spaces programmatically' },
    { title: 'Results Tracking', description: 'Log and review trials/results' },
    { title: 'Schedulers', description: 'Use algorithms like Random/Bayes/Hyperband' },
    { title: 'Reproducibility', description: 'Seed and export best runs' }
  ],
  'keras-evaluate': [
    { title: 'Metric Reporting', description: 'Evaluate models and print metrics' },
    { title: 'Batching', description: 'Control batch size and steps' },
    { title: 'Dataset Variants', description: 'Point to various input formats' },
    { title: 'CI Checks', description: 'Automate eval in CI pipelines' },
    { title: 'Regression Tests', description: 'Track metric drift between builds' }
  ],
  'keras-predict': [
    { title: 'Batch Inference', description: 'Run predictions on folders/files' },
    { title: 'Outputs', description: 'Write predictions to JSON/CSV' },
    { title: 'Throughput', description: 'Tune batch sizes for speed' },
    { title: 'Pipelines', description: 'Embed in data processing flows' },
    { title: 'Sanity Checks', description: 'Quickly validate model outputs' }
  ],
  'keras-convert': [
    { title: 'Format Conversion', description: 'Convert between .keras and SavedModel' },
    { title: 'Export Strategy', description: 'Choose formats per deployment target' },
    { title: 'Toolchain Prep', description: 'Prepare for downstream converters' },
    { title: 'Artifact Hygiene', description: 'Standardize output directories' },
    { title: 'Automation', description: 'Automate conversions in CI/CD' }
  ],
  'fastai-ls': [
    { title: 'List Artifacts', description: 'List datasets, models, and experiment files' },
    { title: 'Inventory', description: 'Create quick inventories of project assets' },
    { title: 'Scripting', description: 'Use JSON output for automation' },
    { title: 'Sanity Check', description: 'Verify expected files exist' },
    { title: 'Repo Hygiene', description: 'Surface unused or large artifacts' }
  ],
  'fastai-train': [
    { title: 'Quick Training', description: 'Kick off training runs from a config' },
    { title: 'Hyperparams', description: 'Set epochs, lr, batch size from CLI' },
    { title: 'Reproducibility', description: 'Fix seeds and configs for repeatable runs' },
    { title: 'CI Training', description: 'Small training runs in CI to validate code' },
    { title: 'Baseline Runs', description: 'Establish baselines for datasets' }
  ],
  'fastai-predict': [
    { title: 'Batch Inference', description: 'Predict on folders or file lists' },
    { title: 'Export Outputs', description: 'Save predictions to CSV/JSON' },
    { title: 'Pipelines', description: 'Integrate into data processing pipelines' },
    { title: 'Model QA', description: 'Spot-check predictions for sanity' },
    { title: 'Throughput Tuning', description: 'Adjust batch size for speed' }
  ],
  'fastai-interpret': [
    { title: 'Confusion Matrix', description: 'Generate confusion matrices' },
    { title: 'Top Losses', description: 'Identify and visualize hardest samples' },
    { title: 'Error Analysis', description: 'Drill into misclassifications' },
    { title: 'Report Gen', description: 'Export artifacts for reviews' },
    { title: 'Dataset Iteration', description: 'Inform dataset cleanup based on errors' }
  ],
  'fastai-export': [
    { title: 'Export Learner', description: 'Export trained models to export.pkl' },
    { title: 'Reproducible Inference', description: 'Standardize inference artifacts' },
    { title: 'Deployment', description: 'Prepare models for serving tools' },
    { title: 'Versioning', description: 'Version exports for rollback' },
    { title: 'Archival', description: 'Store artifacts for long-term use' }
  ],
  'fastai-tune': [
    { title: 'HParams Search', description: 'Run hyperparameter tuning jobs' },
    { title: 'Search Control', description: 'Limit trials and set seeds' },
    { title: 'Automation', description: 'Automate searches in CI/CD' },
    { title: 'Result Tracking', description: 'Collect and compare best trials' },
    { title: 'Config-Driven', description: 'Define search in YAML/JSON configs' }
  ],
  'onnxruntime-test': [
    { title: 'Runtime Validation', description: 'Validate ORT builds and operators' },
    { title: 'Env Checks', description: 'Confirm provider availability' },
    { title: 'Release QA', description: 'Smoke tests for new releases' },
    { title: 'CI Gates', description: 'Include in CI to prevent regressions' },
    { title: 'Debugging', description: 'Narrow down failing ops/models' }
  ],
  'onnxruntime-perf-test': [
    { title: 'Latency Tests', description: 'Measure end-to-end latency' },
    { title: 'Throughput', description: 'Assess QPS under different threads/batch' },
    { title: 'EP Comparison', description: 'Compare CPU/CUDA/ROCm/DML providers' },
    { title: 'Tuning', description: 'Tune threads and warmups' },
    { title: 'Benchmark Suites', description: 'Create repeatable benchmark runs' }
  ],
  'onnxruntime-training': [
    { title: 'Training Entry', description: 'Access ORT training subcommands' },
    { title: 'Feature Checks', description: 'Verify training-enabled builds' },
    { title: 'Pipelines', description: 'Integrate with training pipelines' },
    { title: 'Distributed', description: 'Use training with distributed setups' },
    { title: 'Docs Sync', description: 'Align builds with documentation features' }
  ],
  'onnxruntime-benchmark': [
    { title: 'Benchmarking', description: 'Run standardized benchmarks on models' },
    { title: 'Iterations', description: 'Control iterations and warmup cycles' },
    { title: 'Batching', description: 'Measure effect of batch sizes' },
    { title: 'Provider Mix', description: 'Select providers for fair comparisons' },
    { title: 'Perf Tracking', description: 'Track performance across releases' }
  ],
  'deepspeed': [
    { title: 'Large-scale Training', description: 'Train massive models with ZeRO optimization' },
    { title: 'Parallelism', description: 'Leverage pipeline/tensor/data parallel strategies' },
    { title: 'Multi-node', description: 'Scale across nodes with hostfile and configs' },
    { title: 'HF Integration', description: 'Combine with Accelerate and Transformers' },
    { title: 'Config-driven', description: 'Manage optimizations via ds_config.json' }
  ],
  'accelerate-config': [
    { title: 'Wizard Setup', description: 'Interactively configure distributed strategy' },
    { title: 'Precision', description: 'Choose bf16/fp16/fp32 mixed precision' },
    { title: 'Topology', description: 'Set processes and machines' },
    { title: 'Storage', description: 'Persist config for future launches' },
    { title: 'Repeatability', description: 'Quickly reconfigure per machine' }
  ],
  'accelerate-launch': [
    { title: 'Distributed Launch', description: 'Start scripts with DDP/FS-DP/Deepspeed' },
    { title: 'Config Use', description: 'Use saved accelerate configs' },
    { title: 'Precision Modes', description: 'Enable mixed precision for speed' },
    { title: 'Multi-GPU', description: 'Launch across multiple GPUs easily' },
    { title: 'Prod/Dev', description: 'Use same command locally and on clusters' }
  ],
  'accelerate-test': [
    { title: 'Sanity Check', description: 'Validate Accelerate setup' },
    { title: 'Device Visibility', description: 'Check GPU/TPU detection' },
    { title: 'Quick Debug', description: 'Catch misconfigurations early' },
    { title: 'Support Reports', description: 'Provide outputs for issue templates' },
    { title: 'CI Gate', description: 'Run as part of pipeline checks' }
  ],
  'accelerate-env': [
    { title: 'Environment Info', description: 'Print relevant versions/backends' },
    { title: 'Debugging', description: 'Diagnose env issues quickly' },
    { title: 'Reproducibility', description: 'Capture environment snapshots' },
    { title: 'Support', description: 'Share details in bug reports' },
    { title: 'Audit', description: 'Confirm correct driver/library setup' }
  ],
  'accelerate-log': [
    { title: 'Run Logs', description: 'Review logs from Accelerate runs' },
    { title: 'Diagnostics', description: 'Extract signals for debugging' },
    { title: 'Monitoring', description: 'Integrate with log tooling' },
    { title: 'History', description: 'Track changes across runs' },
    { title: 'Automation', description: 'Use logs in CI artifacts' }
  ],
  'accelerate': [
    { title: 'Suite Entry', description: 'Access the full Accelerate suite' },
    { title: 'Help/Docs', description: 'Discover subcommands and options' },
    { title: 'Uniform UX', description: 'Consistent interface across systems' },
    { title: 'Install Check', description: 'Confirm package and path' },
    { title: 'Scripting', description: 'Use in scripts and Makefiles' }
  ],
  'colossalai': [
    { title: 'Parallelism Suite', description: 'Explore Colossal-AI tooling' },
    { title: 'Docs/Help', description: 'Check available subcommands' },
    { title: 'Ecosystem', description: 'Use alongside DeepSpeed/Megatron' },
    { title: 'Prototyping', description: 'Try strategies on small models' },
    { title: 'Install Verify', description: 'Ensure CLI is available' }
  ],
  'colossalai-run': [
    { title: 'Distributed Launch', description: 'Run jobs with Colossal-AI' },
    { title: 'Nproc Control', description: 'Set processes per node' },
    { title: 'Configs', description: 'Pass strategy configs' },
    { title: 'Multi-node', description: 'Use hostfile for clusters' },
    { title: 'Benchmark', description: 'Compare strategies quickly' }
  ],
  'ray': [
    { title: 'Cluster Control', description: 'Start/stop Ray clusters' },
    { title: 'Status', description: 'Check cluster health' },
    { title: 'Dashboard', description: 'Access dashboard and logs' },
    { title: 'Local Dev', description: 'Run Ray locally for testing' },
    { title: 'Prod Ops', description: 'Integrate Ray into ops scripts' }
  ],
  'ray-job': [
    { title: 'Job Submit', description: 'Submit jobs to a Ray cluster' },
    { title: 'Logs', description: 'Fetch job logs' },
    { title: 'Manage', description: 'List/stop jobs programmatically' },
    { title: 'CI/CD', description: 'Run training as Ray jobs' },
    { title: 'Remote Exec', description: 'Use cluster address endpoints' }
  ],
  'horovodrun': [
    { title: 'Distributed Train', description: 'Launch Horovod jobs with MPI/Gloo' },
    { title: 'Hosts/Nproc', description: 'Configure processes and hosts' },
    { title: 'Backend Select', description: 'Use gloo or mpi as needed' },
    { title: 'Interoperability', description: 'Work with TF/PyTorch frameworks' },
    { title: 'Scaling', description: 'Scale up with minimal code changes' }
  ],
  'mlflow': [
    { title: 'Tracking UI', description: 'Launch MLflow UI to view runs' },
    { title: 'Projects', description: 'Run MLflow projects' },
    { title: 'Models', description: 'Serve models via MLflow models' },
    { title: 'Artifacts', description: 'Manage artifacts and registries' },
    { title: 'Experimentation', description: 'Organize runs and experiments' }
  ],
  'wandb': [
    { title: 'Login/API', description: 'Authenticate to W&B' },
    { title: 'Sweeps', description: 'Create and run hyperparameter sweeps' },
    { title: 'Agents', description: 'Launch agents to execute sweeps' },
    { title: 'Artifacts', description: 'Track and version datasets/models' },
    { title: 'Dashboards', description: 'Visualize metrics and compare runs' }
  ],
  'ollama': [
    { title: 'Local LLMs', description: 'Run and manage local LLMs easily' },
    { title: 'Model Lifecycle', description: 'Pull, list, and stop models' },
    { title: 'REST Serve', description: 'Serve a local REST API for inference' },
    { title: 'Rapid Prototyping', description: 'Test prompts locally before deploy' },
    { title: 'Offline Use', description: 'Run models without internet access' }
  ],
  'vllm': [
    { title: 'High Throughput', description: 'Serve LLMs with optimized batching' },
    { title: 'OpenAI API', description: 'Expose OpenAI-compatible endpoints' },
    { title: 'GPU Util', description: 'Tune GPU memory utilization' },
    { title: 'Long Context', description: 'Configure max model length' },
    { title: 'Production', description: 'Use behind gateways/load balancers' }
  ],
  'text-generation-launcher': [
    { title: 'TGI Serving', description: 'Serve HF models with optimized kernels' },
    { title: 'Sharding', description: 'Scale with sharded model replicas' },
    { title: 'Batching', description: 'Efficient request batching for throughput' },
    { title: 'CUDA Tuning', description: 'Select dtype and GPU settings' },
    { title: 'REST/gRPC', description: 'Integrate with existing services' }
  ],
  'tensorflow-model-server': [
    { title: 'SavedModel Serving', description: 'Serve TensorFlow models via gRPC/REST' },
    { title: 'Versioned Models', description: 'Host multiple model versions' },
    { title: 'GPU Serving', description: 'Enable GPU memory fraction settings' },
    { title: 'Scaling', description: 'Horizontal scale with orchestrators' },
    { title: 'Health Checks', description: 'Integrate health endpoints for ops' }
  ],
  'uvicorn': [
    { title: 'ASGI Apps', description: 'Serve FastAPI/Starlette apps' },
    { title: 'Workers', description: 'Tune workers for concurrency' },
    { title: 'TLS', description: 'Configure SSL for secure endpoints' },
    { title: 'Reload Dev', description: 'Enable reload during development' },
    { title: 'Reverse Proxy', description: 'Run behind NGINX/Traefik' }
  ],
  'gunicorn': [
    { title: 'WSGI Apps', description: 'Serve Flask/Django inference APIs' },
    { title: 'Workers/Binds', description: 'Control worker count and bindings' },
    { title: 'Timeouts', description: 'Set sane timeouts for long inferences' },
    { title: 'Logs', description: 'Enable access and error logs' },
    { title: 'UvicornWorker', description: 'Use ASGI via UvicornWorker' }
  ],
  'gradio': [
    { title: 'Interactive Demos', description: 'Build quick UI for models' },
    { title: 'Public Sharing', description: 'Share via secure tunnels' },
    { title: 'Auth', description: 'Add simple authentication' },
    { title: 'Spaces', description: 'Deploy to Hugging Face Spaces' },
    { title: 'Prototyping', description: 'Iterate on UX rapidly' }
  ],
  'streamlit': [
    { title: 'Data Apps', description: 'Create dashboards and demos' },
    { title: 'Deploy Easily', description: 'Run locally or in containers' },
    { title: 'State/Cache', description: 'Use caching for performance' },
    { title: 'Inputs/Outputs', description: 'Collect inputs and render outputs' },
    { title: 'Team Demos', description: 'Share results with stakeholders' }
  ],
  'openai': [
    { title: 'Quick Calls', description: 'Test chat/completions from CLI' },
    { title: 'File Ops', description: 'Upload and manage files' },
    { title: 'Fine-tunes', description: 'Manage fine-tune jobs' },
    { title: 'Scripting', description: 'Automate routine API tasks' },
    { title: 'Debugging', description: 'Verify tokens and responses' }
  ],
  'litellm': [
    { title: 'Unified Proxy', description: 'Proxy multiple LLM providers' },
    { title: 'OpenAI API', description: 'Expose a common API surface' },
    { title: 'Config-based', description: 'Define routes/providers via YAML' },
    { title: 'Portability', description: 'Swap providers without code changes' },
    { title: 'Cost Control', description: 'Route traffic by policy/price' }
  ],
  'tritonserver': [
    { title: 'Multi-backend Serving', description: 'Serve TensorRT/ONNX/TF/PT models' },
    { title: 'Dynamic Batching', description: 'Improve throughput with batching' },
    { title: 'Ensembles', description: 'Compose models into pipelines' },
    { title: 'Metrics', description: 'Enable Prometheus/GPU metrics' },
    { title: 'GPU/CPU', description: 'Choose backends per deployment' }
  ],
  'perf-analyzer': [
    { title: 'Latency/Throughput', description: 'Benchmark Triton model performance' },
    { title: 'Concurrency Sweeps', description: 'Find optimal concurrency settings' },
    { title: 'Protocols', description: 'Test over HTTP or gRPC' },
    { title: 'Time Windows', description: 'Stable measurements over windows' },
    { title: 'Capacity Planning', description: 'Estimate production sizing' }
  ],
  'peft-run': [
    { title: 'PEFT Launch', description: 'Kick off parameter-efficient tuning' },
    { title: 'LoRA Config', description: 'Control rank/alpha and outputs' },
    { title: 'Model/Dataset', description: 'Select models and datasets' },
    { title: 'Export', description: 'Export adapters for inference' },
    { title: 'Pipelines', description: 'Integrate into training pipelines' }
  ],
  'bitsandbytes': [
    { title: 'Quantization', description: 'Use 4-bit/8-bit quantization for LLMs' },
    { title: 'Memory Savings', description: 'Fit larger models on GPUs' },
    { title: 'Integration', description: 'Works with Transformers/PEFT' },
    { title: 'GPU Kernels', description: 'Leverage optimized CUDA ops' },
    { title: 'Fallbacks', description: 'Handle compute capability differences' }
  ],
  'langserve': [
    { title: 'Serve Chains', description: 'Expose chains as REST APIs' },
    { title: 'FastAPI', description: 'Run on FastAPI/ASGI servers' },
    { title: 'Reload Dev', description: 'Develop with hot reload' },
    { title: 'Auth/Config', description: 'Configure auth and settings' },
    { title: 'Prod Ready', description: 'Containerize for deployment' }
  ],
  'langchain': [
    { title: 'Project CLI', description: 'Scaffold LangChain projects' },
    { title: 'Serve/Run', description: 'Run or serve workflows' },
    { title: 'Templates', description: 'Use starter templates' },
    { title: 'Integrations', description: 'Plug into vector stores and LLMs' },
    { title: 'Iteration', description: 'Rapidly iterate on chains' }
  ],
  'crewai': [
    { title: 'Multi-agent', description: 'Orchestrate agent crews' },
    { title: 'Init/Run', description: 'Initialize and run projects' },
    { title: 'Tasks/Tools', description: 'Define tasks and tools per agent' },
    { title: 'Collaboration', description: 'Coordinate agent collaboration' },
    { title: 'Deployment', description: 'Serve agents as services' }
  ],
  'autogen': [
    { title: 'Agent Framework', description: 'Build multi-agent AI systems' },
    { title: 'Module Entrypoints', description: 'Run via python -m autogen.*' },
    { title: 'Config Files', description: 'Drive behavior via configs' },
    { title: 'Interoperability', description: 'Combine with serving stacks' },
    { title: 'Experimentation', description: 'Prototype orchestration flows' }
  ],
  'csvcut': [
    { title: 'Select Columns', description: 'Extract specific columns from CSVs' },
    { title: 'Reorder Columns', description: 'Change column order for downstream tools' },
    { title: 'Schema Discovery', description: 'List columns and positions' },
    { title: 'Pipelines', description: 'Combine with jq/mlr for transforms' },
    { title: 'Performance', description: 'Stream large CSVs efficiently' }
  ],
  'csvgrep': [
    { title: 'Filter Rows', description: 'Keep rows matching values or regex' },
    { title: 'Quality Gates', description: 'Drop invalid-status rows' },
    { title: 'Case Handling', description: 'Control case-sensitivity via regex' },
    { title: 'Column Targeting', description: 'Match on named columns' },
    { title: 'Pre-clean', description: 'Reduce data before heavy ops' }
  ],
  'csvlook': [
    { title: 'Pretty Print', description: 'View CSVs as aligned tables' },
    { title: 'Review', description: 'Quickly spot anomalies/empties' },
    { title: 'Share', description: 'Readable previews in reviews' },
    { title: 'Paging', description: 'Pipe to less for navigation' },
    { title: 'Debugging', description: 'Inspect intermediate outputs' }
  ],
  'csvsort': [
    { title: 'Sort Rows', description: 'Sort by numeric or textual columns' },
    { title: 'Reverse Sort', description: 'Descending order for top lists' },
    { title: 'Stable Pipelines', description: 'Deterministic ordering for diffs' },
    { title: 'Multi-key', description: 'Sort by multiple columns' },
    { title: 'Pre-join', description: 'Prep datasets for joins/merges' }
  ],
  'csvstack': [
    { title: 'Stack Files', description: 'Vertically concatenate CSVs' },
    { title: 'ETL', description: 'Combine monthly shards into one' },
    { title: 'Grouping', description: 'Add group labels per source' },
    { title: 'Schema Align', description: 'Handle differing column orders' },
    { title: 'Reports', description: 'Build quarter/annual aggregates' }
  ],
  'csvstat': [
    { title: 'Stats', description: 'Compute mean/median/min/max' },
    { title: 'Cardinality', description: 'Count uniques and empties' },
    { title: 'Types', description: 'Infer column data types' },
    { title: 'QA', description: 'Detect outliers and anomalies' },
    { title: 'Docs', description: 'Summarize datasets for handoff' }
  ],
  'csvjson': [
    { title: 'CSV to JSON', description: 'Convert rows to JSON objects' },
    { title: 'Keyed Output', description: 'Key records by a column' },
    { title: 'Streaming', description: 'Stream JSON for large files' },
    { title: 'APIs', description: 'Prep data for API ingestion' },
    { title: 'Interchange', description: 'Feed downstream JSON tools' }
  ],
  'csvformat': [
    { title: 'Dialect Convert', description: 'Change delimiters/quotes' },
    { title: 'TSV Output', description: 'Convert CSV to TSV' },
    { title: 'Normalization', description: 'Standardize file formats' },
    { title: 'Compatibility', description: 'Match tool ingestion needs' },
    { title: 'Pipelines', description: 'Ensure consistent separators' }
  ],
  'in2csv': [
    { title: 'XLS/XLSX to CSV', description: 'Convert spreadsheets to CSV' },
    { title: 'Sheet Select', description: 'Target specific sheet names' },
    { title: 'JSON to CSV', description: 'Flatten JSON structures' },
    { title: 'Bulk Convert', description: 'Batch convert input formats' },
    { title: 'ETL Intake', description: 'Normalize inputs into CSV' }
  ],
  'csvsql': [
    { title: 'SQL over CSV', description: 'Query CSVs with SQL syntax' },
    { title: 'DB Import', description: 'Create tables and insert rows' },
    { title: 'Joins', description: 'Join multiple CSV sources' },
    { title: 'Schema Gen', description: 'Generate CREATE TABLE DDL' },
    { title: 'Prototyping', description: 'Try queries before DB loads' }
  ],
  'csvclean': [
    { title: 'Validate', description: 'Detect malformed rows/encodings' },
    { title: 'Repair', description: 'Fix or drop problematic rows' },
    { title: 'Reports', description: 'Output issues for review' },
    { title: 'Output Dir', description: 'Write cleaned files to dir' },
    { title: 'Pre-ingest', description: 'Ensure CSV quality before ETL' }
  ],
  'jq': [
    { title: 'Filter JSON', description: 'Select fields and elements' },
    { title: 'Transform', description: 'Map/Reduce JSON structures' },
    { title: 'Pretty/Raw', description: 'Switch pretty vs raw output' },
    { title: 'Scripting', description: 'Compose complex pipelines' },
    { title: 'Validation', description: 'Quick sanity checks' }
  ],
  'yq': [
    { title: 'YAML Queries', description: 'Extract and transform YAML' },
    { title: 'YAML↔JSON', description: 'Convert between formats' },
    { title: 'Config Ops', description: 'Patch config files in CI' },
    { title: 'Merge', description: 'Merge multiple YAML files' },
    { title: 'Lint Adjunct', description: 'Pair with yamllint checks' }
  ],
  'json-pp': [
    { title: 'Pretty Print', description: 'Readable JSON formatting' },
    { title: 'Pipes', description: 'Format curl outputs' },
    { title: 'Canonical', description: 'Stable key ordering' },
    { title: 'Diff Prep', description: 'Normalize before diffing' },
    { title: 'QA Reviews', description: 'Readable PR artifacts' }
  ],
  'yamllint': [
    { title: 'Syntax Lint', description: 'Catch YAML syntax errors' },
    { title: 'Style Rules', description: 'Enforce style guidelines' },
    { title: 'CI Checks', description: 'Fail builds on bad YAML' },
    { title: 'Custom Config', description: 'Project-specific rules' },
    { title: 'Best Practices', description: 'Encourage maintainable YAML' }
  ],
  'jsonlint': [
    { title: 'Validate JSON', description: 'Identify malformed JSON' },
    { title: 'Pretty Output', description: 'Optional pretty printing' },
    { title: 'CI Use', description: 'Quick JSON schema checks' },
    { title: 'Error Context', description: 'Show line/column details' },
    { title: 'Pre-commit', description: 'Use in pre-commit hooks' }
  ],
  'datasets-cli': [
    { title: 'Dataset Ops', description: 'Test/load HF datasets locally' },
    { title: 'Save Info', description: 'Generate dataset info files' },
    { title: 'Download', description: 'Pre-fetch datasets to cache' },
    { title: 'Env Inspect', description: 'Show environment details' },
    { title: 'Pipelines', description: 'Automate dataset prep steps' }
  ],
  'datacleaner': [
    { title: 'Profiling', description: 'Profile data quality issues' },
    { title: 'Cleaning', description: 'Automate basic cleaning steps' },
    { title: 'Reports', description: 'Generate quality reports' },
    { title: 'Preprocessing', description: 'Prep data for ML pipelines' },
    { title: 'Audits', description: 'Track improvements over time' }
  ],
  'openrefine': [
    { title: 'Interactive Clean', description: 'Clean messy data via UI' },
    { title: 'Transforms', description: 'Apply GREL transformations' },
    { title: 'Reconcile', description: 'Match entities with services' },
    { title: 'Export', description: 'Export to many formats' },
    { title: 'Server Mode', description: 'Run on headless servers' }
  ],
  'iconv': [
    { title: 'Encoding Convert', description: 'Convert file encodings' },
    { title: 'UTF-8', description: 'Normalize inputs to UTF-8' },
    { title: 'Batch', description: 'Batch convert directories' },
    { title: 'Lists', description: 'List supported encodings' },
    { title: 'Pipelines', description: 'Ensure clean text ingestion' }
  ],
  'datamash': [
    { title: 'Aggregations', description: 'Compute sum/mean/min/max' },
    { title: 'Group By', description: 'Group by fields for stats' },
    { title: 'TSV First', description: 'Excel at TSV processing' },
    { title: 'Pipe Friendly', description: 'Combine with cut/sed/awk' },
    { title: 'Large Data', description: 'Stream without loading all' }
  ],
  'mlr': [
    { title: 'Record Streams', description: 'Process CSV/TSV/JSON' },
    { title: 'Verbs', description: 'cut/sort/join/stats in one tool' },
    { title: 'Format Flex', description: 'Switch formats mid-pipeline' },
    { title: 'Perf', description: 'Fast for big files' },
    { title: 'Scripting', description: 'Compose multi-step pipelines' }
  ],
  'parquet-tools': [
    { title: 'Schema', description: 'Inspect Parquet schema' },
    { title: 'Head/Meta', description: 'Preview rows and metadata' },
    { title: 'Debug', description: 'Dump raw pages when needed' },
    { title: 'Interop', description: 'Verify producer/consumer' },
    { title: 'Audits', description: 'Check partitioned datasets' }
  ],
  'featherls': [
    { title: 'Feather Schema', description: 'Quickly view feather schema' },
    { title: 'Summary', description: 'Get basic file summaries' },
    { title: 'Pipelines', description: 'Use in conversion pipelines' },
    { title: 'Debug IO', description: 'Check field types/encodings' },
    { title: 'Cataloging', description: 'Inventory feather datasets' }
  ],
  'arrow-cat': [
    { title: 'Arrow Preview', description: 'Print Arrow/IPC table data' },
    { title: 'Select Columns', description: 'Limit columns for display' },
    { title: 'Sampling', description: 'Limit output rows' },
    { title: 'Scripting', description: 'Use in shell pipelines' },
    { title: 'Inspection', description: 'Sanity-check files quickly' }
  ],
  'csv2parquet': [
    { title: 'CSV→Parquet', description: 'Convert CSV to Parquet format' },
    { title: 'Compression', description: 'Apply columnar compression' },
    { title: 'Schema Control', description: 'Specify or infer schema' },
    { title: 'Data Lakes', description: 'Stage into lake formats' },
    { title: 'Automation', description: 'Batch convert datasets' }
  ],
  'parquet2csv': [
    { title: 'Parquet→CSV', description: 'Convert Parquet to CSV' },
    { title: 'Column Filter', description: 'Export only needed columns' },
    { title: 'Sampling', description: 'Export a subset for debugging' },
    { title: 'Interchange', description: 'Provide CSV to consumers' },
    { title: 'Pipelines', description: 'Integrate into ETL flows' }
  ],
  'pandas-profiling': [
    { title: 'EDA Report', description: 'Generate HTML profiling reports' },
    { title: 'Descriptives', description: 'Show stats and distributions' },
    { title: 'Missingness', description: 'Visualize missing values' },
    { title: 'Correlations', description: 'Correlation matrices/heatmaps' },
    { title: 'Docs', description: 'Share static reports' }
  ],
  'sweetviz': [
    { title: 'Visual EDA', description: 'Attractive EDA reports quickly' },
    { title: 'Compare', description: 'Compare training vs test sets' },
    { title: 'Target Analysis', description: 'Target-feature relationships' },
    { title: 'Share', description: 'Export HTML reports' },
    { title: 'Baseline', description: 'Rapid dataset understanding' }
  ],
  'dataprep-eda': [
    { title: 'Auto EDA', description: 'Create EDA reports programmatically' },
    { title: 'Cleaning Hints', description: 'Suggest cleaning actions' },
    { title: 'Stats/Plots', description: 'Stats with visualizations' },
    { title: 'Notebook Use', description: 'Great for notebooks' },
    { title: 'Export', description: 'Save to HTML for review' }
  ],
  'ydata-profiling': [
    { title: 'Modern Profiling', description: 'Successor to pandas-profiling' },
    { title: 'Performance', description: 'Faster profiling on big data' },
    { title: 'Customizable', description: 'Tweak sections and visuals' },
    { title: 'Integrations', description: 'Works with Pandas/Polars' },
    { title: 'Reports', description: 'Shareable HTML outputs' }
  ],
  'mlinspect': [
    { title: 'Pipeline Tracing', description: 'Trace data through ML pipelines' },
    { title: 'Issue Detection', description: 'Detect leakage/bugs early' },
    { title: 'Auditing', description: 'Audit transformations applied' },
    { title: 'Docs', description: 'Document pipeline steps' },
    { title: 'Debugging', description: 'Locate faulty transforms' }
  ],
  'dataexplore': [
    { title: 'Quick Explore', description: 'Spin up a quick data browser' },
    { title: 'CSV/Parquet', description: 'Open common file types' },
    { title: 'Filtering', description: 'Filter and search rows' },
    { title: 'Local UI', description: 'Run a lightweight UI' },
    { title: 'Review', description: 'Share snapshots with team' }
  ],
  'tokenizer-cli': [
    { title: 'Tokenize Text', description: 'Encode text with HF tokenizers' },
    { title: 'Batch Files', description: 'Tokenize files to JSON' },
    { title: 'Decode', description: 'Decode token ids back to text' },
    { title: 'Model Choice', description: 'Switch tokenizer models' },
    { title: 'Pipelines', description: 'Pre-tokenize for training' }
  ],
  'fasttext': [
    { title: 'Text Classify', description: 'Train/test classifiers' },
    { title: 'Word Vectors', description: 'Generate word embeddings' },
    { title: 'Predict', description: 'Predict labels for new data' },
    { title: 'Quantize', description: 'Compress models for speed' },
    { title: 'Language Tasks', description: 'Use for NLP baselines' }
  ],
  'langdetect': [
    { title: 'Language ID', description: 'Detect language of text' },
    { title: 'Batch', description: 'Detect over files/streams' },
    { title: 'JSON Output', description: 'Emit JSON for pipelines' },
    { title: 'Fallbacks', description: 'Handle short/noisy text' },
    { title: 'Pre-route', description: 'Route by language in ETL' }
  ],
  'cleantext': [
    { title: 'Normalize', description: 'Lowercase/remove punctuation' },
    { title: 'Emoji/URL', description: 'Handle emojis and links' },
    { title: 'De-noise', description: 'Strip artifacts for NLP' },
    { title: 'Batch Clean', description: 'Clean large corpora' },
    { title: 'Configurable', description: 'Enable/disable steps' }
  ],
  'great-expectations': [
    { title: 'Data Validation', description: 'Define expectations/suites' },
    { title: 'Checkpoints', description: 'Run checkpoints over data' },
    { title: 'Docs', description: 'Build data docs sites' },
    { title: 'Integrations', description: 'Work with Pandas/Spark' },
    { title: 'CI/CD', description: 'Validate in pipelines' }
  ],
  'pandas-schema': [
    { title: 'Schema Validate', description: 'Validate DataFrame schema' },
    { title: 'Rules', description: 'Define column-level rules' },
    { title: 'Reports', description: 'Generate violation reports' },
    { title: 'ETL Gates', description: 'Gate ETL on schema checks' },
    { title: 'Automation', description: 'Automate pre-ingestion checks' }
  ],
  'deequ': [
    { title: 'Data Quality', description: 'Declarative checks on Spark' },
    { title: 'Metrics', description: 'Compute metrics over columns' },
    { title: 'Constraints', description: 'Define constraints/rules' },
    { title: 'Scalable', description: 'Run on large datasets' },
    { title: 'Pipelines', description: 'Integrate in Spark jobs' }
  ],
  'cerberus': [
    { title: 'JSON/YAML Schema', description: 'Validate documents via schema' },
    { title: 'Errors', description: 'Readable error messages' },
    { title: 'Custom Rules', description: 'Extend with custom validators' },
    { title: 'Scripting', description: 'Use in CLI-driven flows' },
    { title: 'Pre-ingest', description: 'Block bad data early' }
  ],
  'duckdb': [
    { title: 'Ad hoc SQL', description: 'Query CSV/Parquet directly' },
    { title: 'Local Analytics', description: 'Fast OLAP on local files' },
    { title: 'ETL Staging', description: 'Stage transforms with SQL' },
    { title: 'Interchange', description: 'Export results to Parquet' },
    { title: 'Notebooks', description: 'Great for exploratory analysis' }
  ],
  'clickhouse-client': [
    { title: 'Analytics DB', description: 'Query high-speed columnar DB' },
    { title: 'Bulk Ops', description: 'Load/export large datasets' },
    { title: 'Materialization', description: 'Use materialized views' },
    { title: 'Compression', description: 'Leverage compression codecs' },
    { title: 'Pipelines', description: 'Integrate with ETL jobs' }
  ],
  'exiftool': [
    { title: 'Metadata Extract', description: 'Extract EXIF/XMP/ID3 tags' },
    { title: 'Batch JSON', description: 'Emit JSON for many files' },
    { title: 'Tag Edit', description: 'Write/normalize tags' },
    { title: 'Audits', description: 'Audit media dataset quality' },
    { title: 'Filtering', description: 'Filter by tag conditions' }
  ],
  'sox': [
    { title: 'Audio Convert', description: 'Convert formats/sample rates' },
    { title: 'Trim/Pad', description: 'Clip or pad durations' },
    { title: 'Normalize', description: 'Normalize loudness' },
    { title: 'Effects', description: 'Apply effects like reverb' },
    { title: 'Batch', description: 'Process corpora in scripts' }
  ],
  'imagemagick': [
    { title: 'Resize/Crop', description: 'Resize or crop images' },
    { title: 'Compression', description: 'Tweak quality and strip EXIF' },
    { title: 'Batch Ops', description: 'Process image directories' },
    { title: 'Format Convert', description: 'Convert between formats' },
    { title: 'Thumbnails', description: 'Generate preview thumbnails' }
  ],
  'mediainfo': [
    { title: 'Media Inspect', description: 'Inspect video/audio codecs' },
    { title: 'JSON/XML', description: 'Output structured metadata' },
    { title: 'Audits', description: 'Validate datasets at scale' },
    { title: 'Bitrate/Duration', description: 'Check bitrate & duration' },
    { title: 'Automation', description: 'Use in QC pipelines' }
  ],
  'opencv-cli': [
    { title: 'Quick Checks', description: 'Verify OpenCV install' },
    { title: 'Module Entrypoints', description: 'Run python -m cv2 helpers' },
    { title: 'Image Ops', description: 'Script image transforms' },
    { title: 'Feature Prep', description: 'Prep features for ML tasks' },
    { title: 'Pipelines', description: 'Use in processing pipelines' }
  ],
  'audiocraft': [
    { title: 'Audio Gen', description: 'Generate audio/music' },
    { title: 'Models', description: 'Use MusicGen variants' },
    { title: 'Prompting', description: 'Prompt-based generation' },
    { title: 'Batch', description: 'Batch generate clips' },
    { title: 'Evaluation', description: 'Compare generations' }
  ],
  'scrapy': [
    { title: 'Start Project', description: 'Scaffold scraping projects' },
    { title: 'Crawl', description: 'Run spiders to collect data' },
    { title: 'Pipelines', description: 'Store data via pipelines' },
    { title: 'Shell', description: 'Debug selectors in shell' },
    { title: 'Feeds', description: 'Export to JSON/CSV/Parquet' }
  ],
  'twint': [
    { title: 'Social Data', description: 'Scrape tweets (legacy tool)' },
    { title: 'Search', description: 'Search queries/time ranges' },
    { title: 'Formats', description: 'Export JSON/CSV' },
    { title: 'Pipelines', description: 'Integrate into ETL' },
    { title: 'Caveats', description: 'Project may require forks' }
  ],
  'beautifulsoup-cli': [
    { title: 'HTML Parse', description: 'Query HTML with selectors' },
    { title: 'Extraction', description: 'Extract links/titles/etc.' },
    { title: 'Normalization', description: 'Clean HTML content' },
    { title: 'Pipes', description: 'Use with curl/wget' },
    { title: 'Rapid Scripts', description: 'Lightweight scraping tasks' }
  ],
  'newspaper3k': [
    { title: 'Article Extract', description: 'Extract article text/meta' },
    { title: 'Summaries', description: 'Generate summaries' },
    { title: 'Batch URLs', description: 'Process URL lists' },
    { title: 'Dataset Build', description: 'Create news datasets' },
    { title: 'Cleaning', description: 'Remove boilerplate/ads' }
  ],
  'dvc': [
    { title: 'Data Versioning', description: 'Track data & models' },
    { title: 'Pipelines', description: 'Define reproducible DAGs' },
    { title: 'Remotes', description: 'Push/pull to S3/GCS/etc.' },
    { title: 'Experiments', description: 'Track experiment runs' },
    { title: 'CI/CD', description: 'Automate data pipelines' }
  ],
  'git-lfs': [
    { title: 'Large Files', description: 'Track big binaries in Git' },
    { title: 'Storage', description: 'Store assets in LFS' },
    { title: 'Pull/Fetch', description: 'Fetch LFS pointers' },
    { title: 'Team Workflows', description: 'Share large assets' },
    { title: 'Policies', description: 'Enforce tracking patterns' }
  ],
  'lakefs': [
    { title: 'Lake Versioning', description: 'Git-like ops for lakes' },
    { title: 'Branches', description: 'Branch and commit data' },
    { title: 'Experiments', description: 'Isolate experiments safely' },
    { title: 'Integrations', description: 'Work with Spark/Presto' },
    { title: 'Governance', description: 'Audit and reproducibility' }
  ],
  'neptune': [
    { title: 'Tracking', description: 'Log experiments to Neptune' },
    { title: 'Artifacts', description: 'Store artifacts and metadata' },
    { title: 'Dashboards', description: 'Monitor runs in app UI' },
    { title: 'Collaboration', description: 'Share results with teams' },
    { title: 'Automation', description: 'Integrate with CI/CD' }
  ],
  'comet': [
    { title: 'Experiments', description: 'Track metrics and params' },
    { title: 'Model Registry', description: 'Register and manage models' },
    { title: 'Reports', description: 'Create shareable reports' },
    { title: 'Artifacts', description: 'Log datasets and files' },
    { title: 'Integrations', description: 'Works with major frameworks' }
  ],
  'clearml-init': [
    { title: 'Configure', description: 'Set ClearML server & creds' },
    { title: 'Bootstrap', description: 'Initialize project setup' },
    { title: 'Verify', description: 'Test connectivity to server' },
    { title: 'Profiles', description: 'Manage multiple profiles' },
    { title: 'Quick Start', description: 'Start tracking fast' }
  ],
  'clearml-agent': [
    { title: 'Daemons', description: 'Run agents on queues' },
    { title: 'Docker', description: 'Execute in Dockerized envs' },
    { title: 'Autoscaling', description: 'Scale workers dynamically' },
    { title: 'Queues', description: 'Manage execution queues' },
    { title: 'Remote Exec', description: 'Run remote experiments' }
  ],
  'clearml-task': [
    { title: 'Task Create', description: 'Create tracked tasks' },
    { title: 'Enqueue', description: 'Enqueue tasks to agents' },
    { title: 'Projects', description: 'Organize tasks into projects' },
    { title: 'Templates', description: 'Reuse task templates' },
    { title: 'Metadata', description: 'Attach parameters/outputs' }
  ],
  'clearml-server': [
    { title: 'Self-host', description: 'Run your own ClearML server' },
    { title: 'Compose/Helm', description: 'Deploy with Docker/Helm' },
    { title: 'Scaling', description: 'Scale services for teams' },
    { title: 'Integrations', description: 'Integrate storage/backends' },
    { title: 'Backup', description: 'Maintain server backups' }
  ],
  'clearml': [
    { title: 'Suite Entry', description: 'Access ClearML CLI tools' },
    { title: 'Help', description: 'Discover available commands' },
    { title: 'Local Dev', description: 'Run small demos locally' },
    { title: 'CI/CD', description: 'Integrate with pipelines' },
    { title: 'Best Practices', description: 'Track everything' }
  ],
  'sacred': [
    { title: 'Reproducibility', description: 'Structure experiments' },
    { title: 'Config', description: 'Manage experiment configs' },
    { title: 'Observers', description: 'Log runs via observers' },
    { title: 'Dashboards', description: 'Use sacredboard/omniboard' },
    { title: 'CLI', description: 'Invoke via python -m' }
  ],
  'matplotlib-cli': [
    { title: 'Static Plots', description: 'Generate plots via scripts' },
    { title: 'Savefig', description: 'Export to PNG/SVG/PDF' },
    { title: 'Batch', description: 'Automate plot generation' },
    { title: 'Styles', description: 'Apply style sheets' },
    { title: 'Annotations', description: 'Annotate results clearly' }
  ],
  'seaborn-cli': [
    { title: 'Stat Plots', description: 'High-level statistical plots' },
    { title: 'Themes', description: 'Use themes/context' },
    { title: 'Pair/Joint', description: 'Pairplot/jointplot quickly' },
    { title: 'Regression', description: 'lmplot/regplot for trends' },
    { title: 'Pipelines', description: 'Script common visuals' }
  ],
  'plotly': [
    { title: 'Interactive', description: 'Interactive charts & 3D' },
    { title: 'Export', description: 'Static image exports' },
    { title: 'Dashboards', description: 'Build dashboards/demos' },
    { title: 'Notebooks', description: 'Great in notebooks' },
    { title: 'Sharing', description: 'Share with teammates' }
  ],
  'dash': [
    { title: 'Dash Apps', description: 'Run Plotly Dash apps' },
    { title: 'Deploy', description: 'Serve dashboards for teams' },
    { title: 'Components', description: 'Use rich UI components' },
    { title: 'Callbacks', description: 'Reactive data updates' },
    { title: 'Prototyping', description: 'Build quickly from scripts' }
  ],
  'trainer': [
    { title: 'Training Entry', description: 'Run tracked training jobs' },
    { title: 'Configurable', description: 'Pass configs/params' },
    { title: 'Logging', description: 'Log metrics to backends' },
    { title: 'Checkpoints', description: 'Save/load checkpoints' },
    { title: 'Repro', description: 'Set seeds for reproducibility' }
  ],
};

// Define COMMAND_TIPS with proper typing
const COMMAND_TIPS: Record<string, string[]> = {
  'abort': [
    'Use the -f option to force the command to abort immediately',
    'Use the -s signal option to specify the signal to send to the process',
    'Use the -p pid option to abort a specific process',
    'Use the -v option to display verbose output',
    'Use the -h option to display help'
  ],
  'aclocal': [
    'Use the -I dir option to add a directory to the search path',
    'Use the -m option to specify the m4 executable',
    'Use the -v option to display verbose output',
    'Use the -h option to display help',
    'Use the -V option to display version information'
  ],
  'apt-get': [
    'Use the -y option to automatically answer yes to prompts',
    'Use the -s option to simulate the installation process',
    'Use the -u option to perform a system upgrade',
    'Use the -d option to download packages without installing them',
    'Use the -f option to fix broken dependencies'
  ],
  'apt-key': [
    'Use the --keyring file option to specify a custom keyring file',
    'Use the --with-fingerprint option to display the fingerprint of the key',
    'Use the --with-colons option to display the key in colon-separated values format',
    'Use the --with-uid option to display the key with the associated user ID',
    'Use the --with-subkey option to display the key with its subkeys'
  ],
  'apt-mark': [
    'Use the auto option to mark packages as automatically installed',
    'Use the manual option to mark packages as manually installed',
    'Use the install option to mark packages as installed',
    'Use the remove option to mark packages as removed',
    'Use the purge option to mark packages as purged'
  ],
  'blogbench': [
    'Use the -c option to specify the number of concurrent connections',
    'Use the -f option to specify the file size for file I/O tests',
    'Use the -r option to specify the read/write ratio for file I/O tests',
    'Use the -s option to specify the block size for file I/O tests',
    'Use the -t option to specify the test duration'
  ],
  'bluetoothctl': [
    'Use the power on command to enable Bluetooth',
    'Use the power off command to disable Bluetooth',
    'Use the scan on command to start scanning for devices',
    'Use the scan off command to stop scanning for devices',
    'Use the pairable on command to make the device pairable'
  ],
  'break': [
    'Use the break command followed by a number to break out of a specific loop level',
    'Use the break command followed by a pattern to break out of a loop when a condition is met',
    'Use the break command without arguments to break out of the innermost loop',
    'Use the continue command to skip the current iteration and continue with the next one',
    'Use the exit command to exit the script entirely'
  ],
  'arch': [
    'Use the -i option to display the machine hardware name',
    'Use the -m option to display the machine hardware platform',
    'Use the -o option to display the operating system name',
    'Use the -v option to display the version information',
    'Use the -a option to display all available architecture information'
  ],
  'arp': [
    'Use the -a option to display all ARP cache entries',
    'Use the -n option to display numerical addresses instead of resolving hostnames',
    'Use the -i interface option to specify the network interface',
    'Use the -s address option to set a static ARP entry',
    'Use the -d address option to delete an ARP cache entry'
  ],
  'cpio': [
    'Use the -i option to create an archive index file',
    'Use the -o option to extract files to standard output',
    'Use the -t option to test the archive without extracting files',
    'Use the -d option to create directories as needed',
    'Use the -v option to display verbose output'
  ],
  'crontab': [
    'Use the -e option to edit the crontab file',
    'Use the -l option to list the crontab file',
    'Use the -r option to remove the crontab file',
    'Use the -u user option to specify the user whose crontab file to edit',
    'Use the -i option to prompt before removing the crontab file'
  ],
  'csplit': [
    'Use the -f prefix option to specify the prefix for output files',
    'Use the -n number option to specify the number of output files',
    'Use the -k option to keep the original file unchanged',
    'Use the -s option to suppress the output of split file sizes',
    'Use the -z option to split on null bytes instead of newlines'
  ],
  'date': [
    'Use the +format option to specify the output format',
    'Use the -d string option to display the date for a specific string',
    'Use the -s string option to set the system date and time',
    'Use the -u option to display the Coordinated Universal Time (UTC)',
    'Use the -R option to display the date in RFC 5322 format'
  ],
  'dc': [
    'Use the -e expression option to evaluate an expression',
    'Use the -f file option to read expressions from a file',
    'Use the -s option to suppress the output of intermediate results',
    'Use the -V option to display version information',
    'Use the -h option to display help'
  ],
  'debootstrap': [
    'Use the --arch architecture option to specify the target architecture',
    'Use the --variant variant option to specify the variant of the distribution',
    'Use the --include package option to include additional packages',
    'Use the --exclude package option to exclude packages',
    'Use the --no-check-gpg option to skip GPG signature verification'
  ],
  'declare': [
    'Use the -a option to declare an array variable',
    'Use the -A option to declare an associative array variable',
    'Use the -i option to declare an integer variable',
    'Use the -r option to declare a readonly variable',
    'Use the -x option to declare an exported variable'
  ],
  'deluser': [
    'Use the --remove-home option to remove the user\'s home directory',
    'Use the --remove-all-files option to remove all files owned by the user',
    'Use the --backup option to create a backup of the user\'s home directory',
    'Use the --force option to force the removal of the user',
    'Use the --system option to remove a system user'
  ],
  'delgroup': [
    'Use the --force option to remove the group even if it has members',
    'Use the --only-if-empty option to remove the group only if it has no members',
    'Use the --backup option to create a backup of the group\'s files',
    'Use the --system option to remove a system group',
    'Use the --help option to display help'
  ],
  'depmod': [
    'Use the -a option to automatically load modules',
    'Use the -n option to suppress module loading',
    'Use the -b base_directory option to specify the base directory for module files',
    'Use the -F file option to specify a file containing module names',
    'Use the -v option to display verbose output'
  ],
  'df': [
    'Use the -h option to display sizes in human-readable format',
    'Use the -i option to display inode information',
    'Use the -T type option to limit the output to specific filesystem types',
    'Use the -x type option to exclude specific filesystem types',
    'Use the -a option to include all filesystems'
  ],
  'diff': [
    'Use the -r option to compare directories recursively',
    'Use the -q option to suppress output and return a non-zero exit status if files differ',
    'Use the -s option to report only when files differ',
    'Use the -y option to output in a side-by-side format',
    'Use the -W width option to set the output width'
  ],
  'diff3': [
    'Use the -m option to merge the files',
    'Use the -E option to ignore changes made in either file1 or file2',
    'Use the -A option to treat all files as text',
    'Use the -i option to ignore case differences',
    'Use the -x pattern option to exclude files matching a pattern'
  ],
  'dig': [
    'Use the +short option to display only the answer section in a terse format',
    'Use the +noall +answer option to display only the answer section',
    'Use the -x option to perform a reverse DNS lookup for an IP address',
    'Use +trace to follow the DNS resolution process from the root servers',
    'Use @server to query a specific DNS server instead of the default'
  ],
  'dir': [
    'Use the -a option to show all files, including hidden ones',
    'Use the -l option for a detailed listing with permissions and sizes',
    'Use the -h option to display file sizes in human-readable format',
    'Use the --color option to colorize the output by file type',
    'Use the -R option to list subdirectories recursively'
  ],
  'dircolors': [
    'Use the -p option to print the default color database',
    'Use the -b option to output Bourne shell commands',
    'Use the -c option to output C shell commands',
    'Redirect output to ~/.dircolors to create a customizable configuration file',
    'Use eval $(dircolors) in your shell startup file to apply colors permanently'
  ],
  'dirname': [
    'Use with full file paths to extract just the directory portion',
    'Combine with command substitution in scripts: cd $(dirname "$file")',
    'Process multiple paths in a single command',
    'Use the -z option for null-terminated output when processing filenames with spaces',
    'Pair with basename to extract different parts of a path'
  ],
  'dirs': [
    'Use the -v option to show the directory stack with numeric indices',
    'Use the -c option to clear the directory stack',
    'Use the -l option to show full paths without tilde substitution',
    'Use the -p option to display one directory per line',
    'Access a specific directory with +N (from left) or -N (from right) notation'
  ],
  'ls': [
    'Use the -l option to display detailed information',
    'Use the -a option to show hidden files',
    'Use the -h option to display sizes in human-readable format',
    'Use the -S option to sort by file size',
    'Use the -t option to sort by modification time'
  ],
  'grep': [
    'Use the -i option to ignore case',
    'Use the -v option to invert the match',
    'Use the -r option to search recursively',
    'Use the -n option to display line numbers',
    'Use the -E option to use extended regular expressions'
  ],
  'cd': [
    'Use the - option to change to the previous directory',
    'Use the ~ option to change to the home directory',
    'Use the .. option to change to the parent directory',
    'Use the -L option to follow symbolic links',
    'Use the -P option to not follow symbolic links'
  ],
  'mkdir': [
    'Use the -p option to create parent directories as needed',
    'Use the -m mode option to set the permission mode',
    'Use the -v option to display a message for each created directory',
    'Use the -Z option to set the SELinux security context',
    'Use the -Z option to set the ACL (Access Control List) entries'
  ],
  'rmdir': [
    'Use the -p option to remove parent directories if they become empty',
    'Use the -v option to display a message for each removed directory',
    'Use the -ignore-fail-on-non-empty option to ignore errors for non-empty directories',
    'Use the --help option to display help',
    'Use the --version option to display version information'
  ],
  'rm': [
    'Use the -r option to remove directories and their contents recursively',
    'Use the -f option to force the removal without prompting for confirmation',
    'Use the -i option to prompt before removing each file',
    'Use the -v option to display a message for each removed file',
    'Use the --one-file-system option to stay on the current file system'
  ],
  'find': [
    'Use the -name pattern option to search for files by name',
    'Use the -type type option to search for files by type (f for files, d for directories)',
    'Use the -size size option to search for files by size',
    'Use the -mtime days option to search for files modified within a certain number of days',
    'Use the -exec command ; option to execute a command on each found file'
  ],
  'awk': [
    'Use the -F separator option to specify the field separator',
    'Use the -v var=value option to set an awk variable',
    'Use the -f scriptfile option to specify an awk script file',
    'Use the -e program-text option to specify an awk program text',
    'Use the -W interactive-debugger option to enable the interactive debugger'
  ],
  'sed': [
    'Use the -i option to edit files in-place',
    'Use the -r option to use extended regular expressions',
    'Use the -n option to suppress automatic printing of pattern space',
    'Use the -e script option to add multiple scripts',
    'Use the -f script-file option to add scripts from a file'
  ],
  'tr': [
    'Use the -d option to delete characters',
    'Use the -s option to squeeze repeated characters',
    'Use the -c option to complement the set of characters',
    'Use the -t option to translate characters',
    'Use the --help option to display help'
  ],
  'col': [
    'Use the -x option to expand tabs',
    'Use the -b option to ignore leading whitespace',
    'Use the -f option to specify the number of spaces per tab',
    'Use the -h option to display help',
    'Use the -v option to display version information'
  ],
  'expand': [
    'Use the -i option to ignore non-printable characters',
    'Use the -t number option to specify the number of spaces per tab',
    'Use the -t option without a number to expand all tabs to spaces',
    'Use the -h option to display help',
    'Use the -v option to display version information'
  ],
  'unexpand': [
    'Use the -a option to convert all blanks to tabs',
    'Use the -t number option to specify the number of spaces per tab',
    'Use the -t option without a number to convert initial spaces to tabs',
    'Use the -h option to display help',
    'Use the -v option to display version information'
  ],
  'pr': [
    'Use the -h header option to specify a header for each page',
    'Use the -w width option to set the page width',
    'Use the -l length option to set the page length',
    'Use the -n option to suppress page headers and footers',
    'Use the -d option to double-space the output'
  ],
  'fmt': [
    'Use the -w width option to specify the output width',
    'Use the -u option to unfold paragraphs',
    'Use the -s option to split long lines',
    'Use the -g margin option to specify the right margin',
    'Use the -h option to display help'
  ],
  'groff': [
    'Use the -T device option to specify the output device',
    'Use the -m device option to specify the input device',
    'Use the -r resolution option to specify the resolution',
    'Use the -p paper option to specify the paper size',
    'Use the -h option to display help'
  ],
  'nroff': [
    'Use the -T device option to specify the output device',
    'Use the -m device option to specify the input device',
    'Use the -r resolution option to specify the resolution',
    'Use the -p paper option to specify the paper size',
    'Use the -h option to display help'
  ],
  'troff': [
    'Use the -T device option to specify the output device',
    'Use the -m device option to specify the input device',
    'Use the -r resolution option to specify the resolution',
    'Use the -p paper option to specify the paper size',
    'Use the -h option to display help'
  ],
  'man': [
    'Use the -k keyword option to search for keywords in manual pages',
    'Use the -f keyword option to search for keywords in manual page names',
    'Use the -K keyword option to search for keywords in all manual pages',
    'Use the -w option to display the location of the manual page',
    'Use the -h option to display help'
  ],
  'info': [
    'Use the -n node option to start at a specific node',
    'Use the -k keyword option to search for keywords',
    'Use the -d dir option to specify the directory containing the Info files',
    'Use the -h option to display help',
    'Use the -v option to display version information'
  ],
  'whatis': [
    'Use the -w option to display the manual page location',
    'Use the -s section option to search in specific sections',
    'Use the -h option to display help',
    'Use the -v option to display version information',
    'Use the -l option to display long descriptions'
  ],
  'help': [
    'Use the -m module option to display help for a specific module',
    'Use the -s section option to display help for a specific section',
    'Use the -h option to display help',
    'Use the -v option to display version information',
    'Use the -d option to display debugging information'
  ],
  'apropos': [
    'Use the -a option to display all matches',
    'Use the -e option to display the manual page location',
    'Use the -s section option to search in specific sections',
    'Use the -h option to display help',
    'Use the -v option to display version information'
  ],
  'mandb': [
    'Use the -c option to create the database',
    'Use the -q option to run in quiet mode',
    'Use the -v option to display verbose output',
    'Use the -h option to display help',
    'Use the -V option to display version information'
  ],
  'updatedb': [
    'Use the -o option to specify the output file',
    'Use the -U directory option to exclude directories',
    'Use the -l level option to set the logging level',
    'Use the -h option to display help',
    'Use the -V option to display version information'
  ],
  'locate': [
    'Use the -i option for case-insensitive searching',
    'Use the -l number option to limit the number of results',
    'Use the -e option to only display entries that exist at the time locate is run',
    'Use the -r regexp option to search using a basic regular expression',
    'Use the -d path option to specify a custom database path'
  ],
  'mlocate': [
    'Use the -i option for case-insensitive searching',
    'Use the -l number option to limit the number of results',
    'Use the -e option to only display entries that exist at the time locate is run',
    'Use the -r regexp option to search using a basic regular expression',
    'Use the -d path option to specify a custom database path'
  ],
  'which': [
    'Use the -i option for case-insensitive searching',
    'Use the -l number option to limit the number of results',
    'Use the -e option to only display entries that exist at the time which is run',
    'Use the -r regexp option to search using a basic regular expression',
    'Use the -d path option to specify a custom database path'
  ],
  'echo': [
    'Use the -n option to suppress trailing newline',
    'Use the -e option to enable backslash escapes',
    'Use the -E option to disable backslash escapes',
    'Use the -E option to enable interpretation of backslash escapes',
    'Use the -E option to enable interpretation of backslash escapes'
  ],
  'tee': [
    'Use the -a option to append to the given file instead of overwriting',
    'Use the -i option to ignore interrupt signals',
    'Use the -p option to specify a file descriptor to write to',
    'Use the -t option to specify a timeout before writing the buffer',
    'Use the -h option to display help'
  ],
  'dd': [
    'Use the -i input_blocks option to specify the number of input blocks',
    'Use the -o output_blocks option to specify the number of output blocks',
    'Use the -f file option to specify the input file',
    'Use the -s option to skip over input blocks',
    'Use the -c option to count input blocks'
  ],
  'cp': [
    'Use the -r option to copy directories recursively',
    'Use the -p option to preserve permissions and timestamps',
    'Use the -d option to copy symlinks as symlinks',
    'Use the -a option to copy all file attributes',
    'Use the -v option to display verbose output'
  ],
  'mv': [
    'Use the -i option to prompt before overwriting',
    'Use the -f option to force overwrite',
    'Use the -n option to not overwrite existing files',
    'Use the -b option to preserve the destination file\'s backup',
    'Use the -u option to move only if the source file is newer'
  ],
  'ps': [
    'Use the -e option to display all processes',
    'Use the -f option to display full-format information',
    'Use the -g option to display processes with a common group ID',
    'Use the -l option to display processes in long format',
    'Use the -o option to specify output columns'
  ],
  'top': [
    'Use the -b option to batch mode',
    'Use the -n option to specify the number of iterations',
    'Use the -d option to delay between iterations',
    'Use the -p option to specify a process ID to monitor',
    'Use the -u option to display information about users'
  ],
  'htop': [
    'Use the -d option to delay between updates',
    'Use the -c option to show full command line',
    'Use the -s option to sort by specific column',
    'Use the -u option to display information about users',
    'Use the -p option to specify a process ID to monitor'
  ],
  'kill': [
    'Use the -s signal option to specify the signal to send',
    'Use the -p pid option to specify a process ID',
    'Use the -l option to list all signals',
    'Use the -1 option to send a SIGKILL signal',
    'Use the -9 option to send a SIGKILL signal'
  ],
  'killall': [
    'Use the -i option to prompt before sending signals',
    'Use the -q option to quietly kill processes',
    'Use the -r option to kill processes recursively',
    'Use the -s signal option to specify the signal to send',
    'Use the -v option to display verbose output'
  ],
  'rsync': [
    'Use the -a option to archive mode',
    'Use the -v option to increase verbosity',
    'Use the -z option to compress file data during the transfer',
    'Use the -e option to specify the remote shell program',
    'Use the -P option to show progress during transfer'
  ],
  'scp': [
    'Use the -C option to enable compression',
    'Use the -o option to specify options for the remote shell',
    'Use the -p option to preserve modification times and permissions',
    'Use the -q option to suppress non-error messages',
    'Use the -r option to copy directories recursively'
  ],
  'sftp': [
    'Use the -b option to specify a batch file',
    'Use the -o option to specify options for the remote shell',
    'Use the -p option to preserve modification times and permissions',
    'Use the -q option to suppress non-error messages',
    'Use the -r option to copy directories recursively'
  ],
  'ssh': [
    'Use the -o option to specify options for the remote shell',
    'Use the -p option to specify the port number',
    'Use the -i option to specify the identity file',
    'Use the -l option to specify the username',
    'Use the -X option to enable X11 forwarding'
  ],
  'ssh-keygen': [
    'Use the -t option to specify the key type',
    'Use the -b option to specify the key length',
    'Use the -N option to specify a passphrase',
    'Use the -f option to specify the output file',
    'Use the -C option to add a comment'
  ],
  'ssh-add': [
    'Use the -l option to list identities',
    'Use the -d option to delete identities',
    'Use the -t option to specify the lifetime of the key',
    'Use the -s option to specify the key type',
    'Use the -c option to specify the key comment'
  ],
  'ssh-agent': [
    'Use the -a option to specify the agent socket',
    'Use the -c option to specify the command to run',
    'Use the -d option to specify the directory for the agent socket',
    'Use the -s option to specify the shell to use',
    'Use the -l option to list identities'
  ],
  'ssh-copy-id': [
    'Use the -i option to specify the identity file',
    'Use the -o option to specify options for the remote shell',
    'Use the -p option to specify the port number',
    'Use the -h option to display help',
    'Use the -f option to specify the file containing the key'
  ],
  'authorized-keys': [
    'Use the -a option to append keys to the authorized_keys file',
    'Use the -i option to specify the identity file',
    'Use the -c option to specify the key comment',
    'Use the -m option to specify the key type',
    'Use the -t option to specify the key expiration time'
  ],
  'wget': [
    'Use the -b option to background mode',
    'Use the -O option to specify the output file',
    'Use the -c option to continue getting a partially downloaded file',
    'Use the -p option to include the header of the page',
    'Use the -r option to recursively download a directory'
  ],
  'ftp': [
    'Use the -n option to disable interactive prompting',
    'Use the -i option to specify the identity file',
    'Use the -g option to group file access',
    'Use the -v option to increase verbosity',
    'Use the -d option to disable debugging output'
  ],
  'a2enmod': [
    'Use the -q option to run in quiet mode',
    'Use the -a option to enable all modules',
    'Use the -M option to specify a module to be enabled',
    'Use the -m option to specify a module to be enabled',
    'Use the -c option to specify a configuration file'
  ],
  'a2ensite': [
    'Use the -q option to run in quiet mode',
    'Use the -a option to enable all sites',
    'Use the -M option to specify a site to be enabled',
    'Use the -m option to specify a site to be enabled',
    'Use the -c option to specify a configuration file'
  ],
  'a2dismod': [
    'Use the -q option to run in quiet mode',
    'Use the -a option to disable all modules',
    'Use the -M option to specify a module to be disabled',
    'Use the -m option to specify a module to be disabled',
    'Use the -c option to specify a configuration file'
  ],
  'a2dissite': [
    'Use the -q option to run in quiet mode',
    'Use the -a option to disable all sites',
    'Use the -M option to specify a site to be disabled',
    'Use the -m option to specify a site to be disabled',
    'Use the -c option to specify a configuration file'
  ],
  'dump': [
    'Use level 0 for full backups and levels 1-9 for incremental backups',
    'Use the -B option to set a specific block size for better performance',
    'Use the -j option to compress the backup with bzip2',
    'Use the -W option to check which filesystems need backing up',
    'Use the -u option to update /etc/dumpdates when creating backups'
  ],
  'dumpe2fs': [
    'Use the -h option to display only the superblock information',
    'Use the -b option to view blocks marked as bad in the filesystem',
    'Use the -f option to force display of filesystems with unknown features',
    'Use the -o superblock=X to specify an alternative superblock',
    'Root privileges are typically required to run this command'
  ],
  'ed': [
    'Use the -p option to set a custom command prompt',
    'Use a single dot (.) on a line by itself to end input mode',
    'Use line numbers or patterns to specify which lines to edit',
    'Use the s/old/new/ command to find and replace text',
    'Use w filename to write changes to a different file'
  ],
  'egrep': [
    'Use the pipe character (|) to search for multiple patterns, like "apple|orange"',
    'Use the plus sign (+) to match one or more occurrences, like "go+gle"',
    'Use -i for case-insensitive searches',
    'Use -v to show lines that do NOT match the pattern',
    'Use -r for recursive searching through directories'
  ],
  'eject': [
    'Use the -t option to close the tray instead of opening it',
    'Use the -T option to toggle the tray state (open/close)',
    'You can specify either a device name (/dev/cdrom) or a mount point (/mnt/cdrom)',
    'Use the -v option for verbose output to see what\'s happening',
    'Use the -r option to eject and then immediately close the tray'
  ],
  'enable': [
    'Use the -n option to disable a built-in command',
    'Run enable without arguments to see all enabled built-ins',
    'Use the -a option to see both enabled and disabled built-ins',
    'Use the -p option to get output in a format that can be reused as input',
    'Note that some special built-ins like break, continue, eval cannot be disabled'
  ],
  'env': [
    'Use env without arguments to list all environment variables',
    'Use env -i to start with a completely empty environment',
    'Use env -u VARIABLE to unset a specific variable before running a command',
    'Combine multiple variable assignments: env VAR1=value1 VAR2=value2 command',
    'Use env --chdir=/path to change directory before running a command'
  ],
  'ethtool': [
    'Use ethtool -i to display driver information for a network interface',
    'Use ethtool -p to identify a network card by blinking its LED',
    'Use ethtool -S to show detailed statistics for troubleshooting',
    'Use ethtool -s to set speed, duplex mode, and other parameters',
    'Add ethtool commands to network scripts for persistent configuration changes'
  ],
  'eval': [
    'Always quote variables used within eval to prevent unexpected word splitting',
    'Avoid using eval with untrusted input as it can lead to code injection',
    'Use eval with ssh-agent to set up the SSH agent environment',
    'For variable indirection, consider using ${!varname} syntax in bash when possible',
    'Use eval when processing complex command strings with nested variables'
  ],
  'exec': [
    'When using exec with a command, remember that control will not return to the calling shell',
    'Use exec for file descriptor operations like exec 3> file.txt to open a file for writing',
    'Use exec 2>&1 to redirect stderr to stdout for the remainder of a script',
    'Combine with redirection to permanently change I/O for the current shell: exec > logfile.txt',
    'Use exec -a name command to set a custom process name'
  ],
  'exit': [
    'Use exit 0 to indicate successful completion',
    'Use non-zero exit codes (1-255) to indicate different error conditions',
    'Check the exit status of the previous command with $?',
    'Use trap to register cleanup functions that run on exit',
    'In functions, consider using return instead of exit to avoid terminating the entire script'
  ],
  'export': [
    'Variables set with export are only available for the duration of the current shell session',
    'Add exports to ~/.bashrc or ~/.profile for persistent environment variables',
    'Use export -p to see all exported variables',
    'Use export -n VARIABLE to unexport a variable without unsetting it',
    'When extending PATH, use export PATH=$PATH:/new/path to append or export PATH=/new/path:$PATH to prepend'
  ],
};

// Generate metadata for the page
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const slug = params.slug;
  const command = await getCommand(slug);
  
  if (!command) {
    return {
      title: 'Command Not Found',
      description: 'The requested Linux command could not be found.'
    };
  }
  
  return {
    title: command.seo_title || `${command.title} - Linux Command Guide | LinuxConcept`,
    description: command.seo_description || command.description,
    keywords: command.seo_keywords || `${command.title}, linux command, unix command, ${command.category}, command line, terminal, shell, bash`,
    openGraph: {
      title: command.seo_title || `${command.title} - Linux Command Guide`,
      description: command.seo_description || command.description,
      type: 'article',
      publishedTime: command.created_at,
      modifiedTime: command.updated_at,
      authors: ['LinuxConcept Team'],
      tags: command.seo_keywords?.split(', ') || [command.title, 'linux command', command.category],
    },
    twitter: {
      card: 'summary_large_image',
      title: command.seo_title || `${command.title} - Linux Command Guide`,
      description: command.seo_description || command.description,
    },
    alternates: {
      canonical: `https://ainews.com/commands/${command.slug}`,
    },
  };
}

async function getRelatedCommandsByCategory(category: string, excludeSlug: string, limit: number = 5): Promise<string[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
      (process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3007' 
        : 'https://ainews.com');
    
    const res = await fetch(`${baseUrl}/api/commands`, {
      cache: 'no-store'
    });
    
    if (!res.ok) {
      console.error('Failed to fetch commands for related commands');
      return [];
    }
    
    const data = await res.json();
    const commands = data.commands || [];
    
    // Filter by category and exclude current command
    const related = commands
      .filter((cmd: any) => {
        const cmdCategory = typeof cmd.category === 'string' ? cmd.category : cmd.category || 'misc';
        return cmdCategory === category && cmd.slug !== excludeSlug;
      })
      .slice(0, limit)
      .map((cmd: any) => cmd.slug);
    
    return related;
  } catch (error) {
    console.error('Error fetching related commands by category:', error);
    return [];
  }
}

async function getCommand(slug: string): Promise<Command | null> {
  try {
    // Use process.env.NEXT_PUBLIC_SITE_URL or fallback for server components
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
      (process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3007' 
        : 'https://ainews.com');
    
    // Skip API call if known sample commands
    if (slug === 'cat' || slug === 'ls') {
      // Return mock data for 'cat' and 'ls'
      return {
        id: slug === 'cat' ? 1 : 2,
        title: slug,
        slug: slug,
        description: slug === 'cat' ? 
          "Concatenate and display files" : 
          "List directory contents",
        syntax: slug === 'cat' ? 
          "cat [OPTION]... [FILE]..." : 
          "ls [OPTION]... [FILE]...",
        examples: getSampleExamples(slug),
        options: getSampleOptions(slug),
        notes: "These are sample notes for the " + slug + " command.",
        category: "file-management",
        platform: "Linux/Unix",
        icon: "",
        file_path: "",
        published: true,
        seo_title: `${slug} - Linux Command Guide | LinuxConcept`,
        seo_description: slug === 'cat' ? 
          "Learn how to use the cat command in Linux to concatenate and display files. Complete guide with syntax, examples, options, and best practices for file management." : 
          "Learn how to use the ls command in Linux to list directory contents. Complete guide with syntax, examples, options, and best practices for file management.",
        seo_keywords: `${slug}, linux command, command line, terminal, bash, unix, file management, tutorial, guide, examples, syntax`,
        schema_json: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
    
    console.log(`Fetching command data for: ${slug}`);
    const res = await fetch(`${baseUrl}/api/command/${slug}`, {
      cache: 'no-store'
    });
    
    if (!res.ok) {
      if (res.status === 404) {
        console.log(`Command not found: ${slug}`);
        return null;
      }
      throw new Error(`Failed to fetch command: ${res.statusText}`);
    }
    
    // The API directly returns the command data, not nested under 'command'
    const data = await res.json();
    console.log(`Received command data:`, data);
    return data;
  } catch (error) {
    console.error(`Error fetching command with slug ${slug}:`, error);
    // Return sample data in case of error
    return {
      id: 1,
      title: slug,
      slug: slug,
      description: "Sample fallback description for " + slug,
      syntax: slug + " [OPTION]... [FILE]...",
      examples: getSampleExamples(slug),
      options: getSampleOptions(slug),
      notes: "These are sample notes for the " + slug + " command.",
      category: "file-management",
      platform: "Linux/Unix",
      icon: "",
      file_path: "",
      published: true
    };
  }
}

// Function to get sample examples for fallback
function getSampleExamples(slug: string): string {
  if (slug === 'cat') {
    return `# Basic Examples
  
cat filename.txt
Display the contents of a file.

cat file1.txt file2.txt
Concatenate and display multiple files.

cat -n filename.txt
Display file contents with line numbers.

# Advanced Examples

cat > newfile.txt
Create a new file and write content to it.

cat file1.txt file2.txt > combined.txt
Combine multiple files into a new file.

cat file3.txt >> combined.txt
Append content to an existing file.

cat -A filename.txt
Display non-printing characters.
`;
  } else if (slug === 'a2dismod') {
    return `# Basic Examples
  
# Disable a single module
sudo a2dismod rewrite

# Disable multiple modules at once
sudo a2dismod ssl headers

# Disable a module and restart Apache
sudo a2dismod proxy && sudo systemctl restart apache2

# Check if a module is already disabled
sudo a2dismod -q rewrite && echo "Module is disabled" || echo "Module is not disabled"

# Advanced Examples

# Disable a module for a specific Apache instance
sudo a2dismod -m apache2-custom rewrite

# Force disabling a module even if other modules depend on it
sudo a2dismod -f proxy_http

# List all enabled modules before disabling
ls /etc/apache2/mods-enabled/*.load | cut -d. -f1 | sed 's/.*///'

# Disable all modules (dangerous, use with caution)
for mod in $(ls /etc/apache2/mods-enabled/*.load | cut -d. -f1 | sed 's/.*///' | grep -v "mpm_"); do sudo a2dismod $mod; done
`;
  } else {
    return `# Basic Examples
  
ls
List files in the current directory.

ls -l
List files in long format with details.

ls -a
List all files including hidden ones.

# Advanced Examples

ls -lah
Detailed list with human-readable sizes.

ls -R
List directories recursively.
`;
  }
}

// Function to get sample options for fallback
function getSampleOptions(slug: string): string {
  if (slug === 'cat') {
    return `
<table class="table-auto w-full">
  <thead>
    <tr>
      <th class="px-4 py-2 text-left">Option</th>
      <th class="px-4 py-2 text-left">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="border px-4 py-2"><code>-n</code></td>
      <td class="border px-4 py-2">Number all output lines</td>
    </tr>
    <tr>
      <td class="border px-4 py-2"><code>-b</code></td>
      <td class="border px-4 py-2">Number non-empty output lines</td>
    </tr>
    <tr>
      <td class="border px-4 py-2"><code>-A</code></td>
      <td class="border px-4 py-2">Show all non-printable characters</td>
    </tr>
    <tr>
      <td class="border px-4 py-2"><code>-s</code></td>
      <td class="border px-4 py-2">Suppress repeated empty output lines</td>
    </tr>
    <tr>
      <td class="border px-4 py-2"><code>-T</code></td>
      <td class="border px-4 py-2">Display tab characters as ^I</td>
    </tr>
    <tr>
      <td class="border px-4 py-2"><code>-v</code></td>
      <td class="border px-4 py-2">Show non-printing characters using ^ and M- notation</td>
    </tr>
  </tbody>
</table>
    `;
  } else {
    return `
<table class="table-auto w-full">
  <thead>
    <tr>
      <th class="px-4 py-2 text-left">Option</th>
      <th class="px-4 py-2 text-left">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="border px-4 py-2"><code>-l</code></td>
      <td class="border px-4 py-2">Use a long listing format</td>
    </tr>
    <tr>
      <td class="border px-4 py-2"><code>-a</code></td>
      <td class="border px-4 py-2">Show hidden entries starting with .</td>
    </tr>
    <tr>
      <td class="border px-4 py-2"><code>-h</code></td>
      <td class="border px-4 py-2">Human-readable sizes</td>
    </tr>
    <tr>
      <td class="border px-4 py-2"><code>-R</code></td>
      <td class="border px-4 py-2">List subdirectories recursively</td>
    </tr>
  </tbody>
</table>
    `;
  }
}

// Helper function to get category color
function getCategoryColor(category: string) {
  const colors: { [key: string]: string } = {
    'file-management': 'bg-purple-100 text-purple-800',
    'user-management': 'bg-green-100 text-green-800',
    'process-management': 'bg-purple-100 text-purple-800',
    'networking': 'bg-yellow-100 text-yellow-800',
    'permissions': 'bg-red-100 text-red-800',
    'package-management': 'bg-purple-100 text-purple-800',
    'system-management': 'bg-pink-100 text-pink-800',
    'misc': 'bg-gray-100 text-gray-800'
  };
  
  return colors[category] || 'bg-gray-100 text-gray-800';
}

// Format HTML content to properly handle code tags and create code blocks
function formatContent(content: string): string {
  if (!content) return '';
  
  // First sanitize any HTML entities to prevent double-encoding
  let formattedContent = content
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
  
  // Replace <code> tags with styled spans using CSS module
  formattedContent = formattedContent.replace(
    /<code>(.*?)<\/code>/g, 
    `<span class="${styles.codeInline}">$1</span>`
  );
  
  // Handle literal <code> tags that might appear in the text
  formattedContent = formattedContent
    .replace(/&lt;code&gt;(.*?)&lt;\/code&gt;/g, 
      `<span class="${styles.codeInline}">$1</span>`)
    .replace(/<code>(.*?)<\/code>/g, 
      `<span class="${styles.codeInline}">$1</span>`);
  
  // Format markdown headings to HTML headings
  formattedContent = formattedContent.replace(
    /^#\s+Basic Examples\s*$/gm,
    `<h3 class="${styles.exampleHeading}">Basic Examples:</h3>`
  );
  
  formattedContent = formattedContent.replace(
    /^#\s+Advanced Examples\s*$/gm,
    `<h3 class="${styles.exampleHeading}">Advanced Examples:</h3>`
  );
  
  // Format section headings in the notes (like "Sed Command Structure:")
  formattedContent = formattedContent.replace(
    /^([A-Z][A-Za-z0-9 ]+):$/gm,
    `<h3 class="text-lg font-bold text-gray-800 mt-6 mb-3">$1:</h3>`
  );
  
  // Format subheadings with less prominence (often used for categorization)
  formattedContent = formattedContent.replace(
    /^([A-Z][A-Za-z0-9 ]+[A-Za-z0-9]):$/gm,
    `<h4 class="text-md font-semibold text-gray-700 mt-4 mb-2">$1</h4>`
  );
  
  // Improve spacing for command explanations in notes section
  formattedContent = formattedContent.replace(
    /^([a-z] -)/gm,
    `<div class="mt-2 mb-1"><span class="font-semibold">$1</span>`
  );
  formattedContent = formattedContent.replace(
    /^([A-Za-z0-9] -)/gm,
    `<div class="mt-2 mb-1"><span class="font-semibold">$1</span>`
  );
  
  // Close the divs for command explanations
  formattedContent = formattedContent.replace(
    /(\n)(?=[A-Za-z0-9] -|[A-Z]|\n|$)/g,
    `</div>$1`
  );
  
  // Format specific patterns for command notes (like "Line number: 5d")
  formattedContent = formattedContent.replace(
    /^(Line [^:]+): ([^\n]+)$/gm,
    `<div class="flex mt-2 mb-1"><span class="font-semibold min-w-32">$1:</span> <span>$2</span></div>`
  );
  
  // Format patterns like "Regular expression: /pattern/d"
  formattedContent = formattedContent.replace(
    /^(Regular [^:]+): ([^\n]+)$/gm,
    `<div class="flex mt-2 mb-1"><span class="font-semibold min-w-32">$1:</span> <span>$2</span></div>`
  );
  
  // Format patterns like "Special address $: $d"
  formattedContent = formattedContent.replace(
    /^(Special address [^:]+): ([^\n]+)$/gm,
    `<div class="flex mt-2 mb-1"><span class="font-semibold min-w-32">$1:</span> <span>$2</span></div>`
  );
  
  // Format patterns like "Line & regex combined: 5,/pattern/d"
  formattedContent = formattedContent.replace(
    /^(Line & regex [^:]+): ([^\n]+)$/gm,
    `<div class="flex mt-2 mb-1"><span class="font-semibold min-w-32">$1:</span> <span>$2</span></div>`
  );
  
  // Format patterns like "Step value: 1~2d"
  formattedContent = formattedContent.replace(
    /^(Step value[^:]*): ([^\n]+)$/gm,
    `<div class="flex mt-2 mb-1"><span class="font-semibold min-w-32">$1:</span> <span>$2</span></div>`
  );
  
  // Format command examples as proper code blocks with CSS module
  formattedContent = formattedContent.replace(
    /^(cat .*?)$/gm,
    `<pre class="${styles.codeBlock}">$1</pre>`
  );
  
  // Ensure no empty divs remain
  formattedContent = formattedContent.replace(/<div[^>]*>\s*<\/div>/g, '');
  
  return formattedContent;
}

// Function to format notes with markdown syntax
function formatNotes(notes: string): string {
  if (!notes) return '';
  
  // First sanitize any HTML entities
  let formattedNotes = notes
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
  
  // Convert markdown code (`code`) to HTML <code> FIRST (before bold processing)
  formattedNotes = formattedNotes.replace(
    /`([^`]+)`/g,
    `<code class="${styles.codeInline}">$1</code>`
  );
  
  // Convert markdown headings (**Use Cases:**) to HTML headings BEFORE converting to bold
  formattedNotes = formattedNotes.replace(
    /^\*\*([A-Za-z0-9\s\/&]+:?)\*\*$/gm,
    '<h3 class="text-lg font-bold text-gray-800 mt-6 mb-3">$1</h3>'
  );
  
  // Convert remaining markdown bold (**text**) to HTML <strong>
  formattedNotes = formattedNotes.replace(
    /\*\*(.*?)\*\*/g,
    '<strong>$1</strong>'
  );
  
  // Handle lists - convert lines starting with - to <ul><li>
  // Process line by line to handle list grouping
  const lines = formattedNotes.split('\n');
  const processedLines: string[] = [];
  let inList = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    if (trimmed.startsWith('- ')) {
      // This is a list item
      if (!inList) {
        // Start a new list
        processedLines.push('<ul class="list-disc pl-6 mb-2">');
        inList = true;
      }
      // Add the list item (remove '- ' prefix)
      processedLines.push(`<li>${trimmed.substring(2)}</li>`);
    } else {
      // Not a list item
      if (inList) {
        // Close the list
        processedLines.push('</ul>');
        inList = false;
      }
      // Add the line as-is (might be empty or other content)
      if (trimmed !== '' || i === 0 || lines[i - 1]?.trim() !== '') {
        processedLines.push(line);
      }
    }
  }
  
  // Close any remaining open list
  if (inList) {
    processedLines.push('</ul>');
  }
  
  formattedNotes = processedLines.join('\n');
  
  // Convert double line breaks to paragraphs (but preserve lists and headings)
  formattedNotes = formattedNotes.split(/\n\n+/).map(para => {
    const trimmed = para.trim();
    if (trimmed === '') return '';
    // Don't wrap already wrapped content (lists, headings, code)
    if (trimmed.startsWith('<ul>') || trimmed.startsWith('</ul>') || 
        trimmed.startsWith('<li>') || trimmed.startsWith('<h') || 
        trimmed.startsWith('<code') || trimmed.startsWith('<strong')) {
      return trimmed;
    }
    // If it's a single line with no HTML, wrap in paragraph
    if (!trimmed.includes('<') && trimmed.length > 0) {
      return `<p class="mb-4">${trimmed}</p>`;
    }
    return trimmed;
  }).join('\n\n');
  
  // Use formatContent for any remaining formatting (handles inline code, etc.)
  formattedNotes = formatContent(formattedNotes);
  
  return formattedNotes;
}

// Function to create detailed examples with explanations
function formatExamples(examples: string): string {
  if (!examples) return '';
  
  // First, decode any HTML entities that might be present
  let decodedExamples = examples
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  // Use the formatContent function which already handles the headings properly
  let formattedExamples = formatContent(decodedExamples);
  
  // Also process headings directly here to ensure they get converted
  // Handle markdown headings (# Basic Examples, # Advanced Examples)
  formattedExamples = formattedExamples.replace(
    /^#\s+Basic Examples\s*$/gm,
    `<h3 class="${styles.exampleHeading}">Basic Examples:</h3>`
  );
  
  formattedExamples = formattedExamples.replace(
    /^#\s+Advanced Examples\s*$/gm,
    `<h3 class="${styles.exampleHeading}">Advanced Examples:</h3>`
  );
  
  // Also handle regular text headings (without #)
  formattedExamples = formattedExamples.replace(
    /^Basic Examples:?\s*$/gm,
    `<h3 class="${styles.exampleHeading}">Basic Examples:</h3>`
  );
  
  formattedExamples = formattedExamples.replace(
    /^Advanced Examples:?\s*$/gm,
    `<h3 class="${styles.exampleHeading}">Advanced Examples:</h3>`
  );
  
  // Format command examples with proper code blocks
  // Match lines that start with # (comments) followed by a command on the next line
  formattedExamples = formattedExamples.replace(
    /^#\s+(.+?)$\n([^#\n]+)$/gm,
    (match, comment, command) => {
      return `<div class="mb-4">
        <div class="text-sm text-gray-600 mb-2">${comment}</div>
        <pre class="${styles.codeBlock}">${command.trim()}</pre>
      </div>`;
    }
  );
  
  // Also handle standalone commands (without comments) that start with sudo, ls, for, etc.
  formattedExamples = formattedExamples.replace(
    /^(?!<h3|<\/h3>|#\s+|Basic Examples:|Advanced Examples:)(sudo\s+.+|ls\s+.+|for\s+.+)$/gm,
    (match, command) => {
      if (command.trim() && !command.includes('<')) {
        return `<pre class="${styles.codeBlock}">${command.trim()}</pre>`;
      }
      return match;
    }
  );
  

  
  // Remove excessive line breaks and whitespace
  formattedExamples = formattedExamples.replace(/(\n\s*\n\s*\n)/g, '\n\n');
  
  return formattedExamples;
}

// Main page component
export default async function CommandPage({ params }: { params: { slug: string } }) {
  const command = await getCommand(params.slug);
  
  if (!command) {
    notFound();
  }
  
  // Structured data will be handled by CommandStructuredData component
  
  // Process HTML content if any
  const htmlContent = command.content ? formatContent(command.content) : '';
  const introText = `The <code>${command.title}</code> command is one of the most frequently used commands in Linux/Unix-like operating systems. <code>${command.title}</code> ${command.description}`;
  
  // Get related commands - try database first, then hardcoded, then same category
  let relatedCommands: string[] = [];
  
  // First try database related_commands
  if (command.related_commands && Array.isArray(command.related_commands) && command.related_commands.length > 0) {
    relatedCommands = command.related_commands;
  }
  // Then try hardcoded RELATED_COMMANDS
  else if (RELATED_COMMANDS[command.slug] && RELATED_COMMANDS[command.slug].length > 0) {
    relatedCommands = RELATED_COMMANDS[command.slug];
  }
  // Finally, fetch from same category
  else {
    const category = typeof command.category === 'string' ? command.category : (command.category || 'misc');
    relatedCommands = await getRelatedCommandsByCategory(category, command.slug, 5);
    
    // If still no results and we have a fallback, use it
    if (relatedCommands.length === 0 && RELATED_COMMANDS[command.slug]) {
      relatedCommands = RELATED_COMMANDS[command.slug];
    }
  }
  
  // Get use cases if available, otherwise use empty array
  const useCases = COMMAND_USE_CASES[command.slug] || [];
  
  // Get tips if available, otherwise use empty array
  const tips = COMMAND_TIPS[command.slug] || [];
  
  // Get appropriate basic usage example for the command
  const basicUsageExample = getBasicUsageExample(command.slug, command.title);
  
  // Ensure tips are strings, not objects
  const formattedTips = tips.map(tip => {
    // If tip is an object with title and description, convert to string
    if (tip && typeof tip === 'object' && 'title' in tip && 'description' in tip) {
      // Type assertion to tell TypeScript this is a UseCase
      const useCase = tip as { title: string; description: string };
      return `${useCase.title}: ${useCase.description}`;
    }
    return tip;
  });
  
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Add comprehensive structured data */}
      <CommandStructuredData command={command} />
      
      <div className="mb-8">
        <Link href="/commands" className="text-purple-600 hover:text-purple-800 inline-flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Commands
        </Link>
      </div>
      
      {/* Hero Section */}
      <div className={`${styles.heroSection} mb-10 p-8 rounded-xl relative overflow-hidden`}>
        <div className="relative z-10">
          <h1 className="text-5xl font-bold mb-4 text-white">{command.title}</h1>
          
          <div className="flex flex-wrap gap-2 mb-6">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${getCategoryColor(typeof command.category === 'string' ? command.category : 'misc')}`}>
              {typeof command.category === 'string' ? command.category.replace('-', ' ') : 'misc'}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
              {command.platform}
            </span>
          </div>
          
          <div className="text-xl text-gray-200 mb-6 max-w-2xl">
            <CommandText text={introText} className="text-gray-200" />
          </div>
          
          <div className="mt-6">
            <a href="#examples" className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 mr-3">
              See Examples
            </a>
            <a href="#syntax" className="inline-flex items-center px-4 py-2 border border-gray-300 text-base font-medium rounded-md text-gray-200 bg-transparent hover:bg-gray-700">
              View Syntax
            </a>
          </div>
        </div>
        
        {/* Terminal Illustration */}
        <div className={`${styles.terminalGraphic} absolute top-0 right-0 bottom-0 opacity-20`}>
          <div className={styles.terminalWindow}></div>
        </div>
      </div>
      
      {/* Quick Reference */}
      <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold mb-4 text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Quick Reference
          </h2>
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Command Name:</h3>
            <p className="text-gray-800">{command.title}</p>
          </div>
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Category:</h3>
            <p className="text-gray-800 capitalize">{typeof command.category === 'string' ? command.category.replace('-', ' ') : 'misc'}</p>
          </div>
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Platform:</h3>
            <p className="text-gray-800">{command.platform}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Basic Usage:</h3>
            <div className={styles.codeBlock}>
              {basicUsageExample}
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold mb-4 text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Common Use Cases
          </h2>
          <ul className="space-y-3">
            {useCases.slice(0, 4).map((useCase, index) => (
              <li key={index} className="flex items-start">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-purple-100 text-purple-800 text-sm font-medium mr-3 flex-shrink-0">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">{useCase.title}</h3>
                  <p className="text-sm text-gray-600">{useCase.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-10">
        <div id="syntax" className="border-b border-gray-200">
          <div className="px-6 py-3 bg-gray-50 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h2 className="text-lg font-semibold">Syntax</h2>
          </div>
          <div className="p-6 bg-gray-800 overflow-x-auto">
            {command.syntax ? (
              <pre className="text-gray-200 font-mono text-sm whitespace-pre-wrap">{command.syntax}</pre>
            ) : (
              <p className="text-gray-400 italic">Syntax not available</p>
            )}
          </div>
        </div>
        
        {command.options && (
          <div className="border-b border-gray-200">
            <div className="px-6 py-3 bg-gray-50 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <h2 className="text-lg font-semibold">Options</h2>
            </div>
            <div className="p-6">
              <FormattedContent html={command.options} />
            </div>
          </div>
        )}
        
        {command.examples && (
          <div id="examples" className="border-b border-gray-200">
            <div className="px-6 py-3 bg-gray-50 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <h2 className="text-lg font-semibold">Examples</h2>
            </div>
            <div className="p-6 bg-gradient-to-br from-white to-gray-50">
              {/* Examples Introduction */}
              <div className="mb-8 bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                <h3 className="text-lg font-semibold text-purple-800 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  How to Use These Examples
                </h3>
                <p className="text-purple-700">
                  The examples below show common ways to use the <code className={styles.codeInline}>{command.title}</code> command. 
                  Try them in your terminal to see the results. You can copy any example by clicking on the code block.
                </p>
              </div>
              
              {/* Formatted Examples */}
              <FormattedContent html={formatExamples(command.examples)} />
              
              {/* Interactive Tips */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="text-purple-800 font-semibold mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                    Try It Yourself
                  </h3>
                  <p className="text-purple-700">
                    Practice makes perfect! The best way to learn is by trying these examples on your own system with real files.
                  </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="text-green-800 font-semibold mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Understanding Syntax
                  </h3>
                  <p className="text-green-700">
                    Pay attention to the syntax coloring: <span className={styles.syntaxHighlight}>commands</span>, 
                    <span className={styles.optionHighlight}> options</span>, and 
                    <span className={styles.pathHighlight}> file paths</span> are highlighted differently.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {command.notes && (
          <div>
            <div className="px-6 py-3 bg-gray-50 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <h2 className="text-lg font-semibold">Notes</h2>
            </div>
            <div className={`p-6 ${styles.notesSection}`}>
              <FormattedContent html={formatNotes(command.notes)} />
            </div>
          </div>
        )}
      </div>
      
      {/* Tips & Tricks Section */}
      {formattedTips.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-10">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Tips & Tricks
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formattedTips.map((tip, index) => (
              <div key={index} className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-yellow-200 text-yellow-800 text-sm font-medium">
                      {index + 1}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-700">{tip}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Use Cases Section */}
      {useCases.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-10">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Common Use Cases
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {useCases.map((useCase, index) => (
              <div key={index} className="flex">
                <div className="flex-shrink-0 mt-1">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-purple-100 text-purple-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {useCase.title}
                  </h3>
                  <p className="mt-1 text-base text-gray-600">
                    {useCase.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Related Commands */}
      <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg shadow-md overflow-hidden mb-10">
        <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-violet-600 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          <h2 className="text-lg font-semibold text-white">Related Commands</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-600 mb-4">These commands are frequently used alongside <code className={styles.codeInline}>{command.title}</code> or serve similar purposes:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {relatedCommands.map((cmd, index) => (
              <Link 
                key={index} 
                href={`/commands/${cmd}`} 
                className="relative group"
              >
                <div className="transition-all duration-300 transform group-hover:scale-105 bg-white border border-gray-200 hover:border-purple-300 hover:shadow-md rounded-lg p-3 flex flex-col items-center text-center">
                  <span className="text-purple-600 font-mono font-medium mb-1">{cmd}</span>
                  <div className="h-1 w-10 bg-purple-400 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-5 text-center">
            <Link 
              href="/commands" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Explore All Commands
            </Link>
        </div>
        </div>
      </div>
      
      {/* Command Use Cases */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-10">
        <div className="px-6 py-3 bg-gray-50 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h2 className="text-lg font-semibold">Use Cases</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((useCase, index) => (
              <div key={index} className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white">
                    <span className="text-xl font-semibold">{index + 1}</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {useCase.title}
                  </h3>
                  <p className="mt-1 text-base text-gray-600">
                    {useCase.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {htmlContent && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-10">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Detailed Explanation
          </h2>
          <FormattedContent html={htmlContent} />
        </div>
      )}
      
      {/* "Learn By Doing" Section */}
      <div className="bg-purple-700 rounded-lg shadow-xl p-6 mb-10 text-white">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-2/3 mb-6 md:mb-0 md:pr-8">
            <h2 className="text-2xl font-bold mb-4">Learn By Doing</h2>
            <p className="mb-6">
              The best way to learn Linux commands is by practicing. Try out these examples in your terminal to build muscle memory and understand how the {command.title} command works in different scenarios.
            </p>
            <div className="flex flex-wrap gap-4">
              <a 
                href="#examples" 
                className="inline-flex items-center px-4 py-2 border border-white text-base font-medium rounded-md text-white hover:bg-purple-600"
              >
                See Examples
              </a>
              <Link 
                href="/lab-exercises" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-purple-700 bg-white hover:bg-gray-100"
              >
                Try Lab Exercises
              </Link>
            </div>
          </div>
          <div className="md:w-1/3 flex justify-center">
            <div className={styles.terminalAnimation}>
              <div className={styles.terminalHeader}>
                <div className={styles.terminalDot}></div>
                <div className={styles.terminalDot}></div>
                <div className={styles.terminalDot}></div>
              </div>
              <div className={styles.terminalBody}>
                <div className={styles.terminalText}>$ <span className={styles.command}>{command.title}</span></div>
                <div className={styles.terminalCursor}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <Link 
          href="/commands" 
          className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          View All Commands
        </Link>
        
        <BackToTopButton />
      </div>
      
      {/* Client-side script for copy button functionality */}
      <script dangerouslySetInnerHTML={{ __html: `
        document.addEventListener('DOMContentLoaded', function() {
          const copyButtons = document.querySelectorAll('.${styles.copyButton}');
          copyButtons.forEach(button => {
            button.addEventListener('click', function() {
              const originalText = button.innerHTML;
              const originalCommand = this.getAttribute('data-command');
              if (originalCommand) {
                navigator.clipboard.writeText(originalCommand)
                  .then(() => {
                    button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>';
                    setTimeout(() => {
                      button.innerHTML = originalText;
                    }, 2000);
                  })
                  .catch(err => {
                    console.error('Failed to copy text: ', err);
                  });
              }
            });
          });
        });
      ` }} />
    </div>
  );
} 

// Function to get appropriate basic usage example for different commands
function getBasicUsageExample(slug: string, commandName: string): React.ReactNode {
  // Default basic syntax highlighting pattern
  const defaultSyntax = <><span className={styles.syntaxHighlight}>{commandName}</span> [options] [arguments]</>;
  
  // Command-specific examples
  const examples: Record<string, React.ReactNode> = {
    'awk': <><span className={styles.syntaxHighlight}>awk</span> <span className={styles.optionHighlight}>{"{print $1}"}</span> <span className={styles.pathHighlight}>filename.txt</span></>,
    'blogbench': <><span className={styles.syntaxHighlight}>blogbench</span> <span className={styles.optionHighlight}>-d</span> <span className={styles.pathHighlight}>/mnt/testdrive</span></>,
    'bluetoothctl': <><span className={styles.syntaxHighlight}>bluetoothctl</span> <span className={styles.optionHighlight}>scan on</span></>,
    'break': <><span className={styles.syntaxHighlight}>break</span> <span className={styles.optionHighlight}>2</span></>,
    'cat': <><span className={styles.syntaxHighlight}>cat</span> <span className={styles.pathHighlight}>filename.txt</span></>,
    'cd': <><span className={styles.syntaxHighlight}>cd</span> <span className={styles.pathHighlight}>/path/to/directory</span></>,
    'chmod': <><span className={styles.syntaxHighlight}>chmod</span> <span className={styles.optionHighlight}>755</span> <span className={styles.pathHighlight}>filename.sh</span></>,
    'cp': <><span className={styles.syntaxHighlight}>cp</span> <span className={styles.pathHighlight}>source.txt destination.txt</span></>,
    'curl': <><span className={styles.syntaxHighlight}>curl</span> <span className={styles.optionHighlight}>-O</span> <span className={styles.pathHighlight}>https://example.com/file.zip</span></>,
    'date': <><span className={styles.syntaxHighlight}>date</span> <span className={styles.optionHighlight}>+"%Y-%m-%d %H:%M:%S"</span></>,
    'dc': <><span className={styles.syntaxHighlight}>dc</span> <span className={styles.optionHighlight}>-e "5 5 + p"</span></>,
    'debootstrap': <><span className={styles.syntaxHighlight}>debootstrap</span> <span className={styles.optionHighlight}>--arch=amd64</span> <span className={styles.pathHighlight}>bullseye /mnt/debian</span></>,
    'declare': <><span className={styles.syntaxHighlight}>declare</span> <span className={styles.optionHighlight}>-i</span> <span className={styles.pathHighlight}>number=10</span></>,
    'deluser': <><span className={styles.syntaxHighlight}>deluser</span> <span className={styles.pathHighlight}>username</span></>,
    'delgroup': <><span className={styles.syntaxHighlight}>delgroup</span> <span className={styles.pathHighlight}>groupname</span></>,
    'depmod': <><span className={styles.syntaxHighlight}>depmod</span> <span className={styles.optionHighlight}>-a</span></>,
    'df': <><span className={styles.syntaxHighlight}>df</span> <span className={styles.optionHighlight}>-h</span></>,
    'diff': <><span className={styles.syntaxHighlight}>diff</span> <span className={styles.pathHighlight}>file1.txt file2.txt</span></>,
    'diff3': <><span className={styles.syntaxHighlight}>diff3</span> <span className={styles.pathHighlight}>mine.txt original.txt yours.txt</span></>,
    'find': <><span className={styles.syntaxHighlight}>find</span> <span className={styles.pathHighlight}>.</span> <span className={styles.optionHighlight}>-name "*.txt"</span></>,
    'grep': <><span className={styles.syntaxHighlight}>grep</span> <span className={styles.optionHighlight}>"pattern"</span> <span className={styles.pathHighlight}>filename.txt</span></>,
    'ls': <><span className={styles.syntaxHighlight}>ls</span> <span className={styles.optionHighlight}>-la</span></>,
    'mkdir': <><span className={styles.syntaxHighlight}>mkdir</span> <span className={styles.pathHighlight}>new_directory</span></>,
    'mv': <><span className={styles.syntaxHighlight}>mv</span> <span className={styles.pathHighlight}>old_name.txt new_name.txt</span></>,
    'rm': <><span className={styles.syntaxHighlight}>rm</span> <span className={styles.pathHighlight}>filename.txt</span></>,
    'rmdir': <><span className={styles.syntaxHighlight}>rmdir</span> <span className={styles.pathHighlight}>empty_directory</span></>,
    'ssh': <><span className={styles.syntaxHighlight}>ssh</span> <span className={styles.pathHighlight}>user@hostname</span></>,
    'tar': <><span className={styles.syntaxHighlight}>tar</span> <span className={styles.optionHighlight}>-czvf</span> <span className={styles.pathHighlight}>archive.tar.gz directory/</span></>,
    'touch': <><span className={styles.syntaxHighlight}>touch</span> <span className={styles.pathHighlight}>filename.txt</span></>,
    'wget': <><span className={styles.syntaxHighlight}>wget</span> <span className={styles.pathHighlight}>https://example.com/file.zip</span></>,
  };
  
  // Return the command-specific example or default
  return examples[slug] || defaultSyntax;
}