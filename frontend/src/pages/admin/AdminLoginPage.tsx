import { useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import { adminApi } from "../../api/admin";
import { AdminLanguageButton } from "../../components/admin/AdminLanguageButton";
import { Seo } from "../../components/common/Seo";
import { TopBar } from "../../components/layout/TopBar";
import { useI18n } from "../../hooks/useI18n";
import { useAuthStore } from "../../store/authStore";

type LoginForm = {
  email: string;
  password: string;
};

export function AdminLoginPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
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
      setToken(response.token);
      navigate("/admin/dashboard");
    } catch {
      setError(t("apiUnavailable"));
    }
  };

  return (
    <div className="min-h-screen bg-[#f1e8dc]">
      <Seo
        title="Admin Login | Rüzo"
        description="Rüzo admin login."
        path="/admin/login"
        robots="noindex,nofollow"
      />
      <TopBar eyebrow={t("admin")} navItems={[]} actions={<AdminLanguageButton />} />
      <main className="grid min-h-[calc(100vh-4rem)] place-items-center px-4 py-10">
        <section className="w-full max-w-[384px] border border-[#ded2c5] bg-[#fbf7f1] px-8 py-9">
          <div className="text-center">
            <p className="text-xl uppercase tracking-[0.34em]">RÜZO</p>
            <p className="mt-2 text-[0.68rem] uppercase tracking-[0.28em] text-[#8b725f]">{t("admin")}</p>
          </div>
          <form className="mt-7 grid gap-5" onSubmit={handleSubmit(onSubmit)}>
            <p className="font-display text-lg text-[#111111]">{t("adminLogin")}</p>
            <input
              type="email"
              placeholder="admin@ruzo.local"
              {...register("email", { required: true })}
              className="admin-input min-h-11 bg-[#f8f4ec]"
            />
            <input
              type="password"
              placeholder="Ruzo@2026"
              {...register("password", { required: true })}
              className="admin-input min-h-11 bg-[#f8f4ec]"
            />
            {error ? <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
            <button
              type="submit"
              disabled={formState.isSubmitting}
              className="admin-primary-button w-full"
            >
              {formState.isSubmitting ? t("loading") : t("adminLogin")}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
