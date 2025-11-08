"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Lock,
  PanelLeftOpen,
  PanelRightOpen,
  ShieldUser,
  Home,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import AuthButtons from "../auth-buttons";
import Logo from "../Logo";
import { useAuth } from '@/context/auth';
import { memo, useMemo } from 'react';
import { useMenu } from '@/hooks/useMenu';

// Definição de tipos para melhor TypeScript
interface NavigationLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  bgColor: string;
  disabled?: boolean;
  locked?: boolean;
  badge?: string;
  description?: string;
  category?: 'main' | 'tools' | 'settings';
}

// Links organizados por categoria
const navigationLinks: NavigationLink[] = [
   {
    href: "/",
    label: "Home",
    icon: Home,
    bgColor: "#fae1e4",
    description: "",
    category: 'main',
  },
  {
    href: "/account",
    label: "Account",
    icon: User,
    bgColor: "#fae1e4",
    description: "Manage your account",
    category: 'main'
  },
];

// Componente individual do item de navegação
const NavigationItem = memo(({
  link,
  isActive,
  shrinkMenu
}: {
  link: NavigationLink;
  isActive: boolean;
  shrinkMenu: boolean;
}) => {
  const { href, label, icon: Icon, disabled, locked, bgColor, badge, description } = link;
  const isDisabled = disabled || locked;

  const tooltipContent = useMemo(() => {
    if (locked) return "Premium feature - Upgrade to unlock";
    if (disabled) return `${description || label} - Coming soon`;
    return shrinkMenu ? `${label}${description ? ` - ${description}` : ''}` : description;
  }, [locked, disabled, description, label, shrinkMenu]);

  const {  isMaster } = useAuth();


  const buttonContent = (
    <Button
      disabled={isDisabled}
      variant={isActive ? "default" : "ghost"}
      style={{
        '--hover-bg': bgColor,
        '--hover-bg-opacity': '0.2',
      } as React.CSSProperties}
      className={`
        flex ${shrinkMenu ? 'justify-center' : 'justify-between'}
        group relative w-full h-15 transition-all duration-200 
        shadow-none font-semibold text-lg rounded-full p-0 mb-5
        text-center
        bg-white hover:bg-secondary hover:text-primary
        ${isActive && "bg-primary text-white hover:bg-primary "}
        ${isDisabled ? "opacity-60 cursor-not-allowed" : ""}  
         ${isMaster && 'bg-muted'}
        `}
    >

      {/* Icon */}
      <div className="relative flex-shrink-0">
        {shrinkMenu && (
          <Icon
          size={22}
            className={`
            transition-transform duration-200
            text-primary 
            ${isActive && 'text-white'}
            ${!isDisabled && !shrinkMenu ? 'group-hover:scale-110' : ''}
          `}
          />
        )}
        {locked && (
          <Lock
            size={10}
            className="absolute -top-1 -right-1 text-amber-500 bg-white rounded-full p-0.5"
          />
        )}
      </div>

      {/* Label e Badge */}
      {!shrinkMenu && (
        <>
          <span className={`flex-1 text-center truncate text-primary ${isActive && 'text-white'} relative flex gap-2 justify-center`}>
            {label}

            {badge && (
            <Badge
              variant={locked ? "secondary" : disabled ? "outline" : "default"}
              className={`
                text-xs bg-transparent text-primary ${isActive && 'text-secondary'} rounded-full p-0 border-0
              `}
            >
              {"("}
{badge}{")"}
            </Badge>
          )}
          </span>

          
        </>
      )}

      {/* Active indicator para modo shrunk */}
      {/* {isActive && shrinkMenu && (
        <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-secondary rounded-l-full" />
      )} */}
    </Button>
  );

  const linkElement = (
    <Link
      href={!isDisabled ? href : "#"}
      className="block w-full"
      onClick={(e) => {
        if (isDisabled) {
          e.preventDefault();
        }
      }}
      tabIndex={isDisabled ? -1 : 0}
    >
      {buttonContent}
    </Link>
  );

  // Wrap com tooltip se necessário
  if (shrinkMenu || tooltipContent) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {linkElement}
        </TooltipTrigger>
        <TooltipContent side="right" 
          style={{
            '--hover-bg': bgColor,
          } as React.CSSProperties}
          className={`max-w-xs bg-[color:var(--hover-bg)]`}
        
        >
          <p className="font-bold text-[#2F2F47]">{label}</p>
          {description && <p className="text-xs text-gray-700 mt-1">{description}</p>}
          {/* {locked && <p className="text-xs text-amber-600 mt-1">Premium feature</p>} */}
          {/* {disabled && <p className="text-xs text-dark-grey mt-1">Coming soon</p>} */}
        </TooltipContent>
      </Tooltip>
    );
  }

  return linkElement;
});

