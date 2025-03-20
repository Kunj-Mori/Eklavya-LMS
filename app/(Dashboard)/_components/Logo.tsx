import Image from "next/image";
import Link from "next/link";

const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-x-2">
      <Image 
        src="/logo.png" 
        alt="Eklavya Logo" 
        width={40} 
        height={40} 
        className="h-10 w-auto"
      />
      <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Eklavya
      </span>
    </Link>
  );
};

export default Logo;
