import React from "react";
import { Toaster } from "react-hot-toast";

export const ToastNotifications: React.FC = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: "#363636",
          color: "#fff",
        },
        success: {
          style: {
            background: "#059669",
          },
        },
        error: {
          style: {
            background: "#DC2626",
          },
        },
      }}
    />
  );
};
