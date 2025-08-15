import React, { createContext, useContext, useState, ReactNode } from "react";

type ToastContextType = {
  showToast: (component: ReactNode, duration?: number) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<ReactNode | null>(null);

  const showToast = (component: ReactNode, duration = 3000) => {
    setToast(component);
    setTimeout(() => setToast(null), duration);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            background: "white",
            padding: "10px 20px",
            borderRadius: "8px",
            boxShadow: "0px 2px 8px rgba(0,0,0,0.15)",
            zIndex: 9999
          }}
        >
          {toast}
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
};
