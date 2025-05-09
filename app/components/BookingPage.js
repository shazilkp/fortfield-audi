import React, { useState, useEffect,useMemo } from "react";
import { useRouter,usePathname,useParams } from "next/navigation";
import {
  format, startOfMonth,
  endOfMonth, isSameDay, eachDayOfInterval,startOfDay,endOfDay
} from "date-fns";
import { collection, getDocs, query, where,Timestamp,getDoc,doc,setDoc,updateDoc } from "firebase/firestore";
import { db } from "@/firebase"; 

import ScrollableDateSelector from "./ScrollableDateSelector";

  const saveReservation = async (selectedDate, slot, phone,purpose,pax,ac,name,bookingId,setShowModal,adminName) => {
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    const docRef = doc(db, "reservations", formattedDate);
    let slotKey= "";
    if(slot === 1){
        slotKey = "slot1";
    }
    if(slot == 2){
        slotKey = "slot2";
    }
    if(slot == 3){
        slotKey = "fullDay";
    }
  
    try {
      const docSnap = await getDoc(docRef);
  
      if (!docSnap.exists()) {
        // Create the document with empty slot objects
        await setDoc(docRef, {
          date: Timestamp.fromDate(selectedDate),
          slot1: {},
          slot2: {},
          fullDay: {},
        });
      }
  
      // Update only the specified slot
      await updateDoc(docRef, {
        [slotKey]: {
          bookingId: bookingId,
          mobileNo: phone,
          name: name,
          pax: pax,
          purpose: purpose,
          bookingTimestamp: Timestamp.fromDate(new Date()),
          bookedBy: adminName,
          ac: ac
        },
      });
  
      console.log("Reservation saved successfully");
      setShowModal(bookingId);
    } catch (error) {
      console.error("Error saving reservation:", error);
      setShowModal(bookingId);
    }
  };


  const BookingCard = ({ selectedDate,setSelectedDate, data, onBook }) => {
    //console.log(data);
    const [phone, setPhone] = useState("");
    const [purpose,setPurpose] = useState("");
    const [pax,setPax] = useState(0);
    const [ac,setAc] = useState(false);
    const [name,setName] = useState("");
    const [showModal, setShowModal] = useState(null);

    const router = useRouter();


    const [selectedSlot, setSelectedSlot] = useState(null);
    const pathname = usePathname();
    const params = useParams();

    // Extract date and slot from the URL
    const { date, slot } = params;
    const isDetailedRoute = date && slot;

    //console.log(searchParams?.has("date"))

  
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    //console.log("hey",data);
  
    const isSlotBooked = (slot) =>{
        if(!data){
            return false;
        }
        
        if(slot === 1){
            if(data.slot1?.name || data.slot1?.mobileNo){
                return true;
            }
            if(data.fullDay?.name || data.fullDay?.mobileNo){
                return true;
            }
            else{
                return false;
            }
        }

        if(slot === 2){
            if(data.slot2?.name || data.slot2?.mobileNo){
                return true;
            }
            if(data.fullDay?.name || data.fullDay?.mobileNo){
                return true;
            }
            else{
                return false;
            }
        }

        if(slot === 3){
            if(data.fullDay?.name || data.fullDay?.mobileNo){
                return true;
            }
            else{
                if(isSlotBooked(1) || isSlotBooked(2)){
                    return true;
                }
                return false;
            }
        }
    }
        
    const handleBooking = () => {
      if (!phone || !selectedSlot) return;
      onBook(selectedDate,selectedSlot, phone,purpose,pax,ac,name,setShowModal );
      setPhone("");
      setSelectedSlot(null);
    };

    useEffect(()=> {
        const slotNo = Number(slot); // → NaN
        if (!isNaN(slotNo)) {
            setSelectedSlot(slotNo);
        }
        if(date){
            setSelectedDate(new Date(date));
        }
        
    },[params])
  
    return (
        <div>
        <div className={`bg-gradient-to-bl from-zinc-200 to-slate-50 p-6 rounded-3xl shadow-lg max-w-sm mx-auto space-y-6 text-gray-800 transition-all duration-300 ${
                showModal ? "blur-sm pointer-events-none select-none" : ""
                }`}>
    
    <h2 className="text-2xl font-semibold tracking-tight relative">
      Book Slot <span className="block text-base text-gray-500">{selectedDate?format(selectedDate, "PPP"):"         "}</span>
      
    </h2>
    {!isDetailedRoute && <ScrollableDateSelector setSelectedDate={setSelectedDate} selectedDate={selectedDate}/>}
    
    <div className="flex flex-col space-y-2">
      <div className="flex justify-between items-center bg-white rounded-2xl px-4 py-3 shadow-inner space-x-2">
        {[1, 2, 3].map((slot) => {
          const label = slot === 3 ? "Full Day" : `Slot ${slot}`;
          return (
            <button
              key={slot}
              disabled={isSlotBooked(slot)}
              onClick={() => setSelectedSlot(slot)}
              className={`text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200 ${
                isSlotBooked(slot)
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : selectedSlot === slot
                  ? "bg-gradient-to-tr from-slate-400 to-zinc-900 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-slate-100"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
      <span className="px-2.5 py-1 text-xs text-red-400">
        {isSlotBooked(1) && isSlotBooked(2) && isSlotBooked(3) ? "All slots are full" : ""}
      </span>
    </div>

    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Name</label>
      <input
        type="text"
        placeholder="Enter name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white shadow-inner"
      />
    </div>

    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Phone Number</label>
      <input
        type="text"
        placeholder="Enter phone number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white shadow-inner"
      />
    </div>

    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Purpose</label>
      <select
        value={purpose}
        onChange={(e) => setPurpose(e.target.value)}
        className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-400"
      >
        <option value="">Select purpose</option>
        <option value="meeting">Meeting</option>
        <option value="event">Event</option>
        <option value="class">Class</option>
      </select>
    </div>

    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-gray-700">AC Required</label>
      <input
        type="checkbox"
        checked={ac}
        onChange={() => setAc(!ac)}
        className="w-5 h-5 accent-purple-600"
      />
    </div>

    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Number of Extra People (Pax)</label>
      <input
        type="number"
        value={pax}
        onChange={(e) => setPax(e.target.value)}
        min="1"
        className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-400"
      />
    </div>

    <button
      onClick={handleBooking}
      disabled={!phone || !selectedSlot || !name || !purpose}
      className="w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-slate-400 to-zinc-900 hover:from-slate-500 hover:to-zinc-950 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Book Slot
    </button>



    


  </div>
  {showModal && (
  <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-lg text-center space-y-4">
      <h3 className="text-xl font-semibold text-gray-800">Booking Confirmed</h3>
      <p className="text-sm text-gray-600">Your slot has been booked successfully with booking ID {showModal}.</p>
      <button
        onClick={() => {
            setShowModal(false);
            setSelectedDate(null);
            if(isDetailedRoute){
                router.push("/dashboard")
            }
            


        }}
        className="mt-4 px-6 py-2 rounded-xl bg-gradient-to-r from-slate-400 to-zinc-900 text-white font-medium hover:from-slate-500 hover:to-zinc-950 transition"
      >
        Close
      </button>
    </div>
  </div>
)}
  </div>
);

      
  }

  const BookingPage = ({ SetView }) => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedDateData, setSelectedDateData] = useState(null);
    const [adminName,setAdminName] = useState("")

    const fetchReservations = async () => {
        if(!selectedDate){
            setSelectedDateData(null);
        }
        
        console.log("world")
        const start = Timestamp.fromDate(startOfDay(selectedDate));
        const end = Timestamp.fromDate(endOfDay(selectedDate));

        const q = query(
        collection(db, "reservations"),
        where("date", ">=", start),
        where("date", "<=", end)
        );

        const snapshot = await getDocs(q);
        setSelectedDateData(null);
        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(data)
            setSelectedDateData(data);
        });

    };
    useEffect( () => {
        async function getAdminName(){
            const res = await fetch("/api/user");
            const data = await res.json();
            //console.log(data.name);
            setAdminName(data.name) // Use this however you need
        }
        getAdminName();

      }, []);

    useEffect(() => {
        
        fetchReservations();
        
    }, [selectedDate])

    const generateBookingId = (selectedDate) => {
        const adjustedDate = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000);
        const date = adjustedDate.toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.random().toString(36).substring(2, 7).toUpperCase();
        return `B-${date}-${random}`;
    };

    
  
    return (
        <div className="">
                <BookingCard
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    data={selectedDateData}
                    onBook={(selectedDate,selectedSlot, phone,purpose,pax,ac,name,setShowModal ) => {
                        // Call Firestore or API here
                        const bookingId = generateBookingId(selectedDate);
                        saveReservation(selectedDate,selectedSlot, phone,purpose,pax,ac,name,bookingId,setShowModal,adminName);
                       
                    }}
                />
                </div>
    );

  };


  export default BookingPage;