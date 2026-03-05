import React, { useState, useEffect } from "react";

const COLORS = {
  bg: "#0f1117",
  card: "#181c27",
  cardBorder: "#252a38",
  accent: "#4fc3f7",
  green: "#43e97b",
  orange: "#ffa040",
  red: "#ff5c6c",
  purple: "#b388ff",
  text: "#e8eaf6",
  muted: "#7986a3",
  input: "#1e2333",
};

const FONT = `'DM Sans', 'Segoe UI', sans-serif`;

// ─── ACCOUNTS: каждый аккаунт может иметь несколько доступных ролей ──────────
const ACCOUNTS = {
  anna: {
    id: "anna", name: "Анна", avatar: "АМ", password: "1234",
    roles: ["manager", "cleaner"],  // менеджер, но может взять уборку сама
    defaultRole: "manager",
  },
  carlos: {
    id: "carlos", name: "Carlos Ruiz", avatar: "CR", password: "1234",
    roles: ["owner"],
    defaultRole: "owner",
  },
  elena: {
    id: "elena", name: "Elena Popova", avatar: "EP", password: "1234",
    roles: ["owner"],
    defaultRole: "owner",
  },
  maria: {
    id: "maria", name: "Мария К.", avatar: "МК", password: "1234",
    roles: ["cleaner"],
    defaultRole: "cleaner",
  },
  ivan: {
    id: "ivan", name: "Иван С.", avatar: "ИС", password: "1234",
    roles: ["cleaner", "manager"],  // клинер, которому можно передать полномочия менеджера
    defaultRole: "cleaner",
  },
};

// Маппинг account.id → старый uid для задач/объектов
const ACCOUNT_TO_UID = {
  anna: "m1", carlos: "o1", elena: "o2", maria: "c1", ivan: "c2",
};

const ROLE_META = {
  manager: { label: "Менеджер",    icon: "👩‍💼", color: COLORS.accent  },
  owner:   { label: "Собственник", icon: "🏠",  color: COLORS.green   },
  cleaner: { label: "Клинер",      icon: "🧹",  color: COLORS.orange  },
};

const INITIAL_OBJECTS = [
  { id:"obj1", name:"Apt. Mar Menor 12A",     owner:"o1", address:"C/ Los Peces 12, Torrevieja",  type:"2BR",       status:"active" },
  { id:"obj2", name:"Apt. Playa Flamenca 5B", owner:"o1", address:"Av. Flamencos 5, Orihuela",    type:"1BR",       status:"active" },
  { id:"obj3", name:"Villa La Zenia",          owner:"o2", address:"C/ Amapola 33, La Zenia",      type:"3BR Villa", status:"active" },
  { id:"obj4", name:"Apt. Centro 8",           owner:"o2", address:"C/ Mayor 8, Torrevieja",       type:"Studio",    status:"active" },
];

const INITIAL_TASKS = [
  { id:"t1", type:"cleaning",     objectId:"obj1", assignedTo:"c1", date:"2026-03-05", time:"10:00", status:"pending",    notes:"После выезда гостей. Поменять постельное.", photos:[], report:"", requestedBy:"o1", createdAt:"2026-03-04", supplies:{towels:4,soap:2,toiletpaper:3} },
  { id:"t2", type:"guest_checkin",objectId:"obj2", assignedTo:"c2", date:"2026-03-06", time:"14:00", status:"pending",    notes:"Встреча гостей. Рейс прибывает в 13:30 в Alicante.", photos:[], report:"", requestedBy:"o1", createdAt:"2026-03-04", supplies:{} },
  { id:"t3", type:"cleaning",     objectId:"obj3", assignedTo:"c1", date:"2026-03-04", time:"11:00", status:"done",       notes:"Генеральная уборка.", photos:["photo1","photo2"], report:"Уборка выполнена. Обнаружена сломанная ручка на балконной двери.", requestedBy:"o2", createdAt:"2026-03-03", supplies:{soap:1} },
  { id:"t4", type:"repair",       objectId:"obj3", assignedTo:"m1", date:"2026-03-07", time:"09:00", status:"pending",    notes:"Замена ручки балконной двери. Выявлено при уборке.", photos:[], report:"", requestedBy:"m1", createdAt:"2026-03-04", supplies:{} },
  { id:"t5", type:"cleaning",     objectId:"obj4", assignedTo:"c2", date:"2026-03-05", time:"09:00", status:"inprogress", notes:"Стандартная уборка после аренды.", photos:["photo3"], report:"", requestedBy:"o2", createdAt:"2026-03-04", supplies:{towels:2,toiletpaper:2} },
];

const INITIAL_MESSAGES = [
  { id:"msg1", from:"o1", to:"m1", text:"Анна, когда будет готов отчёт по Apt. Mar Menor?",                                  time:"10:23", date:"2026-03-04" },
  { id:"msg2", from:"m1", to:"o1", text:"Carlos, завтра в 11:00 Мария сделает уборку, отчёт придёт сразу после.",            time:"10:31", date:"2026-03-04" },
  { id:"msg3", from:"o2", to:"m1", text:"Нужно заменить ручку на балконе в Villa La Zenia, гости приедут 8 марта.",          time:"14:05", date:"2026-03-04" },
  { id:"msg4", from:"m1", to:"o2", text:"Елена, уже создала задачу на ремонт, 7 марта выедем.",                              time:"14:12", date:"2026-03-04" },
];

const INITIAL_SUPPLIES = [
  { id:"s1", name:"Полотенца",         unit:"шт",  stock:24, min:10 },
  { id:"s2", name:"Туалетная бумага",  unit:"рул", stock:18, min:15 },
  { id:"s3", name:"Мыло жидкое",       unit:"фл",  stock:8,  min:6  },
  { id:"s4", name:"Чистящее средство", unit:"фл",  stock:3,  min:5  },
  { id:"s5", name:"Пакеты для мусора", unit:"уп",  stock:12, min:8  },
  { id:"s6", name:"Перчатки",          unit:"пар", stock:20, min:10 },
];

const TASK_TYPES = {
  cleaning:      { label:"Уборка",         icon:"🧹", color:COLORS.accent  },
  guest_checkin: { label:"Встреча гостей", icon:"🤝", color:COLORS.green   },
  guest_checkout:{ label:"Проводы гостей", icon:"👋", color:COLORS.purple  },
  repair:        { label:"Ремонт",          icon:"🔧", color:COLORS.orange  },
  supplies:      { label:"Расходники",      icon:"📦", color:COLORS.red     },
};

const STATUS_META = {
  pending:    { label:"Ожидает",   color:COLORS.orange },
  inprogress: { label:"В работе",  color:COLORS.accent },
  done:       { label:"Выполнено", color:COLORS.green  },
  issue:      { label:"Проблема",  color:COLORS.red    },
};

// ─── UI PRIMITIVES ────────────────────────────────────────────────────────────
function Avatar({ initials, size=36, color=COLORS.accent }) {
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:`${color}22`, border:`2px solid ${color}55`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.35, fontWeight:700, color, flexShrink:0, fontFamily:FONT }}>
      {initials}
    </div>
  );
}

function Badge({ label, color }) {
  return (
    <span style={{ background:`${color}20`, color, border:`1px solid ${color}40`, borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:600, fontFamily:FONT, whiteSpace:"nowrap" }}>
      {label}
    </span>
  );
}

function Card({ children, style={}, onClick }) {
  return (
    <div onClick={onClick} style={{ background:COLORS.card, border:`1px solid ${COLORS.cardBorder}`, borderRadius:14, padding:18, cursor:onClick?"pointer":"default", ...style }}>
      {children}
    </div>
  );
}

