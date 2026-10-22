# VisionRAG Multimodal Data Corpus & Knowledge Architecture

Welcome to the **VisionRAG Multimodal Data & Knowledge Repository**. This directory houses the primary empirical, historical, biological, and annotated datasets powering VisionRAG's multimodal retrieval-augmented generation and autonomous agent ecosystem.

---

## 1. Directory Structure

```
data/
├── README.md                           <- Comprehensive dataset documentation and data dictionary
├── processor.py                        <- Master data pipeline processor syncing to PostgreSQL & ChromaDB
├── raw/                                <- Immutable, raw source data from field studies and archives
│   ├── documents/                      <- Historical treatises, monographs, and academic papers
│   │   ├── ethiopian_education_history_charter.md
│   │   ├── saint_yared_zema_musicology.md
│   │   ├── walia_ibex_ecological_field_study.json
│   │   ├── coffea_arabica_wild_genomics.csv
│   │   ├── ethiopian_wolf_bale_sanetti_census.json
│   │   ├── traditional_fetha_negest_legal_jurisprudence.md
│   │   ├── menelik_ii_and_modern_schooling.md
│   │   ├── ancient_geez_inscriptions_axum.csv
│   │   ├── ethiopian_traditional_medicine_biodiversity.json
│   │   └── simien_mountains_geology_climate.json
│   ├── images/                         <- High-resolution visual descriptors and EXIF telemetry
│   │   ├── walia_ibex_simien_escarpment.json
│   │   ├── lalibela_bet_giyorgis_aerial.json
│   │   ├── ethiopian_wolf_sanetti_plateau.json
│   │   ├── axum_obelisk_monumental_stela.json
│   │   └── geez_illuminated_manuscript_gospels.json
│   └── videos/                         <- Video keyframe manifests, timestamps, and YouTube logs
│       ├── ethiopian_education_documentary_manifest.json
│       └── simien_bale_wildlife_survey_manifest.json
├── annotations/                        <- Ground-truth annotations for vision, VQA, and NLP
│   ├── yolo_annotations.json           <- Bounding boxes and segmentation polygons for CV
│   ├── multimodal_vqa_pairs.json       <- Grounded Question-Answer-Evidence evaluation pairs
│   └── ner_entity_annotations.json     <- Named Entity Recognition (NER) tags for historical/biological entities
├── interim/                            <- Normalized, staged intermediate data
│   ├── cleaned_biological_taxa.json    <- Taxonomic hierarchy (Kingdom to Species) with IUCN status
│   └── staged_geospatial_features.geojson <- GeoJSON features for maps (Lalibela, Axum, Simien, Bale, GERD)
└── processed/                          <- Final production indexes and knowledge graphs
    ├── multimodal_knowledge_graph.json <- Relational knowledge graph connecting history, education, and biology
    └── search_index_catalogue.json     <- Inverted index for fast lexical retrieval
```

---

## 2. Core Knowledge Domains

