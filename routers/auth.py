from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from database import get_pool
from models.user import UserCreate, Token
from utils.auth import get_password_hash, verify_password, create_access_token
import asyncpg

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate):
    pool = await get_pool()
    hashed_password = get_password_hash(user.password)
    async with pool.acquire() as conn:
        try:
            row = await conn.fetchrow(
                "INSERT INTO transportasi.users (email, hashed_password, nama) VALUES ($1, $2, $3) RETURNING id, email, nama",
                user.email, hashed_password, user.nama
            )
            return dict(row)
        except asyncpg.exceptions.UniqueViolationError:
            raise HTTPException(status_code=400, detail="Email sudah terdaftar")

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    pool = await get_pool()
    async with pool.acquire() as conn:
        user = await conn.fetchrow("SELECT * FROM transportasi.users WHERE email = $1", form_data.username)
        if not user or not verify_password(form_data.password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email atau password salah",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token = create_access_token(data={"sub": user["email"]})
        return {"access_token": access_token, "token_type": "bearer"}