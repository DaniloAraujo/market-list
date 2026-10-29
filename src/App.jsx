import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthProvider from "@/auth/AuthProvider";
import { Toaster } from "@/components/ui/sonner";
import { API_ENABLED } from "@/lib/api";
import AuthCallbackPage from "@/pages/AuthCallbackPage";
import HomePage from "@/pages/HomePage";
import InvitePage from "@/pages/InvitePage";
import LoginPage from "@/pages/LoginPage";
import { ForgotPasswordPage, ResetPasswordPage } from "@/pages/PasswordPages";
import { PrivacyPage, TermsPage } from "@/pages/LegalPages";
import VerifyEmailPage from "@/pages/VerifyEmailPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/privacidade" element={<PrivacyPage />} />
          <Route path="/termos" element={<TermsPage />} />
          {/* Sem API configurada o app é só local: login e convites não existem */}
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
      <Toaster />
    </BrowserRouter>
  );
}
