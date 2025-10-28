import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { 
  ChmodCalculator, 
  ChmodInfoSections, 
  HeroSection as ChmodCalculatorHeroSection, 
  QuickReferenceSection as ChmodCalculatorQuickReferenceSection,
  SubscribeSection as ChmodCalculatorSubscribeSection,
  RelatedToolsSection as ChmodCalculatorRelatedToolsSection
} from '@/components/tools/ChmodCalculator';
import {
  ChownGenerator,
  ChownInfoSections
} from '@/components/tools/ChownGenerator';
import {
  UmaskCalculator,
  UmaskInfoSections
} from '@/components/tools/UmaskCalculator';
import {
  StickyBitVisualizer,
  StickyBitInfoSections
} from '@/components/tools/StickyBitVisualizer';
import {
  SetuidSetgidDemonstrator,
  SetuidSetgidInfoSections
} from '@/components/tools/SetuidSetgidDemonstrator';
import {
  PermissionConversionTool,
  PermissionConversionInfoSections
} from '@/components/tools/PermissionConversionTool';
import {
  RecursiveChmodGenerator,
  RecursiveChmodInfoSections
} from '@/components/tools/RecursiveChmodGenerator';
import {
  RecursiveChownGenerator,
  RecursiveChownInfoSections
} from '@/components/tools/RecursiveChownGenerator';
import {
  AclPermissionGenerator,
  AclPermissionInfoSections
} from '@/components/tools/AclPermissionGenerator';
import {
  EffectivePermissionCalculator,
  EffectivePermissionInfoSections
} from '@/components/tools/EffectivePermissionCalculator';
import {
  PermissionAuditChecker,
  PermissionAuditInfoSections
} from '@/components/tools/PermissionAuditChecker';
import {
  GroupPermissionConflictChecker,
  GroupPermissionConflictInfoSections
} from '@/components/tools/GroupPermissionConflictChecker';
import {
  DockerVolumePermissionHelper,
  DockerVolumePermissionHelperInfoSections
} from '@/components/tools/DockerVolumePermissionHelper';
import {
  WebServerFilePermissionTool,
  WebServerFilePermissionToolInfoSections
} from '@/components/tools/WebServerFilePermissionTool';
import {
  SftpFtpAccessConfigTool,
  SftpFtpAccessConfigToolInfoSections
} from '@/components/tools/SftpFtpAccessConfigTool';
import {
  ChmodExplainerTool,
  ChmodExplainerInfoSections,
  HeroSection as ChmodExplainerHeroSection,
  RelatedToolsSection as ChmodExplainerRelatedToolsSection,
  SubscribeSection as ChmodExplainerSubscribeSection
} from '@/components/tools/ChmodExplainerTool';
import {
  ComparePermissionsTool,
  ComparePermissionsInfoSections,
  HeroSection as ComparePermissionsHeroSection,
  RelatedToolsSection as ComparePermissionsRelatedToolsSection,
  SubscribeSection as ComparePermissionsSubscribeSection
} from '@/components/tools/ComparePermissionsTool';
import { GroupaddUsermodBuilder, GroupaddUsermodInfoSections, HeroSection as GroupaddUsermodHeroSection, RelatedToolsSection as GroupaddUsermodRelatedToolsSection, SubscribeSection as GroupaddUsermodSubscribeSection } from '@/components/tools/GroupaddUsermodBuilder';
import {
  UseraddCommandGenerator,
  UseraddInfoSections,
  UseraddCommandGeneratorScript
} from '@/components/tools/UseraddCommandGenerator';
import { CheckUserAccessToFileTool, CheckUserAccessToFileInfoSections, HeroSection as CheckUserAccessToFileHeroSection, RelatedToolsSection as CheckUserAccessToFileRelatedToolsSection, SubscribeSection as CheckUserAccessToFileSubscribeSection } from '@/components/tools/CheckUserAccessToFileTool';
import { AccountLockUnlockGenerator, AccountLockUnlockInfoSections, HeroSection as AccountLockUnlockHeroSection, RelatedToolsSection as AccountLockUnlockRelatedToolsSection, SubscribeSection as AccountLockUnlockSubscribeSection } from '@/components/tools/AccountLockUnlockGenerator';
import { UserExpiryDateGenerator, UserExpiryDateInfoSections, HeroSection as UserExpiryDateHeroSection, RelatedToolsSection as UserExpiryDateRelatedToolsSection, SubscribeSection as UserExpiryDateSubscribeSection } from '@/components/tools/UserExpiryDateGenerator';
import { GroupMembershipVisualTool, GroupMembershipInfoSections, HeroSection as GroupMembershipVisualHeroSection, RelatedToolsSection as GroupMembershipVisualRelatedToolsSection, SubscribeSection as GroupMembershipVisualSubscribeSection } from '@/components/tools/GroupMembershipVisualTool';
import { PermissionAuditScriptGenerator, PermissionAuditScriptInfoSections, HeroSection as PermissionAuditScriptHeroSection, RelatedToolsSection as PermissionAuditScriptRelatedToolsSection, SubscribeSection as PermissionAuditScriptSubscribeSection } from '@/components/tools/PermissionAuditScriptGenerator';
import { CrontabGenerator, CrontabGeneratorInfoSections, HeroSection as CrontabGeneratorHeroSection, RelatedToolsSection as CrontabGeneratorRelatedToolsSection, SubscribeSection as CrontabGeneratorSubscribeSection } from '@/components/tools/CrontabGenerator';
import { FileOwnershipVisualTree, FileOwnershipVisualTreeInfoSections, HeroSection as FileOwnershipVisualTreeHeroSection, RelatedToolsSection as FileOwnershipVisualTreeRelatedToolsSection, SubscribeSection as FileOwnershipVisualTreeSubscribeSection } from '@/components/tools/FileOwnershipVisualTree';
import { UserPrivilegeEscalationDetector, UserPrivilegeEscalationDetectorInfoSections, HeroSection as UserPrivilegeEscalationDetectorHeroSection, RelatedToolsSection as UserPrivilegeEscalationDetectorRelatedToolsSection, SubscribeSection as UserPrivilegeEscalationDetectorSubscribeSection } from '@/components/tools/UserPrivilegeEscalationDetector';
import { CrontabHumanLanguageTranslator, CrontabHumanLanguageTranslatorInfoSections, HeroSection as CrontabHumanLanguageTranslatorHeroSection, RelatedToolsSection as CrontabHumanLanguageTranslatorRelatedToolsSection, SubscribeSection as CrontabHumanLanguageTranslatorSubscribeSection } from '@/components/tools/CrontabHumanLanguageTranslator';
import { CrontabEntryVisualizer, CrontabEntryVisualizerInfoSections, HeroSection as CrontabEntryVisualizerHeroSection, RelatedToolsSection as CrontabEntryVisualizerRelatedToolsSection, SubscribeSection as CrontabEntryVisualizerSubscribeSection } from '@/components/tools/CrontabEntryVisualizer';
import { CrontabValidator, CrontabValidatorInfoSections, HeroSection as CrontabValidatorHeroSection, RelatedToolsSection as CrontabValidatorRelatedToolsSection, SubscribeSection as CrontabValidatorSubscribeSection } from '@/components/tools/CrontabValidator';
import { CrontabSchedulePreviewer, CrontabSchedulePreviewerInfoSections, HeroSection as CrontabSchedulePreviewerHeroSection, RelatedToolsSection as CrontabSchedulePreviewerRelatedToolsSection, SubscribeSection as CrontabSchedulePreviewerSubscribeSection } from '@/components/tools/CrontabSchedulePreviewer';
import { CronJobBackupScriptGenerator, CronJobBackupScriptGeneratorInfoSections, HeroSection as CronJobBackupScriptGeneratorHeroSection, RelatedToolsSection as CronJobBackupScriptGeneratorRelatedToolsSection, SubscribeSection as CronJobBackupScriptGeneratorSubscribeSection } from '@/components/tools/CronJobBackupScriptGenerator';
import { HybridCronTimerComparator, HybridCronTimerComparatorInfoSections, HeroSection as HybridCronTimerComparatorHeroSection, RelatedToolsSection as HybridCronTimerComparatorRelatedToolsSection, SubscribeSection as HybridCronTimerComparatorSubscribeSection } from '@/components/tools/HybridCronTimerComparator';
import { ContainerizedCronJobGenerator, ContainerizedCronJobGeneratorInfoSections, HeroSection as ContainerizedCronJobGeneratorHeroSection, RelatedToolsSection as ContainerizedCronJobGeneratorRelatedToolsSection, SubscribeSection as ContainerizedCronJobGeneratorSubscribeSection } from '@/components/tools/ContainerizedCronJobGenerator';
import { FstabEntryGenerator, FstabEntryGeneratorInfoSections, HeroSection as FstabEntryGeneratorHeroSection, RelatedToolsSection as FstabEntryGeneratorRelatedToolsSection, SubscribeSection as FstabEntryGeneratorSubscribeSection } from '@/components/tools/FstabEntryGenerator';
import { FstabEntryValidator, FstabEntryValidatorInfoSections, HeroSection as FstabEntryValidatorHeroSection, RelatedToolsSection as FstabEntryValidatorRelatedToolsSection, SubscribeSection as FstabEntryValidatorSubscribeSection } from '@/components/tools/FstabEntryValidator';
import { MountCommandGenerator, MountCommandGeneratorInfoSections, HeroSection as MountCommandGeneratorHeroSection, RelatedToolsSection as MountCommandGeneratorRelatedToolsSection, SubscribeSection as MountCommandGeneratorSubscribeSection } from '@/components/tools/MountCommandGenerator';
import { MountOptionExplainer, MountOptionExplainerInfoSections, HeroSection as MountOptionExplainerHeroSection, RelatedToolsSection as MountOptionExplainerRelatedToolsSection, SubscribeSection as MountOptionExplainerSubscribeSection } from '@/components/tools/MountOptionExplainer';
import { AutoMountConfigurationTool, AutoMountConfigurationToolInfoSections, HeroSection as AutoMountConfigurationToolHeroSection, RelatedToolsSection as AutoMountConfigurationToolRelatedToolsSection, SubscribeSection as AutoMountConfigurationToolSubscribeSection } from '@/components/tools/AutoMountConfigurationTool';
import { DiskLabelingTool, DiskLabelingToolInfoSections, HeroSection as DiskLabelingToolHeroSection, RelatedToolsSection as DiskLabelingToolRelatedToolsSection, SubscribeSection as DiskLabelingToolSubscribeSection } from '@/components/tools/DiskLabelingTool';

