import { lazy, Suspense, type ComponentType } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SavedListingsProvider } from "@/contexts/SavedListingsContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { FeatureFlagsProvider } from "@/contexts/FeatureFlagsContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Toaster } from "@/components/ui/sonner";
import { MainLayout } from "@/polymet/layouts/main-layout";
import { HomePage } from "@/polymet/pages/home";
import { BusinessListings } from "@/polymet/pages/business-listings";
import { FranchiseListings } from "@/polymet/pages/franchise-listings";
import { BusinessDetail } from "@/polymet/pages/business-detail";
import { FranchiseDetail } from "@/polymet/pages/franchise-detail";
import { FranchiseLocationsPage } from "@/polymet/pages/franchise-locations";
import { AboutPage } from "@/polymet/pages/about";
import { ContactPage } from "@/polymet/pages/contact";
import { LoginPage } from "@/pages/auth/login";
import { SignUpPage } from "@/pages/auth/signup";
import { ForgotPasswordPage } from "@/pages/auth/forgot-password";
import { ResetPasswordPage } from "@/pages/auth/reset-password";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AdminRouteGuard } from "@/components/auth/admin-route-guard";
import { BannedAccountGate } from "@/components/auth/banned-account-gate";
import { FinancingComingSoonPage } from "@/polymet/pages/financing-coming-soon";
import { NotFoundPage } from "@/pages/404";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { IndustryIntelligencePage } from "@/polymet/pages/industry-intelligence";
import { IndustryDetailPage } from "@/polymet/pages/industry-detail";
import { WebsiteSchema } from "@/components/structured-data";
import { PrivacyPolicyPage } from "@/polymet/pages/privacy-policy";
import { TermsOfServicePage } from "@/polymet/pages/terms-of-service";
import { RefundPolicyPage } from "@/polymet/pages/refund-policy";
import { DisclaimerPage } from "@/polymet/pages/disclaimer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { HelpCenterPage } from "@/polymet/pages/help-center";
import { SmartSearchPage } from "@/polymet/pages/smart-search";
import { FranchiseMatchPage } from "@/polymet/pages/franchise-match";

function lazyExport<M extends Record<string, ComponentType<any>>>(
  loader: () => Promise<M>,
  name: keyof M
) {
  return lazy(() => loader().then((mod) => ({ default: mod[name] })));
}

