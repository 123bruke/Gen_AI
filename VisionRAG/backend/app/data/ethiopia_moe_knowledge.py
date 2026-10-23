"""
FDRE Ministry of Education (MOE) Phase 1 & Phase 2 Grounded Educational Knowledge Corpus.
Covers:
- Phase 1: Institutional Identity, Mandate, Proclamation No. 1368/2025, Regulation No. 561/2025,
  Curriculum Framework (KG-12), ESDP VI (Roadmap 2030), Annual Abstract, Organization Desks, RAG Rules.
- Phase 2: Historical Development of Education Administration and Reform (Milestones 1908–2025),
  Teacher Development, Examination Authorities, Sector Reviews, and Reform Trajectories.
"""

from typing import Dict, Any, List

# Phase 1 Sources
PHASE1_SOURCES = {
    "moe_home": {
        "source_id": "SRC-MOE-HOME-001",
        "title": "FDRE Ministry of Education official website (indexed result)",
        "url": "https://moe.gov.et/",
        "publisher": "Federal Democratic Republic of Ethiopia Ministry of Education",
        "source_type": "official_website",
        "accessed_on": "2026-10-23",
        "verification_note": "Search-indexed content exposes the ministry navigation and organizational labels. The live page behaved unexpectedly during research; verify the destination and document authenticity before submitting data."
    },
    "esaa_2022_23": {
        "source_id": "SRC-MOE-ESAA-2022-23-001",
        "title": "Education Statistics Annual Abstract 2022/23",
        "url": "https://www.moe.gov.et/storage/Books/ESAA%202022-23%20Final.pdf",
        "publisher": "Ministry of Education, Ethiopia",
        "source_type": "official_statistical_report",
        "publication_period": "2022/23",
        "accessed_on": "2026-10-23",
        "verification_note": "The report gives the ministry's vision and mission. It is a historical statistical publication, not proof that all wording or statistics remain current."
    },
    "policy_1994": {
        "source_id": "SRC-MOE-POLICY-1994-001",
        "title": "Education and Training Policy",
        "url": "https://www.moe.gov.et/storage/Books/Ethiopia%20Education%20and%20Training%20Policy.pdf",
        "publisher": "Federal Democratic Republic of Ethiopia Government",
        "publication_date": "1994-04",
        "source_type": "official_policy_document",
        "accessed_on": "2026-10-23",
        "verification_note": "Historical policy document. Do not assume every provision is the current rule without checking later laws and policy updates."
    },
    "esdp6": {
        "source_id": "SRC-MOE-ESDP-VI-001",
        "title": "Ethiopia Education Sector Development Program VI (ESDP VI) / Education and Training Roadmap – 2030 Objectives",
        "url": "https://www.moe.gov.et/storage/Books/Ethiopian%20Education%20Sector%20Development%20Program%206%20%28ESDP%20VI%29.pdf",
        "publisher": "Ministry of Education, Ethiopia",
        "source_type": "official_sector_plan",
        "accessed_on": "2026-10-23",
        "verification_note": "Contains a sector vision, values, goals and planning context. Treat target dates and program status as document-specific."
    },
    "general_education_law": {
        "source_id": "SRC-MOJ-GENED-PROC-1368-2025-001",
        "title": "General Education Proclamation No. 1368/2025",
        "url": "https://justice.gov.et/en/law/general-education-proclamation-no-1368-2025/",
        "publisher": "Ministry of Justice, Ethiopia",
        "publication_date": "2025-04-10",
        "source_type": "official_legal_record",
        "status_as_listed": "In Force",
        "accessed_on": "2026-10-23",
        "verification_note": "Official legal record identifies the proclamation as in force. For legal decisions, consult the complete law and any later amendments."
    },
    "qualification_framework": {
        "source_id": "SRC-MOJ-QUAL-FRAMEWORK-561-2025-001",
        "title": "Regulation No. 561/2025 on the Ethiopian Qualifications Framework for Education and Training",
        "url": "https://justice.gov.et/en/law/%E1%8B%A8%E1%8A%A2%E1%89%B5%E1%8B%AE%E1%8C%B5-%E1%8B%A8%E1%89%B5%E1%88%9D%E1%88%85%E1%88%AD%E1%89%B5%E1%8A%93-%E1%88%A5%E1%88%8D%E1%8C%A0%E1%8A%93-%E1%8B%A8%E1%89%A5%E1%89%83%E1%89%B5/",
        "publisher": "Ministry of Justice, Ethiopia",
        "publication_date": "2026-01-27",
        "source_type": "official_legal_record",
        "status_as_listed": "In Force",
        "accessed_on": "2026-10-23",
        "verification_note": "Official legal record describes a national qualifications framework for education and training. Read the complete regulation for authoritative detail."
    },
    "curriculum_framework": {
        "source_id": "SRC-MOE-CURRICULUM-KG12-001",
        "title": "Curriculum Framework for Ethiopian Education (KG–Grade 12)",
        "url": "https://www.moe.gov.et/storage/Books/Curriculum%20Framework%20for%20Ethiopian%20Education%20%28KG%20%E2%80%93%20Grade%2012%29.pdf",
        "publisher": "Ministry of Education, Ethiopia",
        "source_type": "official_curriculum_document",
        "accessed_on": "2026-10-23",
        "verification_note": "Framework is useful for historical and conceptual context. Confirm whether a newer framework or subject-specific curriculum supersedes a provision."
    },
    "policy_implementation": {
        "source_id": "SRC-MOE-POLICY-IMPLEMENTATION-001",
        "title": "The Education and Training Policy and Its Implementation",
        "url": "https://moe.gov.et/storage/Books/ESSA%201994%20E.C.pdf",
        "publisher": "Ministry of Education, Ethiopia",
        "source_type": "official_policy_explanation",
        "accessed_on": "2026-10-23",
        "verification_note": "Explains policy background and implementation context; use as explanatory historical material, not as a replacement for laws."
    },
    "moj_education_sector": {
        "source_id": "SRC-MOJ-EDUCATION-SECTOR-001",
        "title": "Ministry of Justice: Education and Training legal resources",
        "url": "https://justice.gov.et/en/sector/education-training/",
        "publisher": "Ministry of Justice, Ethiopia",
        "source_type": "official_legal_catalog",
        "accessed_on": "2026-10-23",
        "verification_note": "Useful index for identifying education-related laws and regulations. Open the individual legal record for details and current status."
    },
    "sports_portal": {
        "source_id": "SRC-MOE-SPORTS-PORTAL-001",
        "title": "FDRE Ministry of Education Sport Portal — About Us",
        "url": "https://sports.moe.gov.et/about-us",
        "publisher": "FDRE Ministry of Education",
        "source_type": "official_related_portal",
        "accessed_on": "2026-10-23",
        "verification_note": "Publishes the ministry vision, mission and values in a sports-portal context. Cross-check with more general ministry documents."
    }
}

