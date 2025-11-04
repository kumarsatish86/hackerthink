import Image from 'next/image';
import Link from 'next/link';
import { FaLinkedin, FaTwitter, FaGithub, FaGlobe, FaCheckCircle } from 'react-icons/fa';

interface GuestProfileProps {
  guest: {
    name: string;
    slug?: string;
    photo_url?: string;
    bio?: string;
    bio_summary?: string;
    title?: string;
    company?: string;
    company_url?: string;
    designation?: string;
    social_links?: {
      linkedin?: string;
      twitter?: string;
      github?: string;
      website?: string;
    };
    verified?: boolean;
  };
  compact?: boolean;
}

export default function GuestProfile({ guest, compact = false }: GuestProfileProps) {
  const socialLinks = guest.social_links || {};

  return (
    <div className={`bg-white rounded-lg shadow ${compact ? 'p-4' : 'p-6'}`}>
      <div className={`flex ${compact ? 'flex-row gap-4' : 'flex-col items-center text-center'}`}>
        {guest.photo_url ? (
          <div className={`relative ${compact ? 'w-16 h-16' : 'w-24 h-24'} rounded-full overflow-hidden flex-shrink-0`}>
            <Image
              src={guest.photo_url}
              alt={guest.name}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className={`${compact ? 'w-16 h-16' : 'w-24 h-24'} rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0`}>
            <span className="text-2xl font-bold text-gray-500">
              {guest.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        
        <div className={compact ? 'flex-1' : 'mt-4'}>
          <div className="flex items-center justify-center gap-2 mb-1">
            <h3 className={`font-bold text-gray-900 ${compact ? 'text-lg' : 'text-2xl'}`}>
              {guest.name}
            </h3>
            {guest.verified && (
              <FaCheckCircle className="text-blue-500" title="Verified" />
            )}
          </div>
          
          {guest.title && (
            <p className={`text-gray-600 ${compact ? 'text-sm' : 'text-base'} mb-1`}>
              {guest.title}
            </p>
          )}
          
          {guest.company && (
            <p className={`text-gray-600 ${compact ? 'text-sm' : 'text-base'}`}>
              {guest.company_url ? (
                <Link href={guest.company_url} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600">
                  {guest.company}
                </Link>
              ) : (
                guest.company
              )}
            </p>
          )}
          
          {guest.designation && (
            <p className="text-sm text-gray-500 mt-1">
              {guest.designation}
            </p>
          )}
          
          {!compact && guest.bio_summary && (
            <p className="text-gray-600 text-sm mt-3 line-clamp-3">
              {guest.bio_summary}
            </p>
          )}
          
          {(socialLinks.linkedin || socialLinks.twitter || socialLinks.github || socialLinks.website) && (
            <div className={`flex items-center gap-3 ${compact ? 'mt-2' : 'mt-4'} justify-center`}>
              {socialLinks.linkedin && (
                <Link
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                  title="LinkedIn"
                >
                  <FaLinkedin className="w-5 h-5" />
                </Link>
              )}
              {socialLinks.twitter && (
                <Link
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                  title="Twitter/X"
                >
                  <FaTwitter className="w-5 h-5" />
                </Link>
              )}
              {socialLinks.github && (
                <Link
                  href={socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-800 transition-colors"
                  title="GitHub"
                >
                  <FaGithub className="w-5 h-5" />
                </Link>
              )}
              {socialLinks.website && (
                <Link
                  href={socialLinks.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-indigo-600 transition-colors"
                  title="Website"
                >
                  <FaGlobe className="w-5 h-5" />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
      
      {!compact && guest.bio && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-2">About</h4>
          <p className="text-gray-600 text-sm leading-relaxed">
            {guest.bio}
          </p>
        </div>
      )}
    </div>
  );
}

