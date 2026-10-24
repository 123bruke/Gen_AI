"""
Student Management & Progress API Routes for PostgreSQL.
Provides:
- Passcode Verification (Password: '123456')
- Search, Filter by Region, Country, Grade, and Status
- CRUD operations for student progress and records
- Statistical aggregation for educational oversight
"""

import uuid
import datetime
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Query, Body
from pydantic import BaseModel, Field

from app.db.postgres_db import postgres_manager
from app.models.postgres_models import StudentRecord
from app.db.log_db import app_logger

router = APIRouter(prefix="/api/students", tags=["Student Management Portal"])

PORTAL_PASSWORDS = ["1234567", "123456"]

# Pydantic schemas
class VerifyPasswordRequest(BaseModel):
    password: str

class StudentCreateRequest(BaseModel):
    student_id: Optional[str] = None
    full_name: str
    gender: Optional[str] = "Unspecified"
    age: Optional[int] = 16
    grade_level: str = "Grade 10"
    country: str = "Ethiopia"
    region: str = "Addis Ababa"
    city_or_zone: Optional[str] = ""
    school_name: Optional[str] = "Menelik II Secondary School"
    progress_percent: int = Field(default=0, ge=0, le=100)
    attendance_percent: int = Field(default=95, ge=0, le=100)
    performance_gpa: Optional[str] = "3.50 / 4.0"
    enrolled_courses: Optional[List[str]] = ["Mathematics", "Natural Science", "Civics", "English"]
    learning_status: Optional[str] = "Active"
    feedback_notes: Optional[str] = ""

class StudentUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    gender: Optional[str] = None
    age: Optional[int] = None
    grade_level: Optional[str] = None
    country: Optional[str] = None
    region: Optional[str] = None
    city_or_zone: Optional[str] = None
    school_name: Optional[str] = None
    progress_percent: Optional[int] = None
    attendance_percent: Optional[int] = None
    performance_gpa: Optional[str] = None
    enrolled_courses: Optional[List[str]] = None
    learning_status: Optional[str] = None
    feedback_notes: Optional[str] = None