# Phase 1 Knowledge Items (39 Records)
PHASE1_ITEMS = [
    ("identity", "official_name", "Official institutional name", "The institution is identified as the Federal Democratic Republic of Ethiopia Ministry of Education, commonly abbreviated MoE or MOE.", ["moe_home"], "high", "institutional_identity"),
    ("identity", "organization_type", "Organization type", "The Ethiopian Ministry of Education is a federal government ministry, not a private commercial company.", ["moe_home"], "high", "institutional_identity"),
    ("identity", "country", "Country of operation", "The ministry belongs to the Federal Democratic Republic of Ethiopia and operates within Ethiopia's federal government system.", ["moe_home"], "high", "institutional_identity"),
    ("identity", "headquarters", "Headquarters", "The ministry's published profile identifies its headquarters as Arada Sub-city, Addis Ababa, Ethiopia.", ["moe_home"], "high", "institutional_identity"),
    ("identity", "official_domain", "Official web domain", "The ministry's official web domain is https://moe.gov.et/. Because live pages may change or be compromised, verify the page and document before submitting sensitive information.", ["moe_home"], "high", "institutional_identity"),
    ("identity", "public_mandate", "Public mandate", "The ministry's role concerns national education policy and education-sector development, including general education, higher education, educational quality, curriculum, teacher development, and digital education.", ["moe_home", "esaa_2022_23"], "high", "institutional_identity"),
    ("identity", "not_private_company", "Difference from a private company", "A ministry carries out public duties assigned by government and law. It may procure services or work with private institutions, but it is not thereby a private commercial company.", ["moe_home"], "high", "institutional_identity"),
    ("identity", "official_navigation", "Website navigation categories", "The ministry's indexed website lists Vision, Mission and Values; Organizational Structure; Power and Duties; Who Is Who; Partners and Stakeholders; History; Policies and Strategies; Guidelines and Standards; Plans and Reports; Annual Abstract; Notices; and News.", ["moe_home"], "high", "institutional_identity"),
    ("identity", "public_hours", "Published working hours", "An indexed ministry website page lists working hours as Monday through Friday, 8:00 AM to 5:30 PM. These hours should be reconfirmed before visiting.", ["moe_home"], "medium", "contact"),
    ("identity", "public_contact_caution", "Contact verification", "Before sending documents or making payments, independently confirm that a contact address or service page is an authentic government channel. Do not provide passwords or unnecessary personal data.", ["moe_home"], "high", "source_safety"),
    ("purpose", "vision_source", "Vision statement source", "The Education Statistics Annual Abstract 2022/23 states the ministry vision as sustainably building an education and training system that ensures quality and equitable education for all citizens and continuously produces a competent and competitive workforce supporting economic development.", ["esaa_2022_23"], "high", "vision_mission"),
    ("purpose", "mission_source", "Mission statement source", "The Education Statistics Annual Abstract 2022/23 describes the mission as ensuring an effective, quality and equitable education and training system through implementation capacity, standards, expansion of standardized education, and strategic communication and public awareness.", ["esaa_2022_23"], "high", "vision_mission"),
    ("purpose", "mission_not_latest", "Mission wording limitation", "The mission statement in the 2022/23 annual abstract is a dated official statement. A RAG answer should identify its source period and should not claim that wording has been independently confirmed as the latest 2026 version.", ["esaa_2022_23"], "high", "source_quality"),
    ("purpose", "values_esdp", "Education-system values in ESDP VI", "The ESDP VI document discusses good governance, equity, and excellence as values of the education and training system. These are values stated in that sector-planning document.", ["esdp6"], "high", "vision_mission"),
    ("purpose", "access", "Education access concept", "Access refers to whether learners can enter and participate in education. Access may depend on school availability, distance, cost, inclusion, safety, and the ability of institutions to serve different communities.", ["policy_1994", "esdp6"], "medium", "concept"),
    ("purpose", "equity", "Education equity concept", "Equity concerns fairness in educational opportunity and in the distribution of education resources. It is related to, but not identical to, giving every learner exactly the same resources.", ["esdp6"], "high", "concept"),
    ("purpose", "quality", "Education quality concept", "Education quality concerns whether learning environments, teachers, curriculum, assessment, resources, and institutional processes support meaningful learning outcomes. This is a general explanatory definition, not a quoted statutory definition.", ["policy_1994", "curriculum_framework"], "medium", "concept"),
    ("purpose", "relevance", "Education relevance concept", "Education relevance concerns how learning relates to learners' needs, further study, work, society, and national development. The exact official definition depends on the policy or standard being applied.", ["policy_1994", "esdp6"], "medium", "concept"),
    ("purpose", "system_capacity", "Implementation capacity", "Implementation capacity means the people, funding, systems, management practices, and institutional abilities needed to turn policy commitments into delivered services.", ["esaa_2022_23", "esdp6"], "medium", "concept"),
    ("history", "religious_learning", "Education before modern ministries", "Ethiopia has long-standing religious and community learning traditions that predate the modern state education administration. The modern ministry should not be treated as the origin of all education in Ethiopia.", ["policy_implementation"], "medium", "history"),
    ("history", "menelik_school_1908", "Modern-school milestone", "Historical accounts commonly identify Menelik II School, established in 1908, as a milestone in the development of modern schooling in Ethiopia. This date refers to a school milestone, not the founding date of the current ministry.", ["policy_implementation"], "medium", "history"),
    ("history", "ministry_1942", "Education ministry history", "Historical research identifies 1942 as a milestone in formal education administration through the Ministry of Education and Fine Arts. Current institutional continuity and naming should be distinguished from this historical milestone.", ["policy_implementation"], "medium", "history"),
    ("history", "policy_1994", "1994 Education and Training Policy", "The federal government published the Education and Training Policy in April 1994. The policy is an important historical framework for understanding Ethiopia's modern education reform direction.", ["policy_1994"], "high", "history"),
    ("history", "esdp", "Education Sector Development Programme", "Education Sector Development Programmes translated broad policy priorities into multiyear plans, implementation arrangements, financing and monitoring activities.", ["esdp6", "policy_implementation"], "high", "history"),
    ("history", "history_current_limit", "Limits of historical chronology", "This Phase 1 dataset does not attempt to provide a complete institutional history or a fully verified list of every minister, renaming, merger, or reform. Those details should be added in Phase 2 with dated sources.", ["policy_implementation", "moe_home"], "high", "source_quality"),
    ("governance", "minister_role", "Minister role", "At a high level, a minister leads the ministry's executive work and represents it in government affairs. The exact legal powers depend on the currently applicable federal laws and delegations.", ["moe_home", "moj_education_sector"], "medium", "governance"),
    ("governance", "state_ministers", "State minister roles", "State ministers generally oversee portfolios delegated within a ministry. Names, assignments, and appointments must be verified against current official notices before being treated as current facts.", ["moe_home"], "high", "governance"),
    ("governance", "leadership_caution", "Leadership freshness", "Names shown on an indexed ministry profile are not sufficient on their own to prove that the same officials remain in office on a later date. Store appointment date, source date, and verification status for each person.", ["moe_home"], "high", "source_quality"),
    ("governance", "executive_offices", "Executive offices", "Executive offices organize work into specialized functional areas such as general education, higher education, governance and infrastructure, and ICT and digital education.", ["moe_home"], "high", "organization"),
    ("governance", "regional_coordination", "Federal-regional coordination", "Education policy and delivery involve multiple levels of government and institutions. A federal ministry's policy role should not be confused with direct day-to-day management of every school in every region.", ["general_education_law", "esdp6"], "high", "governance"),
    ("governance", "decentralization", "Decentralized education management", "The General Education Proclamation No. 1368/2025 identifies decentralized education management as part of the legal context for education development and stakeholder participation.", ["general_education_law"], "high", "legal_framework"),
    ("governance", "accountability", "Accountability concept", "Accountability means that public institutions and responsible officials should be answerable for duties, decisions, resource use, and performance under applicable law and administrative arrangements.", ["esdp6", "moj_education_sector"], "medium", "concept"),
    ("organization", "general_education", "General education functional area", "The ministry's indexed structure lists general education-related curriculum, teacher development, program quality, inclusion, infrastructure, inspection, and adult/non-formal education functions.", ["moe_home"], "high", "organization"),
    ("organization", "curriculum_development", "Curriculum Development Executive", "The indexed ministry structure lists language and co-curricular education, social science, natural science, and career and technical education curriculum desks.", ["moe_home"], "high", "organization"),
    ("organization", "teacher_development", "Teacher and educational-leader development", "The ministry's indexed structure includes a Teachers' and Educational Leaders' Development function. The exact current programs, eligibility requirements, and implementation procedures require separate program documentation.", ["moe_home"], "high", "organization"),
    ("organization", "steam", "STEAM Desk", "The indexed structure lists a STEAM Desk. STEAM commonly refers to science, technology, engineering, arts, and mathematics. Specific activities should be verified in official program materials.", ["moe_home"], "high", "organization"),
    ("organization", "quality_improvement", "Education programs and quality improvement", "The ministry's indexed structure includes an Education Programs and Quality Improvement Desk, indicating a functional focus on educational programs and quality improvement.", ["moe_home"], "high", "organization"),
    ("organization", "special_needs", "Pastoralist and special-needs education", "The indexed structure includes a Pastoralist and Special Needs Education Desk. This indicates attention to education issues involving pastoralist contexts and learners requiring additional support; specific services must be checked in current guidelines.", ["moe_home"], "high", "organization"),
    ("organization", "inspection", "General education inspection", "The indexed structure lists a General Education Inspection Desk. Do not infer exact inspection powers, procedures, or sanctions without consulting the applicable laws and official guidelines.", ["moe_home", "general_education_law"], "high", "organization"),
    ("organization", "adult_nonformal", "Adult and non-formal education", "The indexed structure lists Adults' Basic Education and Non-Formal and Lifelong Education Programs desks, reflecting functions beyond conventional school-age education.", ["moe_home"], "high", "organization"),
    ("organization", "higher_education", "Higher education functional area", "The indexed structure lists higher-education functions relating to academic affairs, curriculum and programs, quality improvement, teacher and student development, private institutions, research, community engagement, and internationalization.", ["moe_home"], "high", "organization"),
    ("organization", "research_ethics", "Research ethics function", "A Research Ethics Desk appears in the ministry's indexed higher-education structure. Its presence should not be interpreted as proof that every research project in Ethiopia is reviewed by this desk; institutional and legal jurisdiction must be checked.", ["moe_home"], "high", "organization"),
    ("organization", "technology_transfer", "Institutional linkage and technology transfer", "The ministry's indexed structure includes Institutional Linkage and Technology Transfer. The function title suggests support for institutional partnerships and knowledge or technology transfer; specific schemes need their own official documentation.", ["moe_home"], "high", "organization"),
    ("organization", "governance_infrastructure", "Governance and Infrastructure Executive", "The indexed structure lists Administration Affairs, Institutional Structure and Leadership, Infrastructure and Input, and Scholarship and Internationalization desks under a governance and infrastructure area.", ["moe_home"], "high", "organization"),
    ("organization", "ict_digital", "ICT and Digital Education Executive", "The indexed structure lists Education Multimedia Program Development, School Net ICT, Education Media Studio Operation and Administration, Network Technical, and Network Operation desks.", ["moe_home"], "high", "organization"),
    ("organization", "department_names_limit", "Department-name interpretation", "An office's name is evidence that the ministry lists that office, but the name alone does not establish the complete powers, staffing, budget, current activity, or service procedures of that office.", ["moe_home"], "high", "source_quality"),
    ("legal", "general_education_proclamation", "General Education Proclamation No. 1368/2025", "The Ministry of Justice's official legal record identifies General Education Proclamation No. 1368/2025, dated 10 April 2025, as in force. The full text should be consulted for authoritative legal interpretation.", ["general_education_law"], "high", "legal_framework"),
    ("legal", "qualification_regulation", "Regulation No. 561/2025", "The Ministry of Justice lists Regulation No. 561/2025 on the Ethiopian Qualifications Framework for Education and Training as in force, with a record date of 27 January 2026.", ["qualification_framework"], "high", "legal_framework"),
    ("legal", "proclamation_1097", "Proclamation No. 1097/2018 caution", "A prior report about ministry powers referenced Proclamation No. 1097/2018. The Ministry of Justice record marks that proclamation as repealed, so it should not be presented as the current legal authority without checking successor laws.", ["moj_education_sector"], "high", "legal_framework"),
    ("legal", "law_vs_policy", "Law versus policy", "A law or regulation has a different legal status from a policy, strategy, annual report, or website description. RAG responses about legal duties should prioritize current official legal records and identify policy documents as policy sources.", ["moj_education_sector", "general_education_law"], "high", "rag_guidance"),
    ("legal", "legal_advice", "Legal interpretation limitation", "A general-purpose RAG assistant can summarize official legal texts but should not claim to provide binding legal advice. For consequential decisions, consult the full law and a qualified legal professional or competent authority.", ["moj_education_sector"], "high", "rag_guidance"),
    ("education", "policy_1994_topics", "Topics covered by 1994 policy", "The 1994 Education and Training Policy covers education objectives and structure, curriculum, teacher affairs, assessment, language, organization, management, and finance among its major themes.", ["policy_1994", "policy_implementation"], "high", "policy"),
    ("education", "curriculum_framework", "KG–Grade 12 curriculum framework", "The ministry has published a Curriculum Framework for Ethiopian Education covering Kindergarten through Grade 12. Before answering questions about current grade-level curriculum, check whether a newer framework or subject syllabus supersedes the retrieved document.", ["curriculum_framework"], "high", "policy"),
    ("education", "esdp_2030", "ESDP VI and 2030 roadmap", "The ESDP VI document is titled around Ethiopia's Education and Training Roadmap and 2030 objectives. Targets in the document should be reported with their stated baseline, target year, and scope rather than as achieved outcomes.", ["esdp6"], "high", "policy"),
    ("education", "annual_abstract", "Education Statistics Annual Abstract", "The Education Statistics Annual Abstract is an official statistical publication that can provide education-sector indicators for a defined academic year. Each statistic should be stored with its year, geography, population, unit, and caveats.", ["esaa_2022_23"], "high", "data_source"),
    ("education", "historical_statistics_caution", "Statistics need year labels", "An education statistic from an annual abstract is not automatically current. The RAG system should state the academic year and note exclusions or limitations described by the report.", ["esaa_2022_23"], "high", "rag_guidance"),
    ("digital", "digital_education", "Digital education function", "The ministry's indexed structure includes ICT and Digital Education. This establishes an organizational area, but does not by itself verify the current status of any particular platform or digital transformation project.", ["moe_home"], "high", "digital_education"),
    ("digital", "school_net", "School Net ICT Desk", "School Net ICT is listed in the ministry's indexed organizational structure. Specific connectivity coverage, devices, software, funding, and school participation should be sourced from separate dated reports.", ["moe_home"], "high", "digital_education"),
    ("digital", "multimedia", "Education multimedia", "The indexed structure lists an Education Multimedia Program Development Desk and an Education Media Studio Operation and Administration Desk, indicating education-media functions.", ["moe_home"], "high", "digital_education"),
    ("digital", "network_ops", "Network technical and operations desks", "Network Technical and Network Operation desks are listed under ICT and Digital Education. Do not infer network topology, service-level agreements, cybersecurity posture, or uptime without technical documentation.", ["moe_home"], "high", "digital_education"),
    ("digital", "ai_opportunities", "Potential AI applications", "Potential education-sector AI applications include aggregate learning analytics, education-statistics search, translation assistance, document retrieval, and administrative workflow support. These are proposed possibilities, not verified active ministry projects.", ["moe_home", "esaa_2022_23"], "medium", "analysis"),
    ("digital", "privacy", "Student-data privacy", "A system processing student or staff data should use lawful authorization, data minimization, access control, security safeguards, and retention rules. Public ministry documents should not be assumed to authorize collection of private records.", ["general_education_law"], "high", "data_governance"),
    ("stakeholders", "regional_authorities", "Regional education authorities", "Regional education authorities are important stakeholders in education administration and implementation. The federal ministry and regional bureaus are distinct institutions with different legal and operational responsibilities.", ["general_education_law", "esdp6"], "high", "stakeholders"),
    ("stakeholders", "schools", "Schools as stakeholders", "Schools are education delivery institutions. A national policy or ministry guideline may affect schools, but day-to-day operational authority depends on the level of government and applicable rules.", ["general_education_law", "esdp6"], "high", "stakeholders"),
    ("stakeholders", "universities", "Universities as stakeholders", "Universities participate in higher education, teaching, research, and community engagement. Institutional autonomy and ministry authority must be interpreted under the applicable law and university-specific legal framework.", ["moj_education_sector"], "high", "stakeholders"),
    ("stakeholders", "families_communities", "Families and communities", "Families and communities influence education participation and can contribute to local education development. The General Education Proclamation's preamble recognizes the role of government, society, and other stakeholders in education development.", ["general_education_law"], "high", "stakeholders"),
    ("stakeholders", "development_partners", "Development partners", "Education-sector planning may involve cooperation with development partners. Specific partner contributions, funding amounts, and project status must be supported by the relevant agreement or dated report.", ["esdp6"], "medium", "stakeholders"),
    ("resources", "official_home", "Official ministry homepage", "The ministry homepage is https://moe.gov.et/. Use it as a starting point for official announcements and documents, but verify authenticity if the page behaves unexpectedly.", ["moe_home"], "high", "official_resource"),
    ("resources", "legal_catalog", "Ministry of Justice education-law catalog", "The Ministry of Justice education and training sector page is a useful official index for finding education-related laws and regulations: https://justice.gov.et/en/sector/education-training/.", ["moj_education_sector"], "high", "official_resource"),
    ("resources", "general_ed_law_link", "General Education Proclamation source", "The official legal record for General Education Proclamation No. 1368/2025 is available at https://justice.gov.et/en/law/general-education-proclamation-no-1368-2025/.", ["general_education_law"], "high", "official_resource"),
    ("resources", "qual_framework_link", "Qualifications framework regulation source", "The Ministry of Justice provides a record for Regulation No. 561/2025 on the Ethiopian Qualifications Framework for Education and Training. Use the legal record to access the regulation and confirm its details.", ["qualification_framework"], "high", "official_resource"),
    ("resources", "annual_abstract_link", "Annual Abstract source", "The ministry-hosted Education Statistics Annual Abstract 2022/23 can be accessed at https://www.moe.gov.et/storage/Books/ESAA%202022-23%20Final.pdf.", ["esaa_2022_23"], "high", "official_resource"),
    ("resources", "policy_link", "1994 policy source", "The ministry-hosted Education and Training Policy is available at https://www.moe.gov.et/storage/Books/Ethiopia%20Education%20and%20Training%20Policy.pdf.", ["policy_1994"], "high", "official_resource"),
    ("rag", "answer_with_year", "RAG rule: include dates", "When answering questions about statistics, leadership, laws, programs, or policy, include the relevant publication date or reporting year whenever available.", ["esaa_2022_23", "moe_home", "moj_education_sector"], "high", "rag_quality"),
    ("rag", "answer_with_source", "RAG rule: cite sources", "Every factual answer generated from this knowledge base should include a source title or URL and identify the relevant document date where possible.", ["moe_home", "moj_education_sector"], "high", "rag_quality"),
    ("rag", "distinguish_fact_analysis", "RAG rule: distinguish facts from analysis", "The RAG system should label official statements separately from explanations, suggestions, inferences, and proposed AI applications.", ["moe_home", "esdp6"], "high", "rag_quality"),
    ("rag", "conflicting_sources", "RAG rule: resolve conflicting sources", "If sources conflict, prioritize current authoritative legal records for legal status, dated official ministry documents for institutional statements, and recent official statistical reports for statistics. Explain unresolved conflicts instead of silently selecting one.", ["moj_education_sector", "moe_home", "esaa_2022_23"], "high", "rag_quality"),
    ("rag", "no_invented_contact", "RAG rule: do not invent contact details", "If an official phone number, email address, officeholder, salary, deadline, or service fee is not present in a verified source, the assistant must say it could not verify the information.", ["moe_home"], "high", "rag_quality"),
    ("rag", "no_claim_current", "RAG rule: avoid unsupported current claims", "A document's existence does not prove a program is active now. State the document's date and distinguish historical policy, current legal status, announced plans, and verified implementation.", ["esdp6", "moj_education_sector"], "high", "rag_quality"),
    ("rag", "safe_sensitive_data", "RAG rule: protect sensitive data", "Do not expose personal student records, staff records, credentials, or non-public institutional data. Only retrieve and answer from data the system is authorized to process.", ["general_education_law"], "high", "data_governance"),
    ("rag", "unknown_response", "RAG rule: answer unknowns honestly", "When the retrieved documents do not support an answer, respond that the information was not verified and recommend an official source or responsible office rather than guessing.", ["moe_home", "moj_education_sector"], "high", "rag_quality"),
]

