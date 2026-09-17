import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, InfoIcon, Trash2 } from 'lucide-react';

const NotificationPopup = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'info',
      title: 'New Employee Joined',
      message: 'Alex Johnson from IT has joined',
      timestamp: '2 hours ago',
      read: false,
    },
    {
      id: 2,
      type: 'warning',
      title: 'Leave Request Pending',
      message: 'Sarah Williams requested 5 days leave',
      timestamp: '4 hours ago',
      read: false,
    },
    {
      id: 3,
      type: 'success',
      title: 'Payroll Processed',
      message: 'February 2026 payroll done',
      timestamp: '1 day ago',
      read: true,
    },
  ]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-green-500" size={18} />;
      case 'warning':
        return <AlertCircle className="text-yellow-500" size={18} />;
      case 'info':
        return <InfoIcon className="text-blue-500" size={18} />;
      default:
        return null;
    }
  };

  const getNotificationBg = (type, read) => {
    if (read) return 'bg-white';
    switch (type) {
      case 'success':
        return 'bg-green-50';
      case 'warning':
        return 'bg-yellow-50';
      case 'info':
        return 'bg-blue-50';
      default:
        return 'bg-slate-50';
    }
  };

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-40"
        onClick={onClose}
      ></div>

      {/* Popup */}
      <div className="fixed top-20 right-8 w-96 bg-white rounded-lg shadow-2xl z-50 max-h-[600px] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-800">Notifications</h3>
            {unreadCount > 0 && (
              <p className="text-xs text-slate-500">{unreadCount} new</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={18} className="text-slate-600" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto flex-1">
          {notifications.length > 0 ? (
            <div className="divide-y divide-slate-200">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 hover:bg-slate-50 transition-colors ${getNotificationBg(notif.type, notif.read)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-slate-800 text-sm">
                            {notif.title}
                          </p>
                          <p className="text-xs text-slate-600 mt-1">
                            {notif.message}
                          </p>
                          <p className="text-xs text-slate-400 mt-2">
                            {notif.timestamp}
                          </p>
                        </div>
                        {!notif.read && (
                          <div className="flex-shrink-0 h-2 w-2 bg-teal-500 rounded-full mt-1.5"></div>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-1">
                      {!notif.read && (
                        <button
                          onClick={() => markAsRead(notif.id)}
                          className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded transition-colors"
                          title="Mark as read"
                        >
                          <CheckCircle size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notif.id)}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">
              <p className="text-sm">No notifications</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-slate-200 text-center">
            <button className="text-xs font-medium text-teal-600 hover:text-teal-700">
              View all notifications
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationPopup;
