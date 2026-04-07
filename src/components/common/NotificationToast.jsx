import React, { useEffect, useState } from 'react';
import { subscribeToNotifications } from '../../services/notificationService';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const NotificationToast = () => {
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // We only want to alert when a NEW one arrives after we mount,
    // so we store the initially loaded id to prevent an immediate pop on reload.
    let initialLoad = true;
    let initialId = null;

    const unsubscribe = subscribeToNotifications((notif) => {
      if (initialLoad) {
        initialLoad = false;
        initialId = notif.id;
        return; // Don't pop up immediately on page refresh
      }

      if (notif.id !== initialId) {
        setNotification(notif);
        // Auto-dismiss after 6 seconds
        setTimeout(() => setNotification(null), 6000);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleJoin = () => {
    if (notification?.code) {
      navigate('/live', { state: { code: notification.code } }); // Auto fills the room code
      setNotification(null);
    }
  };

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          style={{
            position: 'fixed',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(90deg, #ff416c, #ff4b2b)',
            color: 'white',
            padding: '16px 24px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(255, 65, 108, 0.4)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            minWidth: '320px'
          }}
        >
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem' }}>{notification.title}</h4>
            <p style={{ margin: '4px 0 0', opacity: 0.9 }}>{notification.message}</p>
          </div>
          <button 
            onClick={handleJoin}
            style={{
              background: 'white',
              color: '#ff416c',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Join
          </button>
          <button 
            onClick={() => setNotification(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '1.2rem',
              cursor: 'pointer',
              marginLeft: '8px'
            }}
          >
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationToast;
