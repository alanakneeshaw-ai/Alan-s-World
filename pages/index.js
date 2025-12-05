import { useState, useEffect } from "react";

export default function Home() {
  const [weekends, setWeekends] = useState([]);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/weekends");
      setWeekends(await res.json());
    }
    load();
  }, []);

  async function reserve() {
    await fetch("/api/reserve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        weekend: selected
      })
    });
    setSent(true);
  }

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 40 }}>
      <h1 style={{ fontSize: 32, fontWeight: "bold" }}>
        Reserve a Weekend with Alana
      </h1>

      {!sent ? (
        <>
          <label>Your Name:</label>
          <input
            style={{ width: "100%", padding: 10, marginBottom: 20 }}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label>Choose a Weekend:</label>
          <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
            {weekends.map((w) => (
              <button
                key={w.id}
                onClick={() => setSelected(w)}
                style={{
                  padding: 15,
                  borderRadius: 8,
                  border: selected?.id === w.id ? "2px solid blue" : "1px solid #ccc"
                }}
              >
                {w.label}
              </button>
            ))}
          </div>

          <button
            disabled={!name || !selected}
            onClick={reserve}
            style={{
              marginTop: 30,
              width: "100%",
              padding: 15,
              fontSize: 18
            }}
          >
            Reserve
          </button>
        </>
      ) : (
        <h2>
          Reservation sent for <strong>{selected.label}</strong> 🎉
        </h2>
      )}
    </div>
  );
}
