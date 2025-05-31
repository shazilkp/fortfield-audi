import React, { useState, useEffect,useRef } from "react";
import { useRouter } from 'next/navigation';
import BookingSearch from "./BookingSearch";
import {
  addMonths, subMonths, format, startOfMonth,
  endOfMonth, startOfWeek, endOfWeek, addDays,
  isSameMonth, isSameDay, 
} from "date-fns";
import { collection, getDocs, query, where,Timestamp } from "firebase/firestore";
import { db } from "@/firebase"; 
import { getAuth } from "firebase/auth";
import { Cardo } from "next/font/google";


const CalendarPage = ({SetView}) => {
  const offsetInMilliseconds = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds

  const [currentMonth, setCurrentMonth] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [reservations, setReservations] = useState({});
  const [selectedDateData,setSelectedDateData] = useState(null);
  const [cardOpen,setCardOpen] = useState(false);
  const [searchOpen,setSearchOpen] = useState(false);

  const router = useRouter();
  const cardRef = useRef();
  

  const ReservationCard = ({ data,setCardOpen }) => {
    


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
        <div className="bg-white/50 backdrop-blur-2xl rounded-2xl p-5 inset-shadow-2xs inset-shadow-gray-400 space-y-4 ">
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
            className="flex-1 text-white bg-[#7B3FE4] hover:bg-[#7B3FE4]/90 focus:outline-none  font-medium rounded-full text-sm py-1.5 text-center  disabled:bg-gray-400 disabled:text-gray-700"
          >
            Book
          </button>

          <button
            type="button"
            disabled={!slotData?.mobileNo && !slotData?.name}
            className="flex-1 text-white bg-[#7B3FE4] hover:bg-[#7B3FE4]/90 focus:outline-none  font-medium rounded-full text-sm py-1.5 text-center  disabled:bg-gray-400 disabled:text-gray-700"
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
        <div className=" flex flex-col max-w-lg mx-auto my-6 p-4 backdrop-blur-2xl bg-white/20 rounded-2xl shadow-2xl space-y-3 border border-gray-200 min-w-xs">
          <div className="flex flex-row justify-between">
            <h2 className="text-lg font-bold text-gray-100">
              {selectedDate}
            </h2>
            <button
                onClick={() => setCardOpen(false)}
                className=" text-white hover:text-red-500"
              >
                ✕
              </button>
          </div>
  
          {indi && renderSlot("Slot 1", slot1,1)}
          {indi && renderSlot("Slot 2", slot2,2)}
          {(!indi || !data || !fullDay?.name) && renderSlot("Full Day", fullDay,3)}
        </div>
      );
  };

  const fetchReservations = async () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);

    //console.log(start,end)

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
    function handleClickOutside(event) {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setCardOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setCardOpen]);

  useEffect(() => {
    console.log(currentMonth);
    fetchReservations();
  }, [currentMonth]);

  useEffect(() =>{
    setCurrentMonth(new Date());
  },[CalendarPage]);

  const header = () => (
    <div className="flex justify-between items-center mb-4 ">
      <button className="text-white/40" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>←</button>
      <h2 className="text-lg font-semibold text-fuchsia-50">
        {format(currentMonth, "MMMM yyyy")}
      </h2>
      <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>→</button>
    </div>
  );

  const Header = () => {
    const [touchStartX, setTouchStartX] = useState(null);
  
    const handleTouchStart = (e) => {
      setTouchStartX(e.touches[0].clientX);
    };
  
    const handleTouchEnd = (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const deltaX = touchEndX - touchStartX;
  
      if (Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          // Swiped right – go to previous month
          setCurrentMonth(subMonths(currentMonth, 1));
        } else {
          // Swiped left – go to next month
          setCurrentMonth(addMonths(currentMonth, 1));
        }
      }
  
      setTouchStartX(null);
    };
  
    return (
      <div
        className="flex justify-between items-center mb-4 touch-pan-x"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <button
          className="text-white/70 text-2xl sm:text-base"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          ←
        </button>
        <h2 className="text-lg font-semibold text-fuchsia-50">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <button
          className="text-white/70 text-2xl sm:text-base"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          →
        </button>
      </div>
    );
  };

  const daysOfWeek = () => {
    const start = startOfWeek(currentMonth);
    return (
      <div className="grid grid-cols-7 mb-2">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="text-center text-xs uppercase text-amber-50">
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
          //console.log("slot",key)
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
        const currTimee = new Date();
       // console.log("trrr",currTimee); 
        const isToday = isSameDay(day, currTimee);
        const isCurrentMonth = isSameMonth(day, monthStart);
        
        let textColor = "text-white text-shadow-2xs text-shadow-blue-950"
        
        if(!isCurrentMonth){
          textColor = "text-white/40"
        }

        let bgColor = "bg-white/20";
        let topColor = "";
        let bottomColor = ""

        
        if (res?.fullDay && (res?.fullDay.name || res?.fullDay.mobileNo)) {
          //topColor = "bg-red-500/70";  
          //bottomColor = "bg-red-500/70";  
          bgColor = " bg-red-600/90"
        }    // both slots booked
      
        if (res?.slot1 && (res?.slot1.name || res?.slot1.mobileNo)) {
          topColor = "bg-lime-400/90"; // one slot booked
          bgColor= "";
          bottomColor = "bg-white/20"
    
        }
        if (res?.slot2 && (res?.slot2.name || res?.slot2.mobileNo)) {
    
          bottomColor = "bg-[#ffd468]/90";
          bgColor = ""
          if(topColor === ""){
            topColor = "bg-white/20"
          }
        }
        
        if (isToday) bgColor += " ring-2 ring-white";
        

        days.push(
          
          <div key={day} onClick={() => {
            setCardOpen(true)
            setSelectedDateData(res)
            setSelectedDate(format(new Date(dateStr),"d MMMM yyyy"));
          }
          } 
            className={`relative text-center py-2  aspect-square rounded-full border border-white/20 ${bgColor} overflow-hidden text-sm min-h-4  transition-all duration-200`}
          >
            {/* Top Half */}
            

          <div className={`absolute top-0 left-0 w-full h-1/2 ${topColor} overflow-hidden flex flex-col justify-center`}>
          <div></div>
            
          </div>


          <div className={`absolute top-1/2 left-0 w-full h-1/2 ${bottomColor} overflow-hidden flex flex-col justify-center`}>
          <div></div>
           
          </div>

{/* Bottom Wave (mirrored version) */}





            {/* Centered Text */}
            <div className={`absolute  inset-0 text-[0.8rem] flex justify-center ${textColor}  items-center`}>
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
    <div className="relative  mx-auto min-h-svh">
      <div className={`bg-center bg-cover bg-gradient-to-r from-green-50 to-sky-100 w-full h-full absolute transition-all duration-300 inset-0 z-0
      ${cardOpen || searchOpen ? "blur-md" : ""}
    `}
     style={{ backgroundImage: "url('/11.jpg')" }}></div>
      <div
        
        className={`flex flex-col bg-center bg-cover justify-around max-w-md mx-auto py-2.5 px-4 font-sans min-h-svh  ${
          cardOpen ? "blur-md pointer-events-none select-none" : ""
        }`}
      >

        <div className="flex flex-col justify-baseline space-y-8 -mt-11 z-10">
        <div className="flex flex-col items-center  justify-center">
        <img
          src="/breeze-logo.png"
          alt="Logo"
          className="w-48"
        />

        </div>

        <BookingSearch setSearchOpen={setSearchOpen}></BookingSearch>
        
        
        
        
        <div  
        className={`shadow-xl p-4 rounded-2xl bg-white/20 transition-all duration-300 backdrop-blur-sm border border-white/20 inset-shadow-md inset-shadow-white/50 ${
          searchOpen ? "blur-md pointer-events-none select-none" : ""
        }`}>
          {Header()}
          {daysOfWeek()}
          {calendarCells(setSelectedDateData,setCardOpen,setSelectedDate)}
        </div>
        </div>

      
        

        <div 
          className={`flex justify-between items-center gap-x-4  ${
            searchOpen ? "blur-md pointer-events-none select-none" : ""
          }`}>
          <button
            type="button"
            onClick={() => router.push("/booking")}
            className="flex-1 text-white bg-white/20 hover:bg-white/40 backdrop-blur-sm  border border-white/20 focus:outline-none  font-medium rounded-full text-sm py-3.5 text-center"
          >
            Book
          </button>

          <button
            type="button"
            onClick={() => router.push("/cancel")}
            className="flex-1 text-white bg-white/20 hover:bg-white/40 backdrop-blur-sm  border border-white/20 focus:outline-none  font-medium rounded-full text-sm py-3.5 text-center "
          >
            Cancel Booking
          </button>
        </div>

      </div>
      

      {/* Overlayed Reservation Card */}
      {cardOpen && (
        
            <div className="fixed inset-0 flex justify-center items-center">
              <div ref={cardRef}>
                <ReservationCard data={selectedDateData} setCardOpen={setCardOpen}/>
              </div>
            
            </div>

      )}
    </div>

  );



}


export default CalendarPage;


/*
<svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" class="shape-fill"> </path>
    </svg>




<svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" class="shape-fill"></path>
    </svg>
    */