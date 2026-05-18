import { motion } from 'motion/react';
import { Instagram } from 'lucide-react';

export default function InstagramButton() {
  const instagramUrl = "https://instagram.com/vapor_.street";

  return (
    <motion.a
      href={instagramUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      className="fixed bottom-24 right-6 md:bottom-28 md:right-8 z-[100] bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white p-3 md:p-4 rounded-full shadow-2xl shadow-pink-500/40 flex items-center justify-center"
    >
      <Instagram size={24} className="md:w-8 md:h-8" />
    </motion.a>
  );
}
