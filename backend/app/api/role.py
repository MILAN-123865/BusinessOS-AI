from fastapi import APIRouter, Depends, HTTPException, status
from uuid import UUID
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.database import get_db_session
from app.models.role import Role
from app.models.permission import Permission
from app.models.role_permission import RolePermission
from app.models.user import User
from app.models.user_role import UserRole
from app.dependencies.auth import get_current_active_user
from app.schemas.role import (
    RoleCreate,
    RoleUpdate,
    RoleEnvelope,
    RoleListEnvelope,
    RoleResponse
)
from app.schemas.permission import PermissionResponse, PermissionListEnvelope, PermissionCreate, PermissionUpdate, PermissionEnvelope
from app.schemas.user import UserResponse, UserListEnvelope

router = APIRouter(tags=["Roles"])

DEFAULT_PERMISSIONS = [
    ("dashboard.read", "Access to view dashboard overview metrics"),
    ("organization.read", "Access to view organization profile"),
    ("organization.manage", "Access to update organization details"),
    ("departments.read", "Access to view departments"),
    ("departments.manage", "Access to CRUD departments"),
    ("employees.read", "Access to view employees list"),
    ("employees.manage", "Access to CRUD employees"),
    ("roles.read", "Access to view roles"),
    ("roles.manage", "Access to CRUD roles"),
    ("permissions.read", "Access to view system permissions"),
    ("permissions.manage", "Access to configure system RBAC policies"),
    ("projects.read", "Access to view projects"),
    ("projects.manage", "Access to CRUD projects"),
    ("clients.read", "Access to view clients list"),
    ("clients.manage", "Access to CRUD clients"),
    ("documents.read", "Access to view documents list"),
    ("documents.manage", "Access to upload/delete documents"),
]

async def ensure_seeded_data(db: AsyncSession):
    # Check if permissions exist
    result = await db.execute(select(Permission))
    perm_records = result.scalars().all()
    
    if not perm_records:
        perm_map = {}
        for name, desc in DEFAULT_PERMISSIONS:
            p = Permission(name=name, description=desc)
            db.add(p)
            perm_map[name] = p
        await db.flush()
        
        # Check if roles exist
        result = await db.execute(select(Role))
        role_records = result.scalars().all()
        
        if not role_records:
            admin_role = Role(name="Admin", description="Super administrator with all permissions", is_system=True)
            manager_role = Role(name="Manager", description="Manager with limited administrative rights", is_system=True)
            employee_role = Role(name="Employee", description="Regular employee workspace role", is_system=True)
            
            db.add_all([admin_role, manager_role, employee_role])
            await db.flush()
            
            # Map permissions to roles
            # Admin gets all
            for p in perm_map.values():
                rp = RolePermission(role_id=admin_role.id, permission_id=p.id)
                db.add(rp)
                
            # Manager gets read-only plus projects/clients/documents manage
            manager_perms = ["dashboard.read", "organization.read", "departments.read", "employees.read", "projects.manage", "clients.manage", "documents.manage"]
            for name in manager_perms:
                if name in perm_map:
                    rp = RolePermission(role_id=manager_role.id, permission_id=perm_map[name].id)
                    db.add(rp)
                    
            # Employee gets read-only workspace access
            employee_perms = ["dashboard.read", "organization.read", "departments.read", "projects.read", "documents.read"]
            for name in employee_perms:
                if name in perm_map:
                    rp = RolePermission(role_id=employee_role.id, permission_id=perm_map[name].id)
                    db.add(rp)
            
            # Auto-assign Admin role to the superuser admin@example.com
            res = await db.execute(select(User).where(User.email == "admin@example.com"))
            admin_user = res.scalar()
            if admin_user:
                ur = UserRole(user_id=admin_user.id, role_id=admin_role.id)
                db.add(ur)
                
            await db.commit()

