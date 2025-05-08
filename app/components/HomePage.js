const HomePage = ({SetView}) => {
    return (<div className="flex flex-col p-36 justify-center min-h-screen space-y-10">
      <button onClick= {() => SetView("availability")} type="button" className="py-2.5 px-10  text-base font-medium text-gray-700 focus:outline-none bg-white rounded-full border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">View Availability</button>
      <button onClick= {() => SetView("booking")} type="button" className="py-2.5 px-  text-m font-medium text-gray-700 focus:outline-none bg-white rounded-full border border-gray-200 hover:bg-gray-100 hover:text-[#32CD32] focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Book Slot</button>
    </div>);
}

export default HomePage;