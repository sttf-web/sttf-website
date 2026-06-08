import Image from "next/image";
import Link from "next/link";

const socialLinks = [
  {
    href: "#",
    label: "Instagram",
    icon: "/images/social1.png",
  },
  {
    href: "#",
    label: "LinkedIn",
    icon: "/images/social2.png",
  },
  {
    href: "#",
    label: "X",
    icon: "/images/social3.png",
  }
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-black text-white">

      <svg
        aria-hidden="true"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="absolute left-0 top-0 h-20 w-full"
      >
        <path
          d="M0,38 C360,-8 1080,-8 1440,38 L1440,120 L0,120 Z"
          fill="#000000"
        />
      </svg>

      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 pb-10 pt-28 md:grid-cols-3 md:items-center lg:px-10">
        {/* Logo */}
        <div className="flex justify-center md:justify-start">
          <Link href="/" aria-label="Saudi Table Tennis Federation Home">
            <Image
              src="/images/footer-logo-white.png"
              alt="Saudi Table Tennis Federation"
              width={360}
              height={110}
              className="h-auto w-[280px] md:w-[340px]"
              priority
            />
          </Link>
        </div>

        {/* Contact */}
        <div className="text-center" dir="rtl">
          <h3 className="mb-8 text-2xl font-bold">اتصل بنا</h3>

          <div className="space-y-2 text-sm text-white/85">
            <p dir="ltr">(+966)114501734</p>
            <p>الرياض - المملكة</p>
            <p>العربية السعودية</p>
            <p dir="ltr">info@sttf.sa</p>
          </div>

          <div className="mt-5 flex items-center justify-center gap-3">
            {socialLinks.map((social) => (
              <SocialLink
                key={social.label}
                href={social.href}
                label={social.label}
                icon={social.icon}
              />
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="text-center md:text-right" dir="rtl">
          <h3 className="mb-8 text-2xl font-bold">روابط سريعة</h3>

          <nav className="flex flex-col gap-5 text-2xl font-medium">
            <Link href="/contact" className="transition hover:text-[#00c878]">
              اتصل بنا
            </Link>

            <Link href="/sponsors" className="transition hover:text-[#00c878]">
              الرعاة
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-md transition hover:scale-110"
    >
      <Image
        src={icon}
        alt={label}
        width={28}
        height={28}
        className="h-12 w-12 object-contain"
      />
    </Link>
  );
}