INITIAL_STUDENTS = [
    {
        "student_id": "ET-AA-2026-0101",
        "full_name": "Abebe Bikila Tadesse",
        "gender": "Male",
        "age": 17,
        "grade_level": "Grade 12",
        "country": "Ethiopia",
        "region": "Addis Ababa",
        "city_or_zone": "Arada Sub-city",
        "school_name": "Menelik II Secondary School",
        "progress_percent": 88,
        "attendance_percent": 98,
        "performance_gpa": "3.92 / 4.0",
        "enrolled_courses": ["Advanced Mathematics", "Physics", "Chemistry", "Civic Education", "ICT & Coding"],
        "learning_status": "Honors",
        "feedback_notes": "Exemplary understanding of calculus and electrical dynamics. Active participant in school STEM club."
    },
    {
        "student_id": "ET-OR-2026-0205",
        "full_name": "Chaltu Tolessa Gemeda",
        "gender": "Female",
        "age": 16,
        "grade_level": "Grade 11",
        "country": "Ethiopia",
        "region": "Oromia",
        "city_or_zone": "Adama Special Zone",
        "school_name": "Adama Model Secondary School",
        "progress_percent": 94,
        "attendance_percent": 99,
        "performance_gpa": "4.00 / 4.0",
        "enrolled_courses": ["Biology", "Chemistry", "Afaan Oromo Literature", "English", "Mathematics"],
        "learning_status": "Honors",
        "feedback_notes": "Ranked first in regional biology competition; conducting research on endemic plant ecosystems."
    },
    {
        "student_id": "ET-AM-2026-0312",
        "full_name": "Yohannes Assefa Melaku",
        "gender": "Male",
        "age": 16,
        "grade_level": "Grade 10",
        "country": "Ethiopia",
        "region": "Amhara",
        "city_or_zone": "Bahir Dar",
        "school_name": "Tana Haik Comprehensive High School",
        "progress_percent": 74,
        "attendance_percent": 92,
        "performance_gpa": "3.45 / 4.0",
        "enrolled_courses": ["Amharic Literature", "General Science", "History & Heritage", "Mathematics"],
        "learning_status": "Active",
        "feedback_notes": "Strong essay writing and historical reasoning; benefiting from supplementary mathematics tutorials."
    },
    {
        "student_id": "ET-TG-2026-0428",
        "full_name": "Semhar Gebremariam Kahsay",
        "gender": "Female",
        "age": 17,
        "grade_level": "Grade 12",
        "country": "Ethiopia",
        "region": "Tigray",
        "city_or_zone": "Mekelle",
        "school_name": "Kallamino Special Secondary School",
        "progress_percent": 91,
        "attendance_percent": 96,
        "performance_gpa": "3.89 / 4.0",
        "enrolled_courses": ["Mathematics", "Physics", "Computer Science", "English"],
        "learning_status": "Honors",
        "feedback_notes": "Outstanding algorithm problem-solving; preparing for university entrance examination in natural science."
    },
    {
        "student_id": "ET-SD-2026-0519",
        "full_name": "Dawit Markos Hunkamo",
        "gender": "Male",
        "age": 15,
        "grade_level": "Grade 9",
        "country": "Ethiopia",
        "region": "Sidama",
        "city_or_zone": "Hawassa",
        "school_name": "Hawassa Tabor High School",
        "progress_percent": 62,
        "attendance_percent": 88,
        "performance_gpa": "3.10 / 4.0",
        "enrolled_courses": ["Integrated Science", "Social Studies", "Mathematics", "English", "Sidaamu Afoo"],
        "learning_status": "Active",
        "feedback_notes": "Consistent improvement across term assessments. Demonstrates high curiosity in environmental science."
    },
    {
        "student_id": "ET-SM-2026-0640",
        "full_name": "Fadumo Abdi Jama",
        "gender": "Female",
        "age": 16,
        "grade_level": "Grade 11",
        "country": "Ethiopia",
        "region": "Somali",
        "city_or_zone": "Jijiga",
        "school_name": "Jijiga Senior Secondary School",
        "progress_percent": 82,
        "attendance_percent": 94,
        "performance_gpa": "3.65 / 4.0",
        "enrolled_courses": ["Mathematics", "Geography", "Somali Language", "Economics", "English"],
        "learning_status": "Active",
        "feedback_notes": "Strong aptitude in economic geography and statistical interpretation."
    },
    {
        "student_id": "ET-DD-2026-0715",
        "full_name": "Robel Girma Wolde",
        "gender": "Male",
        "age": 15,
        "grade_level": "Grade 9",
        "country": "Ethiopia",
        "region": "Dire Dawa",
        "city_or_zone": "Dire Dawa Administration",
        "school_name": "Sabian Comprehensive High School",
        "progress_percent": 53,
        "attendance_percent": 81,
        "performance_gpa": "2.80 / 4.0",
        "enrolled_courses": ["Mathematics", "General Science", "English", "Civics"],
        "learning_status": "Needs Attention",
        "feedback_notes": "Assigned peer tutor for algebra; attendance coaching scheduled with guardian."
    },
    {
        "student_id": "ET-HR-2026-0822",
        "full_name": "Muna Ibrahim Sharif",
        "gender": "Female",
        "age": 17,
        "grade_level": "Grade 12",
        "country": "Ethiopia",
        "region": "Harari",
        "city_or_zone": "Harar City",
        "school_name": "Ras Makonnen High School",
        "progress_percent": 86,
        "attendance_percent": 95,
        "performance_gpa": "3.78 / 4.0",
        "enrolled_courses": ["Social Science Stream", "Economics", "Geography", "English", "History"],
        "learning_status": "Active",
        "feedback_notes": "Excellent presentation skills and civic engagement in community literacy."
    }
]

