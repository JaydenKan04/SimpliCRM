import React from "react";
import InquiryResult from "./InquiryResult";
import CustomerDetails from "./CustomerDetails";
import InvoiceResult from "./InvoiceResult";
import CircularProgress from '@mui/material/CircularProgress';

function Result({
  loadingResult,
  customerDetails,
  customerInquiry,
  noResult,
  staffList,
  customerInvoice,
}) {
  return (
    <>
      {loadingResult ? (
        <CircularProgress size={40} />
      ) : noResult ? (
        <p className="font-light">User not found</p>
      ) : (
        <div className="w-72 p-3">
          {customerDetails && (
            <CustomerDetails customerDetails={customerDetails} />
          )}
          {customerInquiry.length !== 0 ? (
            <InquiryResult
              customerInquiry={customerInquiry}
              staffList={staffList}
            />
          ) : (
            <p className="font-light text-center italic">No inquiry history</p>
          )}
          {customerInvoice.length !== 0 ? (
            <InvoiceResult customerInvoice={customerInvoice}/>
          ) : (
            <p className="font-light text-center italic">No invoice</p>
          )}
        </div>
      )}
    </>
  );
}

export default Result;
