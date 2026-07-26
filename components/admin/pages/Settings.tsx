'use client'
import React, { useRef, useState, useEffect, useCallback } from "react";
import { User, Shield, Bell, Camera, Save, Lock, Eye, EyeOff, UserPlus, Headset, Trash2, AlertCircle, CheckCircle2, KeyRound, Ban, CheckCheck } from "lucide-react";
import { useAdminStore } from "@/lib/admin-store";
import { adminApi } from "@/lib/api/admin";
import { Avatar } from "@/components/admin/shared/Atoms";
import { ConfirmModal } from "@/components/admin/shared/Modal";

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

// ─── Profile Tab ─────────────────────────────────────────────────────────────

function ProfileTab() {
  const adminProfile = useAdminStore((s) => s.adminProfile);
  const updateAdminProfile = useAdminStore((s) => s.updateAdminProfile);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState(() => {
    const parts = adminProfile.fullName.split(" ");
    return parts[0] ?? "";
  });
  const [lastName, setLastName] = useState(() => {
    const parts = adminProfile.fullName.split(" ");
    return parts.slice(1).join(" ");
  });
  const [saved, setSaved] = useState(false);

  function handleSave() {
    const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
    updateAdminProfile({ fullName });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateAdminProfile({ avatarUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  return (
    <div className="bg-[var(--bg-raised)] border border-[var(--border-color)] rounded-2xl p-6">
      <h3 className="font-semibold text-[var(--text-primary)] mb-1">Profile Information</h3>
      <p className="text-sm text-[var(--text-secondary)] mb-6">Update your display name and photo</p>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />

      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <Avatar name={adminProfile.fullName} color={adminProfile.avatarColor} imageUrl={adminProfile.avatarUrl} size={72} />
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
        <Field label="First Name" value={firstName} onChange={setFirstName} />
        <Field label="Last Name" value={lastName} onChange={setLastName} />
        <Field label="Email Address" value={adminProfile.email} disabled />
        <Field label="Role" value={adminProfile.role} disabled />
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

// ─── Security Tab ─────────────────────────────────────────────────────────────

function SecurityTab() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleChangePassword() {
    setError(""); setSuccess("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required."); return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters."); return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match."); return;
    }
    setLoading(true);
    try {
      await adminApi.changePassword(currentPassword, newPassword);
      setSuccess("Password updated successfully.");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to update password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[var(--bg-raised)] border border-[var(--border-color)] rounded-2xl p-6">
      <h3 className="font-semibold text-[var(--text-primary)] mb-1">Change Password</h3>
      <p className="text-sm text-[var(--text-secondary)] mb-6">Update your password to keep your account secure</p>

      <div className="space-y-4 mb-6">
        <PasswordField label="Current Password" value={currentPassword} onChange={setCurrentPassword} show={showCurrent} onToggle={() => setShowCurrent((s) => !s)} />
        <PasswordField label="New Password" value={newPassword} onChange={setNewPassword} show={showNew} onToggle={() => setShowNew((s) => !s)} />
        <PasswordField label="Confirm New Password" value={confirmPassword} onChange={setConfirmPassword} show={showConfirm} onToggle={() => setShowConfirm((s) => !s)} />
      </div>

      {error && (
        <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {success}
        </div>
      )}

      <button
        onClick={handleChangePassword}
        disabled={loading}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white text-sm font-medium transition-colors"
      >
        <Lock className="w-4 h-4" /> {loading ? "Updating…" : "Update Password"}
      </button>
    </div>
  );
}

// ─── Support Tab ──────────────────────────────────────────────────────────────

type AgentAction = { type: "suspend" | "activate" | "delete"; agentId: string; agentName: string } | null;

function SupportTab() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [agents, setAgents] = useState<import("@/lib/api/admin").AdminUser[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [pendingAction, setPendingAction] = useState<AgentAction>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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
    setSubmitting(true); setErrorMsg(""); setSuccessMsg("");
    try {
      const res = await adminApi.createStaff({ first_name: firstName.trim(), last_name: lastName.trim(), email: email.trim(), password });
      setSuccessMsg(res.message || "Support account created successfully.");
      setFirstName(""); setLastName(""); setEmail(""); setPassword("");
      loadAgents();
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Failed to create account.");
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmAction() {
    if (!pendingAction) return;
    const { type, agentId } = pendingAction;
    setActionLoading(agentId);
    setPendingAction(null);
    try {
      if (type === "suspend") await adminApi.suspendUser(agentId);
      else if (type === "activate") await adminApi.activateUser(agentId);
      else if (type === "delete") await adminApi.deleteStaff(agentId);
      await loadAgents();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Action failed");
    } finally {
      setActionLoading(null);
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
      setResetState((s) => ({ ...s, [userId]: { ...s[userId], loading: false, success: "Password reset.", open: false } }));
    } catch (e) {
      setResetState((s) => ({ ...s, [userId]: { ...s[userId], loading: false, error: e instanceof Error ? e.message : "Failed." } }));
    }
  }

  const canSubmit = firstName.trim() && lastName.trim() && email.trim() && password.trim() && !submitting;

  return (
    <div className="space-y-6">
      {/* Create form */}
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
          {submitting ? "Creating…" : "Create Support Account"}
        </button>
      </div>

      {/* Agent list */}
      <div className="bg-[var(--bg-raised)] border border-[var(--border-color)] rounded-2xl p-6">
        <h3 className="font-semibold text-[var(--text-primary)] mb-1">Customer Support Team</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-5">
          {loadingAgents ? "Loading…" : `${agents.length} support account${agents.length === 1 ? "" : "s"}`}
        </p>

        <div className="space-y-1">
          {agents.map((agent) => {
            const rs = resetState[agent.id] ?? { open: false, password: "", show: false, loading: false, error: "", success: "" };
            const fullName = [agent.first_name, agent.last_name].filter(Boolean).join(" ") || agent.email;
            const isSuspended = (agent.status ?? "").toLowerCase() === "suspended";
            const isActioning = actionLoading === agent.id;

            return (
              <div key={agent.id} className="py-3 border-b border-[var(--border-color)] last:border-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <Avatar name={fullName} color="#7C3AED" size={40} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--text-primary)] font-medium text-sm truncate">{fullName}</span>
                      {isSuspended && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20 shrink-0">
                          Suspended
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] truncate">{agent.email}</div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => rs.open ? closeReset(agent.id) : openReset(agent.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-xs font-medium transition-colors"
                    >
                      <KeyRound className="w-3.5 h-3.5" /> Reset Password
                    </button>

                    {isSuspended ? (
                      <button
                        disabled={isActioning}
                        onClick={() => setPendingAction({ type: "activate", agentId: agent.id, agentName: fullName })}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-medium transition-colors disabled:opacity-40"
                      >
                        <CheckCheck className="w-3.5 h-3.5" /> {isActioning ? "…" : "Activate"}
                      </button>
                    ) : (
                      <button
                        disabled={isActioning}
                        onClick={() => setPendingAction({ type: "suspend", agentId: agent.id, agentName: fullName })}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 text-xs font-medium transition-colors disabled:opacity-40"
                      >
                        <Ban className="w-3.5 h-3.5" /> {isActioning ? "…" : "Suspend"}
                      </button>
                    )}

                    <button
                      disabled={isActioning}
                      onClick={() => setPendingAction({ type: "delete", agentId: agent.id, agentName: fullName })}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-medium transition-colors disabled:opacity-40"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> {isActioning ? "…" : "Delete"}
                    </button>
                  </div>
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

      {/* Confirm modal for suspend / activate / delete */}
      <ConfirmModal
        open={!!pendingAction}
        title={
          pendingAction?.type === "delete" ? "Delete support account?" :
          pendingAction?.type === "suspend" ? "Suspend support agent?" : "Activate support agent?"
        }
        description={
          pendingAction?.type === "delete"
            ? `${pendingAction.agentName}'s account will be permanently removed and they will no longer be able to log in.`
            : pendingAction?.type === "suspend"
            ? `${pendingAction?.agentName} will be suspended and lose access to the support portal until reactivated.`
            : `${pendingAction?.agentName} will regain full access to the support portal.`
        }
        confirmLabel={pendingAction?.type === "delete" ? "Delete" : pendingAction?.type === "suspend" ? "Suspend" : "Activate"}
        danger={pendingAction?.type !== "activate"}
        icon={pendingAction?.type === "delete" ? <Trash2 className="w-6 h-6 text-red-400" /> : pendingAction?.type === "suspend" ? <Ban className="w-6 h-6 text-orange-400" /> : <CheckCheck className="w-6 h-6 text-emerald-400" />}
        onConfirm={confirmAction}
        onCancel={() => setPendingAction(null)}
      />
    </div>
  );
}

// ─── Notifications Tab ────────────────────────────────────────────────────────

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
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${p.on ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Shared field components ──────────────────────────────────────────────────

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

function PasswordField({ label, value, onChange, show, onToggle }: { label: string; value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void }) {
  return (
    <div>
      <label className="block text-sm text-[var(--text-secondary)] mb-2">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[var(--bg-sunken)] border border-[var(--border-color)] rounded-xl px-4 py-3 pr-11 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-violet-500/40"
        />
        <button onClick={onToggle} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
