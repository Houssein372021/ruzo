import { isAxiosError } from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { adminApi } from "../../api/admin";
import { AdminAuthPanel } from "../../components/admin/AdminAuthPanel";
import { useI18n } from "../../hooks/useI18n";
import { useAuthStore } from "../../store/authStore";

type PasswordForm = { email: string; password: string; confirmation: string };

export function AdminPasswordPage({ reset = false }: { reset?: boolean }) {
  const { t } = useI18n();
  const { hash } = useLocation();
  const token = new URLSearchParams(hash.slice(1)).get("token");
  const canReset = !!token && /^[A-Za-z0-9_-]{43}$/.test(token);
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const { register, handleSubmit, formState } = useForm<PasswordForm>();
  const [emailRequested, setEmailRequested] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async ({ email, password, confirmation }: PasswordForm) => {
    setError("");
    try {
      if (!reset) {
        await adminApi.forgotPassword(email);
        setEmailRequested(true);
      } else if (token) {
        if (!password.trim() || Array.from(password).length < 12 || new TextEncoder().encode(password).length > 72) {
          setError(t("adminPasswordRules"));
          return;
        }
        if (password !== confirmation) {
          setError(t("adminPasswordsMismatch"));
          return;
        }
        await adminApi.resetPassword(token, password);
        logout();
        navigate("/admin/login", { replace: true, state: { passwordReset: true } });
      }
    } catch (error) {
      const status = isAxiosError(error) ? error.response?.status : undefined;
      setError(t(reset && status === 400 ? "adminResetInvalid" : reset && status === 422 ? "adminPasswordRules" : "apiUnavailable"));
    }
  };

  return (
    <AdminAuthPanel
      title={t(reset ? "adminResetPassword" : "adminForgotPassword")}
      path={reset ? "/admin/reset-password" : "/admin/forgot-password"}
    >
      {emailRequested ? (
        <p className="admin-notice mt-4" role="status">{t("adminResetEmailSent")}</p>
      ) : reset && !canReset ? (
        <p className="admin-notice mt-4" role="alert">{t("adminResetInvalid")}</p>
      ) : (
        <form className="mt-5 grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          {reset ? (
            <>
              <label className="grid gap-1 text-sm">
                {t("adminNewPassword")}
                <input type="password" autoComplete="new-password" required {...register("password")} className="admin-input" />
              </label>
              <label className="grid gap-1 text-sm">
                {t("adminConfirmPassword")}
                <input type="password" autoComplete="new-password" required {...register("confirmation")} className="admin-input" />
              </label>
            </>
          ) : (
            <label className="grid gap-1 text-sm">
              {t("email")}
              <input type="email" autoComplete="username" required {...register("email")} className="admin-input" />
            </label>
          )}
          {error ? <p className="admin-notice" role="alert">{error}</p> : null}
          <button type="submit" disabled={formState.isSubmitting} className="admin-primary-button w-full">
            {t(formState.isSubmitting ? "loading" : reset ? "adminResetPassword" : "adminSendReset")}
          </button>
        </form>
      )}
      <div className="mt-5 flex flex-wrap gap-3 text-sm">
        {reset ? (
          <Link to="/admin/forgot-password" className="underline underline-offset-4">{t("adminRequestNewLink")}</Link>
        ) : null}
        <Link to="/admin/login" className="underline underline-offset-4">{t("adminBackToLogin")}</Link>
      </div>
    </AdminAuthPanel>
  );
}
