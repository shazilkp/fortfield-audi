import React, { useState, useEffect } from "react";
import {
  addMonths, subMonths, format, startOfMonth,
  endOfMonth, startOfWeek, endOfWeek, addDays,
  isSameMonth, isSameDay, 
} from "date-fns";
import { collection, getDocs, query, where,Timestamp } from "firebase/firestore";
import { db } from "@/firebase"; 

const CalendarPage = ({SetView}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [reservations, setReservations] = useState({});
  const [selectedDateData,setSelectedDateData] = useState(null);

  const ReservationCard = ({ data }) => {
   
    const { date, slot1, slot2, fullDay } = data;
  
    const renderSlot = (title, slotData) => (
        <div className="bg-white rounded-2xl p-5 shadow-inner shadow-purple-200 space-y-4 border border-gray-100">
            <span className="flex flex-row justify-between items-center">
                <h3 className="text-base font-semibold text-gray-800">{title}</h3>
                <p className="text-slate-500 text-xs ">{slotData?.bookingId || "—"}</p>
            </span>
          
      
          <div className="flex justify-between text-sm text-gray-700">
            <div>
              <p className="font-medium">{slotData?.name || "—"}</p>
              <p className="text-gray-500">{slotData?.mobileNo || "—"}</p>
            </div>
            <div className="text-right">
              <p>{slotData?.purpose || "—"}</p>
              <p className="text-xs text-gray-400">{slotData?.pax || 0} PAX</p>
            </div>
          </div>
      
          <div className="flex justify-between items-center text-xs text-gray-500 border-t pt-3">
            <span className="italic">{slotData?.bookedBy || "—"}</span>
            <span>
              {slotData?.bookingTimestamp
                ? format(slotData.bookingTimestamp.toDate(), "d MMM yyyy, h:mm a")
                : "—"}
            </span>
          </div>
        </div>
      );
      
  
      return (
        <div className=" flex flex-col max-w-lg mx-auto my-6 p-4 bg-gradient-to-b from-zinc-200 to-slate-50 rounded-2xl shadow-2xl space-y-11 border border-gray-200 min-w-xs">
          <div className="flex flex-row justify-between">
            <h2 className="text-lg font-bold text-gray-800">
              {format(date.toDate(), "d MMMM yyyy")}
            </h2>
            <button
                onClick={() => setSelectedDateData(null)}
                className=" text-gray-500 hover:text-red-500"
              >
                ✕
              </button>
          </div>
  
          {renderSlot("Slot 1", slot1)}
          {renderSlot("Slot 2", slot2)}
          {renderSlot("Full Day", fullDay)}
        </div>
      );
  };

  const fetchReservations = async () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);

    console.log(start,end)

    const q = query(
      collection(db, "reservations"),
      where("date", ">=", Timestamp.fromDate(start)),
      where("date", "<=", Timestamp.fromDate(end)),
    
    );

    const snapshot = await getDocs(q);
    const resMap = {};
    snapshot.forEach(doc => {
      const data = doc.data();
      const dateStr = format(data.date.toDate(), "yyyy-MM-dd");
      resMap[dateStr] = data; // You can store full doc if needed
    });

    setReservations(resMap);
   
  };

  useEffect(() => {
    fetchReservations();
  }, [currentMonth]);

  const header = () => (
    <div className="flex justify-between items-center mb-6">
      <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>←</button>
      <h2 className="text-xl font-semibold text-gray-700">
        {format(currentMonth, "MMMM yyyy")}
      </h2>
      <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>→</button>
    </div>
  );

  const daysOfWeek = () => {
    const start = startOfWeek(currentMonth);
    return (
      <div className="grid grid-cols-7 mb-2">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="text-center text-xs uppercase text-[#003e3e]">
            {format(addDays(start, i), "EEE")}
          </div>
        ))}
      </div>
    );
  };

  



  const calendarCells = (setSelectedDateData) => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const dateStr = format(day, "yyyy-MM-dd");
        const res = reservations[dateStr];
        const isToday = isSameDay(day, new Date());
        const isCurrentMonth = isSameMonth(day, monthStart);
        
        let textColor = "text-black"
        
        if(!isCurrentMonth){
          textColor = "text-gray-400"
        }
        let bgColor = "bg-white";
        let topColor = "bg-white";
        let bottomColor = "bg-white"

        
        if (res?.fullDay && (res?.fullDay.name || res?.fullDay.mobileNo)) {
          topColor = "bg-red-500";  
          bottomColor = "bg-red-500";  
        }    // both slots booked
        if (res?.slot1 && (res?.slot1.name || res?.slot1.mobileNo)) topColor = "bg-yellow-400"; // one slot booked
        if (res?.slot2 && (res?.slot2.name || res?.slot2.mobileNo)) bottomColor = "bg-green-400";
        if (isToday) bgColor += " ring-2 ring-red";

        days.push(
          <div key={day} onClick={() => {setSelectedDateData(res)}} className={`relative text-center py-2 rounded-xl ${bgColor} text-sm min-h-10 overflow-hidden transition-all duration-200`}>
            {/* Top Half */}
            <div className={`absolute top-0 left-0 w-full  h-1/2 flex justify-center ${topColor} items-center transition-all duration-200`}>
              {/* Optional: You can add top content here */}
            </div>

            {/* Bottom Half */}
            <div className={`absolute bottom-0 left-0 w-full h-1/2 flex justify-center ${bottomColor} items-center transition-all duration-200`}>
              {/* Optional: You can add bottom content here */}
            </div>

            {/* Centered Text */}
            <div className={`absolute inset-0 flex justify-center ${textColor} items-center`}>
              {format(day, "d")}
            </div>
          </div>

        );
        day = addDays(day, 1);
      }

      rows.push(
        <div className="grid grid-cols-7 gap-2 mb-2" key={day}>
          {days}
        </div>
      );
      days = [];
    }

    return <div>{rows}</div>;
  };

  return (
    <div className="relative">
     
      <div
        className={`flex flex-col justify-center max-w-md mx-auto px-4 font-sans min-h-screen transition-all duration-300 ${
          selectedDateData ? "blur-sm pointer-events-none select-none" : ""
        }`}
      >
        <button onClick={() => SetView("home")} className="p-8 absolute top-0 right-0 text-gray-500 hover:text-red-500">
          ✕
        </button>
        <div className="shadow-2xl p-4 rounded-2xl bg-white transition-all duration-200">
          {header()}
          {daysOfWeek()}
          {calendarCells(setSelectedDateData)}
        </div>
      </div>

      {/* Overlayed Reservation Card */}
      {selectedDateData && (
        
            <div className="fixed inset-0 flex justify-center items-center">
            <ReservationCard data={selectedDateData} />
            </div>

            
          
        
      )}
    </div>

  );



}


export default CalendarPage;