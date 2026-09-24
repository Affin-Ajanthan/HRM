/**
 * NameListPage — HR page for adding a list of names in one go (leave types,
 * employment types, ...): numbered rows, "+ Add another" at the bottom, one save,
 * and the names that already exist shown underneath.
 *
 * Props:
 *   title, subtitle      : page header text
 *   heading, hint        : card header text
 *   placeholder          : row input placeholder
 *   addLabel             : text of the "+ Add another ..." button
 *   saveLabel            : text of the save button
 *   existingLabel        : heading of the "already added" list
 *   emptyLabel           : shown when nothing has been added yet
 *   icon                 : lucide icon component for the card header
 *   load()               : resolves to the API response listing existing items ({ data: [{ id, name, createdByName }] })
 *   save(names)          : resolves to the API response after saving
 */
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, X, Save } from "lucide-react";
import { PageLayout } from "./PageLayout";

// Server errors come back as "400: <reason>"; show just the reason
const errorText = (error, fallback) => (error?.message || fallback).replace(/^\d{3}:\s*/, "");

const newRow = () => ({ key: `${Date.now()}-${Math.random()}`, name: "" });

export const NameListPage = ({
  title, subtitle, heading, hint, placeholder, addLabel, saveLabel,
  existingLabel, emptyLabel, icon: Icon, load, save,
}) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [rows, setRows] = useState([newRow()]);
  const [existing, setExisting] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const inputRefs = useRef({});
  const focusKey = useRef(null);

  const loadExisting = async () => {
    try {
      const res = await load();
      setExisting(res.data || []);
    } catch (e) {
      setError(errorText(e, "Failed to load existing items"));
    }
  };

  useEffect(() => {
    const s = localStorage.getItem("user");
    if (!s) { navigate("/login"); return; }
    const u = JSON.parse(s);
    if (u.role !== "HR_MANAGER" && u.role !== "ADMIN") { navigate("/unauthorized"); return; }
    setUser(u);
    loadExisting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // Focus the row that was just added
  useEffect(() => {
    if (focusKey.current && inputRefs.current[focusKey.current]) {
      inputRefs.current[focusKey.current].focus();
      focusKey.current = null;
    }
  }, [rows]);

  const addRow = () => {
    const row = newRow();
    focusKey.current = row.key;
    setRows(prev => [...prev, row]);
  };

  const updateRow = (key, name) => setRows(prev => prev.map(r => (r.key === key ? { ...r, name } : r)));
  const removeRow = (key) => setRows(prev => (prev.length > 1 ? prev.filter(r => r.key !== key) : prev));

  const handleSave = async (e) => {
    e.preventDefault();
    const names = rows.map(r => r.name.trim()).filter(Boolean);
    if (names.length === 0) {
      setError(`${placeholder.split(",")[0]} is required`);
      return;
    }
    try {
      setSaving(true);
      setError("");
      const res = await save(names);
      setMessage(`✓ ${res.message || "Saved"}`);
      setTimeout(() => setMessage(""), 3000);
      setRows([newRow()]);
      loadExisting();
    } catch (e2) {
      setError(errorText(e2, "Failed to save"));
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <PageLayout
      role="hr"
      activePage="Leave Management"
      title={title}
      subtitle={subtitle}
      actions={
        <button onClick={() => navigate("/hr/leave")}
          className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
          <ArrowLeft size={16} /> Back to Leave Management
        </button>
      }
    >
      <div className="space-y-6 max-w-3xl">
        {message && <div className="p-4 rounded-lg text-white bg-green-500">{message}</div>}

        <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-teal-500 to-emerald-600 text-white">
            <h2 className="font-semibold flex items-center gap-2">{Icon && <Icon size={18} />} {heading}</h2>
            <p className="text-white/80 text-xs mt-0.5">{hint}</p>
          </div>

          <div className="p-6 space-y-3">
            {rows.map((row, i) => (
              <div key={row.key} className="flex items-center gap-3">
                <span className="w-7 text-sm font-semibold text-gray-400 text-right">{i + 1}.</span>
                <input
                  ref={el => { inputRefs.current[row.key] = el; }}
                  value={row.name}
                  onChange={e => updateRow(row.key, e.target.value)}
                  onKeyDown={e => {
                    // Enter on the last row adds another row instead of submitting
                    if (e.key === "Enter" && i === rows.length - 1 && row.name.trim()) {
                      e.preventDefault();
                      addRow();
                    }
                  }}
                  placeholder={placeholder}
                  maxLength={100}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50"
                />
                <button type="button" onClick={() => removeRow(row.key)} disabled={rows.length === 1}
                  title="Remove row"
                  className="p-2.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400 transition-colors">
                  <X size={16} />
                </button>
              </div>
            ))}

            <button type="button" onClick={addRow}
              className="w-full mt-2 border-2 border-dashed border-teal-200 hover:border-teal-400 hover:bg-teal-50 text-teal-600 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
              <Plus size={16} strokeWidth={2.5} /> {addLabel}
            </button>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
            )}

            <div className="flex justify-end pt-2">
              <button type="submit" disabled={saving}
                className="inline-flex items-center gap-2 bg-gradient-to-br from-teal-400 to-emerald-500 hover:from-teal-500 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm shadow-teal-500/20 transition-all">
                <Save size={16} /> {saving ? "Saving..." : saveLabel}
              </button>
            </div>
          </div>
        </form>

        {/* Already added, so HR can see what exists before adding more */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">{existingLabel} ({existing.length})</h3>
          {existing.length === 0 ? (
            <p className="text-sm text-gray-400">{emptyLabel}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {existing.map(t => (
                <span key={t.id} title={t.createdByName ? `Added by ${t.createdByName}` : undefined}
                  className="px-3 py-1.5 bg-teal-50 text-teal-700 border border-teal-100 rounded-xl text-xs font-semibold">
                  {t.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default NameListPage;
