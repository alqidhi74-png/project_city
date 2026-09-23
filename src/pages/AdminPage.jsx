import { LayoutDashboard, LogOut, ShieldCheck, Users, Building2 } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { getSession, logout } from "../components/Login/auth";
import cityLogo from "../assets/images/Logo.png";
import "./AdminPage.css";

function AdminPage() {
  const navigate = useNavigate();
  const user = getSession();
  if (!user || user.role !== "admin") return <Navigate to="/login" replace />;

  const signOut = () => { logout(); navigate("/login"); };
  return <main className="admin-page" dir="rtl">
    <header className="admin-header"><div className="admin-logo"><img src={cityLogo} alt="شعار مدينة السلطان هيثم" /><div><strong>مدينة السلطان هيثم</strong><small>لوحة الإدارة</small></div></div><button onClick={signOut}><LogOut size={17} /> تسجيل الخروج</button></header>
    <section className="admin-content"><div className="admin-welcome"><div><span>مرحبًا، {user.name}</span><h1>لوحة التحكم</h1><p>تابع أهم مؤشرات المدينة من مكان واحد.</p></div><ShieldCheck size={42} /></div>
      <div className="admin-cards"><article><span><Building2 size={20} /></span><small>المشاريع النشطة</small><strong>24</strong><em>+12% هذا الشهر</em></article><article><span><Users size={20} /></span><small>طلبات الخدمات</small><strong>186</strong><em>+8% هذا الأسبوع</em></article><article><span><LayoutDashboard size={20} /></span><small>نسبة الإنجاز</small><strong>78%</strong><em>تحديث مباشر</em></article></div>
      <div className="admin-empty"><h2>مساحة العمل الإداري</h2><p>تم تسجيل الدخول بنجاح. يمكن ربط هذه اللوحة لاحقًا ببيانات المشاريع والخدمات من خلال API.</p></div>
    </section>
  </main>;
}

export default AdminPage;