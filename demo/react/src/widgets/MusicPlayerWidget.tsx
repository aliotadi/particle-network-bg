import { useState, useEffect } from "react";

const TRACKS = [
  { title: "Synthwave Drive", artist: "Neon Pulse" },
  { title: "Deep Blue Orbit", artist: "Ocean Audio" },
  { title: "Particle Flow", artist: "Space Loop" },
  { title: "Neon Cascade", artist: "Wave Form" },
];

const BAR_COUNT = 10;

export function MusicPlayerWidget() {
  const [playing, setPlaying] = useState(true);
  const [trackIdx, setTrackIdx] = useState(0);
  const [bars, setBars] = useState<number[]>(Array(BAR_COUNT).fill(0.3));

  useEffect(() => {
    if (!playing) {
      setBars(Array(BAR_COUNT).fill(0.15));
      return;
    }
    const id = setInterval(() => {
      setBars(
        Array(BAR_COUNT)
          .fill(0)
          .map((_, i) => {
            const center = (BAR_COUNT - 1) / 2;
            const dist = Math.abs(i - center) / center;
            return 0.25 + Math.random() * 0.75 * (1 - dist * 0.4);
          })
      );
    }, 100);
    return () => clearInterval(id);
  }, [playing]);

  const track = TRACKS[trackIdx];

  const skip = (dir: number) =>
    setTrackIdx((i) => (i + dir + TRACKS.length) % TRACKS.length);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        color: "#fff",
        fontFamily: "'Inter', system-ui, sans-serif",
        userSelect: "none",
        width: "100%",
        height: "100%",
        padding: "0 14px",
        boxSizing: "border-box",
      }}
    >
      {/* Waveform */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          height: 30,
          flexShrink: 0,
        }}
      >
        {bars.map((h, i) => (
          <div
            key={i}
            style={{
              width: 3,
              height: `${h * 100}%`,
              background: playing
                ? `hsl(${260 + i * 8}, 80%, 70%)`
                : "rgba(255,255,255,0.2)",
              borderRadius: 2,
              transition: "height 0.1s ease, background 0.4s ease",
            }}
          />
        ))}
      </div>

      {/* Track info */}
      <div style={{ flex: 1, overflow: "hidden", minWidth: 0 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            lineHeight: 1.2,
          }}
        >
          {track.title}
        </div>
        <div style={{ fontSize: 10, opacity: 0.45, marginTop: 2 }}>
          {track.artist}
        </div>
      </div>

      {/* Controls */}
      <div
        style={{
          display: "flex",
          gap: 6,
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => skip(-1)}
          style={btnStyle}
          aria-label="Previous"
        >
          ⏮
        </button>
        <button
          onClick={() => setPlaying((p) => !p)}
          style={{
            ...playStyle,
            background: playing ? "#7c3aed" : "rgba(124,58,237,0.4)",
          }}
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? "⏸" : "▶"}
        </button>
        <button
          onClick={() => skip(1)}
          style={btnStyle}
          aria-label="Next"
        >
          ⏭
        </button>
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "rgba(255,255,255,0.4)",
  cursor: "pointer",
  fontSize: 13,
  padding: 0,
  lineHeight: 1,
  transition: "color 0.2s",
};

const playStyle: React.CSSProperties = {
  width: 26,
  height: 26,
  borderRadius: "50%",
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#fff",
  fontSize: 11,
  transition: "background 0.3s",
};