function Btn({ children, onClick, color=COLORS.accent, ghost=false, full=false, disabled=false }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ background:ghost?`${color}18`:disabled?COLORS.cardBorder:color, color:ghost?color:disabled?COLORS.muted:COLORS.bg, border:ghost?`1px solid ${color}40`:"none", borderRadius:10, padding:"11px 22px", fontWeight:700, fontFamily:FONT, fontSize:14, cursor:disabled?"default":"pointer", width:full?"100%":"auto" }}>
      {children}
    </button>
  );
}

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [login, setLogin]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");

  function handleLogin() {
    const acc = ACCOUNTS[login.trim().toLowerCase()];
    if (!acc)                    { setError("Пользователь не найден"); return; }
    if (acc.password !== password){ setError("Неверный пароль");        return; }
    setError("");
    onLogin(acc, acc.defaultRole);
  }

  return (
    <div style={{ minHeight:"100svh", background:COLORS.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:FONT, padding:24 }}>
      <div style={{ fontSize:36, marginBottom:8 }}>✨</div>
      <div style={{ fontSize:32, fontWeight:900, color:COLORS.text, letterSpacing:-1 }}>CleanHub</div>
      <div style={{ fontSize:13, color:COLORS.muted, marginBottom:36, marginTop:4 }}>Torrevieja · Управление сервисом</div>

      <div style={{ width:"100%", maxWidth:340 }}>
        {/* Login field */}
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:11, color:COLORS.muted, marginBottom:5, letterSpacing:0.5 }}>ЛОГИН</div>
          <input value={login} onChange={e=>{setLogin(e.target.value);setError("");}} placeholder="например: anna"
            style={{ width:"100%", background:COLORS.input, border:`1px solid ${error?COLORS.red:COLORS.cardBorder}`, borderRadius:10, padding:"11px 14px", color:COLORS.text, fontFamily:FONT, fontSize:14, boxSizing:"border-box" }} />
        </div>
        {/* Password field */}
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:11, color:COLORS.muted, marginBottom:5, letterSpacing:0.5 }}>ПАРОЛЬ</div>
          <input type="password" value={password} onChange={e=>{setPassword(e.target.value);setError("");}} placeholder="••••"
            onKeyDown={e=>e.key==="Enter"&&handleLogin()}
            style={{ width:"100%", background:COLORS.input, border:`1px solid ${error?COLORS.red:COLORS.cardBorder}`, borderRadius:10, padding:"11px 14px", color:COLORS.text, fontFamily:FONT, fontSize:14, boxSizing:"border-box" }} />
        </div>
        {error && <div style={{ color:COLORS.red, fontSize:12, marginBottom:10 }}>⚠ {error}</div>}
        <Btn full onClick={handleLogin} disabled={!login||!password}>Войти →</Btn>

        {/* Demo hint */}
        <div style={{ marginTop:28, padding:16, background:COLORS.card, borderRadius:12, border:`1px solid ${COLORS.cardBorder}` }}>
          <div style={{ fontSize:11, color:COLORS.muted, marginBottom:10, letterSpacing:0.5 }}>ДЕМО (пароль для всех: 1234)</div>
          {Object.values(ACCOUNTS).map(a => (
            <div key={a.id} onClick={() => { setLogin(a.id); setPassword("1234"); setError(""); }}
              style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 0", borderBottom:`1px solid ${COLORS.cardBorder}`, cursor:"pointer" }}>
              <div>
                <span style={{ fontSize:13, color:COLORS.text }}>{a.name}</span>
                {a.roles.length > 1 && <span style={{ fontSize:10, color:COLORS.purple, marginLeft:8 }}>мульти-роль</span>}
              </div>
              <span style={{ fontSize:12, color:COLORS.accent, fontFamily:"monospace" }}>{a.id}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ROLE SWITCHER ────────────────────────────────────────────────────────────
function RoleSwitcher({ account, currentRole, onSwitch, onClose }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"#000b", zIndex:200, display:"flex", alignItems:"flex-end", justifyContent:"center" }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ background:COLORS.card, borderRadius:"20px 20px 0 0", border:`1px solid ${COLORS.cardBorder}`, padding:24, width:"100%", maxWidth:480 }}>
        <div style={{ fontSize:13, color:COLORS.muted, marginBottom:4, fontFamily:FONT }}>Переключить роль</div>
        <div style={{ fontSize:16, fontWeight:800, color:COLORS.text, marginBottom:20, fontFamily:FONT }}>{account.name}</div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {account.roles.map(role => {
            const rm = ROLE_META[role];
            const active = role === currentRole;
            return (
              <div key={role} onClick={() => { onSwitch(role); onClose(); }}
                style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", borderRadius:12, cursor:"pointer", background:active?`${rm.color}18`:COLORS.input, border:`2px solid ${active?rm.color:COLORS.cardBorder}` }}>
                <span style={{ fontSize:24 }}>{rm.icon}</span>
                <div>
                  <div style={{ fontWeight:700, color:COLORS.text, fontSize:15, fontFamily:FONT }}>{rm.label}</div>
                  {active && <div style={{ fontSize:11, color:rm.color, fontFamily:FONT }}>Текущая роль</div>}
                </div>
                {active && <span style={{ marginLeft:"auto", color:rm.color, fontSize:20 }}>✓</span>}
              </div>
            );
          })}
        </div>
        <button onClick={onClose} style={{ marginTop:16, width:"100%", background:"none", border:`1px solid ${COLORS.cardBorder}`, color:COLORS.muted, borderRadius:10, padding:"10px", cursor:"pointer", fontFamily:FONT, fontSize:13 }}>Отмена</button>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ account, role, tasks, objects }) {
  const uid = ACCOUNT_TO_UID[account.id];
  const myTasks = role==="owner" ? tasks.filter(t=>objects.find(o=>o.id===t.objectId&&o.owner===uid))
    : role==="cleaner" ? tasks.filter(t=>t.assignedTo===uid) : tasks;

  const pending  = myTasks.filter(t=>t.status==="pending").length;
  const inprog   = myTasks.filter(t=>t.status==="inprogress").length;
  const done     = myTasks.filter(t=>t.status==="done").length;
  const upcoming = myTasks.filter(t=>t.status!=="done").slice(0,4);

  return (
    <div style={{ fontFamily:FONT, color:COLORS.text }}>
      <div style={{ display:"flex", gap:10, marginBottom:24, flexWrap:"wrap" }}>
        {[["⏳","Ожидают",pending,COLORS.orange],["▶","В работе",inprog,COLORS.accent],["✓","Выполнено",done,COLORS.green]].map(([icon,label,val,color])=>(
          <div key={label} style={{ background:COLORS.card, border:`1px solid ${COLORS.cardBorder}`, borderRadius:14, padding:"16px 20px", flex:1, minWidth:90 }}>
            <div style={{ fontSize:20 }}>{icon}</div>
            <div style={{ fontSize:28, fontWeight:800, color }}>{val}</div>
            <div style={{ fontSize:11, color:COLORS.muted }}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize:12, fontWeight:700, color:COLORS.muted, marginBottom:12, letterSpacing:1 }}>БЛИЖАЙШИЕ ЗАДАЧИ</div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {upcoming.map(t=>{
          const tt=TASK_TYPES[t.type]; const st=STATUS_META[t.status];
          const o=objects.find(ob=>ob.id===t.objectId);
          return (
            <div key={t.id} style={{ background:COLORS.card, border:`1px solid ${COLORS.cardBorder}`, borderLeft:`3px solid ${tt.color}`, borderRadius:12, padding:"12px 16px" }}>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontWeight:600, fontSize:13 }}>{tt.icon} {tt.label}</span>
                <Badge label={st.label} color={st.color} />
              </div>
              <div style={{ fontSize:12, color:COLORS.muted, marginTop:4 }}>{o?.name} · {t.date} {t.time}</div>
            </div>
          );
        })}
        {upcoming.length===0 && <div style={{ color:COLORS.muted, textAlign:"center", padding:30, fontSize:14 }}>Задач нет 🎉</div>}
      </div>
    </div>
  );
}

