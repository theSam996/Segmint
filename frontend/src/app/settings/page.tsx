"use client";

import { useState, useEffect } from "react";
import {
  User,
  Building,
  Users,
  Shield,
  Key,
  Mail,
  CheckCircle2,
  Lock,
  Plus,
  Trash2,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import { INDUSTRIES, WORKSPACE_ROLES } from "@/lib/constants";

export default function SettingsPage() {
  const { user, workspace, updateUserProfile, createWorkspace } = useAuth();

  // Profile Form
  const [fullName, setFullName] = useState(user?.fullName || "Alex Morgan");
  const [email, setEmail] = useState(user?.email || "alex.morgan@retailco.com");
  const [savedProfile, setSavedProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Sync state if user loads after initial mount
  useEffect(() => {
    if (user?.fullName) setFullName(user.fullName);
    if (user?.email) setEmail(user.email);
  }, [user?.fullName, user?.email]);

  // Workspace Form
  const [workspaceName, setWorkspaceName] = useState(workspace?.name || "RetailCo Analytics");
  const [industry, setIndustry] = useState(workspace?.industry || "ecommerce");
  const [savedWorkspace, setSavedWorkspace] = useState(false);

  // Team Members
  const [members, setMembers] = useState([
    { id: "1", name: user?.fullName || "Alex Morgan", email: user?.email || "alex.morgan@retailco.com", role: "owner" },
    { id: "2", name: "Sarah Chen", email: "sarah.c@retailco.com", role: "admin" },
    { id: "3", name: "Marcus Vance", email: "m.vance@retailco.com", role: "analyst" },
    { id: "4", name: "Elena Rostova", email: "elena.r@retailco.com", role: "viewer" },
  ]);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("analyst");

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavedProfile(false);
    setProfileError(null);
    setIsSavingProfile(true);

    try {
      await updateUserProfile(fullName, email);
      setSavedProfile(true);
      setTimeout(() => setSavedProfile(false), 3000);
    } catch (err: any) {
      setProfileError(err.message || "Failed to update profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedWorkspace(true);
    setTimeout(() => setSavedWorkspace(false), 2000);
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setMembers((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        name: inviteEmail.split("@")[0],
        email: inviteEmail,
        role: inviteRole,
      },
    ]);
    setInviteEmail("");
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="pb-2 border-b border-border/40">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
          Workspace Settings
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage your personal profile, organization workspace, team permissions, and security.
        </p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full sm:w-96">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* TAB 1: Profile */}
        <TabsContent value="profile" className="space-y-6 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <User className="w-4 h-4 text-primary" /> Personal Profile
              </CardTitle>
              <CardDescription className="text-xs">
                Update your contact details and display preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div className="flex items-center gap-4 pb-2 border-b border-border/40">
                  <div className="w-14 h-14 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-lg font-black text-primary">
                    {fullName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">{fullName}</h4>
                    <p className="text-muted-foreground">{email}</p>
                    <Badge variant="purple" className="text-[10px] mt-1">
                      Workspace Owner
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="font-semibold text-foreground">Full Name</label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="font-semibold text-foreground">Work Email Address</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {profileError && (
                  <p className="text-xs font-semibold text-rose-400">
                    {profileError}
                  </p>
                )}

                <div className="flex items-center justify-between pt-2">
                  {savedProfile && (
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Profile updated successfully
                    </span>
                  )}
                  <Button
                    type="submit"
                    size="sm"
                    variant="primary"
                    isLoading={isSavingProfile}
                    className="ml-auto text-xs h-8"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: Workspace */}
        <TabsContent value="workspace" className="space-y-6 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Building className="w-4 h-4 text-primary" /> Workspace Configuration
              </CardTitle>
              <CardDescription className="text-xs">
                Organization details and billing identifiers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveWorkspace} className="space-y-4 text-xs">
                <div className="space-y-1.5 text-left">
                  <label className="font-semibold text-foreground">Workspace Name</label>
                  <Input
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="font-semibold text-foreground">Primary Industry</label>
                  <Select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    options={INDUSTRIES}
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="font-semibold text-foreground">Workspace ID</label>
                  <Input
                    value="ws-8f92a10c-retailco"
                    disabled
                    className="font-mono text-muted-foreground bg-muted/30"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  {savedWorkspace && (
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Workspace updated
                    </span>
                  )}
                  <Button type="submit" size="sm" variant="primary" className="ml-auto text-xs h-8">
                    Save Workspace
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: Team */}
        <TabsContent value="team" className="space-y-6 max-w-3xl">
          {/* Invite Member */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> Invite Team Member
              </CardTitle>
              <CardDescription className="text-xs">
                Invite colleagues with specific permission roles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInvite} className="flex flex-col sm:flex-row items-center gap-2.5">
                <div className="flex-1 w-full">
                  <Input
                    type="email"
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    icon={<Mail className="w-4 h-4" />}
                    required
                  />
                </div>
                <div className="w-full sm:w-36">
                  <Select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                  >
                    <option value="admin">Admin</option>
                    <option value="analyst">Analyst</option>
                    <option value="viewer">Viewer</option>
                  </Select>
                </div>
                <Button type="submit" size="sm" variant="primary" className="w-full sm:w-auto text-xs h-9">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Send Invite
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Members Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold">Active Members ({members.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border/40 text-xs">
                {members.map((m) => (
                  <div key={m.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-foreground">{m.name}</p>
                      <p className="text-muted-foreground">{m.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={m.role === "owner" ? "purple" : "outline"} className="text-[10px] uppercase">
                        {m.role}
                      </Badge>
                      {m.role !== "owner" && (
                        <button
                          onClick={() => setMembers((prev) => prev.filter((item) => item.id !== m.id))}
                          className="p-1 rounded text-muted-foreground hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: Security */}
        <TabsContent value="security" className="space-y-6 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" /> Password & Security
              </CardTitle>
              <CardDescription className="text-xs">
                Update account password and review active browser sessions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Current Password</label>
                <Input type="password" placeholder="••••••••" icon={<Lock className="w-4 h-4" />} />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">New Password</label>
                <Input type="password" placeholder="At least 8 characters" icon={<Lock className="w-4 h-4" />} />
              </div>
              <Button size="sm" variant="primary" className="text-xs h-8">
                Update Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
