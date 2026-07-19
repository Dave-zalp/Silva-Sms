import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search, User, Coins } from "lucide-react";

interface NavigationProps {
  credits?: number;
  showSearch?: boolean;
}

export default function Navigation({ credits = 10.50, showSearch = true }: NavigationProps) {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#0EA968] rounded-lg flex items-center justify-center">
              <span className="text-white">SMS</span>
            </div>
            <span className="text-black">SMS Verify</span>
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="hidden md:flex flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B7A72] w-5 h-5" />
                <Input 
                  placeholder="Search countries or services..." 
                  className="pl-10 border-gray-300 focus:border-[#0EA968] focus:ring-[#0EA968]"
                />
              </div>
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#DFF5E9] px-4 py-2 rounded-lg">
              <Coins className="w-5 h-5 text-[#0EA968]" />
              <span className="text-[#0EA968]">₦{credits.toFixed(2)}</span>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="w-5 h-5 text-[#6B7A72]" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