import { DockerCrontabTemplateGenerator, DockerCrontabTemplateGeneratorInfoSections, HeroSection as DockerCrontabTemplateGeneratorHeroSection, RelatedToolsSection as DockerCrontabTemplateGeneratorRelatedToolsSection, SubscribeSection as DockerCrontabTemplateGeneratorSubscribeSection } from '@/components/tools/DockerCrontabTemplateGenerator';
import { MultipleJobCronGenerator, MultipleJobCronGeneratorInfoSections, HeroSection as MultipleJobCronGeneratorHeroSection, RelatedToolsSection as MultipleJobCronGeneratorRelatedToolsSection, SubscribeSection as MultipleJobCronGeneratorSubscribeSection } from '@/components/tools/MultipleJobCronGenerator';
import { CrontabGuiDesigner, CrontabGuiDesignerInfoSections, HeroSection as CrontabGuiDesignerHeroSection, RelatedToolsSection as CrontabGuiDesignerRelatedToolsSection, SubscribeSection as CrontabGuiDesignerSubscribeSection } from '@/components/tools/CrontabGuiDesigner';
import { CustomTimeBasedBackupCronBuilder, CustomTimeBasedBackupCronBuilderInfoSections, HeroSection as CustomTimeBasedBackupCronBuilderHeroSection, RelatedToolsSection as CustomTimeBasedBackupCronBuilderRelatedToolsSection, SubscribeSection as CustomTimeBasedBackupCronBuilderSubscribeSection } from '@/components/tools/CustomTimeBasedBackupCronBuilder';
import { 
  HeroSection as AtCommandGeneratorHeroSection, 
  AtCommandGenerator, 
  QuickReferenceSection, 
  AtInfoSections, 
  SubscribeSection, 
  RelatedToolsSection 
} from '@/components/tools/AtCommandGenerator';
import { 
  AnacronJobGenerator, 
  AnacronJobGeneratorInfoSections, 
  HeroSection as AnacronJobGeneratorHeroSection, 
  RelatedToolsSection as AnacronJobGeneratorRelatedToolsSection, 
  SubscribeSection as AnacronJobGeneratorSubscribeSection 
} from '@/components/tools/AnacronJobGenerator';



import { 
  CommandRetryCronGenerator, 
  CommandRetryCronGeneratorInfoSections, 
  HeroSection as CommandRetryCronGeneratorHeroSection, 
  RelatedToolsSection as CommandRetryCronGeneratorRelatedToolsSection, 
  SubscribeSection as CommandRetryCronGeneratorSubscribeSection 
} from '@/components/tools/CommandRetryCronGenerator';
import ToolStructuredData from '@/components/SEO/ToolStructuredData';

// Define tool type
interface Tool {
  id: number;
  title: string;
  slug: string;
  description: string;
  icon: string;
  file_path: string;
  published: boolean;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  schema_json?: string;
  category?: string;
  platform?: string;
  license?: string;
  official_url?: string;
  popularity?: number;
  created_at?: string;
  updated_at?: string;
}

// Generate metadata for the page
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getTool(slug);
  
  if (!tool) {
    return {
      title: 'Tool Not Found - LinuxConcept',
      description: 'The requested tool could not be found.',
    };
  }
  
  return {
    title: tool.seo_title || `${tool.title} - Linux Tools`,
    description: tool.seo_description || tool.description,
    keywords: tool.seo_keywords,
  };
}

