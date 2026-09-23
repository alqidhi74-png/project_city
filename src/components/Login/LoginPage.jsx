import { useState } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { login, register } from "./auth";
import "./LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const submit = (event) => {
    event.preventDefault();
    setError("");
    if (mode === "register" && form.password !== form.confirmPassword) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }
    if (form.password.length < 8) {
      setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      return;
    }

    setLoading(true);
    const result = mode === "login" ? login(form.email, form.password) : register(form);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    navigate(result.user.role === "admin" ? "/admin" : "/");
  };

  return (
    <main className="auth-page" dir="rtl">
      <section className="auth-brand-panel">
        <Link to="/" className="auth-back"><ArrowRight size={18} /> العودة للموقع</Link>
        <div className="auth-brand-copy">
          <span className="auth-kicker">البوابة الرقمية للمدينة</span>
          <h1>عيش تجربة مدينة السلطان هيثم</h1>
          <p>أنشئ حسابك للوصول إلى الخدمات الرقمية ومتابعة كل ما يهمك في المدينة.</p>
          <div className="auth-security"><ShieldCheck size={20} /><span>حسابك ومعلوماتك محمية</span></div>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-wrap">
          <div className="auth-form-heading">
            <span className="auth-form-icon"><LockKeyhole size={21} /></span>
            <div><h2>{mode === "login" ? "مرحبًا بعودتك" : "إنشاء حساب جديد"}</h2><p>{mode === "login" ? "سجّل دخولك إلى حسابك في المدينة" : "أنشئ حسابك للوصول إلى خدمات المدينة"}</p></div>
          </div>

          <div className="auth-tabs" role="tablist">
            <button className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setError(""); }} type="button">تسجيل الدخول</button>
            <button className={mode === "register" ? "active" : ""} onClick={() => { setMode("register"); setError(""); }} type="button">إنشاء حساب</button>
          </div>

          <form onSubmit={submit}>
            {mode === "register" && <label><span>الاسم بالكامل</span><div className="input-wrap"><UserRound size={18} /><input name="name" value={form.name} onChange={updateField} placeholder="اكتب الاسم" required /></div></label>}
            <label><span>البريد الإلكتروني</span><div className="input-wrap"><Mail size={18} /><input name="email" type="email" value={form.email} onChange={updateField} placeholder="admin@city.om" required /></div></label>
            <label><span>كلمة المرور</span><div className="input-wrap"><LockKeyhole size={18} /><input name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={updateField} placeholder="8 أحرف على الأقل" required /><button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label="إظهار كلمة المرور">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
            {mode === "register" && <label><span>تأكيد كلمة المرور</span><div className="input-wrap"><LockKeyhole size={18} /><input name="confirmPassword" type="password" value={form.confirmPassword} onChange={updateField} placeholder="أعد كتابة كلمة المرور" required /></div></label>}
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="auth-submit" type="submit" disabled={loading}>{loading ? "جارٍ التحقق..." : mode === "login" ? "تسجيل الدخول" : "إنشاء الحساب"}<ArrowRight size={18} /></button>
          </form>
          {mode === "login" && <p className="auth-hint">للتجربة: `admin@city.om` / `Admin@123`</p>}
        </div>
      </section>
    </main>
  );
}

export default LoginPage;