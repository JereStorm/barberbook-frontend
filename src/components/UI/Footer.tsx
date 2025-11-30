import { Mail } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0F1F3A] text-gray-300 py-6 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between border-t border-gray-600/30 pt-4">
        {/* Logo + Texto */}
        <div className="flex items-center space-x-3">
          <img src="/peluqueria-blanco.png" alt="logo" className="h-10 w-auto opacity-90" />
          <span className="text-sm">
            © 2025 Dev studio solutions | All Rights Reserved
          </span>
        </div>

        {/* Íconos */}
        <div className="flex items-center space-x-5 text-gray-200">
          <Mail className="h-5 w-5 cursor-pointer hover:text-white transition" />
          <img src="/fbIcon.png" className="h-5 w-5 cursor-pointer hover:text-white transition" />
          <img src="/igIcon.png" className="h-5 w-5 cursor-pointer hover:text-white transition" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
