import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCircle, AlertCircle, Info, Clock, Trash2 } from "lucide-react";
import { PageLayout } from "../../components/PageLayout";

const Notifications = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState([
    { id:1, type:"info",    title:"New Employee Joined",       message:"Alex Johnson from IT department has joined the organization",                       timestamp:"2 hours ago", read:false },
    { id:2, type:"warning", title:"Leave Request Pending",     message:"Sarah Williams has requested 5 days of leave starting March 1st",                   timestamp:"4 hours ago", read:false },
    { id:3, type:"success", title:"Payroll Processed",         message:"February 2026 payroll has been successfully processed for all employees",            timestamp:"1 day ago",   read:true  },
    { id:4, type:"warning", title:"Attendance Below Target",   message:"Robert Chen has attendance below 90% for this month",                               timestamp:"2 days ago",  read:true  },
    { id:5, type:"info",    title:"System Maintenance",        message:"Scheduled maintenance on March 15th from 2:00 PM to 4:00 PM",                       timestamp:"3 days ago",  read:true  },
    { id:6, type:"success", title:"Report Generated",          message:"Monthly Employee Performance report is ready for download",                         timestamp:"4 days ago",  read:true  },
  ]);

  const unread = notifications.filter(n => !n.read).length;
  const visible = notifications.filter(n => filter === "all" || (filter === "unread" && !n.read) || (filter === "read" && n.read));

  const markRead   = (id) => setNotifications(prev => prev.map(n => n.id === id ? {...n, read:true} : n));
  const deleteNote = (id) => setNotifications(prev => prev.filter(n => n.id !== id));
  const markAll    = ()   => setNotifications(prev => prev.map(n => ({...n, read:true})));

  const typeStyle = (type, read) => {
    if (read) return "bg-white border-gray-100 hover:bg-gray-50";
    return { success:"bg-emerald-50 border-emerald-200", warning:"bg-amber-50 border-amber-200", info:"bg-sky-50 border-sky-200" }[type] || "bg-gray-50 border-gray-100";
  };
  const typeIcon = (type) => ({
    success: <CheckCircle size={22} className="text-emerald-500 flex-shrink-0 mt-0.5" />,
    warning: <AlertCircle size={22} className="text-amber-500 flex-shrink-0 mt-0.5" />,
    info:    <Info size={22} className="text-sky-500 flex-shrink-0 mt-0.5" />,
  }[type] || <Clock size={22} className="text-gray-400 flex-shrink-0 mt-0.5" />);

  return (
    <PageLayout role="hr" activePage="Notifications" title="Notifications" subtitle={unread > 0 ? `You have ${unread} unread notification${unread > 1 ? "s":""}`:"All notifications read"}
      actions={unread > 0 ? <button onClick={markAll} className="text-sm font-semibold text-teal-600 hover:text-teal-800 transition-colors">Mark all as read</button> : null}
    >
      <div className="space-y-5">
        {/* Filter tabs */}
        <div className="flex gap-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 w-fit">
          {[["all","All"],["unread",`Unread (${unread})`],["read","Read"]].map(([key,label]) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${filter === key ? "bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow" : "text-gray-600 hover:bg-gray-100"}`}>
              {label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-3">
          {visible.length > 0 ? visible.map(n => (
            <div key={n.id} className={`border rounded-2xl p-5 transition-all ${typeStyle(n.type, n.read)}`}>
              <div className="flex items-start gap-4">
                {typeIcon(n.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm">{n.title}</h3>
                      <p className="text-gray-600 mt-0.5 text-sm">{n.message}</p>
                    </div>
                    {!n.read && <div className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0 mt-1.5" />}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{n.timestamp}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!n.read && (
                    <button onClick={() => markRead(n.id)} className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Mark as read">
                      <CheckCircle size={16} />
                    </button>
                  )}
                  <button onClick={() => deleteNote(n.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-20 text-gray-400">
              <Bell size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">{filter === "unread" ? "All notifications have been read" : "No notifications yet"}</p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};
export default Notifications;