// ─── TASKS VIEW ───────────────────────────────────────────────────────────────
function TasksView({ account, role, tasks, objects, setTasks }) {
  const [selected, setSelected] = useState(null);
  const [newReport, setNewReport] = useState("");
  const [filter, setFilter] = useState("all");
  const uid = ACCOUNT_TO_UID[account.id];

  const visible = tasks.filter(t=>{
    if(role==="owner")   return objects.find(o=>o.id===t.objectId&&o.owner===uid);
    if(role==="cleaner") return t.assignedTo===uid;
    return true;
  }).filter(t=>filter==="all"||t.status===filter);

  const obj     = id=>objects.find(o=>o.id===id);
  const getUser = id=>Object.values(ACCOUNTS).find(a=>ACCOUNT_TO_UID[a.id]===id);

  function markInProgress(id){ setTasks(p=>p.map(t=>t.id===id?{...t,status:"inprogress"}:t)); }
  function markDone(id){
    setTasks(p=>p.map(t=>t.id===id?{...t,status:"done",report:newReport||t.report}:t));
    setSelected(null); setNewReport("");
  }

  const task = selected ? tasks.find(t=>t.id===selected) : null;

  if(task){
    const o=obj(task.objectId); const tt=TASK_TYPES[task.type]; const st=STATUS_META[task.status];
    return (
      <div style={{ fontFamily:FONT, color:COLORS.text }}>
        <button onClick={()=>setSelected(null)} style={{ background:"none", border:`1px solid ${COLORS.cardBorder}`, color:COLORS.muted, borderRadius:8, padding:"6px 14px", marginBottom:20, cursor:"pointer", fontFamily:FONT }}>← Назад</button>
        <div style={{ fontSize:20, fontWeight:800, marginBottom:4 }}>{tt.icon} {tt.label}</div>
        <div style={{ color:COLORS.muted, fontSize:13, marginBottom:16 }}>{o?.name} · {task.date} {task.time}</div>
        <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
          <Badge label={st.label} color={st.color} />
          <Badge label={tt.label} color={tt.color} />
        </div>
        <Card style={{ marginBottom:12 }}>
          <div style={{ fontSize:11, color:COLORS.muted, marginBottom:4 }}>ОБЪЕКТ</div>
          <div style={{ fontWeight:600 }}>{o?.name}</div>
          <div style={{ fontSize:12, color:COLORS.muted, marginTop:2 }}>{o?.address}</div>
        </Card>
        {task.notes&&<Card style={{ marginBottom:12 }}><div style={{ fontSize:11, color:COLORS.muted, marginBottom:4 }}>ЗАМЕТКИ</div><div style={{ fontSize:14 }}>{task.notes}</div></Card>}
        {Object.keys(task.supplies||{}).length>0&&(
          <Card style={{ marginBottom:12 }}>
            <div style={{ fontSize:11, color:COLORS.muted, marginBottom:8 }}>РАСХОДНИКИ</div>
            {Object.entries(task.supplies).map(([k,v])=>(
              <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:4 }}><span style={{ color:COLORS.muted }}>{k}</span><span style={{ fontWeight:600 }}>{v} шт</span></div>
            ))}
          </Card>
        )}
        {task.photos.length>0&&(
          <Card style={{ marginBottom:12 }}>
            <div style={{ fontSize:11, color:COLORS.muted, marginBottom:8 }}>ФОТО ({task.photos.length})</div>
            <div style={{ display:"flex", gap:8 }}>
              {task.photos.map((_,i)=><div key={i} style={{ width:70,height:70,background:`${COLORS.accent}20`,borderRadius:8,border:`1px solid ${COLORS.accent}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22 }}>📷</div>)}
            </div>
          </Card>
        )}
        {task.report&&<Card style={{ marginBottom:12 }}><div style={{ fontSize:11, color:COLORS.muted, marginBottom:4 }}>ОТЧЁТ</div><div style={{ fontSize:13 }}>{task.report}</div></Card>}
        {(role==="cleaner"||role==="manager")&&task.status!=="done"&&(
          <Card style={{ marginBottom:12 }}>
            <div style={{ fontSize:11, color:COLORS.muted, marginBottom:8 }}>ОТЧЁТ / КОММЕНТАРИЙ</div>
            <textarea value={newReport} onChange={e=>setNewReport(e.target.value)} placeholder="Опишите результат, проблемы, рекомендации..."
              style={{ width:"100%", minHeight:80, background:COLORS.input, border:`1px solid ${COLORS.cardBorder}`, borderRadius:8, color:COLORS.text, fontFamily:FONT, fontSize:13, padding:10, resize:"vertical", boxSizing:"border-box" }} />
            <div style={{ display:"flex", gap:10, marginTop:12 }}>
              {task.status==="pending"&&<Btn ghost onClick={()=>markInProgress(task.id)}>▶ Начать</Btn>}
              <Btn onClick={()=>markDone(task.id)} color={COLORS.green}>✓ Завершить</Btn>
            </div>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div style={{ fontFamily:FONT, color:COLORS.text }}>
      <div style={{ fontSize:20, fontWeight:800, marginBottom:16 }}>Задачи</div>
      <div style={{ display:"flex", gap:8, marginBottom:18, flexWrap:"wrap" }}>
        {["all","pending","inprogress","done"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{ background:filter===f?COLORS.accent:COLORS.card, color:filter===f?COLORS.bg:COLORS.muted, border:`1px solid ${filter===f?COLORS.accent:COLORS.cardBorder}`, borderRadius:20, padding:"5px 14px", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:FONT }}>
            {{all:"Все",pending:"Ожидают",inprogress:"В работе",done:"Выполнены"}[f]}
          </button>
        ))}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {visible.length===0&&<div style={{ color:COLORS.muted, textAlign:"center", padding:40, fontSize:14 }}>Задач не найдено</div>}
        {visible.map(t=>{
          const tt=TASK_TYPES[t.type]; const st=STATUS_META[t.status];
          const o=obj(t.objectId); const cl=getUser(t.assignedTo);
          return (
            <div key={t.id} onClick={()=>setSelected(t.id)} style={{ background:COLORS.card, border:`1px solid ${COLORS.cardBorder}`, borderLeft:`3px solid ${tt.color}`, borderRadius:12, padding:"14px 16px", cursor:"pointer" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div><div style={{ fontWeight:700, fontSize:14 }}>{tt.icon} {tt.label}</div><div style={{ fontSize:12, color:COLORS.muted, marginTop:2 }}>{o?.name}</div></div>
                <Badge label={st.label} color={st.color} />
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:10, fontSize:12, color:COLORS.muted }}>
                <span>📅 {t.date} {t.time}</span>
                {cl&&<span>👤 {cl.name}</span>}
              </div>
              {t.photos.length>0&&<div style={{ marginTop:6, fontSize:11, color:COLORS.accent }}>📷 {t.photos.length} фото</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── OBJECTS VIEW ─────────────────────────────────────────────────────────────
function ActiveObjectsList({ account, role, objects, tasks }) {
  const uid = ACCOUNT_TO_UID[account.id];
  const visible = role==="owner" ? objects.filter(o=>o.owner===uid) : objects;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      {visible.length===0 && <div style={{ color:COLORS.muted, textAlign:"center", padding:32, fontSize:14 }}>Объектов нет</div>}
      {visible.map(o=>{
        const objTasks=tasks.filter(t=>t.objectId===o.id);
        const ownerAcc=Object.values(ACCOUNTS).find(a=>ACCOUNT_TO_UID[a.id]===o.owner);
        return (
          <Card key={o.id} style={{ borderLeft:`3px solid ${COLORS.accent}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div><div style={{ fontWeight:700, fontSize:15 }}>🏠 {o.name}</div><div style={{ fontSize:12, color:COLORS.muted, marginTop:2 }}>{o.address}</div></div>
              <Badge label={o.type} color={COLORS.accent} />
            </div>
            {role==="manager"&&ownerAcc&&<div style={{ fontSize:12, color:COLORS.muted, marginTop:8 }}>👤 Собственник: {ownerAcc.name}</div>}
            <div style={{ display:"flex", gap:16, marginTop:12, fontSize:12 }}>
              <span style={{ color:COLORS.orange }}>⏳ {objTasks.filter(t=>t.status==="pending").length} ожидают</span>
              <span style={{ color:COLORS.green }}>✓ {objTasks.filter(t=>t.status==="done").length} выполнено</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function ObjectsView({ account, role, objects, tasks }) {
  const [objTab, setObjTab] = useState("active"); // "active" | "onboarding"

  if (role !== "manager") {
    return (
      <div style={{ fontFamily:FONT, color:COLORS.text }}>
        <div style={{ fontSize:20, fontWeight:800, marginBottom:20 }}>Объекты</div>
        <ActiveObjectsList account={account} role={role} objects={objects} tasks={tasks} />
      </div>
    );
  }

  // Manager: two tabs
  const tabStyle = (id) => ({
    background: objTab===id ? COLORS.accent : COLORS.card,
    color: objTab===id ? COLORS.bg : COLORS.muted,
    border: `1px solid ${objTab===id ? COLORS.accent : COLORS.cardBorder}`,
    borderRadius: 20, padding: "6px 18px", fontSize: 13, fontWeight: 700,
    cursor: "pointer", fontFamily: FONT,
  });

  return (
    <div style={{ fontFamily:FONT, color:COLORS.text }}>
      <div style={{ fontSize:20, fontWeight:800, marginBottom:16 }}>Объекты</div>
      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        <button style={tabStyle("active")}     onClick={()=>setObjTab("active")}>🏠 Активные</button>
        <button style={tabStyle("onboarding")} onClick={()=>setObjTab("onboarding")}>🚀 Онбординг</button>
      </div>
      {objTab==="active"     && <ActiveObjectsList account={account} role={role} objects={objects} tasks={tasks} />}
      {objTab==="onboarding" && <OnboardingView />}
    </div>
  );
}

// ─── MESSAGES VIEW ────────────────────────────────────────────────────────────
function MessagesView({ account, role, messages, setMessages }) {
  const [text, setText] = useState("");
  const uid = ACCOUNT_TO_UID[account.id];
  const visible = role==="manager" ? messages : messages.filter(m=>m.from===uid||m.to===uid||m.to==="all");

  function send(){
    if(!text.trim()) return;
    setMessages(p=>[...p,{ id:`msg${Date.now()}`, from:uid, to:role==="manager"?"all":"m1", text:text.trim(), time:new Date().toLocaleTimeString("ru",{hour:"2-digit",minute:"2-digit"}), date:"2026-03-04" }]);
    setText("");
  }

  const getName  = id=>Object.values(ACCOUNTS).find(a=>ACCOUNT_TO_UID[a.id]===id)?.name||id;
  const getAv    = id=>Object.values(ACCOUNTS).find(a=>ACCOUNT_TO_UID[a.id]===id)?.avatar||"?";

  return (
    <div style={{ fontFamily:FONT, color:COLORS.text, display:"flex", flexDirection:"column", height:"calc(100vh - 180px)" }}>
      <div style={{ fontSize:20, fontWeight:800, marginBottom:16 }}>Сообщения</div>
      <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:10, paddingBottom:10 }}>
        {visible.map(m=>{
          const isMine=m.from===uid;
          return (
            <div key={m.id} style={{ display:"flex", justifyContent:isMine?"flex-end":"flex-start", gap:8, alignItems:"flex-end" }}>
              {!isMine&&<Avatar initials={getAv(m.from)} size={28} />}
              <div style={{ maxWidth:"75%", background:isMine?`${COLORS.accent}25`:COLORS.card, border:`1px solid ${isMine?COLORS.accent+"40":COLORS.cardBorder}`, borderRadius:isMine?"14px 14px 4px 14px":"14px 14px 14px 4px", padding:"10px 14px" }}>
                {!isMine&&<div style={{ fontSize:11, color:COLORS.accent, fontWeight:700, marginBottom:4 }}>{getName(m.from)}</div>}
                <div style={{ fontSize:13 }}>{m.text}</div>
                <div style={{ fontSize:10, color:COLORS.muted, marginTop:4, textAlign:"right" }}>{m.time}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display:"flex", gap:10, marginTop:10 }}>
        <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Написать..."
          style={{ flex:1, background:COLORS.input, border:`1px solid ${COLORS.cardBorder}`, borderRadius:10, padding:"10px 14px", color:COLORS.text, fontFamily:FONT, fontSize:13 }} />
        <button onClick={send} style={{ background:COLORS.accent, color:COLORS.bg, border:"none", borderRadius:10, padding:"10px 18px", fontWeight:700, cursor:"pointer", fontFamily:FONT, fontSize:14 }}>→</button>
      </div>
    </div>
  );
}

// ─── SUPPLIES VIEW ────────────────────────────────────────────────────────────
function SuppliesView({ role }) {
  const [supplies, setSupplies] = useState(INITIAL_SUPPLIES);
  return (
    <div style={{ fontFamily:FONT, color:COLORS.text }}>
      <div style={{ fontSize:20, fontWeight:800, marginBottom:20 }}>Расходники</div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {supplies.map(s=>{
          const pct=Math.min(100,(s.stock/(s.min*3))*100); const low=s.stock<=s.min;
          return (
            <Card key={s.id} style={{ borderLeft:`3px solid ${low?COLORS.red:COLORS.green}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div><div style={{ fontWeight:600, fontSize:14 }}>{s.name}</div><div style={{ fontSize:12, color:COLORS.muted, marginTop:2 }}>Мин: {s.min} {s.unit}</div></div>
                <div style={{ textAlign:"right" }}><div style={{ fontSize:22, fontWeight:800, color:low?COLORS.red:COLORS.green }}>{s.stock}</div><div style={{ fontSize:11, color:COLORS.muted }}>{s.unit}</div></div>
              </div>
              <div style={{ marginTop:10, height:4, background:COLORS.input, borderRadius:4 }}>
                <div style={{ height:"100%", width:`${pct}%`, background:low?COLORS.red:COLORS.green, borderRadius:4 }} />
              </div>
              {low&&<div style={{ fontSize:11, color:COLORS.red, marginTop:6 }}>⚠️ Нужно пополнить</div>}
              {role==="manager"&&(
                <div style={{ display:"flex", gap:8, marginTop:10 }}>
                  <button onClick={()=>setSupplies(p=>p.map(ss=>ss.id===s.id?{...ss,stock:Math.max(0,ss.stock-1)}:ss))} style={{ background:COLORS.input, border:`1px solid ${COLORS.cardBorder}`, color:COLORS.text, borderRadius:6, padding:"4px 12px", cursor:"pointer", fontFamily:FONT }}>−</button>
                  <button onClick={()=>setSupplies(p=>p.map(ss=>ss.id===s.id?{...ss,stock:ss.stock+5}:ss))} style={{ background:`${COLORS.green}20`, border:`1px solid ${COLORS.green}40`, color:COLORS.green, borderRadius:6, padding:"4px 12px", cursor:"pointer", fontFamily:FONT, fontWeight:600 }}>+5</button>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── ONBOARDING MODULE ──────────────────────────────────────────────────────

/* ─────────────────────────────────────────────────────────
   DESIGN: Warm Mediterranean — cream/sand light theme,
   terracotta accents, clean editorial structure.
   Feels like a professional property management firm.
   Font: Playfair Display (headings) + DM Sans (body)
───────────────────────────────────────────────────────── */

const OC = {
  bg:       "#f7f4ef",
  surface:  "#ffffff",
  card:     "#ffffff",
  border:   "#e8e2d9",
  accent:   "#c85c2d",   // terracotta
  accentL:  "#f0e8e2",
  gold:     "#b8924a",
  green:    "#2d7d5c",
  greenL:   "#e8f4ef",
  blue:     "#2d5f8a",
  blueL:    "#e8f0f7",
  red:      "#c0392b",
  text:     "#1a1612",
  muted:    "#7a7168",
  dim:      "#b8b0a5",
  stepDone: "#2d7d5c",
  stepAct:  "#c85c2d",
  stepTodo: "#d5cfc8",
};

const OFD = `'Playfair Display', Georgia, serif`;
const OFB = `'DM Sans', sans-serif`;
const OFM = `'DM Mono', monospace`;

/* ─── ONBOARDING STEPS ──────────────────────────────────────────────────── */
const STEPS = [
  { id:"inspection", label:"Осмотр",       icon:"🔍", short:"Осмотр объекта менеджером" },
  { id:"estimate",   label:"Оценка",        icon:"📋", short:"Смета и согласование услуг" },
  { id:"contract",   label:"Договор",       icon:"📄", short:"Подписание договора" },
  { id:"prep",       label:"Подготовка",    icon:"🧹", short:"Первичная уборка и ремонт" },
  { id:"keys",       label:"Ключи",         icon:"🔑", short:"Передача ключей и доступов" },
  { id:"active",     label:"Активация",     icon:"✅", short:"Объект принят в работу" },
];

/* ─── DEMO PIPELINE ──────────────────────────────────────────────────────── */
const INIT_PIPELINE = [
  {
    id: "onb1",
    ownerName: "Carlos Ruiz",
    ownerPhone: "+34 612 345 678",
    ownerEmail: "carlos@email.com",
    address: "C/ Los Peces 12, Apt 3A, Torrevieja",
    type: "2BR",
    currentStep: 3, // on "contract"
    completedSteps: ["inspection","estimate"],
    createdAt: "2026-02-28",
    notes: {
      inspection: "Квартира в хорошем состоянии. Требуется первичная уборка (~3ч). Перегоревшие лампочки в спальне.",
      estimate: "Первичная уборка: €65. Замена лампочек: €12. Ежемесячное обслуживание: €45/уборка.",
    },
    contractUploaded: false,
    contractSigned: false,
    prepDone: false,
    keyReceived: false,
  },
  {
    id: "onb2",
    ownerName: "Elena Popova",
    ownerPhone: "+34 698 765 432",
    ownerEmail: "elena@email.com",
    address: "C/ Amapola 33, Villa, La Zenia",
    type: "3BR Villa",
    currentStep: 1, // on "estimate"
    completedSteps: ["inspection"],
    createdAt: "2026-03-01",
    notes: {
      inspection: "Вилла 3BR + патио. Последний жилец выехал 2 месяца назад. Нужна генеральная уборка (~5ч), прочистка фильтров кондиционера.",
    },
    contractUploaded: false,
    contractSigned: false,
    prepDone: false,
    keyReceived: false,
  },
  {
    id: "onb3",
    ownerName: "Marco Bianchi",
    ownerPhone: "+34 655 111 222",
    ownerEmail: "marco@bianchi.it",
    address: "Av. de la Paz 7, Apt 2B, Torrevieja",
    type: "Studio",
    currentStep: 5, // on "active"
    completedSteps: ["inspection","estimate","contract","prep","keys"],
    createdAt: "2026-02-15",
    notes: {
      inspection: "Студия, хорошее состояние.",
      estimate: "Первичная уборка: €35. Обслуживание: €30/уборка.",
      contract: "Договор подписан 20.02.2026",
      prep: "Уборка выполнена 22.02.2026, Мария К.",
      keys: "Ключи получены 23.02.2026. Код домофона: 4521.",
    },
    contractUploaded: true,
    contractSigned: true,
    prepDone: true,
    keyReceived: true,
  },
];

/* ─── UI ATOMS ───────────────────────────────────────────────────────────── */
function OTag({ label, color = OC.accent }) {
  return (
    <span style={{ background: `${color}18`, color, border: `1px solid ${color}30`,
      borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700,
      fontFamily: OFB, whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

function OBtn({ children, onClick, variant = "primary", small = false, disabled = false }) {
  const styles = {
    primary:  { bg: OC.accent,   color: "#fff",     border: OC.accent },
    secondary:{ bg: OC.surface,  color: OC.accent,   border: OC.accent },
    ghost:    { bg: "transparent", color: OC.muted, border: OC.border },
    green:    { bg: OC.green,    color: "#fff",     border: OC.green  },
    danger:   { bg: "#fff",     color: OC.red,      border: OC.red    },
  };
  const s = styles[variant] || styles.primary;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: disabled ? OC.dim : s.bg,
      color: disabled ? "#fff" : s.color,
      border: `1.5px solid ${disabled ? OC.dim : s.border}`,
      borderRadius: 10, padding: small ? "6px 14px" : "10px 20px",
      fontSize: small ? 12 : 14, fontWeight: 700, fontFamily: OFB,
      cursor: disabled ? "default" : "pointer", transition: "all 0.15s",
      whiteSpace: "nowrap",
    }}>{children}</button>
  );
}

function OCard({ children, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: OC.card, border: `1px solid ${OC.border}`,
      borderRadius: 16, padding: 20,
      cursor: onClick ? "pointer" : "default",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      ...style,
    }}>{children}</div>
  );
}

function OField({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, color: OC.muted, fontWeight: 600, letterSpacing: 0.8,
        textTransform: "uppercase", fontFamily: OFB, marginBottom: 5 }}>{label}</div>
      {children}
    </div>
  );
}

const OINP = {
  width: "100%", background: OC.bg, border: `1.5px solid ${OC.border}`,
  borderRadius: 9, padding: "10px 12px", color: OC.text, fontFamily: OFB,
  fontSize: 14, boxSizing: "border-box", outline: "none",
};
const OTA = { ...OINP, minHeight: 80, resize: "vertical" };

/* ─── STEP PROGRESS BAR ─────────────────────────────────────────────────── */
function StepBar({ currentStep, completedSteps }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 28, overflowX: "auto", paddingBottom: 4 }}>
      {STEPS.map((step, i) => {
        const done   = completedSteps.includes(step.id);
        const active = i === currentStep;
        const color  = done ? OC.stepDone : active ? OC.stepAct : OC.stepTodo;
        return (
          <div key={step.id} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "none" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 48 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: done ? OC.stepDone : active ? OC.accentL : "#ede9e4",
                border: `2.5px solid ${color}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, transition: "all 0.3s",
              }}>
                {done ? <span style={{ color: OC.stepDone, fontSize: 16 }}>✓</span> : <span>{step.icon}</span>}
              </div>
              <div style={{ fontSize: 10, color, fontWeight: active || done ? 700 : 400,
                fontFamily: OFB, marginTop: 4, textAlign: "center", whiteSpace: "nowrap" }}>
                {step.label}
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 2, background: done ? OC.stepDone : OC.stepTodo,
                margin: "0 2px", marginBottom: 20, minWidth: 12, transition: "background 0.3s" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── STEP CONTENT COMPONENTS ───────────────────────────────────────────── */

// STEP 0: Осмотр
function StepInspection({ item, onUpdate, onComplete, readOnly }) {
  const [note, setNote] = useState(item.notes.inspection || "");
  const [photos, setPhotos] = useState(item.inspectionPhotos || 0);

  return (
    <div>
      <div style={{ fontSize: 13, color: OC.muted, marginBottom: 20, fontFamily: OFB }}>
        Менеджер осматривает объект и фиксирует состояние, необходимые работы и фото.
      </div>
      <OField label="Адрес объекта">
        <div style={{ ...INP, background: "#f0ede8", color: OC.muted }}>{item.address}</div>
      </OField>
      <OField label="Заметки по осмотру">
        <textarea style={OTA} value={note} onChange={e => setNote(e.target.value)}
          disabled={readOnly}
          placeholder="Опишите состояние объекта: что нужна уборка, ремонт, количество комнат, санузлов, особенности..." />
      </OField>
      <OField label="Фото с осмотра">
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          {Array.from({ length: photos }).map((_, i) => (
            <div key={i} style={{ width: 64, height: 64, background: OC.accentL, borderRadius: 10,
              border: `1px solid ${OC.border}`, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 22 }}>📷</div>
          ))}
          {!readOnly && (
            <button onClick={() => setPhotos(p => p + 1)} style={{
              width: 64, height: 64, background: OC.bg, border: `2px dashed ${OC.border}`,
              borderRadius: 10, cursor: "pointer", fontSize: 22, color: OC.dim,
            }}>+</button>
          )}
        </div>
      </OField>
      {!readOnly && (
        <OBtn onClick={() => { onUpdate({ notes: { ...item.notes, inspection: note }, inspectionPhotos: photos }); onComplete(); }}>
          Осмотр завершён →
        </OBtn>
      )}
    </div>
  );
}

// STEP 1: Оценка
function StepEstimate({ item, onUpdate, onComplete, readOnly }) {
  const [cleanType, setCleanType] = useState(item.cleanType || "initial");
  const [cleanHours, setCleanHours] = useState(item.cleanHours || "3");
  const [cleanRate] = useState(20);
  const [monthlyRate, setMonthlyRate] = useState(item.monthlyRate || "45");
  const [repairNote, setRepairNote] = useState(item.repairNote || "");
  const [repairCost, setRepairCost] = useState(item.repairCost || "");
  const [note, setNote] = useState(item.notes.estimate || "");

  const cleanCost = parseFloat(cleanHours) * cleanRate || 0;
  const total = cleanCost + (parseFloat(repairCost) || 0);

  return (
    <div>
      <div style={{ fontSize: 13, color: OC.muted, marginBottom: 20, fontFamily: OFB }}>
        Формирование сметы для согласования с собственником.
      </div>

      <OField label="Тип первичной уборки">
        <div style={{ display: "flex", gap: 10 }}>
          {[["initial","Первичная (повышенная)"],["standard","Стандартная"]].map(([val, lbl]) => (
            <div key={val} onClick={() => !readOnly && setCleanType(val)} style={{
              flex: 1, padding: "12px 14px", borderRadius: 10, cursor: readOnly ? "default" : "pointer",
              border: `2px solid ${cleanType === val ? OC.accent : OC.border}`,
              background: cleanType === val ? OC.accentL : OC.bg,
            }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: cleanType === val ? OC.accent : OC.text }}>{lbl}</div>
              <div style={{ fontSize: 11, color: OC.muted, marginTop: 2 }}>
                {val === "initial" ? `€${cleanRate}/ч — глубокая очистка` : `€15/ч — обычный стандарт`}
              </div>
            </div>
          ))}
        </div>
      </OField>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <OField label={`Часов уборки × €${cleanType === "initial" ? cleanRate : 15}/ч`}>
          <input style={OINP} type="number" value={cleanHours}
            onChange={e => setCleanHours(e.target.value)} disabled={readOnly} />
        </OField>
        <OField label="Ежемес. уборка €/раз">
          <input style={OINP} type="number" value={monthlyRate}
            onChange={e => setMonthlyRate(e.target.value)} disabled={readOnly} />
        </OField>
      </div>

      <OField label="Ремонт / доп. работы (описание)">
        <input style={OINP} value={repairNote} onChange={e => setRepairNote(e.target.value)}
          disabled={readOnly} placeholder="Замена лампочек, прочистка фильтров..." />
      </OField>
      <OField label="Стоимость доп. работ €">
        <input style={OINP} type="number" value={repairCost}
          onChange={e => setRepairCost(e.target.value)} disabled={readOnly} placeholder="0" />
      </OField>

      {/* Summary */}
      <div style={{ background: OC.bg, border: `1.5px solid ${OC.border}`, borderRadius: 12,
        padding: "14px 16px", marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: OC.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>ИТОГО СМЕТА</div>
        {[
          [`${cleanType === "initial" ? "Первичная" : "Стандартная"} уборка (${cleanHours}ч)`, cleanCost],
          repairNote && [repairNote, parseFloat(repairCost) || 0],
        ].filter(Boolean).map(([label, cost], i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13,
            marginBottom: 6, color: OC.text }}>
            <span>{label}</span>
            <span style={{ fontFamily: OFM, fontWeight: 600 }}>€{cost.toFixed(2)}</span>
          </div>
        ))}
        <div style={{ borderTop: `1px solid ${OC.border}`, paddingTop: 10, marginTop: 4,
          display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>Первоначально</span>
          <span style={{ fontFamily: OFM, fontWeight: 800, fontSize: 16, color: OC.accent }}>€{total.toFixed(2)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 12, color: OC.muted }}>
          <span>Обслуживание (каждая уборка)</span>
          <span style={{ fontFamily: OFM }}>€{monthlyRate}/раз</span>
        </div>
      </div>

      <OField label="Комментарий к смете">
        <textarea style={OTA} value={note} onChange={e => setNote(e.target.value)}
          disabled={readOnly} placeholder="Доп. пояснения для собственника..." />
      </OField>

      {!readOnly && (
        <OBtn onClick={() => {
          onUpdate({ cleanType, cleanHours, monthlyRate, repairNote, repairCost, notes: { ...item.notes, estimate: note } });
          onComplete();
        }}>Смета согласована →</OBtn>
      )}
    </div>
  );
}

// STEP 2: Договор
function StepContract({ item, onUpdate, onComplete, readOnly }) {
  const [uploaded, setUploaded] = useState(item.contractUploaded || false);
  const [signed, setSigned] = useState(item.contractSigned || false);
  const [note, setNote] = useState(item.notes.contract || "");

  return (
    <div>
      <div style={{ fontSize: 13, color: OC.muted, marginBottom: 20, fontFamily: OFB }}>
        Загрузка договора, подписание сторонами. Собственник видит договор в своём кабинете.
      </div>

      {/* Upload */}
      <OCard style={{ marginBottom: 14, borderStyle: uploaded ? "solid" : "dashed",
        borderColor: uploaded ? OC.green : OC.border, background: uploaded ? OC.greenL : OC.bg }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: uploaded ? OC.green : OC.text }}>
              {uploaded ? "✓ Договор загружен" : "📎 Загрузить договор"}
            </div>
            <div style={{ fontSize: 12, color: OC.muted, marginTop: 3 }}>
              {uploaded ? "Договор_CleanHub_" + item.ownerName.split(" ")[0] + ".pdf" : "PDF формат, подписанный менеджером"}
            </div>
          </div>
          {!readOnly && (
            uploaded
              ? <OBtn small variant="ghost" onClick={() => setUploaded(false)}>Заменить</OBtn>
              : <OBtn small onClick={() => setUploaded(true)}>Загрузить</OBtn>
          )}
        </div>
      </OCard>

      {/* Sign status */}
      <OCard style={{ marginBottom: 14, borderColor: signed ? OC.green : OC.border,
        background: signed ? OC.greenL : OC.bg }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: signed ? OC.green : OC.text }}>
              {signed ? "✓ Договор подписан" : "✍ Статус подписания"}
            </div>
            <div style={{ fontSize: 12, color: OC.muted, marginTop: 3 }}>
              {signed ? `Подписан ${new Date().toLocaleDateString("ru")}` : "Ожидает подписи собственника"}
            </div>
          </div>
          {!readOnly && uploaded && (
            <OBtn small variant={signed ? "ghost" : "green"} onClick={() => setSigned(v => !v)}>
              {signed ? "Отменить" : "Отметить подписанным"}
            </OBtn>
          )}
        </div>
      </OCard>

      {/* Owner view preview */}
      <div style={{ background: OC.blueL, border: `1px solid ${OC.blue}30`, borderRadius: 12,
        padding: "12px 16px", marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: OC.blue, fontWeight: 700, marginBottom: 6 }}>👁 ВИД СОБСТВЕННИКА</div>
        <div style={{ fontSize: 13, color: OC.text }}>
          {uploaded
            ? `${item.ownerName.split(" ")[0]} видит договор в своём кабинете и может скачать PDF`
            : "Договор ещё не загружен — собственник не видит документ"}
        </div>
        {uploaded && (
          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <div style={{ background: OC.surface, border: `1px solid ${OC.border}`, borderRadius: 8,
              padding: "8px 14px", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <span>📄</span>
              <span style={{ color: OC.blue, fontWeight: 600 }}>Скачать договор</span>
            </div>
            <OTag label={signed ? "Подписан" : "Ожидает подписи"} color={signed ? OC.green : OC.gold} />
          </div>
        )}
      </div>

      <OField label="Примечания к договору">
        <textarea style={OTA} value={note} onChange={e => setNote(e.target.value)}
          disabled={readOnly} placeholder="Особые условия, дата подписания, способ..." />
      </OField>

      {!readOnly && (
        <OBtn disabled={!uploaded || !signed}
          onClick={() => { onUpdate({ contractUploaded: uploaded, contractSigned: signed, notes: { ...item.notes, contract: note } }); onComplete(); }}>
          Договор оформлен →
        </OBtn>
      )}
      {!uploaded && <div style={{ fontSize: 12, color: OC.muted, marginTop: 8 }}>Сначала загрузите и отметьте договор подписанным</div>}
    </div>
  );
}

// STEP 3: Подготовка
function StepPrep({ item, onUpdate, onComplete, readOnly }) {
  const [cleanDone, setCleanDone] = useState(item.prepCleanDone || false);
  const [repairDone, setRepairDone] = useState(item.prepRepairDone || false);
  const [photos, setPhotos] = useState(item.prepPhotos || 0);
  const [note, setNote] = useState(item.notes.prep || "");
  const [assignedTo, setAssignedTo] = useState(item.prepAssignedTo || "Мария К.");

  const canComplete = cleanDone;

  return (
    <div>
      <div style={{ fontSize: 13, color: OC.muted, marginBottom: 20, fontFamily: OFB }}>
        Первичная уборка до стандарта компании + выполнение доп. работ по смете.
      </div>

      <OField label="Назначить клинера">
        <select style={OINP} value={assignedTo} onChange={e => setAssignedTo(e.target.value)} disabled={readOnly}>
          {["Мария К.", "Иван С.", "Анна (менеджер)"].map(n => <option key={n}>{n}</option>)}
        </select>
      </OField>

      {/* Checklist */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: OC.muted, fontWeight: 600, letterSpacing: 0.8,
          textTransform: "uppercase", fontFamily: OFB, marginBottom: 10 }}>ЧЕКЛИСТ</div>
        {[
          [cleanDone, setCleanDone, "🧹", `Первичная уборка выполнена (${item.cleanType === "initial" ? "углублённая" : "стандартная"}, ${item.cleanHours || "3"}ч)`],
          item.repairNote && [repairDone, setRepairDone, "🔧", `Доп. работы: ${item.repairNote}`],
        ].filter(Boolean).map(([done, setDone, icon, label], i) => (
          <div key={i} onClick={() => !readOnly && setDone(v => !v)} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
            borderRadius: 10, marginBottom: 8, cursor: readOnly ? "default" : "pointer",
            background: done ? OC.greenL : OC.bg,
            border: `1.5px solid ${done ? OC.green : OC.border}`,
          }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%",
              background: done ? OC.green : "#fff", border: `2px solid ${done ? OC.green : OC.dim}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, fontSize: 12, color: "#fff", fontWeight: 700 }}>
              {done ? "✓" : ""}
            </div>
            <span style={{ fontSize: 13 }}>{icon} {label}</span>
          </div>
        ))}
      </div>

      <OField label="Фото результата">
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {Array.from({ length: photos }).map((_, i) => (
            <div key={i} style={{ width: 64, height: 64, background: OC.greenL, borderRadius: 10,
              border: `1px solid ${OC.green}40`, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 22 }}>📷</div>
          ))}
          {!readOnly && (
            <button onClick={() => setPhotos(p => p + 1)} style={{
              width: 64, height: 64, background: OC.bg, border: `2px dashed ${OC.border}`,
              borderRadius: 10, cursor: "pointer", fontSize: 22, color: OC.dim,
            }}>+</button>
          )}
        </div>
      </OField>

      <OField label="Отчёт по подготовке">
        <textarea style={OTA} value={note} onChange={e => setNote(e.target.value)}
          disabled={readOnly} placeholder="Что сделано, замечания, рекомендации..." />
      </OField>

      {!readOnly && (
        <OBtn disabled={!canComplete} onClick={() => {
          onUpdate({ prepCleanDone: cleanDone, prepRepairDone: repairDone, prepPhotos: photos, prepAssignedTo: assignedTo, notes: { ...item.notes, prep: note } });
          onComplete();
        }}>Подготовка завершена →</OBtn>
      )}
    </div>
  );
}

// STEP 4: Ключи
function StepKeys({ item, onUpdate, onComplete, readOnly }) {
  const [received, setReceived] = useState(item.keyReceived || false);
  const [keyCount, setKeyCount] = useState(item.keyCount || "2");
  const [accessCode, setAccessCode] = useState(item.accessCode || "");
  const [entryMethod, setEntryMethod] = useState(item.entryMethod || "key");
  const [note, setNote] = useState(item.notes.keys || "");

  return (
    <div>
      <div style={{ fontSize: 13, color: OC.muted, marginBottom: 20, fontFamily: OFB }}>
        Получение ключей и всех данных для доступа к объекту.
      </div>

      <OField label="Способ входа">
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[["key","🔑 Ключи"],["code","🔢 Код"],["card","💳 Карта"],["app","📱 Приложение"]].map(([val,lbl]) => (
            <div key={val} onClick={() => !readOnly && setEntryMethod(val)} style={{
              padding: "8px 14px", borderRadius: 8, cursor: readOnly ? "default" : "pointer",
              border: `2px solid ${entryMethod === val ? OC.accent : OC.border}`,
              background: entryMethod === val ? OC.accentL : OC.bg,
              fontSize: 13, fontWeight: entryMethod === val ? 700 : 400,
              color: entryMethod === val ? OC.accent : OC.text,
            }}>{lbl}</div>
          ))}
        </div>
      </OField>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <OField label="Количество комплектов ключей">
          <input style={OINP} type="number" value={keyCount}
            onChange={e => setKeyCount(e.target.value)} disabled={readOnly} />
        </OField>
        <OField label="Код / PIN">
          <input style={OINP} value={accessCode}
            onChange={e => setAccessCode(e.target.value)}
            disabled={readOnly} placeholder="Домофон, кодовый замок..." />
        </OField>
      </div>

      <OCard style={{ marginBottom: 16, borderColor: received ? OC.green : OC.border,
        background: received ? OC.greenL : OC.bg }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: received ? OC.green : OC.text }}>
              {received ? "✓ Ключи получены" : "🔑 Ключи ещё не получены"}
            </div>
            <div style={{ fontSize: 12, color: OC.muted, marginTop: 2 }}>
              {received ? `${keyCount} комплект(а) · ${new Date().toLocaleDateString("ru")}` : "Отметьте после физического получения"}
            </div>
          </div>
          {!readOnly && (
            <OBtn small variant={received ? "ghost" : "green"} onClick={() => setReceived(v => !v)}>
              {received ? "Отменить" : "Получены ✓"}
            </OBtn>
          )}
        </div>
      </OCard>

      <OField label="Примечания к доступу">
        <textarea style={OTA} value={note} onChange={e => setNote(e.target.value)}
          disabled={readOnly} placeholder="Особенности входа, парковка, соседи, консьерж..." />
      </OField>

      {!readOnly && (
        <OBtn disabled={!received} onClick={() => {
          onUpdate({ keyReceived: received, keyCount, accessCode, entryMethod, notes: { ...item.notes, keys: note } });
          onComplete();
        }}>Ключи переданы →</OBtn>
      )}
    </div>
  );
}

// STEP 5: Активация
function StepActive({ item }) {
  return (
    <div>
      <div style={{ textAlign: "center", padding: "20px 0 30px" }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: OC.green, fontFamily: OFD, marginBottom: 8 }}>
          Объект принят!
        </div>
        <div style={{ fontSize: 14, color: OC.muted, maxWidth: 320, margin: "0 auto" }}>
          {item.address} успешно добавлен в систему и распределён по клинерам
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        {[
          ["👤", "Собственник",   item.ownerName],
          ["🏠", "Тип объекта",  item.type],
          ["🔑", "Способ входа", item.entryMethod === "key" ? "Ключи" : item.entryMethod === "code" ? "Код" : item.entryMethod || "Ключи"],
          ["🧹", "Обслуживание", `€${item.monthlyRate || 45}/уборка`],
        ].map(([icon, label, value]) => (
          <OCard key={label} style={{ padding: "14px 16px" }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
            <div style={{ fontSize: 11, color: OC.muted, marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{value}</div>
          </OCard>
        ))}
      </div>

      <OCard style={{ background: OC.greenL, borderColor: `${OC.green}40` }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: OC.green, marginBottom: 10 }}>✓ Выполнено в рамках онбординга</div>
        {[
          item.notes.inspection && "🔍 Осмотр и фотофиксация",
          item.notes.estimate   && "📋 Смета согласована",
          item.contractSigned   && "📄 Договор подписан",
          item.prepCleanDone    && "🧹 Первичная уборка",
          item.keyReceived      && `🔑 Ключи получены (${item.keyCount || 2} компл.)`,
        ].filter(Boolean).map((txt, i) => (
          <div key={i} style={{ fontSize: 13, color: OC.text, marginBottom: 4 }}>✓ {txt}</div>
        ))}
      </OCard>
    </div>
  );
}

const STEP_COMPONENTS = [StepInspection, StepEstimate, StepContract, StepPrep, StepKeys, StepActive];

/* ─── OBJECT CARD IN PIPELINE ───────────────────────────────────────────── */
function PipelineCard({ item, onClick }) {
  const stepIdx = item.currentStep;
  const step = STEPS[stepIdx];
  const pct = Math.round((item.completedSteps.length / STEPS.length) * 100);

  return (
    <OCard onClick={onClick} style={{ cursor: "pointer", marginBottom: 12,
      borderLeft: `4px solid ${stepIdx === STEPS.length - 1 ? OC.green : OC.accent}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: OC.text, fontFamily: OFD }}>{item.ownerName}</div>
          <div style={{ fontSize: 12, color: OC.muted, marginTop: 2 }}>{item.address}</div>
        </div>
        <OTag label={item.type} color={OC.gold} />
      </div>

      {/* Progress bar */}
      <div style={{ height: 5, background: OC.border, borderRadius: 4, marginBottom: 8 }}>
        <div style={{ height: "100%", width: `${pct}%`, borderRadius: 4,
          background: stepIdx === STEPS.length - 1 ? OC.green : OC.accent,
          transition: "width 0.4s ease" }} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
        <span style={{ color: stepIdx === STEPS.length - 1 ? OC.green : OC.accent, fontWeight: 600 }}>
          {step.icon} {step.label}
        </span>
        <span style={{ color: OC.muted }}>{pct}% готово · {item.createdAt}</span>
      </div>
    </OCard>
  );
}

/* ─── NEW OBJECT FORM ───────────────────────────────────────────────────── */
function NewObjectForm({ onSave, onCancel }) {
  const [form, setForm] = useState({ ownerName:"", ownerPhone:"", ownerEmail:"", address:"", type:"2BR" });
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  function save() {
    if (!form.ownerName || !form.address) return;
    onSave({
      id: `onb${Date.now()}`, ...form,
      currentStep: 0, completedSteps: [], createdAt: "2026-03-04",
      notes: {}, contractUploaded: false, contractSigned: false, prepDone: false, keyReceived: false,
    });
  }

  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 800, fontFamily: OFD, color: OC.text, marginBottom: 20 }}>
        Новый объект
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <OField label="Имя собственника">
          <input style={OINP} value={form.ownerName} onChange={e => f("ownerName", e.target.value)} placeholder="Имя Фамилия" />
        </OField>
        <OField label="Тип объекта">
          <select style={OINP} value={form.type} onChange={e => f("type", e.target.value)}>
            {["Studio","1BR","2BR","3BR","3BR Villa","4BR+"].map(t => <option key={t}>{t}</option>)}
          </select>
        </OField>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <OField label="Телефон">
          <input style={OINP} value={form.ownerPhone} onChange={e => f("ownerPhone", e.target.value)} placeholder="+34 6xx xxx xxx" />
        </OField>
        <OField label="Email">
          <input style={OINP} value={form.ownerEmail} onChange={e => f("ownerEmail", e.target.value)} placeholder="email@domain.com" />
        </OField>
      </div>
      <OField label="Адрес объекта">
        <input style={OINP} value={form.address} onChange={e => f("address", e.target.value)} placeholder="Улица, номер, квартира, город" />
      </OField>
      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <OBtn onClick={save} disabled={!form.ownerName || !form.address}>Создать и начать онбординг</OBtn>
        <OBtn variant="ghost" onClick={onCancel}>Отмена</OBtn>
      </div>
    </div>
  );
}

/* ─── DETAIL VIEW ───────────────────────────────────────────────────────── */
function OnboardingDetail({ item, onBack, onUpdate }) {
  const [activeStep, setActiveStep] = useState(item.currentStep);

  function handleComplete() {
    const nextStep = item.currentStep + 1;
    const newCompleted = [...item.completedSteps, STEPS[item.currentStep].id];
    onUpdate(item.id, {
      completedSteps: newCompleted,
      currentStep: Math.min(nextStep, STEPS.length - 1),
    });
  }

  function handleStepUpdate(data) {
    onUpdate(item.id, data);
  }

  const StepComp = STEP_COMPONENTS[activeStep] || STEP_COMPONENTS[0];
  const isCompletedStep = item.completedSteps.includes(STEPS[activeStep]?.id);
  const isCurrentStep = activeStep === item.currentStep;
  const readOnly = isCompletedStep && !isCurrentStep;

  return (
    <div>
      {/* Back */}
      <button onClick={onBack} style={{ background: "none", border: "none", color: OC.muted,
        cursor: "pointer", fontFamily: OFB, fontSize: 13, marginBottom: 16, padding: 0,
        display: "flex", alignItems: "center", gap: 4 }}>
        ← Все объекты
      </button>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: OC.muted, fontFamily: OFB, marginBottom: 4 }}>ОНБОРДИНГ</div>
        <div style={{ fontSize: 24, fontWeight: 800, fontFamily: OFD, color: OC.text }}>{item.ownerName}</div>
        <div style={{ fontSize: 13, color: OC.muted, marginTop: 2 }}>{item.address}</div>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <OTag label={item.type} color={OC.gold} />
          <OTag label={`С ${item.createdAt}`} color={OC.muted} />
        </div>
      </div>

      {/* Step bar */}
      <StepBar currentStep={item.currentStep} completedSteps={item.completedSteps} />

      {/* Step tabs */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 20, paddingBottom: 4 }}>
        {STEPS.map((step, i) => {
          const done   = item.completedSteps.includes(step.id);
          const active = i === activeStep;
          const locked = i > item.currentStep;
          return (
            <button key={step.id} onClick={() => !locked && setActiveStep(i)}
              disabled={locked}
              style={{
                background: active ? OC.accent : done ? OC.greenL : OC.bg,
                color: active ? "#fff" : done ? OC.green : locked ? OC.dim : OC.text,
                border: `1.5px solid ${active ? OC.accent : done ? OC.green : OC.border}`,
                borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600,
                cursor: locked ? "default" : "pointer", fontFamily: OFB, whiteSpace: "nowrap",
              }}>
              {step.icon} {step.label} {done ? "✓" : ""}
            </button>
          );
        })}
      </div>

      {/* Active step label */}
      <div style={{ fontSize: 18, fontWeight: 700, fontFamily: OFD, color: OC.text, marginBottom: 4 }}>
        {STEPS[activeStep]?.icon} {STEPS[activeStep]?.label}
      </div>
      <div style={{ fontSize: 12, color: OC.muted, marginBottom: 20 }}>{STEPS[activeStep]?.short}</div>
      {isCompletedStep && !isCurrentStep && (
        <div style={{ background: OC.greenL, border: `1px solid ${OC.green}30`, borderRadius: 8,
          padding: "8px 14px", marginBottom: 16, fontSize: 12, color: OC.green, fontWeight: 600 }}>
          ✓ Этот шаг завершён
        </div>
      )}

      {/* Step component */}
      <StepComp item={item} onUpdate={handleStepUpdate} onComplete={handleComplete} readOnly={readOnly} />
    </div>
  );
}

/* ─── ROOT ───────────────────────────────────────────────────────────────── */
function OnboardingView() {
  const [pipeline, setPipeline] = useState(INIT_PIPELINE);
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew]   = useState(false);

  function updateItem(id, data) {
    setPipeline(p => p.map(item => item.id === id ? { ...item, ...data } : item));
    if (selected?.id === id) setSelected(prev => ({ ...prev, ...data }));
  }

  function addItem(item) {
    setPipeline(p => [...p, item]);
    setSelected(item);
    setShowNew(false);
  }

  const active   = pipeline.filter(i => i.currentStep < STEPS.length - 1);
  const done     = pipeline.filter(i => i.currentStep === STEPS.length - 1);
  const selItem  = selected ? pipeline.find(i => i.id === selected.id) : null;

  return (
    <div style={{ fontFamily: OFB, color: OC.text }}>
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.text }}>Онбординг объектов</div>
        {!selItem && !showNew && (
          <button onClick={() => setShowNew(true)} style={{ background: OC.accent, color: "#fff", border: "none", borderRadius: 10, padding: "7px 16px", fontWeight: 700, cursor: "pointer", fontFamily: OFB, fontSize: 13 }}>+ Новый</button>
        )}
      </div>
      <div>
        {showNew ? (
          <NewObjectForm onSave={addItem} onCancel={() => setShowNew(false)} />
        ) : selItem ? (
          <OnboardingDetail item={selItem} onBack={() => setSelected(null)} onUpdate={updateItem} />
        ) : (
          <div>
            {/* Stats */}
            <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
              {[
                ["🔄", "В процессе",  active.length, OC.accent],
                ["✅", "Активированы", done.length,   OC.green],
                ["📊", "Всего",        pipeline.length, OC.blue],
              ].map(([icon, label, val, color]) => (
                <div key={label} style={{ background: OC.surface, border: `1px solid ${OC.border}`,
                  borderRadius: 14, padding: "14px 16px", flex: 1, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                  <div style={{ fontSize: 18 }}>{icon}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color, fontFamily: OFM }}>{val}</div>
                  <div style={{ fontSize: 11, color: OC.muted }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Active pipeline */}
            {active.length > 0 && (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, color: OC.muted, letterSpacing: 2,
                  textTransform: "uppercase", marginBottom: 12 }}>В ПРОЦЕССЕ ОНБОРДИНГА</div>
                {active.map(item => (
                  <PipelineCard key={item.id} item={item} onClick={() => setSelected(item)} />
                ))}
              </>
            )}

            {/* Done */}
            {done.length > 0 && (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, color: OC.muted, letterSpacing: 2,
                  textTransform: "uppercase", marginBottom: 12, marginTop: 28 }}>АКТИВИРОВАНЫ</div>
                {done.map(item => (
                  <PipelineCard key={item.id} item={item} onClick={() => setSelected(item)} />
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(()=>{
    try { const s=sessionStorage.getItem("cleanhub_s"); return s?JSON.parse(s):null; } catch { return null; }
  });
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [tab, setTab]     = useState("dashboard");
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [msgs,  setMsgs]  = useState(INITIAL_MESSAGES);

  function login(account, role){
    const s={account,role};
    setSession(s);
    try { sessionStorage.setItem("cleanhub_s",JSON.stringify(s)); } catch {}
    setTab("dashboard");
  }
  function logout(){
    setSession(null);
    try { sessionStorage.removeItem("cleanhub_s"); } catch {}
  }
  function switchRole(newRole){
    const s={...session,role:newRole};
    setSession(s);
    try { sessionStorage.setItem("cleanhub_s",JSON.stringify(s)); } catch {}
    setTab("dashboard");
  }

  if(!session) return <LoginScreen onLogin={login} />;

  const { account, role } = session;
  const rm = ROLE_META[role];
  const canSwitchRole = account.roles.length > 1;

  const tabs=[
    { id:"dashboard", icon:"⊞", label:"Главная"  },
    { id:"tasks",     icon:"✓",  label:"Задачи"   },
    { id:"objects",   icon:"🏠", label:"Объекты"  },
    { id:"messages",  icon:"💬", label:"Чат"      },
    ...(role!=="owner"?[{id:"supplies",icon:"📦",label:"Склад"}]:[]),
  ];

  return (
<div style={{ background:COLORS.bg, minHeight:"100vh", fontFamily:FONT, width:"100%", maxWidth:"100%", margin:"0 auto" }}>
      {/* HEADER */}
      <div style={{ position:"sticky", top:0, zIndex:100, background:`${COLORS.bg}ee`, backdropFilter:"blur(12px)", borderBottom:`1px solid ${COLORS.cardBorder}`, padding:"10px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ fontWeight:900, fontSize:20, color:COLORS.accent, letterSpacing:-0.5 }}>✨ CleanHub</div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {/* Role pill — tap to switch if multi-role */}
          <div onClick={()=>canSwitchRole&&setShowRoleSwitcher(true)}
            title={canSwitchRole?"Нажмите для смены роли":rm.label}
            style={{ display:"flex", alignItems:"center", gap:6, background:`${rm.color}18`, border:`1px solid ${rm.color}40`, borderRadius:20, padding:"4px 10px", cursor:canSwitchRole?"pointer":"default" }}>
            <span style={{ fontSize:14 }}>{rm.icon}</span>
            <span style={{ fontSize:11, color:rm.color, fontWeight:700 }}>{rm.label}</span>
            {canSwitchRole&&<span style={{ fontSize:11, color:rm.color, opacity:0.7 }}>⇄</span>}
          </div>
          <span style={{ fontSize:12, color:COLORS.text, fontWeight:600 }}>{account.name.split(" ")[0]}</span>
          <button onClick={logout} style={{ background:COLORS.card, border:`1px solid ${COLORS.cardBorder}`, color:COLORS.muted, borderRadius:8, padding:"4px 10px", cursor:"pointer", fontFamily:FONT, fontSize:11 }}>↩</button>
        </div>
      </div>

      {/* PAGE */}
      <div style={{ padding:"20px 16px 80px" }}>
        {tab==="dashboard"&&<Dashboard account={account} role={role} tasks={tasks} objects={INITIAL_OBJECTS}/>}
        {tab==="tasks"    &&<TasksView  account={account} role={role} tasks={tasks} objects={INITIAL_OBJECTS} setTasks={setTasks}/>}
        {tab==="objects"  &&<ObjectsView account={account} role={role} objects={INITIAL_OBJECTS} tasks={tasks}/>}
        {tab==="messages" &&<MessagesView account={account} role={role} messages={msgs} setMessages={setMsgs}/>}
        {tab==="supplies"    &&<SuppliesView role={role}/>}
      </div>

      {/* BOTTOM NAV */}
      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:480, background:`${COLORS.bg}f0`, backdropFilter:"blur(16px)", borderTop:`1px solid ${COLORS.cardBorder}`, display:"flex", justifyContent:"space-around", padding:"8px 0 12px", zIndex:100 }}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:3, padding:"6px 12px", borderRadius:10 }}>
            <span style={{ fontSize:20 }}>{t.icon}</span>
            <span style={{ fontSize:10, color:tab===t.id?COLORS.accent:COLORS.muted, fontFamily:FONT, fontWeight:tab===t.id?700:400 }}>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ROLE SWITCHER MODAL */}
      {showRoleSwitcher&&(
        <RoleSwitcher account={account} currentRole={role} onSwitch={switchRole} onClose={()=>setShowRoleSwitcher(false)}/>
      )}
    </div>
  );
}
