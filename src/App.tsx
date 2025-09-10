import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import { AddBusinessListingPage } from "@/polymet/pages/add-business-listing";
import { AddFranchiseListingPage } from "@/polymet/pages/add-franchise-listing";

export default function BizSearchApp() {
  return (
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

        {/* Profile Routes */}
        <Route
          path="/profile"
          element={
            <MainLayout>
              <ProfilePage />
            </MainLayout>
          }
        />

        <Route
          path="/profile/edit"
          element={
            <MainLayout>
              <ProfileEditPage />
            </MainLayout>
          }
        />

        <Route
          path="/profile/documents"
          element={
            <MainLayout>
              <ProfileDocumentsPage />
            </MainLayout>
          }
        />

        <Route
          path="/profile/settings"
          element={
            <MainLayout>
              <ProfileSettingsPage />
            </MainLayout>
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

        {/* Add Business Listing */}
        <Route
          path="/add-business-listing"
          element={
            <MainLayout>
              <AddBusinessListingPage />
            </MainLayout>
          }
        />

        {/* Add Franchise Listing */}
        <Route
          path="/add-franchise-listing"
          element={
            <MainLayout>
              <AddFranchiseListingPage />
            </MainLayout>
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
    </Router>
  );
}
