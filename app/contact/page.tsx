"use client";

import { useState } from "react";
import {
  Clock,
  Mail,
  MapPin,
  Phone,
  Send,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: formData.get("name"),
      title: formData.get("title"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      message: formData.get("message"),
    };

    try {
      setLoading(true);
      setStatus("idle");

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setStatus("success");
      form.reset();
    } catch (error) {
      console.error(error);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main dir="rtl" className="min-h-screen mt-26 bg-black text-white">
      {/* Header */}
      <section className="bg-[#067746] px-5 py-9 text-center">
        <h1 className="text-2xl font-black md:text-3xl">تواصل معنا</h1>

        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-white/85 md:text-base">
          نحن هنا دائماً لمساعدتك تواصل معنا من خلال أي من وسائل التواصل المتاحة
        </p>
      </section>

      {/* Map */}
      <section className="w-full border-y border-[#067746]/60">
      <iframe
        title="Location map"
        src="https://maps.google.com/maps?q=8165%20Salah%20Ad%20Din%20Al%20Ayyubi%20Rd%2C%20Ad%20Dhubbat%2C%20Riyadh%2012623%2C%20Saudi%20Arabia&t=&z=16&ie=UTF8&iwloc=&output=embed"
        className="h-[180px] w-full border-0 md:h-[260px]"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      </section>

        <section className="mx-auto max-w-3xl px-5 pt-20 md:px-8">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5">
          <ContactCard
            icon={<MapPin className="h-7 w-7" />}
            title="العنوان"
            value="الرياض ـ الملز "
          />

          <ContactCard
            icon={<Phone className="h-7 w-7" />}
            title="اتصل بنا"
            value="00966114501734"
          />

          <ContactCard
            icon={<Mail className="h-7 w-7" />}
            title="البريد الإلكتروني"
            value="info@sttfs.sa"
          />

          <ContactCard
            icon={<Clock className="h-7 w-7" />}
            title="مواعيد العمل"
            value=" 8 AM  – 5 PM "
          />
        </div>
      </section>

      {/* Form */}
      <section className="mx-auto max-w-2xl px-5 py-16 md:px-8">
        <form onSubmit={handleSubmit} className="mx-auto max-w-[860px] space-y-6">
          <Field label="الاسم الأول" name="name" />

          <Field label="عنوان الرسالة" name="title" />

          <Field label="البريد" name="email" type="email" />

          <Field label="رقم الهاتف" name="phone" type="tel" required={false} />

          <div>
            <label
              htmlFor="message"
              className="mb-2 block text-right text-sm font-medium text-white"
            >
              اترك رسالة
            </label>

            <textarea
              id="message"
              name="message"
              required
              rows={4}
              placeholder=""
              className="w-full resize-none rounded-md border border-white/20 bg-white px-4 py-2 text-right text-sm text-black outline-none placeholder:text-gray-500 focus:border-[#1faf5f] focus:ring-2 focus:ring-[#1faf5f]/30"
            />
          </div>

          {status === "success" && (
            <div className="flex items-center justify-center gap-2 rounded-md bg-green-500/15 px-4 py-3 text-sm font-semibold text-green-400">
              <CheckCircle2 className="h-5 w-5" />
              تم إرسال رسالتك بنجاح.
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center justify-center gap-2 rounded-md bg-red-500/15 px-4 py-3 text-sm font-semibold text-red-400">
              <AlertCircle className="h-5 w-5" />
              حدث خطأ أثناء الإرسال. حاول مرة أخرى.
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-[#22a657] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#2fbd68] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "جاري الإرسال..." : "إرسال"}
            <Send className="h-4 w-4" />
          </button>
        </form>
      </section>
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = true,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-right text-sm font-medium text-white"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder=""
        className="w-full rounded-md border border-white/20 bg-white px-4 py-2 text-right text-sm text-black outline-none placeholder:text-gray-500 focus:border-[#1faf5f] focus:ring-2 focus:ring-[#1faf5f]/30"
      />
    </div>
  );
}

function ContactCard({
  icon,
  title,
  value,
  valueDir = "rtl",
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  valueDir?: "rtl" | "ltr";
}) {
  return (
    <div
      className="
        flex h-[118px] w-[118px] flex-col items-center justify-center
        rounded-[32px] border border-[#1faf5f]
        bg-[#2b2b2b] px-3 py-4 text-center
        shadow-[0_8px_24px_rgba(0,0,0,0.35)]
        transition duration-300
        hover:-translate-y-1 hover:border-[#00e676]
        hover:shadow-[0_12px_30px_rgba(0,230,118,0.14)]
        sm:h-[126px] sm:w-[126px]
      "
    >
      <div className="mb-2 flex h-7 w-7 items-center justify-center text-[#00e676]">
        {icon}
      </div>

      <h3 className="text-[12px] font-bold leading-5 text-white sm:text-[13px]">
        {title}
      </h3>

      <p
        dir={valueDir}
        className="mt-1 max-w-full text-[9px] font-medium leading-4 text-white/80 sm:text-[10px]"
      >
        {value}
      </p>
    </div>
  );
}