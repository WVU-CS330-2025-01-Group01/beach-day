/**
 * Reports web vitals for performance monitoring.
 * Can be hooked into analytics services like Google Analytics.
 * 
 * @param {function} onPerfEntry - Callback function to handle the metric results
 */
const reportWebVitals = onPerfEntry => {
  // Ensure the callback is a valid function before proceeding
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // Dynamically import the web-vitals library and pass metrics to the callback
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);  // Cumulative Layout Shift
      getFID(onPerfEntry);  // First Input Delay
      getFCP(onPerfEntry);  // First Contentful Paint
      getLCP(onPerfEntry);  // Largest Contentful Paint
      getTTFB(onPerfEntry); // Time to First Byte
    });
  }
};

export default reportWebVitals;
