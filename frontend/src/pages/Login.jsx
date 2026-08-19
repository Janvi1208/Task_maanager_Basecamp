import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Input from "../components/Input";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await login(form);
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthForm
      title="Welcome back"
      subtitle="Sign in to your Basecamp workspace."
      submitLabel="Log in"
      form={form}
      setForm={setForm}
      error={error}
      submitting={submitting}
      onSubmit={submit}
      footer={
        <>
          New here?{" "}
          <Link className="text-accent-dark font-medium" to="/signup">
            Create an account
          </Link>
        </>
      }
    />
  );
}

function AuthForm({
  title,
  subtitle,
  submitLabel,
  form,
  setForm,
  error,
  submitting,
  onSubmit,
  footer,
}) {
  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md bg-white border border-ink-200 rounded-xl shadow-card p-8 space-y-5"
      >
        <div>
          <p className="font-display font-semibold text-lg text-ink-900">
            Basecamp
          </p>
          <h1 className="font-display font-semibold text-2xl text-ink-900 mt-6">
            {title}
          </h1>
          <p className="text-sm text-ink-600 mt-1">{subtitle}</p>
        </div>
        {error && (
          <p
            role="alert"
            className="text-sm text-rose bg-rose/10 border border-rose/20 rounded-lg px-3 py-2"
          >
            {error}
          </p>
        )}
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          autoComplete="email"
          required
        />
        <Input
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          autoComplete="current-password"
          required
        />
        <Button type="submit" loading={submitting} className="w-full">
          {submitLabel}
        </Button>
        <p className="text-sm text-center text-ink-600">{footer}</p>
      </form>
    </div>
  );
}
