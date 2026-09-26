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
   OPTIONAL FIELDS FOR A FULL COURSE (all shown automatically
   on the course page when present; the first course below is a
   complete example):
   startDate   — "YYYY-MM-DD". Shows a countdown on the course
                 page. Treated as midnight East Africa Time.
   audience    — array: who the course is for
   delivery    — array: how the course is run
   outcomes    — array: "By the end you'll be able to..."
   weeks       — array of { week, title, modules: [{ n, title,
                 topics: [] }], assignments: [{ title, brief }] }.
                 Also powers the enrolled students' Course Room
                 (learn.html). A week may also have optional
                 sessions: [{ label, when, link }], quiz: { label,
                 link }, videos: [{ label, link }] and
                 materials: [{ label, file }] — anything left out
                 shows a "coming soon" placeholder in the room.
                 A module may also carry a full reading lesson:
                 lesson: { intro, sections: [{ title, intro,
                 terms: [{ term, text }] and/or groups: [{ title,
                 text, items: [] }] }], quiz: { title, intro,
                 questions: [{ q, options: [], answer }] } (answer =
                 0-based index of the right option), exercise: {
                 title, intro, promptsTitle, prompts: [{ label,
                 text }], closing } }. Modules with a lesson open
                 automatically in the Course Room. Note the quiz
                 answers are visible to anyone who views the page
                 source, so use these for self-check practice, not
                 for marks.
   welcome     — the "Welcome to the course" message shown as the
                 first step of the Course Room. Paragraphs are
                 separated by a blank line.
   preSurvey   — { title, intro, url }: the pre-course survey shown
                 under the welcome message. Paste a Google Forms or
                 Microsoft Forms link into url (leave "" for a
                 placeholder). The form must be set to accept
                 responses from anyone. Its own Previous / Next
                 buttons work for its pages inside the embed.
   assessment  — array of { label, weight } (weights add up to 100)
   passMark    — pass percentage, e.g. 70
   certificate — text describing the completion certificate
   finalProject— { title, intro, sections: [] }
   tools       — array: tools and platforms used

   materials  — array of { label, file } shown on a student's
                "My Courses" dashboard once they've enrolled,
                e.g. { label: "Week 1 Handout (PDF)", file:
                "documents/my-handout.pdf" }. Leave as [] if
                there's nothing to attach yet.
   ============================================ */

