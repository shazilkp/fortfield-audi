import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import {
  addMonths, subMonths, format, startOfMonth,
  endOfMonth, startOfWeek, endOfWeek, addDays,
  isSameMonth, isSameDay, 
} from "date-fns";
import { collection, getDocs, query, where,Timestamp } from "firebase/firestore";
import { db } from "@/firebase"; 


const CalendarPage = ({SetView}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState("");
  const [reservations, setReservations] = useState({});
  const [selectedDateData,setSelectedDateData] = useState(null);
  const [cardOpen,setCardOpen] = useState(false);

  const router = useRouter();

  const ReservationCard = ({ data }) => {
   
    const {
      date = null,
      slot1 = {},
      slot2 = {},
      fullDay = {}
    } = data ?? {};

    let indi = true;
    if(fullDay?.name || fullDay?.mobileNo ){
      indi = false;
    }
  
    const renderSlot = (title, slotData, slotNo) => (
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
                ? format(slotData?.bookingTimestamp.toDate(), "d MMM yyyy, h:mm a")
                : "—"}
            </span>
          </div>
          <div className="flex justify-between items-center gap-x-6">
          <button
            type="button"
            disabled={slotData?.mobileNo || slotData?.name}

            onClick={() => {
              const str = `/booking/${format(new Date(selectedDate), "yyyy-MM-dd")}/${slotNo}`;
              router.push(str)
            }
            }
            className="flex-1 text-white bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-4 focus:ring-yellow-300 font-medium rounded-full text-sm py-1.5 text-center dark:focus:ring-yellow-900 disabled:bg-gray-300 disabled:text-gray-500"
          >
            Book
          </button>

          <button
            type="button"
            disabled={!slotData?.mobileNo && !slotData?.name}
            className="flex-1 text-white bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-4 focus:ring-yellow-300 font-medium rounded-full text-sm py-1.5 text-center dark:focus:ring-yellow-900 disabled:bg-gray-300 disabled:text-gray-500"
            onClick={() => {
              const str = `/cancel/${format(new Date(selectedDate), "yyyy-MM-dd")}/${slotNo}`;
              router.push(str)
            }}
          >
            Cancel
          </button>
        </div>
        </div>
      );
      
  
      return (
        <div className=" flex flex-col max-w-lg mx-auto my-6 p-4 bg-gradient-to-b from-zinc-200 to-slate-50 rounded-2xl shadow-2xl space-y-11 border border-gray-200 min-w-xs">
          <div className="flex flex-row justify-between">
            <h2 className="text-lg font-bold text-gray-800">
              {selectedDate}
            </h2>
            <button
                onClick={() => setCardOpen(false)}
                className=" text-gray-500 hover:text-red-500"
              >
                ✕
              </button>
          </div>
  
          {indi && renderSlot("Slot 1", slot1,1)}
          {indi && renderSlot("Slot 2", slot2,2)}
          {!indi && renderSlot("Full Day", fullDay,3)}
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
    <div className="flex justify-between items-center mb-4 ">
      <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>←</button>
      <h2 className="text-lg font-semibold text-gray-700">
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
            {format(addDays(start, i), "EEEEE")}
          </div>
        ))}
      </div>
    );
  };

  
  const todayData = () => {
    const dateStr1 = format(new Date(), "yyyy-MM-dd");
    const dateStr = "2025-05-14"
    const res = reservations[dateStr];
   
    const slots = [
      { key: "slot1", label: "Slot 1" },
      { key: "slot2", label: "Slot 2" },
      { key: "fullDay", label: "Full Day" },
    ];
    

    return(
    <div className="bg-white rounded-xl shadow-md p-4 w-full max-w-md">
      

      <div className="space-y-2">
        {slots.map(({ key, label }) => {

          const slot = res?.[key];
          console.log("slot",key)
          return slot?.name ? (
            <div key={key} className="border rounded-lg p-3 flex justify-between items-center">
              <div>
                <p className="font-medium">{label}</p>
                <p className="text-sm text-gray-600">{slot.name}</p>
                <p className="text-xs text-gray-500">{slot.phone}</p>
              </div>
              <span className="text-xs bg-gray-200 rounded-full px-2 py-1">
                {slot.purpose || "No purpose"}
              </span>
            </div>
          ) : (
            <div key={key} className="text-sm text-gray-400 italic">
              {label}: Not booked
            </div>
          );
        })}
      </div>
    </div>
    );
  };


  const calendarCells = (setSelectedDateData,setCardOpen,setSelectedDate) => {
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
        let topColor = "fill-white";
        let bottomColor = "bg-white"

        
        if (res?.fullDay && (res?.fullDay.name || res?.fullDay.mobileNo)) {
          topColor = "fill-red-500";  
          bottomColor = "bg-red-500";  
        }    // both slots booked
        if (res?.slot1 && (res?.slot1.name || res?.slot1.mobileNo)) topColor = "fill-yellow-400"; // one slot booked
        if (res?.slot2 && (res?.slot2.name || res?.slot2.mobileNo)) bottomColor = "bg-green-400";
        if (isToday) bottomColor += " ring-2";

        days.push(
          
          <div key={day} onClick={() => {
            setCardOpen(true)
            setSelectedDateData(res)
            setSelectedDate(format(new Date(dateStr),"d MMMM yyyy"));
          }
          } 
            className={`relative text-center py-2 aspect-square rounded-full ${bottomColor} overflow-hidden text-sm min-h-4  transition-all duration-200`}
          >
            {/* Top Half */}
            
            <div className={`absolute top-0 left-0 w-full  h-1/2 flex justify-center items-center transition-all duration-150`}>
                <svg data-name="Layer 1" viewBox="0 0 1200 1200"  xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className={`${topColor}`}>
                  <rect width="1300" height="805"  />
                  <g transform="translate(1200, 84)">
                  <rect width="100" height="805"  />
                  </g>
                  <g transform="translate(0, 800)">
                    <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" 
                    ></path>
                    </g>
                </svg>
            </div>
              {/* Optional: You can add top content here */}
          
            

            {/* Bottom Half */}
            

            {/* Centered Text */}
            <div className={`absolute inset-0 text-[0.8rem] flex justify-center ${textColor} items-center`}>
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
        className={`flex flex-col justify-around max-w-md mx-auto bg-gradient-to-r from-green-50 to-sky-100 py-2.5 px-4 font-sans min-h-svh transition-all duration-300 ${
          cardOpen ? "blur-sm pointer-events-none select-none" : ""
        }`}
      >

        <div className="flex flex-col justify-baseline space-y-8 -mt-11">
        <div className="flex flex-row justify-center">
          <div className="w-24 h-14  flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-400 rounded-lg text-gray-500 text-sm">
            Logo
          </div>
        </div>

        <input
          type="text"
          placeholder="Enter phone number"
          className="rounded-4xl text-sm px-3 py-2 w-full bg-white shadow-2xl"
        />
        
        

        <div className="shadow-2xl p-4 rounded-2xl bg-white ">
          {header()}
          {daysOfWeek()}
          {calendarCells(setSelectedDateData,setCardOpen,setSelectedDate)}
        </div>
        </div>

      
        

        <div className="flex justify-between items-center gap-x-4">
          <button
            type="button"
            onClick={() => router.push("/booking")}
            className="flex-1 text-white bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-4 focus:ring-yellow-300 font-medium rounded-full text-sm py-3.5 text-center dark:focus:ring-yellow-900"
          >
            Book
          </button>

          <button
            type="button"
            onClick={() => router.push("/cancel")}
            className="flex-1 text-white bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-4 focus:ring-yellow-300 font-medium rounded-full text-sm py-3.5 text-center dark:focus:ring-yellow-900"
          >
            Cancel Booking
          </button>
        </div>

      </div>

      {/* Overlayed Reservation Card */}
      {cardOpen && (
        
            <div className="fixed inset-0 flex justify-center items-center">
            <ReservationCard data={selectedDateData} />
            </div>

      )}
    </div>

  );



}


export default CalendarPage;