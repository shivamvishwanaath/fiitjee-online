import React from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Award, 
  ExternalLink,
  ChevronRight,
  Heart
} from 'lucide-react';
import { FiitjeeLogo } from './FiitjeeLogo';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onOpenFtreModal: () => void;
  onOpenEnquiryModal: () => void;
  onOpenBigBangModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenFtreModal,
  onOpenEnquiryModal,
  onOpenBigBangModal
}) => {
  return (
    <footer className="bg-[#001733] text-slate-400 border-t border-[#002147] text-xs">
      
      {/* Top Banner with Toll-Free Hotline */}
      <div className="bg-[#ED1C24] text-white py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FiitjeeLogo variant="white" size="md" showDomain={false} showTagline={false} />
            <div>
              <div className="text-xs font-bold text-white/90 uppercase tracking-wider">National Academic Helpline (All India)</div>
              <div className="text-xl sm:text-2xl font-black font-display tracking-tight text-white flex items-center gap-2">
                <Phone className="w-5 h-5 text-white" />
                <span>1800 11 4242 / 011-49283471</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenFtreModal}
              className="px-5 py-2.5 bg-white hover:bg-slate-100 text-[#ED1C24] font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              Apply for FTRE 2026-27
            </button>
            <button
              onClick={onOpenEnquiryModal}
              className="px-4 py-2.5 bg-black/20 hover:bg-black/30 text-white font-bold rounded-xl text-xs border border-white/30 transition-all cursor-pointer uppercase tracking-wider"
            >
              Request Callback
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Links Directory */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Col 1: Corporate HQ & Legal Entity */}
          <div className="lg:col-span-2 space-y-4">
            <FiitjeeLogo variant="white" size="md" showDomain={true} showTagline={true} />
            
            <p className="text-slate-300 text-xs leading-relaxed max-w-sm">
              This online admission portal and examination testing platform is operated by <strong>TRANSED LLP</strong> for FIITJEE programs, delivering serious competitive education and producing top rankers in IIT-JEE and Olympiads.
            </p>

            <div className="space-y-2 pt-1 text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#ED1C24] shrink-0 mt-0.5" />
                <span><strong>Operating Office:</strong> FIITJEE House, 29-A, Kalu Sarai, Sarvapriya Vihar, New Delhi - 110016</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#ED1C24] shrink-0" />
                <span>support@fiitjee.online / transedllp@gmail.com</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-[11px] pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Legal Business Entity: <strong className="text-white">TRANSED LLP</strong></span>
              </div>
            </div>
          </div>

          {/* Col 2: Flagship Programs */}
          <div className="space-y-3">
            <h4 className="text-white font-extrabold uppercase text-xs tracking-wider">
              Academic Programs
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('programs-section')} className="hover:text-white transition-colors text-left">
                  PINNACLE (Class XI-XII Integrated)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('programs-section')} className="hover:text-white transition-colors text-left">
                  SUPREME (Class IX-XII Integrated)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('programs-section')} className="hover:text-white transition-colors text-left">
                  Two Year Classroom (Class XI)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('programs-section')} className="hover:text-white transition-colors text-left">
                  ASCENT (Class IX & X)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('programs-section')} className="hover:text-white transition-colors text-left">
                  UDAYA (Class VII & VIII)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('programs-section')} className="hover:text-white transition-colors text-left">
                  LITTLE GENIE (Class VI)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('programs-section')} className="hover:text-white transition-colors text-left">
                  Special 1-Year Dropper Program
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Admission & Tests */}
          <div className="space-y-3">
            <h4 className="text-white font-extrabold uppercase text-xs tracking-wider">
              Admission & Tests
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={onOpenBigBangModal} className="text-red-400 font-bold hover:underline text-left flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping shrink-0" />
                  Big Bang Edge Test 2026 (Register Free)
                </button>
              </li>
              <li>
                <button onClick={onOpenFtreModal} className="text-amber-400 font-bold hover:underline text-left">
                  FTRE 2026-27 (Register Now)
                </button>
              </li>
              <li>
                <button onClick={onOpenFtreModal} className="hover:text-white transition-colors text-left">
                  Admission Test Registration
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('results-section')} className="hover:text-white transition-colors text-left">
                  Verify Topper Results
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('why-fiitjee')} className="hover:text-white transition-colors text-left">
                  Why Only FIITJEE Legacy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('centers-section')} className="hover:text-white transition-colors text-left">
                  Locate Nearby Centres
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Top Centers */}
          <div className="space-y-3">
            <h4 className="text-white font-extrabold uppercase text-xs tracking-wider">
              Nationwide Centers
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('centers-section')} className="hover:text-white transition-colors text-left">
                  Delhi South (Kalu Sarai HQ)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('centers-section')} className="hover:text-white transition-colors text-left">
                  Delhi (Punjabi Bagh & Dwarka)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('centers-section')} className="hover:text-white transition-colors text-left">
                  Mumbai (Andheri & Thane)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('centers-section')} className="hover:text-white transition-colors text-left">
                  Hyderabad (Kukatpally & Saifabad)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('centers-section')} className="hover:text-white transition-colors text-left">
                  Bengaluru (HSR Layout)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('centers-section')} className="hover:text-white transition-colors text-left">
                  Kolkata (South & North)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('centers-section')} className="hover:text-white transition-colors text-left">
                  Dubai GCC Global Hub
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Legal & Accreditations */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div className="text-center md:text-left space-y-1">
            <div>
              © 2026 <strong className="text-slate-200">TRANSED LLP</strong>. All Rights Reserved. Operated for FIITJEE admission and examination portals.
            </div>
            <div className="text-slate-500 text-[10px]">
              Merchant / Registered Legal Entity: <span className="text-slate-400 font-semibold">TRANSED LLP</span> • Secured 256-Bit SSL Checkout
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center text-slate-400">
            <button onClick={() => onNavigate('/terms-and-conditions')} className="hover:text-white transition-colors cursor-pointer underline-offset-2 hover:underline">Terms & Conditions</button>
            <span>•</span>
            <button onClick={() => onNavigate('/privacy-policy')} className="hover:text-white transition-colors cursor-pointer underline-offset-2 hover:underline">Privacy Policy</button>
            <span>•</span>
            <button onClick={() => onNavigate('/refund-policy')} className="hover:text-white transition-colors cursor-pointer underline-offset-2 hover:underline text-amber-300 font-semibold">Refund Policy</button>
            <span>•</span>
            <button onClick={() => onNavigate('/shipping-and-delivery-policy')} className="hover:text-white transition-colors cursor-pointer underline-offset-2 hover:underline">Shipping & Delivery</button>
            <span>•</span>
            <button onClick={() => onNavigate('/contact-us')} className="hover:text-white transition-colors cursor-pointer underline-offset-2 hover:underline">Contact Us</button>
            <span>•</span>
            <a href="/admin/login" className="text-amber-400 hover:text-amber-300 font-bold transition-colors">Staff Portal</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