# Phase 2 Sources
PHASE2_SOURCES = [
    {
        "source_id": "SRC-P2-RISE-2023-001",
        "title": "The Political Economy of Educational Reform and Learning in Ethiopia (1941–2021)",
        "publisher": "Research on Improving Systems of Education (RISE); report listed by UK Foreign, Commonwealth & Development Office",
        "url": "https://www.gov.uk/research-for-development-outputs/the-political-economy-of-educational-reform-and-learning-in-ethiopia-1941-2021",
        "source_type": "research_report",
        "publication_date": "2023-07-20",
        "accessed_on": "2026-10-23",
        "supports": ["broad historical chronology", "policy changes across political periods", "education reforms"],
        "limitations": "Research analysis, not a substitute for official legal texts or ministry records."
    },
    {
        "source_id": "SRC-P2-RISE-TIMELINE-001",
        "title": "Table 3: Timeline of major milestones in education policy in Ethiopia",
        "publisher": "Research on Improving Systems of Education (RISE), PDF chapter/report",
        "url": "https://riseprogramme.org/sites/default/files/2023-03/The%20Political%20Economy%20of%20Educational%20Reform%20and%20Learning%20in%20Ethiopia_0.pdf",
        "source_type": "research_timeline",
        "publication_date": "2023",
        "accessed_on": "2026-10-23",
        "supports": ["milestones 1942–2012", "education plans", "curriculum changes", "teacher education and assessment reforms"],
        "limitations": "Timeline is a secondary research source. Verify important milestones against primary sources where possible."
    },
    {
        "source_id": "SRC-P2-ETP-1994-001",
        "title": "Education and Training Policy",
        "publisher": "Federal Democratic Republic of Ethiopia Government",
        "url": "https://www.moe.gov.et/storage/Books/Ethiopia%20Education%20and%20Training%20Policy.pdf",
        "source_type": "official_policy_document",
        "publication_date": "1994-04",
        "accessed_on": "2026-10-23",
        "supports": ["1994 policy framework", "education objectives", "curriculum", "teacher education", "language", "assessment", "management and finance"],
        "limitations": "Historical policy text; later policy revisions or legal changes may supersede aspects."
    },
    {
        "source_id": "SRC-P2-ESDP-V-001",
        "title": "Education Sector Development Program V",
        "publisher": "Federal Ministry of Education, Ethiopia",
        "url": "https://moe.gov.et/storage/Books/ESDP%20V%20English.pdf",
        "source_type": "official_sector_plan",
        "publication_period": "2015/16–2019/20",
        "accessed_on": "2026-10-23",
        "supports": ["ESDP V planning period", "policy continuity", "quality and equity priorities"],
        "limitations": "The plan is historical and does not by itself establish current targets or implementation status."
    },
    {
        "source_id": "SRC-P2-ESDP-VI-001",
        "title": "Education Sector Development Programme VI (ESDP VI)",
        "publisher": "Federal Ministry of Education, Ethiopia",
        "url": "https://www.moe.gov.et/storage/Books/Ethiopian%20Education%20Sector%20Development%20Program%206%20%28ESDP%20VI%29.pdf",
        "source_type": "official_sector_plan",
        "publication_period": "2020/21–2024/25",
        "accessed_on": "2026-10-23",
        "supports": ["ESDP VI planning period", "implementation structure", "monitoring and evaluation"],
        "limitations": "Plan period ended in 2024/25; do not present its targets as current or achieved without newer evidence."
    },
    {
        "source_id": "SRC-P2-GENED-PROC-1368-2025-001",
        "title": "General Education Proclamation No. 1368/2025",
        "publisher": "Ministry of Justice, Ethiopia",
        "url": "https://justice.gov.et/en/law/general-education-proclamation-no-1368-2025/",
        "source_type": "official_legal_record",
        "publication_date": "2025-04-10",
        "status_as_listed": "In Force",
        "accessed_on": "2026-10-23",
        "supports": ["modern legal context for general education", "access, quality, equity, decentralized management"],
        "limitations": "Read the full proclamation and later amendments for authoritative legal interpretation."
    },
    {
        "source_id": "SRC-P2-BOARDING-HISTORY-001",
        "title": "Ethiopia Boarding Schools Admission — History",
        "publisher": "FDRE Ministry of Education related portal",
        "url": "https://sbs.moe.gov.et/about/history",
        "source_type": "official_related_portal",
        "accessed_on": "2026-10-23",
        "supports": ["historical list of ministers and administration"],
        "limitations": "Some dates/names on the page appear internally inconsistent. Use cautiously and cross-check before treating any appointment chronology as definitive."
    },
    {
        "source_id": "SRC-P2-UNHCR-RIMAP-2023-001",
        "title": "Education and Training Policy of Ethiopia — Amharic version (2023)",
        "publisher": "Rights Mapping and Analysis Platform / UNHCR",
        "url": "https://rimap.unhcr.org/node/259",
        "source_type": "policy_catalog_record",
        "publication_date": "2023",
        "accessed_on": "2026-10-23",
        "supports": ["policy scope and summary"],
        "limitations": "Catalog summary, not the full legal or policy text."
    }
]

