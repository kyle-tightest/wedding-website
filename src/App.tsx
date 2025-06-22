import React, { useEffect, useState } from 'react';
import { Heart, Calendar, Clock, MapPin, Send, Camera, Gift, Music, Cake, Glasses as Glass, ChevronLeft, ChevronRight } from 'lucide-react';
import HeartBackground from './components/HeartBackground';
import Countdown from './components/Countdown';
import LoveBirdsGame from './components/LoveBirdsGame';
import PasswordModal from './components/PasswordModal';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next"

function App() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [storyImageIndex, setStoryImageIndex] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const weddingDate = new Date('2026-02-07T00:00:00');
  
  // Update these paths to match your images in the public/img folder
  const heroImages = [
    "/img/hero-1.jpg",
    "/img/hero-2.jpg",
    "/img/hero-3.jpg",
    "/img/hero-4.jpg"
  ];

  // Define images for the "Our Story" carousel
  // TODO: Replace these with your actual image paths in public/img/
  const storyImages = [
    "/img/story-1.jpg", 
    "/img/story-2.jpg",
    "/img/story-3.jpg",
    "/img/story-4.jpg",
    "/img/story-5.jpg", // Added new image
    "/img/story-6.jpg", // Added new image
    "/img/story-7.jpg", // Added new image
    "/img/story-8.jpg", // Added new image
    "/img/story-9.jpg", // Added new image
    "/img/story-10.jpg", // Added new image
  ];

  useEffect(() => {
    const authenticated = localStorage.getItem('weddingAuthenticated');
    if (authenticated === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 10000); // Changed interval to 7 seconds

    return () => clearInterval(timer);
  }, [heroImages.length]);

  useEffect(() => {
    const storyImageTimer = setInterval(() => {
      setStoryImageIndex((prevIndex) =>
        prevIndex === storyImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 7000); // Interval for story images, e.g., 7 seconds
    return () => clearInterval(storyImageTimer);
  }, [storyImages.length]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    setTimeout(() => {
      document.querySelectorAll('.animate-on-scroll').forEach((element) => {
        observer.observe(element);
      });
    }, 100);

    return () => observer.disconnect();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <PasswordModal onCorrectPassword={() => setIsAuthenticated(true)} />;
  }

  const nextStoryImage = () => {
    setStoryImageIndex((prevIndex) =>
      prevIndex === storyImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevStoryImage = () => {
    setStoryImageIndex((prevIndex) =>
      prevIndex === 0 ? storyImages.length - 1 : prevIndex - 1
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-500 to-gray-1000 text-gray-800">
      <section className="h-[90vh] relative overflow-hidden">
        <HeartBackground />
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[10000ms] ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0' // Hero image opacity
            }`}
            style={{
              backgroundImage: `url("${image}")`,
            }} />
        ))}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center text-white z-10 px-4">
            <p className="text-xl md:text-2xl font-soul mb-4 animate-fade-in tracking-wider">Together with their families</p>
            <h1 className="text-6xl md:text-7xl lg:text-9xl font-soul mb-6 text-shadow text-shimmer">Robin & Kyle</h1>
            <p className="text-xl md:text-2xl font-soul animate-slide-up tracking-widest">Request the pleasure of your company</p>
            <p className="text-xl md:text-2xl font-soul animate-slide-up tracking-widest">at our wedding</p>
            <div className="mt-12 flex items-center justify-center space-x-2 animate-bounce-slow bg-glass py-4 px-8 rounded-full inline-block premium-border">
              <Calendar className="w-6 h-6 text-red-500" />
              <p className="text-lg md:text-xl tracking-wider">February 7, 2026</p>
            </div>
            <Countdown weddingDate={weddingDate} />
          </div>
        </div>
      </section>

      <section className="py-32 px-4 bg-gradient-radial from-gray-50 to-gray-100 relative">
        <div className="max-w-4xl mx-auto text-center animate-on-scroll opacity-0 translate-y-8 duration-[1500ms]">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-soul mb-8 text-shimmer pb-4">Our Story</h2>
          <div className="flex items-center justify-center mb-12">
            <Heart className="w-12 h-12 text-red-500 animate-pulse" />
          </div>
          {/* Story Paragraph with background for readability */}
          <div className="bg-white bg-opacity-75 p-6 md:p-8 rounded-lg shadow-xl premium-border mb-12">
            <p className="text-gray-700 leading-relaxed text-lg tracking-wide">
              Despite knowing of each other for years—through mutuals, social
media, and even brief encounters at a 21st birthday and his
grandmother’s funeral—it turns out we needed a little help from
Tinder to actually make things happen! In 2021, I decided to give the
app a try, and there he was. The moment we matched, he wasted no
time asking me out. With COVID curfews in place, we made the most
of our first date on 9 June, 2021—a night that was unforgettable.
From that point on, things just fell into place. It was easy.<br /><br />

              What made it even better was realizing just how much we had in
common—our love for anime, rock music, and dreaming about our
next travel adventure. At our core, we’re both deeply family-oriented
and have a soft spot for animals. It didn’t take long to see that this
was something special.
            </p>
          </div>

          {/* Story Image Carousel - Below the paragraph */}
          <div className="relative h-96 w-96 md:h-[28rem] md:w-[28rem] mx-auto overflow-hidden rounded-full shadow-xl hover:shadow-2xl transition-shadow duration-300 premium-border group">
            {storyImages.map((image, index) => (
              <div
                key={`story-img-${index}`}
                className={`absolute inset-0 bg-contain bg-no-repeat bg-center transition-all ease-in-out duration-1000 transform ${
                  index === storyImageIndex ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
                }`}
                style={{ backgroundImage: `url("${image}")` }}
              />
            ))}
            {/* Navigation Buttons for Story Carousel */}
            <button
              onClick={prevStoryImage}
              className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black bg-opacity-30 text-white p-3 rounded-full hover:bg-red-500 hover:bg-opacity-75 hover:scale-110 transition-all duration-300 z-10"
              aria-label="Previous image"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextStoryImage}
              className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black bg-opacity-30 text-white p-3 rounded-full hover:bg-red-500 hover:bg-opacity-75 hover:scale-110 transition-all duration-300 z-10"
              aria-label="Next image"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </section>

      <section className="py-32 px-4 bg-gradient-radial from-gray-50 to-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-soul mb-12 text-shimmer animate-on-scroll opacity-0 translate-y-8 duration-[1500ms] pb-4">The Venue</h2>
          <div className="flex items-center justify-center mb-8">
            <MapPin className="w-8 h-8 text-red-500 animate-bounce-slow" />
          </div>
          <h3 className="text-3xl font-serif mb-4 animate-on-scroll opacity-0 translate-y-8 duration-[1500ms]">Zorgvliet Wine Estate</h3>
          <p className="text-gray-600 mb-12 animate-on-scroll opacity-0 translate-y-8 duration-[1500ms] tracking-wider">Helshoogte Rd, Stellenbosch Central, Stellenbosch, 7600</p>
          <div className="relative group card-premium">
            <img 
              src="https://zorgvliet.com/wp-content/uploads/2015/07/Zorgvliet-accommodation-location.jpg?auto=format&fit=crop&q=80&w=1920" 
              alt="Venue" 
              className="w-full h-96 object-cover rounded-lg shadow-lg transform group-hover:scale-[1.02] transition-transform duration-500 animate-on-scroll opacity-0 translate-y-8 duration-1000 premium-border"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg"></div>
          </div>
        </div>
      </section>

      <section className="py-32 px-4 bg-gray-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-soul text-center mb-16 text-shimmer animate-on-scroll opacity-0 translate-y-8 duration-[1500ms] pb-4">The Big Day</h2>
          <div className="timeline-container py-12">
            <div className="grid md:grid-cols-2 gap-12">
              {[
                { icon: Clock, title: "Ceremony", time: "2:00 PM - 3:30 PM", desc: "Join us as we exchange vows" },
                { icon: Camera, title: "Photos", time: "3:30 PM - 5:00 PM", desc: "Capture memories with us" },
                { icon: Glass, title: "Cocktail Hour", time: "5:00 PM - 6:00 PM", desc: "Enjoy drinks & hors d'oeuvres" },
                { icon: Music, title: "Reception", time: "6:00 PM - 11:00 PM", desc: "Dance the night away" }
              ].map((event, index) => (
                <div key={index} className={`timeline-item ${index % 2 === 0 ? 'text-right pr-12' : 'pl-12'} animate-on-scroll opacity-0 translate-y-8 duration-1000`} style={{ transitionDelay: `${index * 200}ms` }}>
                  <div className="bg-white p-6 md:p-8 shadow-lg rounded-lg hover-trigger transform hover:scale-105 transition-all duration-300 premium-border premium-shadow card-premium animate-on-scroll opacity-0 translate-y-8 duration-[1500ms]" style={{ transitionDelay: `${index * 200}ms` }}>
                    <event.icon className="w-8 h-8 text-gold-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-serif mb-2 text-gray-800">{event.title}</h3>
                    <p className="text-gold-600">{event.time}</p>
                    <p className="text-sm text-gray-500 mt-2 hover-target">{event.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 px-4 bg-gradient-radial from-gray-50 to-gray-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-soul text-center mb-16 text-shimmer animate-on-scroll opacity-0 translate-y-8 duration-[1500ms] pb-4">Frequently Asked Questions</h2>
          <div className="grid gap-8">
            {[
              {
                q: "What is the dress code?",
                a: "The dress code is formal/black tie optional. We encourage guests to wear evening gowns, cocktail dresses, or suits."
              },
              {
                q: "Can I bring a plus one?",
                a: "We have reserved plus ones for guests as indicated on their invitations. Please refer to your invitation for the number of seats reserved in your honor."
              },
              {
                q: "Are children welcome?",
                a: "While we love your little ones, our wedding will be an adults-only celebration. We hope this advance notice allows you to arrange childcare."
              },
              {
                q: "Is there parking at the venue?",
                a: "Yes, the Grand Plaza Hotel offers both self-parking and valet services. Valet parking will be complimentary for all wedding guests."
              },
              {
                q: "Are there accommodations nearby?",
                a: "We have secured a block of rooms at the Grand Plaza Hotel at a special rate. Please use code 'SM2024' when booking."
              },
              {
                q: "What time should I arrive?",
                a: "Please plan to arrive 15-30 minutes before the ceremony start time of 2:00 PM to allow time for seating."
              }
            ].map((faq, index) => (
              <div 
                key={index}
                className="bg-white p-6 md:p-8 rounded-lg shadow-lg premium-border premium-shadow animate-on-scroll opacity-0 translate-y-8 duration-[1500ms] card-premium"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <h3 className="text-2xl font-serif mb-4 text-red-600">{faq.q}</h3>
                <p className="text-gray-600 leading-relaxed tracking-wide">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 px-4 bg-gray-100">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-soul text-center mb-12 text-shimmer animate-on-scroll opacity-0 translate-y-8 duration-[1500ms] pb-4">RSVP</h2>
          <form className="space-y-6 bg-white p-6 sm:p-10 md:p-12 rounded-lg shadow-lg animate-on-scroll opacity-0 translate-y-8 duration-[1500ms] premium-border premium-shadow">
            <div>
              <label className="block text-gray-700 mb-2 font-serif tracking-wide">Full Name</label>
              <input
                type="text"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent transform transition-transform duration-200 hover:scale-[1.01] premium-border input-premium text-gray-700"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2 font-serif tracking-wide">Email</label>
              <input
                type="email"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent transform transition-transform duration-200 hover:scale-[1.01] premium-border input-premium text-gray-700"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2 font-serif tracking-wide">Meal Preference</label>
              <select className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent transform transition-transform duration-200 hover:scale-[1.01] premium-border input-premium text-gray-700">
                <option value="">Please select a meal option</option>
                <option value="beef">Beef Tenderloin</option>
                <option value="chicken">Herb-Roasted Chicken</option>
                <option value="fish">Pan-Seared Salmon</option>
                <option value="vegetarian">Vegetarian Wellington</option>
                <option value="vegan">Vegan Wild Mushroom Risotto</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-400 via-red-500 to-red-400 text-white py-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg flex items-center justify-center space-x-2 font-serif tracking-wider btn-premium"
            >
              <Send className="w-5 h-5" />
              <span>Send RSVP</span>
            </button>
          </form>
        </div>
      </section>

      <section className="py-32 px-4 bg-gradient-radial from-gray-50 to-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-soul mb-8 text-shimmer animate-on-scroll opacity-0 translate-y-8 duration-[1500ms] pb-4">Love Birds Game</h2>
          <div className="flex items-center justify-center mb-8">
            <Heart className="w-12 h-12 text-red-500 animate-pulse" />
          </div>
          <LoveBirdsGame />
        </div>
      </section>

      <footer className="bg-gradient-to-r  via-blacktext-white py-16 text-center">
        <p className="font-soul text-3xl sm:text-4xl mb-4 text-shimmer">We can't wait to celebrate with you!</p>
        <div className="mt-4 flex items-center justify-center space-x-2">
          <Heart className="w-5 h-5 text-red-500 animate-pulse" />
          <p className="font-comic-sans tracking-widest">Robin & Kyle Software Company™</p>
        </div>
      </footer>
      <Analytics />
      <SpeedInsights />
    </div>
  );
}

export default App;