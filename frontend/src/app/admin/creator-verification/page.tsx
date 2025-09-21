"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MarketingSidebar from "@/components/marketing-sidebar";
import {
  UserCheck,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Camera,
  Mail,
  Search,
  Filter,
  Download,
  MessageSquare,
} from "lucide-react";

interface AdminInfo {
  name?: string;
  role?: string;
  email?: string;
  lastLoginAt?: string;
}

interface CreatorApplication {
  id: number;
  userId: number;
  user: {
    id: number;
    name: string;
    email: string;
    createdAt: string;
  };
  verificationStatus: 'pending' | 'id_confirmed' | 'pending_review' | 'approved' | 'rejected';
  idDocumentUrl: string;
  idDocumentType: 'passport' | 'id_card' | 'drivers_license';
  selfieUrl: string;
  aiVerificationScore: number;
  applicationData: {
    personalInfo: {
      phoneNumber: string;
      instagramHandle: string;
      dateOfBirth: string;
      country: string;
    };
    creatorProfile: {
      looproomCategory: string;
      looproomDescription: string;
      contentFrequency: string;
      audienceSize: string;
      vybeGoals: string;
      signature: string;
    };
    submittedAt: string;
  };
  reviewNotes?: string;
  rejectionReason?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreatorVerificationStats {
  total: number;
  pending: number;
  pendingReview: number;
  approved: number;
  rejected: number;
  todaySubmissions: number;
}

function CreatorVerificationContent() {
  const router = useRouter();
  const [applications, setApplications] = useState<CreatorApplication[]>([]);
  const [stats, setStats] = useState<CreatorVerificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<CreatorApplication | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('marketingSidebarCollapsed');
      return saved === 'true';
    }
    return false;
  });
  const [sidebarMobile, setSidebarMobile] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return false;
  });

  const getContentOffset = () => {
    if (sidebarMobile) {
      return "ml-0";
    }
    return sidebarCollapsed ? "ml-16" : "ml-64";
  };

  const handleSidebarStateChange = (
    isCollapsed: boolean,
    isMobile: boolean
  ) => {
    setSidebarCollapsed(isCollapsed);
    setSidebarMobile(isMobile);
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    router.push("/admin/login");
  }, [router]);

  const fetchApplications = useCallback(async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
        }/admin/creator-verifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
          return;
        }
        throw new Error("Failed to fetch applications");
      }

      const result = await response.json();
      setApplications(result.data.applications);
      setStats(result.data.stats);
    } catch (error) {
      console.error("Applications fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [handleLogout]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const admin = localStorage.getItem("adminInfo");

    if (!token || !admin) {
      router.push("/admin/login");
      return;
    }

    const adminData = JSON.parse(admin);
    
    // Check if user has marketing access
    if (!['admin', 'super_admin', 'marketing'].includes(adminData.role)) {
      router.push("/admin/dashboard");
      return;
    }

    setAdminInfo(adminData);
    fetchApplications();
  }, [router, fetchApplications]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800"><Clock className="w-3 h-3 mr-1" />Pending Documents</Badge>;
      case 'id_confirmed':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><FileText className="w-3 h-3 mr-1" />Documents Verified</Badge>;
      case 'pending_review':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><AlertCircle className="w-3 h-3 mr-1" />Awaiting Review</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleApprove = async (applicationId: number) => {
    setIsReviewing(true);
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
        }/admin/creator-verifications/${applicationId}/approve`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reviewNotes: reviewNotes || "Application approved - meets all requirements.",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to approve application");
      }

      await fetchApplications();
      setSelectedApplication(null);
      setReviewNotes("");
      alert("Application approved successfully!");
    } catch (error) {
      console.error("Approval error:", error);
      alert("Failed to approve application. Please try again.");
    } finally {
      setIsReviewing(false);
    }
  };

  const handleReject = async (applicationId: number) => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }

    setIsReviewing(true);
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
        }/admin/creator-verifications/${applicationId}/reject`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rejectionReason,
            reviewNotes: reviewNotes || "Application rejected - see rejection reason.",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reject application");
      }

      await fetchApplications();
      setSelectedApplication(null);
      setReviewNotes("");
      setRejectionReason("");
      alert("Application rejected successfully.");
    } catch (error) {
      console.error("Rejection error:", error);
      alert("Failed to reject application. Please try again.");
    } finally {
      setIsReviewing(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.applicationData?.personalInfo?.instagramHandle || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || app.verificationStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading creator applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MarketingSidebar
        adminInfo={adminInfo}
        currentPage="creator-verification"
        onLogout={handleLogout}
        onSidebarStateChange={handleSidebarStateChange}
      />

      <div
        className={`${getContentOffset()} min-h-screen flex flex-col transition-all duration-300`}
      >
        <header className="bg-background border-b border-border px-4 md:px-6 py-4 sticky top-0 z-5">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h1
                className={`text-xl md:text-2xl font-bold text-foreground truncate ${
                  sidebarMobile ? "ml-12" : ""
                }`}
              >
                Creator Verification
              </h1>
              <p
                className={`text-sm text-muted-foreground truncate ${
                  sidebarMobile ? "ml-12" : ""
                }`}
              >
                Review and approve creator applications
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-6 md:mb-8">
            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <UserCheck className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
                  </div>
                  <div className="ml-3 md:ml-4 min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground">
                      Total Applications
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-foreground">
                      {stats?.total || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-yellow-500" />
                  </div>
                  <div className="ml-3 md:ml-4 min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground">
                      Pending Review
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-foreground">
                      {stats?.pendingReview || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
                  </div>
                  <div className="ml-3 md:ml-4 min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground">
                      Approved
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-foreground">
                      {stats?.approved || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
                    <XCircle className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
                  </div>
                  <div className="ml-3 md:ml-4 min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground">
                      Rejected
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-foreground">
                      {stats?.rejected || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 md:w-6 md:h-6 text-purple-500" />
                  </div>
                  <div className="ml-3 md:ml-4 min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground">
                      Today
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-foreground">
                      {stats?.todaySubmissions || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search by name, email, or Instagram handle..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="sm:w-48">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending_review">Pending Review</SelectItem>
                      <SelectItem value="id_confirmed">Documents Verified</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Applications List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Creator Applications ({filteredApplications.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredApplications.map((application) => (
                  <div
                    key={application.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-foreground truncate">
                          {application.user.name}
                        </h3>
                        {getStatusBadge(application.verificationStatus)}
                        {application.aiVerificationScore && (
                          <Badge variant="outline" className="text-xs">
                            AI Score: {Math.round(application.aiVerificationScore * 100)}%
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate mb-1">
                        {application.user.email}
                      </p>
                      {application.applicationData?.personalInfo?.instagramHandle && (
                        <p className="text-sm text-muted-foreground truncate mb-1">
                          @{application.applicationData.personalInfo.instagramHandle}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Applied: {formatDate(application.createdAt)}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedApplication(application)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center space-x-2">
                              <UserCheck className="w-5 h-5" />
                              <span>Creator Application Review</span>
                            </DialogTitle>
                          </DialogHeader>
                          
                          {selectedApplication && (
                            <div className="space-y-6">
                              {/* Application Header */}
                              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                                <div>
                                  <h3 className="font-semibold text-lg">{selectedApplication.user.name}</h3>
                                  <p className="text-muted-foreground">{selectedApplication.user.email}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Applied: {formatDate(selectedApplication.createdAt)}
                                  </p>
                                </div>
                                <div className="text-right">
                                  {getStatusBadge(selectedApplication.verificationStatus)}
                                  {selectedApplication.aiVerificationScore && (
                                    <div className="mt-2">
                                      <Badge variant="outline">
                                        AI Verification: {Math.round(selectedApplication.aiVerificationScore * 100)}%
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Documents Section */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="flex items-center text-base">
                                      <FileText className="w-4 h-4 mr-2" />
                                      ID Document ({selectedApplication.idDocumentType?.replace('_', ' ')})
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    {selectedApplication.idDocumentUrl ? (
                                      <div className="space-y-2">
                                        <img
                                          src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}${selectedApplication.idDocumentUrl}`}
                                          alt="ID Document"
                                          className="w-full h-48 object-cover rounded-lg border"
                                        />
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="w-full"
                                          onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}${selectedApplication.idDocumentUrl}`, '_blank')}
                                        >
                                          <Download className="w-4 h-4 mr-2" />
                                          View Full Size
                                        </Button>
                                      </div>
                                    ) : (
                                      <p className="text-muted-foreground">No document uploaded</p>
                                    )}
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardHeader>
                                    <CardTitle className="flex items-center text-base">
                                      <Camera className="w-4 h-4 mr-2" />
                                      Selfie Verification
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    {selectedApplication.selfieUrl ? (
                                      <div className="space-y-2">
                                        <img
                                          src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}${selectedApplication.selfieUrl}`}
                                          alt="Selfie"
                                          className="w-full h-48 object-cover rounded-lg border"
                                        />
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="w-full"
                                          onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}${selectedApplication.selfieUrl}`, '_blank')}
                                        >
                                          <Download className="w-4 h-4 mr-2" />
                                          View Full Size
                                        </Button>
                                      </div>
                                    ) : (
                                      <p className="text-muted-foreground">No selfie uploaded</p>
                                    )}
                                  </CardContent>
                                </Card>
                              </div>

                              {/* Application Data */}
                              {selectedApplication.applicationData && (
                                <div className="space-y-4">
                                  <h3 className="text-lg font-semibold">Application Details</h3>
                                  
                                  {/* Personal Information */}
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-base">Personal Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                                          <p className="text-sm">{selectedApplication.applicationData.personalInfo?.phoneNumber || 'Not provided'}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-muted-foreground">Instagram Handle</label>
                                          <p className="text-sm">@{selectedApplication.applicationData.personalInfo?.instagramHandle || 'Not provided'}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                                          <p className="text-sm">{selectedApplication.applicationData.personalInfo?.dateOfBirth || 'Not provided'}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-muted-foreground">Country</label>
                                          <p className="text-sm">{selectedApplication.applicationData.personalInfo?.country || 'Not provided'}</p>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>

                                  {/* Creator Profile */}
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-base">Creator Profile</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                      <div>
                                        <label className="text-sm font-medium text-muted-foreground">Looproom Category</label>
                                        <p className="text-sm mt-1">{selectedApplication.applicationData.creatorProfile?.looproomCategory || 'Not provided'}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-muted-foreground">Looproom Description</label>
                                        <p className="text-sm mt-1 whitespace-pre-wrap">{selectedApplication.applicationData.creatorProfile?.looproomDescription || 'Not provided'}</p>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm font-medium text-muted-foreground">Content Frequency</label>
                                          <p className="text-sm mt-1">{selectedApplication.applicationData.creatorProfile?.contentFrequency || 'Not provided'}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-muted-foreground">Audience Size</label>
                                          <p className="text-sm mt-1">{selectedApplication.applicationData.creatorProfile?.audienceSize || 'Not provided'}</p>
                                        </div>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-muted-foreground">Vybe Goals</label>
                                        <p className="text-sm mt-1 whitespace-pre-wrap">{selectedApplication.applicationData.creatorProfile?.vybeGoals || 'Not provided'}</p>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                              )}

                              {/* Review Section */}
                              {selectedApplication.verificationStatus === 'pending_review' && (
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-base">Review Application</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">Review Notes</label>
                                      <Textarea
                                        placeholder="Add your review notes here..."
                                        value={reviewNotes}
                                        onChange={(e) => setReviewNotes(e.target.value)}
                                        className="mt-1"
                                      />
                                    </div>
                                    
                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">Rejection Reason (if rejecting)</label>
                                      <Textarea
                                        placeholder="Provide a clear reason for rejection..."
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        className="mt-1"
                                      />
                                    </div>

                                    <div className="flex space-x-3 pt-4">
                                      <Button
                                        onClick={() => handleApprove(selectedApplication.id)}
                                        disabled={isReviewing}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        {isReviewing ? "Processing..." : "Approve Application"}
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        onClick={() => handleReject(selectedApplication.id)}
                                        disabled={isReviewing || !rejectionReason.trim()}
                                      >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        {isReviewing ? "Processing..." : "Reject Application"}
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              )}

                              {/* Previous Review */}
                              {(selectedApplication.reviewNotes || selectedApplication.rejectionReason) && (
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-base">Previous Review</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-2">
                                    {selectedApplication.reviewNotes && (
                                      <div>
                                        <label className="text-sm font-medium text-muted-foreground">Review Notes</label>
                                        <p className="text-sm mt-1 whitespace-pre-wrap">{selectedApplication.reviewNotes}</p>
                                      </div>
                                    )}
                                    {selectedApplication.rejectionReason && (
                                      <div>
                                        <label className="text-sm font-medium text-muted-foreground">Rejection Reason</label>
                                        <p className="text-sm mt-1 whitespace-pre-wrap text-red-600">{selectedApplication.rejectionReason}</p>
                                      </div>
                                    )}
                                    {selectedApplication.reviewedAt && (
                                      <p className="text-xs text-muted-foreground">
                                        Reviewed: {formatDate(selectedApplication.reviewedAt)}
                                      </p>
                                    )}
                                  </CardContent>
                                </Card>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}

                {filteredApplications.length === 0 && (
                  <div className="text-center py-8">
                    <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {searchTerm || statusFilter !== "all" 
                        ? "No applications match your filters." 
                        : "No creator applications yet."}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

export default function CreatorVerificationDashboard() {
  return <CreatorVerificationContent />;
}