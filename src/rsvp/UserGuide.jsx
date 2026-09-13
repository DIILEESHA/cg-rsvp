// src/pages/UserGuide.jsx
import { useState } from "react";

const C = {
  ivory: "#faf6f0",
  blush: "#f2ddd5",
  rose: "#c9847a",
  deeprose: "#9c5a52",
  gold: "#b8952a",
  goldlt: "#f0e0a0",
  sage: "#8a9e8c",
  ink: "#3a2e2a",
  muted: "#8c7b72",
  white: "#ffffff",
  border: "#e8d9ce",
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500&display=swap');

  .ug-root * { box-sizing: border-box; }
  .ug-root {
    font-family: 'Jost', sans-serif;
    color: ${C.ink};
    background: ${C.ivory};
    min-height: 100vh;
  }

  /* ── hero ── */
  .ug-hero {
    background: ${C.white};
    border-bottom: 1px solid ${C.border};
    padding: 64px 48px 52px;
    position: relative;
    overflow: hidden;
  }
  .ug-hero::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 4px;
    background: linear-gradient(90deg, ${C.rose}, ${C.gold}, ${C.rose});
  }
  .ug-hero-ornament {
    font-family: 'Cormorant Garamond', serif;
    color: ${C.goldlt}; font-size: 120px; line-height: 1;
    position: absolute; right: 48px; top: 20px;
    pointer-events: none; user-select: none;
    font-style: italic; font-weight: 300;
  }
  .ug-hero-eyebrow {
    font-size: 11px; letter-spacing: .18em; text-transform: uppercase;
    color: ${C.rose}; margin-bottom: 14px; font-weight: 500;
  }
  .ug-hero-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 48px; font-weight: 600; color: ${C.deeprose};
    line-height: 1.1; margin-bottom: 12px;
  }
  .ug-hero-title em { font-style: italic; font-weight: 300; }
  .ug-hero-sub {
    font-size: 15px; color: ${C.muted}; max-width: 520px; line-height: 1.7;
  }
  .ug-hero-tags { display: flex; gap: 8px; margin-top: 24px; flex-wrap: wrap; }
  .ug-hero-tag {
    padding: 5px 14px; border-radius: 99px; font-size: 11px;
    letter-spacing: .06em; text-transform: uppercase; font-weight: 500;
    border: 1px solid ${C.border}; color: ${C.muted}; background: ${C.ivory};
  }

  /* ── layout ── */
  .ug-body { display: flex; max-width: 1100px; margin: 0 auto; padding: 48px 32px; gap: 40px; }
  @media(max-width:820px){ .ug-body { flex-direction: column; padding: 28px 20px; } }

  /* ── toc sidebar ── */
  .ug-toc { width: 200px; min-width: 200px; }
  .ug-toc-sticky { position: sticky; top: 28px; }
  .ug-toc-label {
    font-size: 10px; letter-spacing: .14em; text-transform: uppercase;
    color: ${C.rose}; font-weight: 500; margin-bottom: 14px;
  }
  .ug-toc-item {
    display: flex; align-items: center; gap: 8px;
    padding: 7px 0; font-size: 12px; color: ${C.muted};
    cursor: pointer; transition: color .18s; border: none;
    background: none; text-align: left; font-family: 'Jost', sans-serif;
    letter-spacing: .03em;
  }
  .ug-toc-item:hover { color: ${C.deeprose}; }
  .ug-toc-item.active { color: ${C.deeprose}; font-weight: 500; }
  .ug-toc-dot {
    width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
    background: ${C.border}; transition: background .18s;
  }
  .ug-toc-item.active .ug-toc-dot, .ug-toc-item:hover .ug-toc-dot { background: ${C.rose}; }
  @media(max-width:820px){ .ug-toc { width: 100%; } .ug-toc-sticky { position: static; } }

  /* ── sections ── */
  .ug-sections { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 48px; }

  .ug-section-header { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
  .ug-section-icon {
    width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; border: 1px solid ${C.border};
  }
  .ug-section-title {
    font-family: 'Cormorant Garamond', serif; font-size: 26px;
    font-weight: 600; color: ${C.deeprose};
  }
  .ug-section-desc { font-size: 13px; color: ${C.muted}; margin-top: 2px; }

  /* ── steps ── */
  .ug-steps { display: flex; flex-direction: column; gap: 0; }
  .ug-step {
    display: flex; gap: 20px; position: relative;
  }
  .ug-step-spine { display: flex; flex-direction: column; align-items: center; }
  .ug-step-num {
    width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 500; font-family: 'Cormorant Garamond', serif;
    font-size: 15px;
    background: linear-gradient(135deg, ${C.rose}, ${C.deeprose});
    color: ${C.white}; z-index: 1;
  }
  .ug-step-line {
    width: 1px; flex: 1; background: ${C.border}; margin: 4px 0;
    min-height: 24px;
  }
  .ug-step-body { padding: 4px 0 28px; flex: 1; min-width: 0; }
  .ug-step:last-child .ug-step-body { padding-bottom: 0; }
  .ug-step-title { font-size: 14px; font-weight: 500; color: ${C.ink}; margin-bottom: 6px; }
  .ug-step-desc { font-size: 13px; color: ${C.muted}; line-height: 1.65; }

  /* ── info card ── */
  .ug-card {
    background: ${C.white}; border: 1px solid ${C.border};
    border-radius: 12px; padding: 20px 24px;
    margin-bottom: 16px;
  }
  .ug-card-title { font-size: 13px; font-weight: 500; color: ${C.ink}; margin-bottom: 6px; }
  .ug-card-body { font-size: 13px; color: ${C.muted}; line-height: 1.65; }

  /* ── tip box ── */
  .ug-tip {
    background: #fdf8ec; border: 1px solid ${C.goldlt};
    border-left: 3px solid ${C.gold}; border-radius: 8px;
    padding: 12px 16px; margin-top: 12px;
    font-size: 12px; color: #7a6020; line-height: 1.6;
  }
  .ug-tip strong { color: ${C.gold}; font-weight: 500; }

  /* ── warning box ── */
  .ug-warn {
    background: #fff5f4; border: 1px solid #f5c6c2;
    border-left: 3px solid ${C.rose}; border-radius: 8px;
    padding: 12px 16px; margin-top: 12px;
    font-size: 12px; color: ${C.deeprose}; line-height: 1.6;
  }

  /* ── columns ── */
  .ug-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  @media(max-width:500px){ .ug-cols { grid-template-columns: 1fr; } }

  /* ── feature pill list ── */
  .ug-features { display: flex; flex-direction: column; gap: 12px; margin-top: 4px; }
  .ug-feature {
    display: flex; gap: 12px; align-items: flex-start;
    background: ${C.white}; border: 1px solid ${C.border};
    border-radius: 10px; padding: 14px 16px;
  }
  .ug-feature-icon {
    font-size: 18px; flex-shrink: 0; margin-top: 1px;
  }
  .ug-feature-title { font-size: 13px; font-weight: 500; color: ${C.ink}; margin-bottom: 3px; }
  .ug-feature-desc { font-size: 12px; color: ${C.muted}; line-height: 1.6; }

  /* ── csv table ── */
  .ug-csv-table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 12px; }
  .ug-csv-table th {
    background: ${C.ivory}; text-align: left;
    padding: 8px 12px; border: 1px solid ${C.border};
    font-size: 10px; letter-spacing: .08em; text-transform: uppercase; color: ${C.muted};
  }
  .ug-csv-table td {
    padding: 8px 12px; border: 1px solid ${C.border};
    color: ${C.ink}; font-family: 'Courier New', monospace; font-size: 12px;
  }
  .ug-csv-table tr:nth-child(even) td { background: ${C.ivory}; }

  /* ── nav page tabs (mobile) ── */
  .ug-section-anchor { scroll-margin-top: 24px; }

  /* ── divider ── */
  .ug-divider {
    border: none; border-top: 1px solid ${C.border}; margin: 0;
  }

  /* ── faq accordion ── */
  .ug-faq { display: flex; flex-direction: column; gap: 0; }
  .ug-faq-item { border-bottom: 1px solid ${C.border}; }
  .ug-faq-q {
    display: flex; justify-content: space-between; align-items: center;
    padding: 14px 0; cursor: pointer; font-size: 13px; font-weight: 500;
    color: ${C.ink}; background: none; border: none;
    text-align: left; width: 100%; font-family: 'Jost', sans-serif;
    gap: 12px;
  }
  .ug-faq-q:hover { color: ${C.deeprose}; }
  .ug-faq-chevron {
    font-size: 16px; color: ${C.rose}; flex-shrink: 0; transition: transform .2s;
  }
  .ug-faq-chevron.open { transform: rotate(180deg); }
  .ug-faq-a {
    font-size: 13px; color: ${C.muted}; line-height: 1.7;
    padding: 0 0 14px; display: none;
  }
  .ug-faq-a.open { display: block; }

  /* ── bottom nav ── */
  .ug-footer {
    background: ${C.white}; border-top: 1px solid ${C.border};
    padding: 32px 48px; text-align: center;
  }
  .ug-footer-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px; font-style: italic; color: ${C.deeprose}; margin-bottom: 6px;
  }
  .ug-footer-sub { font-size: 12px; color: ${C.muted}; letter-spacing: .05em; }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 99px; }
