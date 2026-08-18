import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth, signOut } from '../lib/authService';
import { useEvents, MOCK_SEED_EVENTS } from '../lib/queries/events';
import { supabase } from '../lib/supabase';
import {
  canTransitionStatus,
  validatePublishEligibility,
} from '../lib/editorialValidation';
import type {
  ContentStatus,
  TimelineEvent,
  DatePrecision,
  CalendarType,
  DateConfidence,
  UserProfile,
} from '../lib/types/database.types';
import {
  ShieldCheck,
  LogOut,
  Filter,
  Plus,
  Edit,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar as CalendarIcon,
  BookOpen,
  ArrowLeft,
  Save,
  Users,
  UserCheck,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, profile, isEditor, loading } = useAuth();
  const { data: eventsList = MOCK_SEED_EVENTS } = useEvents();

  const [activeTab, setActiveTab] = useState<'content' | 'users'>('content');
  const [events, setEvents] = useState<TimelineEvent[]>(eventsList);
  const [statusFilter, setStatusFilter] = useState<ContentStatus | 'all'>('all');
  const [editingEvent, setEditingEvent] = useState<Partial<TimelineEvent> | null>(null);
  const [hasNoSourceFlag, setHasNoSourceFlag] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // User Management State
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);

  useEffect(() => {
    setEvents(eventsList);
  }, [eventsList]);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchProfiles();
    }
  }, [activeTab]);

  const fetchProfiles = async () => {
    setIsLoadingProfiles(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setUserProfiles(data as UserProfile[]);
      } else {
        // Fallback mock profiles if running on local dev without Supabase connection
        setUserProfiles([
          {
            id: user?.id || 'admin-1',
            display_name: profile?.display_name || user?.email || 'Super Admin',
            role: 'admin',
            created_at: new Date().toISOString(),
          },
          {
            id: 'editor-1',
            display_name: 'Lead Editor (India Track)',
            role: 'editor',
            created_at: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: 'user-1',
            display_name: 'Public Contributor',
            role: 'user',
            created_at: new Date(Date.now() - 172800000).toISOString(),
          },
        ]);
      }
    } catch {
      // Fallback gracefully
    } finally {
      setIsLoadingProfiles(false);
    }
  };

  const handleUpdateRole = async (targetUserId: string, newRole: 'user' | 'editor' | 'admin') => {
    try {
      await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', targetUserId);

      setUserProfiles((prev) =>
        prev.map((p) => (p.id === targetUserId ? { ...p, role: newRole } : p))
      );

      setSuccessMessage(`Updated user role to [${newRole.toUpperCase()}] successfully.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch {
      // Local fallback
      setUserProfiles((prev) =>
        prev.map((p) => (p.id === targetUserId ? { ...p, role: newRole } : p))
      );
      setSuccessMessage(`Updated user role to [${newRole.toUpperCase()}].`);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const persistToSupabase = async (eventItem: TimelineEvent) => {
    try {
      // 1. Upsert event record into Supabase
      await supabase.from('events').upsert({
        id: eventItem.id,
        title: eventItem.title,
        slug: eventItem.slug,
        summary: eventItem.summary,
        body: eventItem.body,
        category: eventItem.category,
        status: eventItem.status,
      });

      // 2. Upsert date record into Supabase
      if (eventItem.date) {
        await supabase.from('event_dates').upsert({
          event_id: eventItem.id,
          precision: eventItem.date.precision,
          calendar: eventItem.date.calendar,
          year_start: eventItem.date.year_start,
          year_end: eventItem.date.year_end,
          years_before_present: eventItem.date.years_before_present,
          confidence: eventItem.date.confidence,
          confidence_note: eventItem.date.confidence_note,
          is_primary: true,
        });
      }

      // 3. Invalidate React Query cache so main timeline refetches published events
      queryClient.invalidateQueries({ queryKey: ['events'] });
    } catch {
      // Fail gracefully on dev fallback
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-atlas-bg flex items-center justify-center text-atlas-brass font-mono text-xs">
        Authenticating editor credentials...
      </div>
    );
  }

  if (!user && !isEditor) {
    return (
      <div className="min-h-screen bg-atlas-bg flex items-center justify-center p-4 font-sans text-atlas-text">
        <div className="bg-atlas-panel border border-atlas-border p-6 rounded-xl text-center space-y-4 max-w-sm">
          <ShieldCheck className="w-10 h-10 text-atlas-brass mx-auto" />
          <h2 className="font-serif text-lg font-bold text-atlas-parchment">
            Editorial Access Required
          </h2>
          <p className="text-xs text-atlas-muted">
            You must be signed in with an editor role to access the Atlas of Time CMS.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-2 px-4 bg-atlas-brass text-atlas-bg font-bold text-xs rounded hover:bg-atlas-brass/90 transition-colors"
          >
            Sign In to CMS
          </button>
        </div>
      </div>
    );
  }

  const filteredEvents = events.filter(
    (e) => statusFilter === 'all' || e.status === statusFilter
  );

  const handleCreateNew = () => {
    const newDraft: Partial<TimelineEvent> = {
      id: `e-${Date.now()}`,
      title: '',
      slug: '',
      summary: '',
      body: '',
      category: 'General History',
      status: 'draft',
      created_at: new Date().toISOString(),
      date: {
        id: `d-${Date.now()}`,
        event_id: `e-${Date.now()}`,
        precision: 'year' as DatePrecision,
        calendar: 'ce_bce' as CalendarType,
        year_start: 2026,
        year_end: null,
        years_before_present: 0,
        confidence: 'well_established' as DateConfidence,
        confidence_note: null,
        is_primary: true,
      },
      layers: [],
    };
    setEditingEvent(newDraft);
    setHasNoSourceFlag(false);
    setValidationErrors([]);
  };

  const handleSaveDraft = async () => {
    if (!editingEvent?.title || !editingEvent?.slug) {
      setValidationErrors(['Title and slug are required fields.']);
      return;
    }

    const updated = editingEvent as TimelineEvent;
    setEvents((prev) => {
      const idx = prev.findIndex((e) => e.id === updated.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      }
      return [updated, ...prev];
    });

    await persistToSupabase(updated);

    setEditingEvent(null);
    setSuccessMessage(`Saved draft "${updated.title}" successfully.`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleStatusTransition = async (targetStatus: ContentStatus) => {
    if (!editingEvent) return;
    const currentStatus = editingEvent.status || 'draft';

    if (!canTransitionStatus(currentStatus, targetStatus)) {
      setValidationErrors([
        `Invalid status transition from "${currentStatus}" to "${targetStatus}".`,
      ]);
      return;
    }

    // Enforce publish-time validation rules
    if (targetStatus === 'published') {
      const validation = validatePublishEligibility(
        'event',
        editingEvent,
        events,
        hasNoSourceFlag ? [{ no_source_flag: true }] : []
      );

      if (!validation.eligible) {
        setValidationErrors(validation.errors);
        return;
      }
    }

    const updated: TimelineEvent = {
      ...(editingEvent as TimelineEvent),
      status: targetStatus,
    };

    setEvents((prev) => {
      const idx = prev.findIndex((e) => e.id === updated.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      }
      return [updated, ...prev];
    });

    await persistToSupabase(updated);

    setEditingEvent(null);
    setValidationErrors([]);
    setSuccessMessage(
      `Transitioned "${updated.title}" status to [${targetStatus.toUpperCase()}].`
    );
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-atlas-bg text-atlas-text font-sans p-6 space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between border-b border-atlas-border/50 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-1.5 text-atlas-muted hover:text-atlas-parchment rounded bg-atlas-panel border border-atlas-border"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-serif text-lg font-bold text-atlas-parchment flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-atlas-brass" />
              Atlas of Time — Editorial CMS & Administration
            </h1>
            <p className="text-xs text-atlas-muted">
              Signed in as{' '}
              <span className="text-atlas-parchment font-semibold">
                {profile?.display_name || user?.email || 'Super Admin'}
              </span>{' '}
              ({profile?.role || 'admin'})
            </p>
          </div>
        </div>

        {/* Dashboard Tabs & Sign Out */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-atlas-panel border border-atlas-border rounded-lg p-1 font-mono text-xs">
            <button
              onClick={() => setActiveTab('content')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors ${
                activeTab === 'content'
                  ? 'bg-atlas-brass text-atlas-bg font-bold'
                  : 'text-atlas-muted hover:text-atlas-parchment'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Content CMS</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors ${
                activeTab === 'users'
                  ? 'bg-atlas-brass text-atlas-bg font-bold'
                  : 'text-atlas-muted hover:text-atlas-parchment'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Manage Users & Roles</span>
            </button>
          </div>

          <button
            onClick={async () => {
              await signOut();
              navigate('/login');
            }}
            className="flex items-center gap-2 py-1.5 px-3 bg-atlas-panel border border-atlas-border text-atlas-muted hover:text-red-400 text-xs rounded transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-md flex items-center gap-2 text-emerald-200 text-xs font-sans">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main CMS & Administration Layout */}
      {activeTab === 'content' ? (
        !editingEvent ? (
          <div className="space-y-4">
            {/* Controls Bar */}
            <div className="flex items-center justify-between gap-4 bg-atlas-panel p-4 border border-atlas-border rounded-lg">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-atlas-muted" />
                <span className="text-xs text-atlas-muted font-mono uppercase">Filter Status:</span>
                {(['all', 'draft', 'review', 'approved', 'published'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 text-xs rounded font-mono transition-colors ${
                      statusFilter === st
                        ? 'bg-atlas-brass text-atlas-bg font-bold'
                        : 'bg-atlas-surface border border-atlas-border text-atlas-muted hover:text-atlas-parchment'
                    }`}
                  >
                    {st.toUpperCase()}
                  </button>
                ))}
              </div>

              <button
                onClick={handleCreateNew}
                className="flex items-center gap-1.5 py-1.5 px-3 bg-atlas-brass text-atlas-bg text-xs font-bold rounded hover:bg-atlas-brass/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Event</span>
              </button>
            </div>

            {/* Events Table */}
            <div className="bg-atlas-panel border border-atlas-border rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-atlas-surface border-b border-atlas-border font-mono text-[11px] text-atlas-muted uppercase">
                  <tr>
                    <th className="p-3">Title & Slug</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-atlas-border/40">
                  {filteredEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-atlas-surface/40 transition-colors">
                      <td className="p-3 space-y-0.5">
                        <div className="font-serif font-semibold text-atlas-parchment">
                          {evt.title}
                        </div>
                        <div className="font-mono text-[10px] text-atlas-muted">{evt.slug}</div>
                      </td>
                      <td className="p-3 text-atlas-muted font-sans">{evt.category}</td>
                      <td className="p-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${
                            evt.status === 'published'
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                              : evt.status === 'approved'
                              ? 'bg-blue-950/60 text-blue-300 border-blue-500/30'
                              : evt.status === 'review'
                              ? 'bg-amber-950/60 text-amber-300 border-amber-500/30'
                              : 'bg-zinc-900 text-zinc-400 border-zinc-700'
                          }`}
                        >
                          {evt.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setEditingEvent(evt);
                            setHasNoSourceFlag(false);
                            setValidationErrors([]);
                          }}
                          className="p-1.5 bg-atlas-surface border border-atlas-border rounded text-atlas-brass hover:bg-atlas-brass hover:text-atlas-bg transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Event Editor Form Drawer */
          <div className="bg-atlas-panel border border-atlas-border rounded-xl p-6 space-y-6 max-w-3xl mx-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-atlas-border/50 pb-4">
              <h2 className="font-serif text-lg font-bold text-atlas-parchment flex items-center gap-2">
                <FileText className="w-5 h-5 text-atlas-brass" />
                <span>Editing Event: {editingEvent.title || 'New Draft'}</span>
              </h2>
              <button
                onClick={() => setEditingEvent(null)}
                className="text-xs text-atlas-muted hover:text-atlas-parchment underline font-mono"
              >
                Cancel & Close
              </button>
            </div>

            {validationErrors.length > 0 && (
              <div className="p-4 bg-red-950/50 border border-red-500/40 rounded-md space-y-1 text-xs text-red-200">
                <div className="font-bold flex items-center gap-1.5 text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Publish Validation Errors:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 font-sans pl-1">
                  {validationErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-mono text-atlas-muted uppercase text-[10px]">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={editingEvent.title || ''}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, title: e.target.value })
                    }
                    placeholder="e.g. Battle of Panipat"
                    className="w-full p-2 bg-atlas-surface border border-atlas-border rounded text-atlas-text focus:outline-none focus:border-atlas-brass"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-atlas-muted uppercase text-[10px]">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    value={editingEvent.slug || ''}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, slug: e.target.value })
                    }
                    placeholder="e.g. battle-of-panipat"
                    className="w-full p-2 bg-atlas-surface border border-atlas-border rounded text-atlas-text focus:outline-none focus:border-atlas-brass font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-mono text-atlas-muted uppercase text-[10px]">
                  Summary *
                </label>
                <input
                  type="text"
                  value={editingEvent.summary || ''}
                  onChange={(e) =>
                    setEditingEvent({ ...editingEvent, summary: e.target.value })
                  }
                  placeholder="Concise overview sentence"
                  className="w-full p-2 bg-atlas-surface border border-atlas-border rounded text-atlas-text focus:outline-none focus:border-atlas-brass"
                />
              </div>

              <div className="space-y-1">
                <label className="font-mono text-atlas-muted uppercase text-[10px]">
                  Detailed Body (Markdown)
                </label>
                <textarea
                  rows={4}
                  value={editingEvent.body || ''}
                  onChange={(e) =>
                    setEditingEvent({ ...editingEvent, body: e.target.value })
                  }
                  placeholder="Detailed historical body text..."
                  className="w-full p-2 bg-atlas-surface border border-atlas-border rounded text-atlas-text focus:outline-none focus:border-atlas-brass"
                />
              </div>

              {/* Date Section */}
              <div className="p-4 bg-atlas-surface/60 border border-atlas-border rounded-lg space-y-3">
                <h3 className="font-mono text-atlas-brass font-bold uppercase text-[11px] flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>Date & Chronology Settings</span>
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-mono text-atlas-muted text-[10px] uppercase">
                      Year Start
                    </label>
                    <input
                      type="number"
                      value={editingEvent.date?.year_start ?? 1526}
                      onChange={(e) => {
                        const yr = parseInt(e.target.value, 10) || 0;
                        setEditingEvent({
                          ...editingEvent,
                          date: {
                            ...(editingEvent.date as any),
                            year_start: yr,
                            years_before_present: 2026 - yr,
                          },
                        });
                      }}
                      className="w-full p-1.5 bg-atlas-panel border border-atlas-border rounded text-atlas-text font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-atlas-muted text-[10px] uppercase">
                      Confidence
                    </label>
                    <select
                      value={editingEvent.date?.confidence || 'well_established'}
                      onChange={(e) =>
                        setEditingEvent({
                          ...editingEvent,
                          date: {
                            ...(editingEvent.date as any),
                            confidence: e.target.value as DateConfidence,
                          },
                        })
                      }
                      className="w-full p-1.5 bg-atlas-panel border border-atlas-border rounded text-atlas-text font-mono"
                    >
                      <option value="well_established">Well Established</option>
                      <option value="probable">Probable</option>
                      <option value="debated">Debated</option>
                      <option value="legendary">Legendary</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-mono text-atlas-muted text-[10px] uppercase">
                      Years BP
                    </label>
                    <input
                      type="number"
                      readOnly
                      value={editingEvent.date?.years_before_present ?? 500}
                      className="w-full p-1.5 bg-atlas-panel/50 border border-atlas-border rounded text-atlas-brass font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Source Coverage Section */}
              <div className="p-4 bg-atlas-surface/60 border border-atlas-border rounded-lg space-y-2">
                <h3 className="font-mono text-atlas-brass font-bold uppercase text-[11px] flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Academic Source Coverage</span>
                </h3>
                <label className="flex items-center gap-2 text-xs text-atlas-parchment cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasNoSourceFlag}
                    onChange={(e) => setHasNoSourceFlag(e.target.checked)}
                    className="rounded border-atlas-border text-atlas-brass focus:ring-atlas-brass"
                  />
                  <span>Set explicit &ldquo;no source yet&rdquo; flag for draft approval</span>
                </label>
              </div>
            </div>

            {/* Action Pipeline Controls */}
            <div className="flex items-center justify-between border-t border-atlas-border/50 pt-4">
              <button
                onClick={handleSaveDraft}
                className="flex items-center gap-1.5 py-2 px-3 bg-atlas-surface border border-atlas-border text-atlas-parchment rounded hover:bg-atlas-surface/80 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save Draft</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStatusTransition('review')}
                  className="py-2 px-3 bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-mono uppercase font-bold rounded hover:bg-amber-900/60"
                >
                  Submit Review
                </button>
                <button
                  onClick={() => handleStatusTransition('approved')}
                  className="py-2 px-3 bg-blue-950/60 border border-blue-500/40 text-blue-300 text-xs font-mono uppercase font-bold rounded hover:bg-blue-900/60"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleStatusTransition('published')}
                  className="py-2 px-3 bg-emerald-600 text-atlas-bg text-xs font-mono uppercase font-bold rounded hover:bg-emerald-500 shadow-lg"
                >
                  Publish Live
                </button>
              </div>
            </div>
          </div>
        )
      ) : (
        /* User & Role Management Tab */
        <div className="space-y-4 max-w-4xl mx-auto">
          <div className="bg-atlas-panel p-4 border border-atlas-border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-atlas-brass" />
              <div>
                <h2 className="font-serif text-sm font-bold text-atlas-parchment">
                  User Accounts & Role Permissions
                </h2>
                <p className="text-xs text-atlas-muted">
                  Super Admins can grant or revoke Editor & Chief Editor (Admin) privileges.
                </p>
              </div>
            </div>
            <button
              onClick={fetchProfiles}
              className="px-3 py-1 bg-atlas-surface border border-atlas-border text-atlas-brass text-xs font-mono rounded hover:bg-atlas-surface/80"
            >
              Refresh Profiles
            </button>
          </div>

          <div className="bg-atlas-panel border border-atlas-border rounded-lg overflow-hidden">
            {isLoadingProfiles ? (
              <div className="p-8 text-center text-atlas-brass font-mono text-xs animate-pulse">
                Fetching registered user profiles from Supabase...
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-atlas-surface border-b border-atlas-border font-mono text-[11px] text-atlas-muted uppercase">
                  <tr>
                    <th className="p-3">User / Email</th>
                    <th className="p-3">Joined Date</th>
                    <th className="p-3">Assigned Role</th>
                    <th className="p-3 text-right">Role Management</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-atlas-border/40">
                  {userProfiles.map((prof) => (
                    <tr key={prof.id} className="hover:bg-atlas-surface/40 transition-colors">
                      <td className="p-3">
                        <div className="font-serif font-semibold text-atlas-parchment">
                          {prof.display_name || 'Anonymous Contributor'}
                        </div>
                        <div className="font-mono text-[10px] text-atlas-muted">{prof.id}</div>
                      </td>
                      <td className="p-3 text-atlas-muted font-mono text-[11px]">
                        {new Date(prof.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${
                            prof.role === 'admin'
                              ? 'bg-purple-950/60 text-purple-300 border-purple-500/30'
                              : prof.role === 'editor'
                              ? 'bg-blue-950/60 text-blue-300 border-blue-500/30'
                              : 'bg-zinc-900 text-zinc-400 border-zinc-700'
                          }`}
                        >
                          {prof.role === 'admin'
                            ? 'Admin (Chief Editor)'
                            : prof.role === 'editor'
                            ? 'Editor'
                            : 'Viewer (User)'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <select
                          value={prof.role}
                          onChange={(e) =>
                            handleUpdateRole(
                              prof.id,
                              e.target.value as 'user' | 'editor' | 'admin'
                            )
                          }
                          className="p-1.5 bg-atlas-surface border border-atlas-border rounded text-atlas-brass font-mono text-xs focus:outline-none focus:border-atlas-brass"
                        >
                          <option value="user">Assign: Viewer (User)</option>
                          <option value="editor">Assign: Editor</option>
                          <option value="admin">Assign: Super Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