def ensure_initial_students():
    """Seeds sample student records if table is empty."""
    try:
        with postgres_manager.session_scope() as session:
            count = session.query(StudentRecord).count()
            if count == 0:
                for data in INITIAL_STUDENTS:
                    rec = StudentRecord(
                        id=f"stu_{uuid.uuid4().hex[:12]}",
                        student_id=data["student_id"],
                        full_name=data["full_name"],
                        gender=data["gender"],
                        age=data["age"],
                        grade_level=data["grade_level"],
                        country=data["country"],
                        region=data["region"],
                        city_or_zone=data["city_or_zone"],
                        school_name=data["school_name"],
                        progress_percent=data["progress_percent"],
                        attendance_percent=data["attendance_percent"],
                        performance_gpa=data["performance_gpa"],
                        enrolled_courses=data["enrolled_courses"],
                        learning_status=data["learning_status"],
                        feedback_notes=data["feedback_notes"],
                        metadata_={"seeded": True, "created_by": "system_administrator"}
                    )
                    session.add(rec)
                app_logger.info(f"Seeded {len(INITIAL_STUDENTS)} regional student records into PostgreSQL.")
    except Exception as e:
        app_logger.error(f"Error ensuring initial students: {e}")


@router.post("/verify-portal")
def verify_portal_access(req: VerifyPasswordRequest):
    """
    Verifies administrator / teacher access code for the Student Management Portal.
    Protected by password '1234567'.
    """
    if req.password.strip() in PORTAL_PASSWORDS:
        return {
            "success": True,
            "message": "Authorized access to Student Management Portal.",
            "authorized": True
        }
    raise HTTPException(status_code=401, detail="Invalid password for Student Management Portal. Please enter 1234567.")


@router.get("")
def list_students(
    search: Optional[str] = Query(None, description="Search by name, student ID, or school"),
    region: Optional[str] = Query(None, description="Filter by Ethiopian region"),
    grade_level: Optional[str] = Query(None, description="Filter by grade level"),
    status: Optional[str] = Query(None, description="Filter by learning status"),
    sort_by: str = Query("name", description="Sort by: name, progress, gpa, recent"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0)
):
    """
    Search and filter student records in PostgreSQL.
    """
    ensure_initial_students()

    with postgres_manager.session_scope() as session:
        query = session.query(StudentRecord)

        # 1. Search term
        if search and isinstance(search, str):
            term = f"%{search.strip()}%"
            query = query.filter(
                (StudentRecord.full_name.ilike(term)) |
                (StudentRecord.student_id.ilike(term)) |
                (StudentRecord.school_name.ilike(term)) |
                (StudentRecord.city_or_zone.ilike(term))
            )

        # 2. Region filter
        if region and isinstance(region, str) and region not in ("All", "all"):
            query = query.filter(StudentRecord.region == region)

        # 3. Grade filter
        if grade_level and isinstance(grade_level, str) and grade_level not in ("All", "all"):
            query = query.filter(StudentRecord.grade_level == grade_level)

        # 4. Status filter
        if status and isinstance(status, str) and status not in ("All", "all"):
            query = query.filter(StudentRecord.learning_status == status)

        total_count = query.count()

        # Sorting
        if sort_by == "progress":
            query = query.order_by(StudentRecord.progress_percent.desc())
        elif sort_by == "recent":
            query = query.order_by(StudentRecord.created_at.desc())
        else:
            query = query.order_by(StudentRecord.full_name.asc())

        lim = limit if isinstance(limit, int) else 50
        off = offset if isinstance(offset, int) else 0
        results = query.offset(off).limit(lim).all()
        student_list = [r.to_dict() for r in results]

    return {
        "total": total_count,
        "count": len(student_list),
        "offset": off,
        "limit": lim,
        "students": student_list
    }



@router.get("/statistics")
def get_student_statistics():
    """
    Returns aggregated metrics: total students, regional distribution,
    average progress %, grade distribution, and status breakdown.
    """
    ensure_initial_students()

    with postgres_manager.session_scope() as session:
        students = session.query(StudentRecord).all()
        total = len(students)

        if total == 0:
            return {
                "total_students": 0,
                "average_progress": 0,
                "regions": {},
                "grade_levels": {},
                "status_breakdown": {}
            }

        avg_progress = round(sum(s.progress_percent for s in students) / total, 1)

        regions: Dict[str, int] = {}
        grades: Dict[str, int] = {}
        statuses: Dict[str, int] = {}

        for s in students:
            reg = s.region or "Unknown"
            regions[reg] = regions.get(reg, 0) + 1

            gr = s.grade_level or "Unassigned"
            grades[gr] = grades.get(gr, 0) + 1

            st = s.learning_status or "Active"
            statuses[st] = statuses.get(st, 0) + 1

    return {
        "total_students": total,
        "average_progress": avg_progress,
        "regions": regions,
        "grade_levels": grades,
        "status_breakdown": statuses
    }


