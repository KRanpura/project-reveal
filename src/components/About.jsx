import React, { useState } from 'react';

const PRIMARY_PURPLE = '#7e22ce';
const ACCENT_ORANGE = '#fb923c';

const teamMembers = [
  {
    id: 1,
    name: 'Ellen W.',
    role: 'B.S.W., Minor: WGSS',
    bio: 'I am someone who believes that access to knowledge, to care, and to each other can shift what is possible. Grounded in both Social Work and WGSS, my work is shaped by a feminist ethic that resists extraction and leans toward reciprocity and accountability. I am learning to sit with complexity and to build toward a world that is more honest and kinder to move through.',
    headshot: null,
  },
  {
    id: 2,
    name: 'Khushi R.',
    role: 'B.S. in Computer Science and English',
    bio: 'I believe that access to information, particularly that which pertains to reproductive justice, sexual health, and family planning, is central to uplifting women, and with them, their families and communities.',
    headshot: null,
  },
  {
    id: 3,
    name: 'Skye S.',
    role: 'B.S.PH., Minor: BA',
    bio: 'I am someone who believes that expanding access to knowledge can shift what becomes possible for communities, and I return to the idea that public health is strongest when it is people‑centered. My work is grounded in health policy, and I hope to make possible a world where people feel informed and supported as they navigate the health systems that shape their lives.',
    headshot: null,
  },
  {
    id: 4,
    name: 'Ashley R.',
    role: 'B.A. in Political Science, Minor: PPE (Philosophy, Politics, and Economics)',
    bio: 'I am someone who is driven by growth, curiosity, and the desire to create something meaningful. My work is grounded in determination, resilience, and a commitment to improving both myself and the communities around me. I am learning to trust my path, embrace uncertainty, and move forward with confidence. What I hope to make possible is a future where I can create impact, open doors for others, and build something that lasts.',
    headshot: null,
  },
  {
    id: 5,
    name: 'Burne D.P.',
    role: 'B.S. in Public Health, Minor: Biology',
    bio: "I am someone who believes that access to healthcare and information shouldn't be controlled, especially when it comes to women's bodies and choices. I return to the idea that preserving data and lived experiences is a way to push back against systems trying to erase them. My work is grounded in public health and shaped by my goal to advocate for women, especially in reproductive health. I am learning to challenge these barriers while finding ways to combine medicine and advocacy in a real, impactful way. What I hope to make possible is a future where women are actually heard, supported, and able to make their own decisions about their health.",
    headshot: null,
  },
  {
    id: 6,
    name: 'Xiying I.',
    role: 'B.S. in Computer Science and Biology',
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
  return (
    <div
      className="bg-purple-100 rounded-xl shadow-lg border border-purple-200 flex flex-col items-center p-6 h-full"
    >
      {/* Avatar */}
      <div
        className="mb-5 rounded-full overflow-hidden border-4 border-purple-300 shadow-md"
        style={{ width: 120, height: 120, flexShrink: 0 }}
      >
        {member.headshot ? (
          <img
            src={member.headshot}
            alt={member.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <PlaceholderAvatar name={member.name} />
        )}
      </div>

      {/* Name */}
      <h3
        className="text-xl font-bold text-center mb-1"
        style={{ color: PRIMARY_PURPLE }}
      >
        {member.name}
      </h3>

      {/* Role */}
      <p className="text-sm font-medium text-purple-500 text-center mb-4">
        {member.role}
      </p>

      {/* Bio (always visible now) */}
      <p className="text-sm leading-relaxed text-center text-gray-600">
        {member.bio}
      </p>
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
            Project REVEAL starts from the understanding that erasure is never accidental. When reproductive and public health information disappears from public view, that disappearance is political as it greatly influences how people understand their bodies, their options, their rights, and their futures.
          </p>
          <p className="text-gray-600 leading-relaxed text-base mb-4">
            We built Project REVEAL to respond to that reality. Born from the urgency of federal and state attacks on reproductive rights and the removal of public health data from government websites, Project REVEAL is a feminist archive committed to preserving vulnerable knowledge and making it meaningfully accessible to the public. Information produced for the public should remain available to the public, and that access to accurate, legible health information is part of what makes autonomy possible. Our work is grounded in Reproductive Justice, rooted in Black feminist activism: the right to have children, not have children, and to parent children in safe and healthy environments, alongside sexual autonomy and gender freedom. This framework shapes not only what we preserve, but how we preserve it. We seek documents that reflect the layered realities of race, gender, sexuality, class, disability, and geography, because access to care and access to information are never evenly distributed.
          </p>
          <p className="text-gray-600 leading-relaxed text-base mb-4">
            Project REVEAL is committed to public scholarship. We did not want to build a resource that only serves people with institutional access, technical fluency, or specialized training. We wanted to create a public database that helps people orient themselves in the present. And it is because of that commitment that we write abstracts for every document, work to create more accessible versions, and design the site so that users can browse by keyword and tags that reflect the multiplicity of identity, lived conditions, and community.
          </p>
          <p className="text-gray-600 leading-relaxed text-base mb-4">
            Our methodology is feminist as it rejects the idea that preservation should look anything like extraction and control with the guise of neutrality. We do not believe in a data dump without context. We believe in care, interpretation, and legibility. We believe knowledge should be held collectively, made usable, and shared in ways that honor the people who need it most. We are committed to co-creation rather than building for or building from above. Project REVEAL is a living, collaborative practice shaped by interdisciplinary labor, public responsibility, and the conviction that another way of building knowledge infrastructure is possible.
          </p>
          <p className="text-gray-600 leading-relaxed text-base mb-4">
            Our stance on AI is clear: AI is a support tool, not a substitute for human thought, judgment, or labor. We use it in limited ways to increase accessibility, such as helping translate complex health information into a sixth-grade reading level. But AI does not decide what matters, does not replace critical thinking, and does not override human review. The project remains human-led at every stage. We believe technology should support liberation and access, not convenience at the expense of rigor or accountability! 
          </p>
          <p className="text-gray-600 leading-relaxed text-base mb-4">
            We are equally committed to privacy. Given the stakes of the information we preserve, we view privacy as an ethical responsibility, not a bonus feature. Visitors can use the site without creating an account, and we intentionally limit the amount of information we collect and retain. We do not treat users as data points, and we reject architectures that make vulnerable people more vulnerable.
          </p>
          <p className="text-gray-600 leading-relaxed text-base mb-4">
            Project REVEAL is more than an archive. It is a refusal of disappearance. A feminist infrastructure for public knowledge. A collective effort to preserve what is at risk, make it usable, and protect the people who come looking for it.
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