@router.get("/roles", response_model=RoleListEnvelope)
async def list_roles(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    await ensure_seeded_data(db)
    
    result = await db.execute(
        select(Role)
        .options(selectinload(Role.permissions), selectinload(Role.user_roles))
    )
    roles = result.scalars().all()
    
    data = []
    for r in roles:
        response_role = RoleResponse.model_validate(r)
        response_role.user_count = len(r.user_roles)
        data.append(response_role)
        
    return {
        "success": True,
        "message": "Roles retrieved successfully.",
        "data": data,
        "errors": None
    }

@router.get("/roles/{role_id}", response_model=RoleEnvelope)
async def get_role(
    role_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(
        select(Role)
        .where(Role.id == role_id)
        .options(selectinload(Role.permissions), selectinload(Role.user_roles))
    )
    role = result.scalar()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found.")
        
    res_data = RoleResponse.model_validate(role)
    res_data.user_count = len(role.user_roles)
    
    return {
        "success": True,
        "message": "Role retrieved successfully.",
        "data": res_data,
        "errors": None
    }

@router.post("/roles", response_model=RoleEnvelope, status_code=status.HTTP_201_CREATED)
async def create_role(
    payload: RoleCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    role = Role(
        name=payload.name,
        description=payload.description,
        is_system=False
    )
    db.add(role)
    await db.flush()
    
    if payload.permission_ids:
        for p_id in payload.permission_ids:
            rp = RolePermission(role_id=role.id, permission_id=p_id)
            db.add(rp)
        await db.flush()
        
    await db.commit()
    
    # Reload role
    result = await db.execute(
        select(Role)
        .where(Role.id == role.id)
        .options(selectinload(Role.permissions), selectinload(Role.user_roles))
    )
    loaded_role = result.scalar()
    
    res_data = RoleResponse.model_validate(loaded_role)
    res_data.user_count = len(loaded_role.user_roles)
    
    return {
        "success": True,
        "message": "Role created successfully.",
        "data": res_data,
        "errors": None
    }

@router.patch("/roles/{role_id}", response_model=RoleEnvelope)
async def update_role(
    role_id: UUID,
    payload: RoleUpdate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(
        select(Role)
        .where(Role.id == role_id)
        .options(selectinload(Role.permissions), selectinload(Role.user_roles))
    )
    role = result.scalar()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found.")
        
    if role.is_system:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="System roles cannot be modified."
        )
        
    if payload.name is not None:
        role.name = payload.name
    if payload.description is not None:
        role.description = payload.description
        
    if payload.permission_ids is not None:
        await db.execute(
            text("DELETE FROM role_permissions WHERE role_id = :role_id").bindparams(role_id=role_id)
        )
        for p_id in payload.permission_ids:
            rp = RolePermission(role_id=role_id, permission_id=p_id)
            db.add(rp)
            
    await db.commit()
    await db.refresh(role)
    
    result = await db.execute(
        select(Role)
        .where(Role.id == role.id)
        .options(selectinload(Role.permissions), selectinload(Role.user_roles))
    )
    loaded_role = result.scalar()
    
    res_data = RoleResponse.model_validate(loaded_role)
    res_data.user_count = len(loaded_role.user_roles)
    
    return {
        "success": True,
        "message": "Role updated successfully.",
        "data": res_data,
        "errors": None
    }

@router.delete("/roles/{role_id}", response_model=RoleEnvelope)
async def delete_role(
    role_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(
        select(Role)
        .where(Role.id == role_id)
        .options(selectinload(Role.permissions), selectinload(Role.user_roles))
    )
    role = result.scalar()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found.")
        
    if role.is_system:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="System roles cannot be deleted."
        )
        
    if len(role.user_roles) > 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete role because it is currently assigned to users."
        )
        
    res_data = RoleResponse.model_validate(role)
    res_data.user_count = len(role.user_roles)
    
    await db.delete(role)
    await db.commit()
    
    return {
        "success": True,
        "message": "Role deleted successfully.",
        "data": res_data,
        "errors": None
    }

@router.get("/permissions", response_model=PermissionListEnvelope)
async def list_permissions(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    await ensure_seeded_data(db)
    result = await db.execute(select(Permission))
    perms = result.scalars().all()
    return {
        "success": True,
        "message": "Permissions retrieved successfully.",
        "data": [PermissionResponse.model_validate(p) for p in perms],
        "errors": None
    }

@router.get("/permissions/modules")
async def get_permission_modules(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    await ensure_seeded_data(db)
    result = await db.execute(select(Permission.name))
    names = result.scalars().all()
    modules = sorted(list(set([n.split(".")[0] for n in names if "." in n])))
    return {
        "success": True,
        "message": "Permission modules retrieved successfully.",
        "data": modules,
        "errors": None
    }

@router.get("/permissions/actions")
async def get_permission_actions(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    await ensure_seeded_data(db)
    result = await db.execute(select(Permission.name))
    names = result.scalars().all()
    actions = sorted(list(set([n.split(".")[1] for n in names if "." in n])))
    return {
        "success": True,
        "message": "Permission actions retrieved successfully.",
        "data": actions,
        "errors": None
    }

@router.get("/permissions/{perm_id}", response_model=PermissionEnvelope)
async def get_permission(
    perm_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(select(Permission).where(Permission.id == perm_id))
    perm = result.scalar()
    if not perm:
        raise HTTPException(status_code=404, detail="Permission not found.")
    return {
        "success": True,
        "message": "Permission retrieved successfully.",
        "data": PermissionResponse.model_validate(perm),
        "errors": None
    }

@router.get("/permissions/{perm_id}/roles", response_model=RoleListEnvelope)
async def get_permission_roles(
    perm_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(
        select(Role)
        .join(RolePermission)
        .where(RolePermission.permission_id == perm_id)
        .options(selectinload(Role.permissions), selectinload(Role.user_roles))
    )
    roles = result.scalars().all()
    
    data = []
    for r in roles:
        response_role = RoleResponse.model_validate(r)
        response_role.user_count = len(r.user_roles)
        data.append(response_role)
        
    return {
        "success": True,
        "message": "Permission roles retrieved successfully.",
        "data": data,
        "errors": None
    }

@router.post("/permissions", response_model=PermissionEnvelope, status_code=status.HTTP_201_CREATED)
async def create_permission(
    payload: PermissionCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(select(Permission).where(Permission.name == payload.name))
    if result.scalar():
        raise HTTPException(status_code=409, detail="Permission code already exists.")
        
    perm = Permission(name=payload.name, description=payload.description)
    db.add(perm)
    await db.commit()
    await db.refresh(perm)
    
    return {
        "success": True,
        "message": "Permission created successfully.",
        "data": PermissionResponse.model_validate(perm),
        "errors": None
    }

@router.patch("/permissions/{perm_id}", response_model=PermissionEnvelope)
async def update_permission(
    perm_id: UUID,
    payload: PermissionUpdate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(select(Permission).where(Permission.id == perm_id))
    perm = result.scalar()
    if not perm:
        raise HTTPException(status_code=404, detail="Permission not found.")
        
    if payload.description is not None:
        perm.description = payload.description
        
    await db.commit()
    await db.refresh(perm)
    
    return {
        "success": True,
        "message": "Permission updated successfully.",
        "data": PermissionResponse.model_validate(perm),
        "errors": None
    }

@router.delete("/permissions/{perm_id}", response_model=PermissionEnvelope)
async def delete_permission(
    perm_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(
        select(Permission)
        .where(Permission.id == perm_id)
        .options(selectinload(Permission.role_permissions))
    )
    perm = result.scalar()
    if not perm:
        raise HTTPException(status_code=404, detail="Permission not found.")
        
    if len(perm.role_permissions) > 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete permission mapped to roles."
        )
        
    response_data = PermissionResponse.model_validate(perm)
    await db.delete(perm)
    await db.commit()
    
    return {
        "success": True,
        "message": "Permission deleted successfully.",
        "data": response_data,
        "errors": None
    }
