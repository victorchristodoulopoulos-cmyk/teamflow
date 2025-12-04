import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = "", showText = true, size = 'md' }) => {
  const sizeClasses = {
    sm: "h-6",
    md: "h-8",
    lg: "h-12"
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl"
  };

  return (
    <div className={`flex items-center gap-2 select-none ${className} group`}>
      {/* Isotype: The Flash-T (Aggressive Slant) */}
      <div className={`relative ${sizeClasses[size]} aspect-square flex items-center justify-center transform -skew-x-12`}>
        <svg viewBox="0 0 40 40" fill="none" className="w-full h-full drop-shadow-[0_0_15px_rgba(201,255,47,0.5)] transition-transform group-hover:scale-110 duration-300" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 8H36L30 16H40L20 40L24 20H8L12 8Z" fill="#C9FF2F" stroke="#0D1B2A" strokeWidth="1" strokeLinejoin="round"/>
        </svg>
      </div>
      
      {/* Logotype */}
      {showText && (
        <div className="flex flex-col justify-center leading-none transform -skew-x-6">
          <span className={`font-display font-black tracking-tighter text-white ${textSizes[size]}`}>
            TEAM<span className="text-brand-neon">FLOW</span>
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;