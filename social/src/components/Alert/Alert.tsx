import { useState } from "react";
import { useAlert } from "./AlertContainer";
import  "./styles.css" ;

const Alert = () => {
  const { notification, alertShown, close } = useAlert();
  const [textInputValue, setTextInputValue] = useState("");

  return (
    <div
      className={`
        alert_container ${alertShown ? "show" : ''}`}
    >
      <div className="alert">
        <div className={`alert_content_show ${alertShown} ? "show" : alert_content`}>
          <p className="alert_title">{notification?.title || ""}</p>

          <div className="alert_body">
            <p>{notification?.message || ""}</p>
          </div>

          {notification?.inputProps && (
            <div className="alert_textinput">
              <input
                value={textInputValue}
                onChange={(e) => setTextInputValue(e.target.value)}
                {...notification?.inputProps}
              />
            </div>
          )}

          <div className="alert_action">
            {(notification?.actions || []).map((action) => (
              <div key={action.text} className="btn">
                <button
                  {...action.props}
                  onClick={() => {
                    action.callback?.(textInputValue);
                    setTextInputValue("");
                    close();
                  }}
                >
                  {action.text}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alert;