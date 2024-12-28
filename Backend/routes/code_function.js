//-------------------------------------------------------------------
function formatDate(date_format) {
    const date = new Date(date_format);
    const day = date.getDate();
    const month = date.getMonth() + 1; // Months are zero-based
    const year = date.getFullYear();
    return `${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`;
}
  // Function to format time (hours, minutes, seconds)
//   function formatTime(date_format) {
//     const date = new Date(date_format);
//     const hours = date.getHours();
//     const minutes = date.getMinutes();
//     const seconds = date.getSeconds();
//     return `${hours}:${minutes}:${seconds}`;
//   }
function formatTime(date_format) {
    const date = new Date(date_format);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}
  //----------------------------------------------------------------------------------------
  /**
   * Function to check if start time is earlier than end time.
   * @param {string} timeStart - The start time in 'HH:MM' format.
   * @param {string} timeEnd - The end time in 'HH:MM' format.
   * @returns {boolean} - Returns true if the start time is earlier than the end time, false otherwise.
   */
  function isValidTimeRange(timeStart, timeEnd) {
    // Parse the time strings into Date objects
    const start = new Date(`1970-01-01T${timeStart}:00Z`);
    const end = new Date(`1970-01-01T${timeEnd}:00Z`);
  
    // Check if start time is earlier than end time
    return start < end;
  }

  //-------------------------------------------------------------------------------------------
  function converTime(timeStart){
    const time_convert = new Date(`1970-01-01T${timeStart}:00Z`);
    return time_convert;
  }

  //---------------------------------------------------------------------------------------------
    // Function to reverse formatDate and convert a string to a Date object
    function parseDate(dateString) {
        const [year, month, day] = dateString.split('-').map(Number);
        // Note: Month is zero-based in JavaScript Date
        return new Date(year, month - 1, day);
    }

    // Function to reverse formatTime and set time on a given Date object
    function parseTime(timeString, date) {
        const [hours, minutes] = timeString.split(':').map(Number);
        const newDate = new Date(date); // Create a new Date object based on the provided date
        newDate.setHours(hours, minutes, 0, 0); // Set the time
        return newDate;
    }

    //------------------------------------------------------------------------------------------------
    //Function to get a room with specific condition is device type
    var RoomModel = require('../models/RoomModel');
    const getRoomsWithDeviceType = async (deviceType) => {
        try {
            const rooms = await RoomModel.aggregate([
                {
                    $lookup: {
                        from: 'device', // The collection name in MongoDB
                        localField: 'device.device_id', // Field from the Room model
                        foreignField: '_id', // Field from the Device model
                        as: 'devices' // The output array field
                    }
                },
                {
                    $match: {
                        'devices.type': deviceType // Filter rooms that have devices of specific type
                    }
                }
            ]);
            return rooms;
        } catch (error) {
            console.error("Error fetching rooms: ", error);
            throw error; // Or handle the error as needed
        }
    };

    //-----------------------------------------------------------------------------------------------
    // function isDayLaterThanToday(day) {
    //     // Check if day is provided
    //     if (!day) {
    //         throw new Error('Day is required');
    //     }
    
    //     // Split the day into components
    //     const [month, date, year] = day.split('-').map(Number);
    
    //     // Validate the date components
    //     if (isNaN(month) || isNaN(date) || isNaN(year)) {
    //         throw new Error('Invalid date format');
    //     }
    
    //     // Create a Date object for the input day
    //     const inputDate = new Date(year, month - 1, date); // month is 0-indexed in JavaScript
    
    //     // Get the current date
    //     const currentDate = new Date();
    //     currentDate.setHours(0, 0, 0, 0); // Set current time to midnight for comparison
    
    //     // Compare the dates
    //     return inputDate > currentDate;
    // }
    const moment = require('moment-timezone');

    function isDayLaterThanToday(inputDay) {
    // Parse the input day in YYYY-MM-DD format
    const parsedDay = moment.tz(inputDay, 'YYYY-MM-DD', 'Asia/Ho_Chi_Minh');
    
    // Get the current date in the same time zone
    const currentDate = moment.tz('Asia/Ho_Chi_Minh').startOf('day'); // Start of the day

    // Compare the two dates
    //return parsedDay.isAfter(currentDate);
    return parsedDay.isSameOrAfter(currentDate);

}

    //------------------------------------------------------------------------------------------------

    function addCountdownTime(countdown) {
        // Get the current time
        const currentDate = new Date();
      
        // Parse the countdown string (e.g., "00:05") into hours and minutes
        const [hours, minutes] = countdown.split(':').map(Number);
      
        // Add the countdown to the current time
        currentDate.setHours(currentDate.getHours() + hours);
        currentDate.setMinutes(currentDate.getMinutes() + minutes);
      
        // Format the result as a string "HH:mm"
        const formattedTime = `${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}`;
      
        return formattedTime;
      }

      //---------------------------------------------------------------------------------------------------------------------
    

  module.exports = {
    formatDate,
    formatTime, 
    isValidTimeRange,
    parseDate,
    parseTime,
    getRoomsWithDeviceType,
    isDayLaterThanToday,
    addCountdownTime,
    converTime

  };