const FranchiseMapDiscoveryPage = lazyExport(() => import("@/polymet/pages/franchise-map-discovery"), "FranchiseMapDiscoveryPage");
const ApiDocsPage = lazyExport(() => import("@/polymet/pages/api-docs"), "ApiDocsPage");
const BusinessValuationPage = lazyExport(() => import("@/polymet/pages/business-valuation"), "BusinessValuationPage");
const SellerAnalyticsPage = lazyExport(() => import("@/polymet/pages/seller-analytics"), "SellerAnalyticsPage");
const ReportGeneratorPage = lazyExport(() => import("@/polymet/pages/report-generator"), "ReportGeneratorPage");
const DealRoomPage = lazyExport(() => import("@/polymet/pages/deal-room"), "DealRoomPage");
const ListingOptimizerPage = lazyExport(() => import("@/polymet/pages/listing-optimizer"), "ListingOptimizerPage");
const NDAManagementPage = lazyExport(() => import("@/polymet/pages/nda-management"), "NDAManagementPage");
const AdminLayout = lazyExport(() => import("@/polymet/layouts/admin-layout"), "AdminLayout");
const AdminDashboard = lazyExport(() => import("@/polymet/pages/admin/admin-dashboard"), "AdminDashboard");
const AdminUsers = lazyExport(() => import("@/polymet/pages/admin/admin-users"), "AdminUsers");
const AdminUserDetail = lazyExport(() => import("@/polymet/pages/admin/admin-user-detail"), "AdminUserDetail");
const AdminListings = lazyExport(() => import("@/polymet/pages/admin/admin-listings"), "AdminListings");
const AdminListingDetail = lazyExport(() => import("@/polymet/pages/admin/admin-listing-detail"), "AdminListingDetail");
const AdminDocuments = lazyExport(() => import("@/polymet/pages/admin/admin-documents"), "AdminDocuments");
const AdminAnalytics = lazyExport(() => import("@/polymet/pages/admin/admin-analytics"), "AdminAnalytics");
const AdminFraudAlerts = lazyExport(() => import("@/polymet/pages/admin/admin-fraud-alerts"), "AdminFraudAlerts");
const AdminContentManagement = lazyExport(() => import("@/polymet/pages/admin/admin-content"), "AdminContentManagement");
const AdminSettings = lazyExport(() => import("@/polymet/pages/admin/admin-settings"), "AdminSettings");
const AdminFeatureFlags = lazyExport(() => import("@/polymet/pages/admin/admin-feature-flags"), "AdminFeatureFlags");
const AdminVerification = lazyExport(() => import("@/polymet/pages/admin/admin-verification"), "AdminVerification");
const AdvisorLayout = lazyExport(() => import("@/polymet/layouts/advisor-layout"), "AdvisorLayout");
const AdvisorDashboard = lazyExport(() => import("@/polymet/pages/advisor/advisor-dashboard"), "AdvisorDashboard");
const AdvisorClients = lazyExport(() => import("@/polymet/pages/advisor/advisor-clients"), "AdvisorClients");
const AdvisorDeals = lazyExport(() => import("@/polymet/pages/advisor/advisor-deals"), "AdvisorDeals");
const AdvisorCommissions = lazyExport(() => import("@/polymet/pages/advisor/advisor-commissions"), "AdvisorCommissions");
const ClientManagementPage = lazyExport(() => import("@/polymet/pages/client-management"), "ClientManagementPage");
const DealPipelinePage = lazyExport(() => import("@/polymet/pages/deal-pipeline"), "DealPipelinePage");
const CommissionTrackingPage = lazyExport(() => import("@/polymet/pages/commission-tracking"), "CommissionTrackingPage");
const LeadManagementPage = lazyExport(() => import("@/polymet/pages/lead-management"), "LeadManagementPage");
const PipelineCandidatePage = lazyExport(() => import("@/polymet/pages/pipeline-candidate"), "PipelineCandidatePage");
const AddBusinessListingPage = lazyExport(() => import("@/polymet/pages/add-business-listing"), "AddBusinessListingPage");
const EditBusinessListingPage = lazyExport(() => import("@/polymet/pages/edit-business-listing"), "EditBusinessListingPage");
const AddFranchiseListingPage = lazyExport(() => import("@/polymet/pages/add-franchise-listing"), "AddFranchiseListingPage");
const MessagesPage = lazyExport(() => import("@/polymet/pages/messages"), "MessagesPage");
const DashboardPage = lazyExport(() => import("@/polymet/pages/dashboard/overview"), "DashboardPage");
const ProfilePage = lazyExport(() => import("@/polymet/pages/profile"), "ProfilePage");
const ProfileEditPage = lazyExport(() => import("@/polymet/pages/profile-edit"), "ProfileEditPage");
const ProfileDocumentsPage = lazyExport(() => import("@/polymet/pages/profile-documents"), "ProfileDocumentsPage");
const ProfileSettingsPage = lazyExport(() => import("@/polymet/pages/profile-settings"), "ProfileSettingsPage");
const ProfileSettingsEnhancedPage = lazyExport(() => import("@/polymet/pages/profile-settings-enhanced"), "ProfileSettingsEnhancedPage");
const MyListingsPage = lazyExport(() => import("@/polymet/pages/my-listings"), "MyListingsPage");
const SavedListingsPage = lazyExport(() => import("@/polymet/pages/saved-listings"), "SavedListingsPage");
const NotificationsPage = lazyExport(() => import("@/polymet/pages/notifications"), "NotificationsPage");
const OnboardingPage = lazyExport(() => import("@/pages/onboarding"), "OnboardingPage");
const ProfileSetupPage = lazyExport(() => import("@/polymet/pages/profile-setup"), "ProfileSetupPage");
const FranchiseApplicationPage = lazyExport(() => import("@/polymet/pages/franchise-application"), "FranchiseApplicationPage");
const MyApplicationsPage = lazyExport(() => import("@/polymet/pages/my-applications"), "MyApplicationsPage");
const MyApplicationDetailPage = lazyExport(() => import("@/polymet/pages/my-application-detail"), "MyApplicationDetailPage");
const MyEnquiriesPage = lazyExport(() => import("@/polymet/pages/my-enquiries"), "MyEnquiriesPage");
const ListingSubmittedPage = lazyExport(() => import("@/polymet/pages/listing-submitted"), "ListingSubmittedPage");
const FranchisorApplicationsPage = lazyExport(() => import("@/polymet/pages/franchisor-applications"), "FranchisorApplicationsPage");
const BuyerMandatePage = lazyExport(() => import("@/polymet/pages/buyer-mandate"), "BuyerMandatePage");

