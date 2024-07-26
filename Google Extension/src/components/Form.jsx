import React, { useState } from "react";

function Form({
  input,
  setInput,
  setLoadingResult,
  setCustomerDetails,
  setNoResult,
  setShowResult,
  setCustomerInquiry,
  setCustomerInvoice,
}) {
  const [disableReset, setDisableReset] = useState(true);
  const [disableSubmit, setDisableSubmit] = useState(true);

  const handleInput = (e) => {
    const inputName = e.target.name;
    setInput((prev) => ({
      ...prev,
      [inputName]: e.target.value,
    }));

    handleSubmitResetBtns(e);
  };

  const handleSubmitResetBtns = (e) => {
    if (e.target.value.length > 0) {
      setDisableReset(false);
    } else {
      setDisableReset(true);
    }

    if (e.target.value.length >= 11) {
      setDisableSubmit(false);
    } else {
      setDisableSubmit(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    handleSubmitResetBtns(e);
    setInput({ phone: "" });
    const customerId = await queryCustDb();
    if (customerId) {
      queryInquiryDb(customerId);
      queryInvoiceDb(customerId);
    }
  };

  const queryCustDb = async () => {
    setCustomerInquiry([]);
    setLoadingResult(true);
    setCustomerDetails(null);
    setNoResult(false);
    setShowResult(true);

    try {
      const res = await fetch(`http://localhost:3001/queryCustomerDb`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNo: input.phone.trim() }),
        credentials: "include"
      });

      if (!res.ok) {
        throw new Error("Network response was not ok");
      }

      const text = await res.text();

      if (!text) {
        console.log("no result");
        setNoResult(true);
        setCustomerInquiry(null);
        return;
      }

      const data = await JSON.parse(text);
      setCustomerDetails(data.properties);
      console.log(data);

      return data.id;
    } catch (err) {
      console.error("Error querying customer database: ", err);
      setShowResult(false);
    } finally {
      setLoadingResult(false);
    }
  };

  const queryInquiryDb = async (id) => {
    setLoadingResult(true);
    try {
      const res = await fetch(`http://localhost:3001/queryInquiryDb`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ customerId: id }),
        credentials: "include"
      });

      if (!res.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await res.json();
      console.log(data);

      setCustomerInquiry(data);
    } catch (err) {
      console.error("Error querying customer inquiry database: ", err);
    } finally {
      setLoadingResult(false);
    }
  };

  const queryInvoiceDb = async (id) => {
    setLoadingResult(true);
    try {
      const res = await fetch(`http://localhost:3001/queryInvoiceDb`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ customerId: id }),
        credentials: "include"
      });

      if (!res.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await res.json();
      console.log(data);

      setCustomerInvoice(data);
    } catch (err) {
      console.error("Error querying customer invoice database: ", err);
    } finally {
      setLoadingResult(false);
    }
  };

  return (
    <form
      action=""
      className="flex flex-col gap-3 mb-4"
      onSubmit={handleSubmit}
    >
      <label htmlFor="phone" className="flex flex-col">
        <span className="font-semibold text-sm mb-1">Phone no</span>
        <input
          className="text-white px-3 py-2 rounded-md"
          type="text"
          name="phone"
          id="phone"
          value={input.phone}
          onChange={handleInput}
          onFocus={handleSubmitResetBtns}
          required={true}
          style={{ backgroundColor: "rgb(18, 18, 18)" }}
          placeholder="e.g.012-3456789"
        />
      </label>

      <div className="flex gap-2 justify-end">
        <button
          className={`bg-blue-600 font-semibold px-2 py-1 rounded-md ${
            disableSubmit ? "opacity-50" : "hover:bg-blue-500"
          }`}
          type="submit"
          onClick={handleSubmit}
          disabled={disableSubmit}
        >
          Search
        </button>

        <button
          className={`bg-slate-500 font-semibold px-2 rounded-md py-1 ${
            disableReset ? "opacity-50" : "hover:bg-slate-400"
          }`}
          type="reset"
          onClick={() => setInput({ phone: "" })}
          disabled={disableReset}
        >
          Reset
        </button>
      </div>
    </form>
  );
}

export default Form;
