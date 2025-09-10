import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  UserPlus,
  Mail,
  MoreHorizontal,
  Shield,
  Eye,
  Edit,
  Trash2,
  Crown,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "editor" | "viewer";
  status: "active" | "pending" | "suspended";
  avatar: string;
  joinedDate: string;
  lastActive: string;
  permissions: string[];
}

interface TeamManagementProps {
  members?: TeamMember[];
  onInviteMember?: (email: string, role: string) => void;
  onUpdateRole?: (memberId: string, newRole: string) => void;
  onRemoveMember?: (memberId: string) => void;
  onResendInvite?: (memberId: string) => void;
  className?: string;
}

const rolePermissions = {
  owner: ["All permissions", "Billing access", "Delete account"],
  admin: ["Manage team", "Edit profile", "View documents", "Manage listings"],
  editor: ["Edit profile", "View documents", "Manage listings"],
  viewer: ["View profile", "View public documents"],
};

const roleColors = {
  owner: "bg-purple-100 text-purple-800",
  admin: "bg-blue-100 text-blue-800",
  editor: "bg-green-100 text-green-800",
  viewer: "bg-gray-100 text-gray-800",
};

const statusIcons = {
  active: CheckCircle,
  pending: Clock,
  suspended: AlertCircle,
};

const statusColors = {
  active: "text-green-600",
  pending: "text-yellow-600",
  suspended: "text-red-600",
};

const mockMembers: TeamMember[] = [
  {
    id: "tm1",
    name: "Rajesh Kumar",
    email: "rajesh@techflow.com",
    role: "owner",
    status: "active",
    avatar: "https://github.com/yusufhilmi.png",
    joinedDate: "2024-01-15",
    lastActive: "2024-03-15T10:30:00Z",
    permissions: rolePermissions.owner,
  },
  {
    id: "tm2",
    name: "Priya Sharma",
    email: "priya@techflow.com",
    role: "admin",
    status: "active",
    avatar: "https://github.com/kdrnp.png",
    joinedDate: "2024-02-01",
    lastActive: "2024-03-14T16:45:00Z",
    permissions: rolePermissions.admin,
  },
  {
    id: "tm3",
    name: "Amit Patel",
    email: "amit@consultant.com",
    role: "editor",
    status: "pending",
    avatar: "https://github.com/yahyabedirhan.png",
    joinedDate: "2024-03-10",
    lastActive: "2024-03-10T09:00:00Z",
    permissions: rolePermissions.editor,
  },
];

export function TeamManagement({
  members = mockMembers,
  onInviteMember,
  onUpdateRole,
  onRemoveMember,
  onResendInvite,
  className = "",
}: TeamManagementProps) {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");

  const handleInvite = () => {
    if (inviteEmail && onInviteMember) {
      onInviteMember(inviteEmail, inviteRole);
      setInviteEmail("");
      setInviteRole("viewer");
      setIsInviteOpen(false);
    }
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor(
      (now.getTime() - time.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Management
            <Badge variant="secondary">{members.length}</Badge>
          </CardTitle>

          <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to collaborate on your profile and
                  listings.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {rolePermissions[
                      inviteRole as keyof typeof rolePermissions
                    ]?.join(", ")}
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsInviteOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleInvite} disabled={!inviteEmail}>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Invite
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {members.map((member) => {
            const StatusIcon = statusIcons[member.status];

            return (
              <div
                key={member.id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-10 h-10 rounded-full"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">{member.name}</h4>
                    {member.role === "owner" && (
                      <Crown className="w-4 h-4 text-yellow-600" />
                    )}
                    <Badge className={roleColors[member.role]}>
                      {member.role}
                    </Badge>
                    <StatusIcon
                      className={`w-4 h-4 ${statusColors[member.status]}`}
                    />
                  </div>

                  <p className="text-sm text-muted-foreground truncate">
                    {member.email}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {member.status === "active"
                      ? `Active ${getRelativeTime(member.lastActive)}`
                      : member.status === "pending"
                        ? "Invitation pending"
                        : "Account suspended"}
                  </p>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {member.status === "pending" && (
                      <DropdownMenuItem
                        onClick={() => onResendInvite?.(member.id)}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Resend Invite
                      </DropdownMenuItem>
                    )}

                    {member.role !== "owner" && (
                      <>
                        <DropdownMenuItem
                          onClick={() => onUpdateRole?.(member.id, "admin")}
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          Change Role
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => onRemoveMember?.(member.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove Member
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}
        </div>

        {/* Role Permissions Info */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Role Permissions
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {Object.entries(rolePermissions).map(([role, permissions]) => (
              <div key={role}>
                <Badge
                  className={`${roleColors[role as keyof typeof roleColors]} mb-2`}
                >
                  {role}
                </Badge>
                <ul className="space-y-1 text-muted-foreground">
                  {permissions.map((permission) => (
                    <li key={permission} className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-current rounded-full" />

                      {permission}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
