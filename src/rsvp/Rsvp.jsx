import { useState, useEffect, useRef } from "react";
import "./rsv.css";
import { db } from "../firebaseConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Select, Checkbox, Input, Button, Spin } from "antd";

const { TextArea } = Input;
const { Option } = Select;

// Normalise a name for fuzzy matching (lowercase, trim, collapse spaces)
const normName = (n) => (n || "").toLowerCase().trim().replace(/\s+/g, " ");

const Rsvp = () => {
  const [hasPlusOne, setHasPlusOne] = useState(false);
  // null = not looked up yet, false = not on list, object = guest record
  const [guestRecord, setGuestRecord] = useState(null);
  const [guestList, setGuestList] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const lookupTimeout = useRef(null);

  const [formData, setFormData] = useState({
    fullName: "",
    attendingWedding: "",
    email: "",
    phone: "",
    attendWelcomeParty: false,
    attendRehearsalDinner: false,
    attendTheWedding: false,
    hasPlusOne: "no",
    plusOneName: "",
    plusOneWelcomeParty: false,
    plusOneRehearsalDinner: false,
    plusOneTheWedding: false,
    dietary: "",
  });

  // Fetch guest list once on mount
  useEffect(() => {
    const fetchGuests = async () => {
      try {
        const snap = await getDocs(collection(db, "guests"));
        setGuestList(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error("Could not load guest list", e);
      } finally {
        setListLoading(false);
      }
    };
    fetchGuests();
  }, []);

  // Lookup guest after user stops typing (400ms debounce)
  const lookupGuest = (name) => {
    clearTimeout(lookupTimeout.current);
    if (!name.trim()) {
      setGuestRecord(null);
      setHasPlusOne(false);
      setFormData((f) => ({ ...f, hasPlusOne: "no", plusOneName: "" }));
      return;
    }
    lookupTimeout.current = setTimeout(() => {
      const norm = normName(name);
      const found = guestList.find((g) => normName(g.name) === norm);
      if (found) {
        setGuestRecord(found);
        const allowedPlusOne = !!found.hasPlusOne;
        setHasPlusOne(allowedPlusOne);
        setFormData((f) => ({
          ...f,
          hasPlusOne: allowedPlusOne ? "yes" : "no",
          plusOneName: found.plusOneName || "",
        }));
      } else {
        // Not on guest list — still allow them to fill the form
        setGuestRecord(false);
        setHasPlusOne(false);
        setFormData((f) => ({ ...f, hasPlusOne: "no", plusOneName: "" }));
      }
    }, 400);
  };

  const handleChange = (name, value) => {
    setFormData((f) => ({ ...f, [name]: value }));

    if (name === "fullName") {
      lookupGuest(value);
    }

    if (name === "hasPlusOne") {
      // Admin controls this — don't let the user manually override if guest record restricts it
      if (guestRecord && !guestRecord.hasPlusOne) return; // not allowed
      setHasPlusOne(value === "yes");
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((f) => ({ ...f, [name]: checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.fullName.trim()) {
      toast.error("Please enter your full name.", { position: "top-center" }); return;
    }
    if (!formData.attendingWedding) {
      toast.error("Please let us know if you're attending.", { position: "top-center" }); return;
    }
    if (formData.attendingWedding === "yes") {
      if (!formData.email.trim()) {
        toast.error("Please enter your email.", { position: "top-center" }); return;
      }
      if (hasPlusOne && !formData.plusOneName.trim()) {
        toast.error("Please enter your plus-one's name.", { position: "top-center" }); return;
      }
    }

    // Always use the admin-assigned +1 name, never what the guest may have typed
    const submitData = {
      ...formData,
      plusOneName: hasPlusOne && guestRecord ? (guestRecord.plusOneName || "") : "",
    };

    try {
      await addDoc(collection(db, "rsvps"), submitData);
      toast.success("🎉 RSVP Submitted Successfully!", { position: "top-center" });
      setFormData({
        fullName: "",
        attendingWedding: "",
        email: "",
        phone: "",
        attendWelcomeParty: false,
        attendRehearsalDinner: false,
        attendTheWedding: false,
        hasPlusOne: "no",
        plusOneName: "",
        plusOneWelcomeParty: false,
        plusOneRehearsalDinner: false,
        plusOneTheWedding: false,
        dietary: "",
      });
      setHasPlusOne(false);
      setGuestRecord(null);
    } catch (error) {
      toast.error("❌ Something went wrong. Try again.", { position: "top-center" });
    }
  };

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
              onChange={(e) => handleChange("fullName", e.target.value)}
            />
            {/* Guest list feedback */}
            {formData.fullName.trim() && !listLoading && (
              <div style={{ fontSize: 12, marginTop: 4 }}>
                {guestRecord === null && (
                  <span style={{ color: "#aaa" }}>Checking guest list…</span>
                )}
                {guestRecord === false && (
                  <span style={{ color: "#faad14" }}>
                    ⚠️ Name not found on guest list — you can still submit.
                  </span>
                )}
                {guestRecord && (
                  <span style={{ color: "#52c41a" }}>
                    ✓ Welcome, {guestRecord.name}!
                    {guestRecord.hasPlusOne && " You have a +1."}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Attending Wedding */}
          <div className="form_section">
            <label className="rsvp_label">Will you be attending the wedding?</label>
            <Select
              className="rsvp_select"
              value={formData.attendingWedding || undefined}
              placeholder="-- Select an option --"
              onChange={(value) => handleChange("attendingWedding", value)}
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
              {/* Email */}
              <div className="form_section">
                <label className="rsvp_label">Email</label>
                <Input
                  className="rsvp_input"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>

              {/* Phone */}
              <div className="form_section">
                <label className="rsvp_label">Phone Number <span style={{ color: "#aaa", fontWeight: 400 }}>(optional)</span></label>
                <Input
                  className="rsvp_input"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </div>

              {/* Events */}
              <div className="form_section">
                <label className="rsvp_label">What events will you be attending?</label>
                <Checkbox
                  name="attendWelcomeParty"
                  checked={formData.attendWelcomeParty}
                  onChange={handleCheckboxChange}
                  className="foa"
                >
                  Welcome Party
                </Checkbox>
                <div className="ko"></div>
                <Checkbox
                  name="attendRehearsalDinner"
                  checked={formData.attendRehearsalDinner}
                  onChange={handleCheckboxChange}
                  className="foa"
                >
                  Rehearsal Dinner
                </Checkbox>
                <div className="ko"></div>
                <Checkbox
                  name="attendTheWedding"
                  checked={formData.attendTheWedding}
                  onChange={handleCheckboxChange}
                  className="foa"
                >
                  The Wedding
                </Checkbox>
              </div>

              {/* +1 — only shown when guest is allowed a +1 */}
              {guestRecord && guestRecord.hasPlusOne && (
                <>
                  <div className="form_section">
                    <label className="rsvp_label">Will you be bringing a +1?</label>
                    <Select
                      className="rsvp_select"
                      value={formData.hasPlusOne}
                      onChange={(value) => {
                        setHasPlusOne(value === "yes");
                        setFormData((f) => ({
                          ...f,
                          hasPlusOne: value,
                          plusOneName: value === "yes" ? (guestRecord.plusOneName || f.plusOneName) : "",
                        }));
                      }}
                    >
                      <Option value="no">No</Option>
                      <Option value="yes">Yes</Option>
                    </Select>
                  </div>

                  {hasPlusOne && (
                    <>
                      <div className="form_section">
                        <label className="rsvp_label">Plus-One Full Name</label>
                        <Input
                          className="rsvp_input"
                          name="plusOneName"
                          placeholder="Enter plus-one full name"
                          value={formData.plusOneName}
                          onChange={(e) => handleChange("plusOneName", e.target.value)}
                        />
                      </div>

                      <div className="form_section">
                        <label className="rsvp_label">Plus-One Event Attendance</label>
                        <Checkbox
                          name="plusOneWelcomeParty"
                          checked={formData.plusOneWelcomeParty}
                          onChange={handleCheckboxChange}
                          className="foa"
                        >
                          Welcome Party
                        </Checkbox>
                        <div className="ko"></div>
                        <Checkbox
                          name="plusOneRehearsalDinner"
                          checked={formData.plusOneRehearsalDinner}
                          onChange={handleCheckboxChange}
                          className="foa"
                        >
                          Rehearsal Dinner
                        </Checkbox>
                        <div className="ko"></div>
                        <Checkbox
                          name="plusOneTheWedding"
                          checked={formData.plusOneTheWedding}
                          onChange={handleCheckboxChange}
                          className="foa"
                        >
                          The Wedding
                        </Checkbox>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Dietary */}
              <div className="form_section">
                <label className="rsvp_label">
                  Do you have any dietary restrictions?{" "}
                  <span style={{ color: "#aaa", fontWeight: 400 }}>(optional)</span>
                </label>
                <TextArea
                  className="rsvp_input"
                  rows={5}
                  name="dietary"
                  placeholder="Let us know about allergies or food restrictions"
                  value={formData.dietary}
                  onChange={(e) => handleChange("dietary", e.target.value)}
                />
              </div>

              {/* Submit */}
              <Button type="primary" htmlType="submit" className="submit_btn" block>
                Submit RSVP
              </Button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default Rsvp;