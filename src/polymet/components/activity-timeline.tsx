import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  FileText,
  MessageSquare,
  DollarSign,
  Eye,
  Upload,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Calendar,
  MoreHorizontal,
} from "lucide-react";
import {
  getActivityEvents,
} from "@/polymet/data/profile-data";

interface ActivityTimelineProps {
  userId: string;
  limit?: number;
  showFilters?: boolean;
  className?: string;
}

const activityIcons = {
  listing_created: FileText,
  inquiry_received: MessageSquare,
  offer_made: DollarSign,
  document_uploaded: Upload,
  nda_signed: CheckCircle,
  profile_viewed: Eye,
  meeting_scheduled: Calendar,
  verification_completed: CheckCircle,
  payment_received: DollarSign,
  contract_signed: FileText,
  milestone_reached: TrendingUp,
  team_member_added: Users,
} as const;

const activityColors = {
  listing_created: "bg-blue-500",
  inquiry_received: "bg-green-500",
  offer_made: "bg-orange-500",
  document_uploaded: "bg-purple-500",
  nda_signed: "bg-red-500",
  profile_viewed: "bg-gray-500",
  meeting_scheduled: "bg-indigo-500",
  verification_completed: "bg-emerald-500",
  payment_received: "bg-yellow-500",
  contract_signed: "bg-pink-500",
  milestone_reached: "bg-cyan-500",
  team_member_added: "bg-violet-500",
} as const;

export function ActivityTimeline({
  userId,
  limit = 10,
  showFilters = true,
  className = "",
}: ActivityTimelineProps) {
  const activities = getActivityEvents(userId).slice(0, limit);
  const [filter, setFilter] = React.useState<string>("all");

  const filteredActivities = activities.filter((activity) => {
    if (filter === "all") return true;
    return activity.type === filter;
  });

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInHours = Math.floor(
      (now.getTime() - activityTime.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

  const uniqueActivityTypes = [...new Set(activities.map((a) => a.type))];

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Activity
          </CardTitle>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            {uniqueActivityTypes.map((type) => (
              <Button
                key={type}
                variant={filter === type ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(type)}
              >
                {type
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </Button>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {filteredActivities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />

            <p>No recent activity</p>
            <p className="text-sm">Your activities will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredActivities.map((activity, index) => {
              const IconComponent = activityIcons[activity.type] || AlertCircle;
              const iconColor = activityColors[activity.type] || "bg-gray-500";

              return (
                <div key={activity.id} className="flex gap-4 group">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full ${iconColor} flex items-center justify-center flex-shrink-0`}
                    >
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    {index < filteredActivities.length - 1 && (
                      <div className="w-px h-8 bg-border mt-2" />
                    )}
                  </div>

                  {/* Activity content */}
                  <div className="flex-1 min-w-0 pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm group-hover:text-primary transition-colors">
                          {activity.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {activity.description}
                        </p>

                        {activity.metadata && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {Object.entries(activity.metadata).map(
                              ([key, value]) => (
                                <Badge
                                  key={key}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {key}: {String(value)}
                                </Badge>
                              )
                            )}
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-muted-foreground ml-4 flex-shrink-0">
                        {getRelativeTime(activity.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activities.length > limit && (
          <div className="text-center pt-4 border-t">
            <Button variant="outline" size="sm">
              View All Activity
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
