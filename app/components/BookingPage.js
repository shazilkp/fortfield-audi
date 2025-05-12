import React, { useState, useEffect,useMemo } from "react";
import { useRouter,usePathname,useParams } from "next/navigation";
import {
  format, startOfMonth,
  endOfMonth, isSameDay, eachDayOfInterval,startOfDay,endOfDay
} from "date-fns";
import { collection, getDocs, query, where,Timestamp,getDoc,doc,setDoc,updateDoc } from "firebase/firestore";
import { db } from "@/firebase"; 

import { writeBatch } from "firebase/firestore"; 

import ScrollableDateSelector from "./ScrollableDateSelector";

const saveReservation = async (
    selectedDate,
    slot,
    phone,
    purpose,
    pax,
    ac,
    name,
    bookingId,
    setShowModal,
    adminName
  ) => {
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    const docRef = doc(db, "reservations", formattedDate);
    const indexRef = doc(db, "bookingsIndex", bookingId); // Reference to the bookingsIndex collection
  
    let slotKey = "";
    if (slot === 1) {
      slotKey = "slot1";
    }
    if (slot === 2) {
      slotKey = "slot2";
    }
    if (slot === 3) {
      slotKey = "fullDay";
    }
  
    // Start a batch write
    const batch = writeBatch(db);
  
    try {
      // Reference the document in the reservations collection
      const docSnap = await getDoc(docRef);
  
      if (!docSnap.exists()) {
        // Create the document with empty slot objects if the date doesn't exist yet
        batch.set(docRef, {
          date: Timestamp.fromDate(selectedDate),
          slot1: {},
          slot2: {},
          fullDay: {},
        });
      }
  
      // Update the specified slot in the reservations collection
      batch.update(docRef, {
        [slotKey]: {
          bookingId: bookingId,
          mobileNo: phone,
          name: name,
          pax: pax,
          purpose: purpose,
          bookingTimestamp: Timestamp.fromDate(new Date()),
          bookedBy: adminName,
          ac: ac,
        },
      });
  
      // Now, update the bookingsIndex with the minimal metadata
      batch.set(indexRef, {
        bookingId: bookingId,
        mobileNo: phone,
        slot: slotKey,
        date: formattedDate,
      });
  
      // Commit the batch to execute all writes atomically
      await batch.commit();
  
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
        <div className={`backdrop-blur-xl bg-white/20 p-6 rounded-3xl shadow-lg max-w-sm mx-auto space-y-6 text-gray-800 transition-all duration-300 ${
                showModal ? "blur-sm pointer-events-none select-none" : ""
                }`}>
    
    <h2 className="text-2xl text-white font-semibold tracking-tight relative">
      Book Slot <span className="block text-base text-gray-300">{selectedDate?format(selectedDate, "PPP"):"         "}</span>
      
    </h2>
    {!isDetailedRoute && <ScrollableDateSelector setSelectedDate={setSelectedDate} selectedDate={selectedDate}/>}
    
    <div className="flex flex-col space-y-2">
      <div className="flex justify-between items-center backdrop-blur-md rounded-full border border-white/20 px-4 py-3 shadow-inner space-x-2">
        {[1, 2, 3].map((slot) => {
          const label = slot === 3 ? "Full Day" : `Slot ${slot}`;
          return (
            <button
              key={slot}
              disabled={isSlotBooked(slot)}
              onClick={() => setSelectedSlot(slot)}
              className={`text-sm  font-medium px-4 py-2 rounded-full transition-all duration-200 ${
                isSlotBooked(slot)
                  ? "bg-black/20 text-gray-400 cursor-not-allowed"
                  : selectedSlot === slot
                  ? "bg-white  shadow-md border border-white/40"
                  : "bg-white/30  shadow-md  text-gray-700 hover:bg-white/50"
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

    <div className="flex flex-col gap-2 ">
      
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="backdrop-blur-md w-full text-sm  text-black px-5 py-3 rounded-full border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-400/40 bg-white/20 shadow-inner"
      />
    </div>

    <div className="space-y-2">
     
      <input
        type="text"
        placeholder="Enter phone number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="backdrop-blur-md w-full text-sm px-5 py-3 rounded-full border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-400/40 bg-white/20 shadow-inner"
      />
    </div>

    <div className="flex flex-row gap-7 items-center">
      
      

      <div className="space-y-2">
      <label className="text-sm px-3 font-medium text-white">Pax</label>
      <input
        type="number"
        value={pax}
        onChange={(e) => setPax(e.target.value)}
        min="1"
        className="backdrop-blur-md  text-black w-full text-sm px-5 py-3 rounded-full border border-white/20 focus:outline-none no-spinner focus:ring-2 focus:ring-purple-400/40 bg-white/20 shadow-inner backdrop-opacity-40"
      />
    </div>

      <div className="ml-3 flex flex-col space-y-2 items-center text-xs font-medium text-gray-700">
        <label className="text-sm font-medium text-white">AC?</label>
            <button
            onClick={() =>
                setAc(!ac)
            }
            className={`w-10 h-5 flex items-center bg-gray-300 rounded-full p-1 transition-colors duration-300 ${
                ac ? "bg-purple-400/40" : "bg-blue-400"
            }`}
            >
            <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                ac ? "translate-x-5" : ""
                }`}
            />
            </button>
            
        </div>
    </div>

    {/* Toggle Switch */}
    <select
        value={purpose}
        onChange={(e) => setPurpose(e.target.value)}
        className="backdrop-blur-md w-full text-sm px-5 py-3 text-black rounded-full border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-400/40 bg-white/20 shadow-inner"
      >
        <option value="">Select purpose</option>
        <option value="meeting">Meeting</option>
        <option value="event">Event</option>
        <option value="class">Class</option>
    </select>


    <button
      onClick={handleBooking}
      disabled={!phone || !selectedSlot || !name || !purpose}
      className="w-full py-3 rounded-full font-semibold text-black bg-white hover:bg-white hover:text-black  transition disabled:opacity-60 disabled:cursor-not-allowed"
    >
      Book Slot
    </button>



    


  </div>
  {showModal && (
  <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white/40 rounded-3xl p-6 max-w-sm w-full shadow-lg text-center space-y-4 ">
      <h3 className="text-xl font-semibold text-black">Booking Confirmed</h3>
      <p className="text-sm text-gray-900">Your slot has been booked successfully with booking ID {showModal}.</p>
      <button
        onClick={() => {
            setShowModal(false);
            setSelectedDate(null);
            if(isDetailedRoute){
                router.push("/dashboard")
            }
            


        }}
        className="mt-4 px-6 py-2 rounded-full bg-white text-black font-semibold hover:text-white hover:bg-white/40 transition"
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
        
        //console.log("world")
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
            //console.log(data)
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
        <div className="flex flex-col justify-center bg-center bg-cover bg-repeat-space bg-gradient-to-bl from-[#0f172a] via-[#1e1a78] to-[#0f172a] min-h-screen h-max px-3"
            style={{ backgroundImage: "url('/3.png')" }}
        >
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