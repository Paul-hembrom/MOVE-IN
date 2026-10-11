import React from 'react';
import { Home, Mail, Phone, MapPin, Heart } from 'lucide-react';
import { Link } from '../context/RouterContext';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-900 pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <Home className="w-5 h-5" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-white">
                Move-<span className="text-emerald-400">In</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              Nepal's modern real estate platform connecting room and flat hunters directly
              with trusted property owners. Zero hidden fees, verified photos, and transparent pricing.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Made with</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>for Nepal</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-bold tracking-wider uppercase">Explore</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/propertyview?city=Kathmandu" className="hover:text-emerald-400 transition-colors">
                  Rooms in Kathmandu
                </Link>
              </li>
              <li>
                <Link href="/propertyview?city=Lalitpur" className="hover:text-emerald-400 transition-colors">
                  Flats in Lalitpur
                </Link>
              </li>
              <li>
                <Link href="/propertyview?city=Bhaktapur" className="hover:text-emerald-400 transition-colors">
                  Houses in Bhaktapur
                </Link>
              </li>
              <li>
                <Link href="/propertyview?city=Pokhara" className="hover:text-emerald-400 transition-colors">
                  Properties in Pokhara
                </Link>
              </li>
            </ul>
          </div>

          {/* For Owners & Hunters */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-bold tracking-wider uppercase">Portals</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">
                  Owner Dashboard
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-emerald-400 transition-colors">
                  Admin Approval Panel
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-emerald-400 transition-colors">
                  Post a Property
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-emerald-400 transition-colors">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-bold tracking-wider uppercase">Contact Us</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>New Baneshwor, Kathmandu, Nepal</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="tel:+97714421100" className="hover:text-emerald-400 transition-colors">
                  +977-1-4421100 / 9841234567
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="mailto:support@movein.com.np" className="hover:text-emerald-400 transition-colors">
                  support@movein.com.np
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Move-In Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Safety Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
