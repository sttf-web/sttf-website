import AddPlayersToClub from "@/components/admin/AddPlayersToClub";
import AdminLeagueTable from "@/components/admin/AdminLeagueTable";
import CreateClubForm from "@/components/admin/CreateClubForm";
import CreateMatchForm from "@/components/admin/CreateMatchForm";
import CreateNewsForm from "@/components/admin/CreateNewsForm";
import CreateRefereeForm from "@/components/admin/CreateRefereeForm";
import MessagesList from "@/components/admin/MessagesList";

export default function Admin() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #002b23 0%, #005043 45%, #007a62 80%, #003d34 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decoration — dot grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* Background decoration — glow blobs */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          pointerEvents: "none",
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="blob1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00c896" stopOpacity="0.13" />
            <stop offset="100%" stopColor="#00c896" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="blob2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00c896" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#00c896" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="-5%" cy="10%" rx="420" ry="320" fill="url(#blob1)" />
        <ellipse cx="105%" cy="90%" rx="480" ry="340" fill="url(#blob2)" />
        {/* Faint table lines */}
        <line
          x1="0" y1="50%" x2="100%" y2="50%"
          stroke="white" strokeOpacity="0.04" strokeWidth="1"
        />
        <line
          x1="50%" y1="0" x2="50%" y2="100%"
          stroke="white" strokeOpacity="0.04" strokeWidth="1"
        />
        {/* Floating ping-pong balls */}
        <circle cx="8%" cy="18%" r="38" fill="white" fillOpacity="0.025" />
        <circle cx="92%" cy="12%" r="22" fill="white" fillOpacity="0.03" />
        <circle cx="85%" cy="75%" r="50" fill="white" fillOpacity="0.02" />
        <circle cx="15%" cy="82%" r="28" fill="white" fillOpacity="0.025" />
      </svg>

      {/* Page content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "680px",
          margin: "0 auto",
          padding: "48px 24px 64px",
        }}
      >
        {/* Page-level heading */}
        <div style={{ marginBottom: "32px" }}>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.4)",
              marginBottom: "6px",
              marginTop: "60px",
            }}
          >
            STTF Admin Portal
          </p>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: 700,
              color: "white",
              letterSpacing: "-0.4px",
              margin: 0,
            }}
          >
            Club Management
          </h1>
        </div>

        <CreateClubForm />
        <AddPlayersToClub/>
        <CreateMatchForm/>
        <CreateRefereeForm/>
        <CreateNewsForm/>
        <MessagesList/>
        <AdminLeagueTable/>
      </div>
    </main>
  );
}
