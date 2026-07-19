from fastapi import APIRouter, Depends, HTTPException, status
from uuid import UUID
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.database import get_db_session
from app.models.project import Project, ProjectMember, ProjectMilestone
from app.models.user import User
from app.dependencies.auth import get_current_active_user
from app.schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    ProjectEnvelope,
    ProjectListEnvelope,
    ProjectMemberCreate,
    ProjectMemberResponse,
    ProjectMemberEnvelope,
    ProjectMemberListEnvelope,
    MilestoneCreate,
    MilestoneUpdate,
    MilestoneResponse,
    MilestoneEnvelope,
    MilestoneListEnvelope,
)

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.get("", response_model=ProjectListEnvelope)
async def list_projects(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(
        select(Project)
        .where(Project.organization_id == current_user.organization_id)
        .options(
            selectinload(Project.members).selectinload(ProjectMember.user),
            selectinload(Project.milestones),
            selectinload(Project.client),
            selectinload(Project.project_manager)
        )
    )
    projects = result.scalars().all()
    return {
        "success": True,
        "message": "Projects retrieved successfully.",
        "data": [ProjectResponse.model_validate(p) for p in projects],
        "errors": None
    }

@router.get("/{project_id}", response_model=ProjectEnvelope)
async def get_project(
    project_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(
        select(Project)
        .where(Project.id == project_id)
        .options(
            selectinload(Project.members).selectinload(ProjectMember.user),
            selectinload(Project.milestones),
            selectinload(Project.client),
            selectinload(Project.project_manager)
        )
    )
    project = result.scalar()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    return {
        "success": True,
        "message": "Project retrieved successfully.",
        "data": [ProjectResponse.model_validate(project)][0],
        "errors": None
    }

@router.post("", response_model=ProjectEnvelope, status_code=status.HTTP_201_CREATED)
async def create_project(
    payload: ProjectCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    project = Project(
        organization_id=payload.organization_id,
        client_id=payload.client_id,
        name=payload.name,
        project_code=payload.project_code,
        description=payload.description,
        status=payload.status,
        priority=payload.priority,
        budget=payload.budget,
        currency=payload.currency,
        start_date=payload.start_date,
        end_date=payload.end_date,
        estimated_hours=payload.estimated_hours,
        actual_hours=payload.actual_hours,
        progress=payload.progress,
        health=payload.health,
        project_manager_id=payload.project_manager_id,
    )
    db.add(project)
    await db.commit()
    await db.refresh(project)
    
    result = await db.execute(
        select(Project)
        .where(Project.id == project.id)
        .options(
            selectinload(Project.members).selectinload(ProjectMember.user),
            selectinload(Project.milestones),
            selectinload(Project.client),
            selectinload(Project.project_manager)
        )
    )
    project = result.scalar()
    
    return {
        "success": True,
        "message": "Project created successfully.",
        "data": ProjectResponse.model_validate(project),
        "errors": None
    }

@router.patch("/{project_id}", response_model=ProjectEnvelope)
async def update_project(
    project_id: UUID,
    payload: ProjectUpdate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(
        select(Project)
        .where(Project.id == project_id)
        .options(
            selectinload(Project.members).selectinload(ProjectMember.user),
            selectinload(Project.milestones),
            selectinload(Project.client),
            selectinload(Project.project_manager)
        )
    )
    project = result.scalar()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
        
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(project, field, value)
        
    await db.commit()
    await db.refresh(project)
    
    return {
        "success": True,
        "message": "Project updated successfully.",
        "data": ProjectResponse.model_validate(project),
        "errors": None
    }

@router.delete("/{project_id}", response_model=ProjectEnvelope)
async def delete_project(
    project_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(
        select(Project)
        .where(Project.id == project_id)
        .options(
            selectinload(Project.members).selectinload(ProjectMember.user),
            selectinload(Project.milestones),
            selectinload(Project.client),
            selectinload(Project.project_manager)
        )
    )
    project = result.scalar()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
        
    response_data = ProjectResponse.model_validate(project)
    await db.delete(project)
    await db.commit()
    
    return {
        "success": True,
        "message": "Project deleted successfully.",
        "data": response_data,
        "errors": None
    }

# Members endpoints
@router.get("/{project_id}/members", response_model=ProjectMemberListEnvelope)
async def list_project_members(
    project_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(
        select(ProjectMember)
        .where(ProjectMember.project_id == project_id)
        .options(selectinload(ProjectMember.user))
    )
    members = result.scalars().all()
    return {
        "success": True,
        "message": "Project members retrieved successfully.",
        "data": [ProjectMemberResponse.model_validate(m) for m in members],
        "errors": None
    }

@router.post("/{project_id}/members", response_model=ProjectMemberEnvelope, status_code=status.HTTP_201_CREATED)
async def add_project_member(
    project_id: UUID,
    payload: ProjectMemberCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(
        select(ProjectMember)
        .where(ProjectMember.project_id == project_id, ProjectMember.user_id == payload.user_id)
    )
    if result.scalar():
        raise HTTPException(status_code=409, detail="User is already a member of this project.")
        
    member = ProjectMember(
        project_id=project_id,
        user_id=payload.user_id,
        role=payload.role,
    )
    db.add(member)
    await db.commit()
    
    result = await db.execute(
        select(ProjectMember)
        .where(ProjectMember.id == member.id)
        .options(selectinload(ProjectMember.user))
    )
    member = result.scalar()
    
    return {
        "success": True,
        "message": "Project member added successfully.",
        "data": ProjectMemberResponse.model_validate(member),
        "errors": None
    }

@router.delete("/{project_id}/members/{member_id}", response_model=ProjectMemberEnvelope)
async def remove_project_member(
    project_id: UUID,
    member_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(
        select(ProjectMember)
        .where(ProjectMember.id == member_id, ProjectMember.project_id == project_id)
        .options(selectinload(ProjectMember.user))
    )
    member = result.scalar()
    if not member:
        raise HTTPException(status_code=404, detail="Project member not found.")
        
    response_data = ProjectMemberResponse.model_validate(member)
    await db.delete(member)
    await db.commit()
    
    return {
        "success": True,
        "message": "Project member removed successfully.",
        "data": response_data,
        "errors": None
    }

# Milestones endpoints
@router.get("/{project_id}/milestones", response_model=MilestoneListEnvelope)
async def list_project_milestones(
    project_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(
        select(ProjectMilestone).where(ProjectMilestone.project_id == project_id)
    )
    milestones = result.scalars().all()
    return {
        "success": True,
        "message": "Project milestones retrieved successfully.",
        "data": [MilestoneResponse.model_validate(m) for m in milestones],
        "errors": None
    }

@router.post("/{project_id}/milestones", response_model=MilestoneEnvelope, status_code=status.HTTP_201_CREATED)
async def create_project_milestone(
    project_id: UUID,
    payload: MilestoneCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    milestone = ProjectMilestone(
        project_id=project_id,
        name=payload.name,
        description=payload.description,
        due_date=payload.due_date,
        status=payload.status,
    )
    db.add(milestone)
    await db.commit()
    await db.refresh(milestone)
    
    return {
        "success": True,
        "message": "Milestone created successfully.",
        "data": MilestoneResponse.model_validate(milestone),
        "errors": None
    }

@router.patch("/{project_id}/milestones/{milestone_id}", response_model=MilestoneEnvelope)
async def update_project_milestone(
    project_id: UUID,
    milestone_id: UUID,
    payload: MilestoneUpdate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(
        select(ProjectMilestone)
        .where(ProjectMilestone.id == milestone_id, ProjectMilestone.project_id == project_id)
    )
    milestone = result.scalar()
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found.")
        
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(milestone, field, value)
        
    await db.commit()
    await db.refresh(milestone)
    
    return {
        "success": True,
        "message": "Milestone updated successfully.",
        "data": MilestoneResponse.model_validate(milestone),
        "errors": None
    }

@router.delete("/{project_id}/milestones/{milestone_id}", response_model=MilestoneEnvelope)
async def delete_project_milestone(
    project_id: UUID,
    milestone_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(
        select(ProjectMilestone)
        .where(ProjectMilestone.id == milestone_id, ProjectMilestone.project_id == project_id)
    )
    milestone = result.scalar()
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found.")
        
    response_data = MilestoneResponse.model_validate(milestone)
    await db.delete(milestone)
    await db.commit()
    
    return {
        "success": True,
        "message": "Milestone deleted successfully.",
        "data": response_data,
        "errors": None
    }