# Phase 2 Milestones & Events
PHASE2_EVENTS = [
    ("1908", "Modern-school milestone", "Menelik II School is commonly identified in historical accounts as an early milestone in modern schooling in Ethiopia.", "education_system", ["SRC-P2-RISE-2023-001"], "medium", "This is a school-history milestone, not the founding date of the modern Ministry of Education."),
    ("1941", "Beginning of period covered by modern reform research", "The RISE historical study frames its analysis of modern educational reform from 1941 onward, around the return to imperial rule and subsequent reconstruction of state institutions.", "political_context", ["SRC-P2-RISE-2023-001"], "medium", "Use as a research period marker rather than a specific ministry founding event."),
    ("1942", "Ministry of Education and Fine Arts", "The RISE timeline identifies 1942 as the establishment of the Ministry of Education and Fine Arts.", "education_administration", ["SRC-P2-RISE-TIMELINE-001"], "medium", "Historical institutional name; do not assume exact continuity of legal identity or current name."),
    ("1943", "Early secondary-school development", "The RISE timeline lists the opening of Haile Selassie I Secondary School in 1943 as a milestone in modern education.", "schooling", ["SRC-P2-RISE-TIMELINE-001"], "medium", "Historical timeline entry."),
    ("1944", "Teacher training", "The RISE timeline lists the establishment of a Teacher Training School in 1944.", "teacher_development", ["SRC-P2-RISE-TIMELINE-001"], "medium", "Historical timeline entry; verify institution name and institutional succession from primary sources."),
    ("1946", "National examination milestone", "The RISE timeline lists the first national examination, for Grade 6 students, in 1946.", "assessment", ["SRC-P2-RISE-TIMELINE-001"], "medium", "Historical timeline entry."),
    ("1947", "Early official state curriculum", "The RISE timeline lists an official state curriculum with a 6-6 educational structure in 1947.", "curriculum", ["SRC-P2-RISE-TIMELINE-001"], "medium", "The 6-6 label refers to the structure stated in the historical timeline; explain the context if used in answers."),
    ("1949", "Curriculum structure revision", "The RISE timeline lists a second curriculum in 1949 with an 8-4 structure.", "curriculum", ["SRC-P2-RISE-TIMELINE-001"], "medium", "Historical curriculum structure; not a description of the current grade structure."),
    ("1951", "University development", "The RISE timeline lists the establishment of Haile Selassie University in 1951 as a milestone in higher education.", "higher_education", ["SRC-P2-RISE-TIMELINE-001"], "medium", "Historical name and date; current institutional lineage should be checked separately."),
    ("1954", "Secondary-school leaving examination", "The RISE timeline lists the introduction of the Ethiopian Secondary School Leaving Certificate Examination in 1954.", "assessment", ["SRC-P2-RISE-TIMELINE-001"], "medium", "Historical examination system; not the current examination authority or current exam format."),
    ("1955", "Long-term planning", "The RISE timeline lists a Ten-Year Long-Term Plan in 1955.", "planning", ["SRC-P2-RISE-TIMELINE-001"], "medium", "A historical planning milestone."),
    ("1957", "Education sector planning", "The RISE timeline identifies the first, second, and third five-year education-sector plans with dates of 1957, 1963, and 1968.", "planning", ["SRC-P2-RISE-TIMELINE-001"], "medium", "A historical timeline summary; verify original plan documents for details."),
    ("1963", "Curriculum structure milestone", "The RISE timeline lists a curriculum structure described as 6-2-4 in 1963.", "curriculum", ["SRC-P2-RISE-TIMELINE-001"], "medium", "Historical structure only."),
    ("1972", "Education Sector Review", "The RISE timeline identifies the 1972 Education Sector Review as a major comprehensive and critical review of the education sector.", "sector_review", ["SRC-P2-RISE-TIMELINE-001"], "medium", "A historical review; its findings should be taken from the original report if cited in detail."),
    ("1974", "Political transition and education policy direction", "The RISE timeline records a 1974 policy directive concerning free fundamental education during the political transition and the start of the Derg period.", "policy_change", ["SRC-P2-RISE-TIMELINE-001"], "medium", "Do not interpret this summary as a complete description of the policy or its implementation."),
    ("1975", "Public ownership of private schools", "The RISE timeline cites Proclamation 54/1975 as introducing public ownership of private schools.", "legal_and_institutional_change", ["SRC-P2-RISE-TIMELINE-001"], "medium", "Historical legal summary; consult the proclamation text for exact scope."),
    ("1976", "Public administration and control of schools", "The RISE timeline cites Proclamation 103/1976 concerning public administration and control of schools and also notes the Program for National Democratic Revolution.", "governance", ["SRC-P2-RISE-TIMELINE-001"], "medium", "This describes a historical government period, not current policy."),
    ("1979", "National literacy campaign", "The RISE timeline lists the launch of a national literacy campaign in 1979.", "adult_literacy", ["SRC-P2-RISE-TIMELINE-001"], "medium", "Historical milestone; programme outcomes require separate evidence."),
    ("1983", "ERGESE review", "The RISE timeline lists the Evaluative Research on the General Education System of Ethiopia (ERGESE) in 1983 as another major effort to review the sector.", "sector_review", ["SRC-P2-RISE-TIMELINE-001"], "medium", "Use the full research report for findings and recommendations."),
    ("1991", "Government transition", "The RISE research describes 1991 as the start of a new political and administrative period in which a new government began preparing a different education system.", "political_context", ["SRC-P2-RISE-2023-001"], "medium", "Describe institutional changes neutrally and distinguish chronology from interpretation."),
    ("1994-04", "Education and Training Policy published", "The federal government published the Education and Training Policy in April 1994. The policy addressed education objectives, structure, curriculum, assessment, teacher education, language of instruction, coordination of education and research, management, and finance.", "national_policy", ["SRC-P2-ETP-1994-001", "SRC-P2-UNHCR-RIMAP-2023-001"], "high", "Historical policy; check later policies and legislation for current rules."),
    ("1994", "Education Master Plan and short-term planning", "Historical programme documentation describes education planning exercises after adoption of the 1994 policy, including an Education Master Plan and a short-term plan focused particularly on primary education.", "planning", ["SRC-P2-RISE-2023-001"], "medium", "The plans were early implementation steps; do not conflate them with later ESDP cycles."),
    ("1995", "Teacher career policy", "The RISE timeline lists a teacher career policy with six levels in 1995.", "teacher_development", ["SRC-P2-RISE-TIMELINE-001"], "medium", "Historical career structure; not a current teacher career ladder."),
    ("1997/98", "First Education Sector Development Programme", "The RISE timeline lists the launch of the first Education Sector Development Plan in 1997/98 to operationalize the 1994 Education and Training Policy.", "sector_planning", ["SRC-P2-RISE-TIMELINE-001", "SRC-P2-RISE-2023-001"], "high", "The period and naming may appear as ESDP or ESDP I in different sources."),
    ("1997", "Teacher Development Program I", "The RISE timeline lists Teacher Development Program I in 1997.", "teacher_development", ["SRC-P2-RISE-TIMELINE-001"], "medium", "Use primary programme documentation for detailed objectives and outcomes."),
    ("1997", "National Organization for Examinations", "The RISE timeline lists the establishment of the National Organization for Examinations under the Ministry of Education in 1997.", "assessment_governance", ["SRC-P2-RISE-TIMELINE-001"], "medium", "Do not assume the organization retained the same name or mandate in later years."),
    ("1999", "Teacher career ladder revision", "The RISE timeline states that the teacher career ladder was revised in 1999, adding two more levels.", "teacher_development", ["SRC-P2-RISE-TIMELINE-001"], "medium", "Historical career structure."),
    ("2000", "National Learning Assessment", "The RISE timeline lists the introduction of National Learning Assessment at the end of each cycle in 2000.", "learning_assessment", ["SRC-P2-RISE-TIMELINE-001"], "medium", "This is a historical introduction date; do not infer the current frequency or assessment framework."),
    ("2002", "Education and Training Policy implementation review", "The Ministry of Education published a document titled The Education and Training Policy and Its Implementation in 2002, which discusses policy background and implementation.", "policy_implementation", ["SRC-P2-RISE-2023-001"], "medium", "Use the full publication for detailed claims; a catalog entry alone is not enough for detailed quotation."),
    ("2002", "Second ESDP cycle", "The RISE timeline lists a second education-sector development plan in 2002 as part of the sequence of multiyear sector plans.", "sector_planning", ["SRC-P2-RISE-TIMELINE-001"], "medium", "Exact fiscal-year boundaries and formal plan title should be verified in the primary document."),
    ("2003", "Teacher Education System Overhaul", "The RISE timeline lists the Teacher Education System Overhaul (TESO) in 2003.", "teacher_development", ["SRC-P2-RISE-TIMELINE-001"], "medium", "Historical reform label; implementation and results require separate evidence."),
    ("2006", "Later ESDP cycle", "The RISE timeline lists another education-sector development plan in 2006.", "sector_planning", ["SRC-P2-RISE-TIMELINE-001"], "medium", "The timeline gives a milestone year; consult the official plan for period and targets."),
    ("2009", "Postgraduate Diploma in Teaching", "The RISE timeline lists the Postgraduate Diploma in Teaching (PGDT) in 2009.", "teacher_development", ["SRC-P2-RISE-TIMELINE-001"], "medium", "Historical introduction date; current teacher qualification requirements may differ."),
    ("2010", "Early Grade Reading Assessment", "The RISE timeline lists the introduction of Early Grade Reading Assessment (EGRA) in 2010.", "learning_assessment", ["SRC-P2-RISE-TIMELINE-001"], "medium", "Do not infer current coverage or continued use without newer sources."),
    ("2011", "Later ESDP cycle", "The RISE timeline lists an education-sector development plan milestone in 2011.", "sector_planning", ["SRC-P2-RISE-TIMELINE-001"], "medium", "Verify formal plan name and implementation period in the primary document."),
    ("2012", "NEAEA established/re-established", "The RISE timeline says the National Organization for Examinations was re-established as the National Educational Assessment and Examination Agency (NEAEA) in 2012.", "assessment_governance", ["SRC-P2-RISE-TIMELINE-001"], "medium", "Historical agency naming; current agency structure and responsibilities must be checked separately."),
    ("2015/16–2019/20", "ESDP V planning period", "The official ESDP V document identifies itself as the fifth medium-term plan for educational development covering 2015/16 to 2019/20.", "sector_planning", ["SRC-P2-ESDP-V-001"], "high", "This is a past planning period, not a current plan."),
    ("2020/21–2024/25", "ESDP VI planning period", "The official ESDP VI document states a planning period of 2020/21 to 2024/25 and links implementation to federal and regional plans, monitoring, baselines, targets, and evaluation.", "sector_planning", ["SRC-P2-ESDP-VI-001"], "high", "The plan period has ended; current status and successor plan require new official evidence."),
    ("2025-04-10", "General Education Proclamation No. 1368/2025", "The Ministry of Justice lists General Education Proclamation No. 1368/2025 dated 10 April 2025 and marks it as in force. Its preamble discusses quality, accessibility, equity, and decentralized education management.", "legal_framework", ["SRC-P2-GENED-PROC-1368-2025-001"], "high", "Read the full law and check for later amendments before making legal claims."),
]

