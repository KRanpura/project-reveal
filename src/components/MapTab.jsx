import React from 'react';

const MapTab = ({ stateData, selectedState, setSelectedState }) => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">State Data Overview</h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {Object.entries(stateData).map(([stateCode, data]) => (
          <div 
            key={stateCode}
            className={`bg-white border-2 rounded-lg p-6 cursor-pointer transition-all ${
              selectedState === stateCode ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedState(selectedState === stateCode ? null : stateCode)}
          >
            <h3 className="text-lg font-semibold mb-4">{data.name}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Homeless Population:</span>
                <span className="font-medium">{data.homelessPopulation.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Women's Rights Bills:</span>
                <span className="font-medium">{data.womenRightsBills}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Archived Articles:</span>
                <span className="font-medium">{data.articles}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedState && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">{stateData[selectedState].name} Details</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Environmental Risks</h4>
              <p className="text-gray-700">{stateData[selectedState].environmentalRisks}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Key Metrics</h4>
              <ul className="text-gray-700 space-y-1">
                <li>• {stateData[selectedState].homelessPopulation.toLocaleString()} homeless individuals</li>
                <li>• {stateData[selectedState].womenRightsBills} active women's rights bills</li>
                <li>• {stateData[selectedState].articles} archived articles</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapTab;