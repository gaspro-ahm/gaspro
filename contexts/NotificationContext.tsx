import React, { createContext, useState, useCallback, useMemo } from 'react';

export type NotificationIcon = 'CheckCircle' | 'Clock' | 'MessageSquare' | 'Server' | 'Trash2' | 'Edit' | 'Plus' | 'Save' | 'Send' | 'Lock' | 'TrendingUp';

export interface Notification {
  id: number;
  text: string;
  time: string;
  read: boolean;
  icon: NotificationIcon;
  link?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'time' | 'read'>) => void;
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  unreadCount: number;
}

export const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  addNotification: () => {},
  setNotifications: () => {},
  unreadCount: 0,
});

const initialNotifications: Notification[] = [
    { id: 1, text: 'Status RAB #RAB005 diperbarui menjadi Diterima.', time: '5 menit lalu', read: false, icon: 'CheckCircle', link: '/rab/detail/5' },
    { id: 2, text: 'Proyek "Website E-commerce Klien A" mendekati tenggat waktu.', time: '2 jam lalu', read: false, icon: 'Clock', link: '/project/detail/PROJ001' },
    { id: 3, text: 'Komentar baru pada Laporan Proyek "Pembangunan Kantor Cabang".', time: '1 hari lalu', read: true, icon: 'MessageSquare', link: '/project/detail/PROJ004' },
    { id: 4, text: 'Pemeliharaan sistem dijadwalkan malam ini pukul 23:00.', time: '2 hari lalu', read: true, icon: 'Server', link: '#' },
    { id: 5, text: 'Database harga material berhasil diimpor.', time: '3 hari lalu', read: true, icon: 'CheckCircle', link: '/rab/database'},
    { id: 6, text: 'Tugas baru ditambahkan ke Proyek "Migrasi Sistem Gudang".', time: '3 hari lalu', read: true, icon: 'MessageSquare', link: '/project/detail/PROJ003'},
];


export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'time' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now(),
      time: 'Baru saja',
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const value = useMemo(() => ({
    notifications,
    addNotification,
    setNotifications,
    unreadCount,
  }), [notifications, addNotification, unreadCount]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
