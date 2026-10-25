import { useState, useEffect, useMemo } from "react";
import "./rsv.css";
import { db } from "../firebaseConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Select, Checkbox, Input, Button } from "antd";

const { TextArea } = Input;
const { Option } = Select;

/* ── config ─────────────────────────────────────────────────────────────── */
// false = names that are not on the guest list cannot submit.
// true  = they can submit, but only for The Wedding and with no plus-ones.
const ALLOW_UNLISTED = false;

const EVENTS = [
  { key: "welcomeParty", label: "Welcome Party", field: "attendWelcomeParty", plusField: "plusOneWelcomeParty" },
  { key: "rehearsalDinner", label: "Rehearsal Dinner", field: "attendRehearsalDinner", plusField: "plusOneRehearsalDinner" },
  { key: "theWedding", label: "The Wedding", field: "attendTheWedding", plusField: "plusOneTheWedding" },
];
const ALL_KEYS = EVENTS.map((e) => e.key);

const MEALS = [
  { value: "steak", label: "Steak" },
  { value: "fish", label: "Fish" },
  { value: "vegetarian", label: "Vegetarian" },
];
// Meal choice is only asked if they attend one of these events
const MEAL_EVENTS = ["rehearsalDinner", "theWedding"];

/* ── helpers ────────────────────────────────────────────────────────────── */
const normName = (n) => (n || "").toLowerCase().trim().replace(/\s+/g, " ");

const noEvents = () => ({ welcomeParty: false, rehearsalDinner: false, theWedding: false });
const emptyPlusOne = (name = "") => ({ name, events: noEvents(), meal: "" });

// Guest list docs support old format (hasPlusOne / plusOneName) and new format
const getInvited = (g) =>
  Array.isArray(g.invitedEvents) && g.invitedEvents.length ? g.invitedEvents : ALL_KEYS;
const getMaxPlusOnes = (g) =>
  typeof g.maxPlusOnes === "number" ? g.maxPlusOnes : g.hasPlusOne ? 1 : 0;
const getAssignedNames = (g) =>
  Array.isArray(g.plusOneNames) ? g.plusOneNames : g.plusOneName ? [g.plusOneName] : [];

const needsMeal = (events, invited) =>
  MEAL_EVENTS.some((k) => events[k] && invited.includes(k));