export default function BizSearchApp() {
  return (
    <ThemeProvider>
      <FeatureFlagsProvider>
        <Router>
          <ErrorBoundary>
            <AuthProvider>
              <BannedAccountGate>
              <SavedListingsProvider>
                <NotificationsProvider>
                  <ScrollToTop />
                  <WebsiteSchema />
                  <Suspense fallback={<div className="min-h-[40vh] bg-background" />}>
                  <Routes>
                    {/* Homepage */}
                    <Route
                      path="/"
                      element={
                        <MainLayout>
                          <HomePage />
                        </MainLayout>
                      }
                    />

                    {/* Business Listings */}
                    <Route
                      path="/businesses"
                      element={
                        <MainLayout>
                          <BusinessListings />
                        </MainLayout>
                      }
                    />

                    {/* Franchise Listings */}
                    <Route
                      path="/franchises"
                      element={
                        <MainLayout>
                          <FranchiseListings />
                        </MainLayout>
                      }
                    />

                    {/* Business Detail */}
                    <Route
                      path="/business/:id"
                      element={
                        <MainLayout>
                          <BusinessDetail />
                        </MainLayout>
                      }
                    />

                    {/* Franchise Detail */}
                    <Route
                      path="/franchise/:id"
                      element={
                        <MainLayout>
                          <FranchiseDetail />
                        </MainLayout>
                      }
                    />

                    {/* Franchise Locations */}
                    <Route
                      path="/franchise/:id/locations"
                      element={
                        <MainLayout>
                          <FranchiseLocationsPage />
                        </MainLayout>
                      }
                    />

                    {/* Franchise Map Discovery */}
                    <Route
                      path="/franchise-map"
                      element={
                        <MainLayout>
                          <FranchiseMapDiscoveryPage />
                        </MainLayout>
                      }
                    />

                    {/* About Page */}
                    <Route
                      path="/about"
                      element={
                        <MainLayout>
                          <AboutPage />
                        </MainLayout>
                      }
                    />

                    {/* Contact Page */}
                    <Route
                      path="/contact"
                      element={
                        <MainLayout>
                          <ContactPage />
                        </MainLayout>
                      }
                    />

                    {/* Privacy Policy */}
                    <Route
                      path="/privacy"
                      element={
                        <MainLayout>
                          <PrivacyPolicyPage />
                        </MainLayout>
                      }
                    />

                    {/* Terms of Service */}
                    <Route
                      path="/terms"
                      element={
                        <MainLayout>
                          <TermsOfServicePage />
                        </MainLayout>
                      }
                    />

                    {/* Refund Policy */}
                    <Route
                      path="/refund-policy"
                      element={
                        <MainLayout>
                          <RefundPolicyPage />
                        </MainLayout>
                      }
                    />

                    {/* Disclaimer */}
                    <Route
                      path="/disclaimer"
                      element={
                        <MainLayout>
                          <DisclaimerPage />
                        </MainLayout>
                      }
                    />

                    {/* Help Center */}
                    <Route
                      path="/help"
                      element={
                        <MainLayout>
                          <HelpCenterPage />
                        </MainLayout>
                      }
                    />

                    {/* Industry Intelligence */}
                    <Route
                      path="/industries"
                      element={
                        <MainLayout>
                          <IndustryIntelligencePage />
                        </MainLayout>
                      }
                    />
                    <Route
                      path="/industry/:slug"
                      element={
                        <MainLayout>
                          <IndustryDetailPage />
                        </MainLayout>
                      }
                    />

                    {/* API Documentation */}
                    <Route path="/api/docs" element={<Navigate to="/docs" replace />} />
                    <Route
                      path="/docs"
                      element={
                        <ApiDocsPage />
                      }
                    />

                    {/* Smart Search */}
                    <Route
                      path="/smart-search"
                      element={
                        <MainLayout>
                          <SmartSearchPage />
                        </MainLayout>
                      }
                    />

                    <Route
                      path="/match"
                      element={
                        <MainLayout>
                          <FranchiseMatchPage />
                        </MainLayout>
                      }
                    />

                    {/* Authentication Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignUpPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />

                    {/* Onboarding Route - Protected */}
                    <Route
                      path="/onboarding"
                      element={
                        <ProtectedRoute>
                          <OnboardingPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Profile Setup Route - Protected but allows profile missing */}
                    <Route
                      path="/profile/setup"
                      element={
                        <ProtectedRoute>
                          <ProfileSetupPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Dashboard Route */}
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <MainLayout>
                            <DashboardPage />
                          </MainLayout>
                        </ProtectedRoute>
                      }
                    />

                    {/* Profile Routes - specific ID gets the public profile view */}
                    <Route
                      path="/profile/:userId"
                      element={
                        <ProtectedRoute>
                          <MainLayout>
                            <ProfilePage />
                          </MainLayout>
                        </ProtectedRoute>
                      }
                    />

                    {/* Base /profile redirects to Dashboard (Owner View) */}
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <MainLayout>
                            <DashboardPage />
                          </MainLayout>
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/profile/edit"
                      element={
                        <ProtectedRoute>
                          <MainLayout>
                            <ProfileEditPage />
                          </MainLayout>
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/profile/documents"
                      element={
                        <ProtectedRoute>
                          <MainLayout>
                            <ProfileDocumentsPage />
                          </MainLayout>
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/profile/settings"
                      element={
                        <ProtectedRoute>
                          <MainLayout>
                            <ProfileSettingsEnhancedPage />
                          </MainLayout>
                        </ProtectedRoute>
                      }
                    />

                    {/* Legacy settings page - can be removed if not needed */}
                    <Route
                      path="/profile/settings/legacy"
                      element={
                        <ProtectedRoute>
                          <MainLayout>
                            <ProfileSettingsPage />
                          </MainLayout>
                        </ProtectedRoute>
                      }
                    />

                    {/* My Listings - Protected */}
                    <Route
                      path="/my-listings"
                      element={
                        <ProtectedRoute requiredRoles={['seller', 'franchisor', 'broker']}>
                          <MainLayout>
                            <MyListingsPage />
                          </MainLayout>
                        </ProtectedRoute>
                      }
                    />

                    {/* Saved Listings - Protected */}
                    <Route
                      path="/saved"
                      element={
                        <ProtectedRoute>
                          <MainLayout>
                            <SavedListingsPage />
                          </MainLayout>
                        </ProtectedRoute>
                      }
                    />

                    {/* Notifications - Protected */}
                    <Route
                      path="/notifications"
                      element={
                        <ProtectedRoute>
                          <MainLayout>
                            <NotificationsPage />
                          </MainLayout>
                        </ProtectedRoute>
                      }
                    />

                    {/* Additional Routes */}
                    <Route path="/search" element={<Navigate to="/businesses" replace />} />

                    {/* Add Business Listing - Protected */}
                    <Route
                      path="/add-business-listing"
                      element={
                        <ProtectedRoute requiredRoles={['seller', 'broker']}>
                          <MainLayout>
                            <AddBusinessListingPage />
                          </MainLayout>
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/business/edit/:businessId"
                      element={
                        <ProtectedRoute requiredRoles={['seller', 'broker']}>
                          <MainLayout>
                            <EditBusinessListingPage />
                          </MainLayout>
                        </ProtectedRoute>
                      }
                    />

                    {/* Add Franchise Listing - Protected */}
                    <Route
                      path="/add-franchise-listing"
                      element={
                        <ProtectedRoute requiredRole="franchisor">
                          <MainLayout>
                            <AddFranchiseListingPage />
                          </MainLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/franchise/edit/:franchiseId"
                      element={
                        <ProtectedRoute requiredRole="franchisor">
                          <MainLayout>
                            <AddFranchiseListingPage />
                          </MainLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/listing-submitted"
                      element={
                        <ProtectedRoute requiredRoles={['franchisor', 'seller']}>
                          <MainLayout>
                            <ListingSubmittedPage />
                          </MainLayout>
                        </ProtectedRoute>
                      }
                    />

                    {/* Admin Dashboard Routes */}
                    <Route
                      path="/admin"
                      element={
                        <AdminRouteGuard>
                          <AdminLayout />
                        </AdminRouteGuard>
                      }
                    >
                      <Route index element={<AdminDashboard />} />
                      <Route path="users" element={<AdminUsers />} />
                      <Route path="users/:id" element={<AdminUserDetail />} />
                      <Route path="listings" element={<AdminListings />} />
                      <Route path="listings/:type/:id" element={<AdminListingDetail />} />
                      <Route path="documents" element={<AdminDocuments />} />
                      <Route path="analytics" element={<AdminAnalytics />} />
                      <Route path="fraud" element={<AdminFraudAlerts />} />
                      <Route path="content" element={<AdminContentManagement />} />
                      <Route path="settings" element={<AdminSettings />} />
                      <Route path="feature-flags" element={<AdminFeatureFlags />} />
                      <Route path="verification" element={<AdminVerification />} />
                    </Route>

                    {/* Franchise Application - Protected */}
                    <Route
                      path="/franchise/:franchiseId/apply"
                      element={
                        <ProtectedRoute>
                          <MainLayout>
                            <FranchiseApplicationPage />
                          </MainLayout>
                        </ProtectedRoute>
                      }
                    />

                    {/* My Applications - Protected */}
                    <Route
                      path="/my-applications"
                      element={
                        <ProtectedRoute requiredRoles={['buyer', 'franchisee']}>
                          <MainLayout>
                            <MyApplicationsPage />
                          </MainLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/my-applications/:id"
                      element={
                        <ProtectedRoute requiredRoles={['buyer', 'franchisee']}>
                          <MainLayout>
                            <MyApplicationDetailPage />
                          </MainLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/my-enquiries"
                      element={
                        <ProtectedRoute requiredRoles={['buyer', 'franchisee']}>
                          <MainLayout>
                            <MyEnquiriesPage />
                          </MainLayout>
                        </ProtectedRoute>
                      }
                    />

                    {/* Franchisor Applications Review - Protected */}
                    <Route
                      path="/franchisor/applications"
                      element={
                        <ProtectedRoute requiredRole="franchisor">
                          <MainLayout>
                            <FranchisorApplicationsPage />
                          </MainLayout>
                        </ProtectedRoute>
                      }
                    />

                    {/* Financing Options */}
                    <Route
                      path="/financing"
                      element={
                        <MainLayout>
                          <FinancingComingSoonPage />
                        </MainLayout>
                      }
                    />

                    {/* Financing Coming Soon */}
                    <Route
                      path="/financing-options"
                      element={
                        <MainLayout>
                          <FinancingComingSoonPage />
                        </MainLayout>
                      }
                    />

                    {/* Messages - Protected */}
                    <Route
                      path="/messages"
                      element={
                        <ProtectedRoute>
                          <MainLayout>
                            <MessagesPage />
                          </MainLayout>
                        </ProtectedRoute>
                      }
                    />

                    {/* Business Seller Routes - Protected */}
                    <Route
                      path="/business-valuation"
                      element={
                        <MainLayout>
                          <BusinessValuationPage />
                        </MainLayout>
                      }
                    />
                    <Route
                      path="/buyer-inquiries"
                      element={
                        <ProtectedRoute requiredRoles={['buyer', 'franchisee']}>
                          <MainLayout>
                            <MyEnquiriesPage />
                          </MainLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/nda-management"
                      element={
                        <ProtectedRoute requiredRoles={['seller', 'buyer', 'broker']}>
                          <MainLayout>
                            <NDAManagementPage />
                          </MainLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/deal-room/:businessId"
                      element={
                        <ProtectedRoute requiredRoles={['seller', 'buyer', 'broker', 'advisor']}>
                          <MainLayout>
                            <DealRoomPage />
                          </MainLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/seller-analytics"
                      element={
                        <ProtectedRoute requiredRole="seller">
                          <MainLayout>
                            <SellerAnalyticsPage />
                          </MainLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/listing-optimizer/:businessId"
                      element={
                        <ProtectedRoute requiredRole="seller">
                          <MainLayout>
                            <ListingOptimizerPage />
                          </MainLayout>
                        </ProtectedRoute>
                      }
                    />

                    {/* Buyer Routes - Protected */}
                    <Route
                      path="/buyer/mandate"
                      element={
                        <ProtectedRoute requiredRoles={['buyer', 'franchisee']}>
                          <MainLayout>
                            <BuyerMandatePage />
                          </MainLayout>
                        </ProtectedRoute>
                      }
                    />

                    {/* Advisor/Broker Dashboard Routes - Protected */}
                    <Route
                      path="/clients"
                      element={
                        <ProtectedRoute requiredRoles={['advisor', 'broker']}>
                          <MainLayout>
                            <ClientManagementPage />
                          </MainLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/deal-pipeline"
                      element={
                        <ProtectedRoute requiredRoles={['advisor', 'broker']}>
                          <MainLayout>
                            <DealPipelinePage />
                          </MainLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/commissions"
                      element={
                        <ProtectedRoute requiredRoles={['advisor', 'broker']}>
                          <MainLayout>
                            <CommissionTrackingPage />
                          </MainLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/advisors" element={<Navigate to="/franchises" replace />} />
                    <Route
                      path="/report-generator"
                      element={
                        <ProtectedRoute requiredRoles={['advisor', 'broker']}>
                          <MainLayout>
                            <ReportGeneratorPage />
                          </MainLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/leads"
                      element={
                        <ProtectedRoute requiredRoles={['franchisor', 'seller']}>
                          <MainLayout>
                            <LeadManagementPage />
                          </MainLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/pipeline"
                      element={
                        <ProtectedRoute requiredRoles={['franchisor', 'seller']}>
                          <MainLayout>
                            <LeadManagementPage />
                          </MainLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/pipeline/candidate/:inquiryId"
                      element={
                        <ProtectedRoute requiredRoles={['franchisor', 'seller']}>
                          <MainLayout>
                            <PipelineCandidatePage />
                          </MainLayout>
                        </ProtectedRoute>
                      }
                    />

                    {/* Advisor Dashboard - Protected */}
                    <Route
                      path="/advisor"
                      element={
                        <ProtectedRoute requiredRoles={['advisor', 'broker']}>
                          <AdvisorLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route path="dashboard" element={<AdvisorDashboard />} />
                      <Route path="clients" element={<AdvisorClients />} />
                      <Route path="deals" element={<AdvisorDeals />} />
                      <Route path="commissions" element={<AdvisorCommissions />} />
                      <Route index element={<AdvisorDashboard />} />
                    </Route>

                    {/* Catch-all route - 404 page */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                  </Suspense>
                  <Toaster />
                </NotificationsProvider>
              </SavedListingsProvider>
              </BannedAccountGate>
            </AuthProvider>
          </ErrorBoundary>
        </Router>
      </FeatureFlagsProvider>
    </ThemeProvider>
  );
}
