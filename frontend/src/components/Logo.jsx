export default function Logo({ size = "md", onDark = true }) {
  const imageSize = size === "lg" ? "h-20 w-auto" : size === "nav" ? "h-14 w-auto" : "h-11 w-auto";
  const fallbackText = size === "lg" ? "text-[28px]" : "text-lg";
  return (
    <div className="flex items-center gap-2.5" aria-label="Flipkart Bites">
      <img src={`${import.meta.env.BASE_URL}flipkart-bites-logo-transparent.png`} alt="Flipkart Bites" className={imageSize} />
      <div className={`sr-only ${fallbackText} font-extrabold ${onDark ? "text-white" : "text-bottle-dark"}`}>
        Flipkart Bites
      </div>
    </div>
  );
}
