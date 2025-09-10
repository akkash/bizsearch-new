import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, TrendingUp, Users, Award, Globe, Plus } from "lucide-react";
import { type UserProfile } from "@/polymet/data/profile-data";

interface RoleTabsProps {
  activeRole: UserProfile["role"];
  onRoleChange: (role: UserProfile["role"]) => void;
  showAddRole?: boolean;
  onAddRole?: () => void;
  className?: string;
}

export function RoleTabs({
  activeRole,
  onRoleChange,
  showAddRole = false,
  onAddRole,
  className = "",
}: RoleTabsProps) {
  const roles = [
    {
      id: "seller" as const,
      label: "Business Seller",
      shortLabel: "Seller",
      icon: Building2,
      description: "Sell your business",
      color: "blue",
      count: 1, // In real app, this would be dynamic
    },
    {
      id: "buyer" as const,
      label: "Business Buyer",
      shortLabel: "Buyer",
      icon: TrendingUp,
      description: "Buy businesses",
      color: "green",
      count: 0,
    },
    {
      id: "franchisor" as const,
      label: "Franchisor",
      shortLabel: "Franchisor",
      icon: Users,
      description: "Offer franchises",
      color: "orange",
      count: 0,
    },
    {
      id: "franchisee" as const,
      label: "Franchisee",
      shortLabel: "Franchisee",
      icon: Award,
      description: "Buy franchises",
      color: "purple",
      count: 0,
    },
    {
      id: "advisor" as const,
      label: "Advisor/Broker",
      shortLabel: "Advisor",
      icon: Globe,
      description: "Provide advisory services",
      color: "gray",
      count: 0,
    },
  ];

  const getColorClasses = (color: string, isActive: boolean) => {
    const colorMap = {
      blue: {
        active: "bg-blue-100 text-blue-900 border-blue-300",
        inactive: "text-blue-600 hover:bg-blue-50 border-transparent",
      },
      green: {
        active: "bg-green-100 text-green-900 border-green-300",
        inactive: "text-green-600 hover:bg-green-50 border-transparent",
      },
      orange: {
        active: "bg-orange-100 text-orange-900 border-orange-300",
        inactive: "text-orange-600 hover:bg-orange-50 border-transparent",
      },
      purple: {
        active: "bg-purple-100 text-purple-900 border-purple-300",
        inactive: "text-purple-600 hover:bg-purple-50 border-transparent",
      },
      gray: {
        active: "bg-gray-100 text-gray-900 border-gray-300",
        inactive: "text-gray-600 hover:bg-gray-50 border-transparent",
      },
    };

    return (
      colorMap[color as keyof typeof colorMap]?.[
        isActive ? "active" : "inactive"
      ] || ""
    );
  };

  return (
    <div className={`bg-white border rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Your Roles</h3>
        {showAddRole && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAddRole}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Role
          </Button>
        )}
      </div>

      {/* Desktop Tabs */}
      <div className="hidden md:flex flex-wrap gap-2">
        {roles.map((role) => {
          const isActive = activeRole === role.id;
          const IconComponent = role.icon;

          return (
            <button
              key={role.id}
              onClick={() => onRoleChange(role.id)}
              className={`
                flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all duration-200
                ${getColorClasses(role.color, isActive)}
                ${isActive ? "shadow-sm" : "hover:shadow-sm"}
              `}
            >
              <IconComponent className="w-4 h-4" />

              <span className="font-medium">{role.shortLabel}</span>
              {role.count > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {role.count}
                </Badge>
              )}
            </button>
          );
        })}
      </div>

      {/* Mobile Dropdown */}
      <div className="md:hidden">
        <select
          value={activeRole}
          onChange={(e) => onRoleChange(e.target.value as UserProfile["role"])}
          className="w-full p-3 border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.label} {role.count > 0 ? `(${role.count})` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Role Description */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          {(() => {
            const currentRole = roles.find((r) => r.id === activeRole);
            if (!currentRole) return null;
            const IconComponent = currentRole.icon;
            return (
              <>
                <IconComponent className="w-5 h-5 text-gray-600" />

                <span className="font-medium text-gray-900">
                  {currentRole.label}
                </span>
              </>
            );
          })()}
        </div>
        <p className="text-sm text-gray-600">
          {roles.find((r) => r.id === activeRole)?.description}
        </p>
      </div>

      {/* Role-specific Quick Actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        {activeRole === "seller" && (
          <>
            <Button size="sm" variant="outline">
              Create Listing
            </Button>
            <Button size="sm" variant="outline">
              View Inquiries
            </Button>
            <Button size="sm" variant="outline">
              Upload Documents
            </Button>
          </>
        )}

        {activeRole === "buyer" && (
          <>
            <Button size="sm" variant="outline">
              Browse Businesses
            </Button>
            <Button size="sm" variant="outline">
              Saved Searches
            </Button>
            <Button size="sm" variant="outline">
              My NDAs
            </Button>
          </>
        )}

        {activeRole === "franchisor" && (
          <>
            <Button size="sm" variant="outline">
              Create Franchise
            </Button>
            <Button size="sm" variant="outline">
              Manage Leads
            </Button>
            <Button size="sm" variant="outline">
              Franchise Kit
            </Button>
          </>
        )}

        {activeRole === "franchisee" && (
          <>
            <Button size="sm" variant="outline">
              Browse Franchises
            </Button>
            <Button size="sm" variant="outline">
              My Applications
            </Button>
            <Button size="sm" variant="outline">
              Compare Options
            </Button>
          </>
        )}

        {activeRole === "advisor" && (
          <>
            <Button size="sm" variant="outline">
              Manage Clients
            </Button>
            <Button size="sm" variant="outline">
              Create Listing
            </Button>
            <Button size="sm" variant="outline">
              Lead Pipeline
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
