export default function ResultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Background video */}
      <video
        className="fixed inset-0 w-full h-full object-cover -z-10"
        src="/background_video.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      {/* UI KIT gradient overlay at ~20% */}
      <div className="bg-grad-overlay fixed inset-0 -z-10" />
      {children}
    </>
  );
}