const Rsvp = () => {
  const [guestList, setGuestList] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [debouncedName, setDebouncedName] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    attendingWedding: "",
    email: "",
    phone: "",
    meal: "",
    dietary: "",
  });
  const [events, setEvents] = useState(noEvents());
  const [plusOnes, setPlusOnes] = useState([]);

  /* fetch guest list once */
  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, "guests"));
        setGuestList(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error("Could not load guest list", e);
      } finally {
        setListLoading(false);
      }
    })();
  }, []);

  /* debounce name (400ms) */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedName(formData.fullName), 400);
    return () => clearTimeout(t);
  }, [formData.fullName]);

  // null = nothing typed / still checking, false = not on list, object = guest
  const guestRecord = useMemo(() => {
    if (!debouncedName.trim()) return null;
    return guestList.find((g) => normName(g.name) === normName(debouncedName)) || false;
  }, [debouncedName, guestList]);

  const checking =
    !!formData.fullName.trim() &&
    (listLoading || normName(formData.fullName) !== normName(debouncedName));

  // Reset events / plus-ones whenever a different guest gets matched
  const guestKey = guestRecord ? guestRecord.id : String(guestRecord);
  useEffect(() => {
    setEvents(noEvents());
    setPlusOnes([]);
    setFormData((f) => ({ ...f, meal: "" }));
  }, [guestKey]);

  const blocked = !checking && guestRecord === false && !ALLOW_UNLISTED;
  const invited = guestRecord ? getInvited(guestRecord) : ["theWedding"];
  const maxPlusOnes = guestRecord ? getMaxPlusOnes(guestRecord) : 0;
  const assigned = guestRecord ? getAssignedNames(guestRecord) : [];
  const invitedEvents = EVENTS.filter((e) => invited.includes(e.key));

  /* ── handlers ── */
  const setField = (name, value) => setFormData((f) => ({ ...f, [name]: value }));

  const setPlusOneCount = (n) => {
    setPlusOnes((prev) =>
      Array.from({ length: n }, (_, i) => prev[i] || emptyPlusOne(assigned[i] || ""))
    );
  };
  const updatePlusOne = (i, patch) =>
    setPlusOnes((prev) => prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  const updatePlusOneEvent = (i, key, checked) =>
    setPlusOnes((prev) =>
      prev.map((p, idx) =>
        idx === i ? { ...p, events: { ...p.events, [key]: checked } } : p
      )
    );

  const err = (msg) => toast.error(msg, { position: "top-center" });

  const resetForm = () => {
    setFormData({ fullName: "", attendingWedding: "", email: "", phone: "", meal: "", dietary: "" });
    setDebouncedName("");
    setEvents(noEvents());
    setPlusOnes([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim()) return err("Please enter your full name.");
    if (checking) return err("Still checking the guest list, try again in a second.");
    if (blocked) return err("We couldn't find your name on the guest list.");
    if (!formData.attendingWedding) return err("Please let us know if you're attending.");

    const base = {
      guestId: guestRecord ? guestRecord.id : "",
      fullName: guestRecord ? guestRecord.name : formData.fullName.trim(),
      attendingWedding: formData.attendingWedding,
      createdAt: new Date().toISOString(),
    };

    let payload;

    if (formData.attendingWedding === "no") {
      payload = {
        ...base,
        email: formData.email.trim(),
        phone: "",
        attendWelcomeParty: false,
        attendRehearsalDinner: false,
        attendTheWedding: false,
        meal: "",
        hasPlusOne: "no",
        plusOneName: "",
        plusOneWelcomeParty: false,
        plusOneRehearsalDinner: false,
        plusOneTheWedding: false,
        plusOnes: [],
        dietary: "",
      };
    } else {
      if (!formData.email.trim()) return err("Please enter your email.");

      // Only keep events they are actually invited to
      const myEvents = {};
      ALL_KEYS.forEach((k) => (myEvents[k] = invited.includes(k) && !!events[k]));
      if (!ALL_KEYS.some((k) => myEvents[k])) return err("Please select at least one event.");
      if (needsMeal(myEvents, invited) && !formData.meal) return err("Please choose your meal.");

      const cleanPlusOnes = [];
      for (let i = 0; i < Math.min(plusOnes.length, maxPlusOnes); i++) {
        const p = plusOnes[i];
        const name = (assigned[i] || p.name || "").trim();
        const pe = {};
        ALL_KEYS.forEach((k) => (pe[k] = invited.includes(k) && !!p.events[k]));
        if (!name) return err(`Please enter the name for guest #${i + 1}.`);
        if (!ALL_KEYS.some((k) => pe[k])) return err(`Please select events for ${name}.`);
        if (needsMeal(pe, invited) && !p.meal) return err(`Please choose a meal for ${name}.`);
        cleanPlusOnes.push({ name, events: pe, meal: needsMeal(pe, invited) ? p.meal : "" });
      }

      payload = {
        ...base,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        attendWelcomeParty: myEvents.welcomeParty,
        attendRehearsalDinner: myEvents.rehearsalDinner,
        attendTheWedding: myEvents.theWedding,
        meal: needsMeal(myEvents, invited) ? formData.meal : "",
        // legacy fields so older admin views / exports keep working
        hasPlusOne: cleanPlusOnes.length ? "yes" : "no",
        plusOneName: cleanPlusOnes.map((p) => p.name).join(", "),
        plusOneWelcomeParty: cleanPlusOnes.some((p) => p.events.welcomeParty),
        plusOneRehearsalDinner: cleanPlusOnes.some((p) => p.events.rehearsalDinner),
        plusOneTheWedding: cleanPlusOnes.some((p) => p.events.theWedding),
        plusOnes: cleanPlusOnes,
        dietary: formData.dietary.trim(),
      };
    }

    try {
      await addDoc(collection(db, "rsvps"), payload);
      toast.success("🎉 RSVP Submitted Successfully!", { position: "top-center" });
      resetForm();
    } catch (error) {
      console.error(error);
      err("❌ Something went wrong. Try again.");
    }
  };

  /* ── small render helpers ── */
  const EventChecks = ({ values, onToggle }) =>
    invitedEvents.map((ev) => (
      <div key={ev.key}>
        <Checkbox
          checked={!!values[ev.key]}
          onChange={(e) => onToggle(ev.key, e.target.checked)}
          className="foa"
        >
          {ev.label}
        </Checkbox>
        <div className="ko"></div>
      </div>
    ));

  const MealSelect = ({ value, onChange }) => (
    <Select
      className="rsvp_select"
      value={value || undefined}
      placeholder="-- Select a meal --"
      onChange={onChange}
    >
      {MEALS.map((m) => (
        <Option key={m.value} value={m.value}>
          {m.label}
        </Option>
      ))}
    </Select>
  );

  return (
    <div className="rsvps">
      <ToastContainer />

      {/* Breadcrumb */}
      <div className="bread_crumb">
        <div className="bread_crumb_opt">
          <h2 className="home_title io">home</h2>
        </div>
        <div className="bread_crumb_opt">
          <h2 className="home_title">|</h2>
        </div>
        <div className="bread_crumb_opt">
          <h2 className="home_title">rsvp</h2>
        </div>
      </div>

      {/* Header */}
      <div className="rsvp_contain">
        <h2 className="rsvp_title">
          <span className="first">r</span>svp
        </h2>
        <p className="rsvp_para">Let Us Know You're Coming</p>
      </div>

      <div className="rsvp_form_section">
        <form className="rsvp_form" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="form_section">
            <label className="rsvp_label">Full Name</label>
            <Input
              className="rsvp_input"
              name="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={(e) => setField("fullName", e.target.value)}
            />
            {formData.fullName.trim() && (
              <div style={{ fontSize: 12, marginTop: 4 }}>
                {checking && <span style={{ color: "#aaa" }}>Checking guest list…</span>}
                {!checking && blocked && (
                  <span style={{ color: "#ff7875" }}>
                    We couldn't find that name. Please enter it exactly as on your invitation.
                  </span>
                )}
                {!checking && guestRecord === false && ALLOW_UNLISTED && (
                  <span style={{ color: "#faad14" }}>
                    ⚠️ Name not found on guest list — you can still submit.
                  </span>
                )}
                {!checking && guestRecord && (
                  <span style={{ color: "#52c41a" }}>
                    ✓ Welcome, {guestRecord.name}!
                    {maxPlusOnes > 0 &&
                      ` You may bring up to ${maxPlusOnes} guest${maxPlusOnes > 1 ? "s" : ""}.`}
                  </span>
                )}
              </div>
            )}
          </div>

          {!checking && !blocked && formData.fullName.trim() && (
            <>
              {/* Attending */}
              <div className="form_section">
                <label className="rsvp_label">Will you be attending?</label>
                <Select
                  className="rsvp_select"
                  value={formData.attendingWedding || undefined}
                  placeholder="-- Select an option --"
                  onChange={(v) => setField("attendingWedding", v)}
                >
                  <Option value="no">No, I cannot attend</Option>
                  <Option value="yes">Yes, I will attend</Option>
                </Select>
              </div>

              {/* Not attending */}
              {formData.attendingWedding === "no" && (
                <div className="thank_you_box">
                  <p className="thank_you_msg">
                    Thank you for letting us know! We will miss you at the wedding. 💛
                  </p>
                  <Button type="primary" htmlType="submit" className="submit_btn" block>
                    Submit Response
                  </Button>
                </div>
              )}

              {/* Attending */}
              {formData.attendingWedding === "yes" && (
                <>
                  <div className="form_section">
                    <label className="rsvp_label">Email</label>
                    <Input
                      className="rsvp_input"
                      name="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={(e) => setField("email", e.target.value)}
                    />
                  </div>

                  <div className="form_section">
                    <label className="rsvp_label">
                      Phone Number <span style={{ color: "#aaa", fontWeight: 400 }}>(optional)</span>
                    </label>
                    <Input
                      className="rsvp_input"
                      name="phone"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={(e) => setField("phone", e.target.value)}
                    />
                  </div>

                  {/* Events — only the ones this guest is invited to */}
                  <div className="form_section">
                    <label className="rsvp_label">What events will you be attending?</label>
                    <EventChecks
                      values={events}
                      onToggle={(k, c) => setEvents((ev) => ({ ...ev, [k]: c }))}
                    />
                  </div>

                  {/* Meal */}
                  {needsMeal(events, invited) && (
                    <div className="form_section">
                      <label className="rsvp_label">Your meal choice</label>
                      <MealSelect value={formData.meal} onChange={(v) => setField("meal", v)} />
                    </div>
                  )}

                  {/* Plus-ones */}
                  {maxPlusOnes > 0 && (
                    <>
                      <div className="form_section">
                        <label className="rsvp_label">
                          {maxPlusOnes === 1
                            ? "Will you be bringing a +1?"
                            : `How many guests are you bringing? (up to ${maxPlusOnes})`}
                        </label>
                        <Select
                          className="rsvp_select"
                          value={plusOnes.length}
                          onChange={setPlusOneCount}
                        >
                          {Array.from({ length: maxPlusOnes + 1 }, (_, n) => (
                            <Option key={n} value={n}>
                              {n === 0 ? "None" : n}
                            </Option>
                          ))}
                        </Select>
                      </div>

                      {plusOnes.map((p, i) => (
                        <div
                          key={i}
                          style={{
                            border: "1px solid #dddddd4d",
                            padding: 16,
                            marginBottom: 20,
                          }}
                        >
                          <label className="rsvp_label" style={{ display: "block", marginBottom: 14 }}>
                            Guest #{i + 1}
                          </label>

                          <div className="form_section">
                            <label className="rsvp_label">Full Name</label>
                            <Input
                              className="rsvp_input"
                              placeholder="Enter guest's full name"
                              value={assigned[i] || p.name}
                              disabled={!!assigned[i]}
                              onChange={(e) => updatePlusOne(i, { name: e.target.value })}
                            />
                          </div>

                          <div className="form_section">
                            <label className="rsvp_label">Events</label>
                            <EventChecks
                              values={p.events}
                              onToggle={(k, c) => updatePlusOneEvent(i, k, c)}
                            />
                          </div>

                          {needsMeal(p.events, invited) && (
                            <div className="form_section" style={{ marginBottom: 0 }}>
                              <label className="rsvp_label">Meal choice</label>
                              <MealSelect
                                value={p.meal}
                                onChange={(v) => updatePlusOne(i, { meal: v })}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </>
                  )}

                  {/* Dietary */}
                  <div className="form_section">
                    <label className="rsvp_label">
                      Any allergies or dietary restrictions?{" "}
                      <span style={{ color: "#aaa", fontWeight: 400 }}>(optional)</span>
                    </label>
                    <TextArea
                      className="rsvp_input"
                      rows={5}
                      name="dietary"
                      placeholder="Let us know about allergies or food restrictions (for you and your guests)"
                      value={formData.dietary}
                      onChange={(e) => setField("dietary", e.target.value)}
                    />
                  </div>

                  <Button type="primary" htmlType="submit" className="submit_btn" block>
                    Submit RSVP
                  </Button>
                </>
              )}
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default Rsvp;