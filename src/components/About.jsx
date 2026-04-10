import React, { useState } from 'react';

const PRIMARY_PURPLE = '#7e22ce';
const ACCENT_ORANGE = '#fb923c';

const teamMembers = [
  {
    id: 1,
    name: 'E.W',
    role: 'B.S.W., Minor: WGSS',
    bio: 'I am someone who believes that access to knowledge, to care, and to each other can shift what is possible. Grounded in both Social Work and WGSS, my work is shaped by a feminist ethic that resists extraction and leans toward reciprocity and accountability. I am learning to sit with complexity and to build toward a world that is more honest and kinder to move through.',
    headshot: null,
  },
  {
    id: 2,
    name: 'K.R.',
    role: 'CS and English alum',
    bio: 'I believe that access to information, particularly that which pertains to reproductive justice, sexual health, and family planning, is central to uplifting women, and with them, their families and communities.',
    headshot: null,
  },
  {
    id: 3,
    name: 'S.S.',
    role: 'B.S.PH., Minor: BA',
    bio: 'I am someone who believes that expanding access to knowledge can shift what becomes possible for communities, and I return to the idea that public health is strongest when it is people‑centered. My work is grounded in health policy, and I hope to make possible a world where people feel informed and supported as they navigate the health systems that shape their lives.',
    headshot: null,
  },
  {
    id: 4,
    name: 'A.R',
    role: 'Political Science, Minor: PPE (Philosophy, Politics, and Economics)',
    bio: 'I am someone who is driven by growth, curiosity, and the desire to create something meaningful. My work is grounded in determination, resilience, and a commitment to improving both myself and the communities around me. I am learning to trust my path, embrace uncertainty, and move forward with confidence. What I hope to make possible is a future where I can create impact, open doors for others, and build something that lasts.',
    headshot: null,
  },
  {
    id: 5,
    name: 'B.D.P.',
    role: 'B.S. Public Health, Minor: Biology',
    bio: "I am someone who believes that access to healthcare and information shouldn't be controlled, especially when it comes to women's bodies and choices. I return to the idea that preserving data and lived experiences is a way to push back against systems trying to erase them. My work is grounded in public health and shaped by my goal to advocate for women, especially in reproductive health. I am learning to challenge these barriers while finding ways to combine medicine and advocacy in a real, impactful way. What I hope to make possible is a future where women are actually heard, supported, and able to make their own decisions about their health.",
    headshot: null,
  },
  {
    id: 6,
    name: 'X.I.',
    role: 'CS and Bio',
    bio: 'I am someone who believes in the freedom to knowledge and personal autonomy. As a woman in STEM, my work is uplifted by fellow peers and mentors who strive to provide a safe environment for all women. I hope to influence society towards not only equality, but also equity.',
    headshot: null,
  },
];

const PlaceholderAvatar = ({ name }) => {
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2);
  return (
    <div
      className="w-full h-full flex items-center justify-center rounded-full"
      style={{ background: `linear-gradient(135deg, #c4b5fd 0%, #a78bfa 50%, #7c3aed 100%)` }}
    >
      <span className="text-3xl font-bold text-white tracking-wide">{initials}</span>
    </div>
  );
};