// Function to generate structured data for the tool is now imported from the shared component

async function getTool(slug: string): Promise<Tool | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
      (process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000' 
        : 'https://ainews.com');
    
    const res = await fetch(`${baseUrl}/api/tools/${slug}`, { 
      cache: 'no-store'
    });
    
    if (!res.ok) {
      if (res.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch tool: ${res.statusText}`);
    }
    
    const data = await res.json();
    return data.tool;
  } catch (error) {
    console.error(`Error fetching tool with slug "${slug}":`, error);
    return null;
  }
}

async function getToolHtml(filePath: string): Promise<string> {
  try {
    // In production, we'd fetch the HTML file from a storage service or CDN
    // For this example, we'll simulate HTML content based on the tool
    if (filePath.includes('chmod-calculator')) {
      return `
        <div id="chmod-calculator">
          <div class="calculator-section">
            <h2 class="text-xl font-semibold mb-4">File Permissions Calculator</h2>
            
            <div class="grid grid-cols-3 gap-4 mb-6">
              <div>
                <h3 class="font-medium mb-2">Owner</h3>
                <div class="flex flex-col space-y-2">
                  <label class="flex items-center">
                    <input type="checkbox" class="mr-2 permission-checkbox" data-position="0" data-value="4" /> Read
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" class="mr-2 permission-checkbox" data-position="0" data-value="2" /> Write
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" class="mr-2 permission-checkbox" data-position="0" data-value="1" /> Execute
                  </label>
                </div>
              </div>
              
              <div>
                <h3 class="font-medium mb-2">Group</h3>
                <div class="flex flex-col space-y-2">
                  <label class="flex items-center">
                    <input type="checkbox" class="mr-2 permission-checkbox" data-position="1" data-value="4" /> Read
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" class="mr-2 permission-checkbox" data-position="1" data-value="2" /> Write
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" class="mr-2 permission-checkbox" data-position="1" data-value="1" /> Execute
                  </label>
                </div>
              </div>
              
              <div>
                <h3 class="font-medium mb-2">Others</h3>
                <div class="flex flex-col space-y-2">
                  <label class="flex items-center">
                    <input type="checkbox" class="mr-2 permission-checkbox" data-position="2" data-value="4" /> Read
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" class="mr-2 permission-checkbox" data-position="2" data-value="2" /> Write
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" class="mr-2 permission-checkbox" data-position="2" data-value="1" /> Execute
                  </label>
                </div>
              </div>
            </div>
            
            <div class="results bg-gray-100 p-4 rounded-lg">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <h3 class="font-medium mb-2">Numeric Notation</h3>
                  <div id="numeric-value" class="text-2xl font-mono">000</div>
                </div>
                <div>
                  <h3 class="font-medium mb-2">Symbolic Notation</h3>
                  <div id="symbolic-value" class="text-2xl font-mono">---------</div>
                </div>
              </div>
              
              <div class="mt-4">
                <h3 class="font-medium mb-2">Command</h3>
                <div class="bg-gray-800 text-white p-2 rounded font-mono" id="chmod-command">chmod 000 filename</div>
              </div>
            </div>
          </div>
        </div>
        
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            const checkboxes = document.querySelectorAll('.permission-checkbox');
            const numericValue = document.getElementById('numeric-value');
            const symbolicValue = document.getElementById('symbolic-value');
            const chmodCommand = document.getElementById('chmod-command');
            
            function updateValues() {
              const permValues = [0, 0, 0];
              const symbolicChars = ['-', '-', '-', '-', '-', '-', '-', '-', '-'];
              
              checkboxes.forEach(checkbox => {
                const position = parseInt(checkbox.getAttribute('data-position'));
                const value = parseInt(checkbox.getAttribute('data-value'));
                
                if (checkbox.checked) {
                  permValues[position] += value;
                  
                  // Update symbolic chars
                  if (value === 4) symbolicChars[position * 3] = 'r';
                  if (value === 2) symbolicChars[position * 3 + 1] = 'w';
                  if (value === 1) symbolicChars[position * 3 + 2] = 'x';
                }
              });
              
              numericValue.textContent = permValues.join('');
              symbolicValue.textContent = symbolicChars.join('');
              chmodCommand.textContent = \`chmod \${permValues.join('')} filename\`;
            }
            
            checkboxes.forEach(checkbox => {
              checkbox.addEventListener('change', updateValues);
            });
          });
        </script>
      `;
    } else if (filePath.includes('crontab-generator')) {
      return `
        <div class="text-center py-8">
          <p class="text-gray-600">This tool is now available as a React component with enhanced features.</p>
        </div>
      `;
    } else {
      return `<div class="p-4 bg-yellow-100 text-yellow-800 rounded">Tool content not available.</div>`;
    }
  } catch (error) {
    console.error(`Error fetching HTML for tool at path "${filePath}":`, error);
    return `<div class="p-4 bg-red-100 text-red-800 rounded">Error loading tool content. Please try again later.</div>`;
  }
}

