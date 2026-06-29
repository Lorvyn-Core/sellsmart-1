import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BrandMascotProps {
  message: string;
  subMessage?: string;
  delay?: number;
}

export const BrandMascot: React.FC<BrandMascotProps> = ({ message, subMessage, delay = 0.5 }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.6 }}
      className="flex items-start gap-4 mb-8"
    >
      <div className="relative shrink-0">
        <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-premium border-2 border-white ring-4 ring-emerald/5">
          <img 
            src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/90d544cf-dc81-48c5-bdc7-0f4cb3fb00a8/sade---brand-mascot-8e4670b1-1782482460764.webp" 
            alt="Sade - Your Business Coach"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald border-2 border-white rounded-full" />
      </div>
      <div className="flex flex-col gap-1 pt-1">
        <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none shadow-sm border border-emerald/5 relative">
          <div className="absolute top-0 left-0 w-3 h-3 bg-white border-l border-t border-emerald/5 -translate-x-1.5 -translate-y-0.5 rotate-45 hidden sm:block" />
          <p className="text-sm font-bold text-charcoal leading-relaxed">
            {message}
          </p>
          {subMessage && (
            <p className="text-xs text-slate-gray mt-1 leading-relaxed">
              {subMessage}
            </p>
          )}
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-emerald ml-1">Sade from SellSmart</span>
      </div>
    </motion.div>
  );
};
