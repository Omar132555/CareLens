import { AnimatePresence, motion } from "framer-motion";
import "animate.css";

const notificationVariants = {
  hidden: { opacity: 0, y: -20, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export default function NotificationToast({ open, notification, onClose }) {
  if (!open || !notification) {
    return null;
  }

  const isSuccess = notification.type === "success";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={notificationVariants}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className={`cl-notification ${
            isSuccess ? "cl-notification-success" : "cl-notification-error"
          } animate__animated animate__fadeInDown`}
          role="status"
          aria-live="polite"
        >
          <div className="cl-notification-icon material-symbols-outlined">
            {isSuccess ? "task_alt" : "error"}
          </div>
          <div className="cl-notification-body">
            <div className="cl-notification-title">{notification.title}</div>
            <div className="cl-notification-message">{notification.message}</div>
          </div>
          <button
            type="button"
            className="cl-notification-close"
            onClick={onClose}
            aria-label="Close notification"
          >
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