// Function to get related tools
async function getRelatedTools(currentSlug: string): Promise<any[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
      (process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000' 
        : 'https://ainews.com');
    
    // Here we would normally query by category or tags
    // For now, we'll just get a few random tools excluding the current one
    const res = await fetch(`${baseUrl}/api/tools?limit=6&exclude=${currentSlug}`, { 
      cache: 'no-store'
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch related tools: ${res.statusText}`);
      return [];
    }
    
    const data = await res.json();
    return data.tools || [];
  } catch (error) {
    console.error(`Error fetching related tools:`, error);
    return [];
  }
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = await getTool(slug);
  
  console.log("Tool fetched:", tool); // Debug log
  
  if (!tool) {
    notFound();
  }
  
  // Structured data will be rendered by ToolStructuredData component
  
  // Get related tools
  const relatedTools = await getRelatedTools(slug);
  
  // Normalize file_path for more consistent checking
  const normalizedPath = tool.file_path.replace(/^\/tools\//, '');
  
  // Determine which tool component to render based on the slug
  let ToolComponent: React.ComponentType | null = null;
  let InfoSections: React.ComponentType | null = null;
  let ClientScript: React.FC | null = null;

  switch (tool.slug) {
    case 'chmod-calculator':
      ToolComponent = ChmodCalculator;
      InfoSections = ChmodInfoSections;
      break;
    case 'chown-generator':
      ToolComponent = ChownGenerator;
      InfoSections = ChownInfoSections;
      break;
    case 'umask-calculator':
      ToolComponent = UmaskCalculator;
      InfoSections = UmaskInfoSections;
      break;
    case 'sticky-bit-visualizer':
      ToolComponent = StickyBitVisualizer;
      InfoSections = StickyBitInfoSections;
      break;
    case 'setuid-setgid-demonstrator':
      ToolComponent = SetuidSetgidDemonstrator;
      InfoSections = SetuidSetgidInfoSections;
      break;
    case 'permission-conversion-tool':
      ToolComponent = PermissionConversionTool;
      InfoSections = PermissionConversionInfoSections;
      break;
    case 'recursive-chmod-generator':
      ToolComponent = RecursiveChmodGenerator;
      InfoSections = RecursiveChmodInfoSections;
      break;
    case 'recursive-chown-generator':
      ToolComponent = RecursiveChownGenerator;
      InfoSections = RecursiveChownInfoSections;
      break;
    case 'acl-permission-generator':
      ToolComponent = AclPermissionGenerator;
      InfoSections = AclPermissionInfoSections;
      break;
    case 'effective-permission-calculator':
      ToolComponent = EffectivePermissionCalculator;
      InfoSections = EffectivePermissionInfoSections;
      break;
    case 'permission-audit-checker':
      ToolComponent = PermissionAuditChecker;
      InfoSections = PermissionAuditInfoSections;
      break;
    case 'group-permission-conflict-checker':
      ToolComponent = GroupPermissionConflictChecker;
      InfoSections = GroupPermissionConflictInfoSections;
      break;
    case 'docker-volume-permission-helper':
      ToolComponent = DockerVolumePermissionHelper;
      InfoSections = DockerVolumePermissionHelperInfoSections;
      break;
    case 'web-server-file-permission-tool':
      ToolComponent = WebServerFilePermissionTool;
      InfoSections = WebServerFilePermissionToolInfoSections;
      break;
    case 'sftp-ftp-access-config-tool':
      ToolComponent = SftpFtpAccessConfigTool;
      InfoSections = SftpFtpAccessConfigToolInfoSections;
      break;
    case 'chmod-explainer-tool':
      ToolComponent = ChmodExplainerTool;
      InfoSections = ChmodExplainerInfoSections;
      break;
    case 'compare-permissions-tool':
      ToolComponent = ComparePermissionsTool;
      InfoSections = ComparePermissionsInfoSections;
      break;
    case 'groupadd-usermod-builder':
      ToolComponent = GroupaddUsermodBuilder;
      InfoSections = GroupaddUsermodInfoSections;
      break;
    case 'useradd-command-generator':
      ToolComponent = UseraddCommandGenerator;
      InfoSections = UseraddInfoSections;
      ClientScript = UseraddCommandGeneratorScript;
      break;
    case 'hybrid-cron-timer-comparator':
      ToolComponent = HybridCronTimerComparator;
      InfoSections = HybridCronTimerComparatorInfoSections;
      break;
    case 'containerized-cron-job-generator':
      ToolComponent = ContainerizedCronJobGenerator;
      InfoSections = ContainerizedCronJobGeneratorInfoSections;
      break;
    case 'fstab-entry-generator':
      ToolComponent = FstabEntryGenerator;
      InfoSections = FstabEntryGeneratorInfoSections;
      break;
    case 'fstab-entry-validator':
      ToolComponent = FstabEntryValidator;
      InfoSections = FstabEntryValidatorInfoSections;
      break;
    case 'mount-command-generator':
      ToolComponent = MountCommandGenerator;
      InfoSections = MountCommandGeneratorInfoSections;
      break;
    case 'mount-option-explainer':
      ToolComponent = MountOptionExplainer;
      InfoSections = MountOptionExplainerInfoSections;
      break;
    case 'automount-configuration-tool':
      ToolComponent = AutoMountConfigurationTool;
      InfoSections = AutoMountConfigurationToolInfoSections;
      break;
    case 'disk-labeling-tool':
      ToolComponent = DiskLabelingTool;
      InfoSections = DiskLabelingToolInfoSections;
      break;
    default:
      // Try to render as static HTML if available
      break;
  }
  
  // Render specific tool components
  if (normalizedPath.includes('chmod-explainer-tool')) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        <ChmodExplainerHeroSection 
          title={tool.title}
          description={tool.description || "Convert between numeric and symbolic file permissions. Understand Linux file permissions with our interactive tool."}
        />
        <ChmodExplainerTool />
        <ChmodExplainerInfoSections />
        <ChmodExplainerRelatedToolsSection tools={relatedTools} />
        <ChmodExplainerSubscribeSection />
      </div>
    );
  }

  if (normalizedPath.includes('compare-permissions-tool')) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        <ComparePermissionsHeroSection 
          title={tool.title}
          description={tool.description || "Compare file permissions between two files to understand security differences and identify potential vulnerabilities."}
        />
        <ComparePermissionsTool />
        <ComparePermissionsInfoSections />
        <ComparePermissionsRelatedToolsSection tools={relatedTools} />
        <ComparePermissionsSubscribeSection />
      </div>
    );
  }

  if (normalizedPath.includes('groupadd-usermod-builder')) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        <GroupaddUsermodHeroSection 
          title={tool.title}
          description={tool.description || "Build Linux user and group management commands with our interactive tool. Generate proper groupadd and usermod commands."}
        />
        <GroupaddUsermodBuilder />
        <GroupaddUsermodInfoSections />
        <GroupaddUsermodRelatedToolsSection tools={relatedTools} />
        <GroupaddUsermodSubscribeSection />
      </div>
    );
  }
  
  // Containerized Cron Job Generator Tool
  if (normalizedPath.includes('containerized-cron-job-generator')) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        
        <ContainerizedCronJobGeneratorHeroSection 
          title={tool.title}
          description={tool.description || "Create cron jobs specifically designed for containerized environments with proper resource management and volume configuration."}
        />
        
        {ToolComponent && <ToolComponent />}
        
        {InfoSections && <InfoSections />}
        
        <ContainerizedCronJobGeneratorRelatedToolsSection tools={relatedTools} />
        
        <ContainerizedCronJobGeneratorSubscribeSection />
      </div>
    );
  }

  // Fstab Entry Generator Tool
  if (normalizedPath.includes('fstab-entry-generator')) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        
        <FstabEntryGeneratorHeroSection 
          title={tool.title}
          description={tool.description || "Generate proper /etc/fstab entries for various filesystem types. Create mount configurations with appropriate options, dump settings, and pass numbers for automatic mounting at boot time."}
        />
        
        {ToolComponent && <ToolComponent />}
        
        {InfoSections && <InfoSections />}
        
        <FstabEntryGeneratorRelatedToolsSection tools={relatedTools} />
        
        <FstabEntryGeneratorSubscribeSection />
      </div>
    );
  }

  // Fstab Entry Validator Tool
  if (normalizedPath.includes('fstab-entry-validator')) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        
        <FstabEntryValidatorHeroSection 
          title={tool.title}
          description={tool.description || "Validate existing /etc/fstab entries and identify potential configuration issues. Check for syntax errors, invalid mount options, missing directories, and other common problems that could prevent your system from booting properly."}
        />
        
        {ToolComponent && <ToolComponent />}
        
        {InfoSections && <InfoSections />}
        
        <FstabEntryValidatorRelatedToolsSection tools={relatedTools} />
        
        <FstabEntryValidatorSubscribeSection />
      </div>
    );
  }

  // Mount Command Generator Tool
  if (normalizedPath.includes('mount-command-generator')) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        
        <MountCommandGeneratorHeroSection 
          title={tool.title}
          description={tool.description || "Generate proper mount commands for various filesystem types and scenarios. Create mount commands with appropriate options, validate syntax, and get ready-to-use commands for mounting filesystems, network shares, and special devices."}
        />
        
        {ToolComponent && <ToolComponent />}
        
        {InfoSections && <InfoSections />}
        
        <MountCommandGeneratorRelatedToolsSection tools={relatedTools} />
        
        <MountCommandGeneratorSubscribeSection />
      </div>
    );
  }

  // Mount Option Explainer Tool
  if (normalizedPath.includes('mount-option-explainer')) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        
        <MountOptionExplainerHeroSection 
          title={tool.title}
          description={tool.description || "Understand what different mount options do and when to use them. Learn about performance options, security settings, network configurations, and how different options affect your filesystem behavior and system performance."}
        />
        
        {ToolComponent && <ToolComponent />}
        
        {InfoSections && <InfoSections />}
        
        <MountOptionExplainerRelatedToolsSection tools={relatedTools} />
        
        <MountOptionExplainerSubscribeSection />
      </div>
    );
  }

  // AutoMount Configuration Tool
  if (normalizedPath.includes('automount-configuration-tool')) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        
        <AutoMountConfigurationToolHeroSection 
          title={tool.title}
          description={tool.description || "Configure automatic mounting of filesystems and devices at boot time. Create proper fstab entries, configure udev rules, and set up systemd mount units for seamless filesystem access without manual intervention."}
        />
        
        {ToolComponent && <ToolComponent />}
        
        {InfoSections && <InfoSections />}
        
        <AutoMountConfigurationToolRelatedToolsSection tools={relatedTools} />
        
        <AutoMountConfigurationToolSubscribeSection />
      </div>
    );
  }

  // Disk Labeling Tool
  if (normalizedPath.includes('disk-labeling-tool')) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        
        <DiskLabelingToolHeroSection 
          title={tool.title}
          description={tool.description || "Label and manage filesystem labels for various filesystem types including ext4, xfs, btrfs, fat32, and ntfs. Generate commands to read, set, or remove labels with proper syntax for each filesystem type."}
        />
        
        {ToolComponent && <ToolComponent />}
        
        {InfoSections && <InfoSections />}
        
        <DiskLabelingToolRelatedToolsSection tools={relatedTools} />
        
        <DiskLabelingToolSubscribeSection />
      </div>
    );
  }

  // Hybrid Cron Timer Comparator Tool
  if (normalizedPath.includes('hybrid-cron-timer-comparator')) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        
        <HybridCronTimerComparatorHeroSection 
          title={tool.title}
          description={tool.description || "Compare traditional cron scheduling with modern systemd timers and get hybrid recommendations for optimal task scheduling."}
        />
        
        {ToolComponent && <ToolComponent />}
        
        {InfoSections && <InfoSections />}
        
        <HybridCronTimerComparatorRelatedToolsSection tools={relatedTools} />
        
        <HybridCronTimerComparatorSubscribeSection />
      </div>
    );
  }

  // Chmod Calculator Tool
  if (normalizedPath.includes('chmod-calculator')) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        
        <ChmodCalculatorHeroSection 
          title={tool.title}
          description={tool.description || "A Linux file permissions calculator to easily generate chmod commands based on your required permission settings."}
        />
        
        {ToolComponent && <ToolComponent />}
        
        <ChmodCalculatorQuickReferenceSection />
        
        {InfoSections && <InfoSections />}
        
        <ChmodCalculatorRelatedToolsSection tools={relatedTools} />
        
        <ChmodCalculatorSubscribeSection />
      </div>
    );
  }
  
  // Chown Generator Tool
  if (normalizedPath.includes('chown-generator')) {
    console.log("Rendering chown-generator tool"); // Debug log
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        <ChmodCalculatorHeroSection 
          title={tool.title}
          description={tool.description || "A Linux file ownership tool to easily generate chown commands for changing user and group ownership."}
        />
        
        {ToolComponent && <ToolComponent />}
        
        {InfoSections && <InfoSections />}
        
        <ChmodCalculatorRelatedToolsSection tools={relatedTools} />
        
        <ChmodCalculatorSubscribeSection />
      </div>
    );
  }
  
  // Umask Calculator Tool
  if (normalizedPath.includes('umask-calculator')) {
    console.log("Rendering umask-calculator tool"); // Debug log
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        <ChmodCalculatorHeroSection 
          title={tool.title}
          description={tool.description || "A Linux umask calculator to understand how file and directory default permissions are affected by umask settings."}
        />
        
        {ToolComponent && <ToolComponent />}
        
        {InfoSections && <InfoSections />}
        
        <ChmodCalculatorRelatedToolsSection tools={relatedTools} />
        
        <ChmodCalculatorSubscribeSection />
      </div>
    );
  }
  
  // Sticky Bit Visualizer Tool
  if (normalizedPath.includes('sticky-bit-visualizer')) {
    console.log("Rendering sticky-bit-visualizer tool");
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        <ChmodCalculatorHeroSection
          title={tool.title}
          description={tool.description || "A Linux tool to visualize and understand the sticky bit and its effect on directory permissions."}
        />

        {ToolComponent && <ToolComponent />}

        {InfoSections && <InfoSections />}

        <ChmodCalculatorRelatedToolsSection tools={relatedTools} />

        <ChmodCalculatorSubscribeSection />
      </div>
    );
  }
  
  // Setuid/Setgid Demonstrator Tool
  if (normalizedPath.includes('setuid-setgid-demonstrator')) {
    console.log("Rendering setuid-setgid-demonstrator tool");
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        <ChmodCalculatorHeroSection
          title={tool.title}
          description={tool.description || "A Linux tool to visualize and understand setuid and setgid bits and their effect on file and directory permissions."}
        />

        {ToolComponent && <ToolComponent />}

        {InfoSections && <InfoSections />}

        <ChmodCalculatorRelatedToolsSection tools={relatedTools} />

        <ChmodCalculatorSubscribeSection />
      </div>
    );
  }
  
  // Permission Conversion Tool (Octal ↔ Symbolic)
  if (normalizedPath.includes('permission-conversion-tool')) {
    console.log("Rendering permission-conversion-tool");
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        <ChmodCalculatorHeroSection
          title={tool.title}
          description={tool.description || "A Linux tool to convert file permissions between octal and symbolic notation."}
        />

        {ToolComponent && <ToolComponent />}

        {InfoSections && <InfoSections />}

        <ChmodCalculatorRelatedToolsSection tools={relatedTools} />

        <ChmodCalculatorSubscribeSection />
      </div>
    );
  }
  
  // Recursive Chmod Command Generator Tool
  if (normalizedPath.includes('recursive-chmod-generator')) {
    console.log("Rendering recursive-chmod-generator tool");
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        <ChmodCalculatorHeroSection
          title={tool.title}
          description={tool.description || "A Linux tool to generate recursive chmod commands for files and directories, with octal or symbolic modes."}
        />

        {ToolComponent && <ToolComponent />}

        {InfoSections && <InfoSections />}

        <ChmodCalculatorRelatedToolsSection tools={relatedTools} />

        <ChmodCalculatorSubscribeSection />
      </div>
    );
  }
  
  // Recursive Chown Command Generator Tool
  if (normalizedPath.includes('recursive-chown-generator')) {
    console.log("Rendering recursive-chown-generator tool");
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        <ChmodCalculatorHeroSection
          title={tool.title}
          description={tool.description || "A Linux tool to generate recursive chown commands for files and directories, with user and group options."}
        />

        {ToolComponent && <ToolComponent />}

        {InfoSections && <InfoSections />}

        <RelatedToolsSection tools={relatedTools} />

        <ChmodCalculatorSubscribeSection />
      </div>
    );
  }
  
  // ACL Permission Generator (getfacl/setfacl) Tool
  if (normalizedPath.includes('acl-permission-generator')) {
    console.log("Rendering acl-permission-generator tool");
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        <ChmodCalculatorHeroSection
          title={tool.title}
          description={tool.description || "A Linux tool to generate getfacl and setfacl commands for managing Access Control Lists (ACLs) on files and directories."}
        />

        {ToolComponent && <ToolComponent />}

        {InfoSections && <InfoSections />}

        <ChmodCalculatorRelatedToolsSection tools={relatedTools} />

        <ChmodCalculatorSubscribeSection />
      </div>
    );
  }
  
  // Effective Permission Calculator (User + Group + Others) Tool
  if (normalizedPath.includes('effective-permission-calculator')) {
    console.log("Rendering effective-permission-calculator tool");
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        <ChmodCalculatorHeroSection
          title={tool.title}
          description={tool.description || "A Linux tool to calculate the effective permissions for a user, considering user, group, and others permissions."}
        />

        {ToolComponent && <ToolComponent />}

        {InfoSections && <InfoSections />}

        <ChmodCalculatorRelatedToolsSection tools={relatedTools} />

        <ChmodCalculatorSubscribeSection />
      </div>
    );
  }
  
  // Permission Audit Checker Tool
  if (normalizedPath.includes('permission-audit-checker')) {
    console.log("Rendering permission-audit-checker tool");
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        <ChmodCalculatorHeroSection
          title={tool.title}
          description={tool.description || "A Linux tool to audit file and directory permissions for risky or non-standard settings. Paste ls -l output and get a security report."}
        />

        {ToolComponent && <ToolComponent />}

        {InfoSections && <InfoSections />}

        <ChmodCalculatorRelatedToolsSection tools={relatedTools} />

        <ChmodCalculatorSubscribeSection />
      </div>
    );
  }
  
  // Group Permission Conflict Checker Tool
  if (normalizedPath.includes('group-permission-conflict-checker')) {
    console.log("Rendering group-permission-conflict-checker tool");
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        <ChmodCalculatorHeroSection
          title={tool.title}
          description={tool.description || "A Linux tool to check for conflicts between group permissions and user/other permissions on files and directories."}
        />

        {ToolComponent && <ToolComponent />}

        {InfoSections && <InfoSections />}

        <ChmodCalculatorRelatedToolsSection tools={relatedTools} />

        <ChmodCalculatorSubscribeSection />
      </div>
    );
  }
  
  // Docker Volume Permission Helper Tool
  if (normalizedPath.includes('docker-volume-permission-helper')) {
    console.log("Rendering docker-volume-permission-helper tool");
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        <ChmodCalculatorHeroSection
          title={tool.title}
          description={tool.description || "A tool to help resolve permission issues between Docker containers and host system volumes with proper user/group mappings."}
        />

        {ToolComponent && <ToolComponent />}

        {InfoSections && <InfoSections />}

        <ChmodCalculatorRelatedToolsSection tools={relatedTools} />

        <ChmodCalculatorSubscribeSection />
      </div>
    );
  }
  
  // Web Server File Permission Tool
  if (normalizedPath.includes('web-server-file-permission-tool')) {
    console.log("Rendering web-server-file-permission-tool");
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        <ChmodCalculatorHeroSection
          title={tool.title}
          description={tool.description || "A tool to generate optimal file and directory permissions for Apache and Nginx web servers, for secure and functional website hosting."}
        />

        {ToolComponent && <ToolComponent />}

        {InfoSections && <InfoSections />}

        <RelatedToolsSection tools={relatedTools} />

        <ChmodCalculatorSubscribeSection />
      </div>
    );
  }
  
  // SFTP/FTP File Access Config Tool
  if (normalizedPath.includes('sftp-ftp-access-config-tool')) {
    console.log("Rendering sftp-ftp-access-config-tool");
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        <ChmodCalculatorHeroSection
          title={tool.title}
          description={tool.description || "A tool to properly configure file permissions and access for FTP and SFTP servers with secure settings."}
        />

        {ToolComponent && <ToolComponent />}

        {InfoSections && <InfoSections />}

        <RelatedToolsSection tools={relatedTools} />

        <SubscribeSection />
      </div>
    );
  }
  
  // Useradd Command Generator Tool
  if (normalizedPath.includes('useradd-command-generator')) {
    console.log("Rendering useradd-command-generator tool");
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        <ChmodCalculatorHeroSection
          title={tool.title}
          description={tool.description || "A Linux tool to generate useradd commands for creating new users."}
        />

        {ToolComponent && <ToolComponent />}

        {InfoSections && <InfoSections />}

        <RelatedToolsSection tools={relatedTools} />

        <ChmodCalculatorSubscribeSection />

        {ClientScript && <ClientScript />}
      </div>
    );
  }
  
  // Check User Access to File Tool
  if (normalizedPath.includes('check-user-access-to-file-tool')) {
    console.log("Rendering check-user-access-to-file-tool");
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        <CheckUserAccessToFileHeroSection
          title={tool.title}
          description={tool.description || "Analyze and verify Linux file permissions and user access rights. Check effective permissions, security risks, and generate commands for permission analysis and management."}
        />

        <CheckUserAccessToFileTool />

        <CheckUserAccessToFileInfoSections />

        <CheckUserAccessToFileRelatedToolsSection tools={relatedTools} />

        <CheckUserAccessToFileSubscribeSection />
      </div>
    );
  }
  
  // Account Lock/Unlock Script Generator Tool
  if (normalizedPath.includes('account-lock-unlock-generator')) {
    console.log("Rendering account-lock-unlock-generator");
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        <AccountLockUnlockHeroSection
          title={tool.title}
          description={tool.description || "Generate Linux user account lock/unlock scripts and commands. Create automated scripts for managing account security, password policies, and user access control with comprehensive logging and notifications."}
        />

        <AccountLockUnlockGenerator />

        <AccountLockUnlockInfoSections />

        <AccountLockUnlockRelatedToolsSection tools={relatedTools} />

        <AccountLockUnlockSubscribeSection />
      </div>
    );
  }
  
  // User Expiry Date Generator Tool
  if (normalizedPath.includes('user-expiry-date-generator')) {
    console.log("Rendering user-expiry-date-generator");
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        <UserExpiryDateHeroSection
          title={tool.title}
          description={tool.description || "Generate Linux user expiry date commands and scripts. Create automated solutions for managing user account expiration, password policies, and temporary access with comprehensive logging and notifications."}
        />

        <UserExpiryDateGenerator />

        <UserExpiryDateInfoSections />

        <UserExpiryDateRelatedToolsSection tools={relatedTools} />

        <UserExpiryDateSubscribeSection />
      </div>
    );
  }
  
  // Group Membership Visual Tool
  if (normalizedPath.includes('group-membership-visual-tool')) {
    console.log("Rendering group-membership-visual-tool");
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        <GroupMembershipVisualHeroSection
          title={tool.title}
          description={tool.description || "Visualize and manage Linux user group memberships with interactive diagrams. Create, modify, and visualize group relationships, manage user memberships, and generate system administration commands for group management."}
        />

        <GroupMembershipVisualTool />

        <GroupMembershipInfoSections />

        <GroupMembershipVisualRelatedToolsSection tools={relatedTools} />

        <GroupMembershipVisualSubscribeSection />
      </div>
    );
  }
  
  // Crontab Schedule Previewer Tool
  if (normalizedPath.includes('crontab-schedule-previewer')) {
    console.log("Rendering crontab-schedule-previewer");
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        <CrontabSchedulePreviewerHeroSection
          title={tool.title}
          description={tool.description || "A comprehensive Linux tool to preview cron schedules and see the next 5 scheduled runs. Plan maintenance windows, coordinate team schedules, and ensure timely task execution with precise scheduling information."}
        />

        <CrontabSchedulePreviewer />

        <CrontabSchedulePreviewerInfoSections />

        <CrontabSchedulePreviewerRelatedToolsSection tools={relatedTools} />

        <CrontabSchedulePreviewerSubscribeSection />
      </div>
    );
  }
  
  // Cron Job Backup Script Generator Tool
  if (normalizedPath.includes('cron-job-backup-script-generator')) {
    console.log("Rendering cron-job-backup-script-generator");
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        <CronJobBackupScriptGeneratorHeroSection
          title={tool.title}
          description={tool.description || "A comprehensive Linux tool to generate automated backup scripts for cron jobs. Create robust backup solutions with multiple strategies, compression options, and retention policies for reliable data protection."}
        />

        <CronJobBackupScriptGenerator />

        <CronJobBackupScriptGeneratorInfoSections />

        <CronJobBackupScriptGeneratorRelatedToolsSection tools={relatedTools} />

        <CronJobBackupScriptGeneratorSubscribeSection />
      </div>
    );
  }
  
  // Multiple Job Cron Generator Tool
  if (normalizedPath.includes('multiple-job-cron-generator')) {
    console.log("Rendering multiple-job-cron-generator");
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        <MultipleJobCronGeneratorHeroSection
          title={tool.title}
          description={tool.description || "A comprehensive Linux tool to generate system-wide cron configurations for multiple jobs. Create enterprise-grade scheduling solutions with proper logging, monitoring, and backup strategies for production environments."}
        />

        <MultipleJobCronGenerator />

        <MultipleJobCronGeneratorInfoSections />

        <MultipleJobCronGeneratorRelatedToolsSection tools={relatedTools} />

        <MultipleJobCronGeneratorSubscribeSection />
      </div>
    );
  }
  
            // Custom Time-Based Backup Cron Builder Tool
          if (normalizedPath.includes('custom-time-based-backup-cron-builder')) {
            console.log("Rendering custom-time-based-backup-cron-builder");
            return (
              <div className="max-w-5xl mx-auto px-4 py-8">
                <ToolStructuredData tool={tool} />
                <CustomTimeBasedBackupCronBuilderHeroSection
                  title={tool.title}
                  description={tool.description || "A specialized tool for building custom time-based backup cron jobs. Create comprehensive backup strategies with multiple types, retention policies, compression, and monitoring for enterprise-grade data protection."}
                />

                <CustomTimeBasedBackupCronBuilder />

                <CustomTimeBasedBackupCronBuilderInfoSections />

                <CustomTimeBasedBackupCronBuilderRelatedToolsSection tools={relatedTools} />

                <CustomTimeBasedBackupCronBuilderSubscribeSection />
              </div>
            );
          }

          // Crontab GUI Designer Tool
          if (normalizedPath.includes('crontab-gui-designer')) {
            console.log("Rendering crontab-gui-designer");
            return (
              <div className="max-w-5xl mx-auto px-4 py-8">
                <ToolStructuredData tool={tool} />
                <CrontabGuiDesignerHeroSection
                  title={tool.title}
                  description={tool.description || "A comprehensive visual designer for creating and managing cron jobs. Features drag-and-drop interface, project organization, live preview, and multiple export formats for professional cron job management."}
                />

                <CrontabGuiDesigner />

                <CrontabGuiDesignerInfoSections />

                <CrontabGuiDesignerRelatedToolsSection tools={relatedTools} />

                <CrontabGuiDesignerSubscribeSection />
              </div>
            );
          }

          // Docker Crontab Template Generator Tool
          if (normalizedPath.includes('docker-crontab-template-generator')) {
            console.log("Rendering docker-crontab-template-generator");
            return (
              <div className="max-w-5xl mx-auto px-4 py-8">
                <ToolStructuredData tool={tool} />
                <DockerCrontabTemplateGeneratorHeroSection
                  title={tool.title}
                  description={tool.description || "A specialized Linux tool to generate Docker-based cron job configurations. Create production-ready templates for containerized environments with proper volume mappings, environment variables, and restart policies."}
                />

                <DockerCrontabTemplateGenerator />

                <DockerCrontabTemplateGeneratorInfoSections />

                <DockerCrontabTemplateGeneratorRelatedToolsSection tools={relatedTools} />

                <DockerCrontabTemplateGeneratorSubscribeSection />
              </div>
            );
          }

          // Crontab Validator Tool
  if (normalizedPath.includes('crontab-validator')) {
    console.log("Rendering crontab-validator");
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        <CrontabValidatorHeroSection
          title={tool.title}
          description={tool.description || "A comprehensive Linux tool to validate cron expressions and check syntax. Ensure your scheduled tasks are properly configured with detailed error reporting, warnings, and suggestions."}
        />

        <CrontabValidator />

        <CrontabValidatorInfoSections />

        <CrontabValidatorRelatedToolsSection tools={relatedTools} />

        <CrontabValidatorSubscribeSection />
      </div>
    );
  }
  
  // Crontab Entry Visualizer Tool
  if (normalizedPath.includes('crontab-entry-visualizer')) {
    console.log("Rendering crontab-entry-visualizer");
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        <CrontabEntryVisualizerHeroSection
          title={tool.title}
          description={tool.description || "A comprehensive Linux tool to visualize cron expressions with interactive diagrams, timeline views, calendar displays, and frequency analysis. Understand your scheduled tasks through visual representations."}
        />

        <CrontabEntryVisualizer />

        <CrontabEntryVisualizerInfoSections />

        <CrontabEntryVisualizerRelatedToolsSection tools={relatedTools} />

        <CrontabEntryVisualizerSubscribeSection />
      </div>
    );
  }
  
  // Crontab Human Language Translator Tool
  if (normalizedPath.includes('crontab-human-language-translator')) {
    console.log("Rendering crontab-human-language-translator");
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        <CrontabHumanLanguageTranslatorHeroSection
          title={tool.title}
          description={tool.description || "A comprehensive Linux tool to translate between cron expressions and human language. Understand cron schedules, generate human-readable descriptions, and learn cron syntax with interactive examples and educational content."}
        />

        <CrontabHumanLanguageTranslator />

        <CrontabHumanLanguageTranslatorInfoSections />

        <CrontabHumanLanguageTranslatorRelatedToolsSection tools={relatedTools} />

        <CrontabHumanLanguageTranslatorSubscribeSection />
      </div>
    );
  }
  
  // User Privilege Escalation Detector Tool
  if (normalizedPath.includes('user-privilege-escalation-detector')) {
    console.log("Rendering user-privilege-escalation-detector");
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        <UserPrivilegeEscalationDetectorHeroSection
          title={tool.title}
          description={tool.description || "A comprehensive Linux security tool to detect potential privilege escalation vulnerabilities. Scan users for sudo access, SUID files, file permissions, and other security risks."}
        />

        <UserPrivilegeEscalationDetector />

        <UserPrivilegeEscalationDetectorInfoSections />

        <UserPrivilegeEscalationDetectorRelatedToolsSection tools={relatedTools} />

        <UserPrivilegeEscalationDetectorSubscribeSection />
      </div>
    );
  }
  
  // File Ownership Visual Tree Tool
  if (normalizedPath.includes('file-ownership-visual-tree')) {
    console.log("Rendering file-ownership-visual-tree");
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        <FileOwnershipVisualTreeHeroSection
          title={tool.title}
          description={tool.description || "A Linux tool to visualize file and directory ownership as a tree, showing user and group relationships. Interactive visualization of file permissions and ownership hierarchy."}
        />

        <FileOwnershipVisualTree />

        <FileOwnershipVisualTreeInfoSections />

        <FileOwnershipVisualTreeRelatedToolsSection tools={relatedTools} />

        <FileOwnershipVisualTreeSubscribeSection />
      </div>
    );
  }
  
  // Crontab Generator Tool
  if (normalizedPath.includes('crontab-generator')) {
    console.log("Rendering crontab-generator");
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        <CrontabGeneratorHeroSection
          title={tool.title}
          description={tool.description || "Generate cron expressions for scheduled tasks. Create Linux cron jobs with our interactive tool that helps you build proper cron expressions for automation."}
        />

        <CrontabGenerator />

        <CrontabGeneratorInfoSections />

        <CrontabGeneratorRelatedToolsSection tools={relatedTools} />

        <CrontabGeneratorSubscribeSection />
      </div>
    );
  }
  
  // at Command Generator Tool
  if (normalizedPath.includes('at-command-generator')) {
    console.log("Rendering at-command-generator");
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        <AtCommandGeneratorHeroSection
          title={tool.title}
          description={tool.description || "Generate precise at commands for Linux task scheduling. Schedule one-time tasks with our interactive command generator tool."}
        />

        <AtCommandGenerator />

        <AtInfoSections />

        <QuickReferenceSection />

        <SubscribeSection />

        <RelatedToolsSection tools={relatedTools} />
      </div>
    );
  }
  
                // Anacron Job Generator Tool
              if (normalizedPath.includes('anacron-job-generator')) {
                console.log("Rendering anacron-job-generator");
                return (
                  <div className="max-w-5xl mx-auto px-4 py-8">
                    <ToolStructuredData tool={tool} />
                    <AnacronJobGeneratorHeroSection
                      title={tool.title}
                      description={tool.description || "Generate anacron job configurations for daily, weekly, and monthly tasks. Create reliable scheduled jobs that run even when the system is offline."}
                    />
            
                    <AnacronJobGenerator />
            
                    <AnacronJobGeneratorInfoSections />
            
                    <AnacronJobGeneratorRelatedToolsSection tools={relatedTools} />
            
                    <AnacronJobGeneratorSubscribeSection />
                  </div>
                );
              }



              // Command Retry Cron Generator Tool
              if (normalizedPath.includes('command-retry-cron-generator')) {
                console.log("Rendering command-retry-cron-generator");
                return (
                  <div className="max-w-5xl mx-auto px-4 py-8">
                    <ToolStructuredData tool={tool} />
                    <CommandRetryCronGeneratorHeroSection
                      title={tool.title}
                      description={tool.description || "Create cron jobs with intelligent retry logic and exponential backoff for failed commands. Generate retry scripts, systemd timers, and cron entries with configurable retry strategies."}
                    />
            
                    <CommandRetryCronGenerator />
            
                    <CommandRetryCronGeneratorInfoSections />
            
                    <CommandRetryCronGeneratorRelatedToolsSection tools={relatedTools} />
            
                    <CommandRetryCronGeneratorSubscribeSection />
                  </div>
                );
              }
  
  // Permission Audit Script Generator Tool
  if (normalizedPath.includes('permission-audit-script-generator')) {
    console.log("Rendering permission-audit-script-generator");
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        <PermissionAuditScriptHeroSection
          title={tool.title}
          description={tool.description || "Generate comprehensive Linux permission audit scripts for security analysis. Create bash or Python scripts to scan for world-writable files, SetUID/SetGID files, orphaned files, and other permission issues with automated remediation commands."}
        />

        <PermissionAuditScriptGenerator />

        <PermissionAuditScriptInfoSections />

        <PermissionAuditScriptRelatedToolsSection tools={relatedTools} />

        <PermissionAuditScriptSubscribeSection />
      </div>
    );
  }
  
  // Default for other tools
  console.log("Rendering default tool HTML:", tool.file_path); // Debug log
  const htmlContent = await getToolHtml(tool.file_path);
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{tool.title}</h1>
      
      {tool.description && (
        <p className="text-lg text-gray-600 mb-8">{tool.description}</p>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </div>
    </div>
  );
} 