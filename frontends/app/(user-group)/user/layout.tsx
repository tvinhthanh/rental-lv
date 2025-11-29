"use client"

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="min-h-screen flex justify-center">
        <div className="w-full ">
          {children}
        </div>
      </main>
    </>
  );
}
