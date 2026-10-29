import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthProvider from "@/auth/AuthProvider";
import InstallPrompt from "@/components/InstallPrompt";
import { Toaster } from "@/components/ui/sonner";
import { API_ENABLED } from "@/lib/api";
import AuthCallbackPage from "@/pages/AuthCallbackPage";
import HomePage from "@/pages/HomePage";
import InvitePage from "@/pages/InvitePage";
import LoginPage from "@/pages/LoginPage";
import { ForgotPasswordPage, ResetPasswordPage } from "@/pages/PasswordPages";
import { PrivacyPage, TermsPage } from "@/pages/LegalPages";
import ChartsScreen from "@/screens/ChartsScreen";
import ListScreen from "@/screens/ListScreen";
import ProfileScreen from "@/screens/ProfileScreen";
import VerifyEmailPage from "@/pages/VerifyEmailPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<HomePage />}>
            <Route index element={<ListScreen />} />
            <Route path="graficos" element={<ChartsScreen />} />
            <Route path="perfil" element={<ProfileScreen />} />
          </Route>
          <Route path="/privacidade" element={<PrivacyPage />} />
          <Route path="/termos" element={<TermsPage />} />
          {API_ENABLED && (
            <>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route path="/invite/:token" element={<InvitePage />} />
            </>
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
      <InstallPrompt />
      <Toaster />
    </BrowserRouter>
  );
}
