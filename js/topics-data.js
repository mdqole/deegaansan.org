/* ============================================
   DEEGANSAN — topics-data.js

   This file holds every post shown in the "Topics"
   section of the website (https://deegaansan.org/#topics).

   Going forward, new posts are added here by Claude —
   just send the report text (and a PDF if you have
   one) and it gets added correctly, formatted for the
   site.

   FIELD REFERENCE (for reference only)
   ----------------------------------------------
   title     — headline shown on the card
   date      — "YYYY-MM-DD", used for sorting (newest
               first) and the date shown on the card
   category  — short tag shown on the card, e.g.
               "Report", "Update", "Announcement"
   summary   — one or two sentence teaser shown on the
               card itself
   body      — the full report text, shown when a
               visitor clicks "Read Full Report".
               Leave as "" if there's no long-form text.
               Paragraphs are separated by a blank line.
   file      — path to a downloadable document, or ""
               if there isn't one
   fileLabel — text on the download button, e.g.
               "Download Report (PDF)"
   ============================================ */

const TOPICS = [

  {
    title: "Briefing Report: 2026 El Niño Impact, Bay Region Exposure, and Preparedness Strategy",
    date: "2026-08-15",
    category: "Report",
    summary: "Forecasting data from ICPAC, FAO-SWALIM and FEWS NET point to a strengthening El Niño and positive Indian Ocean Dipole driving extreme Deyr-season flooding in 2026 — with Baidoa's IDP settlements facing severe flash-flood, displacement, and food security risk.",
    body: `Prepared for: Deegaansan Organization
Context: October–December (Deyr) 2026 Season Risk Analysis

1. Executive Summary & Context

Forecasting data from international and regional climate bodies (including ICPAC, FAO-SWALIM, and FEWS NET) indicate that a strengthening El Niño combined with a positive Indian Ocean Dipole (IOD) will drive extreme wet conditions across Somalia for the October–December (Deyr) 2026 season.

While riverine floods heavily threaten the Jubba and Shabelle corridors, the Bay Region (and Baidoa district in particular) faces severe exposure to catastrophic flash floods, structural destruction of IDP settlements, and escalating food security risks. Drawing lessons from the historic 1997 and 2023 flood benchmarks, proactive anticipatory action is vital to prevent mass displacement and a slide toward extreme food crises.

2. Facts and Figures for the 2026 Scenario

High Probability Forecast: Seasonal models indicate up to a 90% probability of above-normal rainfall in central and southern Somalia (including the Bay region) during the 2026 Deyr season.

Historical Benchmarks: The projected El Niño intensity matches or surpasses the severity of the 2023 and 1997 flood seasons.

Vulnerability in Baidoa: Baidoa hosts massive internally displaced person (IDP) populations living in low-lying, flood-prone settlements. Past heavy rains (such as October 2023) affected over 122,000 people in Baidoa alone, inundating makeshift shelters for over 92,000 IDPs across scores of displacement sites.

Food Security and Famine Risk: FEWS NET warns that extreme, widespread flooding could trigger IPC Phase 5 (Famine) outcomes in agropastoral zones like Bay, Bakool, and Gedo due to crop loss, livestock death, and isolated markets.

3. Key Risks for the Bay Region

Flash Floods & Inundation: Unlike riverine zones, the Bay region is vulnerable to sudden, intense flash floods caused by heavy local downpours, leading to rapid water accumulation in urban and lowland catchments.

Secondary Displacement & Shelter Collapse: Traditional wood-framed makeshift shelters and plastic sheeting commonly used in Baidoa's IDP camps quickly collapse or wash away, forcing families into secondary displacement.

Water-Borne Disease Outbreaks: Stagnant floodwaters, mixed with compromised sanitation facilities and limited clean water access, significantly elevate risks of acute watery diarrhea (AWD) and cholera.

Market Disruptions & Livelihood Shocks: Flooded roads isolate communities, cutting off trade flows, spiking food prices, and ruining standing agropastoral crops right before harvest.

4. Preparedness Steps & Actionable Recommendations for Deegaansan Organization

To mitigate human suffering and protect vulnerable communities in the Bay region, Deegaansan Organization should prioritize the following multi-sectoral steps:

A. Community-Based Early Warning & Evacuation Planning

Disseminate Early Warnings: Set up localized, accessible channels to push real-time weather and flood alerts to IDP camp leaders and agropastoral communities.

Identify Safe High Grounds: Map out safe evacuation routes and secure high-ground areas in collaboration with local authorities before heavy rains peak.

B. Shelter and Non-Food Items (NFIs) Preparedness

Pre-positioning: Pre-position emergency shelter kits, plastic sheets, and rope in strategic locations around Baidoa.

Flood-Resilient Infrastructure: Support IDPs in trenching and reinforcing shelter foundations to divert runoff water away from living spaces.

C. WASH (Water, Sanitation, and Hygiene) Interventions

Protect Water Sources: Chlorinate and raise local water points to prevent contamination from surface runoff.

Emergency Sanitation: Construct and repair elevated latrines outside flood paths to mitigate disease outbreaks.

D. Food Security & Livelihood Protection

Asset Protection: Coordinate with humanitarian partners to provide cash-based anticipatory action transfers, allowing households to protect seeds, harvest early where possible, or move livestock to safety.

Vulnerability Tracking: Monitor post-flood market access and nutrition indicators closely to flag early indicators of severe food deficits.`,
    file: "documents/El-nino%20Strategy%202026.pdf",
    fileLabel: "Download Report (PDF)"
  }

];
