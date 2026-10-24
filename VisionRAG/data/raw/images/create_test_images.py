"""
Helper script to generate distinct, realistic high-resolution educational test images
for VisionRAG Hugging Face CLIP visual search benchmarking.
"""

import os
from PIL import Image, ImageDraw, ImageFont

IMAGES_DIR = os.path.dirname(os.path.abspath(__file__))

def create_image(filename: str, bg_color: tuple, title: str, subtitle: str, details: list, accent_color: tuple):
    width, height = 800, 600
    img = Image.new("RGB", (width, height), color=bg_color)
    draw = ImageDraw.Draw(img)

    # Decorative header banner
    draw.rectangle([0, 0, width, 100], fill=accent_color)
    
    # Outer frame
    draw.rectangle([10, 10, width - 10, height - 10], outline=accent_color, width=4)

    # Simple geometric illustrations inside the image
    draw.rectangle([50, 140, 750, 400], fill=(255, 255, 255), outline=(200, 200, 200), width=2)
    
    # Text headers
    draw.text((30, 30), title, fill=(255, 255, 255))
    draw.text((30, 65), subtitle, fill=(230, 240, 255))

    # Draw details
    y = 160
    for item in details:
        draw.text((70, y), item, fill=(40, 40, 50))
        y += 35

    # Decorative footer
    draw.rectangle([0, height - 60, width, height], fill=(30, 35, 45))
    draw.text((30, height - 45), f"VisionRAG Educational Visual Asset | {filename}", fill=(200, 200, 200))

    out_path = os.path.join(IMAGES_DIR, filename)
    img.save(out_path, format="PNG")
    print(f"[+] Created test image: {out_path} ({os.path.getsize(out_path)} bytes)")
    return out_path

