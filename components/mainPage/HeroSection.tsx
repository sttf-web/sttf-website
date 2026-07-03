import Image from "next/image";

export default function HeroMain() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#050507]">
      {/* Background image */}
      <Image
        src="/hero-bg.png"
        alt="Saudi Table Tennis Federation background"
        fill
        priority
        className="object-cover opacity-35"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-[#050507]/45" />

      {/* Left tilted green section */}
      <div className=" absolute left-[-15%] top-[20%] z-10 h-[58%] w-[120%] -rotate-[-8deg] bg-gradient-to-r from-[#003d29] via-[#002b1e] to-[#000f0b] shadow-2xl" />

      {/* Main content */}
      <div
        className="
          relative z-30 flex min-h-screen w-full
          flex-col items-center justify-center
          px-5 py-20
          md:flex-row md:px-10 md:py-0
        "
      >
        {/* Left content */}
        <div
          className="
            relative mt-40 flex w-full flex-col items-center justify-center
            text-center text-white
            md:w-[46%] md:px-6
            lg:px-10
          "
        >
          <div className="flex flex-col items-center">
            <Image
              src="/hero-title.png"
              alt="Saudi Table Tennis Federation"
              width={360}
              height={160}
              priority
              className="
                mb-6 h-auto w-[230px] object-contain
                sm:w-[280px]
                md:mb-8 md:w-[300px]
                lg:mb-10 lg:w-[320px]
              "
            />

            <h1
              className="
                mb-7 text-3xl font-black leading-tight tracking-tight
                sm:text-4xl
                md:mb-8 md:text-4xl
                lg:mb-10 lg:text-5xl
              "
            >
              ..نحن نصنع الأبطال
            </h1>

            <button
              className="
                rounded-lg border border-white/30
                bg-white/5 px-7 py-2
                text-lg font-bold text-white
                backdrop-blur-sm
                transition duration-300
                hover:bg-white hover:text-[#003d29]
                md:px-8 md:text-xl
              "
            >
              أنضم للأبطال
            </button>

            {/* Down arrows directly underneath button */}
            <div className="mt-14 flex flex-col items-center md:mt-16 lg:mt-20">
              <span className="h-7 w-7 rotate-45 border-b-[5px] border-r-[5px] border-white md:h-8 md:w-8 md:border-b-[6px] md:border-r-[6px]" />
              <span className="-mt-3 h-7 w-7 rotate-45 border-b-[5px] border-r-[5px] border-white md:h-8 md:w-8 md:border-b-[6px] md:border-r-[6px]" />
            </div>
          </div>
        </div>

        {/* Right image */}
        <div
          className="
            relative mt-10 flex w-full items-center justify-center
            md:mt-0 md:w-[54%]
          "
        >
          <div
            className="
              relative z-40
              h-[230px] w-[230px]
              sm:h-[360px] sm:w-[360px]
              md:h-[500px] md:w-[500px]
              lg:h-[600px] lg:w-[600px]
              xl:h-[660px] xl:w-[660px]
            "
          >
            <Image
              src="/homePage/table-tennis-collage.png"
              alt="Table tennis champions collage"
              fill
              priority
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}