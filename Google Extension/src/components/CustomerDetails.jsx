import React from "react";

function CustomerDetails({ customerDetails }) {
  return (
    <div className="mb-8">
      <div className="flex items-start gap-3">
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
            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
          />
        </svg>

        <p className="font-bold text-lg uppercase">Customer Details</p>
      </div>
      <div className="divide-y divide-slate-500">
        <div className="flex items-center justify-between py-2">
          <div className="font-semibold text-sm">ID:</div>
          <div className="font-light text-base">
            {customerDetails.ID.unique_id.number}
          </div>
        </div>
        <div className="flex items-center justify-between py-2">
          <div className="font-semibold text-sm">Name:</div>
          <div className="font-light text-base">
            {customerDetails?.Name.title[0].plain_text}
          </div>
        </div>
        <div className="flex items-center justify-between py-2">
          <div className="font-semibold text-sm">Phone no:</div>
          <div className="font-light text-base">
            {customerDetails["Phone Number"].phone_number}
          </div>
        </div>
        <div className="flex items-center justify-between py-2">
          <div className="font-semibold text-sm">Email:</div>
          <div className="font-light text-base">
            {customerDetails["Email Address"].email}
          </div>
        </div>
        {/* <div>Created time: {formatDate(customerDetails["Created time"].created_time)}</div> */}
        {/* <div>
          Last edited At: {formatDate(customerDetails["Last Edited At"].last_edited_time)}
        </div>
        <div>
          Last edited by: {customerDetails["Last Edited By"].last_edited_by.name}
        </div> */}
      </div>
    </div>
  );
}

export default CustomerDetails;

export function formatDate(isoString) {
  const date = new Date(isoString);

  const options = {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };

  return new Intl.DateTimeFormat("en-US", options).format(date);
}
