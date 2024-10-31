"use client";
function Container({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="max-w-[1920px] w-full mx-auto xl:px-20 p-4">{children}</div>
  );
}

export default Container;
