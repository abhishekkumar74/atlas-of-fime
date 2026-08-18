import React, { useState, useEffect } from 'react';
import { useTimelineStore } from '../../lib/store/useTimelineStore';
import { Compass, X, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

interface TourStep {
  title: string;
  era: string;
  eventId: string;
  description: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: '1. Cosmic & Deep Time',
    era: '~13.8 Billion Years Ago',
    eventId: 'e0000001-0000-0000-0000-000000000001',
    description: 'The Big Bang marks the origin of space, time, and matter on our logarithmic chronological spine.',
  },
  {
    title: '2. Emergence of Life',
    era: '~3.7 Billion Years Ago',
    eventId: 'e0000003-0000-0000-0000-000000000003',
    description: 'Earliest bacterial life forms emerge in Earth primordial oceans.',
  },
  {
    title: '3. Agricultural Revolution',
    era: '~12,000 Years Ago',
    eventId: 'e0000007-0000-0000-0000-000000000007',
    description: 'Transition from hunter-gatherer bands to settled cereal farming transforms human society.',
  },
  {
    title: '4. First Cities & Indus Valley',
    era: '~3300 BCE',
    eventId: 'e0000009-0000-0000-0000-000000000009',
    description: 'Urban planning, standardized weights, and sanitation networks flourish in Harappa and Mohenjo-daro.',
  },
  {
    title: '5. Ashoka & Non-Violence',
    era: '~268 BCE',
    eventId: 'e0000016-0000-0000-0000-000000000016',
    description: 'Emperor Ashoka engraves edicts of non-violence and ethical governance across stone pillars.',
  },
  {
    title: '6. Classical Renaissance',
    era: '1350 CE',
    eventId: 'e0000050-0000-0000-0000-000000000050',
    description: 'Rebirth of art, humanism, and empirical science sweeps across Italian city-states.',
  },
  {
    title: '7. Indo-Persian Mughal Era',
    era: '1526 CE',
    eventId: 'e0000024-0000-0000-0000-000000000024',
    description: 'Babur defeats the Sultanate at Panipat, establishing the Mughal synthesis of architecture and statecraft.',
  },
  {
    title: '8. Modern Independent Nations',
    era: '1947 CE',
    eventId: 'e0000027-0000-0000-0000-000000000027',
    description: 'India achieves democratic independence, marking the rise of modern post-colonial nations.',
  },
];

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ isOpen, onClose }) => {
  const { openPanel } = useTimelineStore();
  const [currentStep, setCurrentStep] = useState(0);

  const step = TOUR_STEPS[currentStep];

  useEffect(() => {
    if (isOpen && step) {
      openPanel(step.eventId);
    }
  }, [isOpen, currentStep, step, openPanel]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('atlas_seen_onboarding', 'true');
    onClose();
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 w-full max-w-sm bg-atlas-panel border border-atlas-brass/50 rounded-xl p-5 shadow-2xl space-y-3 font-sans text-atlas-text">
      <div className="flex items-center justify-between border-b border-atlas-border/50 pb-2">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-atlas-brass" />
          <span className="font-serif text-xs font-bold text-atlas-parchment">
            Start Here Tour
          </span>
          <span className="font-mono text-[10px] text-atlas-brass bg-atlas-brass/20 px-1.5 py-0.5 rounded">
            {currentStep + 1} / {TOUR_STEPS.length}
          </span>
        </div>

        <button
          onClick={handleComplete}
          className="p-1 text-atlas-muted hover:text-atlas-parchment rounded"
          title="Skip tour"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-1">
        <div className="font-mono text-[10px] text-atlas-brass uppercase tracking-wide">
          {step.era}
        </div>
        <h3 className="font-serif text-sm font-bold text-atlas-parchment">{step.title}</h3>
        <p className="text-xs text-atlas-muted leading-relaxed">{step.description}</p>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="px-2.5 py-1 text-xs bg-atlas-surface border border-atlas-border rounded text-atlas-muted hover:text-atlas-parchment disabled:opacity-30 flex items-center gap-1"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Back</span>
        </button>

        <button
          onClick={handleComplete}
          className="text-xs text-atlas-subtle hover:text-atlas-muted underline font-mono"
        >
          Skip Tour
        </button>

        <button
          onClick={handleNext}
          className="px-3 py-1 text-xs bg-atlas-brass text-atlas-bg font-bold rounded hover:bg-atlas-brass/90 flex items-center gap-1"
        >
          <span>{currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}</span>
          {currentStep === TOUR_STEPS.length - 1 ? (
            <CheckCircle className="w-3 h-3" />
          ) : (
            <ArrowRight className="w-3 h-3" />
          )}
        </button>
      </div>
    </div>
  );
};
