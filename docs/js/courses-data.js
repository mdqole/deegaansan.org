/* ============================================
   DEEGANSAN — courses-data.js

   This file holds every course shown in the "Online
   Courses" section of the website (https://deegaansan.org/#courses)
   and on each course's own page (course.html?course=<slug>).

   These three courses are PLACEHOLDER content — replace
   the title/description/etc. with your organization's
   real course details before publishing.

   FIELD REFERENCE (for reference only)
   ----------------------------------------------
   title      — course name shown on the card and page
   slug       — short id used in the course's URL
                (course.html?course=<slug>). Letters,
                numbers and hyphens only, must be unique.
   image      — thumbnail shown on the course browser cards,
                e.g. "images/my-course.jpg" (put the file in
                the images/ folder).
   skills     — array of short skill names shown as "Skills
                you'll gain: ..." on the course browser cards.
   category   — short tag shown on the card, e.g.
                "Restoration", "Climate", "Community"
   format     — e.g. "Self-paced", "Live cohort"
   duration   — e.g. "4 weeks", "6 sessions"
   summary    — one or two sentence teaser shown on the
                card itself and at the top of the course page
   highlights — array of short bullet points ("What You'll
                Learn") shown on the card and the course page
   content    — the full course description shown only on
                the course's own page. Leave as "" if there's
                nothing more to add. Paragraphs are separated
                by a blank line, same as topics-data.js.
   materials  — array of { label, file } shown on a student's
                "My Courses" dashboard once they've enrolled,
                e.g. { label: "Week 1 Handout (PDF)", file:
                "documents/my-handout.pdf" }. Leave as [] if
                there's nothing to attach yet.
   ============================================ */

const COURSES = [

  {
    title: "Rangeland Restoration Fundamentals",
    slug: "rangeland-restoration-fundamentals",
    image: "images/SWC.jpeg",
    skills: ["Rangeland Assessment", "Reseeding", "Rotational Grazing", "Ecological Monitoring", "Restoration Planning"],
    category: "Restoration",
    format: "Self-paced",
    duration: "4 weeks",
    summary: "An introduction to reseeding, rotational grazing, and the core practices behind rehabilitating degraded rangelands.",
    highlights: [
      "Diagnosing degradation and setting restoration priorities",
      "Reseeding techniques suited to arid and semi-arid rangelands",
      "Rotational grazing management for long-term recovery",
      "Monitoring restoration progress in the field"
    ],
    content: `This course draws directly on Deegansan's field experience rehabilitating degraded rangelands across the Bay Region. It's built for community leaders, pastoralist groups, and field staff who want a practical grounding in restoration — not just theory.

You'll start by learning how to read a degraded landscape: identifying the drivers of degradation, prioritizing which areas to restore first, and setting realistic recovery targets with the community that depends on the land.

From there, the course moves into hands-on technique — reseeding methods suited to arid and semi-arid conditions, and rotational grazing plans that let vegetation recover while still supporting livestock. Each module ties back to monitoring, so you leave with a simple way to track whether a restoration effort is actually working.`,
    materials: []
  },

  {
    title: "Soil & Water Conservation Techniques",
    slug: "soil-water-conservation-techniques",
    image: "images/Gallery-3.jpg",
    skills: ["Erosion Control", "Water Harvesting", "Watershed Protection", "Community Maintenance", "Soil Conservation"],
    category: "Conservation",
    format: "Live cohort",
    duration: "6 sessions",
    summary: "Practical methods for protecting watersheds, preventing erosion, and building sustainable water harvesting systems.",
    highlights: [
      "Watershed protection and erosion-control basics",
      "Water harvesting structures for vulnerable landscapes",
      "Community-led maintenance and monitoring",
      "Case studies from Bay Region conservation work"
    ],
    content: `Run as a live cohort so participants can work through real watershed and water-harvesting problems together, this course covers the conservation techniques Deegansan uses in the field to protect soil and water in vulnerable landscapes.

Sessions move from diagnosis (where is erosion or water loss actually happening, and why) to construction (the water harvesting structures and erosion-control measures that address it), and finish on maintenance — because a structure a community can't maintain doesn't last.

Throughout, the course draws on real case studies from Deegansan's Bay Region conservation work, including what held up through flooding seasons and what had to be redesigned.`,
    materials: []
  },

  {
    title: "Community-Based Climate Adaptation",
    slug: "community-based-climate-adaptation",
    image: "images/gallery-5.jpg",
    skills: ["Climate Forecasting", "Early Warning Systems", "Evacuation Planning", "Community Facilitation", "Climate Advocacy"],
    category: "Climate",
    format: "Self-paced",
    duration: "3 weeks",
    summary: "Tools for engaging communities on climate adaptation and turning global commitments into local action.",
    highlights: [
      "Reading and communicating seasonal climate forecasts",
      "Designing community early-warning and evacuation plans",
      "Linking climate advocacy to on-the-ground restoration work",
      "Facilitating community dialogues on adaptation strategies"
    ],
    content: `Global climate forecasts only help communities if someone can translate them into local action in time. This self-paced course is built around that translation step.

You'll learn how to read seasonal forecasts from regional climate bodies and turn them into plain-language warnings communities can actually act on — including how to design an early-warning and evacuation plan that fits a specific settlement or watershed.

The final part of the course connects that preparedness work to longer-term climate advocacy, and gives you a facilitation framework for running community dialogues that turn global climate commitments into decisions people make on the ground.`,
    materials: []
  }

];
