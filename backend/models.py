from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class StudentModel(Base):
    __tablename__ = "students"

    id = Column(String, primary_key=True, index=True)
    full_name = Column(String, nullable=False, index=True)
    pin_number = Column(String, unique=True, nullable=False, index=True)
    roll_number = Column(String, unique=True, nullable=False, index=True)
    branch = Column(String, nullable=False)
    current_year = Column(String, nullable=False)
    semester = Column(String, default="1st Sem")
    academic_year = Column(String, default="2026 - 2027")
    college_name = Column(String, default="Government Polytechnic Peddapuram")
    photo_url = Column(Text, nullable=True)
    status = Column(String, default="Active")
    date_of_birth = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    blood_group = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    email = Column(String, nullable=True)
    parent_contact = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    cards = relationship("IDCardModel", back_populates="student", cascade="all, delete-orphan")


class IDCardModel(Base):
    __tablename__ = "id_cards"

    id = Column(String, primary_key=True, index=True)
    student_id = Column(String, ForeignKey("students.id"), nullable=False)
    card_uid = Column(String, unique=True, nullable=False, index=True)
    verification_code = Column(String, unique=True, nullable=False, index=True)
    template_id = Column(String, default="modern-tech")
    issue_date = Column(String, nullable=False)
    expiry_date = Column(String, nullable=False)
    status = Column(String, default="Active")  # Active, Expired, Revoked
    version = Column(Integer, default=1)
    revocation_reason = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("StudentModel", back_populates="cards")


class CollegeSettingsModel(Base):
    __tablename__ = "college_settings"

    id = Column(Integer, primary_key=True, default=1)
    college_name = Column(String, default="Government Polytechnic")
    college_code = Column(String, default="GPT-PEDD")
    tagline = Column(String, default="Peddapuram | Approved by AICTE & SBTET AP")
    address = Column(Text, default="Main Road, Peddapuram, Kakinada District, AP")
    website = Column(String, default="https://gptpeddapuram.edu.in")
    contact_email = Column(String, default="principal.gptpeddapuram@gmail.com")
    contact_phone = Column(String, default="+91 8852 241234")
    signatory_name = Column(String, default="Dr. M. S. R. Murthy")
    academic_year = Column(String, default="2026 - 2027")
    default_validity_years = Column(Integer, default=3)
    pin_format = Column(String, default="BRANCH-YYYY-XXX")
