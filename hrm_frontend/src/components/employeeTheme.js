import { useMemo, useState } from "react";

// Employee portal accent — matches the employee sidebar (sky → blue)
export const EMP_GRADIENT = "bg-gradient-to-br from-sky-400 to-blue-500";

// Gradient presets for summary cards (same palette as the HR page, blue first)
export const CARD_TONES = {
  blue: "bg-gradient-to-br from-sky-400 to-blue-500",
  green: "bg-gradient-to-br from-emerald-400 to-teal-500",
  orange: "bg-gradient-to-br from-amber-400 to-orange-500",
  purple: "bg-gradient-to-br from-indigo-400 to-violet-500",
  red: "bg-gradient-to-br from-rose-400 to-red-500",
  slate: "bg-gradient-to-br from-slate-500 to-slate-700",
};

// Sort state + sorted copy of `rows`; `pick(row, key)` returns the value to compare
export const useSort = (rows, pick, initialKey = null, initialDir = "asc") => {
  const [sortKey, setSortKey] = useState(initialKey);
  const [sortDir, setSortDir] = useState(initialDir);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    const out = [...rows].sort((a, b) =>
      String(pick(a, sortKey) ?? "").localeCompare(String(pick(b, sortKey) ?? ""), undefined, {
        numeric: true,
        sensitivity: "base",
      })
    );
    return sortDir === "asc" ? out : out.reverse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, sortKey, sortDir]);

  const headerProps = (key) => ({ onClick: () => toggleSort(key), sortDir: sortKey === key ? sortDir : null });

  return { sorted, headerProps };
};