@router.get("/{student_db_id}")
def get_student_detail(student_db_id: str):
    """Retrieves full details for a single student."""
    with postgres_manager.session_scope() as session:
        rec = session.query(StudentRecord).filter(
            (StudentRecord.id == student_db_id) | (StudentRecord.student_id == student_db_id)
        ).first()
        if not rec:
            raise HTTPException(status_code=404, detail="Student record not found.")
        return rec.to_dict()


@router.post("")
def create_student(req: StudentCreateRequest):
    """
    Enrolls and records a new student into PostgreSQL.
    """
    generated_id = req.student_id or f"ET-{req.region[:2].upper()}-{datetime.date.today().year}-{uuid.uuid4().hex[:4].upper()}"

    with postgres_manager.session_scope() as session:
        # Check duplicate
        existing = session.query(StudentRecord).filter(StudentRecord.student_id == generated_id).first()
        if existing:
            generated_id = f"ET-{req.region[:2].upper()}-{datetime.date.today().year}-{uuid.uuid4().hex[:6].upper()}"

        rec = StudentRecord(
            id=f"stu_{uuid.uuid4().hex[:12]}",
            student_id=generated_id,
            full_name=req.full_name.strip(),
            gender=req.gender,
            age=req.age,
            grade_level=req.grade_level,
            country=req.country,
            region=req.region,
            city_or_zone=req.city_or_zone,
            school_name=req.school_name,
            progress_percent=req.progress_percent,
            attendance_percent=req.attendance_percent,
            performance_gpa=req.performance_gpa,
            enrolled_courses=req.enrolled_courses or [],
            learning_status=req.learning_status or "Active",
            feedback_notes=req.feedback_notes or "",
            metadata_={"manual_entry": True, "created_at": datetime.datetime.utcnow().isoformat()}
        )
        session.add(rec)
        session.flush()
        data = rec.to_dict()

    app_logger.info(f"Created student record {generated_id} for {req.full_name} in {req.region}.")
    return {"success": True, "student": data}


@router.put("/{student_db_id}")
def update_student(student_db_id: str, req: StudentUpdateRequest):
    """
    Updates an existing student's progress, courses, grades, or feedback.
    """
    with postgres_manager.session_scope() as session:
        rec = session.query(StudentRecord).filter(
            (StudentRecord.id == student_db_id) | (StudentRecord.student_id == student_db_id)
        ).first()
        if not rec:
            raise HTTPException(status_code=404, detail="Student record not found.")

        if req.full_name is not None: rec.full_name = req.full_name.strip()
        if req.gender is not None: rec.gender = req.gender
        if req.age is not None: rec.age = req.age
        if req.grade_level is not None: rec.grade_level = req.grade_level
        if req.country is not None: rec.country = req.country
        if req.region is not None: rec.region = req.region
        if req.city_or_zone is not None: rec.city_or_zone = req.city_or_zone
        if req.school_name is not None: rec.school_name = req.school_name
        if req.progress_percent is not None: rec.progress_percent = max(0, min(100, req.progress_percent))
        if req.attendance_percent is not None: rec.attendance_percent = max(0, min(100, req.attendance_percent))
        if req.performance_gpa is not None: rec.performance_gpa = req.performance_gpa
        if req.enrolled_courses is not None: rec.enrolled_courses = req.enrolled_courses
        if req.learning_status is not None: rec.learning_status = req.learning_status
        if req.feedback_notes is not None: rec.feedback_notes = req.feedback_notes

        rec.updated_at = datetime.datetime.utcnow()
        session.flush()
        data = rec.to_dict()

    return {"success": True, "student": data}


@router.delete("/{student_db_id}")
def delete_student(student_db_id: str):
    """Deletes a student record."""
    with postgres_manager.session_scope() as session:
        rec = session.query(StudentRecord).filter(
            (StudentRecord.id == student_db_id) | (StudentRecord.student_id == student_db_id)
        ).first()
        if not rec:
            raise HTTPException(status_code=404, detail="Student record not found.")

        session.delete(rec)

    return {"success": True, "message": "Student record successfully deleted."}
