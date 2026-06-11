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
  },
  {
    href: "#",
    label: "WhatsApp",
    icon: "/images/social4.png",
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-black text-white">
      {/* Green curved line */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute left-1/2 top-8
          h-[880px] w-[2500px] -translate-x-1/2
          rounded-t-[100%] border-t-[34px] border-[#00c878]
        "
      />

      <div
        className="
          relative z-10 mx-auto grid max-w-7xl grid-cols-1
          gap-12 px-6 pb-12 pt-44
          md:grid-cols-[1.2fr_1fr_0.8fr]
          md:items-start md:gap-16
          lg:px-10
        "
      >
        {/* Logos */}
        <div className="flex flex-col items-center gap-10 md:items-start">
          <div className="flex flex-wrap items-center justify-center gap-8 md:justify-start">
            <Image
              src="/homePage/logo3.png"
              alt="Partner logo"
              width={110}
              height={70}
              className="h-auto w-[90px] object-contain md:w-[110px]"
            />

            <Image
              src="/homePage/logo2.png"
              alt="Flynas"
              width={150}
              height={70}
              className="h-auto w-[130px] object-contain md:w-[150px]"
            />

            <Image
              src="/homePage/logo1.png"
              alt="Fanatic"
              width={90}
              height={70}
              className="h-auto w-[70px] object-contain md:w-[90px]"
            />
          </div>

          <Link
            href="/"
            aria-label="Saudi Table Tennis Federation Home"
            className="block"
          >
            <Image
              src="/images/footer-logo-white.png"
              alt="Saudi Table Tennis Federation"
              width={360}
              height={110}
              className="h-auto w-[300px] object-contain md:w-[360px]"
              priority
            />
          </Link>
        </div>

        {/* Contact */}
        <div className="text-center" dir="rtl">
          <h3 className="mb-8 text-2xl font-black">اتصل بنا</h3>

          <div className="space-y-2 text-base leading-6 text-white">
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
          <h3 className="mb-12 text-2xl font-black">روابط سريعة</h3>

          <nav className="flex flex-col gap-9 text-3xl font-light">
            <Link href="/contact" className="transition hover:text-[#00c878]">
              اتصل بنا
            </Link>

            <Link href="#" className="">
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
      className="flex h-8 w-8 items-center justify-center transition hover:scale-110"
    >
      <Image
        src={icon}
        alt={label}
        width={28}
        height={28}
        className="h-7 w-7 object-contain"
      />
    </Link>
  );
}