import React, { useState, useEffect, useCallback } from 'react';
import {
  LogIn, LogOut, FileText, Eye, EyeOff, Trash2,
  RefreshCw, Search, ChevronDown, CheckSquare, Square,
  AlertCircle, Clock, Globe, Lock, ExternalLink, X,
  ShieldCheck, Filter, BarChart3
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ── Visibility badge config ──────────────────────────────────────────
const VIS = {
  pending: {
    label: 'Pending Review',
    icon: Clock,
    classes: 'bg-amber-100 text-amber-800 border border-amber-200',
    dot: 'bg-amber-400',
  },
  public: {
    label: 'Public',
    icon: Globe,
    classes: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    dot: 'bg-emerald-400',
  },
  private: {
    label: 'Private',
    icon: Lock,
    classes: 'bg-slate-100 text-slate-700 border border-slate-200',
    dot: 'bg-slate-400',
  },
};

// ── Stat card ────────────────────────────────────────────────────────
function StatCard({ label, value, status, loading }) {
  const cfg = VIS[status] || {};
  const Icon = cfg.icon || FileText;
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
        status === 'pending' ? 'bg-amber-50' :
        status === 'public'  ? 'bg-emerald-50' :
        status === 'private' ? 'bg-slate-100' : 'bg-purple-50'
      }`}>
        <Icon className={`w-5 h-5 ${
          status === 'pending' ? 'text-amber-500' :
          status === 'public'  ? 'text-emerald-500' :
          status === 'private' ? 'text-slate-500' : 'text-purple-500'
        }`} />
      </div>
      <div>
        <p className="text-2xl font-bold font-mono text-slate-800 leading-none">
          {loading ? '—' : value}
        </p>
        <p className="text-xs text-slate-500 mt-0.5 font-medium tracking-wide uppercase">{label}</p>
      </div>
    </div>
  );
}

// ── Visibility badge ─────────────────────────────────────────────────
function VisBadge({ status }) {
  const cfg = VIS[status] || VIS.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ── Visibility dropdown ──────────────────────────────────────────────
function VisDropdown({ currentValue, docId, onUpdate, disabled }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSelect = async (v) => {
    if (v === currentValue) { setOpen(false); return; }
    setLoading(true);
    setOpen(false);
    try {
      const res = await fetch(`${API}/api/admin/documents/${docId}/visibility`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibility: v }),
      });
      if (!res.ok) throw new Error();
      onUpdate(docId, v);
    } catch {
      alert('Failed to update visibility');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        disabled={disabled || loading}
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 bg-white border border-slate-200 hover:border-purple-300 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors shadow-sm disabled:opacity-50"
      >
        {loading ? (
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-500" />
        ) : (
          <span className={`w-2 h-2 rounded-full ${VIS[currentValue]?.dot || 'bg-slate-400'}`} />
        )}
        {VIS[currentValue]?.label || currentValue}
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden w-44">
            {Object.entries(VIS).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => handleSelect(key)}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors ${
                  key === currentValue ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-slate-700'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                {cfg.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Document detail drawer ───────────────────────────────────────────
function DocDrawer({ doc, onClose, onUpdate, onDelete }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const loadPreview = async () => {
    setPreviewLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/documents/${doc.id}/preview`, { credentials: 'include' });
      const data = await res.json();
      setPreviewUrl(data.signedUrl);
    } catch {
      alert('Could not load preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Permanently delete "${doc.doc_title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${API}/api/admin/documents/${doc.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error();
      onDelete(doc.id);
      onClose();
    } catch {
      alert('Delete failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-lg bg-white shadow-2xl flex flex-col animate-slide-in overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100">
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1">Document #{doc.id}</p>
            <h2 className="text-lg font-bold text-slate-800 leading-tight">{doc.doc_title}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Visibility</span>
            <VisDropdown currentValue={doc.visibility} docId={doc.id} onUpdate={onUpdate} />
          </div>

          {/* Submitter */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Submitter</p>
            <p className="text-sm font-semibold text-slate-800">{doc.your_name}</p>
            <p className="text-sm text-slate-600">{doc.your_email}</p>
          </div>

          {/* Peer reviewer */}
          {doc.peer_reviewer_name && (
            <div className="bg-slate-50 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Peer Reviewer</p>
              <p className="text-sm font-semibold text-slate-800">{doc.peer_reviewer_name}</p>
              <p className="text-sm text-slate-600">{doc.peer_reviewer_email}</p>
            </div>
          )}

          {/* Source */}
          {doc.source && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Source</p>
              <p className="text-sm text-slate-700 break-all">{doc.source}</p>
            </div>
          )}

          {/* Abstracts */}
          {doc.final_abstract && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Abstract</p>
              <p className="text-sm text-slate-700 leading-relaxed">{doc.final_abstract}</p>
            </div>
          )}

          {/* Tags */}
          {doc.content_tags?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {doc.content_tags.map(tag => (
                  <span key={tag} className="bg-purple-50 text-purple-700 border border-purple-100 text-xs font-medium px-2.5 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="text-xs text-slate-400 space-y-1 pt-2 border-t border-slate-100">
            <p>Submitted: {new Date(doc.created_at).toLocaleString()}</p>
            {doc.reviewed_at && (
              <p>Reviewed: {new Date(doc.reviewed_at).toLocaleString()} by {doc.reviewed_by}</p>
            )}
          </div>

          {/* File preview */}
          {doc.s3_file_url && (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              {previewUrl ? (
                <iframe src={previewUrl} className="w-full h-72" title="Document preview" />
              ) : (
                <button
                  onClick={loadPreview}
                  disabled={previewLoading}
                  className="w-full flex items-center justify-center gap-2 py-6 text-sm font-medium text-purple-600 hover:bg-purple-50 transition-colors"
                >
                  {previewLoading
                    ? <><RefreshCw className="w-4 h-4 animate-spin" /> Loading...</>
                    : <><Eye className="w-4 h-4" /> Preview Document</>
                  }
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-6 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => { onUpdate(doc.id, 'private'); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <EyeOff className="w-4 h-4" />
              Make Private
            </button>
            <button
              onClick={() => { onUpdate(doc.id, 'public'); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 transition-colors"
            >
              <Globe className="w-4 h-4" />
              Publish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Login screen ─────────────────────────────────────────────────────
function LoginScreen({ error }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-200">
        <ShieldCheck className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>
        Admin Portal
      </h1>
      <p className="text-slate-500 mb-8 max-w-xs text-sm leading-relaxed">
        Sign in with your whitelisted Google account to access the document management dashboard.
      </p>

      {error === 'unauthorized' && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          Your email is not authorized to access this portal.
        </div>
      )}

      <a
        href={`${API}/api/admin/auth/google`}
        className="inline-flex items-center gap-3 bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-300 transition-all rounded-xl px-6 py-3 text-sm font-semibold text-slate-700"
      >
        {/* Google G icon */}
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Sign in with Google
      </a>

      <p className="mt-6 text-xs text-slate-400">
        Access is restricted to whitelisted accounts only.
      </p>
    </div>
  );
}

// ── Main AdminPortal component ───────────────────────────────────────
const AdminPortal = () => {
  const [admin, setAdmin] = useState(null);          // { email, name } | null
  const [authLoading, setAuthLoading] = useState(true);
  const [docs, setDocs] = useState([]);
  const [stats, setStats] = useState(null);
  const [docsLoading, setDocsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterVis, setFilterVis] = useState('all');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [activeDoc, setActiveDoc] = useState(null);
  const [total, setTotal] = useState(0);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Check error param from OAuth redirect
  const urlError = new URLSearchParams(window.location.search).get('error');

  // ── Auth check on mount ────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API}/api/admin/auth/me`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        setAdmin(data);
        setAuthLoading(false);
      })
      .catch(() => setAuthLoading(false));
  }, []);

  // ── Load docs + stats when authenticated ──────────────────────────
  const loadDocs = useCallback(async () => {
    setDocsLoading(true);
    try {
      const params = new URLSearchParams({ limit: 100, offset: 0 });
      if (filterVis !== 'all') params.set('visibility', filterVis);
      if (search) params.set('search', search);

      const [docsRes, statsRes] = await Promise.all([
        fetch(`${API}/api/admin/documents?${params}`, { credentials: 'include' }),
        fetch(`${API}/api/admin/documents/stats`, { credentials: 'include' }),
      ]);

      if (!docsRes.ok || !statsRes.ok) throw new Error();
      const docsData = await docsRes.json();
      const statsData = await statsRes.json();

      setDocs(docsData.documents);
      setTotal(docsData.total);
      setStats(statsData);
    } catch {
      console.error('Failed to load documents');
    } finally {
      setDocsLoading(false);
    }
  }, [filterVis, search]);

  useEffect(() => {
    if (admin) loadDocs();
  }, [admin, loadDocs]);

  // ── Debounce search ────────────────────────────────────────────────
  useEffect(() => {
    if (!admin) return;
    const t = setTimeout(loadDocs, 300);
    return () => clearTimeout(t);
  }, [search]);

  // ── Handlers ──────────────────────────────────────────────────────
  const handleLogout = async () => {
    await fetch(`${API}/api/admin/auth/logout`, { method: 'POST', credentials: 'include' });
    setAdmin(null);
  };

  const handleVisUpdate = (id, visibility) => {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, visibility } : d));
    // Refresh stats silently
    fetch(`${API}/api/admin/documents/stats`, { credentials: 'include' })
      .then(r => r.json()).then(setStats).catch(() => {});
    if (activeDoc?.id === id) setActiveDoc(prev => ({ ...prev, visibility }));
  };

  const handleDelete = (id) => {
    setDocs(prev => prev.filter(d => d.id !== id));
    setSelectedIds(prev => { const s = new Set(prev); s.delete(id); return s; });
    loadDocs(); // refresh stats
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds(prev =>
      prev.size === docs.length ? new Set() : new Set(docs.map(d => d.id))
    );
  };

  const handleBulkVisibility = async (visibility) => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/documents/bulk-visibility`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds), visibility }),
      });
      if (!res.ok) throw new Error();
      setDocs(prev => prev.map(d => selectedIds.has(d.id) ? { ...d, visibility } : d));
      setSelectedIds(new Set());
      // Refresh stats
      fetch(`${API}/api/admin/documents/stats`, { credentials: 'include' })
        .then(r => r.json()).then(setStats).catch(() => {});
    } catch {
      alert('Bulk update failed');
    } finally {
      setBulkLoading(false);
    }
  };

  // ── Render: loading ────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-purple-500" />
      </div>
    );
  }

  // ── Render: login ──────────────────────────────────────────────────
  if (!admin) return <LoginScreen error={urlError} />;

  // ── Render: dashboard ─────────────────────────────────────────────
  return (
    <div className="space-y-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Load fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&family=DM+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />

      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Document Queue
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Signed in as <span className="font-medium text-purple-600">{admin.email}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadDocs}
            className="p-2.5 rounded-xl border border-slate-200 hover:border-purple-300 text-slate-500 hover:text-purple-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${docsLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-red-200 hover:bg-red-50 text-sm font-medium text-slate-600 hover:text-red-600 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total" value={stats?.total} status="total" loading={!stats} />
        <StatCard label="Pending" value={stats?.pending} status="pending" loading={!stats} />
        <StatCard label="Public" value={stats?.public} status="public" loading={!stats} />
        <StatCard label="Private" value={stats?.private} status="private" loading={!stats} />
      </div>

      {/* Controls bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, submitter, email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent shadow-sm"
          />
        </div>

        {/* Filter by visibility */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 shadow-sm">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            value={filterVis}
            onChange={e => setFilterVis(e.target.value)}
            className="bg-transparent text-sm text-slate-700 py-2.5 pr-2 focus:outline-none cursor-pointer font-medium"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>
      </div>

      {/* Bulk action bar — appears when rows are selected */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 animate-fade-in">
          <span className="text-sm font-semibold text-purple-700">
            {selectedIds.size} selected
          </span>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => handleBulkVisibility('public')}
              disabled={bulkLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              <Globe className="w-3.5 h-3.5" />
              Publish all
            </button>
            <button
              onClick={() => handleBulkVisibility('private')}
              disabled={bulkLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-600 text-white hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              <EyeOff className="w-3.5 h-3.5" />
              Make private
            </button>
            <button
              onClick={() => handleBulkVisibility('pending')}
              disabled={bulkLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors disabled:opacity-50"
            >
              <Clock className="w-3.5 h-3.5" />
              Reset to pending
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="p-1.5 rounded-lg hover:bg-purple-100 text-purple-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Document table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {docsLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
            <p className="text-sm text-slate-500">Loading documents…</p>
          </div>
        ) : docs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <FileText className="w-10 h-10" />
            <p className="text-sm font-medium">No documents found</p>
            {(search || filterVis !== 'all') && (
              <button
                onClick={() => { setSearch(''); setFilterVis('all'); }}
                className="text-xs text-purple-500 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="grid grid-cols-[40px_1fr_140px_160px_120px] gap-4 px-4 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <div className="flex items-center justify-center">
                <button onClick={toggleSelectAll}>
                  {selectedIds.size === docs.length && docs.length > 0
                    ? <CheckSquare className="w-4 h-4 text-purple-600" />
                    : <Square className="w-4 h-4 text-slate-400" />
                  }
                </button>
              </div>
              <div>Document</div>
              <div>Status</div>
              <div>Submitted</div>
              <div className="text-right">Actions</div>
            </div>

            {/* Table rows */}
            <div className="divide-y divide-slate-50">
              {docs.map(doc => (
                <div
                  key={doc.id}
                  className={`grid grid-cols-[40px_1fr_140px_160px_120px] gap-4 px-4 py-3.5 items-center hover:bg-slate-50/70 transition-colors group ${
                    selectedIds.has(doc.id) ? 'bg-purple-50/40' : ''
                  }`}
                >
                  {/* Checkbox */}
                  <div className="flex items-center justify-center">
                    <button onClick={() => toggleSelect(doc.id)}>
                      {selectedIds.has(doc.id)
                        ? <CheckSquare className="w-4 h-4 text-purple-600" />
                        : <Square className="w-4 h-4 text-slate-300 group-hover:text-slate-400" />
                      }
                    </button>
                  </div>

                  {/* Title + submitter */}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate leading-tight">{doc.doc_title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{doc.your_name} · {doc.your_email}</p>
                    {doc.content_tags?.slice(0, 2).map(t => (
                      <span key={t} className="inline-block bg-slate-100 text-slate-500 text-xs px-1.5 py-0.5 rounded mr-1 mt-1">{t}</span>
                    ))}
                    {doc.content_tags?.length > 2 && (
                      <span className="text-xs text-slate-400">+{doc.content_tags.length - 2}</span>
                    )}
                  </div>

                  {/* Visibility badge */}
                  <div>
                    <VisBadge status={doc.visibility} />
                  </div>

                  {/* Date */}
                  <div className="text-xs text-slate-500 font-mono">
                    {new Date(doc.created_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                    <br />
                    {new Date(doc.created_at).toLocaleTimeString('en-US', {
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </div>

                  {/* Quick actions */}
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => setActiveDoc(doc)}
                      className="p-2 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <VisDropdown
                      currentValue={doc.visibility}
                      docId={doc.id}
                      onUpdate={handleVisUpdate}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
              <span>Showing {docs.length} of {total} documents</span>
              {total > 100 && (
                <span className="text-amber-600 font-medium">Load more not yet implemented — increase limit param</span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Detail drawer */}
      {activeDoc && (
        <DocDrawer
          doc={activeDoc}
          onClose={() => setActiveDoc(null)}
          onUpdate={(id, vis) => { handleVisUpdate(id, vis); setActiveDoc(prev => ({ ...prev, visibility: vis })); }}
          onDelete={handleDelete}
        />
      )}

      {/* Inline styles for animations */}
      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in { animation: slide-in 0.25s cubic-bezier(.4,0,.2,1); }
        .animate-fade-in  { animation: fade-in  0.2s ease; }
      `}</style>
    </div>
  );
};

export default AdminPortal;