NavigationItem.displayName = 'NavigationItem';

// Componente principal
export default function SidebarNav() {
  const pathname = usePathname();
  const { shrinkMenu, toggleShrinkMenu } = useMenu();
  const { isAuthenticated, isMaster } = useAuth();
  const router = useRouter();


  // Filtra links baseado em permissões
  const visibleLinks = useMemo(() => {
    return navigationLinks.filter(link => {
      // Se não está autenticado, mostra apenas links públicos
      if (!isAuthenticated) return false;

      return true;
    });
  }, [isAuthenticated]);

  // Agrupa links por categoria
  const linksByCategory = useMemo(() => {
    return visibleLinks.reduce((acc, link) => {
      const category = link.category || 'main';
      if (!acc[category]) acc[category] = [];
      acc[category].push(link);
      return acc;
    }, {} as Record<string, NavigationLink[]>);
  }, [visibleLinks]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <TooltipProvider>
      <aside
        className={`
           backdrop-blur-sm border-r border-border/50
          flex flex-col 
          fixed top-0 left-0 bottom-0 z-50
          transition-all duration-300 ease-in-out
          ${shrinkMenu ? "w-20" : "w-70"}
          h-screen

          ${isMaster ? 'bg-dark-grey text-white border-white' : 'bg-muted/50'}
        `}
      >
        {/* Header */}
        <div className={`
          flex items-center border-b border-border/50 justify-center px-4 py-6 h-[168px]`}>
          <Logo link small={shrinkMenu} className={`${isMaster ? 'invert' : ''}`}/>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-6">
            {/* Main links */}
            {linksByCategory.main && (
              <div className={shrinkMenu ? 'px-2' : 'px-4'}>
                <div className="space-y-1">
                  {linksByCategory.main.map((link) => (
                    <NavigationItem
                      key={link.href}
                      link={link}
                      isActive={pathname === link.href}
                      shrinkMenu={shrinkMenu}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>
          {/* IS MASTER */}
        {isMaster && (
          <Button title="Manage users" onClick={()=> router.push('/admin/users')} className="mb-5 w-[80%] mx-auto font-bold h-15 transition-all duration-1000 bg-royal border-1 border-royal text-white hover:text-royal" >
            <ShieldUser size={40} /> {!shrinkMenu ? 'Admin Dashboard' : ''}
          </Button>
        )}

        {/* Footer */}
        <div className={`
          border-t border-border/50  p-5 flex items-center
          ${isMaster ? 'bg-white' :'bg-white/30'}
        `}>
          <AuthButtons />

          {/* Collapse button when shrunk */}
          <div className="mt-2 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleShrinkMenu}
              className={`
              absolute -right-5 bottom-15 transform -translate-y-1/2
              h-6 w-6 p-0 rounded-none
              hover:bg-muted hover:scale-110
              transition-all duration-200

              ${isMaster ? 'text-dark-grey' : ''}
            `}
              title="Expand sidebar"
            >
              {shrinkMenu ? (
                <PanelLeftOpen size={16} />
              ) : (
                <PanelRightOpen size={16} />
              )}
            </Button>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}