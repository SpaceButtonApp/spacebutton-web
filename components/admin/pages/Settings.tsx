'use client'
import React, { useRef, useState, useEffect, useCallback } from "react";
import { User, Shield, Bell, Camera, Save, Lock, Eye, EyeOff, UserPlus, Headset, Trash2, RotateCcw, AlertCircle, CheckCircle2, KeyRound } from "lucide-react";
import { useAdminStore, ADMIN_STORAGE_KEY } from "@/lib/admin-store";
import { adminApi } from "@/lib/api/admin";
import { Avatar } from "@/components/admin/shared/Atoms";
import { ConfirmModal } from "@/components/admin/shared/Modal";
import { formatDate } from "@/lib/utils/admin-format";
import type { SupportAgent } from "@/lib/types/admin";

type Tab = "profile" | "security" | "support" | "notifications";

const NOTIF_PREFS_DEFAULT = [
  { key: "new_user", label: "New User Registrations", desc: "Get notified when a new user signs up", on: true },
  { key: "new_listing", label: "New Listings", desc: "Get notified when a new listing is posted", on: true },
  { key: "transactions", label: "Transactions", desc: "Get notified about payment transactions", on: true },
  { key: "new_reviews", label: "New Reviews", desc: "Get notified when users leave reviews", on: false },
  { key: "system_alerts", label: "System Alerts", desc: "Important system notifications and alerts", on: true },
];

export function SettingsPage({ onLogoutClick }: { onLogoutClick: () => void }) {
  const [tab, setTab] = useState<Tab>("profile");

  return (
    <div className="p-8 max-w-3xl">
      <div className="inline-flex bg-[var(--bg-raised)] border border-[var(--border-color)] rounded-xl p-1 mb-6 flex-wrap">
        <TabButton icon={User} label="Profile" active={tab === "profile"} onClick={() => setTab("profile")} />
        <TabButton icon={Shield} label="Security" active={tab === "security"} onClick={() => setTab("security")} />
        <TabButton icon={Headset} label="Support" active={tab === "support"} onClick={() => setTab("support")} />
        <TabButton icon={Bell} label="Notifications" active={tab === "notifications"} onClick={() => setTab("notifications")} />
      </div>

      {tab === "profile" && <ProfileTab />}
      {tab === "security" && <SecurityTab />}
      {tab === "support" && <SupportTab />}
      {tab === "notifications" && <NotificationsTab />}
    </div>
  );
}

