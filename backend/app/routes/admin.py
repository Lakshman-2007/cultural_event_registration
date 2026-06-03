"""Admin routes for dashboard, participants list, and data export."""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import Response, StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import Optional
import io

from app.database import get_db
from app.models import Admin, Participant
from app.schemas import (
    AdminLoginRequest,
    AdminLoginResponse,
    DashboardResponse,
    DashboardMetrics,
    PaginatedParticipantsResponse,
    ParticipantResponse,
    ParticipantDetail
)
from app.security import (
    verify_password,
    create_access_token,
    get_current_admin,
    decrypt_aadhaar
)
from app.services.export_service import generate_csv_export, generate_excel_export

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.post("/login", response_model=AdminLoginResponse)
def api_admin_login(request: AdminLoginRequest, db: Session = Depends(get_db)):
    """Authenticate admin and return JWT token."""
    admin = db.query(Admin).filter(Admin.email == request.email).first()
    if not admin or not verify_password(request.password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    token = create_access_token(data={"sub": admin.email, "role": "admin", "name": admin.name})
    return AdminLoginResponse(
        success=True,
        message="Login successful.",
        token=token,
        admin=admin.to_dict()
    )


@router.get("/dashboard", response_model=DashboardResponse)
def api_get_dashboard(db: Session = Depends(get_db), current_admin: dict = Depends(get_current_admin)):
    """Retrieve aggregate metrics for the admin dashboard."""
    total_registrations = db.query(Participant).count()
    internal_count = db.query(Participant).filter(Participant.participant_type == "INTERNAL").count()
    external_count = db.query(Participant).filter(Participant.participant_type == "EXTERNAL").count()
    
    total_revenue = db.query(func.sum(Participant.payment_amount)).filter(
        Participant.payment_status == "PAID"
    ).scalar() or 0.0
    
    checked_in_count = db.query(Participant).filter(Participant.attendance_status == "PRESENT").count()
    
    # Pending check-in means registrations that are active (either free internal or paid external) but not checked in yet
    pending_count = db.query(Participant).filter(
        Participant.attendance_status == "ABSENT",
        Participant.payment_status.in_(["FREE", "PAID"])
    ).count()

    metrics = DashboardMetrics(
        total_registrations=total_registrations,
        internal_count=internal_count,
        external_count=external_count,
        total_revenue=float(total_revenue),
        checked_in_count=checked_in_count,
        pending_count=pending_count
    )

    return DashboardResponse(
        success=True,
        metrics=metrics
    )


@router.get("/participants", response_model=PaginatedParticipantsResponse)
def api_get_participants(
    search: Optional[str] = Query(None),
    college: Optional[str] = Query(None),
    payment_status: Optional[str] = Query(None),
    attendance_status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_admin: dict = Depends(get_current_admin)
):
    """Retrieve filtered and paginated participant records."""
    query = db.query(Participant)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Participant.full_name.ilike(search_term),
                Participant.register_number.ilike(search_term),
                Participant.mobile.ilike(search_term),
                Participant.registration_id.ilike(search_term),
                Participant.email.ilike(search_term)
            )
        )

    if college:
        query = query.filter(Participant.college_name.ilike(f"%{college}%"))

    if payment_status and payment_status.upper() != "ALL":
        query = query.filter(Participant.payment_status == payment_status.upper())

    if attendance_status and attendance_status.upper() != "ALL":
        query = query.filter(Participant.attendance_status == attendance_status.upper())

    total = query.count()
    
    # Paginate
    offset = (page - 1) * per_page
    participants = query.order_by(Participant.created_at.desc()).offset(offset).limit(per_page).all()
    
    # Map to ParticipantDetail schemas
    data = []
    for p in participants:
        p_dict = p.to_dict()
        # Do not decrypt Aadhaar for list view to keep it secure/fast
        p_dict["aadhaar_number"] = None
        data.append(ParticipantDetail(**p_dict))

    total_pages = (total + per_page - 1) // per_page

    return PaginatedParticipantsResponse(
        success=True,
        data=data,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=max(total_pages, 1)
    )


@router.get("/participants/{registration_id}", response_model=ParticipantResponse)
def api_get_participant_detail(
    registration_id: str,
    db: Session = Depends(get_db),
    current_admin: dict = Depends(get_current_admin)
):
    """Retrieve full details of a participant including decrypted Aadhaar number."""
    participant = db.query(Participant).filter(Participant.registration_id == registration_id).first()
    if not participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Participant not found."
        )

    # Decrypt Aadhaar for detailed view
    aadhaar_number = "Error decrypting Aadhaar"
    try:
        aadhaar_number = decrypt_aadhaar(participant.aadhaar_encrypted)
    except Exception as e:
        print(f"Error decrypting Aadhaar for {registration_id}: {e}")

    p_dict = participant.to_dict()
    p_dict["aadhaar_number"] = aadhaar_number

    return ParticipantResponse(
        success=True,
        data=ParticipantDetail(**p_dict),
        message="Participant details retrieved successfully."
    )


@router.get("/export")
def api_export_participants(
    format: str = Query("csv", regex="^(csv|excel)$"),
    search: Optional[str] = Query(None),
    college: Optional[str] = Query(None),
    payment_status: Optional[str] = Query(None),
    attendance_status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_admin: dict = Depends(get_current_admin)
):
    """Export participant records as CSV or Excel."""
    if format == "csv":
        csv_data = generate_csv_export(db, search, college, payment_status, attendance_status)
        return Response(
            content=csv_data,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=participants_export.csv"}
        )
    else:  # excel
        excel_data = generate_excel_export(db, search, college, payment_status, attendance_status)
        return Response(
            content=excel_data,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=participants_export.xlsx"}
        )