`;

/* ── data ── */
const SECTIONS = [
  { id: "overview", label: "Overview", icon: "✦" },
  { id: "admin", label: "Admin Dashboard", icon: "⊞" },
  { id: "guests", label: "Guest List", icon: "✿" },
  { id: "csv", label: "CSV Import", icon: "⬆" },
  { id: "rsvp", label: "RSVP Form", icon: "✉" },
  { id: "charts", label: "Charts & Stats", icon: "◈" },
  { id: "dietary", label: "Dietary", icon: "◇" },
  { id: "faq", label: "FAQ", icon: "?" },
];

const FAQ = [
  {
    q: "What happens if a guest's name doesn't match the list?",
    a: "The RSVP form will show a yellow warning saying the name wasn't found, but the guest can still submit. Their entry will be saved — it just won't have +1 settings pre-applied. You can review it in the admin dashboard later.",
  },
  {
    q: "Can I add a guest after someone has already RSVP'd?",
    a: "Yes. Adding a guest to the guest list is independent from RSVPs. You can add them at any time — it won't affect existing RSVP submissions.",
  },
  {
    q: "What if I forgot to add the +1 name when adding a guest?",
    a: "Currently you'd need to delete the guest and re-add them with the +1 name filled in. Make sure to check the guest list before sharing the RSVP link.",
  },
  {
    q: "How do I export the RSVP data?",
    a: "Go to the RSVPs tab in the admin dashboard and click the '⬇ Export CSV' button in the top bar. It downloads a CSV with all visible (filtered) entries — perfect for sharing with your caterer or event planner.",
  },
  
  {
    q: "Can two guests have the same name?",
    a: "The lookup uses exact name matching (case-insensitive). If two guests share a name, the system will match the first one it finds. Try to use full names (first + last) to avoid conflicts.",
  },
  {
    q: "How do I see who hasn't RSVP'd yet?",
    a: "Go to the Guest List tab. Each guest shows a 'Pending' status badge if they haven't submitted an RSVP yet. The Overview page also shows the total pending count in the stats cards.",
  },
];

/* ── Accordion item ── */
const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="ug-faq-item">
      <button className="ug-faq-q" onClick={() => setOpen((v) => !v)}>
        <span>{q}</span>
        <span className={`ug-faq-chevron ${open ? "open" : ""}`}>▾</span>
      </button>
      <div className={`ug-faq-a ${open ? "open" : ""}`}>{a}</div>
    </div>
  );
};

/* ── Step ── */
const Step = ({ n, title, desc, last }) => (
  <div className="ug-step">
    <div className="ug-step-spine">
      <div className="ug-step-num">{n}</div>
      {!last && <div className="ug-step-line" />}
    </div>
    <div className="ug-step-body">
      <div className="ug-step-title">{title}</div>
      <div className="ug-step-desc">{desc}</div>
    </div>
  </div>
);

/* ════════════════════════════════════════════════════════════════════════════ */
const UserGuide = () => {
  const [activeSection, setActiveSection] = useState("overview");

  const scrollTo = (id) => {
    setActiveSection(id);
    document
      .getElementById(`ug-${id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="ug-root">
      <style>{STYLES}</style>

      {/* ── Hero ── */}
      <div className="ug-hero">
        <div className="ug-hero-ornament">❧</div>
        <div className="ug-hero-eyebrow">Wedding RSVP System</div>
        <h1 className="ug-hero-title">
          How to use your
          <br />
          <em>admin dashboard</em>
        </h1>
        <p className="ug-hero-sub">
          Everything you need to manage your guest list, track RSVPs, and
          prepare for your big day — explained simply, step by step.
        </p>
        <div className="ug-hero-tags">
          <span className="ug-hero-tag">Admin Dashboard</span>
          <span className="ug-hero-tag">Guest List</span>
          <span className="ug-hero-tag">CSV Import</span>
          <span className="ug-hero-tag">RSVP Tracking</span>
          <span className="ug-hero-tag">Charts & Reports</span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="ug-body">
        {/* Sidebar TOC */}
        <aside className="ug-toc">
          <div className="ug-toc-sticky">
            <div className="ug-toc-label">On this page</div>
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                className={`ug-toc-item ${activeSection === s.id ? "active" : ""}`}
                onClick={() => scrollTo(s.id)}
              >
                <span className="ug-toc-dot" />
                {s.icon}&nbsp; {s.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <div className="ug-sections">
          {/* ── OVERVIEW ── */}
          <section id="ug-overview" className="ug-section-anchor">
            <div className="ug-section-header">
              <div
                className="ug-section-icon"
                style={{ background: "#fef0ee" }}
              >
                ✦
              </div>
              <div>
                <div className="ug-section-title">Overview</div>
                <div className="ug-section-desc">
                  How the whole system fits together
                </div>
              </div>
            </div>

            <p
              style={{
                fontSize: 14,
                color: C.muted,
                lineHeight: 1.75,
                marginBottom: 20,
              }}
            >
              Your wedding RSVP system has two parts — the{" "}
              <strong style={{ color: C.ink, fontWeight: 500 }}>
                Admin Dashboard
              </strong>{" "}
              (only you can access) and the{" "}
              <strong style={{ color: C.ink, fontWeight: 500 }}>
                RSVP Form
              </strong>{" "}
              (what your guests fill in). Here's how they connect:
            </p>

            <div className="ug-features">
              {[
                {
                  icon: "⊞",
                  title: "You add guests in the dashboard",
                  desc: "Before sharing the RSVP link, add each invited guest by name. You decide who gets a +1 and pre-fill their partner's name.",
                },
                {
                  icon: "✉",
                  title: "Guests fill in the RSVP form",
                  desc: "When a guest types their name, the form looks them up and automatically shows or hides the +1 section based on what you set.",
                },
                {
                  icon: "◈",
                  title: "Dashboard updates in real time",
                  desc: "Every RSVP submission appears instantly in your dashboard. Charts, counts, and the dietary list all update automatically.",
                },
                {
                  icon: "⬇",
                  title: "Export anytime",
                  desc: "Download a CSV of all RSVPs for your caterer, event planner, or personal records with one click.",
                },
              ].map((f) => (
                <div className="ug-feature" key={f.title}>
                  <div className="ug-feature-icon">{f.icon}</div>
                  <div>
                    <div className="ug-feature-title">{f.title}</div>
                    <div className="ug-feature-desc">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <hr className="ug-divider" />

          {/* ── ADMIN DASHBOARD ── */}
          <section id="ug-admin" className="ug-section-anchor">
            <div className="ug-section-header">
              <div
                className="ug-section-icon"
                style={{ background: "#f0f7ee" }}
              >
                ⊞
              </div>
              <div>
                <div className="ug-section-title">Admin Dashboard</div>
                <div className="ug-section-desc">
                  Logging in and finding your way around
                </div>
              </div>
            </div>

            <div className="ug-steps">
              <Step
                n="1"
                title="Go to the Admin page"
                desc="Navigate to /admin on your website. You'll see a lock screen asking for a password."
              />
              <Step
                n="2"
                title="Enter your password"
                desc={`Type your admin password and press Enter or click "Unlock Dashboard". The dashboard will open.`}
              />
              <Step
                n="3"
                title="Use the sidebar to navigate"
                desc="The left sidebar has four sections — Overview, RSVPs, Guest List, and Dietary. Click any item to switch pages. On mobile, tap the ☰ menu button in the top bar."
              />
              <Step
                n="4"
                title="Log out when you're done"
                desc={`Click "🔒 Logout" at the bottom of the sidebar. Your session is remembered in the browser tab, so you won't need to re-enter the password if you just refresh.`}
                last
              />
            </div>

            <div className="ug-tip">
              <strong>Tip:</strong> The dashboard works on phones too. The
              sidebar collapses automatically on small screens — tap the ☰ icon
              to open it.
            </div>
          </section>

          <hr className="ug-divider" />

          {/* ── GUEST LIST ── */}
          <section id="ug-guests" className="ug-section-anchor">
            <div className="ug-section-header">
              <div
                className="ug-section-icon"
                style={{ background: "#fdf8ec" }}
              >
                ✿
              </div>
              <div>
                <div className="ug-section-title">Guest List</div>
                <div className="ug-section-desc">
                  Adding and managing your invited guests
                </div>
              </div>
            </div>

            <p
              style={{
                fontSize: 14,
                color: C.muted,
                lineHeight: 1.7,
                marginBottom: 20,
              }}
            >
              The Guest List tab is where you control who's invited and who gets
              a +1.{" "}
              <strong style={{ color: C.ink, fontWeight: 500 }}>
                Add every guest before sharing your RSVP link
              </strong>{" "}
              — this is what makes the smart name lookup work.
            </p>

            <div className="ug-cols">
              <div className="ug-card">
                <div className="ug-card-title">➕ Adding a guest manually</div>
                <div className="ug-card-body">
                  Click <em>+ Add Guest</em> in the top bar. Fill in the guest's
                  full name, toggle the +1 switch if they can bring a partner,
                  and optionally type the partner's name. Click{" "}
                  <em>Add Guest</em> to save.
                </div>
              </div>
              <div className="ug-card">
                <div className="ug-card-title">🗑 Removing a guest</div>
                <div className="ug-card-body">
                  Find the guest in the table and click <em>Remove</em>. This
                  only removes them from the guest list — it does not delete any
                  RSVP they may have already submitted.
                </div>
              </div>
              <div className="ug-card">
                <div className="ug-card-title">✦ RSVP Status column</div>
                <div className="ug-card-body">
                  Each guest shows a status badge: <em>Attending</em>,{" "}
                  <em>Declined</em>, or <em>Pending</em>. Pending means they
                  haven't submitted an RSVP yet.
                </div>
              </div>
              <div className="ug-card">
                <div className="ug-card-title">🔍 Searching</div>
                <div className="ug-card-body">
                  Use the search bar at the top of the table to filter guests by
                  name. The count next to it shows how many guests (and how many
                  have a +1) are in the filtered view.
                </div>
              </div>
            </div>

            <div className="ug-warn">
              <strong>Important:</strong> Guest names must match exactly what
              guests type in the RSVP form. Use full names (first + last) to
              avoid mismatches. Matching is case-insensitive, so "priya sharma"
              and "Priya Sharma" are treated the same.
            </div>
          </section>

          <hr className="ug-divider" />

          {/* ── CSV IMPORT ── */}
          <section id="ug-csv" className="ug-section-anchor">
            <div className="ug-section-header">
              <div
                className="ug-section-icon"
                style={{ background: "#eef2ee" }}
              >
                ⬆
              </div>
              <div>
                <div className="ug-section-title">CSV Import</div>
                <div className="ug-section-desc">
                  Adding many guests at once from a spreadsheet
                </div>
              </div>
            </div>

            <p
              style={{
                fontSize: 14,
                color: C.muted,
                lineHeight: 1.7,
                marginBottom: 20,
              }}
            >
              If you have a lot of guests, it's faster to build the list in
              Excel or Google Sheets and import it all at once. Download the
              template, fill it in, and upload.
            </p>

            <div className="ug-steps">
              <Step
                n="1"
                title="Download the CSV template"
                desc="Get the guest_import_template.csv file. Open it in Excel, Google Sheets, or any spreadsheet app."
              />
              <Step
                n="2"
                title="Fill in your guest data"
                desc="Each row is one primary guest. Three columns — name, plus_one_name, and has_plus_one. See the example below."
              />
              <Step
                n="3"
                title="Save as CSV (.csv)"
                desc="Important: save the file as CSV format, not .xlsx or .xls. In Google Sheets use File → Download → CSV."
              />
              <Step
                n="4"
                title="Import in the dashboard"
                desc={`Go to Guest List tab, click "⬆ Import CSV", and select your file. A preview of the first 5 rows will appear.`}
              />
              <Step
                n="5"
                title="Confirm the import"
                desc={`Review the preview, then click "Confirm Import". All rows will be added to your guest list at once.`}
                last
              />
            </div>

            <div style={{ marginTop: 20 }}>
              <div
                style={{
                  fontSize: 12,
                  letterSpacing: ".06em",
                  textTransform: "uppercase",
                  color: C.muted,
                  marginBottom: 8,
                }}
              >
                Example CSV format
              </div>
              <table className="ug-csv-table">
                <thead>
                  <tr>
                    <th>name</th>
                    <th>plus_one_name</th>
                    <th>has_plus_one</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Priya Sharma</td>
                    <td>Arjun Sharma</td>
                    <td>yes</td>
                  </tr>
                  <tr>
                    <td>Meera Patel</td>
                    <td></td>
                    <td>no</td>
                  </tr>
                  <tr>
                    <td>Ravi Kapoor</td>
                    <td>Sunita Kapoor</td>
                    <td>yes</td>
                  </tr>
                  <tr>
                    <td>Ananya Singh</td>
                    <td></td>
                    <td>no</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="ug-tip" style={{ marginTop: 16 }}>
              <strong>Tip:</strong> Leave plus_one_name blank (empty cell) if
              you don't know the +1's name yet — the guest can still bring one,
              their name just won't be pre-filled on the form.
            </div>
          </section>

          <hr className="ug-divider" />

          {/* ── RSVP FORM ── */}
          <section id="ug-rsvp" className="ug-section-anchor">
            <div className="ug-section-header">
              <div
                className="ug-section-icon"
                style={{ background: "#fef0ee" }}
              >
                ✉
              </div>
              <div>
                <div className="ug-section-title">RSVP Form</div>
                <div className="ug-section-desc">
                  What your guests experience
                </div>
              </div>
            </div>

            <p
              style={{
                fontSize: 14,
                color: C.muted,
                lineHeight: 1.7,
                marginBottom: 20,
              }}
            >
              Guests visit the RSVP page and fill in a simple form. Here's what
              happens behind the scenes as they type:
            </p>

            <div className="ug-steps">
              <Step
                n="1"
                title="Guest types their full name"
                desc="As they type, the form quietly checks their name against your guest list. A small message confirms if they were found (green ✓) or not found (yellow ⚠)."
              />
              <Step
                n="2"
                title="+1 section appears (if allowed)"
                desc="If you gave them a +1, the 'Bringing a +1?' question appears automatically. Their partner's name is pre-filled and locked — the guest cannot change it."
              />
              <Step
                n="3"
                title="Guest selects yes or no to attending"
                desc="If they select No, a thank-you message appears and they can submit without filling anything else in."
              />
              <Step
                n="4"
                title="Guest fills in events, email, dietary notes"
                desc="Attending guests select which events they'll come to (Sangeet, Reception) and optionally note any dietary restrictions."
              />
              <Step
                n="5"
                title="Submit"
                desc="On clicking Submit RSVP, their response is saved instantly to Firebase and appears in your dashboard."
                last
              />
            </div>

            <div className="ug-cols" style={{ marginTop: 20 }}>
              <div className="ug-card">
                <div className="ug-card-title">🔒 Locked +1 name</div>
                <div className="ug-card-body">
                  The +1 name field is greyed out and read-only. Guests cannot
                  change it — only you can, through the dashboard. This ensures
                  the saved RSVP always uses the name you assigned.
                </div>
              </div>
              <div className="ug-card">
                <div className="ug-card-title">⚠ Name not on list</div>
                <div className="ug-card-body">
                  Guests not on the list still see the full form and can submit.
                  Their RSVP is saved normally — the +1 section simply won't
                  appear for them. You can review these entries in the RSVPs
                  tab.
                </div>
              </div>
            </div>
          </section>

          <hr className="ug-divider" />

          {/* ── CHARTS ── */}
          <section id="ug-charts" className="ug-section-anchor">
            <div className="ug-section-header">
              <div
                className="ug-section-icon"
                style={{ background: "#eef2ee" }}
              >
                ◈
              </div>
              <div>
                <div className="ug-section-title">Charts & Stats</div>
                <div className="ug-section-desc">
                  Understanding your Overview page at a glance
                </div>
              </div>
            </div>

            <p
              style={{
                fontSize: 14,
                color: C.muted,
                lineHeight: 1.7,
                marginBottom: 20,
              }}
            >
              The Overview tab is your command centre. Everything updates live
              as RSVPs come in.
            </p>

            <div className="ug-features">
              {[
                {
                  icon: "📊",
                  title: "6 stat cards at the top",
                  desc: "Total Responses, Attending, Total Guests (including +1s), Sangeet count, Reception count, and Response Rate %. Each card updates the moment a new RSVP is submitted.",
                },
                {
                  icon: "📈",
                  title: "Response progress bar",
                  desc: "Shows what percentage of your invited guest list has responded. The fill grows as more people RSVP — great for knowing when to follow up.",
                },
                {
                  icon: "🥧",
                  title: "Attendance pie chart",
                  desc: "Splits your responses into Attending, Declined, and Pending (invited but not yet responded). Percentages are shown inside each slice.",
                },
                {
                  icon: "📉",
                  title: "Event attendance bar chart",
                  desc: "Shows side-by-side bars for Sangeet and Reception, broken down into regular guests and plus-ones. Instantly see which event is bigger.",
                },
                {
                  icon: "📋",
                  title: "Recent responses table",
                  desc: "The last 5 RSVPs submitted, newest first. Click View to open the full detail for any entry. Click View All to go to the full RSVPs tab.",
                },
              ].map((f) => (
                <div className="ug-feature" key={f.title}>
                  <div className="ug-feature-icon">{f.icon}</div>
                  <div>
                    <div className="ug-feature-title">{f.title}</div>
                    <div className="ug-feature-desc">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <hr className="ug-divider" />

          {/* ── DIETARY ── */}
          <section id="ug-dietary" className="ug-section-anchor">
            <div className="ug-section-header">
              <div
                className="ug-section-icon"
                style={{ background: "#f0f7ee" }}
              >
                ◇
              </div>
              <div>
                <div className="ug-section-title">Dietary Notes</div>
                <div className="ug-section-desc">
                  Managing food requirements for your caterer
                </div>
              </div>
            </div>

            <p
              style={{
                fontSize: 14,
                color: C.muted,
                lineHeight: 1.7,
                marginBottom: 20,
              }}
            >
              The Dietary tab collects all guests who wrote a dietary
              restriction or allergy note when submitting their RSVP.
            </p>

            <div className="ug-steps">
              <Step
                n="1"
                title="Go to Dietary in the sidebar"
                desc="Click the ◇ Dietary nav item. You'll see a card for each guest who entered dietary information."
              />
              <Step
                n="2"
                title="Read each guest's note"
                desc="Each card shows the guest's name, email, and their exact note highlighted with a rose border on the left — easy to scan."
              />
              <Step
                n="3"
                title="Export for your caterer"
                desc={`Click "⬇ Export These Guests" at the bottom right to download a CSV of only the guests with dietary notes. Send this directly to your caterer.`}
                last
              />
            </div>

            <div className="ug-tip">
              <strong>Tip:</strong> If a guest has dietary requirements but
              didn't fill in the notes field, follow up with them directly. The
              export includes their email address for easy contact.
            </div>
          </section>

          <hr className="ug-divider" />

          {/* ── FAQ ── */}
          <section id="ug-faq" className="ug-section-anchor">
            <div className="ug-section-header">
              <div className="ug-section-icon" style={{ background: C.ivory }}>
                ?
              </div>
              <div>
                <div className="ug-section-title">
                  Frequently Asked Questions
                </div>
                <div className="ug-section-desc">
                  Quick answers to common questions
                </div>
              </div>
            </div>

            <div className="ug-faq">
              {FAQ.map((f) => (
                <FaqItem key={f.q} q={f.q} a={f.a} />
              ))}
            </div>
          </section>
        </div>
        {/* /ug-sections */}
      </div>
      {/* /ug-body */}

      {/* Footer */}
      <div className="ug-footer">
        <div className="ug-footer-title">Wishing you a beautiful wedding ❧</div>
        <div className="ug-footer-sub">
          This guide covers the current version of your RSVP system
        </div>
      </div>
    </div>
  );
};

export default UserGuide;
