import { MapPin } from "lucide-react";

export default function BranchMap() {
  return (
    <section className="py-20 bg-gray-100 dark:bg-zinc-900">
      <h2 className="text-3xl font-bold text-center mb-10 flex items-center justify-center gap-2">
        <MapPin className="w-8 h-8" />
        Chi nhánh của chúng tôi
      </h2>

      <div className="max-w-4xl mx-auto rounded-xl overflow-hidden shadow-lg">
        <iframe
          width="100%"
          height="450"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!"
        ></iframe>
      </div>
    </section>
  );
}