PHASE2_EXTRA = [
    ("period_1941_1974", "Imperial period overview", "Research on educational reform organizes 1941–1974 as the imperial period in its historical analysis. During this period, modern schools, teacher training, national examinations, curriculum structures, and education-sector planning developed. These developments occurred in a context of limited access to formal education.", ["SRC-P2-RISE-2023-001", "SRC-P2-RISE-TIMELINE-001"], "medium"),
    ("period_1974_1991", "Derg period overview", "Research on educational reform treats 1974–1991 as the Derg period. Education policy during this era included increased state control, literacy campaigns, and reforms shaped by the government's political and economic orientation. The effect of any individual policy should be evaluated using specific evidence rather than inferred from the period label alone.", ["SRC-P2-RISE-2023-001", "SRC-P2-RISE-TIMELINE-001"], "medium"),
    ("period_post1991", "Post-1991 policy transition", "After the 1991 political transition, the government developed a new education-policy direction. The 1994 Education and Training Policy became a key framework for subsequent education-sector planning and reform.", ["SRC-P2-RISE-2023-001", "SRC-P2-ETP-1994-001"], "high"),
    ("why_1994_policy_matters", "Why the 1994 policy matters", "The 1994 Education and Training Policy is a central historical reference because it connected education objectives with curriculum, teacher education, language, assessment, management, finance, and coordination between education, training, and research.", ["SRC-P2-ETP-1994-001", "SRC-P2-UNHCR-RIMAP-2023-001"], "high"),
    ("esdp_approach", "Why sector development programmes matter", "Education Sector Development Programmes use multiyear planning to connect policy objectives with activities, budgets, institutional responsibilities, monitoring, and evaluation. The ESDP VI document describes planning at federal and regional levels and annual adjustment based on measured progress.", ["SRC-P2-ESDP-V-001", "SRC-P2-ESDP-VI-001"], "high"),
    ("baseline_target", "Baselines and targets", "ESDP VI explains that a baseline describes the initial condition against which later progress is assessed. Targets should be interpreted together with their indicator definitions, reference year, target year, and data limitations.", ["SRC-P2-ESDP-VI-001"], "high"),
    ("monitoring_evaluation", "Monitoring and evaluation", "ESDP VI describes monitoring through key performance indicators, periodic reviews, supervision, thematic studies, and evaluation. Its purpose includes accountability, learning, and improving implementation.", ["SRC-P2-ESDP-VI-001"], "high"),
    ("timeline_source_caution", "Caution when using historical timelines", "A timeline is useful for retrieval, but it compresses complex events. For a detailed answer about a law, examination agency, ministerial appointment, or programme result, retrieve the primary legal text, ministry report, or institutional history as well.", ["SRC-P2-RISE-TIMELINE-001", "SRC-P2-BOARDING-HISTORY-001"], "high"),
    ("minister_list_caution", "Caution about historical ministers", "The Ministry of Education's related boarding-schools portal contains a history page with minister names, but some date ranges appear internally inconsistent. Do not use that page alone to generate a definitive chronology of ministers; cross-check appointment records and official biographies.", ["SRC-P2-BOARDING-HISTORY-001"], "high"),
    ("policy_status_caution", "Policy status versus policy history", "A policy can remain historically influential even if later policy documents or laws change the current framework. The RAG system should distinguish historical significance from current legal force.", ["SRC-P2-ETP-1994-001", "SRC-P2-GENED-PROC-1368-2025-001"], "high"),
    ("reform_outcome_caution", "Do not infer reform success from launch date", "The launch of a reform or programme does not prove it achieved its intended outcomes. Claims about learning improvement, enrollment, equity, or efficiency require outcome data with defined measures and reporting periods.", ["SRC-P2-RISE-2023-001", "SRC-P2-ESDP-VI-001"], "high"),
    ("history_phase_boundary", "Scope of Phase 2", "Phase 2 records historical milestones and the evolution of education policy and administration. Current office structure belongs mainly to Phase 4 or Phase 5; detailed legal interpretation belongs to Phase 3; current statistics belong to a dated statistical dataset.", ["SRC-P2-RISE-2023-001", "SRC-P2-GENED-PROC-1368-2025-001"], "high"),
]

