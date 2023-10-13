import { createContext, useRef, useState } from "react";

// type for notification object
interface IAlertNotification {
  title: string;
  message: string | React.ReactNode;
  delay?: number;
  autoClose?: boolean;

  inputProps?: React.HTMLAttributes<HTMLInputElement>;
  actions?: {
    text: string;
    callback?: (arg: any) => void;
    props?: React.HTMLAttributes<HTMLButtonElement>;
  }[];
}
// the types for methods and variable available in your alert context
interface IAlertContext {
  alert: (args: IAlertNotification) => void;
  alertShown?: boolean;
  notification?: IAlertNotification;
  close: () => void;
}

// initialize default methods for context.
export const AlertContext = createContext<IAlertContext>({
  alert: () => {},
  close: () => {},
});

const AlertProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [alertShown, setAlertShown] = useState(false); // toggles the view state of the alert component
  const [notification, setNotification] = useState<
    IAlertNotification | undefined
  >(); // stores the configuration data for the alert component
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(); // stores the timer value for autoclosing the alert component

  // closes the alert component and reverts all config to default values.
  const close = () => {
    setAlertShown(false);
    setNotification(undefined);
    clearTimeout(timerRef.current);
  };

  // opens the alert component and configures its view state.
  const alert = (args: IAlertNotification) => {
    setNotification(args);
    setAlertShown(true);

    if (args.autoClose) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        close();
      }, notification?.delay || 2400);
    }

    return notification;
  };

  return (
    <AlertContext.Provider
      value={{
        notification,
        alert,
        alertShown,
        close,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

export default AlertProvider;