function TabButton({ icon: Icon, label, active, onClick }: { icon: React.ElementType; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
        active ? "bg-violet-600 text-white" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      }`}
    >
      <Icon className="w-4 h-4" /> {label}
    </button>
  );
}

function ProfileTab() {
  const adminProfile = useAdminStore((s) => s.adminProfile);
  const updateAdminProfile = useAdminStore((s) => s.updateAdminProfile);
  const [form, setForm] = useState(adminProfile);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleSave() {
    updateAdminProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const updated = { ...form, avatarUrl: dataUrl };
      setForm(updated);
      // Photo changes apply immediately, like most profile-photo pickers.
      updateAdminProfile({ avatarUrl: dataUrl });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  return (
    <div className="bg-[var(--bg-raised)] border border-[var(--border-color)] rounded-2xl p-6">
      <h3 className="font-semibold text-[var(--text-primary)] mb-1">Profile Information</h3>
      <p className="text-sm text-[var(--text-secondary)] mb-6">Update your account profile details</p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoChange}
        className="hidden"
      />

      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <Avatar name={form.fullName} color={form.avatarColor} imageUrl={form.avatarUrl} size={72} />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center border-2 border-[var(--bg-raised)]"
            aria-label="Change profile photo"
          >
            <Camera className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors"
        >
          Change Photo
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Field label="Full Name" value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} />
        <Field label="Email Address" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
        <Field label="Phone Number" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
        <Field label="Role" value={form.role} disabled />
      </div>

      <button
        onClick={handleSave}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors"
      >
        <Save className="w-4 h-4" /> {saved ? "Saved!" : "Save Changes"}
      </button>
    </div>
  );
}

function Field({ label, value, onChange, disabled, type = "text" }: { label: string; value: string; onChange?: (v: string) => void; disabled?: boolean; type?: string }) {
  return (
    <div>
      <label className="block text-sm text-[var(--text-secondary)] mb-2">{label}</label>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full bg-[var(--bg-sunken)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-violet-500/40 disabled:opacity-60"
      />
    </div>
  );
}

function SecurityTab() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [resetting, setResetting] = useState(false);

  function handleResetData() {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    window.location.reload();
  }

  return (
    <div className="space-y-6">
      <div className="bg-[var(--bg-raised)] border border-[var(--border-color)] rounded-2xl p-6">
        <h3 className="font-semibold text-[var(--text-primary)] mb-1">Change Password</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-6">Update your password to keep your account secure</p>

        <div className="space-y-4 mb-6">
          <PasswordField label="Current Password" show={showCurrent} onToggle={() => setShowCurrent((s) => !s)} />
          <PasswordField label="New Password" show={showNew} onToggle={() => setShowNew((s) => !s)} />
          <PasswordField label="Confirm New Password" />
        </div>

        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors">
          <Lock className="w-4 h-4" /> Update Password
        </button>
      </div>

      <div className="bg-[var(--bg-raised)] border border-amber-500/20 rounded-2xl p-6">
        <h3 className="font-semibold text-[var(--text-primary)] mb-1">Reset Demo Data</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-5">
          This app's data is saved in your browser's local storage. If things look stale or out of sync after an update, use this to wipe it and reload fresh seed data.
        </p>
        {!resetting ? (
          <button
            onClick={() => setResetting(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/15 text-amber-400 text-sm font-medium hover:bg-amber-500/25 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Reset Demo Data
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--text-secondary)]">This will reload the page and restore default sample data. Continue?</span>
            <button onClick={handleResetData} className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors shrink-0">
              Yes, reset
            </button>
            <button onClick={() => setResetting(false)} className="px-4 py-2 rounded-xl bg-[var(--bg-subtle)] text-[var(--text-tertiary)] text-sm font-medium hover:bg-[var(--bg-subtle-strong)] transition-colors shrink-0">
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PasswordField({ label, show, onToggle }: { label: string; show?: boolean; onToggle?: () => void }) {
  return (
    <div>
      <label className="block text-sm text-[var(--text-secondary)] mb-2">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          className="w-full bg-[var(--bg-sunken)] border border-[var(--border-color)] rounded-xl px-4 py-3 pr-11 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-violet-500/40"
        />
        {onToggle && (
          <button onClick={onToggle} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

function SupportTab() {
  const addSupportAgent = useAdminStore((s) => s.addSupportAgent);

  // Create form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Agents list from API
  const [agents, setAgents] = useState<import("@/lib/api/admin").AdminUser[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);

  // Reset password state: { [userId]: { open, password, show, loading, error, success } }
  const [resetState, setResetState] = useState<Record<string, { open: boolean; password: string; show: boolean; loading: boolean; error: string; success: string }>>({});

  const loadAgents = useCallback(async () => {
    setLoadingAgents(true);
    try {
      const data = await adminApi.getStaffAgents();
      setAgents(data);
    } catch { /* ignore */ }
    finally { setLoadingAgents(false); }
  }, []);

  useEffect(() => { loadAgents(); }, [loadAgents]);

  async function handleCreate() {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) return;
    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await adminApi.createStaff({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password,
      });
      addSupportAgent({ fullName: `${firstName.trim()} ${lastName.trim()}`, email: email.trim() });
      setSuccessMsg(res.message || "Support account created successfully.");
      setFirstName(""); setLastName(""); setEmail(""); setPassword("");
      loadAgents();
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Failed to create account.");
    } finally {
      setSubmitting(false);
    }
  }

  function openReset(userId: string) {
    setResetState((s) => ({ ...s, [userId]: { open: true, password: "", show: false, loading: false, error: "", success: "" } }));
  }

  function closeReset(userId: string) {
    setResetState((s) => ({ ...s, [userId]: { ...s[userId], open: false } }));
  }

  async function handleReset(userId: string) {
    const state = resetState[userId];
    if (!state?.password?.trim() || state.password.length < 8) {
      setResetState((s) => ({ ...s, [userId]: { ...s[userId], error: "Password must be at least 8 characters." } }));
      return;
    }
    setResetState((s) => ({ ...s, [userId]: { ...s[userId], loading: true, error: "", success: "" } }));
    try {
      await adminApi.resetStaffPassword(userId, state.password);
      setResetState((s) => ({ ...s, [userId]: { ...s[userId], loading: false, success: "Password reset successfully.", open: false } }));
    } catch (e) {
      setResetState((s) => ({ ...s, [userId]: { ...s[userId], loading: false, error: e instanceof Error ? e.message : "Failed to reset password." } }));
    }
  }

  const canSubmit = firstName.trim() && lastName.trim() && email.trim() && password.trim() && !submitting;

  return (
    <div className="space-y-6">
      <div className="bg-[var(--bg-raised)] border border-[var(--border-color)] rounded-2xl p-6">
        <h3 className="font-semibold text-[var(--text-primary)] mb-1">Create Support Account</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          Give a customer support agent their own login. Email must be a <span className="font-medium text-[var(--text-primary)]">@spacebutton.net</span> address.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <Field label="First Name" value={firstName} onChange={setFirstName} />
          <Field label="Last Name" value={lastName} onChange={setLastName} />
          <Field label="Email Address" value={email} onChange={setEmail} type="email" />
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                className="w-full bg-[var(--bg-sunken)] border border-[var(--border-color)] rounded-xl px-4 py-3 pr-11 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              />
              <button onClick={() => setShowPassword((s) => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMsg}
          </div>
        )}

        <button
          onClick={handleCreate}
          disabled={!canSubmit}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          {submitting ? "Creating..." : "Create Support Account"}
        </button>
      </div>

      <div className="bg-[var(--bg-raised)] border border-[var(--border-color)] rounded-2xl p-6">
        <h3 className="font-semibold text-[var(--text-primary)] mb-1">Customer Support Team</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-5">
          {loadingAgents ? "Loading…" : `${agents.length} support account${agents.length === 1 ? "" : "s"}`}
        </p>

        <div className="space-y-1">
          {agents.map((agent) => {
            const rs = resetState[agent.id] ?? { open: false, password: "", show: false, loading: false, error: "", success: "" };
            const fullName = [agent.first_name, agent.last_name].filter(Boolean).join(" ") || agent.email;
            return (
              <div key={agent.id} className="py-3 border-b border-[var(--border-color)] last:border-0">
                <div className="flex items-center gap-3">
                  <Avatar name={fullName} color="#7C3AED" size={40} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[var(--text-primary)] font-medium text-sm truncate">{fullName}</div>
                    <div className="text-xs text-[var(--text-muted)] truncate">{agent.email}</div>
                  </div>
                  <button
                    onClick={() => rs.open ? closeReset(agent.id) : openReset(agent.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-xs font-medium transition-colors shrink-0"
                  >
                    <KeyRound className="w-3.5 h-3.5" /> Reset Password
                  </button>
                </div>

                {rs.open && (
                  <div className="mt-3 ml-[52px] flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type={rs.show ? "text" : "password"}
                        value={rs.password}
                        onChange={(e) => setResetState((s) => ({ ...s, [agent.id]: { ...s[agent.id], password: e.target.value } }))}
                        placeholder="New password (min 8 chars)"
                        className="w-full bg-[var(--bg-sunken)] border border-[var(--border-color)] rounded-xl px-3 py-2 pr-10 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                      />
                      <button
                        onClick={() => setResetState((s) => ({ ...s, [agent.id]: { ...s[agent.id], show: !s[agent.id]?.show } }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      >
                        {rs.show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <button
                      onClick={() => handleReset(agent.id)}
                      disabled={rs.loading}
                      className="px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white text-xs font-medium transition-colors shrink-0"
                    >
                      {rs.loading ? "Saving…" : "Save"}
                    </button>
                    <button onClick={() => closeReset(agent.id)} className="px-3 py-2 rounded-xl bg-[var(--bg-subtle)] text-[var(--text-muted)] text-xs font-medium transition-colors shrink-0">
                      Cancel
                    </button>
                  </div>
                )}

                {rs.error && (
                  <div className="mt-2 ml-[52px] flex items-center gap-1.5 text-red-400 text-xs">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {rs.error}
                  </div>
                )}
                {rs.success && (
                  <div className="mt-2 ml-[52px] flex items-center gap-1.5 text-emerald-400 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> {rs.success}
                  </div>
                )}
              </div>
            );
          })}
          {!loadingAgents && agents.length === 0 && (
            <p className="text-sm text-[var(--text-muted)] py-6 text-center">No support accounts yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function NotificationsTab() {
  const [prefs, setPrefs] = useState(NOTIF_PREFS_DEFAULT);

  return (
    <div className="bg-[var(--bg-raised)] border border-[var(--border-color)] rounded-2xl p-6">
      <h3 className="font-semibold text-[var(--text-primary)] mb-1">Notification Preferences</h3>
      <p className="text-sm text-[var(--text-secondary)] mb-6">Choose what notifications you want to receive</p>

      <div className="space-y-1">
        {prefs.map((p, i) => (
          <div key={p.key} className="flex items-center justify-between py-4 border-b border-[var(--border-color)] last:border-0">
            <div>
              <div className="text-[var(--text-primary)] font-medium text-sm">{p.label}</div>
              <div className="text-xs text-[var(--text-muted)]">{p.desc}</div>
            </div>
            <button
              onClick={() => setPrefs(prefs.map((x, xi) => (xi === i ? { ...x, on: !x.on } : x)))}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${p.on ? "bg-violet-600" : "bg-[var(--bg-subtle-strong)]"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  p.on ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
