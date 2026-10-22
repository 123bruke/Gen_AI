"""
Comprehensive Academic & Scientific Biological Archive: Ethiopian Biodiversity, Endemic Species,
Botanical Genomics, and Horn of Africa Ecosystems.
Covers Endemic Mammals, Avifauna, Coffea Arabica Genetics, Teff, Enset, and Afro-alpine Biomes.
"""

from typing import List, Dict, Any

ETHIOPIAN_BIOLOGY_RECORDS: List[Dict[str, Any]] = [
    {
        "id": "bio_eth_001",
        "scientific_name": "Capra walie",
        "common_name": "Walia Ibex",
        "taxonomic_class": "Mammalia (Order Artiodactyla, Family Bovidae)",
        "conservation_status": "Vulnerable (IUCN Red List; formerly Critically Endangered)",
        "habitat": "Simien Mountains National Park (Precipitous cliff faces, 2,500m – 4,500m ASL)",
        "summary": "Iconic wild goat species endemic exclusively to the high cliff edges and rocky escarpments of the Simien Mountains of northern Ethiopia.",
        "description": (
            "The Walia Ibex (Capra walie) is a large, sure-footed caprid endemic solely to the Simien Mountains of Ethiopia. "
            "Males possess massive, backwards-curving horns that can reach up to 110 cm (43 inches) in length, used in ritualized head-butting clashes during the breeding season. "
            "They exhibit specialized physiological adaptations for survival at extreme altitudes, including high hemoglobin oxygen affinity and muscular cloven hooves with flexible inner pads "
            "that grip sheer basalt crags and vertical precipices. "
            "Once depleted to fewer than 200 individuals due to habitat encroachment, aggressive community-led conservation in Simien Mountains National Park "
            "has rebounded the population to over 900 individuals. "
            "Diet consists primarily of high-altitude grasses, lichens, herbs, and shrubs such as Giant Heather (Erica arborea) and Hypericum revolutum."
        ),
        "diet": "Herbivorous (highland grasses, Erica heather, herbs, shrubs)",
        "coordinates": "13.1833° N, 38.0667° E (Simien Mountains)",
        "metadata": {
            "endemic": True,
            "national_symbol": "National fauna emblem of Ethiopia",
            "protected_area": "Simien Mountains National Park (UNESCO World Heritage Site)"
        }
    },
    {
        "id": "bio_eth_002",
        "scientific_name": "Canis simensis",
        "common_name": "Ethiopian Wolf (Simien Jackal / Red Fox of Abyssinia)",
        "taxonomic_class": "Mammalia (Order Carnivora, Family Canidae)",
        "conservation_status": "Endangered (IUCN Red List; fewer than 500 mature adults remain)",
        "habitat": "Afro-alpine moorlands (Bale Mountains, Simien, Guassa, Arsi, Wollo >3,000m ASL)",
        "summary": "Africa's most endangered carnivore and the only wolf species native to the African continent, specialized for hunting alpine rodents.",
        "description": (
            "The Ethiopian Wolf (Canis simensis) is a slender, long-legged canid characterized by a vivid tawny red coat, white markings on the chest and throat, and a bushy black-tipped tail. "
            "Unlike grey wolves, which hunt large ungulates in packs, Canis simensis is an extreme specialist predator of subterranean rodents, "
            "primarily hunting the Giant Mole-rat (Tachyoryctes macrocephalus) and Grass Rats (Arvicanthis blicki) in the treeless Afro-alpine plateau. "
            "They live in cohesive territorial packs of 3 to 13 adults led by an alpha breeding pair, but hunt solitarily during daytime. "
            "The largest remaining population resides on the Sanetti Plateau in the Bale Mountains National Park (>4,000m ASL). "
            "Major threats include rabies and canine distemper transmitted from domestic dogs, habitat fragmentation by agriculture, and roadkill."
        ),
        "diet": "Carnivorous specialist (Giant Mole-rat Tachyoryctes macrocephalus, African Grass Rats)",
        "coordinates": "6.8711° N, 39.7744° E (Bale Mountains Sanetti Plateau)",
        "metadata": {
            "endemic": True,
            "specialization": "Afro-alpine rodent hunter",
            "research_body": "Ethiopian Wolf Conservation Programme (EWCP, Oxford WildCRU)"
        }
    },
    {
        "id": "bio_eth_003",
        "scientific_name": "Tragelaphus buxtoni",
        "common_name": "Mountain Nyala",
        "taxonomic_class": "Mammalia (Order Artiodactyla, Family Bovidae)",
        "conservation_status": "Endangered (IUCN Red List)",
        "habitat": "Afromontane woodlands, Erica heath, and alpine grasslands of the southeastern Ethiopian Highlands (Bale Mountains and Arsi)",
        "summary": "Magnificent spiral-horned antelope endemic to the southeastern Ethiopian highlands, first described by science in 1910.",
        "description": (
            "The Mountain Nyala (Tragelaphus buxtoni) was the last large African ungulate discovered and classified by modern taxonomy (Major Ivor Buxton, 1910). "
            "Standing 130 cm at the shoulder, males weigh up to 300 kg and carry lyrical, open-spiral horns with ivory tips extending 80–120 cm. "
            "Their coat is grey-brown with a white chevron between the eyes, white throat patches, and faint vertical flank stripes. "
            "They inhabit the ecotone between montane Hagenia-Hypericum forests and sub-alpine Erica heath between 3,000m and 4,200m ASL. "
            "Ecologically, they act as seed dispersers and selective browsers on woody shrubs, Saint John's wort, and alpine composites. "
            "Key populations are conserved within the northern slopes of the Bale Mountains National Park and community hunting reserves in Munessa and Kaka."
        ),
        "diet": "Herbivorous browser (Hagenia foliage, Artemisia, Hypericum, wild herbs)",
        "coordinates": "7.0500° N, 39.9167° E (Bale Highlands)",
        "metadata": {
            "endemic": True,
            "first_cataloged": 1910,
            "flagship_species": "Bale Mountains National Park"
        }
    },
    {
        "id": "bio_eth_004",
        "scientific_name": "Theropithecus gelada",
        "common_name": "Gelada Baboon (Bleeding-Heart Monkey)",
        "taxonomic_class": "Mammalia (Order Primates, Family Cercopithecidae)",
        "conservation_status": "Least Concern (IUCN Red List; endemic to Ethiopian Highlands)",
        "habitat": "High-altitude montane grasslands (Simien Mountains, Guassa Menz, Wollo Highlands, 1,800m – 4,400m ASL)",
        "summary": "The only remaining graminivorous (grass-eating) primate in the world, renowned for complex vocal grammar and hourglass red chest patch.",
        "description": (
            "The Gelada (Theropithecus gelada) is a unique survivor of a once-widespread prehistoric primate genus. "
            "It is completely terrestrial during the day and represents the only living primate that is primarily graminivorous: "
            "up to 90% of its diet consists of fresh green grass blades, seeds, roots, and underground rhizomes. "
            "Their fingers have the highest opposability index among Old World monkeys, allowing dexterous plucking of individual grass shoots while seated. "
            "Both males and females possess a hairless, hourglass-shaped patch of bright red skin on the chest ('bleeding-heart monkey'), "
            "which turns brilliant crimson as a visual signal of sexual receptivity and dominance since their rear is concealed while seated. "
            "Geladas live in enormous multi-level societies of up to 1,200 individuals, communicating through complex vocalizations that mimic the cadence of human speech."
        ),
        "diet": "Graminivorous herbivore (90% green grass blades, subterranean tubers, rhizomes)",
        "coordinates": "13.2000° N, 38.1000° E (Simien Escarpment)",
        "metadata": {
            "endemic": True,
            "unique_trait": "Only living grass-grazing primate in existence",
            "social_structure": "Multi-tier fission-fusion modular bands"
        }
    },
    {
        "id": "bio_eth_005",
        "scientific_name": "Coffea arabica",
        "common_name": "Arabica Coffee (Wild Forest Coffee)",
        "taxonomic_class": "Plantae (Order Gentianales, Family Rubiaceae)",
        "conservation_status": "Wild forest populations Endangered (Genetic erosion due to climate shift)",
        "habitat": "Afromontane cloud forests of southwestern and southeastern Ethiopia (Kaffa, Sheka, Yayyu, Bench Maji, Jimma, Sidama, 1,200m – 2,100m ASL)",
        "summary": "The primary genetic center of origin and diversity for Arabica coffee, containing over 99% of global genetic variation in wild understory rainforests.",
        "description": (
            "Ethiopia is universally recognized by Vavilovian crop geneticists as the primary evolutionary center of origin and diversity for Coffea arabica. "
            "Unlike Coffea canephora (Robusta), which is diploid and cross-pollinating, Coffea arabica is an allotetraploid (2n = 4x = 44) species "
            "formed through natural ancestral hybridization between Coffea eugenioides and Coffea canephora in the Ethiopian highlands. "
            "The montane moist evergreen forests of Kaffa, Sheka (UNESCO Biosphere Reserve), Yayu, and Harenna shelter the world's only wild reservoir of Arabica germplasm, "
            "holding critical genes for drought resistance, low caffeine traits, and resistance to Coffee Berry Disease (Colletotrichum kahawae) and Leaf Rust (Hemileia vastatrix). "
            "Ethiopian specialty regional varieties include Yirgacheffe, Sidama, Harrar, Limu, Djimmah, and Gesha (Geisha), celebrated globally for intense floral and bergamot acidity."
        ),
        "genomic_profile": "Allotetraploid (2n = 44), 99% global gene pool in Ethiopian biosphere forests",
        "coordinates": "7.2833° N, 36.2333° E (Kaffa Biosphere Reserve)",
        "metadata": {
            "origin": "Primary center of origin of global coffee",
            "unesco_biospheres": ["Kaffa Biosphere Reserve", "Yayu Coffee Forest Reserve", "Sheka Biosphere Reserve"]
        }
    },
    {
        "id": "bio_eth_006",
        "scientific_name": "Eragrostis tef",
        "common_name": "Teff (Taf)",
        "taxonomic_class": "Plantae (Order Poales, Family Poaceae)",
        "conservation_status": "Cultivated Staple (Domesticated Endemic)",
        "habitat": "Highland agricultural plateaus (1,700m – 2,800m ASL throughout Ethiopia)",
        "summary": "Ancient nutrient-dense gluten-free cereal grain domesticated in Ethiopia over 4,000 years ago, forming the flour for traditional Injera.",
        "description": (
            "Teff (Eragrostis tef) is a minute C4 photosynthetic annual grass domesticated in Ethiopia between 4000 and 1000 BCE. "
            "It produces the smallest cultivated grain in the world: 150 grains of teff weigh approximately the same as a single grain of wheat. "
            "Teff flour is the foundational ingredient of Injera, the spongy, naturally fermented sourdough flatbread central to Ethiopian culinary tradition, "
            "fermented over 3 to 4 days using a symbiotic wild yeast and lactic acid bacteria starter (Ersho). "
            "Nutritionally, teff is naturally gluten-free, boasts an exceptionally low glycemic index, and is rich in prebiotic dietary fiber, "
            "iron, calcium, magnesium, zinc, and essential amino acids (including high lysine levels lacking in other cereals). "
            "Major cultivated market varieties include Magna (super-white), Nech (white), and Sergegna/Qey (brown/red teff, highest in iron and polyphenols)."
        ),
        "nutritional_attributes": "Gluten-free, high iron, complete amino acid profile, low GI",
        "coordinates": "9.0000° N, 38.7000° E (Ethiopian Central Plateau)",
        "metadata": {
            "domestication": "Ethiopian center of agricultural domestication",
            "culinary_role": "Primary grain of fermented Injera flatbread",
            "global_superfood": "Rapidly growing international organic superfood demand"
        }
    },
    {
        "id": "bio_eth_007",
        "scientific_name": "Ensete ventricosum",
        "common_name": "Enset (False Banana / 'The Tree Against Hunger')",
        "taxonomic_class": "Plantae (Order Zingiberales, Family Musaceae)",
        "conservation_status": "Cultivated & Wild (Key food security perennial)",
        "habitat": "Southern and Southwestern Ethiopian Highlands (Gurage, Sidama, Wolaytta, Gedeo, Kaffa, 1,600m – 3,000m ASL)",
        "summary": "Giant monocarpic perennial herb feeding over 20 million Ethiopians, celebrated for extreme drought resistance and soil conservation.",
        "description": (
            "Enset (Ensete ventricosum), commonly known as the 'False Banana', resembles a massive banana tree but produces unpalatable seeds instead of edible fruit. "
            "Instead, the edible yield is harvested from the colossal subterranean corm (stem base) and the pseudostem leaf sheaths. "
            "Processing involves pulverizing the pseudostem pulp and fermenting the mass in underground pits with starter cultures (Gammama) "
            "for months or years to yield 'Kocho' (fermented solid carbohydrate), 'Bulla' (water-soluble refined starch), and 'Amicho' (boiled fresh corm). "
            "Enset is hailed by agronomists as 'The Tree Against Hunger' because it is drought-resilient, can be harvested at any month of the year regardless of rain failure, "
            "and supports the highest population densities in sub-Saharan Africa on small landholdings while conserving montane topsoil."
        ),
        "products": "Kocho (fermented bread dough), Bulla (porridge starch), Amicho (root vegetable), Fiber",
        "coordinates": "6.8333° N, 38.4500° E (Southern Highlands)",
        "metadata": {
            "food_security": "Sustains over 20 million people in southern Ethiopia",
            "resilience": "Survives multiple years of severe drought without irrigation"
        }
    },
    {
        "id": "bio_eth_008",
        "scientific_name": "Tauraco ruspolii",
        "common_name": "Prince Ruspoli's Turaco",
        "taxonomic_class": "Aves (Order Musophagiformes, Family Musophagidae)",
        "conservation_status": "Vulnerable (IUCN Red List; restricted range endemic)",
        "habitat": "Southern Ethiopian juniper-acacia woodlands around Genale River, Neghele Borana, and Shakiso (1,400m – 1,900m ASL)",
        "summary": "Spectacularly colored endemic bird discovered in 1892, with vibrant emerald green plumage, crimson flight feathers, and a white crest.",
        "description": (
            "Prince Ruspoli's Turaco (Tauraco ruspolii) is one of Africa's most visually striking endemic birds. "
            "Discovered by Italian explorer Prince Eugenio Ruspoli in 1892 (who was subsequently killed by an elephant before revealing the collection locality), "
            "the bird remained a biological enigma for over 50 years until rediscovered near Neghele Borana in the 1940s. "
            "It features a silky white crest, crimson primary wing feathers colored by the unique copper-based pigment turacin, and brilliant olive-green body plumage. "
            "It lives in pairs or small family groups feeding primarily on the fruits of Juniperus procera (African pencil cedar), Ficus figs, and Podocarpus falcatus trees. "
            "Conservation depends heavily on protecting remaining old-growth juniper woodlands from commercial logging and forest fires."
        ),
        "diet": "Frugivorous (wild figs, Juniperus procera berries, Podocarpus seeds)",
        "coordinates": "5.3333° N, 39.5833° E (Neghele Borana)",
        "metadata": {
            "endemic": True,
            "pigmentation": "Features true red turacin pigment exclusive to turacos",
            "threat": "Habitat loss from cedar deforestation"
        }
    },
    {
        "id": "bio_eth_009",
        "scientific_name": "Hagenia abyssinica",
        "common_name": "Kosso Tree",
        "taxonomic_class": "Plantae (Order Rosales, Family Rosaceae)",
        "conservation_status": "Near Threatened (Afromontane forest timber pressure)",
        "habitat": "Upper montane forest zones (2,450m – 3,250m ASL across the Ethiopian Highlands)",
        "summary": "Indigenous medicinal hardwood whose female flowers were universally utilized in historic Ethiopia as a natural anti-helminthic tapeworm remedy.",
        "description": (
            "Hagenia abyssinica (Kosso) is a magnificent dioecious Afromontane tree growing up to 25 meters tall with peeling reddish-brown bark and massive compound pinnate leaves. "
            "In traditional Ethiopian medicine, dried female inflorescences (yielding bright red drooping panicles) were brewed into a medicinal infusion "
            "taken every two months across highland society as an infallible taenifuge (tapeworm remedy) to expel Taenia saginata acquired from raw beef consumption (Kitfo and Tere Siga). "
            "The active pharmaceutical compound, kosotoxin (a phloroglucinol derivative), acts as a potent vermifuge. "
            "Ecologically, Kosso stabilizes steep highland watersheds, enriches volcanic soils through rapid leaf litter nitrogen decomposition, "
            "and provides critical nesting canopy for endemic highland birds and orchids."
        ),
        "pharmacology": "Kosotoxin (natural phloroglucinol tapeworm vermifuge)",
        "coordinates": "11.6000° N, 37.3833° E (Afromontane canopy)",
        "metadata": {
            "ethnomedicine": "Historical staple anti-tapeworm medicine of Ethiopia",
            "ecological_role": "Highland water catchment stabilization"
        }
    },
    {
        "id": "bio_eth_010",
        "scientific_name": "Phytolacca dodecandra",
        "common_name": "Endod (African Soapberry)",
        "taxonomic_class": "Plantae (Order Caryophyllales, Family Phytolaccaceae)",
        "conservation_status": "Common native scrambling shrub",
        "habitat": "Riverbanks, forest margins, and disturbed montane slopes (1,500m – 3,000m ASL)",
        "summary": "Famous indigenous molluscicide plant discovered by Ethiopian scientist Prof. Aklilu Lemma to eradicate snails carrying the schistosomiasis parasite.",
        "description": (
            "Endod (Phytolacca dodecandra) is a native dioecious scrambling plant with hanging clusters of red-orange berries, "
            "traditionally used by Ethiopian women as natural soap for laundering cotton shammas. "
            "In 1964, world-renowned Ethiopian pathologist Professor Aklilu Lemma and Dr. Legesse Wolde-Yohannes discovered that crushed Endod berries "
            "contain potent triterpenoid saponins (lemmatoxin) that are highly lethal at minute concentrations (parts per million) to freshwater snails (Biomphalaria), "
            "the intermediate hosts transmitting human bilharzia (schistosomiasis). "
            "Unlike synthetic chemical molluscicides which poison fish and livestock, Endod saponins naturally biodegrade within 48 hours without environmental toxicity. "
            "For this breakthrough discovery in low-cost community health, Professor Aklilu Lemma and Dr. Legesse Wolde-Yohannes were awarded the Right Livelihood Award in 1989."
        ),
        "active_compound": "Lemmatoxin (triterpenoid saponin molluscicide)",
        "coordinates": "9.0333° N, 38.7500° E (Addis Ababa University Pathobiology Institute)",
        "metadata": {
            "scientific_triumph": "Discovery by Prof. Aklilu Lemma (Right Livelihood Award 1989)",
            "medical_application": "Low-cost eco-friendly eradication of schistosomiasis snails"
        }
    }
]
