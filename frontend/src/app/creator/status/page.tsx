"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  FileText,
  Camera,
  UserCheck,
  Mail,
  RefreshCw,
} from "lucide-react";

interface VerificationStatus {
  status: string;
  stage: string;
  canReapply: boolean;
  verification?: {
    id: number;
    aiScore: number;
    reviewNotes?: string;
    rejectionReason?: string;
  };
}

export default function CreatorStatus() {
  const router = useRouter();
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        router.push("/login?redirect=/creator/status");
        return;
      }

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
        }/creator/verification-status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setStatus(result);
      } else {
        console.error("Failed to fetch status");
      }
    } catch (error) {
      console.error("Status fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [router]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'not_started':
        return {
          title: "Application Not Started",
          description: "You haven't started your creator application yet.",
          icon: <FileText className="w-8 h-8 text-gray-500" />,
          color: "bg-gray-100 text-gray-800",
          action: "Start Application"
        };
      case 'pending':
        return {
          title: "Documents Needed",
          description: "Please upload your ID document and selfie to continue.",
          icon: <Camera className="w-8 h-8 text-blue-500" />,
          color: "bg-blue-100 text-blue-800",
          action: "Upload Documents"
        };
      case 'id_confirmed':
        return {
          title: "Documents Verified",
          description: "Your documents have been verified. Please complete your application.",
          icon: <CheckCircle className="w-8 h-8 text-green-500" />,
          color: "bg-green-100 text-green-800",
          action: "Complete Application"
        };
      case 'pending_review':
        return {
          title: "Under Review",
          description: "Your application is being reviewed by our team. We'll get back to you within 24-48 hours.",
          icon: <Clock className="w-8 h-8 text-yellow-500" />,
          color: "bg-yellow-100 text-yellow-800",
          action: null
        };
      case 'approved':
        return {
          title: "Congratulations! You're Approved",
          description: "Welcome to the Vybe creator community! You can now access your creator dashboard.",
          icon: <CheckCircle className="w-8 h-8 text-green-500" />,
          color: "bg-green-100 text-green-800",
          action: "Go to Dashboard"
        };
      case 'rejected':
        return {
          title: "Application Not Approved",
          description: "Unfortunately, your application wasn't approved at this time. See details below.",
          icon: <XCircle className="w-8 h-8 text-red-500" />,
          color: "bg-red-100 text-red-800",
          action: "Reapply"
        };
      default:
        return {
          title: "Unknown Status",
          description: "Please contact support for assistance.",
          icon: <AlertCircle className="w-8 h-8 text-gray-500" />,
          color: "bg-gray-100 text-gray-800",
          action: null
        };
    }
  };

  const handleAction = () => {
    if (!status) return;

    switch (status.status) {
      case 'not_started':
      case 'pending':
      case 'id_confirmed':
        router.push('/creator/apply');
        break;
      case 'approved':
        router.push('/creator/dashboard');
        break;
      case 'rejected':
        if (status.canReapply) {
          router.push('/creator/apply');
        } else {
          alert("You can reapply in 30 days from your last application.");
        }
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your application status...</p>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Failed to load application status.</p>
          <Button onClick={fetchStatus} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(status.status);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Creator Application Status
          </h1>
          <p className="text-muted-foreground">
            Track your progress to becoming a Vybe creator
          </p>
        </div>

        {/* Status Card */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="mb-6">
                {statusInfo.icon}
              </div>
              
              <Badge className={`mb-4 ${statusInfo.color}`}>
                {statusInfo.title}
              </Badge>
              
              <p className="text-lg text-muted-foreground mb-6">
                {statusInfo.description}
              </p>

              {statusInfo.action && (
                <Button 
                  onClick={handleAction}
                  size="lg"
                  disabled={status.status === 'rejected' && !status.canReapply}
                >
                  {statusInfo.action}
                </Button>
              )}

              {status.status === 'rejected' && !status.canReapply && (
                <p className="text-sm text-muted-foreground mt-4">
                  You can reapply in 30 days from your last application.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Progress Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Application Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Step 1: Document Verification */}
              <div className="flex items-center space-x-4">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  ['id_confirmed', 'pending_review', 'approved'].includes(status.status)
                    ? 'bg-green-500 text-white'
                    : status.status === 'pending'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {['id_confirmed', 'pending_review', 'approved'].includes(status.status) ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Document Verification</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload ID document and selfie for identity verification
                  </p>
                </div>
                {status.verification?.aiScore && (
                  <Badge variant="outline">
                    AI Score: {Math.round(status.verification.aiScore * 100)}%
                  </Badge>
                )}
              </div>

              {/* Step 2: Application Form */}
              <div className="flex items-center space-x-4">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  ['pending_review', 'approved'].includes(status.status)
                    ? 'bg-green-500 text-white'
                    : status.status === 'id_confirmed'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {['pending_review', 'approved'].includes(status.status) ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Application Form</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete your creator profile and application details
                  </p>
                </div>
              </div>

              {/* Step 3: Review */}
              <div className="flex items-center space-x-4">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  status.status === 'approved'
                    ? 'bg-green-500 text-white'
                    : status.status === 'rejected'
                    ? 'bg-red-500 text-white'
                    : status.status === 'pending_review'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {status.status === 'approved' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : status.status === 'rejected' ? (
                    <XCircle className="w-4 h-4" />
                  ) : (
                    <UserCheck className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Team Review</h3>
                  <p className="text-sm text-muted-foreground">
                    Our team reviews your application (24-48 hours)
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Review Details */}
        {(status.verification?.reviewNotes || status.verification?.rejectionReason) && (
          <Card>
            <CardHeader>
              <CardTitle>Review Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {status.verification.reviewNotes && (
                <div>
                  <h4 className="font-medium mb-2">Review Notes</h4>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                    {status.verification.reviewNotes}
                  </p>
                </div>
              )}
              
              {status.verification.rejectionReason && (
                <div>
                  <h4 className="font-medium mb-2 text-red-600">Rejection Reason</h4>
                  <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950 p-3 rounded-lg">
                    {status.verification.rejectionReason}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Need Help?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              If you have questions about your application or need assistance, don&apos;t hesitate to reach out to our support team.
            </p>
            <Button variant="outline">
              <Mail className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}