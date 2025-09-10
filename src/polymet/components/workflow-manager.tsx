import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  EditIcon,
  SendIcon,
  AlertCircleIcon,
  MessageSquareIcon,
  CalendarIcon,
} from "lucide-react";

export type WorkflowStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "published"
  | "rejected";

export interface WorkflowStep {
  id: string;
  status: WorkflowStatus;
  title: string;
  description: string;
  completedAt?: string;
  completedBy?: string;
  notes?: string;
}

export interface WorkflowManagerProps {
  currentStatus: WorkflowStatus;
  steps?: WorkflowStep[];
  onStatusChange?: (newStatus: WorkflowStatus, notes?: string) => void;
  onPreview?: () => void;
  onEdit?: () => void;
  canEdit?: boolean;
  canSubmit?: boolean;
  canApprove?: boolean;
  canPublish?: boolean;
  className?: string;
}

const defaultSteps: WorkflowStep[] = [
  {
    id: "draft",
    status: "draft",
    title: "Draft Created",
    description: "Franchise listing is being prepared",
  },
  {
    id: "submitted",
    status: "submitted",
    title: "Submitted for Review",
    description: "Listing submitted to BizSearch team for verification",
  },
  {
    id: "under_review",
    status: "under_review",
    title: "Under Review",
    description: "Our team is reviewing the franchise details",
  },
  {
    id: "approved",
    status: "approved",
    title: "Approved",
    description: "Listing approved and ready for publishing",
  },
  {
    id: "published",
    status: "published",
    title: "Published",
    description: "Franchise listing is live on BizSearch",
  },
];

const statusConfig = {
  draft: {
    color: "bg-gray-100 text-gray-800",
    icon: EditIcon,
    label: "Draft",
  },
  submitted: {
    color: "bg-blue-100 text-blue-800",
    icon: SendIcon,
    label: "Submitted",
  },
  under_review: {
    color: "bg-yellow-100 text-yellow-800",
    icon: ClockIcon,
    label: "Under Review",
  },
  approved: {
    color: "bg-green-100 text-green-800",
    icon: CheckCircleIcon,
    label: "Approved",
  },
  published: {
    color: "bg-emerald-100 text-emerald-800",
    icon: CheckCircleIcon,
    label: "Published",
  },
  rejected: {
    color: "bg-red-100 text-red-800",
    icon: AlertCircleIcon,
    label: "Rejected",
  },
};

export function WorkflowManager({
  currentStatus,
  steps = defaultSteps,
  onStatusChange,
  onPreview,
  onEdit,
  canEdit = true,
  canSubmit = true,
  canApprove = false,
  canPublish = false,
  className = "",
}: WorkflowManagerProps) {
  const [reviewNotes, setReviewNotes] = useState("");
  const [showNotesInput, setShowNotesInput] = useState(false);
  const [pendingAction, setPendingAction] = useState<WorkflowStatus | null>(
    null
  );

  const config = statusConfig[currentStatus];
  const StatusIcon = config.icon;

  const handleStatusChange = (newStatus: WorkflowStatus) => {
    if (newStatus === "rejected" || newStatus === "approved") {
      setPendingAction(newStatus);
      setShowNotesInput(true);
    } else {
      onStatusChange?.(newStatus);
    }
  };

  const handleConfirmAction = () => {
    if (pendingAction) {
      onStatusChange?.(pendingAction, reviewNotes);
      setReviewNotes("");
      setShowNotesInput(false);
      setPendingAction(null);
    }
  };

  const handleCancelAction = () => {
    setReviewNotes("");
    setShowNotesInput(false);
    setPendingAction(null);
  };

  const getStepStatus = (stepStatus: WorkflowStatus) => {
    const statusOrder = [
      "draft",
      "submitted",
      "under_review",
      "approved",
      "published",
    ];

    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepStatus);

    if (currentStatus === "rejected") {
      return stepIndex <= statusOrder.indexOf("submitted")
        ? "completed"
        : "pending";
    }

    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "current";
    return "pending";
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Current Status Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StatusIcon className="h-6 w-6 text-muted-foreground" />

              <div>
                <CardTitle className="text-lg">Listing Status</CardTitle>
                <Badge className={config.color}>{config.label}</Badge>
              </div>
            </div>
            <div className="flex gap-2">
              {onPreview && (
                <Button variant="outline" size="sm" onClick={onPreview}>
                  <EyeIcon className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              )}
              {canEdit && currentStatus === "draft" && onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <EditIcon className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Workflow Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Workflow Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step, index) => {
              const stepStatus = getStepStatus(step.status);
              const isCompleted = stepStatus === "completed";
              const isCurrent = stepStatus === "current";

              return (
                <div key={step.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isCompleted
                          ? "bg-green-500 text-white"
                          : isCurrent
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircleIcon className="h-4 w-4" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-0.5 h-8 ${
                          isCompleted ? "bg-green-500" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <h4
                      className={`font-medium ${
                        isCurrent
                          ? "text-blue-600"
                          : isCompleted
                            ? "text-green-600"
                            : "text-gray-500"
                      }`}
                    >
                      {step.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {step.description}
                    </p>
                    {step.completedAt && (
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <CalendarIcon className="h-3 w-3" />

                        <span>
                          Completed on{" "}
                          {new Date(step.completedAt).toLocaleDateString()}
                        </span>
                        {step.completedBy && <span>by {step.completedBy}</span>}
                      </div>
                    )}
                    {step.notes && (
                      <div className="mt-2 p-2 bg-muted rounded text-sm">
                        <div className="flex items-center gap-1 mb-1">
                          <MessageSquareIcon className="h-3 w-3" />

                          <span className="font-medium">Notes:</span>
                        </div>
                        {step.notes}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Available Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {currentStatus === "draft" && canSubmit && (
              <Button onClick={() => handleStatusChange("submitted")}>
                <SendIcon className="h-4 w-4 mr-2" />
                Submit for Review
              </Button>
            )}

            {currentStatus === "submitted" && canApprove && (
              <>
                <Button onClick={() => handleStatusChange("under_review")}>
                  <ClockIcon className="h-4 w-4 mr-2" />
                  Start Review
                </Button>
              </>
            )}

            {currentStatus === "under_review" && canApprove && (
              <>
                <Button onClick={() => handleStatusChange("approved")}>
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleStatusChange("rejected")}
                >
                  <AlertCircleIcon className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </>
            )}

            {currentStatus === "approved" && canPublish && (
              <Button onClick={() => handleStatusChange("published")}>
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                Publish Listing
              </Button>
            )}

            {currentStatus === "rejected" && canEdit && (
              <Button onClick={() => handleStatusChange("draft")}>
                <EditIcon className="h-4 w-4 mr-2" />
                Revise & Resubmit
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Review Notes Input */}
      {showNotesInput && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {pendingAction === "approved"
                ? "Approval Notes"
                : "Rejection Reason"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="reviewNotes">
                {pendingAction === "approved"
                  ? "Add any notes for the franchisor (optional)"
                  : "Please explain why this listing is being rejected"}
              </Label>
              <Textarea
                id="reviewNotes"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder={
                  pendingAction === "approved"
                    ? "Great listing! Ready for publishing..."
                    : "Please provide specific feedback on what needs to be improved..."
                }
                className="mt-2"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleConfirmAction}>
                Confirm{" "}
                {pendingAction === "approved" ? "Approval" : "Rejection"}
              </Button>
              <Button variant="outline" onClick={handleCancelAction}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
