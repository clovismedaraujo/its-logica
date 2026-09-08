import ProfBar from "./ProfBar";
import { LEVEL_COLORS } from "../data/topics";
import { isUnlocked } from "../logic/model";
import type { Topic, Model } from "../types";

interface Props {
  topic: Topic;
  model: Model;
  onSelect: (id: string) => void;
  active: boolean;
}

export default function TopicCard({ topic, model, onSelect, active }: Props) {
  const unlocked = isUnlocked(topic.id, model);
  const prof = model[topic.id] ?? 0;
  const col = LEVEL_COLORS[topic.level];
  const border = active ? "2px solid " + col.border : "0.5px solid #e5e4e7";

  return (
    <div
      onClick={() => unlocked && onSelect(topic.id)}
      style={{
        background: unlocked ? col.bg : "#f4f3ec",
        border,
        borderRadius: 10,
        padding: "10px 12px",
        cursor: unlocked ? "pointer" : "default",
        opacity: unlocked ? 1 : 0.45,
        transition: "border 0.15s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: unlocked ? col.text : "#9ca3af" }}>
          {topic.label}
        </span>
        {!unlocked && <i className="ti ti-lock" style={{ fontSize: 14, color: "#9ca3af" }} aria-hidden />}
        {unlocked && prof >= 90 && <i className="ti ti-check" style={{ fontSize: 14, color: "#1D9E75" }} aria-hidden />}
      </div>
      {unlocked && <ProfBar value={prof} />}
      {!unlocked && (
        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
          Precisa: {topic.deps.join(", ")}
        </div>
      )}
    </div>
  );
}