const COURSES = [

  {
    title: "Ecosystem Restoration and Integrated Water Resources Management",
    slug: "ecosystem-restoration-iwrm",
    image: "images/gallery-4.jpg",
    skills: [
      "Ecosystem Restoration",
      "Integrated Water Resources Management",
      "Soil & Water Conservation",
      "FMNR & Assisted Regeneration",
      "Catchment Planning",
      "Restoration Monitoring"
    ],
    category: "Restoration",
    format: "Live cohort",
    duration: "6 weeks · 24–30 hours",
    startDate: "2026-11-10",
    summary: "Restoring landscapes, managing water and building climate resilience — a practical online course on ecosystem restoration and Integrated Water Resources Management for dryland, pastoral, agricultural and displacement-affected landscapes.",
    highlights: [
      "How land, vegetation, soil and water work as one connected system",
      "Half-moons, bioswales, contour bunds, infiltration trenches and check dams",
      "Farmer Managed Natural Regeneration and tree establishment",
      "Rangeland restoration, catchment planning and rainwater harvesting",
      "Restoration for drought resilience and flood risk reduction",
      "Community-led planning, monitoring and maintenance"
    ],
    content: `This course strengthens participants' practical understanding of ecosystem restoration and Integrated Water Resources Management (IWRM) in dryland, agricultural, pastoral and displacement-affected landscapes.

Participants learn how land, vegetation, soil and water function as one interconnected system, and how interventions such as half-moons, demi-lunes, bioswales, contour bunds, infiltration trenches, check dams, water-spreading structures, tree establishment, Farmer Managed Natural Regeneration (FMNR), Assisted Natural Regeneration (ANR), rangeland restoration, gully rehabilitation, rainwater harvesting and catchment protection can be selected, designed, implemented and monitored within an integrated landscape approach.

The course places particular emphasis on dryland environments similar to Somalia, where drought, irregular rainfall, flash floods, erosion, vegetation loss, land degradation and competition over natural resources frequently occur together.

Healthy landscapes capture rainfall. Healthy soils absorb water. Healthy vegetation protects soils. Healthy catchments regulate water. The aim is not simply to construct structures or plant trees — it is to restore the function of the landscape so that water is slowed, spreads safely and infiltrates, soil stays in place, vegetation regenerates, and communities are better prepared for droughts and floods.`,
    welcome: `Dear learner,

Welcome to the course! We are delighted to offer Ecosystem Restoration and Integrated Water Resources Management: Restoring Landscapes, Managing Water and Building Climate Resilience. The course runs over six weeks and involves approximately 24–30 learning hours.

This 16-module online course provides a practical introduction to how land, soil, vegetation and water function as one interconnected system, and how restoring that system can help communities cope with drought, flash floods, erosion and land degradation. You will explore interventions such as half-moons, contour bunds, bioswales, check dams, gully rehabilitation, Farmer Managed Natural Regeneration (FMNR), rangeland restoration and rainwater harvesting, with a particular focus on dryland, agricultural, pastoral and displacement-affected landscapes similar to those in Somalia. The guiding idea is simple: to slow, spread, store and safely use water across the landscape.

Each week includes two live online sessions, short recorded lessons, practical field and photo-based exercises, a weekly quiz and group assignments. Throughout the course you will work towards a final practical project: a Community Ecosystem Restoration and IWRM Plan for a real landscape that you know.

Before getting started, please introduce yourself to your fellow participants through the course WhatsApp group or learning platform, and tell us a little about your role and the landscape you work in. We encourage you to ask questions, share photos from the field and learn from each other's experience – much of the most valuable knowledge in this course will come from participants themselves.

As a reminder, all of the logistical information about the course, including the session schedule, learning materials, assessment weighting and certificate requirements, can be found on the course platform. Participants who complete the course and its assignments with a score of 70% or above will receive a Certificate of Completion. Enjoy the course, and please be sure to share your feedback and suggestions along the way!

Best regards,
The Course Team`,
    preSurvey: {
      title: "Pre-course survey",
      intro: "Please take a few minutes to complete this short survey before the course starts. It helps us understand your role, your experience and the landscape you work in.",
      url: "https://docs.google.com/forms/d/e/1FAIpQLScNGc6rCLRyAeG5P0OOkFxO7aiLVg0wbv6KrDwG2E93E_r9VQ/viewform?usp=publish-editor"
    },
    audience: [
      "Project officers",
      "Field officers",
      "Community mobilizers",
      "Natural resource management staff",
      "WASH staff",
      "Agriculture and livelihoods staff",
      "Disaster risk reduction staff",
      "Government technical officers",
      "Community Resilience Committees",
      "Community Resilience and Early Warning structures",
      "Water committees",
      "Natural Resource Management Committees",
      "Farmers",
      "Agro-pastoralists",
      "Youth environmental groups",
      "NGO and civil society staff"
    ],
    delivery: [
      "2 online sessions per week, 1.5–2 hours each",
      "Short recorded lessons",
      "Practical field exercises",
      "Weekly quizzes",
      "Group assignments",
      "A final restoration and water-management plan",
      "Also available as an intensive 5-day online refresher"
    ],
    outcomes: [
      "Explain the basic principles of ecosystem restoration",
      "Explain the principles of Integrated Water Resources Management",
      "Recognize relationships between land degradation, soil, water, vegetation and livelihoods",
      "Conduct a simple landscape degradation assessment",
      "Identify major erosion and water-flow pathways within a catchment",
      "Select appropriate soil and water conservation measures",
      "Understand the construction and purpose of common restoration structures",
      "Apply FMNR and assisted natural regeneration approaches",
      "Plan tree establishment and vegetation restoration",
      "Understand watershed and catchment management",
      "Design measures to improve infiltration and groundwater recharge",
      "Integrate ecosystem restoration with drought and flood risk reduction",
      "Identify environmental and social risks associated with restoration interventions",
      "Engage communities in restoration planning",
      "Establish practical indicators for monitoring ecosystem recovery",
      "Develop a basic community-level ecosystem restoration and IWRM plan"
    ],
    weeks: [
      {
        week: 1,
        title: "Foundations: Ecosystems, Restoration and Water",
        modules: [
          {
            n: 1,
            title: "Understanding Ecosystems and Landscape Degradation",
            topics: [
              "Ecosystems, landscapes, watersheds, biodiversity, soil, vegetation, water and livelihoods",
              "Ecosystem services: provisioning, regulating, supporting, cultural and social",
              "Recognizing degradation: erosion, gullies, vegetation loss, overgrazing, crusting, compaction, invasive species, declining groundwater",
              "Exercise: how has a landscape you know changed over 10–20 years?"
            ],
            lesson: {
              intro: "Welcome to Module 1 of our interactive online course. In this module, we will explore the foundational concepts of ecosystems and landscapes, examine the vital services they provide, and learn how to identify the signs of environmental degradation.",
              sections: [
                {
                  title: "1. Core Concepts: The Building Blocks of Landscapes",
                  intro: "To restore a landscape, we first need to understand how its components interact. A landscape is not just a collection of plants and animals; it is a dynamic, interconnected network of natural systems.",
                  terms: [
                    { term: "Ecosystems", text: "A community of living organisms (plants, animals, and microbes) interacting with each other and their non-living physical environment (soil, water, air)." },
                    { term: "Landscapes", text: "A broader geographic area made up of a mosaic of interacting ecosystems, shaped by both natural processes and human activities." },
                    { term: "Watersheds", text: "The topographic area of land where all precipitation drains to a common outlet, such as a river, lake, or ocean. Watersheds are essential units for managing land and water resources sustainably." },
                    { term: "Biodiversity", text: "The variety of life at all levels—genes, species, and entire ecosystems. High biodiversity builds resilience against climate shocks and pests." },
                    { term: "Soil, Vegetation, and Water", text: "The holy trinity of land health. Healthy soil retains water and anchors vegetation; vegetation protects soil from erosion and cycles nutrients; water sustains both." },
                    { term: "Livelihoods", text: "The capabilities, assets, and activities required for a means of living. Human livelihoods are entirely dependent on the health of the surrounding natural resource base." }
                  ]
                },
                {
                  title: "2. Ecosystem Services: What Nature Provides for Us",
                  intro: "Ecosystems sustain human life by providing a wide range of benefits known as ecosystem services. These are typically categorized into four types:",
                  groups: [
                    {
                      title: "Provisioning Services",
                      text: "The material benefits people obtain from ecosystems, such as:",
                      items: ["Food, crops, and livestock forage", "Freshwater for drinking and irrigation", "Timber, firewood, and fiber", "Medicinal plants"]
                    },
                    {
                      title: "Regulating Services",
                      text: "The benefits obtained from the regulation of ecosystem processes, including:",
                      items: ["Climate regulation and carbon sequestration", "Flood and erosion control via vegetation cover", "Water purification and natural filtration", "Pollination of crops by insects and birds"]
                    },
                    {
                      title: "Supporting Services",
                      text: "The fundamental underlying processes necessary for the production of all other ecosystem services, such as:",
                      items: ["Soil formation and nutrient cycling", "Primary production (photosynthesis)"]
                    },
                    {
                      title: "Cultural and Social Services",
                      text: "Non-material benefits that enrich human life, including:",
                      items: ["Spiritual and religious connections to the land", "Recreational, aesthetic, and tourism value", "Traditional ecological knowledge and heritage"]
                    }
                  ]
                },
                {
                  title: "3. Recognizing Degradation: Symptoms of an Unhealthy Landscape",
                  intro: "Landscape degradation occurs when the productivity, biodiversity, and ecological integrity of an ecosystem decline. Learning to read the landscape helps us diagnose these issues early:",
                  terms: [
                    { term: "Soil Erosion and Gullies", text: "The washing or blowing away of topsoil by wind and water, often cutting deep trenches (gullies) across sloping lands." },
                    { term: "Vegetation Loss and Overgrazing", text: "A reduction in plant cover caused by excessive livestock pressure or clearing, leaving bare soil exposed to the elements." },
                    { term: "Soil Crusting and Compaction", text: "Hardening of the soil surface due to heavy machinery, trampling, or rain impact, which prevents water infiltration and seed germination." },
                    { term: "Invasive Species", text: "Aggressive non-native plants or animals that outcompete local species, often reducing the productive value of the land." },
                    { term: "Declining Groundwater", text: "Lowering water tables, drying up of springs, and reduced baseflows in streams due to over-extraction and poor rainwater infiltration." }
                  ]
                }
              ],
              quiz: {
                title: "4. Knowledge Check: Module 1 Multiple-Choice Quiz",
                intro: "Test your understanding of the concepts covered in this module by answering the following questions:",
                questions: [
                  {
                    q: "Which of the following best defines a watershed?",
                    options: [
                      "A standalone pond used exclusively for agricultural irrigation.",
                      "The topographic area of land where all precipitation drains to a common outlet like a river or lake.",
                      "An artificial channel built to redirect floodwaters away from towns.",
                      "The underground layer of rock that holds groundwater."
                    ],
                    answer: 1
                  },
                  {
                    q: "Water purification, flood control, and climate regulation are examples of which category of ecosystem services?",
                    options: [
                      "Provisioning services",
                      "Supporting services",
                      "Regulating services",
                      "Cultural services"
                    ],
                    answer: 2
                  },
                  {
                    q: "What is a primary cause of soil crusting and compaction in a landscape?",
                    options: [
                      "High biodiversity and dense tree cover",
                      "Heavy machinery, excessive animal trampling, or intense rain impact on bare soil",
                      "Rapid accumulation of organic mulch and compost",
                      "Natural nutrient cycling and earthworm activity"
                    ],
                    answer: 1
                  }
                ]
              },
              exercise: {
                title: "5. Interactive Exercise: Landscape Timeline",
                intro: "Take a few moments to think about a specific landscape, farm, or natural area you have known well over the past 10 to 20 years.",
                promptsTitle: "Reflection Prompts",
                prompts: [
                  { label: "The Past", text: "What did this landscape look like 10–20 years ago? What kinds of plants, animals, and water sources were abundant?" },
                  { label: "The Changes", text: "What visible changes have occurred over time? (e.g., Have streams dried up? Are crops failing more often? Has woody brush or invasive weed cover increased?)" },
                  { label: "The Drivers", text: "Do you think these changes were driven primarily by human activities (like overgrazing, deforestation, or urban expansion), climate shifts (like prolonged droughts), or a combination of both?" }
                ],
                closing: "Jot down your observations in your course notebook or share them in the discussion forum to compare notes with fellow learners!"
              }
            }
          },
          {
            n: 2,
            title: "Ecosystem Restoration Principles",
            topics: [
              "Prevent – Protect – Manage – Restore – Monitor",
              "Passive restoration versus active restoration",
              "The restoration hierarchy: avoid, reduce, protect, encourage natural recovery, actively restore, monitor and adapt",
              "Group exercise: choosing the right approach for different landscapes"
            ]
          },
          {
            n: 3,
            title: "Integrated Water Resources Management (IWRM)",
            topics: [
              "Managing water together with land, livestock, forests, settlements and ecosystems",
              "Core IWRM questions: where water comes from, who uses it, what happens upstream and downstream",
              "The water cycle: rainfall, runoff, infiltration, recharge, evaporation and storage",
              "Slow, spread, store and safely use water across the landscape",
              "Exercise: draw a simple watershed and identify upstream–downstream relationships"
            ]
          }
        ],
        assignments: [
          {
            title: "Assignment 1 – Spot Degradation",
            brief: "Photograph three signs of degradation in your area (erosion, bare soil, a gully, degraded vegetation) and explain the probable causes."
          }
        ],
        materials: [
          {
            label: "Week 1 Slides — Foundations: Ecosystems, Restoration and Water (PowerPoint)",
            file: "documents/week-1-foundations-slides.pptx"
          }
        ]
      },
      {
        week: 2,
        title: "Soil, Water Conservation and Restoration Structures",
        modules: [
          {
            n: 4,
            title: "Soil and Water Conservation",
            topics: [
              "Soil texture, organic matter, fertility, moisture and compaction",
              "Simple field test: how quickly water infiltrates bare, grassed, farmed and compacted soil",
              "Contour-based restoration: slope, contour lines, runoff velocity and water retention",
              "Building and using a simple A-frame level"
            ]
          },
          {
            n: 5,
            title: "Restoration Structures",
            topics: [
              "Half-moons / demi-lunes",
              "Bioswales",
              "Contour bunds",
              "Infiltration trenches",
              "Check dams",
              "Gully rehabilitation — treating the gully head, bed, banks and the catchment above"
            ]
          }
        ],
        assignments: [
          {
            title: "Assignment 2 – Follow the Water",
            brief: "During or after rainfall, identify where runoff starts, where it concentrates, where erosion occurs, and where water could be safely slowed or stored."
          }
        ]
      },
      {
        week: 3,
        title: "Vegetation, Rangelands and Catchments",
        modules: [
          {
            n: 6,
            title: "Vegetation Restoration, FMNR and Tree Establishment",
            topics: [
              "Farmer Managed Natural Regeneration (FMNR) step by step",
              "Assisted Natural Regeneration",
              "Tree establishment: before, during and after planting",
              "Measuring success by seedling survival, not seedlings planted"
            ]
          },
          {
            n: 7,
            title: "Rangeland and Grazing-Land Restoration",
            topics: [
              "Causes of rangeland degradation and bush encroachment",
              "Controlled and rotational grazing, resting, reseeding and protecting dry-season grazing areas",
              "Community grazing agreements and water-point placement",
              "Group exercise: build a grazing calendar"
            ]
          },
          {
            n: 8,
            title: "Catchment and Watershed Management",
            topics: [
              "Planning across the whole landscape, not isolated sites",
              "Upper, middle and lower catchment priorities",
              "Why a downstream structure can fail if the upstream cause is ignored"
            ]
          }
        ],
        assignments: [
          {
            title: "Assignment 3 – Restoration Opportunity",
            brief: "Identify one degraded site and recommend protection, FMNR, half-moons, contour bunds, check dams, bioswales or tree establishment — and explain why."
          }
        ]
      },
      {
        week: 4,
        title: "Water Harvesting, Drought and Flood Resilience",
        modules: [
          {
            n: 9,
            title: "Rainwater Harvesting and Water Conservation",
            topics: [
              "Rooftop and surface-runoff harvesting, farm ponds, earth dams, water pans and infiltration basins",
              "Water storage versus water retention",
              "Water efficiency: drip irrigation, mulching, scheduling and water-efficient crops"
            ]
          },
          {
            n: 10,
            title: "Ecosystem Restoration for Drought Resilience",
            topics: [
              "The cycle from land degradation to greater drought vulnerability",
              "Drought-resilience measures: soil-water conservation, FMNR, rangeland restoration, water harvesting, groundwater recharge"
            ]
          },
          {
            n: 11,
            title: "Ecosystem Restoration and Flood Risk Reduction",
            topics: [
              "Flash-flood pathways, drainage blockage and floodplain management",
              "Water-spreading areas, vegetative barriers, bioswales and infiltration structures",
              "Exercise: map a flood-prone settlement — where water enters, flows, accumulates and who is exposed"
            ]
          }
        ],
        assignments: []
      },
      {
        week: 5,
        title: "Community Planning, Governance and Design",
        modules: [
          {
            n: 12,
            title: "Community-Led Landscape Planning",
            topics: [
              "Participatory resource mapping, transect walks, seasonal calendars and historical timelines",
              "Problem trees, stakeholder mapping and community action plans",
              "Community mapping exercise: identify priority restoration areas"
            ]
          },
          {
            n: 13,
            title: "Natural Resource Governance and Conflict Sensitivity",
            topics: [
              "Common disputes over water points, grazing areas, boundaries and livestock routes",
              "Planning questions: who owns, uses, benefits and may lose access",
              "Involving women and marginalized groups in decisions"
            ]
          },
          {
            n: 14,
            title: "Designing a Restoration Intervention",
            topics: [
              "Define the problem and its cause",
              "Set a restoration objective",
              "Select the intervention or combination of interventions",
              "Establish indicators"
            ]
          }
        ],
        assignments: [
          {
            title: "Assignment 4 – Community Knowledge",
            brief: "Interview one farmer, pastoralist or community elder: how has this landscape changed during the last 10–20 years?"
          },
          {
            title: "Assignment 5 – Design Challenge",
            brief: "Draw one restoration intervention showing the direction of slope, direction of water, structure, vegetation, overflow and maintenance requirement."
          }
        ]
      },
      {
        week: 6,
        title: "Monitoring, Maintenance and Final Plan",
        modules: [
          {
            n: 15,
            title: "Monitoring Ecosystem Restoration",
            topics: [
              "Land, water, vegetation, livelihood and community indicators",
              "Choosing practical indicators a community can actually measure"
            ]
          },
          {
            n: 16,
            title: "Maintenance and Sustainability",
            topics: [
              "A simple maintenance plan for every intervention",
              "What to inspect, how often, and which group is responsible"
            ]
          }
        ],
        assignments: [
          {
            title: "Final Project – Community Ecosystem Restoration and IWRM Plan",
            brief: "Prepare a 12-section restoration and water-management plan for one real landscape (see the full outline on the course page)."
          }
        ]
      }
    ],
    assessment: [
      { label: "Participation", weight: 10 },
      { label: "Weekly quizzes", weight: 20 },
      { label: "Practical assignments", weight: 25 },
      { label: "Group exercises", weight: 15 },
      { label: "Final Ecosystem Restoration & IWRM Plan", weight: 30 }
    ],
    passMark: 70,
    certificate: "Participants who complete the course and its assignments receive a Certificate of Completion — Ecosystem Restoration and Integrated Water Resources Management.",
    finalProject: {
      title: "Community Ecosystem Restoration and IWRM Plan",
      intro: "Each participant or group prepares a plan for one real landscape, covering:",
      sections: [
        "Location and landscape description",
        "Major environmental problems",
        "Community livelihood systems",
        "Water resources",
        "Land and vegetation condition",
        "Water-flow and erosion map",
        "Priority restoration areas",
        "Proposed interventions",
        "Community roles",
        "Implementation timeline",
        "Monitoring indicators",
        "Maintenance plan"
      ]
    },
    tools: [
      "Zoom or Microsoft Teams for live sessions",
      "WhatsApp for participant communication",
      "Google Classroom or Moodle for learning materials",
      "Google Forms or Microsoft Forms for quizzes",
      "KoboToolbox for field assessments",
      "Google Earth / QGIS for basic landscape mapping where capacity permits"
    ],
    materials: []
  },

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
