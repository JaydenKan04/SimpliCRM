import React, { useEffect, useState } from "react";
import "./AuthNotion.css";

function AuthNotion({setCurrentView}) {
  const [isAuth, setIsAuth] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [hoveredCont, setHoveredCont] = useState({ 1: false, 2: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuth = async () => {
      try {
        const res = await fetch(`http://localhost:3001/check-auth`, {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();

        if (!data.isAuthorised) {
          setIsAuth(false);
          return;
        }

        setIsAuth(true);
        setWorkspaceName(data.workspaceName);
      } catch (err) {
        console.error("Error checking authorisation status: ", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuth();

    const intervalId = setInterval(fetchAuth, 2000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex flex-col justify-center items-center p-5 font-mono">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="mb-6 text-base ">
            {isAuth ? (
              <p>Connected: {workspaceName}</p>
            ) : (
              <p>You haven't connect to any workspace</p>
            )}
          </div>
          <div className="flex gap-6 font-semibold text-base">
            <a
              className={`connect-link flex-col flex gap-3 justify-center items-center border-4 rounded-lg w-36 h-36 p-2 transition-all ${
                !hoveredCont[1]
                  ? "text-slate-400 border-slate-400"
                  : "text-white border-white"
              }`}
              href="http://localhost:3001/auth"
              onMouseEnter={() => setHoveredCont({ 1: true, 2: false })}
              onMouseLeave={() => setHoveredCont({ 1: false, 2: false })}
            >
              <div className="w-28 text-center leading-snug">
                Integrate new Notion workspace
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-7"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                />
              </svg>
            </a>
            {isAuth && (
              <div
                className={`existing-link flex-col flex gap-3 justify-center items-center border-4 rounded-lg w-36 h-36 p-2 transition-all cursor-pointer ${
                  !hoveredCont[2]
                    ? "text-slate-400 border-slate-400"
                    : "text-white border-white"
                }`}
                onClick={() => setCurrentView('main')}
                onMouseEnter={() => setHoveredCont({ 1: false, 2: true })}
                onMouseLeave={() => setHoveredCont({ 1: false, 2: false })}
              >
                <div className="w-28 text-center leading-snug">
                  Use existing workspace
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-7"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default AuthNotion;
