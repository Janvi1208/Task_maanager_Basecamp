import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Input from "../components/Input";
import { useAuth } from "../context/AuthContext.jsx";

export default function Signup() {
  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const submit = async (event) => {
    event.preventDefault();
    if (form.password.length < 8)
      return setError("Password must be at least 8 characters.");
    if (form.password !== form.confirmPassword)
      return setError("Passwords do not match.");
    setSubmitting(true);
    setError("");
    try {
      await signup({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md bg-white border border-ink-200 rounded-xl shadow-card p-8 space-y-5"
      >
        <div>
          <p className="font-display font-semibold text-lg text-ink-900">
            Basecamp
          </p>
          <h1 className="font-display font-semibold text-2xl text-ink-900 mt-6">
            Create your account
          </h1>
          <p className="text-sm text-ink-600 mt-1">
            Start managing your team’s work.
          </p>
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
          label="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          autoComplete="name"
          required
        />
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
          autoComplete="new-password"
          minLength={8}
          required
        />
        <Input
          label="Confirm password"
          type="password"
          value={form.confirmPassword}
          onChange={(e) =>
            setForm({ ...form, confirmPassword: e.target.value })
          }
          autoComplete="new-password"
          required
        />
        <Button type="submit" loading={submitting} className="w-full">
          Create account
        </Button>
        <p className="text-sm text-center text-ink-600">
          Already have an account?{" "}
          <Link className="text-accent-dark font-medium" to="/login">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
