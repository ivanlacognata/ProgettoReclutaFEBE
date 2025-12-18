'use client';

import Link from 'next/link';
import React from 'react';

interface SidebarItemProps {
  icon?: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
  bgColor?: string;      
  hoverColor?: string;   
  className?: string;    
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  href,
  onClick,
  bgColor = '',
  hoverColor = '',
  className = '',
}) => {

  const classes = `
    flex items-center gap-3 px-4 py-2 rounded-xl transition
    cursor-pointer select-none
    ${bgColor}
    ${hoverColor}
    ${className}
  `.replace(/\s+/g, ' ');

  if (href) {
    return (
      <Link href={href} className={classes}>
        {icon}
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={classes} type="button">
      {icon}
      <span>{label}</span>
    </button>
  );
};

export default SidebarItem;
