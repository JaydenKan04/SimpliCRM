import React, { useEffect, useRef, useState } from "react";
import { formatDate } from "./CustomerDetails";
import InquiryForm from "./InquiryForm";

function InquiryResult({ customerInquiry, staffList }) {
  let inquiryCopy = customerInquiry.slice();
  let sortedInquiry;

  const [sortOption, setSortOption] = useState("last edited time");
  const [filterTypeOption, setfilterTypeOption] = useState("All");
  const [filterPriorityOption, setfilterPriorityOption] = useState("All");
  const [filterStatusOption, setfilterStatusOption] = useState("All");
  const [expandInquiry, setExpandInquiry] = useState(true);
  const [isAsc, setIsAsc] = useState(true);
  const [isEditStatus, setIsEditStatus] = useState({});

  //keep track of the height of the content for the expand animation
  const inquiriesContent = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (inquiriesContent.current) {
      setContentHeight(inquiriesContent.current.scrollHeight);
    }
  }, [customerInquiry]);

  const handleChangeStatus = async (e, id, index) => {
    setIsEditStatus((prev) => ({ ...prev, [index]: false }));

    inquiryCopy = inquiryCopy.map((inquiry) =>
      inquiry.id === id
        ? (inquiry.properties.Status.status.name = e.target.value)
        : ""
    );

    try {
      const res = await fetch(`http://localhost:3001/updateInquiryDb`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pageId: id, status: e.target.value }),
        credentials: "include"
      });

      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
    } catch (err) {
      console.error("Error updating inquiry table: ", err);
    }
  };

  const handleClickStatusEdit = (index) => {
    setIsEditStatus((prev) => ({ ...prev, [index]: true }));
  };

  const handleSort = (e) => {
    setSortOption(e.target.value);
    setIsEditStatus({});
  };

  const handleFilterType = (e) => {
    setfilterTypeOption(e.target.value);
    setIsEditStatus({});
  };

  const handleFilterPriority = (e) => {
    setfilterPriorityOption(e.target.value);
    setIsEditStatus({});
  };

  const handleFilterStatus = (e) => {
    setfilterStatusOption(e.target.value);
    setIsEditStatus({});
  };

  const lastEditedTimeSort = () => {
    return inquiryCopy.sort((a, b) => {
      const dateA = new Date(a.properties["Last Edited Time"].last_edited_time);
      const dateB = new Date(b.properties["Last Edited Time"].last_edited_time);

      return isAsc ? dateA - dateB : dateB - dateA;
    });
  };

  const createdTimeSort = () => {
    return inquiryCopy.sort((a, b) => {
      const dateA = new Date(a.properties["Created At"].created_time);
      const dateB = new Date(b.properties["Created At"].created_time);

      return isAsc ? dateA - dateB : dateB - dateA;
    });
  };

  const prioritySort = () => {
    return inquiryCopy.sort((a, b) => {
      const dataA = a.properties["Inquiry Priority"].select.name[1];
      const dataB = b.properties["Inquiry Priority"].select.name[1];

      return isAsc ? dataA - dataB : dataB - dataA;
    });
  };

  switch (sortOption) {
    case "last edited time":
      sortedInquiry = lastEditedTimeSort();
      break;
    case "created at":
      sortedInquiry = createdTimeSort();
      break;
    case "inquiry priority":
      sortedInquiry = prioritySort();
      break;
  }

  const filterType = (option) => {
    if (option !== "All") {
      return sortedInquiry.filter(
        (inquiry) => inquiry.properties["Inquiry Type"].select.name === option
      );
    }

    return sortedInquiry;
  };

  const filterPriority = (option) => {
    if (option !== "All") {
      return sortedInquiry.filter(
        (inquiry) =>
          inquiry.properties["Inquiry Priority"].select.name === option
      );
    }

    return sortedInquiry;
  };

  const filterStatus = (option) => {
    if (option !== "All") {
      return sortedInquiry.filter(
        (inquiry) => inquiry.properties.Status.status.name === option
      );
    }

    return sortedInquiry;
  };

  sortedInquiry = filterType(filterTypeOption);
  sortedInquiry = filterPriority(filterPriorityOption);
  sortedInquiry = filterStatus(filterStatusOption);

  return (
    <div className="mb-10">
      {customerInquiry.length > 1 && (
        <InquiryForm
          handleSort={handleSort}
          handleFilterType={handleFilterType}
          handleFilterPriority={handleFilterPriority}
          handleFilterStatus={handleFilterStatus}
          setIsAsc={setIsAsc}
          isAsc={isAsc}
          setIsEditStatus={setIsEditStatus}
        />
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
            d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
          />
        </svg>

        <p className="font-bold text-lg uppercase">
          Inquiry History ({sortedInquiry.length})
        </p>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={`size-4 absolute right-0 bottom-1/2 translate-y-1/2 cursor-pointer ${
            expandInquiry ? "rotate-180" : ""
          }`}
          onClick={() => setExpandInquiry((prev) => !prev)}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m19.5 8.25-7.5 7.5-7.5-7.5"
          />
        </svg>
      </div>

      <div
        ref={inquiriesContent}
        className="overflow-hidden"
        style={{ height: expandInquiry ? contentHeight + "px" : "0px", transition: "height 0.3s ease" }}
      >
        {sortedInquiry.length > 0 ? (
          sortedInquiry.map((inquiry, index) => (
            <div className="mb-5" key={inquiry.id}>
              <div className="text-center font-bold my-2">{++index}</div>
              <hr className="border-slate-500" />

              <div className="my-3">
                <div className="font-semibold text-slate-400">
                  Inquiry priority:
                </div>
                <div className="font-light text-white text-base">
                  {inquiry?.properties["Inquiry Priority"].select.name}
                </div>
              </div>
              <div className="my-3">
                <div className="font-semibold text-slate-400">
                  Inquiry Type:
                </div>
                <div className="font-light text-white text-base">
                  {inquiry?.properties["Inquiry Type"].select.name}
                </div>
              </div>
              <div className="my-3">
                <div className="font-semibold text-slate-400">
                  Inquiry Description:
                </div>
                <div className="font-light text-white text-base text-wrap">
                  {
                    inquiry?.properties["Inquiry Description"].title[0]
                      .plain_text
                  }
                </div>
              </div>
              <div className="group my-3 relative">
                <div className="font-semibold text-slate-400">Status:</div>
                <div className="font-light text-white text-base inline-flex items-center gap-3">
                  <div>{inquiry?.properties.Status.status.name}</div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className={`size-4 invisible group-hover:visible cursor-pointer hover:text-blue-500 ${
                      isEditStatus[index] ? "hidden" : ""
                    }`}
                    onClick={() => handleClickStatusEdit(index)}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                    />
                  </svg>
                  <select
                    className={`${!isEditStatus[index] ? "hidden" : ""}`}
                    onChange={(e) => handleChangeStatus(e, inquiry.id, index)}
                  >
                    <option value="Not started">Not started</option>
                    <option value="In progress">In progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
              </div>
              <div className="my-3">
                <div className="font-semibold text-slate-400">Staff:</div>
                <div className="font-light text-white text-base">
                  {
                    staffList.find(
                      (staff) =>
                        staff.id === inquiry.properties.Staff.relation[0].id
                    ).properties.Name.title[0].plain_text
                  }
                </div>
              </div>
              <div className="my-3">
                <div className="font-semibold text-slate-400">
                  Last edited time:
                </div>
                <div className="font-light text-white text-base">
                  {formatDate(
                    inquiry?.properties["Last Edited Time"].last_edited_time
                  )}
                </div>
              </div>
              <div className="my-3">
                <div className="font-semibold text-slate-400">
                  Last edited by:
                </div>
                <div className="font-light text-white text-base">
                  {inquiry?.properties["Last Edited By"].last_edited_by.name}
                </div>
              </div>
              <div className="my-3">
                <div className="font-semibold text-slate-400">Created at:</div>
                <div className="font-light text-white text-base">
                  {formatDate(inquiry?.properties["Created At"].created_time)}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="font-light text-center italic">No result</p>
        )}
      </div>
    </div>
  );
}

export default InquiryResult;
