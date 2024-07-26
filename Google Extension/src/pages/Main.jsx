import React, { useState, useEffect } from "react";
import SearchLogo from "../assets/icon-128.png";
import "./Main.css";
import Form from "../components/Form";
import Result from "../components/Result";
import { Link } from "react-router-dom";

function Main({ setCurrentView }) {
  const [input, setInput] = useState({ phone: "" });
  const [customerDetails, setCustomerDetails] = useState(null);
  const [customerInquiry, setCustomerInquiry] = useState([]);
  const [customerInvoice, setCustomerInvoice] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [noResult, setNoResult] = useState(false);
  const [loadingResult, setLoadingResult] = useState(false);
  const [showResult, setShowResult] = useState(false);

  //fetch available staff
  useEffect(() => {
    const queryStaffDb = async () => {
      try {
        const res = await fetch(`http://localhost:3001/queryStaffDb`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await res.json();

        if (data.length === 0) {
          return;
        }

        setStaffList(data);
        console.log(data);
      } catch (err) {
        console.error("Error querying customer staff database: ", err);
      }
    };

    queryStaffDb();
  }, []);

  //center the horizontal scrollbar
  useEffect(() => {
    const getScrollbarWidth = () => {
      const outer = document.createElement("div");
      outer.style.visibility = "hidden";
      outer.style.overflow = "scroll";
      document.body.appendChild(outer);

      const inner = document.createElement("div");
      outer.appendChild(inner);

      const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
      outer.parentNode.removeChild(outer);

      return scrollbarWidth;
    };

    const scrollToCenter = () => {
      const contentWidth = document.documentElement.scrollWidth;
      const windowWidth = window.innerWidth;
      const scrollWidth = getScrollbarWidth();

      window.scrollTo({
        left: (contentWidth - windowWidth + scrollWidth) / 2,
        top: 0,
        behavior: "instant",
      });
    };

    scrollToCenter();

    window.addEventListener("resize", scrollToCenter);

    return () => window.removeEventListener("resize", scrollToCenter);
  }, []);

  return (
    <div className="flex flex-col gap-2 items-center p-5 break-words whitespace-normal">
      <div className="w-full mb-3">
        <div
          className="inline-flex items-center gap-2 hover:text-slate-400 cursor-pointer"
          onClick={() => setCurrentView("authNotion")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5 8.25 12l7.5-7.5"
            />
          </svg>
          Back
        </div>
      </div>
      <img className="logo w-7" src={SearchLogo} alt="Search Logo" />
      <h1 className="text-center text-xl font-bold under">Search Customer</h1>
      <hr className="w-64 border-slate-500" />
      <Form
        input={input}
        setInput={setInput}
        setLoadingResult={setLoadingResult}
        setCustomerDetails={setCustomerDetails}
        setNoResult={setNoResult}
        setShowResult={setShowResult}
        setCustomerInquiry={setCustomerInquiry}
        setCustomerInvoice={setCustomerInvoice}
      />
      {showResult && (
        <Result
          loadingResult={loadingResult}
          customerDetails={customerDetails}
          customerInquiry={customerInquiry}
          noResult={noResult}
          staffList={staffList}
          customerInvoice={customerInvoice}
        />
      )}
    </div>
  );
}

export default Main;
