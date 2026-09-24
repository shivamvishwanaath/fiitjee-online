import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Search, 
  Building2, 
  Navigation,
  ExternalLink,
  Mail
} from 'lucide-react';
import { CENTERS } from '../data/fiitjeeData';
import { CenterLocation } from '../types';

interface CenterLocatorProps {
  onOpenEnquiryModal: (centerName?: string) => void;
}

export const CenterLocator: React.FC<CenterLocatorProps> = ({
  onOpenEnquiryModal
}) => {
  const [selectedState, setSelectedState] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCenter, setSelectedCenter] = useState<CenterLocation | null>(CENTERS[0]);

  const stateFilters = [
    'All',
    'Delhi NCR',
    'Maharashtra',
    'Telangana',
    'Karnataka',
    'West Bengal',
    'Tamil Nadu',
    'Rajasthan',
    'UAE & Gulf (International)'
  ];

  const filteredCenters = CENTERS.filter((c) => {
    const matchesState = selectedState === 'All' || c.state.includes(selectedState);
    const matchesSearch = 
      searchQuery === '' ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.pincode.includes(searchQuery);
    return matchesState && matchesSearch;
  });

  return (
    <section id="centers-section" className="py-14 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-100 border border-red-200 text-xs font-black text-[#ED1C24] uppercase tracking-wider mb-2">
            <Building2 className="w-4 h-4 text-[#ED1C24]" />
            <span>Nationwide Classroom Network</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#002147] font-display uppercase tracking-tight">
            Find a FIITJEE Center Near You
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2 font-medium">
            Over 70+ state-of-the-art academic centers across India and GCC with high-tech classrooms, libraries, computer CBT labs, and dedicated faculty rooms.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* State filter buttons */}
            <div className="flex flex-wrap gap-1.5">
              {stateFilters.map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedState(st)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    selectedState === st
                      ? 'bg-[#ED1C24] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* City search input */}
            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search city, area or pincode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ED1C24]"
              />
            </div>

          </div>
        </div>

        {/* 12-Column Split View for Centers and Interactive Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Columns 1-8: Centers List */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCenters.map((center) => (
              <div
                key={center.id}
                onClick={() => setSelectedCenter(center)}
                className={`bg-white rounded-2xl border p-5 transition-all cursor-pointer flex flex-col justify-between ${
                  selectedCenter?.id === center.id
                    ? 'border-2 border-[#ED1C24] shadow-md ring-2 ring-red-100'
                    : 'border-slate-200 shadow-xs hover:shadow-lg hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] font-extrabold text-[#ED1C24] bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200 uppercase">
                      {center.city}
                    </span>
                    {center.isNationalHub && (
                      <span className="text-[10px] font-black text-amber-900 bg-amber-200 px-2 py-0.5 rounded-full">
                        Corporate HQ
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-extrabold text-[#002147] font-display">
                    {center.name}
                  </h3>

                  <div className="flex items-start gap-2 text-xs text-slate-600 mt-2.5">
                    <MapPin className="w-4 h-4 text-[#ED1C24] shrink-0 mt-0.5" />
                    <span>{center.address} (PIN: {center.pincode})</span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-700">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="font-semibold">{center.phone.join(' / ')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>{center.timing}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenEnquiryModal(center.name);
                    }}
                    className="w-full py-2 bg-[#ED1C24] hover:bg-[#d6171e] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Book Counseling Visit</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Columns 9-12: Interactive Map View */}
          <div className="lg:col-span-4 sticky top-[130px]">
            {selectedCenter ? (
              <div className="bg-[#002147] text-white rounded-3xl p-6 shadow-2xl border-4 border-[#FEC400] space-y-6">
                <div className="flex items-center gap-2 text-[#FEC400] pb-2 border-b border-white/20">
                  <MapPin className="w-6 h-6 animate-bounce" />
                  <h3 className="text-lg font-black uppercase tracking-tight">Active Center Map</h3>
                </div>

                {/* Styled Map Monogram */}
                <div className="relative w-full h-48 bg-slate-900/60 rounded-xl overflow-hidden flex items-center justify-center border border-white/10">
                  {/* Grid Lines background */}
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                  
                  {/* Styled Radar Ring */}
                  <div className="absolute w-24 h-24 rounded-full border-2 border-[#ED1C24]/60 animate-ping" />
                  <div className="absolute w-12 h-12 rounded-full border border-amber-400/40 animate-pulse" />

                  {/* Marker Pin */}
                  <div className="absolute flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-[#ED1C24] border-2 border-white flex items-center justify-center shadow-lg">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <span className="mt-1.5 text-[9px] bg-slate-950/80 px-2 py-0.5 rounded text-white font-bold tracking-wider">
                      {selectedCenter.city.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Center Name</h4>
                    <p className="text-sm font-extrabold text-white">{selectedCenter.name}</p>
                  </div>

                  <div>
                    <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Address</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{selectedCenter.address}</p>
                  </div>

                  <div>
                    <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Contact Info</h4>
                    <div className="text-xs text-slate-200 space-y-1 mt-1">
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-amber-400" />
                        <span>{selectedCenter.phone.join(' / ')}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-amber-400" />
                        <span>{selectedCenter.email}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href={`https://maps.google.com/?q=FIITJEE+${selectedCenter.name}+${selectedCenter.city}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-[#ED1C24] hover:bg-[#d6171e] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    <span>Get Directions on Google Maps</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-white border-2 border-slate-200 border-dashed rounded-3xl p-8 text-center text-slate-400">
                <MapPin className="w-12 h-12 mx-auto mb-3" />
                <p className="text-sm font-bold">Select a center card to view details & map coordinates</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
