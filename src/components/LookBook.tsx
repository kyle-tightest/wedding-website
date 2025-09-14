const lookBookImages = [
  {
    src: "/img/lookbook1.png",
    alt: "Look Book Example 1",
    caption: "Keep it chic, keep it black",
  },
  {
    src: "/img/lookbook2.png",
    alt: "Look Book Example 2",
    caption: "Light suits, floral dresses, and comfortable shoes for the winelands.",
  },
  {
    src: "/img/lookbook3.png",
    alt: "Look Book Example 3",
    caption: "No jeans, shorts, or sneakers please.",
  },
  {
    src: "/img/lookbook4.png",
    alt: "Look Book Example 4",
    caption: "No jeans, shorts, or sneakers please.",
  },
  {
    src: "/img/lookbookmen1.png",
    alt: "Look Book Example 5",
    caption: "No jeans, shorts, or sneakers please.",
  },
  {
    src: "/img/lookbookmen2.png",
    alt: "Look Book Example 6",
    caption: "No jeans, shorts, or sneakers please.",
  },
  // Add more images as needed
];

// SVG sparkle star
function SparkleStar({ className = "" }) {
  return (
    <svg
      className={className}
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      style={{ filter: "drop-shadow(0 0 6px #fbbf24)" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        <polygon
          points="14,2 16,10 26,14 16,18 14,26 12,18 2,14 12,10"
          fill="#fbbf24"
          opacity="0.85"
        />
      </g>
    </svg>
  );
}

export default function LookBook() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-300 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-soul text-center mb-8 text-shimmer">Wedding Look Book</h1>
        <p className="text-center text-lg text-gray-700 mb-10 font-soul">
          We'd love everyone to join us in an all-black theme for the wedding. Feel free to play with different fabrics, textures and fits to make it your own.
        </p>
        <p className="text-center text-lg text-gray-700 mb-10 font-soul">
        A crisp white shirt is permitted. Think black in any style, from sleek to playful. Check out some inspiration below!          
        </p>
        <div className="grid gap-8 md:grid-cols-2">
          {lookBookImages.map((img, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col items-center group transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
            >
              <div className="relative w-full h-80 flex items-center justify-center overflow-hidden">
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-80 object-contain transition-transform duration-700 group-hover:scale-105 group-hover:rotate-1 group-hover:shadow-xl"
                  style={{ transition: "transform 0.7s cubic-bezier(.4,0,.2,1)" }}
                />
                {/* Animated SVG sparkle stars */}
                <div className="absolute inset-0 pointer-events-none">
                  <SparkleStar className="absolute top-4 left-6 opacity-0 group-hover:opacity-80 transition-opacity duration-500 animate-sparkle-star" />
                  <SparkleStar className="absolute bottom-6 right-8 w-5 h-5 opacity-0 group-hover:opacity-70 transition-opacity duration-700 animate-sparkle-star2" />
                </div>
              </div>
              <div className="p-4 text-center bg-gray-100">
                {/* <p className="text-gray-700 animate-fade-in">{img.caption}</p> */}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-red-500 text-white rounded-lg font-soul text-lg shadow hover:bg-red-600 transition-colors"
          >
            Back to Main Page
          </a>
        </div>
      </div>
      {/* Animations */}
      <style>
        {`
        @keyframes sparkle-star {
          0%, 100% { transform: scale(1) rotate(0deg);}
          50% { transform: scale(1.25) rotate(15deg);}
        }
        .animate-sparkle-star {
          animation: sparkle-star 2.2s infinite;
        }
        .animate-sparkle-star2 {
          animation: sparkle-star 2.8s infinite 0.7s;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(16px);}
          to { opacity: 1; transform: translateY(0);}
        }
        .animate-fade-in {
          animation: fade-in 1s cubic-bezier(.4,0,.2,1) both;
        }
        `}
      </style>
    </div>
  );
}