import { useState, useEffect, useRef } from "react";
import { db } from "@/firebase"; 
import { format } from "date-fns";
import { collection, query, getDocs, orderBy, startAt, endAt,doc,getDoc } from "firebase/firestore";
import { useRouter } from 'next/navigation';

export default function BookingSearch({setSearchOpen }) {
  const [queryText, setQueryText] = useState("");
  const [searchType, setSearchType] = useState("bookingId");
  const [results, setResults] = useState([]);
  const [slotData,setSlotData] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const wrapperRef = useRef(null);
  const router = useRouter();
  const cardRef = useRef();

  useEffect(() => {
    
    const delay = setTimeout(async () => {
      if (queryText.length > 2) {
        //console.log("hello")
        const matches = await queryBookingsIndex(searchType, queryText);
        //console.log(matches)
        setResults(matches);
        setShowResults(true);
        setSearchOpen(true);
      } else {
        setShowResults(false);
        setSearchOpen(false);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [queryText, searchType]);

    useEffect(() => {
      function handleClickOutside(event) {
        if (cardRef.current && !cardRef.current.contains(event.target)) {
          setSlotData(null);
        }
      }
  
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [setSlotData]);
  

  useEffect(() => {
    const close = (e) => {
      if (!wrapperRef.current?.contains(e.target)) {
        setShowResults(false);
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);


  const queryBookingsIndex = async (type, value) => {
   
    const bookingsRef = collection(db, "bookingsIndex");
    //console.log(bookingsRef)
    const searchField = type === "bookingId" ? "bookingId" : "mobileNo";
  
    // Range query for prefix match
    const q = query(
      bookingsRef,
      orderBy(searchField),
      startAt(value),
      endAt(value + '\uf8ff')
    );

    
  
    const snapshot = await getDocs(q);
    const results = [];
  
    snapshot.forEach((doc) => {
      results.push(doc.data()); // You can include doc.id if needed
    });
  
    return results;
  };

  const renderSlot = (slot,date, slotData) => {
    let slotNo;
    if(slot == "slot1"){
      slotNo = 1;
    }
    else if(slot == "slot2"){
      slotNo = 2;
    }
    else{
      slotNo = 3;
    }
    return(
        <div className="bg-white rounded-2xl p-5 shadow-inner shadow-purple-200 space-y-4 border border-gray-100">
            <span className="flex flex-row justify-between items-center">
                <h3 className="text-base font-semibold text-gray-800">{date}</h3>
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
          <div className="flex flex-row justify-end  w-full">
                    
          
                    <button
                      type="button"
                      disabled={!slotData?.mobileNo && !slotData?.name}
                      className="flex-1 w-1/3 text-white bg-[#7B3FE4] hover:bg-[#7B3FE4]/90 focus:outline-none  font-medium rounded-full text-sm py-1.5 text-center  disabled:bg-gray-400 disabled:text-gray-700"
                      onClick={() => {
                        const str = `/cancel/${date}/${slotNo}`;
                        router.push(str)
                      }}
                    >
                      Cancel
                    </button>
                  </div>
          
          
        </div>
      );
    };

  const onSelectResult = async (result) => {
    //console.log(result)
   

    const reservationRef = doc(db, "reservations", result?.date);

    try {
      const reservationSnap = await getDoc(reservationRef);
      if (reservationSnap.exists()) {
        // Extract the bookingIndex from the specified slot
        const slotData = reservationSnap.data()[result.slot];
        setSlotData(slotData);
    
  
      } else {
        console.error("No booking for given date or date invalid ", error);
      }
      
    } catch (error) {
      console.error("Error fetching information: ", error);
    }
  }

  return (
    <div ref={wrapperRef} className="relative ">
      {/* Search bar container */}
      <div className="flex items-center backdrop-blur-md bg-white/20 border border-white/30 shadow-xl rounded-full px-4 py-2">
        <input
          type="text"
          value={queryText}
          onChange={(e) => {
            setQueryText(e.target.value)
            //console.log(e.target.value)
          }
          }
          
          onFocus={() =>  {
            if(queryText.length > 2){
              setSearchOpen(true);
              setShowResults(true);
            } 
          }
        }
          placeholder={`Search by ${searchType === "bookingId" ? "Booking ID" : "Mobile No"}`}
          className="flex-1 bg-transparent text-sm text-gray-50 outline-none placeholder:text-gray-300"
        />

        {/* Toggle Switch */}
        <div className="ml-3 flex items-center text-xs font-medium text-gray-700">
          
          <button
            onClick={() =>
              setSearchType(searchType === "bookingId" ? "mobileNo" : "bookingId")
            }
            className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors duration-300 ${
              searchType === "mobileNo" ? "bg-[#792cff]" : "bg-blue-400"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                searchType === "mobileNo" ? "translate-x-5" : ""
              }`}
            />
          </button>
          
        </div>
      </div>

      {/* Results Dropdown */}
      {showResults && results.length > 0 && (
        <div className="flex py-2 flex-col gap-2 absolute min-h-[65vh] bg-none z-10 w-full mt-2 rounded-xl whitespace-nowrap max-h-[70vh] overflow-x-hidden no-scrollbar">
          {results.map((result, idx) => (
            <div
              key={idx}
              className="px-7 py-4 hover:bg-white  bg-white/60 cursor-pointer transition border border-gray-300/30 rounded-2xl shadow-md"
              onClick={() => {
                onSelectResult(result);
             
              }}
            >
              <div className="font-medium text-sm flex flex-row justify-between">
                <div >{format(new Date(result.date),"dd MMM yyyy") || "Unnamed"}</div>
                <div>{result.slot === "fullDay" ? "Full Day" : result.slot === "slot1" ? "Slot 1" : "Slot 2"}</div>
              </div>
              <div className="flex flex-row justify-between text-xs text-gray-700 py-3">
                <div >ID: {result.bookingId}</div>
                <div>Phone: {result.mobileNo}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      {slotData && (
          <div className="fixed inset-0 z-30 backdrop-blur-md bg-black/30 flex items-center justify-center px-4">
            <div ref={cardRef} className="b text-black rounded-xl shadow-2xl max-w-md w-full">
              {renderSlot(results[0]?.slot,results[0]?.date, slotData)}
            </div>
          </div>
        )}

    </div>
  );
}