const MemberCard = ({ member }) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="relative cursor-pointer"
      style={{ perspective: '1000px' }}
      onClick={() => setFlipped((f) => !f)}
      onKeyDown={(e) => e.key === 'Enter' && setFlipped((f) => !f)}
      tabIndex={0}
      role="button"
      aria-label={`View bio for ${member.name}`}
    >
      {/*
        Invisible spacer — sits in normal flow to give the container
        its height. Mirrors the back-face content (which is the taller side).
      */}
      <div className="invisible pointer-events-none select-none" aria-hidden="true">
        <div className="bg-purple-100 rounded-xl p-6 flex flex-col items-center">
          {/* avatar placeholder */}
          <div className="mb-5 rounded-full" style={{ width: 120, height: 120, flexShrink: 0 }} />
          <div className="text-xl font-bold mb-1">{member.name}</div>
          <div className="text-xs mb-4 uppercase tracking-wider">{member.role}</div>
          <p className="text-sm leading-relaxed text-center">{member.bio}</p>
          <span className="text-xs mt-3">Click to flip back</span>
        </div>
      </div>

      {/* Flip container — absolutely fills the spacer's height */}
      <div
        className="absolute inset-0"
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* FRONT */}
        <div
          className="absolute inset-0 bg-purple-100 rounded-xl shadow-lg border border-purple-200 flex flex-col items-center justify-center p-6"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div
            className="mb-5 rounded-full overflow-hidden border-4 border-purple-300 shadow-md"
            style={{ width: 120, height: 120, flexShrink: 0 }}
          >
            {member.headshot
              ? <img src={member.headshot} alt={member.name} className="w-full h-full object-cover" />
              : <PlaceholderAvatar name={member.name} />}
          </div>
          <h3 className="text-xl font-bold text-center mb-1" style={{ color: PRIMARY_PURPLE }}>{member.name}</h3>
          <p className="text-sm font-medium text-purple-500 text-center mb-4">{member.role}</p>
          <span className="text-xs text-gray-400 mt-auto flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74" />
              <path d="M21 3v9h-9" />
              <path d="M21 12A9 9 0 0 0 12 3a9.75 9.75 0 0 0-6.74 2.74" />
            </svg>
            Click to read bio
          </span>
        </div>

        {/* BACK */}
        <div
          className="absolute inset-0 rounded-xl shadow-lg border border-purple-300 flex flex-col items-center justify-center p-6"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: `linear-gradient(135deg, #ede9fe 0%, #f5f3ff 100%)`,
          }}
        >
          <h3 className="text-lg font-bold text-center mb-1" style={{ color: PRIMARY_PURPLE }}>{member.name}</h3>
          <p className="text-xs font-semibold text-purple-400 text-center mb-3 uppercase tracking-wider">{member.role}</p>
          <p className="text-gray-600 text-sm leading-relaxed text-center">{member.bio}</p>
          <span className="text-xs text-gray-400 mt-3 flex items-center gap-1 flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74" />
              <path d="M21 3v9h-9" />
              <path d="M21 12A9 9 0 0 0 12 3a9.75 9.75 0 0 0-6.74 2.74" />
            </svg>
            Click to flip back
          </span>
        </div>
      </div>
    </div>
  );
};

const About = ({ logo }) => {
  return (
    <div className="p-6 md:p-10">

      {/* Logo */}
      <div className="flex justify-center mb-8">
        <img src={logo} alt="Project REVEAL Logo" className="h-24 w-24 object-contain" />
      </div>

      {/* Page Title */}
      <div className="text-center mb-12 border-b-2 border-purple-200 pb-8">
        <h1 className="text-6xl font-extrabold mb-2 tracking-tight" style={{ color: PRIMARY_PURPLE }}>
          ABOUT REVEAL
        </h1>
        <p className="text-xl font-medium text-gray-700">The people and principles behind the archive</p>
      </div>

      {/* ── SECTION 1: Mission ── */}
      <section id="mission" className="max-w-2xl mx-auto text-center mb-16 scroll-mt-24">
        <h2 className="text-3xl font-bold mb-4" style={{ color: PRIMARY_PURPLE }}>Mission</h2>
        <p className="text-gray-600 leading-relaxed text-base mb-4">
          To collect, protect, and provide open access to reproductive and sexual health data — including
          abortion, STDs, gestational health, and maternal mortality — for researchers, advocates,
          and the public.
        </p>
        <p className="text-gray-500 text-sm leading-relaxed">
          We prioritize the well-being of all people, especially queer, trans, and nonbinary
          communities, and believe access to accurate medical information is a fundamental right.
        </p>
      </section>

      {/* ── SECTION 2: REVEAL Manifesto ── */}
      <section id="reveal-manifesto" className="mb-16 scroll-mt-24">
        <div
          className="max-w-3xl mx-auto rounded-xl p-8 shadow-lg border border-purple-200"
          style={{ background: `linear-gradient(135deg, #f3e8ff 0%, #fce7f3 100%)` }}
        >
          <h2 className="text-3xl font-bold text-center mb-6" style={{ color: PRIMARY_PURPLE }}>
            REVEAL Manifesto
          </h2>
          <p className="text-gray-600 leading-relaxed text-base mb-4">
            We believe that information is power — and that the erasure of reproductive health
            data is an act of political violence. Project REVEAL exists to resist that erasure.
          </p>
          <p className="text-gray-500 text-sm leading-relaxed">
            Manifesto placeholder
          </p>
        </div>
      </section>

      {/* ── SECTION 3: Design Decisions ── */}
      <section id="design-decisions" className="mb-16 scroll-mt-24">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4" style={{ color: PRIMARY_PURPLE }}>Design Decisions</h2>
          <p className="text-gray-600 leading-relaxed text-base mb-4">
            Data curation, accessible features, technical decisions
          </p>
          <p className="text-gray-500 text-sm leading-relaxed">
            Design Rationale
          </p>
        </div>
      </section>

      {/* ── SECTION 4: Contributor Bios ── */}
      <section id="contributor-bios" className="scroll-mt-24">
        <h2 className="text-3xl font-bold text-center mb-8" style={{ color: PRIMARY_PURPLE }}>
          Contributor Bios
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      </section>

    </div>
  );
};

export default About;