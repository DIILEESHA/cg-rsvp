// src/pages/Admin.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  Space,
  Button,
  Modal,
  Form,
  Input,
  Typography,
  message,
  Tag,
  Drawer,
  Divider,
  Select,
  Popconfirm,
  Switch,
  Tooltip,
  Badge,
} from "antd";
import {
  UserAddOutlined,
  DeleteOutlined,
  FileExcelOutlined,
  LockOutlined,
  UploadOutlined,
  TeamOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  DashboardOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  addDoc,
} from "firebase/firestore";

const { Title, Text } = Typography;
const { Option } = Select;

const ADMIN_PWD = "CG27!";

/* ─── palette ────────────────────────────────────────────────────────────── */
const C = {
  ivory: "#faf6f0",
  blush: "#f2ddd5",
  rose: "#c9847a",
  deeprose: "#9c5a52",
  gold: "#b8952a",
  goldlt: "#e8d08a",
  sage: "#8a9e8c",
  ink: "#3a2e2a",
  muted: "#8c7b72",
  white: "#ffffff",
  border: "#e8d9ce",
};

/* ─── global styles injected once ───────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Jost:wght@300;400;500&display=swap');

  * { box-sizing: border-box; }

  body { background: ${C.ivory}; font-family: 'Jost', sans-serif; color: ${C.ink}; }

  .w-layout { display: flex; min-height: 100vh; }

  /* sidebar */
  .w-sidebar {
    width: 220px; min-width: 220px; background: ${C.white};
    border-right: 1px solid ${C.border}; display: flex; flex-direction: column;
    transition: width .25s; overflow: hidden;
  }
  .w-sidebar.collapsed { width: 0; min-width: 0; }
  .w-logo {
    padding: 28px 24px 20px; border-bottom: 1px solid ${C.border};
    font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 600;
    color: ${C.deeprose}; letter-spacing: .04em; white-space: nowrap;
  }
  .w-logo span { color: ${C.gold}; }
  .w-nav { padding: 16px 0; flex: 1; }
  .w-nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 11px 24px; font-size: 13px; font-weight: 400; letter-spacing: .04em;
    color: ${C.muted}; cursor: pointer; transition: all .18s; white-space: nowrap;
    border-right: 3px solid transparent;
  }
  .w-nav-item:hover { color: ${C.deeprose}; background: ${C.ivory}; }
  .w-nav-item.active { color: ${C.deeprose}; background: ${C.blush}; border-right-color: ${C.rose}; font-weight: 500; }
  .w-nav-item .nav-icon { font-size: 15px; }

  /* main */
  .w-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  .w-topbar {
    background: ${C.white}; border-bottom: 1px solid ${C.border};
    padding: 0 28px; height: 58px; display: flex; align-items: center;
    justify-content: space-between; gap: 16px;
  }
  .w-topbar-title {
    font-family: 'Cormorant Garamond', serif; font-size: 20px; font-style: italic;
    color: ${C.deeprose}; font-weight: 400;
  }
  .w-content { flex: 1; overflow-y: auto; padding: 28px; background: ${C.ivory}; }

  /* cards */
  .w-card {
    background: ${C.white}; border: 1px solid ${C.border};
    border-radius: 12px; padding: 24px;
    box-shadow: 0 2px 12px rgba(156,90,82,.07);
  }
  .w-card-sm { padding: 18px 22px; }

  /* stat cards */
  .w-stats { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px,1fr)); gap: 16px; margin-bottom: 24px; }
  .w-stat {
    background: ${C.white}; border: 1px solid ${C.border}; border-radius: 12px;
    padding: 20px 22px; position: relative; overflow: hidden;
  }
  .w-stat::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, ${C.rose}, ${C.gold});
  }
  .w-stat-val {
    font-family: 'Cormorant Garamond', serif; font-size: 38px; font-weight: 600;
    color: ${C.deeprose}; line-height: 1;
  }
  .w-stat-label { font-size: 11px; letter-spacing: .1em; text-transform: uppercase; color: ${C.muted}; margin-top: 6px; }
  .w-stat-sub { font-size: 12px; color: ${C.sage}; margin-top: 4px; }

  /* charts row */
  .w-charts { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
  @media(max-width:860px){ .w-charts { grid-template-columns: 1fr; } }
  .w-chart-title {
    font-family: 'Cormorant Garamond', serif; font-size: 17px; font-weight: 600;
    color: ${C.ink}; margin-bottom: 4px;
  }
  .w-chart-sub { font-size: 11px; color: ${C.muted}; letter-spacing:.05em; text-transform:uppercase; margin-bottom:16px; }

  /* table */
  .w-table-wrap .ant-table { font-family: 'Jost', sans-serif; font-size: 13px; }
  .w-table-wrap .ant-table-thead > tr > th {
    background: ${C.ivory} !important; color: ${C.muted};
    font-size: 11px; letter-spacing: .08em; text-transform: uppercase;
    border-bottom: 1px solid ${C.border} !important; font-weight: 500;
  }
  .w-table-wrap .ant-table-tbody > tr > td { border-bottom: 1px solid ${C.border} !important; }
  .w-table-wrap .ant-table-tbody > tr:hover > td { background: ${C.ivory} !important; }

  /* tags */
  .w-tag {
    display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 11px;
    letter-spacing: .04em; font-weight: 500;
  }
  .w-tag.yes { background: #fef0ee; color: ${C.deeprose}; border: 1px solid ${C.blush}; }
  .w-tag.no  { background: #f5f5f5; color: #999; border: 1px solid #e8e8e8; }
  .w-tag.gold { background: #fdf8ec; color: ${C.gold}; border: 1px solid ${C.goldlt}; }
  .w-tag.sage { background: #eef2ee; color: ${C.sage}; border: 1px solid #c8d8c8; }
  .w-tag.pending { background: #fafafa; color: #bbb; border: 1px solid #eee; }

  /* buttons */
  .w-btn {
    font-family: 'Jost', sans-serif; font-size: 12px; letter-spacing: .06em;
    text-transform: uppercase; border-radius: 6px; padding: 6px 16px;
    cursor: pointer; transition: all .18s; border: none; font-weight: 500;
  }
  .w-btn-primary {
    background: linear-gradient(135deg, ${C.rose}, ${C.deeprose});
    color: #fff; box-shadow: 0 2px 8px rgba(156,90,82,.3);
  }
  .w-btn-primary:hover { opacity: .88; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(156,90,82,.35); }
  .w-btn-outline {
    background: transparent; color: ${C.deeprose};
    border: 1px solid ${C.rose};
  }
  .w-btn-outline:hover { background: ${C.blush}; }
  .w-btn-ghost { background: transparent; color: ${C.muted}; border: 1px solid ${C.border}; }
  .w-btn-ghost:hover { border-color: ${C.rose}; color: ${C.deeprose}; }
  .w-btn-danger { background: transparent; color: #c0392b; border: 1px solid #f5c6c2; }
  .w-btn-danger:hover { background: #fff5f4; }

  /* divider */
  .w-divider { border: none; border-top: 1px solid ${C.border}; margin: 20px 0; }

  /* section heading */
  .w-section-heading {
    font-family: 'Cormorant Garamond', serif; font-size: 22px; font-style: italic;
    color: ${C.deeprose}; margin-bottom: 4px;
  }
  .w-section-sub { font-size: 12px; color: ${C.muted}; letter-spacing:.06em; text-transform:uppercase; margin-bottom:20px; }

  /* lock screen */
  .w-lock {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: ${C.ivory};
  }
  .w-lock-card {
    background: ${C.white}; border: 1px solid ${C.border}; border-radius: 16px;
    padding: 48px 44px; width: 380px; text-align: center;
    box-shadow: 0 8px 40px rgba(156,90,82,.12);
  }
  .w-lock-ornament { color: ${C.gold}; font-size: 36px; margin-bottom: 12px; }
  .w-lock-title {
    font-family: 'Cormorant Garamond', serif; font-size: 28px; color: ${C.deeprose};
    font-weight: 600; margin-bottom: 4px;
  }
  .w-lock-sub { font-size: 13px; color: ${C.muted}; margin-bottom: 28px; }
  .w-input {
    width: 100%; padding: 10px 14px; border: 1px solid ${C.border}; border-radius: 8px;
    font-family: 'Jost', sans-serif; font-size: 14px; color: ${C.ink};
    background: ${C.ivory}; outline: none; transition: border .18s;
    margin-bottom: 14px;
  }
  .w-input:focus { border-color: ${C.rose}; background: ${C.white}; }

  /* modal overrides */
  .w-modal .ant-modal-content { border-radius: 14px; border: 1px solid ${C.border}; }
  .w-modal .ant-modal-header { border-bottom: 1px solid ${C.border}; padding: 20px 24px 16px; }
  .w-modal .ant-modal-title {
    font-family: 'Cormorant Garamond', serif; font-size: 20px; color: ${C.deeprose}; font-weight: 600;
  }
  .w-modal .ant-form-item-label > label {
    font-size: 12px; letter-spacing: .05em; text-transform: uppercase; color: ${C.muted}; font-weight: 500;
  }
  .w-modal .ant-input, .w-modal .ant-input-password { border-color: ${C.border} !important; }
  .w-modal .ant-input:focus, .w-modal .ant-input-password:focus-within { border-color: ${C.rose} !important; }

  /* mobile hamburger */
  .w-hamburger { display: none; }
  @media(max-width:680px){
    .w-sidebar { position: fixed; top:0; left:0; bottom:0; z-index:200; }
    .w-sidebar.collapsed { width: 0; }
    .w-hamburger { display: flex; }
    .w-stats { grid-template-columns: 1fr 1fr; }
  }
  @media(max-width:420px){ .w-stats { grid-template-columns: 1fr; } }

  /* progress bar */
  .w-progress-track { background: ${C.blush}; border-radius: 99px; height: 6px; flex:1; }
  .w-progress-fill { background: linear-gradient(90deg,${C.rose},${C.gold}); border-radius: 99px; height: 6px; transition: width .6s; }

  /* csv preview */
  .w-csv-banner {
    background: #fdf8ec; border: 1px solid ${C.goldlt}; border-radius: 10px;
    padding: 16px 20px; margin-bottom: 20px;
  }

  /* detail rows in modal */
  .w-detail-row { display: flex; gap: 8px; padding: 8px 0; border-bottom: 1px solid ${C.border}; font-size: 13px; }
  .w-detail-row:last-child { border-bottom: none; }
  .w-detail-label { color: ${C.muted}; min-width: 110px; font-size: 11px; letter-spacing:.05em; text-transform:uppercase; padding-top:1px; }

  /* scrollbar */
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 99px; }
`;

/* ─── event definitions ─────────────────────────────────────────────────────
   Central source of truth for the 3 sub-events. Change labels/keys here only. */
const EVENTS = [
  { key: "welcomeParty", label: "Welcome Party", attendField: "attendWelcomeParty", plusOneField: "plusOneWelcomeParty", tag: "sage" },
  { key: "rehearsalDinner", label: "Rehearsal Dinner", attendField: "attendRehearsalDinner", plusOneField: "plusOneRehearsalDinner", tag: "gold" },
  { key: "theWedding", label: "The Wedding", attendField: "attendTheWedding", plusOneField: "plusOneTheWedding", tag: "yes" },
];

/* ─── helpers ────────────────────────────────────────────────────────────── */
const parseCSV = (text) => {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0]
    .split(",")
    .map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = values[i] ?? "";
    });
    return obj;
  });
};
const rowToGuest = (row) => ({
  name: row.name || row.full_name || row.fullname || "",
  plusOneName: row.plus_one_name || row.plusonename || row.plus_one || "",
  hasPlusOne: ["yes", "true", "1"].includes(
    String(row.has_plus_one ?? row.hasplusone ?? "no").toLowerCase(),
  ),
});
const exportToCSV = (data) => {
  if (!data.length) {
    message.warning("No data to export");
    return;
  }
  const headers = [
    "Full Name",
    "Email",
    "Phone",
    "Attending Wedding",
    "Welcome Party",
    "Rehearsal Dinner",
    "The Wedding",
    "Has +1",
    "+1 Name",
    "+1 Welcome Party",
    "+1 Rehearsal Dinner",
    "+1 The Wedding",
    "Dietary",
  ];
  const rows = data.map((r) =>
    [
      r.fullName,
      r.email,
      r.phone,
      r.attendingWedding,
      r.attendWelcomeParty ? "Yes" : "No",
      r.attendRehearsalDinner ? "Yes" : "No",
      r.attendTheWedding ? "Yes" : "No",
      r.hasPlusOne,
      r.plusOneName,
      r.plusOneWelcomeParty ? "Yes" : "No",
      r.plusOneRehearsalDinner ? "Yes" : "No",
      r.plusOneTheWedding ? "Yes" : "No",
      r.dietary,
    ].map((v) => `"${(v ?? "").toString().replace(/"/g, '""')}"`),
  );
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "rsvps.csv";
  a.click();
  URL.revokeObjectURL(url);
};

/* ─── WTag ───────────────────────────────────────────────────────────────── */
const WTag = ({ type, children }) => (
  <span className={`w-tag ${type}`}>{children}</span>
);

/* ─── StatCard ───────────────────────────────────────────────────────────── */
const StatCard = ({ value, label, sub }) => (
  <div className="w-stat">
    <div className="w-stat-val">{value}</div>
    <div className="w-stat-label">{label}</div>
    {sub && <div className="w-stat-sub">{sub}</div>}
  </div>
);

/* ─── Custom Pie label ───────────────────────────────────────────────────── */
const PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontFamily="Jost"
    >{`${(percent * 100).toFixed(0)}%`}</text>
  );
};

/* ════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!sessionStorage.getItem("admin_authenticated"),
  );
  const [pwdOpen, setPwdOpen] = useState(!isAuthenticated);
  const [pwdValue, setPwdValue] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [rsvpData, setRsvpData] = useState([]);
  const [guestList, setGuestList] = useState([]);
  const [viewing, setViewing] = useState(null);

  const [search, setSearch] = useState("");
  const [filterEvent, setFilterEvent] = useState("all");
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [guestModalOpen, setGuestModalOpen] = useState(false);
  const [guestForm] = Form.useForm();
  const [guestLoading, setGuestLoading] = useState(false);
  const [hasPlusOneField, setHasPlusOneField] = useState(false);

  const [csvPreview, setCsvPreview] = useState([]);
  const [csvImporting, setCsvImporting] = useState(false);
  const fileInputRef = useRef(null);

  /* ── fetch ── */
  const fetchRSVPs = async () => {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, "rsvps"));
      setRsvpData(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
      message.error("Failed to fetch RSVPs");
    } finally {
      setLoading(false);
    }
  };
  const fetchGuests = async () => {
    try {
      const snap = await getDocs(collection(db, "guests"));
      setGuestList(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    }
  };
  useEffect(() => {
    if (isAuthenticated) {
      fetchRSVPs();
      fetchGuests();
    }
  }, [isAuthenticated]);

  /* ── delete ── */
  const handleDeleteRSVP = async (id) => {
    try {
      await deleteDoc(doc(db, "rsvps", id));
      message.success("Entry removed");
      fetchRSVPs();
    } catch (e) {
      console.error(e);
      message.error("Delete failed");
    }
  };
  const handleDeleteGuest = async (id) => {
    try {
      await deleteDoc(doc(db, "guests", id));
      message.success("Guest removed");
      fetchGuests();
    } catch (e) {
      console.error(e);
    }
  };

  /* ── auth ── */
  const handleUnlock = () => {
    setPwdLoading(true);
    setTimeout(() => {
      setPwdLoading(false);
      if (pwdValue === ADMIN_PWD) {
        sessionStorage.setItem("admin_authenticated", "1");
        setIsAuthenticated(true);
        setPwdOpen(false);
        setPwdValue("");
        setPwdError("");
        fetchRSVPs();
        fetchGuests();
      } else {
        setPwdError("Incorrect password. Please try again.");
      }
    }, 350);
  };
  const handleLogout = () => {
    sessionStorage.removeItem("admin_authenticated");
    setIsAuthenticated(false);
    setPwdOpen(true);
    setRsvpData([]);
    setGuestList([]);
  };

  /* ── add guest ── */
  const handleAddGuest = async (values) => {
    setGuestLoading(true);
    try {
      await addDoc(collection(db, "guests"), {
        name: values.name.trim(),
        hasPlusOne: values.hasPlusOne || false,
        plusOneName: values.hasPlusOne ? (values.plusOneName || "").trim() : "",
      });
      message.success("Guest added!");
      guestForm.resetFields();
      setHasPlusOneField(false);
      setGuestModalOpen(false);
      fetchGuests();
    } catch (e) {
      console.error(e);
      message.error("Failed");
    } finally {
      setGuestLoading(false);
    }
  };

  /* ── csv ── */
  const handleCSVFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const rows = parseCSV(ev.target.result)
        .map(rowToGuest)
        .filter((g) => g.name);
      if (!rows.length) {
        message.error("No valid rows. Check CSV format.");
        return;
      }
      setCsvPreview(rows);
    };
    reader.readAsText(file);
    e.target.value = "";
  };
  const handleCSVImport = async () => {
    if (!csvPreview.length) return;
    setCsvImporting(true);
    try {
      await Promise.all(
        csvPreview.map((g) => addDoc(collection(db, "guests"), g)),
      );
      message.success(`${csvPreview.length} guests imported!`);
      setCsvPreview([]);
      fetchGuests();
    } catch (e) {
      console.error(e);
      message.error("Import failed");
    } finally {
      setCsvImporting(false);
    }
  };

  /* ── derived stats ── */
  const attending = rsvpData.filter((r) => r.attendingWedding === "yes");
  const notAttending = rsvpData.filter((r) => r.attendingWedding === "no");
  const withPlusOne = attending.filter((r) => r.hasPlusOne === "yes");
  const welcomePartyCount = attending.filter((r) => r.attendWelcomeParty).length;
  const rehearsalDinnerCount = attending.filter((r) => r.attendRehearsalDinner).length;
  const theWeddingCount = attending.filter((r) => r.attendTheWedding).length;
  const totalGuests = attending.length + withPlusOne.length;
  const pendingCount = Math.max(0, guestList.length - rsvpData.length);
  const responseRate = guestList.length
    ? Math.round((rsvpData.length / guestList.length) * 100)
    : 0;

  const attendancePie = [
    { name: "Attending", value: attending.length },
    { name: "Not Attending", value: notAttending.length },
    { name: "Pending", value: pendingCount },
  ].filter((d) => d.value > 0);
  const PIE_COLORS = [C.rose, C.sage, C.goldlt];

  const eventBar = EVENTS.map((ev) => ({
    event: ev.label,
    guests: attending.filter((r) => r[ev.attendField]).length,
    plusOnes: attending.filter(
      (r) => r[ev.attendField] && r.hasPlusOne === "yes" && r[ev.plusOneField],
    ).length,
  }));

  const dietaryGuests = attending.filter((r) => r.dietary && r.dietary.trim());

  /* ── filtered tables ── */
  const filteredRSVPs = rsvpData.filter((r) => {
    const q = (search || "").toLowerCase().trim();
    const ms =
      !q ||
      (r.fullName || "").toLowerCase().includes(q) ||
      (r.email || "").toLowerCase().includes(q);
    const me =
      filterEvent === "all"
        ? true
        : !!r[EVENTS.find((ev) => ev.key === filterEvent)?.attendField];
    return ms && me;
  });
  const filteredGuests = guestList.filter((g) => {
    const q = (search || "").toLowerCase().trim();
    return !q || (g.name || "").toLowerCase().includes(q);
  });

  /* ── RSVP columns ── */
  const rsvpCols = [
    {
      title: "Name",
      dataIndex: "fullName",
      sorter: (a, b) => (a.fullName || "").localeCompare(b.fullName || ""),
      render: (v) => <span style={{ fontWeight: 500 }}>{v}</span>,
    },
    {
      title: "Email",
      dataIndex: "email",
      responsive: ["md", "lg"],
      render: (v) => v || <span style={{ color: "#ccc" }}>—</span>,
    },
    {
      title: "Wedding",
      dataIndex: "attendingWedding",
      width: 110,
      render: (v) =>
        v === "yes" ? (
          <WTag type="yes">Attending</WTag>
        ) : (
          <WTag type="no">Declined</WTag>
        ),
      responsive: ["sm", "md", "lg"],
    },
    {
      title: "Events",
      responsive: ["md", "lg"],
      render: (_, r) => (
        <Space size={4} wrap>
          {EVENTS.map((ev) => (
            <WTag key={ev.key} type={r[ev.attendField] ? ev.tag : "no"}>
              {r[ev.attendField] ? ev.label : "—"}
            </WTag>
          ))}
        </Space>
      ),
    },
    {
      title: "+1",
      dataIndex: "hasPlusOne",
      width: 160,
      render: (v, r) =>
        v === "yes" ? (
          <div>
            <WTag type="yes">Yes</WTag>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>
              {r.plusOneName || "—"}
            </div>
          </div>
        ) : (
          <WTag type="no">No</WTag>
        ),
      responsive: ["md", "lg"],
    },
    {
      title: "",
      width: 130,
      render: (_, r) => (
        <Space>
          <button
            className="w-btn w-btn-outline"
            style={{ padding: "4px 12px", fontSize: 11 }}
            onClick={() => setViewing(r)}
          >
            View
          </button>
          <Popconfirm
            title="Remove this RSVP?"
            onConfirm={() => handleDeleteRSVP(r.id)}
          >
            <button
              className="w-btn w-btn-danger"
              style={{ padding: "4px 10px", fontSize: 11 }}
            >
              Delete
            </button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  /* ── guest columns ── */
  const guestCols = [
    {
      title: "Name",
      dataIndex: "name",
      sorter: (a, b) => (a.name || "").localeCompare(b.name || ""),
      render: (v) => <span style={{ fontWeight: 500 }}>{v}</span>,
    },
    {
      title: "Has +1",
      dataIndex: "hasPlusOne",
      render: (v) =>
        v ? <WTag type="yes">Yes</WTag> : <WTag type="no">No</WTag>,
    },
    {
      title: "+1 Name",
      dataIndex: "plusOneName",
      render: (v) => v || <span style={{ color: "#ccc" }}>—</span>,
    },
    {
      title: "RSVP Status",
      render: (_, r) => {
        const m = rsvpData.find(
          (rv) =>
            (rv.fullName || "").toLowerCase().trim() ===
            (r.name || "").toLowerCase().trim(),
        );
        return m ? (
          m.attendingWedding === "yes" ? (
            <WTag type="yes">Attending</WTag>
          ) : (
            <WTag type="no">Declined</WTag>
          )
        ) : (
          <WTag type="pending">Pending</WTag>
        );
      },
    },
    {
      title: "",
      render: (_, r) => (
        <Popconfirm
          title="Remove guest?"
          onConfirm={() => handleDeleteGuest(r.id)}
        >
          <button
            className="w-btn w-btn-danger"
            style={{ padding: "4px 10px", fontSize: 11 }}
          >
            Remove
          </button>
        </Popconfirm>
      ),
    },
  ];

  /* ── nav items ── */
  const navItems = [
    { key: "overview", icon: "✦", label: "Overview" },
    { key: "rsvps", icon: "✉", label: "RSVPs" },
    { key: "guests", icon: "✿", label: "Guest List" },
    { key: "dietary", icon: "◈", label: "Dietary" },
  ];

  const pageTitles = {
    overview: "Wedding Overview",
    rsvps: "RSVP Responses",
    guests: "Guest List",
    dietary: "Dietary Notes",
  };

  /* ════════════════════════ LOCK SCREEN ════════════════════════════════════ */
  if (!isAuthenticated)
    return (
      <>
        <style>{STYLES}</style>
        <div className="w-lock">
          <div className="w-lock-card">
            <div className="w-lock-ornament">❧</div>
            <div className="w-lock-title">Admin Portal</div>
            <div className="w-lock-sub">Enter your password to continue</div>
            <input
              className="w-input"
              type="password"
              placeholder="Password"
              value={pwdValue}
              onChange={(e) => {
                setPwdValue(e.target.value);
                setPwdError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
              autoFocus
            />
            {pwdError && (
              <div
                style={{
                  color: C.deeprose,
                  fontSize: 12,
                  marginBottom: 12,
                  marginTop: -6,
                }}
              >
                {pwdError}
              </div>
            )}
            <button
              className="w-btn w-btn-primary"
              style={{ width: "100%", padding: "10px" }}
              onClick={handleUnlock}
              disabled={pwdLoading}
            >
              {pwdLoading ? "Verifying…" : "Unlock Dashboard"}
            </button>
            <div
              style={{
                marginTop: 20,
                color: C.muted,
                fontSize: 11,
                letterSpacing: ".04em",
              }}
            >
              B R I D A L &nbsp; C O N T R O L &nbsp; C E N T R E
            </div>
          </div>
        </div>
      </>
    );

  /* ════════════════════════ DASHBOARD ══════════════════════════════════════ */
  return (
    <>
      <style>{STYLES}</style>
      <div className="w-layout">
        {/* ── Sidebar ── */}
        <div className={`w-sidebar ${sidebarOpen ? "" : "collapsed"}`}>
          <div className="w-logo">
            <span
              style={{
                fontSize: 13,
                fontWeight: 300,
                color: C.muted,
                fontStyle: "italic",
              }}
            >
              Admin
            </span>
          </div>
          <nav className="w-nav">
            {navItems.map((n) => (
              <div
                key={n.key}
                className={`w-nav-item ${activeTab === n.key ? "active" : ""}`}
                onClick={() => {
                  setActiveTab(n.key);
                  if (window.innerWidth < 680) setSidebarOpen(false);
                }}
              >
                <span className="nav-icon" style={{ fontSize: 13 }}>
                  {n.icon}
                </span>
                {n.label}
              </div>
            ))}
          </nav>
          <div
            style={{ padding: "16px 24px", borderTop: `1px solid ${C.border}` }}
          >
            <button
              className="w-btn w-btn-ghost"
              style={{ width: "100%", fontSize: 11 }}
              onClick={handleLogout}
            >
              🔒 &nbsp;Logout
            </button>
          </div>
        </div>

        {/* ── Main ── */}
        <div className="w-main">
          {/* Topbar */}
          <div className="w-topbar">
            <Space>
              <button
                className="w-btn w-btn-ghost w-hamburger"
                style={{ padding: "6px 10px" }}
                onClick={() => setSidebarOpen((v) => !v)}
              >
                ☰
              </button>
              <span className="w-topbar-title">{pageTitles[activeTab]}</span>
            </Space>
            <Space>
              {activeTab === "rsvps" && (
                <>
                  <button
                    className="w-btn w-btn-ghost"
                    style={{ fontSize: 11 }}
                    onClick={() => setFilterDrawerOpen(true)}
                  >
                    Filters
                  </button>
                  <button
                    className="w-btn w-btn-ghost"
                    style={{ fontSize: 11 }}
                    onClick={() => exportToCSV(filteredRSVPs)}
                  >
                    ⬇ Export CSV
                  </button>
                </>
              )}
              {activeTab === "guests" && (
                <>
                  <button
                    className="w-btn w-btn-primary"
                    style={{ fontSize: 11 }}
                    onClick={() => setGuestModalOpen(true)}
                  >
                    + Add Guest
                  </button>
                  <button
                    className="w-btn w-btn-ghost"
                    style={{ fontSize: 11 }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    ⬆ Import CSV
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    style={{ display: "none" }}
                    onChange={handleCSVFile}
                  />
                </>
              )}
            </Space>
          </div>

          {/* Content */}
          <div className="w-content">
            {/* ════════ OVERVIEW ════════ */}
            {activeTab === "overview" && (
              <>
                {/* Stats row */}
                <div className="w-stats">
                  <StatCard
                    value={rsvpData.length}
                    label="Total Responses"
                    sub={`of ${guestList.length} invited`}
                  />
                  <StatCard
                    value={attending.length}
                    label="Attending"
                    sub={`${notAttending.length} declined`}
                  />
                  <StatCard
                    value={totalGuests}
                    label="Total Guests"
                    sub={`incl. ${withPlusOne.length} plus-ones`}
                  />
                  <StatCard
                    value={welcomePartyCount}
                    label="Welcome Party"
                    sub="confirmed guests"
                  />
                  <StatCard
                    value={rehearsalDinnerCount}
                    label="Rehearsal Dinner"
                    sub="confirmed guests"
                  />
                  <StatCard
                    value={theWeddingCount}
                    label="The Wedding"
                    sub="confirmed guests"
                  />
                  <StatCard
                    value={`${responseRate}%`}
                    label="Response Rate"
                    sub={`${pendingCount} still pending`}
                  />
                </div>

                {/* Response rate bar */}
                {guestList.length > 0 && (
                  <div
                    className="w-card w-card-sm"
                    style={{ marginBottom: 16 }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 8,
                        fontSize: 12,
                      }}
                    >
                      <span
                        style={{
                          color: C.muted,
                          textTransform: "uppercase",
                          letterSpacing: ".06em",
                        }}
                      >
                        Response Progress
                      </span>
                      <span style={{ color: C.deeprose, fontWeight: 500 }}>
                        {rsvpData.length} / {guestList.length}
                      </span>
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div className="w-progress-track">
                        <div
                          className="w-progress-fill"
                          style={{ width: `${Math.min(100, responseRate)}%` }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: 13,
                          color: C.rose,
                          fontWeight: 600,
                          minWidth: 36,
                        }}
                      >
                        {responseRate}%
                      </span>
                    </div>
                  </div>
                )}

                {/* Charts */}
                <div className="w-charts">
                  {/* Attendance Pie */}
                  <div className="w-card">
                    <div className="w-chart-title">Attendance Breakdown</div>
                    <div className="w-chart-sub">
                      Who's coming to the wedding
                    </div>
                    {attendancePie.length ? (
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={attendancePie}
                            cx="50%"
                            cy="50%"
                            outerRadius={88}
                            dataKey="value"
                            labelLine={false}
                            label={PieLabel}
                          >
                            {attendancePie.map((_, i) => (
                              <Cell
                                key={i}
                                fill={PIE_COLORS[i % PIE_COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <RTooltip
                            contentStyle={{
                              fontFamily: "Jost",
                              fontSize: 12,
                              border: `1px solid ${C.border}`,
                              borderRadius: 8,
                            }}
                          />
                          <Legend
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ fontFamily: "Jost", fontSize: 12 }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div
                        style={{
                          height: 220,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: C.muted,
                          fontSize: 13,
                        }}
                      >
                        No responses yet
                      </div>
                    )}
                  </div>

                  {/* Event Bar */}
                  <div className="w-card">
                    <div className="w-chart-title">Event Attendance</div>
                    <div className="w-chart-sub">Guests per event</div>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={eventBar} barCategoryGap="30%">
                        <XAxis
                          dataKey="event"
                          axisLine={false}
                          tickLine={false}
                          style={{ fontFamily: "Jost", fontSize: 11 }}
                          interval={0}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          style={{ fontFamily: "Jost", fontSize: 11 }}
                          allowDecimals={false}
                        />
                        <RTooltip
                          contentStyle={{
                            fontFamily: "Jost",
                            fontSize: 12,
                            border: `1px solid ${C.border}`,
                            borderRadius: 8,
                          }}
                        />
                        <Legend
                          iconType="circle"
                          iconSize={8}
                          wrapperStyle={{ fontFamily: "Jost", fontSize: 12 }}
                        />
                        <Bar
                          dataKey="guests"
                          name="Guests"
                          fill={C.rose}
                          radius={[6, 6, 0, 0]}
                        />
                        <Bar
                          dataKey="plusOnes"
                          name="Plus-Ones"
                          fill={C.goldlt}
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Recent RSVPs */}
                <div className="w-card">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 16,
                    }}
                  >
                    <div>
                      <div className="w-chart-title">Recent Responses</div>
                      <div className="w-chart-sub" style={{ marginBottom: 0 }}>
                        Latest 5 submissions
                      </div>
                    </div>
                    <button
                      className="w-btn w-btn-outline"
                      style={{ fontSize: 11 }}
                      onClick={() => setActiveTab("rsvps")}
                    >
                      View All
                    </button>
                  </div>
                  <div className="w-table-wrap">
                    <Table
                      rowKey="id"
                      size="small"
                      pagination={false}
                      dataSource={[...rsvpData].slice(-5).reverse()}
                      columns={[
                        {
                          title: "Name",
                          dataIndex: "fullName",
                          render: (v) => (
                            <span style={{ fontWeight: 500 }}>{v}</span>
                          ),
                        },
                        {
                          title: "Status",
                          dataIndex: "attendingWedding",
                          render: (v) =>
                            v === "yes" ? (
                              <WTag type="yes">Attending</WTag>
                            ) : (
                              <WTag type="no">Declined</WTag>
                            ),
                        },
                        {
                          title: "+1",
                          dataIndex: "hasPlusOne",
                          render: (v) =>
                            v === "yes" ? (
                              <WTag type="sage">Yes</WTag>
                            ) : (
                              <WTag type="no">No</WTag>
                            ),
                        },
                        {
                          title: "",
                          render: (_, r) => (
                            <button
                              className="w-btn w-btn-ghost"
                              style={{ fontSize: 11, padding: "3px 10px" }}
                              onClick={() => setViewing(r)}
                            >
                              View
                            </button>
                          ),
                        },
                      ]}
                    />
                  </div>
                </div>
              </>
            )}

            {/* ════════ RSVPS ════════ */}
            {activeTab === "rsvps" && (
              <div className="w-card">
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    marginBottom: 18,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <input
                    className="w-input"
                    style={{ margin: 0, maxWidth: 260, flex: 1 }}
                    placeholder="Search name or email…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <span style={{ fontSize: 12, color: C.muted }}>
                    {filteredRSVPs.length} results
                  </span>
                </div>
                <div className="w-table-wrap">
                  <Table
                    rowKey="id"
                    loading={loading}
                    columns={rsvpCols}
                    dataSource={filteredRSVPs}
                    pagination={{ pageSize: 10, size: "small" }}
                    scroll={{ x: "max-content" }}
                  />
                </div>
              </div>
            )}

            {/* ════════ GUESTS ════════ */}
            {activeTab === "guests" && (
              <div className="w-card">
                {/* CSV preview */}
                {csvPreview.length > 0 && (
                  <div className="w-csv-banner">
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "center",
                        marginBottom: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      <span style={{ fontWeight: 500, color: C.gold }}>
                        ✦ {csvPreview.length} guests ready to import
                      </span>
                      <button
                        className="w-btn w-btn-primary"
                        style={{ fontSize: 11, padding: "5px 14px" }}
                        onClick={handleCSVImport}
                        disabled={csvImporting}
                      >
                        {csvImporting ? "Importing…" : "Confirm Import"}
                      </button>
                      <button
                        className="w-btn w-btn-ghost"
                        style={{ fontSize: 11, padding: "5px 12px" }}
                        onClick={() => setCsvPreview([])}
                      >
                        Cancel
                      </button>
                    </div>
                    <div className="w-table-wrap">
                      <Table
                        size="small"
                        pagination={false}
                        rowKey="name"
                        dataSource={csvPreview.slice(0, 5)}
                        columns={[
                          { title: "Name", dataIndex: "name" },
                          {
                            title: "+1?",
                            dataIndex: "hasPlusOne",
                            render: (v) => (v ? "Yes" : "No"),
                            width: 60,
                          },
                          {
                            title: "+1 Name",
                            dataIndex: "plusOneName",
                            render: (v) => v || "—",
                          },
                        ]}
                      />
                    </div>
                    {csvPreview.length > 5 && (
                      <div
                        style={{ fontSize: 11, color: C.muted, marginTop: 6 }}
                      >
                        …and {csvPreview.length - 5} more rows
                      </div>
                    )}
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    marginBottom: 18,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <input
                    className="w-input"
                    style={{ margin: 0, maxWidth: 260, flex: 1 }}
                    placeholder="Search guest name…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <span style={{ fontSize: 12, color: C.muted }}>
                    {filteredGuests.length} guests ·{" "}
                    {guestList.filter((g) => g.hasPlusOne).length} with +1
                  </span>
                </div>
                <div className="w-table-wrap">
                  <Table
                    rowKey="id"
                    loading={loading}
                    columns={guestCols}
                    dataSource={filteredGuests}
                    pagination={{ pageSize: 12, size: "small" }}
                    scroll={{ x: "max-content" }}
                  />
                </div>
              </div>
            )}

            {/* ════════ DIETARY ════════ */}
            {activeTab === "dietary" && (
              <div className="w-card">
                <div style={{ marginBottom: 20 }}>
                  <div className="w-chart-title">Dietary Restrictions</div>
                  <div className="w-chart-sub">
                    {dietaryGuests.length} guests with notes
                  </div>
                </div>
                {dietaryGuests.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px 0",
                      color: C.muted,
                      fontSize: 14,
                    }}
                  >
                    No dietary restrictions noted yet.
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: 12 }}>
                    {dietaryGuests.map((r) => (
                      <div
                        key={r.id}
                        style={{
                          background: C.ivory,
                          border: `1px solid ${C.border}`,
                          borderRadius: 10,
                          padding: "14px 18px",
                          display: "flex",
                          gap: 16,
                          alignItems: "flex-start",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500, marginBottom: 3 }}>
                            {r.fullName}
                          </div>
                          <div style={{ fontSize: 12, color: C.muted }}>
                            {r.email || "No email"}
                          </div>
                        </div>
                        <div
                          style={{
                            flex: 2,
                            fontSize: 13,
                            color: C.ink,
                            lineHeight: 1.55,
                            borderLeft: `2px solid ${C.rose}`,
                            paddingLeft: 14,
                          }}
                        >
                          {r.dietary}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div
                  style={{
                    marginTop: 16,
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    className="w-btn w-btn-ghost"
                    style={{ fontSize: 11 }}
                    onClick={() => exportToCSV(dietaryGuests)}
                  >
                    ⬇ Export These Guests
                  </button>
                </div>
              </div>
            )}
          </div>
          {/* /w-content */}
        </div>
        {/* /w-main */}
      </div>
      {/* /w-layout */}

      {/* ── VIEW RSVP MODAL ── */}
      <Modal
        className="w-modal"
        title={viewing?.fullName}
        open={!!viewing}
        onCancel={() => setViewing(null)}
        footer={null}
        width={460}
      >
        {viewing && (
          <div style={{ paddingTop: 4 }}>
            {[
              ["Email", viewing.email || "—"],
              ["Phone", viewing.phone || "—"],
              [
                "Wedding",
                viewing.attendingWedding === "yes" ? "Attending" : "Declined",
              ],
              [
                "Events",
                EVENTS.filter((ev) => viewing[ev.attendField])
                  .map((ev) => ev.label)
                  .join(", ") || "—",
              ],
              ["Plus-One", viewing.hasPlusOne === "yes" ? "Yes" : "No"],
              ...(viewing.hasPlusOne === "yes"
                ? [
                    ["+1 Name", viewing.plusOneName || "—"],
                    [
                      "+1 Events",
                      EVENTS.filter((ev) => viewing[ev.plusOneField])
                        .map((ev) => ev.label)
                        .join(", ") || "—",
                    ],
                  ]
                : []),
              ["Dietary", viewing.dietary || "—"],
            ].map(([label, val]) => (
              <div className="w-detail-row" key={label}>
                <span className="w-detail-label">{label}</span>
                <span style={{ color: C.ink }}>{val}</span>
              </div>
            ))}
            <div style={{ marginTop: 20 }}>
              <Popconfirm
                title="Delete this RSVP entry?"
                onConfirm={() => {
                  handleDeleteRSVP(viewing.id);
                  setViewing(null);
                }}
              >
                <button className="w-btn w-btn-danger" style={{ fontSize: 12 }}>
                  ✕ &nbsp;Delete Entry
                </button>
              </Popconfirm>
            </div>
          </div>
        )}
      </Modal>

      {/* ── ADD GUEST MODAL ── */}
      <Modal
        className="w-modal"
        title="Add Guest to List"
        open={guestModalOpen}
        onCancel={() => {
          setGuestModalOpen(false);
          guestForm.resetFields();
          setHasPlusOneField(false);
        }}
        footer={null}
        width={420}
      >
        <Form
          form={guestForm}
          layout="vertical"
          onFinish={handleAddGuest}
          initialValues={{ hasPlusOne: false }}
          style={{ paddingTop: 8 }}
        >
          <Form.Item
            label="Guest Full Name"
            name="name"
            rules={[{ required: true, message: "Name is required" }]}
          >
            <Input
              placeholder="e.g. Priya Sharma"
              style={{ borderColor: C.border }}
            />
          </Form.Item>
          <Form.Item
            label="Has a +1?"
            name="hasPlusOne"
            valuePropName="checked"
          >
            <Switch
              onChange={(checked) => {
                setHasPlusOneField(checked);
                if (!checked) guestForm.setFieldValue("plusOneName", "");
              }}
              style={{ background: hasPlusOneField ? C.rose : "#ddd" }}
            />
          </Form.Item>
          {hasPlusOneField && (
            <Form.Item label="+1 Full Name (optional)" name="plusOneName">
              <Input
                placeholder="Leave blank if unknown"
                style={{ borderColor: C.border }}
              />
            </Form.Item>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              marginTop: 8,
            }}
          >
            <button
              type="button"
              className="w-btn w-btn-ghost"
              onClick={() => {
                setGuestModalOpen(false);
                guestForm.resetFields();
                setHasPlusOneField(false);
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-btn w-btn-primary"
              disabled={guestLoading}
            >
              {guestLoading ? "Adding…" : "Add Guest"}
            </button>
          </div>
        </Form>
      </Modal>

      {/* ── FILTER DRAWER ── */}
      <Drawer
        title={
          <span
            style={{
              fontFamily: "Cormorant Garamond,serif",
              fontSize: 18,
              color: C.deeprose,
            }}
          >
            Filter RSVPs
          </span>
        }
        placement="right"
        width={300}
        onClose={() => setFilterDrawerOpen(false)}
        open={filterDrawerOpen}
      >
        <div
          style={{
            marginBottom: 8,
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: ".07em",
            color: C.muted,
          }}
        >
          By Event
        </div>
        <Select
          value={filterEvent}
          onChange={setFilterEvent}
          style={{ width: "100%", marginBottom: 20 }}
        >
          <Option value="all">All Events</Option>
          {EVENTS.map((ev) => (
            <Option key={ev.key} value={ev.key}>
              {ev.label} Only
            </Option>
          ))}
        </Select>
        <hr className="w-divider" />
        <button
          className="w-btn w-btn-primary"
          style={{ width: "100%", padding: "10px" }}
          onClick={() => setFilterDrawerOpen(false)}
        >
          Apply Filters
        </button>
      </Drawer>
    </>
  );
};

export default Admin;