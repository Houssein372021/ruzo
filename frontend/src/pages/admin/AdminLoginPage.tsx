import { useState } from "react";
import { useForm } from "react-hook-form";
import { isAxiosError } from "axios";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { adminApi } from "../../api/admin";
import { AdminAuthPanel } from "../../components/admin/AdminAuthPanel";
import { useI18n } from "../../hooks/useI18n";
import { useAuthStore } from "../../store/authStore";

type LoginForm = {
  email: string;
  password: string;
};

export function AdminLoginPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { state } = useLocation();
  const token = useAuthStore((state) => state.token);
  const setToken = useAuthStore((state) => state.setToken);
  const { register, handleSubmit, formState } = useForm<LoginForm>();
  const [error, setError] = useState("");

  if (token) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const onSubmit = async (values: LoginForm) => {
    setError("");
    try {
      const response = await adminApi.login(values.email, values.password);
      setToken(response.token, response.user.email);
      navigate("/admin/dashboard");
    } catch (error) {
      setError(t(isAxiosError(error) && error.response?.status === 401 ? "adminLoginInvalid" : "apiUnavailable"));
    }
  };

  return (
    <AdminAuthPanel title={t("adminLogin")} path="/admin/login">
      {state?.passwordReset === true ? <p className="admin-notice mt-4" role="status">{t("adminPasswordResetSaved")}</p> : null}
      <form className="mt-5 grid gap-4" onSubmit={handleSubmit(onSubmit)}>
        <label className="grid gap-1 text-sm">
          {t("email")}
          <input type="email" autoComplete="username" required {...register("email", { required: true })} className="admin-input min-h-11" />
        </label>
        <label className="grid gap-1 text-sm">
          {t("adminPassword")}
          <input type="password" autoComplete="current-password" required {...register("password", { required: true })} className="admin-input min-h-11" />
        </label>
        <Link to="/admin/forgot-password" className="w-fit text-sm underline underline-offset-4">
          {t("adminForgotPassword")}
        </Link>
        {error ? <p className="admin-notice" role="alert">{error}</p> : null}
        <button type="submit" disabled={formState.isSubmitting} className="admin-primary-button w-full">
          {formState.isSubmitting ? t("loading") : t("adminLogin")}
        </button>
      </form>
    </AdminAuthPanel>
  );
}
