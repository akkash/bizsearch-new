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
import { SignUpPage } from "@/pages/auth/signup";
import { ForgotPasswordPage } from "@/pages/auth/forgot-password";
import { ResetPasswordPage } from "@/pages/auth/reset-password";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function BizSearchApp() {
  return (
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
        <Route path="/signup" element={<SignUpPage />} />
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

        {/* Catch-all route - redirect to home */}
        <Route
          path="*"
          element={
            <MainLayout>
              <HomePage />
            </MainLayout>
          }
        />
        </Routes>
        <Toaster />
      </Router>
      </NotificationsProvider>
      </SavedListingsProvider>
    </AuthProvider>
  );
}
