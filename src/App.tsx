import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SavedListingsProvider } from "@/contexts/SavedListingsContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { Toaster } from "@/components/ui/sonner";
import { MainLayout } from "@/polymet/layouts/main-layout";
import { HomePage } from "@/polymet/pages/home";
import { BusinessListings } from "@/polymet/pages/business-listings";
import { FranchiseListings } from "@/polymet/pages/franchise-listings";
import { BusinessDetail } from "@/polymet/pages/business-detail";
import { FranchiseDetail } from "@/polymet/pages/franchise-detail";
import { FranchiseLocationsPage } from "@/polymet/pages/franchise-locations";
import { FranchiseMapDiscoveryPage } from "@/polymet/pages/franchise-map-discovery";
import { AboutPage } from "@/polymet/pages/about";
import { ContactPage } from "@/polymet/pages/contact";
import { ProfilePage } from "@/polymet/pages/profile";
import { ProfileEditPage } from "@/polymet/pages/profile-edit";
import { ProfileDocumentsPage } from "@/polymet/pages/profile-documents";
import { ProfileSettingsPage } from "@/polymet/pages/profile-settings";
import { ProfileSettingsEnhancedPage } from "@/polymet/pages/profile-settings-enhanced";
import { AddBusinessListingPage } from "@/polymet/pages/add-business-listing";
import { AddFranchiseListingPage } from "@/polymet/pages/add-franchise-listing";
import { MyListingsPage } from "@/polymet/pages/my-listings";
import { SavedListingsPage } from "@/polymet/pages/saved-listings";
import { NotificationsPage } from "@/polymet/pages/notifications";
import { LoginPage } from "@/pages/auth/login";
import { PhoneLoginPage } from "@/pages/auth/phone-login";
import { SignUpPage } from "@/pages/auth/signup";
import PhoneSignUpPage from "@/pages/auth/phone-signup";
import { ForgotPasswordPage } from "@/pages/auth/forgot-password";
import { ResetPasswordPage } from "@/pages/auth/reset-password";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AdminRouteGuard } from "@/components/auth/admin-route-guard";
import { AdminLayout } from "@/polymet/layouts/admin-layout";
import { AdminDashboard } from "@/polymet/pages/admin/admin-dashboard";
import { AdminUsers } from "@/polymet/pages/admin/admin-users";
import { AdminUserDetail } from "@/polymet/pages/admin/admin-user-detail";
import { AdminListings } from "@/polymet/pages/admin/admin-listings";
import { AdminDocuments } from "@/polymet/pages/admin/admin-documents";
import { AdminAnalytics } from "@/polymet/pages/admin/admin-analytics";
import { AdminFraudAlerts } from "@/polymet/pages/admin/admin-fraud-alerts";
import { AdminContentManagement } from "@/polymet/pages/admin/admin-content";
import { AdminSettings } from "@/polymet/pages/admin/admin-settings";
import { FranchiseApplicationPage } from "@/polymet/pages/franchise-application";
import { MyApplicationsPage } from "@/polymet/pages/my-applications";
import { FinancingOptionsPage } from "@/polymet/pages/financing-options";
import { MessagesPage } from "@/polymet/pages/messages";
import { BusinessValuationPage } from "@/polymet/pages/business-valuation";
import { BuyerInquiriesPage } from "@/polymet/pages/buyer-inquiries";
import { NDAManagementPage } from "@/polymet/pages/nda-management";
import { DealRoomPage } from "@/polymet/pages/deal-room";
import { SellerAnalyticsPage } from "@/polymet/pages/seller-analytics";
import { ListingOptimizerPage } from "@/polymet/pages/listing-optimizer";
import { ClientManagementPage } from "@/polymet/pages/client-management";
import { DealPipelinePage } from "@/polymet/pages/deal-pipeline";
import { CommissionTrackingPage } from "@/polymet/pages/commission-tracking";
import { AdvisorDirectoryPage } from "@/polymet/pages/advisor-directory";
import { ReportGeneratorPage } from "@/polymet/pages/report-generator";
import { LeadManagementPage } from "@/polymet/pages/lead-management";
import { NotFoundPage } from "@/pages/404";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function BizSearchApp() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SavedListingsProvider>
          <NotificationsProvider>
            <Router>
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

                {/* Authentication Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/login/phone" element={<PhoneLoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/signup/phone" element={<PhoneSignUpPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                {/* Profile Routes - Protected */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <ProfilePage />
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
                    <ProtectedRoute>
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
                <Route
                  path="/search"
                  element={
                    <MainLayout>
                      <BusinessListings />
                    </MainLayout>
                  }
                />

                {/* Add Business Listing - Protected */}
                <Route
                  path="/add-business-listing"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <AddBusinessListingPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Add Franchise Listing - Protected */}
                <Route
                  path="/add-franchise-listing"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <AddFranchiseListingPage />
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
                  <Route path="documents" element={<AdminDocuments />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="fraud" element={<AdminFraudAlerts />} />
                  <Route path="content" element={<AdminContentManagement />} />
                  <Route path="settings" element={<AdminSettings />} />
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
                    <ProtectedRoute>
                      <MainLayout>
                        <MyApplicationsPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Financing Options */}
                <Route
                  path="/financing"
                  element={
                    <MainLayout>
                      <FinancingOptionsPage />
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
                    <ProtectedRoute>
                      <MainLayout>
                        <BuyerInquiriesPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/nda-management"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <NDAManagementPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/deal-room/:businessId"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <DealRoomPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/seller-analytics"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <SellerAnalyticsPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/listing-optimizer/:businessId"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <ListingOptimizerPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Advisor/Broker Dashboard Routes - Protected */}
                <Route
                  path="/clients"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <ClientManagementPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/deal-pipeline"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <DealPipelinePage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/commissions"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <CommissionTrackingPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/advisors"
                  element={
                    <MainLayout>
                      <AdvisorDirectoryPage />
                    </MainLayout>
                  }
                />
                <Route
                  path="/report-generator"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <ReportGeneratorPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/leads"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <LeadManagementPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all route - 404 page */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
              <Toaster />
            </Router>
          </NotificationsProvider>
        </SavedListingsProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
