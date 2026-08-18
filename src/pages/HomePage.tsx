import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents, useLayers } from '../lib/queries/events';
import { LayerChips } from '../components/timeline/LayerChips';
import { ZoomControls } from '../components/timeline/ZoomControls';
import { TimeMachineScrubber } from '../components/timeline/TimeMachineScrubber';
import { ActiveEventDashboard } from '../components/timeline/ActiveEventDashboard';
import { TimelineTrack } from '../components/timeline/TimelineTrack';
import { SearchBox } from '../components/search/SearchBox';
import { DetailPanel } from '../components/panel/DetailPanel';
import { RealWorldMap } from '../components/map/RealWorldMap';
import { AIHistorianModal } from '../components/historian/AIHistorianModal';
import { OnboardingTour } from '../components/onboarding/OnboardingTour';
import { SEOHead } from '../components/seo/SEOHead';
import { useAuth } from '../lib/authService';
import { Compass, Bot, ShieldCheck, User, Play, Map, Menu, X } from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { data: events = [], isLoading: isLoadingEvents } = useEvents();
  const { data: layers = [], isLoading: isLoadingLayers } = useLayers();
  const { user, isEditor } = useAuth();

  const [isHistorianOpen, setIsHistorianOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('atlas_seen_onboarding');
    if (!seen) {
      setIsOnboardingOpen(true);
    }
  }, []);

  const eventCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of events) {
      for (const l of e.layers) {
        counts[l.key] = (counts[l.key] || 0) + 1;
      }
    }
    return counts;
  }, [events]);

  const isLoading = isLoadingEvents || isLoadingLayers;

  return (
    <div className="min-h-screen flex flex-col bg-atlas-bg text-atlas-text overflow-x-hidden">
      {/* SEO & Meta Tags */}
      <SEOHead
        title="Atlas of Time — Interactive Timeline of Earth & History"
        description="Explore 13.8 billion years of Earth, Humanity, and Civilization through a logarithmic chronological spine."
        canonicalUrl="https://atlasoftime.org/"
      />

      {/* App Responsive Header */}
      <header className="px-3 md:px-4 py-2.5 bg-atlas-panel border-b border-atlas-border flex items-center justify-between gap-3 shadow-lg z-30">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 md:p-2 rounded bg-atlas-surface border border-atlas-brass/40 text-atlas-brass shadow-[0_0_10px_rgba(201,161,92,0.2)] shrink-0">
            <Compass className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <div>
            <h1 className="font-serif text-sm md:text-lg font-bold tracking-wide text-atlas-parchment flex items-center gap-2">
              <span>ATLAS OF TIME</span>
              <span className="font-mono text-[9px] md:text-[10px] font-normal px-1.5 py-0.5 rounded bg-atlas-brass/20 text-atlas-brass border border-atlas-brass/30 hidden xs:inline">
                Time Machine Mode
              </span>
            </h1>
            <p className="font-sans text-[10px] md:text-[11px] text-atlas-muted hidden md:block">
              Interactive Timeline of Earth, Humanity & Civilization
            </p>
          </div>
        </div>

        {/* Desktop Live Search Box */}
        <div className="hidden sm:block flex-grow max-w-sm">
          <SearchBox />
        </div>

        {/* Header Action Controls */}
        <div className="flex items-center gap-2 text-xs font-mono">
          {/* Spatial Map Toggle Button */}
          <button
            onClick={() => setIsMapVisible(!isMapVisible)}
            className={`p-1.5 md:px-2.5 md:py-1.5 rounded border transition-colors flex items-center gap-1.5 ${
              isMapVisible
                ? 'bg-atlas-brass/20 text-atlas-brass border-atlas-brass/40'
                : 'bg-atlas-surface border-atlas-border text-atlas-muted hover:text-atlas-parchment'
            }`}
            title="Toggle Spatial Map"
          >
            <Map className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{isMapVisible ? 'Hide Map' : 'Show Map'}</span>
          </button>

          {/* AI Historian Button */}
          <button
            onClick={() => setIsHistorianOpen(true)}
            className="flex items-center gap-1 px-2 py-1.5 md:px-3 md:py-1.5 rounded bg-atlas-brass/10 hover:bg-atlas-brass/20 text-atlas-brass border border-atlas-brass/30 font-sans font-semibold transition-colors shadow-sm"
          >
            <Bot className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="hidden xs:inline">AI Historian</span>
          </button>

          {/* Start Here Tour Button */}
          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-atlas-surface border border-atlas-brass/40 text-atlas-brass font-sans font-semibold hover:bg-atlas-brass/10 transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Start Here</span>
          </button>

          {/* CMS / Auth Access Button */}
          <button
            onClick={() => navigate(isEditor ? '/admin' : '/login')}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-atlas-surface border border-atlas-border text-atlas-muted hover:text-atlas-parchment transition-colors"
          >
            {isEditor ? <ShieldCheck className="w-3.5 h-3.5 text-atlas-brass" /> : <User className="w-3.5 h-3.5" />}
            <span>{isEditor ? 'CMS' : user ? 'Account' : 'Sign In'}</span>
          </button>

          {/* Mobile Navigation Drawer Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="sm:hidden p-1.5 text-atlas-muted hover:text-atlas-parchment rounded bg-atlas-surface border border-atlas-border"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Expandable Header Bar */}
      {isMobileMenuOpen && (
        <div className="sm:hidden p-3 bg-atlas-panel border-b border-atlas-border space-y-3 z-30">
          <SearchBox />
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => {
                setIsOnboardingOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-atlas-surface border border-atlas-brass/40 text-atlas-brass text-xs font-sans font-semibold"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Start Tour</span>
            </button>

            <button
              onClick={() => {
                navigate(isEditor ? '/admin' : '/login');
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-atlas-surface border border-atlas-border text-atlas-muted text-xs font-sans"
            >
              {isEditor ? <ShieldCheck className="w-3.5 h-3.5 text-atlas-brass" /> : <User className="w-3.5 h-3.5" />}
              <span>{isEditor ? 'CMS' : user ? 'Account' : 'Sign In'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Synchronized Real World Spatial Map (MapLibre GL + OpenFreeMap) */}
      {isMapVisible && <RealWorldMap />}

      {/* Continuous Time Machine Chrono-Scrubber Wheel */}
      <TimeMachineScrubber />

      {/* Zoom Controls & Presets Toolbar */}
      <ZoomControls />

      {/* Layer Selector Bar (Horizontal Scrollable) */}
      <LayerChips eventCounts={eventCounts} />

      {/* Main Interactive Timeline Canvas */}
      <main className="flex-grow flex flex-col relative overflow-hidden">
        {isLoading ? (
          <div className="flex-grow flex items-center justify-center p-12">
            <div className="font-serif text-atlas-brass animate-pulse">
              Loading Chronological Database...
            </div>
          </div>
        ) : (
          <TimelineTrack events={events} layers={layers} />
        )}
      </main>

      {/* Non-Intrusive Bottom Active Event Dashboard Bar */}
      <ActiveEventDashboard />

      {/* Event Detail Panel & Mobile Bottom Sheet */}
      <DetailPanel />

      {/* AI Historian Modal */}
      <AIHistorianModal
        isOpen={isHistorianOpen}
        onClose={() => setIsHistorianOpen(false)}
      />

      {/* Onboarding Start Here Tour */}
      <OnboardingTour
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />
    </div>
  );
};
