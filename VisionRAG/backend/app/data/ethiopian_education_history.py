"""
Comprehensive Academic & Historical Archive: History of Ethiopian Education.
Spanning Indigenous Church Education, Traditional Islamic Madrasas, Early Modern Schools,
University College of Addis Ababa, and Modern STEM & University Expansion.
"""

from typing import List, Dict, Any

ETHIOPIAN_EDUCATION_RECORDS: List[Dict[str, Any]] = [
    {
        "id": "edu_eth_001",
        "title": "Indigenous Church Education: The Nebab Bet (School of Reading)",
        "period": "4th Century CE – Present",
        "category": "Traditional Indigenous Education",
        "location": "Highland Ethiopia (Axum, Lalibela, Gondar, Debre Damo)",
        "summary": "The foundational primary stage of Ethiopian traditional church education where children master the Fidel syllabary and phonetic reading of Ge'ez scriptures.",
        "content": (
            "Nebab Bet (House of Reading) is the primary school of traditional Ethiopian Orthodox Tewahedo Church education. "
            "Originating following the introduction of Christianity to the Kingdom of Axum in the 4th century CE under King Ezana and Abba Salama (Frumentius), "
            "Nebab Bet begins with learning the Ge'ez syllabary (Fidel), which comprises over 200 distinct syllabic characters. "
            "Curriculum progression includes: "
            "1. Fidel Hawaria (learning the letters and sounds), "
            "2. Melikte Hawariat (Epistles of the Apostles), "
            "3. Wengel (The Gospels), "
            "4. Dawit (The Psalms of David), which represents the capstone graduation text. "
            "Mastering the Psalms of David signified functional literacy in ancient and medieval Ethiopia, providing the essential foundation for state scribes, chroniclers, and ecclesiastical scholars."
        ),
        "key_figures": ["Saint Frumentius (Abba Salama Kasate Berhan)", "King Ezana of Axum"],
        "metadata": {
            "system": "Traditional Ecclesiastical",
            "language": "Ge'ez",
            "tier": "Primary Foundation",
            "cultural_significance": "Pioneered indigenous phonetic literacy across the Horn of Africa for over 1,600 years."
        }
    },
    {
        "id": "edu_eth_002",
        "title": "Liturgical Music and Hymnody: The Zema Bet of Saint Yared",
        "period": "6th Century CE – Present",
        "category": "Higher Traditional Ecclesiastical Arts",
        "location": "Axum (Bethlehem, Gondar, Wadla Delanta)",
        "summary": "Advanced music academy teaching the indigenous 3-mode musical notation system created by 6th-century Ethiopian composer Saint Yared.",
        "content": (
            "Zema Bet (House of Music) is the center of liturgical music, poetry chanting, and sacred dance (Aqqawaqam). "
            "In the 6th century CE, the Ethiopian polymath, poet, and composer Saint Yared invented an indigenous system of musical notation "
            "composed of ten signs (Seraye) and structured into three primary melodic modes: "
            "1. Ge'ez (simple, plain chant representing the Father), "
            "2. Ezel (solemn, slow, deep chant representing the Son), and "
            "3. Araray (joyful, expressive chant representing the Holy Spirit). "
            "Students train for 4 to 8 years committing monumental liturgical volumes to memory: the Deggwa (Great Antiphonary), "
            "Tsome Deggwa (Lenten Antiphonary), Me'eraf, Zimare, and Mewasit. "
            "Accompanied by the Senasel (sistrum), Kebero (drum), and Meqomiya (prayer staff), this system constitutes one of the oldest living indigenous musical notation traditions in world history."
        ),
        "key_figures": ["Saint Yared (505–571 CE)", "Emperor Gebre Mesqel"],
        "metadata": {
            "system": "Liturgical Musicology",
            "modes": ["Ge'ez", "Ezel", "Araray"],
            "tier": "Post-Primary Advanced",
            "accreditation": "Yaredian Hymnologist (Meri-Geta)"
        }
    },
    {
        "id": "edu_eth_003",
        "title": "The Qene Bet: Wax and Gold Poetry, Semantics, and Philosophical Rhetoric",
        "period": "Medieval Period – Present (Flourished under Saint Yohannes of Geblen & Emperor Zer'a Ya'eqob)",
        "category": "Classical Literature & Rhetoric",
        "location": "Wadla Delanta, Gondar, Gojjam (Washera), Wollo",
        "summary": "Advanced school of classical poetry, critical linguistics, and philosophical debate utilizing the Sem-enna-Worq (Wax and Gold) dual-meaning literary technique.",
        "content": (
            "The Qene Bet represents the pinnacle of intellectual rhetoric and critical thinking in traditional Ethiopian scholarship. "
            "Students study classical Ge'ez grammar (Sewasew) and master the art of spontaneous composition across complex metrical verse forms "
            "(such as Gubae Qana, Ze-Amlakiye, Mibezu, Selast, Mewedis, and Kebre Ye'eti). "
            "The hallmark of Qene is 'Sem-enna-Worq' (Wax and Gold): "
            "- The Wax (Sem): The apparent, superficial literal meaning of the poem. "
            "- The Gold (Worq): The hidden, sublime philosophical, political, theological, or satirical truth veiled beneath the wax. "
            "Famous centers like Washera in Gojjam and schools in Gondar produced renowned philosophers including Zera Yacob (1599–1692), "
            "author of the 'Hatata' (Inquiry), whose rationalist philosophy preceded René Descartes' meditations on reason and universal ethics."
        ),
        "key_figures": ["Zera Yacob the Philosopher", "Emperor Zer'a Ya'eqob", "Yohannes of Geblen"],
        "metadata": {
            "literary_form": "Sem-enna-Worq (Wax and Gold)",
            "tier": "Philosophical & Literary Masters",
            "philosophical_treatises": ["Hatata Zera Yacob", "Fetha Negest", "Kebre Negest"]
        }
    },
    {
        "id": "edu_eth_004",
        "title": "The Metsahaf Bet: Canonical Law, Jurisprudence, and Exegesis",
        "period": "14th Century – Present",
        "category": "Higher Theological & Jurisprudential Studies",
        "location": "Debre Libanos, Gondar, Lake Tana Monasteries",
        "summary": "University-equivalent academy where scholars interpret biblical scriptures, legal codes (Fetha Negest), royal chronicles, and historical commentaries.",
        "content": (
            "The Metsahaf Bet (House of Books) corresponds to the highest collegiate faculty of traditional Ethiopian scholarship. "
            "It is divided into four major departments: "
            "1. Beluy (Old Testament exegesis and linguistic commentary), "
            "2. Haddis (New Testament interpretation), "
            "3. Liqawunt (Theology, Patristic literature, and writings of the Church Fathers like Saint John Chrysostom and Cyril of Alexandria), and "
            "4. Menekosat (Monastic ascetic literature, canon law, and civil jurisprudence). "
            "A core text taught was the 'Fetha Negest' (The Law of the Kings), compiled by Ibn al-Assal and translated into Ge'ez, "
            "which served as the constitutional and criminal legal code of the Ethiopian Empire for centuries until the modern legal reforms of the 20th century."
        ),
        "key_figures": ["Abba Gorgorios (scholar who collaborated with Hiob Ludolf)", "Petros VI", "Abba Tekle Haymanot"],
        "metadata": {
            "tier": "Ecclesiastical Doctoral Level (Liqe)",
            "jurisprudence": "Fetha Negest (Law of the Kings)",
            "significance": "Preserved centuries of civil code, historical chronicles, and astronomical calendars (Bahre Hasab)."
        }
    },
    {
        "id": "edu_eth_005",
        "title": "Traditional Islamic Education: The Madrasas of Harar Jugol and Wollo",
        "period": "7th Century CE (Hijra) – Present",
        "category": "Islamic Scholarship & Jurisprudence",
        "location": "Harar Jugol (UNESCO World Heritage), Wollo, Jimma, Gurage",
        "summary": "Comprehensive Islamic educational network teaching Arabic calligraphy, Quranic memorization, Hadith, Sharia jurisprudence, and regional literature.",
        "content": (
            "Islam arrived in Ethiopia during the First Hijra (615 CE), when the companions of Prophet Muhammad were welcomed by the Axumite Christian King Negash (Armah). "
            "Over subsequent centuries, Harar Jugol developed into the fourth holy city of Islam and the foremost intellectual center of Islamic learning in East Africa. "
            "The traditional Islamic educational ladder comprises: "
            "1. Quranic School (Tahfiz / reading and memorizing the holy Quran), "
            "2. Nahw and Sarf (Arabic grammar, syntax, and morphology), "
            "3. Fiqh and Sharia (Islamic jurisprudence, largely following the Shafi'i and Hanafi legal schools), "
            "4. Tasawwuf and Hadith (Sufi spiritual philosophy and prophetic traditions). "
            "Harari scholars produced hundreds of illuminated manuscripts in Harari and Arabic, developing localized script adaptations (Ajami) "
            "and maintaining extensive intellectual trade links across the Red Sea and Indian Ocean."
        ),
        "key_figures": ["Emir Nur ibn Mujahid", "Sheikh Abadir Umar ar-Rida", "King Negash (Armah) of Axum"],
        "metadata": {
            "system": "Islamic Classical Academy",
            "languages": ["Arabic", "Harari", "Oromo (Afaan Oromo)", "Amharic"],
            "legal_tradition": "Shafi'i Jurisprudence",
            "heritage_status": "Harar Jugol UNESCO World Heritage Site"
        }
    },
    {
        "id": "edu_eth_006",
        "title": "Birth of Modern Education: Menelik II School (1908)",
        "period": "1908 – 1925",
        "category": "Modern Public Education",
        "location": "Addis Ababa, Arat Kilo",
        "summary": "Emperor Menelik II founds Ethiopia's first modern state school, introducing foreign languages, mathematics, and natural sciences.",
        "content": (
            "Recognizing the imperative of modernization and diplomacy in the aftermath of the Battle of Adwa (1896), "
            "Emperor Menelik II issued an imperial edict establishing the Menelik II School in Addis Ababa in October 1908. "
            "Constructed near the Grand Palace and Arat Kilo, the school recruited experienced Egyptian Coptic educators and European instructors. "
            "The initial curriculum emphasized foreign diplomatic languages (French, English, Italian, and Arabic), alongside arithmetic, "
            "geography, world history, and sports. "
            "The establishment of Menelik II School marked the official inception of state-sponsored secular schooling in Ethiopia, "
            "laying the groundwork for a modern civil service, diplomatic corps, and administrative bureaucracy."
        ),
        "key_figures": ["Emperor Menelik II", "Empress Taytu Betul", "Fitawrari Habte Giyorgis Dinagde"],
        "metadata": {
            "milestone": "First Modern State School in Ethiopia",
            "year_founded": 1908,
            "curriculum": ["French", "English", "Arithmetic", "Sciences", "Amharic"],
            "legacy": "Paved the way for modern civil administration."
        }
    },
    {
        "id": "edu_eth_007",
        "title": "Teferi Mekonnen School (1925) and Empress Menen Girls' School (1931)",
        "period": "1925 – 1935",
        "category": "Modern Pre-War Secondary Education",
        "location": "Addis Ababa",
        "summary": "Modern progressive schools founded by Ras Teferi (Haile Selassie I) and Empress Menen Asfaw, introducing systematic female education.",
        "content": (
            "In April 1925, Regent Ras Teferi Mekonnen (later Emperor Haile Selassie I) established the Teferi Mekonnen School. "
            "Equipped with modern science laboratories, an extensive library, and French-medium instruction, the school selected top students from across the provinces. "
            "Recognizing that national modernization required equal participation of women, Empress Menen Asfaw established the Empress Menen Girls' School in 1931, "
            "the first modern boarding secondary school for female students in Ethiopia. "
            "Curricula covered nursing, domestic science, literature, physical education, and humanities. "
            "Many alumni were sent on imperial scholarships to universities in Oxford, Cambridge, Sorbonne, and the United States, forming the vanguard of Ethiopia's pre-war intellectual elite."
        ),
        "key_figures": ["Emperor Haile Selassie I", "Empress Menen Asfaw", "Dr. Workneh Martin"],
        "metadata": {
            "institutions": ["Teferi Mekonnen School (1925)", "Empress Menen Girls' School (1931)"],
            "gender_equality": "First formal state female secondary education in Ethiopia",
            "international_scholarships": "Pioneered overseas graduate study missions."
        }
    },
    {
        "id": "edu_eth_008",
        "title": "The Founding of Higher Education: University College of Addis Ababa (1950) to AAU",
        "period": "1950 – 1974",
        "category": "Higher Education & University Foundation",
        "location": "Addis Ababa (Sidist Kilo, Arat Kilo)",
        "summary": "Establishment of the University College of Addis Ababa (UCAA), which expanded into Haile Selassie I University (HSIU) in 1961, today Addis Ababa University (AAU).",
        "content": (
            "Following the liberation of Ethiopia in 1941, Emperor Haile Selassie prioritized higher education institution-building. "
            "In 1950, the University College of Addis Ababa (UCAA) was inaugurated with Canadian Jesuit scholar Dr. Lucien Matte serving as its first president. "
            "In 1961, Emperor Haile Selassie donated his imperial Guenete Leul Palace at Sidist Kilo to serve as the main university campus, "
            "formally chartering Haile Selassie I University (HSIU). "
            "The university integrated multiple specialized colleges across the nation: "
            "- The Imperial College of Engineering (1953), "
            "- The Imperial College of Agriculture and Mechanical Arts at Alemaya (1954, in collaboration with Oklahoma State University), "
            "- The Gondar College of Public Health and Training Center (1954, partnering with WHO and UNICEF), "
            "- The Building College (Ethio-Swedish Institute of Building Technology, 1954). "
            "Renamed Addis Ababa University (AAU) after 1974, it remains Ethiopia's flagship research university, producing generations of medical doctors, engineers, historians, and statesmen."
        ),
        "key_figures": ["Dr. Lucien Matte", "Emperor Haile Selassie I", "Professor Aklilu Lemma (discoverer of Endod schistosomiasis cure)", "Professor Richard Pankhurst"],
        "metadata": {
            "flagship_university": "Addis Ababa University (AAU)",
            "campus_landmark": "Guenete Leul Palace (Sidist Kilo)",
            "year_chartered": 1961,
            "affiliated_institutes": ["Institute of Ethiopian Studies (IES)", "Alemaya Agriculture", "Gondar Public Health"]
        }
    },
    {
        "id": "edu_eth_009",
        "title": "The National Literacy Campaign (Edget Behibret) & Derg Education Reforms",
        "period": "1974 – 1991",
        "category": "Mass Public Literacy & Vocational Education",
        "location": "National Nationwide Mobilization",
        "summary": "Nationwide mobilization sending tens of thousands of university students to rural Ethiopia, driving adult literacy up from under 10% to over 60%.",
        "content": (
            "In 1974–1975, the provisional government launched the 'Edget Behibret' (Development Through Cooperation) campaign, "
            "mobilizing over 60,000 secondary and university students to remote rural kebeles across Ethiopia. "
            "In 1979, the National Literacy Campaign (NLC) was formally inaugurated, printing instructional materials in 15 indigenous Ethiopian languages "
            "(including Amharic, Afaan Oromo, Tigrinya, Wolaytta, Somali, and Sidama). "
            "The campaign achieved massive reductions in illiteracy, particularly among rural women and agrarian communities, "
            "earning Ethiopia the prestigious UNESCO Nadezhda K. Krupskaya Literacy Prize in 1980. "
            "Curriculum policies shifted toward polytechnic training, agricultural technical skills, and Marxist-Leninist political economy."
        ),
        "key_figures": ["UNESCO International Literacy Jury", "Campaign Student Cadres"],
        "metadata": {
            "literacy_gain": "From ~7% (1974) to over 60% (1985)",
            "languages_published": "15 Ethiopian languages",
            "international_awards": ["UNESCO Krupskaya Literacy Award 1980"]
        }
    },
    {
        "id": "edu_eth_010",
        "title": "Modern Higher Education Expansion & STEM Revolution (1991 – Present)",
        "period": "1991 – Present",
        "category": "Contemporary Higher Education & Technology",
        "location": "All Regional States of Ethiopia",
        "summary": "Massive tertiary expansion from 2 public universities to over 50 autonomous universities, the 70:30 STEM policy, and digital transformation.",
        "content": (
            "In the early 1990s, Ethiopia had only two universities (AAU and Alemaya) with an annual tertiary intake under 5,000 students. "
            "Beginning in the late 1990s and 2000s, the Ministry of Education executed a historic infrastructure expansion: "
            "1. First Generation Universities: AAU, Jimma, Bahir Dar, Hawassa, Mekelle, Gondar, Arba Minch, Haramaya. "
            "2. Second & Third Generation: Adama Science and Technology University (ASTU), Addis Ababa Science and Technology University (AASTU), Wachemo, Wolaita Sodo, Jigjiga, Semera, Assosa, Gambella, and Dire Dawa. "
            "3. The 70:30 STEM Ratio: Mandated that 70% of public university enrollment be channeled into Science, Technology, Engineering, and Mathematics (STEM) and agriculture, with 30% in social sciences and humanities. "
            "4. Institutional Autonomy & Digital Campuses: In 2023, AAU was granted autonomous university charter status, spearheading research in artificial intelligence, biotechnology, satellite remote sensing (Ethiopia's ETRSS-1 satellite launch), and renewable engineering (GERD hydrological modeling)."
        ),
        "key_figures": ["Ministry of Education", "AAU Academic Senate", "ASTU & AASTU Research Centers"],
        "metadata": {
            "university_count": "50+ Public Universities across Ethiopia",
            "policy": "70:30 STEM to Humanities National Ratio",
            "recent_milestone": "AAU Autonomous Charter Status (2023)"
        }
    }
]
