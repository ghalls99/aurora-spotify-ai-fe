import React, { useState, useEffect } from "react";

function Toast(props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);

    const timer = setTimeout(() => {
      setShow(false);
    }, props.delay || 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [props.delay]);

  return (
    <div className={`toast ${show ? "show" : ""}`}>
      <div className="toast-message">{props.message}</div>
    </div>
  );
}

export default Toast;
