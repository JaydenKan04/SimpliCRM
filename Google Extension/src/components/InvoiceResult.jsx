import React, { useEffect, useRef, useState } from "react";
import { formatDate } from "./CustomerDetails";

function InvoiceResult({ customerInvoice }) {
  let invoicesCopy = customerInvoice.slice();

  const [expandInvoice, setExpandInvoice] = useState(true);
  const [isAsc, setIsAsc] = useState(true);

  const invoicesContent = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (invoicesContent.current) {
      setContentHeight(invoicesContent.current.scrollHeight);
    }
  }, [customerInvoice]);

  invoicesCopy = invoicesCopy.sort((a, b) => {
    const dateA = new Date(a.properties["Created Time"].created_time);
    const dateB = new Date(b.properties["Created Time"].created_time);

    return isAsc ? dateA - dateB : dateB - dateA;
  });

  return (
    <div>
      {customerInvoice.length > 1 && (
        <div className="mb-5 text-sm flex items-center gap-3">
          <div className="font-semibold text-slate-400 text-base">Sort by:</div>
          <div>Created at</div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={`size-4 cursor-pointer hover:text-blue-500 ${
              !isAsc ? "rotate-180" : ""
            }`}
            onClick={() => setIsAsc((prev) => !prev)}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
            />
          </svg>
        </div>
      )}
      <div className="flex gap-3 relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z"
          />
        </svg>

        <p className="font-bold text-lg uppercase">
          Invoices ({customerInvoice.length})
        </p>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={`size-4 absolute right-0 bottom-1/2 translate-y-1/2 cursor-pointer ${
            expandInvoice ? "rotate-180" : ""
          }`}
          onClick={() => setExpandInvoice((prev) => !prev)}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m19.5 8.25-7.5 7.5-7.5-7.5"
          />
        </svg>
      </div>

      <div
        ref={invoicesContent}
        className="overflow-hidden"
        style={{
          height: expandInvoice ? contentHeight + "px" : "0px",
          transition: "height 0.3s ease",
        }}
      >
        {invoicesCopy.map((invoice, index) => (
          <div key={invoice.id}>
            <div className="text-center font-bold my-2">{++index}</div>
            <hr className="border-slate-500" />

            <div className="my-3">
              <div className="font-semibold text-slate-400">Company Name:</div>
              <div className="font-light text-white text-base">
                {invoice.properties["Company Name"].rich_text[0].text.content}
              </div>
            </div>
            <div className="my-3">
              <div className="font-semibold text-slate-400">
                Invoice File Name:
              </div>
              <div className="font-light text-white text-base">
                {invoice.properties["Invoice File Name"].title[0].text.content}
              </div>
            </div>
            <div className="my-3">
              <div className="font-semibold text-slate-400">Create at:</div>
              <div className="font-light text-white text-base">
                {formatDate(invoice.properties["Created Time"].created_time)}
              </div>
            </div>
            <a
              className="underline text-blue-400"
              href={
                invoice.properties["Google Drive File"].files[0].external.url
              }
            >
              View invoice
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default InvoiceResult;