### Domain A: Ethiopian History of Education
- **Traditional Church Education Hierarchy:**
  1. *Nebab Bet* (School of Reading): Mastery of the Ge'ez *Fidel* syllabary (>200 characters) culminating in the Psalms of David (*Dawit*).
  2. *Zema Bet* (Liturgical Music): 6th-century indigenous 3-mode notation (*Ge'ez*, *Ezel*, *Araray*) created by Saint Yared, accompanied by the *Senasel* (sistrum) and *Kebero* (drum).
  3. *Qene Bet* (Poetry & Rhetoric): Mastery of *Sem-enna-Worq* (Wax and Gold) dual-meaning linguistics and philosophy (notably philosopher Zera Yacob's *Hatata*).
  4. *Metsahaf Bet* (Canon Law & Exegesis): Interpretation of scriptures and the *Fetha Negest* (The Law of the Kings).
- **Traditional Islamic Education:** Historic madrasas of Harar Jugol (UNESCO 4th holy city of Islam), Wollo, and Jimma, teaching Quranic *Tahfiz*, Arabic *Nahw*, and *Fiqh*.
- **Modern State Schooling:**
  - 1908: Emperor Menelik II opens the first secular state school in Addis Ababa.
  - 1925: Regent Ras Teferi opens the Teferi Mekonnen School.
  - 1931: Empress Menen Asfaw establishes the Empress Menen Girls' School.
  - 1950: Founding of the University College of Addis Ababa (UCAA) by Dr. Lucien Matte, expanding into Haile Selassie I University (1961), now **Addis Ababa University (AAU)**.
  - 1974–1991: National Literacy Campaign (*Edget Behibret*), winning the 1980 UNESCO Krupskaya Award.
  - Contemporary Era: Over 50 public universities under the national 70:30 STEM policy.

### Domain B: Horn of Africa Biological Diversity & Genomics
- **Endemic Fauna:**
  - *Capra walie* (Walia Ibex): High basalt cliff caprid of Simien Mountains National Park.
  - *Canis simensis* (Ethiopian Wolf): Africa's most endangered carnivore, specialized rodent predator on the Sanetti Plateau of Bale Mountains.
  - *Theropithecus gelada* (Gelada Baboon): World's only grass-grazing primate, living in multi-tier social bands.
  - *Tragelaphus buxtoni* (Mountain Nyala): Endemic spiral-horned antelope of the southeastern high forests.
- **Botanical Genomics & Crop Origins:**
  - *Coffea arabica*: Ethiopia is the primary genetic center of origin; cloud forests of Kaffa, Sheka, and Yayu shelter >99% of global wild Arabica germplasm.
  - *Eragrostis tef* (Teff): Domesticated ancient gluten-free grain, foundational for fermented *Injera*.
  - *Ensete ventricosum* (Enset / "False Banana"): "The Tree Against Hunger", resilient drought-proof staple feeding over 20 million people in southern Ethiopia.
  - *Phytolacca dodecandra* (Endod): Saponin molluscicide discovered by Prof. Aklilu Lemma to eradicate schistosomiasis-bearing snails.

---

## 3. Data Processing Pipeline

To process all raw documents, images, and video manifests, validate annotations, and synchronize everything into **PostgreSQL 16** (with `BYTEA` large binary file storage) and **ChromaDB**:

```bash
# Run data pipeline processor
python data/processor.py
```

### What `processor.py` Executes:
1. **Raw Document Ingestion:** Reads all files from `data/raw/documents/`, verifies MD5 checksums, and stores them in PostgreSQL's `uploaded_files` table with `BYTEA` binary data and `JSONB` metadata.
2. **Visual & Video Telemetry Ingestion:** Processes image descriptors from `data/raw/images/` and video manifests from `data/raw/videos/`.
3. **ChromaDB Vector Embeddings:** Computes dense embeddings using neural encoders and upserts vectors with topic metadata into ChromaDB collections.
4. **Task Progress Tracking:** Logs real-time ingestion stages (0% to 100%) in PostgreSQL's `task_progress` table.

---

## 4. Autonomous Agent Suite Integration

All datasets in this folder are directly connected to VisionRAG's specialized AI agents:
1. **YouTube Searcher & Transcriber Agent:** Discovers and transcribes educational documentaries.
2. **Map Searcher Agent:** Resolves geospatial coordinates and historical landmarks from `staged_geospatial_features.geojson`.
3. **Google Search Engine Agent:** Crawls and processes external articles for real-time comparative analysis.
4. **Image Processor Agent:** Performs YOLOv8 visual detection using annotations from `yolo_annotations.json`.
5. **Link Data Reader Agent:** Streams online book URLs, chunks text, and continuously stores data in PostgreSQL.

---

## 5. Storage Guarantees
- **PostgreSQL 16:** Relational persistence of raw file blobs (`BYTEA`), user sessions, chat queries, and `JSONB` metadata indexed with GIN indexes.
- **ChromaDB:** Multimodal vector store for dense semantic similarity search.
- **Redis:** In-memory caching for sub-millisecond retrieval of frequent queries.
