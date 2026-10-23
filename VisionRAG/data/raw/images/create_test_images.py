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

if __name__ == "__main__":
    generate_all()
