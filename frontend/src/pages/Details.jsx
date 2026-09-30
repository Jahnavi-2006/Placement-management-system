const Details = () => {
  return (
    <div className="w-full pb-20">
      {/* Banner */}
      <div className="relative h-48 bg-black">
        <img src="https://images.unsplash.com/photo-1454165833767-027ffea9e778?auto=format&fit=crop&q=80&w=1470" className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 flex items-center justify-center text-white text-xl">
          Home / <span className="text-orange-500 ml-2">Analysis Details</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-12 px-4 text-center">
        <div className="inline-block border-2 border-gray-200 px-8 py-2 mb-10">
          <h2 className="text-3xl font-bold tracking-tighter text-gray-800 uppercase">Analysis Overview</h2>
        </div>

        <div className="space-y-6 text-gray-600 leading-relaxed max-w-2xl mx-auto">
          <p className="font-semibold">Welcome to the Placement Analysis Portal!</p>
          <p>
            This system provides deep insights into student performance, recruitment trends, and company requirements. 
            By centralizing data, we aim to bridge the gap between academic preparation and industry demands.
          </p>
          
          <div className="pt-4">
            <p className="font-bold text-gray-800 mb-4">Key Features:</p>
            <ul className="space-y-2">
              <li>Track individual student progress and interview status</li>
              <li>Analyze company-wise hiring patterns and packages</li>
              <li>Generate real-time reports for training and placement offices</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Details;