import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, CheckCircle, AlertCircle, InfoIcon, Clock, Trash2, Archive } from 'lucide-react';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'info',
      title: 'New Employee Joined',
      message: 'Alex Johnson from IT department has joined the organization',
      timestamp: '2 hours ago',
      read: false,
    },
    {
      id: 2,
      type: 'warning',
      title: 'Leave Request Pending',
      message: 'Sarah Williams has requested 5 days of leave starting March 1st',
      timestamp: '4 hours ago',
      read: false,
    },
    {
      id: 3,
      type: 'success',
      title: 'Payroll Processed',
      message: 'February 2026 payroll has been successfully processed for all employees',
      timestamp: '1 day ago',
      read: true,
    },
    {
      id: 4,
      type: 'warning',
      title: 'Attendance Below Target',
      message: 'Robert Chen has attendance below 90% for this month',
      timestamp: '2 days ago',
      read: true,
    },
    {
      id: 5,
      type: 'info',
      title: 'System Maintenance',
      message: 'Scheduled maintenance on March 15th from 2:00 PM to 4:00 PM',
      timestamp: '3 days ago',
      read: true,
    },
    {
      id: 6,
      type: 'success',
      title: 'Report Generated',
      message: 'Monthly Employee Performance report is ready for download',
      timestamp: '4 days ago',
      read: true,
    },
  ]);

  const [filter, setFilter] = useState('all');

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-green-500" size={24} />;
      case 'warning':
        return <AlertCircle className="text-yellow-500" size={24} />;
      case 'info':
        return <InfoIcon className="text-blue-500" size={24} />;
      default:
        return <Clock className="text-slate-500" size={24} />;
    }
  };

  const getNotificationStyles = (type, read) => {
    const baseStyles = 'p-4 border rounded-lg transition-colors cursor-pointer';
    if (read) {
      return `${baseStyles} bg-white border-slate-200 hover:bg-slate-50`;
    }
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-50 border-green-200 hover:bg-green-100`;
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-yellow-200 hover:bg-yellow-100`;
      case 'info':
        return `${baseStyles} bg-blue-50 border-blue-200 hover:bg-blue-100`;
      default:
        return `${baseStyles} bg-slate-50 border-slate-200`;
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'read') return notif.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter((notif) => notif.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((notif) => ({ ...notif, read: true })));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 font-medium"
          >
            <ArrowLeft size={20} />
            Back
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-slate-600 to-slate-700 p-3 rounded-lg">
              <Bell className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Notifications</h1>
              <p className="text-slate-600 mt-1">
                {unreadCount > 0
                  ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                  : 'All notifications read'}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-teal-600 text-white'
              : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'unread'
              ? 'bg-teal-600 text-white'
              : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilter('read')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'read'
              ? 'bg-teal-600 text-white'
              : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
          }`}
        >
          Read
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={getNotificationStyles(notification.type, notification.read)}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        {notification.title}
                      </h3>
                      <p className="text-slate-600 mt-1 text-sm">
                        {notification.message}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="flex-shrink-0 h-2 w-2 bg-teal-600 rounded-full mt-2 ml-2"></div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {notification.timestamp}
                  </p>
                </div>
                <div className="flex-shrink-0 flex items-center gap-2">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                      title="Mark as read"
                    >
                      <CheckCircle size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete notification"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Bell className="mx-auto text-slate-400 mb-4" size={48} />
            <p className="text-slate-600 font-medium">No notifications</p>
            <p className="text-slate-500 text-sm">
              {filter === 'unread'
                ? 'All notifications have been read'
                : 'You have no notifications yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
