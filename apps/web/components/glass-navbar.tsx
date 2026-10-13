"use client";

interface GlassNavbarProps {
  redirectAllToSignin?: boolean;
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  onOpenSearch?: () => void;
  onOpenProfile?: () => void;
  onOpenMenu?: () => void;
}

export function GlassNavbar(_props: GlassNavbarProps) {
  // Completely removed floating top navbar across the app to eliminate any overlap with movie modals and content
  return null;
}
