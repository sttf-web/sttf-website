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

      if (!res.ok) {
        throw new Error("Failed to send message");
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
    <main dir="rtl" className="relative min-h-screen overflow-hidden bg-[#05120C] text-white">
      {/* Dot grid background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Circular flares */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-56 h-80 w-80 rounded-full bg-[#18B56F]/20 blur-[90px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-[38rem] h-96 w-96 rounded-full bg-[#057A4B]/25 blur-[110px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-10 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-white/5 blur-[100px]"
      />

      <section className="relative overflow-hidden bg-[#057A4B] px-6 py-16 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(0,0,0,0.25),transparent_35%)]" />

        <div className="relative mx-auto max-w-4xl">
          <p className="mt-10 mb-3 text-sm font-semibold tracking-[0.25em] text-white/70">
            نحن هنا لمساعدتك
          </p>

          <h1 className="text-4xl font-black md:text-6xl">تواصل معنا</h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/85 md:text-lg">
            يسعدنا تواصلك معنا في أي وقت. اترك رسالتك وسنقوم بالرد عليك في
            أقرب وقت ممكن.
          </p>
        </div>
      </section>

      <section className="relative mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-16">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-[2rem] border border-[#18B56F]/30 bg-white/5 shadow-2xl shadow-black/30">
            <iframe
              title="Location map"
              src="https://maps.google.com/maps?q=%D9%83%D8%B1%D8%A9%20%D8%A7%D9%84%D8%B7%D8%A7%D8%A6%D8%B1%D8%A9%20%D8%A7%D9%84%D8%B1%D9%8A%D8%A7%D8%B6&t=&z=15&ie=UTF8&iwloc=&output=embed"
              className="h-[360px] w-full border-0 grayscale-[20%]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ContactCard
              icon={<Clock className="h-6 w-6" />}
              title="مواعيد العمل"
              value="17:00 - 8:00"
            />

            <ContactCard
              icon={<Mail className="h-6 w-6" />}
              title="البريد الإلكتروني"
              value="info@sttfs.sa"
            />

            <ContactCard
              icon={<Phone className="h-6 w-6" />}
              title="اتصل بنا"
              value="00966114501734"
            />

            <ContactCard
              icon={<MapPin className="h-6 w-6" />}
              title="العنوان"
              value="الرياض، سالم"
            />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white p-6 text-[#111827] shadow-2xl shadow-black/40 md:p-8 lg:p-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[#18B56F]/10 blur-[70px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#057A4B]/10 blur-[80px]"
          />

          <div className="relative">
            <div className="mb-8">
              <p className="mb-2 text-sm font-bold text-[#057A4B]">
                أرسل لنا رسالة
              </p>

              <h2 className="text-3xl font-black text-[#111827]">
                كيف يمكننا مساعدتك؟
              </h2>

              <p className="mt-3 leading-7 text-gray-600">
                قم بتعبئة النموذج التالي وسيتم التواصل معك من خلال فريقنا.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="الاسم الأول" name="name" placeholder="اكتب اسمك" />

                <Field
                  label="رقم الهاتف"
                  name="phone"
                  type="tel"
                  placeholder="05xxxxxxxx"
                />
              </div>

              <Field
                label="البريد الإلكتروني"
                name="email"
                type="email"
                placeholder="example@email.com"
              />

              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-bold text-[#111827]"
                >
                  اترك رسالة
                </label>

                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  placeholder="اكتب رسالتك هنا..."
                  className="w-full resize-none rounded-2xl border border-gray-300 bg-white px-4 py-4 text-right text-sm text-[#111827] shadow-sm outline-none transition placeholder:text-gray-400 focus:border-[#057A4B] focus:ring-4 focus:ring-[#057A4B]/15"
                />
              </div>

              {status === "success" && (
                <div className="flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                  <CheckCircle2 className="h-5 w-5" />
                  تم إرسال رسالتك بنجاح.
                </div>
              )}

              {status === "error" && (
                <div className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  حدث خطأ أثناء الإرسال. حاول مرة أخرى.
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-[#057A4B] px-6 py-4 text-sm font-black text-white shadow-lg shadow-[#057A4B]/25 transition hover:bg-[#06985d] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "جاري الإرسال..." : "إرسال"}
                <Send className="h-4 w-4 transition group-hover:-translate-x-1" />
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

function ContactCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="group rounded-[1.75rem] border border-[#18B56F]/40 bg-[#202020]/90 p-5 text-center shadow-lg shadow-black/25 backdrop-blur transition hover:-translate-y-1 hover:border-[#18B56F] hover:bg-[#262626]">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#18B56F]/15 text-[#20E58C] transition group-hover:bg-[#18B56F] group-hover:text-white">
        {icon}
      </div>

      <h3 className="text-base font-black text-white">{title}</h3>

      <p className="mt-2 break-words text-sm text-white/70">{value}</p>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-bold text-[#111827]"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        required
        placeholder={placeholder}
        className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-4 text-right text-sm text-[#111827] shadow-sm outline-none transition placeholder:text-gray-400 focus:border-[#057A4B] focus:ring-4 focus:ring-[#057A4B]/15"
      />
    </div>
  );
}