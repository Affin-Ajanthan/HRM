import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, InfoIcon, Trash2, Building2, Bell, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EMPLOYEE_URL, ADMIN_URL } from '../services/api';

const NotificationPopup = ({ isOpen, onClose, onUnreadCountChange }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLiveNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const roleUpper = (user?.role || '').toUpperCase();
      let list = [];

      // 1. Fetch user notifications from Employee_Backend
      try {
        const res = await fetch(`${EMPLOYEE_URL}/employee/notifications`, { headers });
        if (res.ok) {
          const data = await res.json();
          const rawList = data.data || data || [];
          list = rawList.map(n => ({
            id: `notif-${n.id}`,
            realId: n.id,
            type: (n.type || '').toLowerCase().includes('reject') ? 'warning' : 'info',
            title: n.title || 'System Notification',
            message: n.message || '',
            timestamp: n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
            read: n.isRead || false,
            link: roleUpper === 'ADMIN' ? '/admin/companies' : undefined,
          }));
        }
      } catch (err) {
        console.warn('Could not fetch employee notifications', err);
      }

      // 2. If Admin, also check pending company requests
      if (roleUpper === 'ADMIN') {
        try {
          const res = await fetch(`${ADMIN_URL}/admin/companies`, { headers });
          if (res.ok) {
            const data = await res.json();
            const companies = data.data || data || [];
            const pending = companies.filter(c => (c.status || '').toUpperCase() === 'PENDING');
            
            pending.forEach(c => {
              list.unshift({
                id: `company-${c.id}`,
                companyId: c.id,
                type: 'warning',
                title: 'New Company Registration Request',
                message: `Application submitted by '${c.companyName || c.name}' (Contact: ${c.contactPersonName || c.email}). Status: PENDING.`,
                timestamp: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Pending Review',
                read: false,
                isCompanyRequest: true,
                link: '/admin/companies',
              });
            });
          }
        } catch (err) {
          console.warn('Could not fetch admin pending companies for notification popup', err);
        }
      }

      setNotifications(list);
      if (onUnreadCountChange) {
        onUnreadCountChange(list.filter(n => !n.read).length);
      }
    } catch (e) {
      console.warn('Error fetching live notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveNotifications();
    const interval = setInterval(fetchLiveNotifications, 5000); // refresh every 5s for live notifications
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (notif) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n));
      if (onUnreadCountChange) {
        onUnreadCountChange(updated.filter(n => !n.read).length);
      }
      return updated;
    });

    if (notif.realId) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`${EMPLOYEE_URL}/employee/notifications/${notif.realId}/read`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
      } catch (err) {
        console.warn('Could not mark notification read on backend', err);
      }
    }
  };

  const handleNotificationClick = (notif) => {
    markAsRead(notif);
    if (notif.link) {
      onClose();
      navigate(notif.link);
    }
  };

  const deleteNotification = (id) => {
    const remaining = notifications.filter((n) => n.id !== id);
    setNotifications(remaining);
    if (onUnreadCountChange) {
      onUnreadCountChange(remaining.filter(n => !n.read).length);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40"
        onClick={onClose}
      ></div>

      {/* Popup Modal */}
      <div className="fixed top-16 right-4 sm:right-8 w-96 max-w-[92vw] bg-white rounded-2xl shadow-2xl z-50 max-h-[520px] flex flex-col border border-gray-100 animate-fade-in">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/10 rounded-lg">
              <Bell size={18} className="text-indigo-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm">System Notifications</h3>
              <p className="text-[10px] text-indigo-200">
                {unreadCount > 0 ? `${unreadCount} unread alert(s)` : 'All caught up!'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors text-gray-300 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto flex-1 p-2 space-y-1.5">
          {loading && notifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">Loading notifications...</div>
          ) : notifications.length > 0 ? (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-3.5 rounded-xl cursor-pointer transition-all border ${
                  notif.read ? 'bg-white border-gray-100 opacity-80' : 'bg-indigo-50/60 border-indigo-100 shadow-xs'
                } hover:bg-indigo-50/90`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {notif.isCompanyRequest ? (
                      <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
                        <Building2 size={16} />
                      </div>
                    ) : (
                      <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                        <InfoIcon size={16} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="font-bold text-gray-800 text-xs truncate">{notif.title}</p>
                      <span className="text-[10px] text-gray-400 shrink-0">{notif.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-gray-600 mt-1 leading-snug">{notif.message}</p>
                    
                    {notif.link && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 mt-2 hover:underline">
                        Review in Companies <ExternalLink size={10} />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center text-gray-400 text-xs">
              <p className="font-semibold text-gray-600">No active notifications</p>
              <p className="text-[11px] text-gray-400 mt-1">You are all up to date!</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-gray-100 text-center bg-gray-50 rounded-b-2xl">
            <button
              onClick={() => {
                onClose();
                navigate('/admin/companies');
              }}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Manage Applications & Companies →
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationPopup;