def get_all_moe_records() -> List[Dict[str, Any]]:
    """Compiles all Phase 1 and Phase 2 items into normalized retrieval records."""
    records = []

    # Phase 1 records
    for i, (category, key, title, content, src_keys, confidence, topic) in enumerate(PHASE1_ITEMS, 1):
        src_ids = [PHASE1_SOURCES[s]["source_id"] for s in src_keys if s in PHASE1_SOURCES]
        src_urls = [PHASE1_SOURCES[s].get("url", "") for s in src_keys if s in PHASE1_SOURCES]
        records.append({
            "id": f"MOE-P1-{i:03d}",
            "phase": 1,
            "title": title,
            "category": category,
            "topic": topic,
            "content": content,
            "source_ids": src_ids,
            "source_urls": src_urls,
            "confidence": confidence,
            "date": "2026-10-23",
            "type": "institutional_profile"
        })

    # Phase 2 records
    for j, (event_date, title, content, category, source_ids, confidence, caveat) in enumerate(PHASE2_EVENTS, 1):
        records.append({
            "id": f"MOE-P2-{j:03d}",
            "phase": 2,
            "title": title,
            "category": category,
            "topic": "education_milestone",
            "content": f"{content} (Milestone Date: {event_date}). Caveat: {caveat}",
            "source_ids": source_ids,
            "source_urls": ["https://www.moe.gov.et/", "https://justice.gov.et/en/law/general-education-proclamation-no-1368-2025/"],
            "confidence": confidence,
            "date": event_date,
            "type": "historical_milestone"
        })

    # Phase 2 extra records
    for k, (key, title, content, source_ids, confidence) in enumerate(PHASE2_EXTRA, len(PHASE2_EVENTS) + 1):
        records.append({
            "id": f"MOE-P2-EX-{k:03d}",
            "phase": 2,
            "title": title,
            "category": "historical_analysis",
            "topic": key,
            "content": content,
            "source_ids": source_ids,
            "source_urls": ["https://www.moe.gov.et/", "https://justice.gov.et/en/sector/education-training/"],
            "confidence": confidence,
            "date": "2026-10-23",
            "type": "educational_policy_analysis"
        })

    return records