def generate_all():
    create_image(
        filename="addis_ababa_university_main_campus.png",
        bg_color=(245, 248, 252),
        title="ADDIS ABABA UNIVERSITY (AAU) MAIN CAMPUS",
        subtitle="Sidist Kilo | Historic Guenete Leul Palace & Institute of Ethiopian Studies",
        details=[
            "• Institution: Addis Ababa University (Autonomous Research University)",
            "• Landmark: Ras Makonnen Hall & Historic Campus Grounds",
            "• Visual Category: University Architecture, Higher Education, Academic Quad",
            "• Features: Stone masonry, academic library, lush gardens, student walkways",
            "• National Status: Premier Flagship Research University in Ethiopia"
        ],
        accent_color=(15, 60, 120)
    )

    create_image(
        filename="ethiopian_ministry_of_education_headquarters.png",
        bg_color=(250, 250, 245),
        title="FDRE MINISTRY OF EDUCATION HEADQUARTERS",
        subtitle="King George VI Avenue, Arada Sub-City, Addis Ababa",
        details=[
            "• Institution: Federal Democratic Republic of Ethiopia Ministry of Education",
            "• Statutory Powers: Proclamation No. 1368/2025 & Regulation No. 561/2025",
            "• Visual Category: Government Ministry Building, Federal Flag, National Administration",
            "• Executive Offices: General Education, Higher Education, ICT & Digital Education",
            "• Official Portal: https://moe.gov.et/"
        ],
        accent_color=(25, 110, 50)
    )

    create_image(
        filename="national_examination_hall_candidates.png",
        bg_color=(254, 250, 245),
        title="NATIONAL EXAMINATION HALL & ESSLCE CANDIDATES",
        subtitle="Educational Assessment and Examinations Service (EAES) Testing Center",
        details=[
            "• Examination: Ethiopian Secondary School Leaving Certificate (Grade 12)",
            "• Visual Category: Students at examination desks, proctors, invigilation",
            "• Security Protocols: University-based testing, biometric verification, digital timers",
            "• Testing Mode: Secure Computer-Based Testing (CBT) and Paper-Pencil Hybrid",
            "• Purpose: Meritocratic university entrance and remedial program placement"
        ],
        accent_color=(180, 50, 30)
    )

    create_image(
        filename="digital_schoolnet_smart_classroom.png",
        bg_color=(242, 250, 252),
        title="SCHOOLNET DIGITAL SMART CLASSROOM",
        subtitle="National Digital Education Strategy & E-Learning Tablet Initiative",
        details=[
            "• Program: Ethiopian SchoolNet Broadband & Cloud LMS Deployment",
            "• Visual Category: Computer Laboratory, Digital Tablets, Smart Display Screens",
            "• Infrastructure: Solar-powered server, localized intranet textbook repository",
            "• Target: Universal secondary school ICT competency and digital STEM learning",
            "• Connectivity: Ethio Telecom high-speed fiber-optic and satellite connection"
        ],
        accent_color=(0, 120, 140)
    )

    create_image(
        filename="science_chemistry_laboratory_experiment.png",
        bg_color=(250, 245, 255),
        title="SECONDARY SCHOOL SCIENCE CHEMISTRY LABORATORY",
        subtitle="STEM Education Acceleration & Hands-on Inquiry Practical",
        details=[
            "• Domain: Natural Science Stream (Chemistry, Physics, Biology Experiments)",
            "• Visual Category: Glass beakers, test tubes, chemical reagents, microscope",
            "• Curriculum: Grades 9-12 General Education Science Syllabus",
            "• Competencies: Titration analysis, stoichiometry, molecular structure modeling",
            "• Safety Protocols: Eye protection goggles, ventilation fume hoods"
        ],
        accent_color=(110, 40, 140)
    )

    create_image(
        filename="primary_school_feeding_program_ethiopia.png",
        bg_color=(255, 250, 240),
        title="NATIONAL PRIMARY SCHOOL FEEDING PROGRAM",
        subtitle="Student Nutrition, Health & Dropout Reduction Initiative",
        details=[
            "• Program: Government & Community Supported Primary School Nutrition",
            "• Visual Category: Primary students in uniform, communal lunch hall, dining trays",
            "• Demographic Impact: Serving over 4.2 million primary school children daily",
            "• Empirical Outcomes: 42% reduction in chronic absenteeism, higher cognitive retention",
            "• Core Partners: Regional Education Bureaus, Parent-Teacher Associations, WFP"
        ],
        accent_color=(190, 110, 20)
    )

    create_image(
        filename="mathematics_algebra_quadratic_function_parabola.png",
        bg_color=(245, 250, 255),
        title="MATHEMATICS: QUADRATIC FUNCTION & PARABOLA GRAPH",
        subtitle="Algebra & Analytical Geometry | f(x) = ax^2 + bx + c",
        details=[
            "• Standard Form: f(x) = ax^2 + bx + c  |  Vertex Form: a(x - h)^2 + k",
            "• Axis of Symmetry: x = -b / (2a)  |  Vertex Coordinates: (h, k)",
            "• Discriminant Analysis: Delta = b^2 - 4ac (Delta > 0: 2 real roots, Delta = 0: 1 root, Delta < 0: complex)",
            "• Roots (Quadratic Formula): x = (-b +/- sqrt(b^2 - 4ac)) / (2a)",
            "• Curriculum Alignment: Ethiopian High School Grade 10 & 11 Mathematics Unit 2"
        ],
        accent_color=(20, 80, 180)
    )

    create_image(
        filename="mathematics_geometry_pythagorean_theorem.png",
        bg_color=(250, 252, 245),
        title="MATHEMATICS: PYTHAGOREAN THEOREM & TRIGONOMETRY",
        subtitle="Euclidean Geometry & Right-Angled Triangles | a^2 + b^2 = c^2",
        details=[
            "• Theorem: In any right-angled triangle, a^2 + b^2 = c^2 (Hypotenuse c)",
            "• Trigonometric Ratios: sin(theta) = opp/hyp, cos(theta) = adj/hyp, tan(theta) = opp/adj",
            "• Pythagorean Triples: (3, 4, 5), (5, 12, 13), (8, 15, 17), (7, 24, 25)",
            "• Vector Magnitude: |v| = sqrt(v_x^2 + v_y^2)",
            "• Curriculum Alignment: Grades 9 & 10 Secondary Mathematics"
        ],
        accent_color=(40, 130, 60)
    )

    create_image(
        filename="physics_newton_laws_force_vectors.png",
        bg_color=(255, 248, 248),
        title="PHYSICS: NEWTON'S LAWS & FREE-BODY FORCE VECTORS",
        subtitle="Classical Mechanics & Dynamics | Sum of Forces = m * a",
        details=[
            "• First Law (Inertia): An object remains at rest or constant velocity unless acted upon by F_net.",
            "• Second Law: F_net = m * a (Force in Newtons, Mass in kg, Acceleration in m/s^2).",
            "• Third Law (Action-Reaction): For every action force F_AB, there is an equal & opposite F_BA.",
            "• Force Components: Normal Force (F_N), Gravity (F_g = mg), Friction (f_k = mu * F_N), Tension (T).",
            "• Curriculum Alignment: Grade 11 Physics Unit 3 (Dynamics & Equilibrium)"
        ],
        accent_color=(180, 40, 40)
    )

    create_image(
        filename="physics_projectile_motion_trajectory.png",
        bg_color=(255, 252, 245),
        title="PHYSICS: PROJECTILE MOTION & 2D KINEMATICS",
        subtitle="Two-Dimensional Kinematics & Parabolic Trajectory | Constant Gravity g",
        details=[
            "• Horizontal Velocity: v_x = v_0 * cos(theta) = constant (neglecting air resistance)",
            "• Vertical Velocity: v_y = v_0 * sin(theta) - g * t",
            "• Maximum Height: H = (v_0^2 * sin^2(theta)) / (2g)",
            "• Horizontal Range: R = (v_0^2 * sin(2*theta)) / g",
            "• Curriculum Alignment: Grade 11 Physics Unit 2 (Kinematics in Two Dimensions)"
        ],
        accent_color=(200, 90, 20)
    )

    create_image(
        filename="chemistry_periodic_table_and_bonding.png",
        bg_color=(252, 248, 255),
        title="CHEMISTRY: CHEMICAL BONDING & MOLECULAR STRUCTURE",
        subtitle="Ionic, Covalent & Metallic Bonds | Valence Shell Electron Pair Repulsion",
        details=[
            "• Ionic Bonding: Complete electron transfer between metals and non-metals (e.g. NaCl).",
            "• Covalent Bonding: Electron pair sharing between non-metal atoms (Single, Double, Triple bonds).",
            "• Electronegativity Difference: Delta EN > 1.7 (Ionic), 0.4 < Delta EN <= 1.7 (Polar Covalent), <= 0.4 (Non-polar).",
            "• VSEPR Geometries: Linear (180 deg), Trigonal Planar (120 deg), Tetrahedral (109.5 deg).",
            "• Curriculum Alignment: Grade 10 & 11 Chemistry Unit 2 (Chemical Bonding)"
        ],
        accent_color=(120, 40, 160)
    )

    create_image(
        filename="biology_cell_organelles_and_photosynthesis.png",
        bg_color=(245, 255, 248),
        title="BIOLOGY: PLANT CELL STRUCTURE & PHOTOSYNTHESIS",
        subtitle="Cellular Organelles, Chloroplast Thylakoids & Calvin Cycle",
        details=[
            "• Overall Photosynthesis Equation: 6 CO_2 + 6 H_2O + Light Energy -> C_6H_12O_6 + 6 O_2",
            "• Light Reactions (Thylakoids): Photolysis of water, ATP and NADPH production, O_2 release.",
            "• Calvin Cycle (Stroma): Carbon fixation via RuBisCO enzyme, glucose carbohydrate synthesis.",
            "• Key Organelles: Chloroplasts, Mitochondria (ATP cellular respiration), Cell Wall, Nucleus.",
            "• Curriculum Alignment: Grade 10 & 11 Biology Unit 3 (Cell Biology & Energetics)"
        ],
        accent_color=(20, 130, 80)
    )

    create_image(
        filename="computer_science_data_structures_network.png",
        bg_color=(245, 250, 255),
        title="COMPUTER SCIENCE: DATA STRUCTURES & ALGORITHMS",
        subtitle="Computational Complexity, Trees, Graphs & Network Topologies",
        details=[
            "• Big-O Complexity: O(1) Constant, O(log n) Binary Search, O(n) Linear, O(n log n) MergeSort.",
            "• Tree Structures: Binary Search Trees (BST), AVL balanced trees, Root, Node, Edge definitions.",
            "• Graph Algorithms: Breadth-First Search (BFS), Depth-First Search (DFS), Dijkstra Shortest Path.",
            "• Networking Basics: OSI 7-Layer Model (Physical, Data Link, Network, Transport, Application).",
            "• Curriculum Alignment: Secondary School Information Technology (IT) Grades 11-12"
        ],
        accent_color=(10, 80, 140)
    )

if __name__ == "__main__":
    generate_all()
