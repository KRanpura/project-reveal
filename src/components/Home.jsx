import React from 'react';
import { Archive, Heart, Zap } from 'lucide-react';

const PRIMARY_PURPLE = '#7e22ce'; // Deep Purple
const ACCENT_ORANGE = '#fb923c'; // Vibrant Orange
const SOFT_PURPLE = 'bg-purple-50'; // Tailwind soft purple for container

const Home = ({ logo }) => {
  return (
    <div className="p-6 md:p-10">

        {/* Logo at the top */}
        <div className="flex justify-center mb-8">
            <img src={logo} alt="Project REVEAL Logo" className="h-24 w-24 object-contain" />
        </div>

        {/* Title and Subtitle */}
        <div className="text-center mb-12 border-b-2 border-purple-200 pb-8">
            <h1 className="text-6xl font-extrabold mb-2 tracking-tight" style={{ color: PRIMARY_PURPLE }}>
              PROJECT REVEAL
            </h1>
            <p className="text-xl font-medium text-gray-700">
              Reclaiming Erasure, Visualizing Empowerment, Archival Liberation
            </p>
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-3 gap-8">
            {/* Section 1: Who We Are */}
            <div className="bg-purple-100 p-6 rounded-xl shadow-lg border border-purple-200">
                <h2 className="text-2xl font-bold text-purple-700 mb-4 flex items-center">
                  <Zap className="h-6 w-6 mr-3 text-purple-500" />
                  Who We Are
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Project REVEAL is a feminist data archival initiative that responds to the government's intentional erasure of reproductive health information.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  We act to preserve materials related to gender, diversity, and reproductive health that are being lost, while utilizing AI to promote accessibility of information by translating complex article abstracts into readable summaries.
                </p>
            </div>

            {/* Section 2: Mission */}
            <div className="bg-purple-100 p-6 rounded-xl shadow-lg border border-purple-200">
                <h2 className="text-2xl font-bold text-purple-700 mb-4 flex items-center">
                  <Heart className="h-6 w-6 mr-3 text-purple-500" />
                  Our Mission
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  To collect, protect, and provide open access to reproductive health data (abortion, gestational health, mortality).
                </p>
                <p className="text-sm text-gray-500">
                  We prioritize the well-being of all people, especially queer, trans, and nonbinary communities.
                </p>
            </div>

            {/* Section 3: The Archive */}
            <div className="bg-purple-100 p-6 rounded-xl shadow-lg border border-purple-200">
                <h2 className="text-2xl font-bold text-purple-700 mb-4 flex items-center">
                  <Archive className="h-6 w-6 mr-3 text-purple-500" />
                  What We Archive
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We safeguard critical public health documents on abortion, contraceptives, and reproductive and sexual health.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Access to accurate, up-to-date medical and public health information is a fundamental right.
                </p>
            </div>
        </div>

        {/* Call to Action/Join the Collective */}
        <div className="mt-12 text-center">
            <h3 className="text-3xl font-extrabold text-gray-800 mb-4">
              Join the Collective
            </h3>
            <p className="text-lg text-gray-600 mb-6">
              Project REVEAL is more than an archive; it is a commitment to protect our community.
            </p>
        </div>
    </div>
  );
};

export default Home;
