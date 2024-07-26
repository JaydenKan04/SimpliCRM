import React from "react";

function InquiryForm({
  handleSort,
  handleFilterType,
  handleFilterPriority,
  handleFilterStatus,
  setIsAsc,
  isAsc,
  setIsEditStatus
}) {
  return (
    <form className="mb-7 text-sm" action="">
      <div className="flex flex-col mb-3">
        <div className="text-center text-slate-400 font-semibold mb-1 text-base">
          Filter
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
          <div className="flex flex-col gap-1">
            <label className="font-semibold" htmlFor="filterInquiryType">
              Inquiry Type
            </label>
            <select
              name="filterInquiryType"
              id="filterInquiryType"
              onChange={handleFilterType}
            >
              <option value="All">All</option>
              <option value="General Inquiry">General Inquiry</option>
              <option value="Shipping">Shipping</option>
              <option value="Warranty">Warranty</option>
              <option value="Return & Refund">Return & Refund</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-semibold" htmlFor="filterInquiryPriority">
              Inquiry Priority
            </label>
            <select
              name="filterInquiryPriority"
              id="filterInquiryPriority"
              onChange={handleFilterPriority}
            >
              <option value="All">All</option>
              <option value="P1🔥">P1🔥</option>
              <option value="P2">P2</option>
              <option value="P3">P3</option>
              <option value="P4">P4</option>
              <option value="P5">P5</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-semibold" htmlFor="filterStatus">
              Status
            </label>
            <select
              name="filterStatus"
              id="filterStatus"
              onChange={handleFilterStatus}
            >
              <option value="All">All</option>
              <option value="Not started">Not started</option>
              <option value="In progress">In progress</option>
              <option value="Done">Done</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label
          className="font-semibold text-slate-400 text-base"
          htmlFor="sortInquiry"
        >
          Sort by
        </label>
        <select name="sortInquiry" id="sortInquiry" onChange={handleSort}>
          <option value="last edited time">last edited time</option>
          <option value="created at">created at</option>
          <option value="inquiry priority">inquiry priority</option>
        </select>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={`size-4 cursor-pointer hover:text-blue-500 ${
            !isAsc ? "rotate-180" : ""
          }`}
          onClick={() => {
            setIsAsc((prev) => !prev);
            setIsEditStatus({});
          }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
          />
        </svg>
      </div>
    </form>
  );
}

export default InquiryForm;
