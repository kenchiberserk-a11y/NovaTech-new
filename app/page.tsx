"use client";
import { FormEvent, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"employee" | "admin">("employee");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) { setError("El acceso aún no está configurado. Añade las variables de Supabase indicadas en el README."); return; }
    setLoading(true);
    try {
      const supabase = createBrowserClient(url, key);
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError || !data.user) { setError("No se pudo iniciar sesión. Comprueba tus datos e inténtalo de nuevo."); return; }
      const response = await fetch("/api/session", { method: "POST" });
      if (!response.ok) { setError("No se pudo validar tu perfil. Contacta con soporte."); await supabase.auth.signOut(); return; }
      const profile = await response.json();
      if (mode === "admin" && profile.role !== "admin") { setError("Esta cuenta no tiene permisos de administración."); await supabase.auth.signOut(); return; }
      window.location.href = profile.role === "admin" ? "/admin" : "/workspace";
    } catch { setError("Servicio temporalmente no disponible. Inténtalo de nuevo."); }
    finally { setLoading(false); }
  }

  return <main className="login-shell">
    <section className="visual-panel" aria-label="NovaTech">
      <div className="visual-top"><div className="brand-mark">N<span>.</span></div><span className="brand-name">NOVATECH</span><span className="brand-divider" /><span className="brand-caption">WORKSPACE</span></div>
      <div className="visual-content"><div className="eyebrow"><span className="pulse-dot" /> YOUR WORKSPACE, REIMAGINED</div><h1>Ideas que mueven.<br/><span>Personas que</span><br/>transforman.</h1><p>Un espacio de trabajo más conectado, seguro y preparado para lo que viene.</p>
        <div className="orbit-scene" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="orbit orbit-three"/><div className="orbit-core"><div className="core-symbol">N<span>.</span></div></div><div className="orbit-node node-a">✳</div><div className="orbit-node node-b">⌘</div><div className="orbit-node node-c">↗</div></div>
      </div>
      <div className="visual-footer"><span>BUILT FOR WHAT’S NEXT</span><span>© NOVATECH 2026</span></div>
    </section>
    <section className="form-panel"><div className="form-wrap"><div className="mobile-brand"><div className="brand-mark">N<span>.</span></div><span className="brand-name">NOVATECH</span></div><div className="form-heading"><div className="welcome-tag">BIENVENIDO DE NUEVO</div><h2>Tu espacio te espera.</h2><p>Inicia sesión para continuar a tu workspace.</p></div>
      <div className="role-label">ACCEDER COMO</div><div className="role-switch" role="group" aria-label="Tipo de acceso"><button type="button" className={mode === "employee" ? "role-option selected" : "role-option"} onClick={() => {setMode("employee");setError("");}}><span className="role-icon">♙</span><span><strong>Empleado</strong><small>Workspace personal</small></span>{mode === "employee" && <span className="checkmark">✓</span>}</button><button type="button" className={mode === "admin" ? "role-option selected" : "role-option"} onClick={() => {setMode("admin");setError("");}}><span className="role-icon">⌘</span><span><strong>Administrador</strong><small>Gestión y seguridad</small></span>{mode === "admin" && <span className="checkmark">✓</span>}</button></div>
      <form onSubmit={signIn} className="login-form"><label htmlFor="email">Correo corporativo</label><div className="input-wrap"><span className="input-icon">✉</span><input id="email" type="email" autoComplete="username" placeholder="nombre@novatech.com" value={email} onChange={e=>setEmail(e.target.value)} required /></div><div className="password-label"><label htmlFor="password">Contraseña</label><a href="mailto:soporte@novatech.example?subject=Recuperar%20acceso">¿La olvidaste?</a></div><div className="input-wrap"><span className="input-icon">⌑</span><input id="password" type="password" autoComplete="current-password" placeholder="Introduce tu contraseña" value={password} onChange={e=>setPassword(e.target.value)} required /></div>
      {error && <div className="error-message" role="alert">{error}</div>}<button className="submit-button" type="submit" disabled={loading}>{loading ? "Verificando acceso…" : "Iniciar sesión"}<span>↗</span></button></form>
      <div className="secure-note"><span className="lock-icon">♢</span><span>Conexión protegida y acceso basado en permisos.</span></div><div className="form-bottom"><span>¿Necesitas ayuda? <a href="mailto:soporte@novatech.example">Contacta a IT</a></span><span>PRIVACIDAD&nbsp; · &nbsp;SEGURIDAD</span></div>
    </div><div className="mobile-legal">© 2026 NovaTech, Inc. Todos los derechos reservados.</div></section>
  </main>;
}
